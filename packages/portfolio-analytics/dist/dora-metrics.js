"use strict";
/**
 * DORA Metrics Implementation
 * Automated collection and calculation of DevOps Research and Assessment metrics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DORAMetricsCollector = void 0;
const rest_1 = require("@octokit/rest");
class DORAMetricsCollector {
    constructor(githubToken, products) {
        this.octokit = new rest_1.Octokit({ auth: githubToken });
        this.products = products;
    }
    /**
     * Calculate comprehensive DORA metrics for the portfolio
     */
    async calculateDORAMetrics(timeRange = '30d') {
        const deployments = await this.getDeploymentsData(timeRange);
        const incidents = await this.getIncidentsData(timeRange);
        return {
            deploymentFrequency: this.calculateDeploymentFrequency(deployments, timeRange),
            leadTimeForChanges: this.calculateLeadTimeForChanges(deployments),
            meanTimeToRecovery: this.calculateMTTR(incidents),
            changeFailureRate: this.calculateChangeFailureRate(deployments, incidents)
        };
    }
    /**
     * Get deployment data from GitHub Actions across all products
     */
    async getDeploymentsData(timeRange) {
        const deployments = [];
        const since = this.getTimeRangeDate(timeRange);
        for (const product of this.products) {
            try {
                const [org, repo] = product.repository.split('/');
                // Get workflow runs for deployments
                const { data: workflowRuns } = await this.octokit.rest.actions.listWorkflowRunsForRepo({
                    owner: org,
                    repo: repo,
                    status: 'completed',
                    created: `>${since.toISOString()}`,
                    per_page: 100
                });
                // Filter for deployment workflows
                const deploymentRuns = workflowRuns.workflow_runs.filter(run => run.name?.toLowerCase().includes('deploy') ||
                    run.path?.includes('deploy'));
                for (const run of deploymentRuns) {
                    const deployment = {
                        id: `${product.id}-${run.id}`,
                        productId: product.id,
                        environment: this.extractEnvironmentFromRun(run),
                        status: this.mapWorkflowStatusToDeploymentStatus(run.conclusion),
                        startTime: run.created_at,
                        endTime: run.updated_at,
                        duration: run.updated_at && run.created_at ?
                            Math.round((new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()) / 60000) :
                            undefined,
                        commitSha: run.head_sha,
                        branch: run.head_branch || 'main',
                        triggeredBy: run.actor?.login || 'unknown',
                        pullRequestNumber: this.extractPRNumber(run)
                    };
                    deployments.push(deployment);
                }
            }
            catch (error) {
                console.error(`Error fetching deployment data for ${product.name}:`, error);
            }
        }
        return deployments.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }
    /**
     * Get incident data from GitHub issues labeled as incidents
     */
    async getIncidentsData(timeRange) {
        const incidents = [];
        const since = this.getTimeRangeDate(timeRange);
        for (const product of this.products) {
            try {
                const [org, repo] = product.repository.split('/');
                const { data: issues } = await this.octokit.rest.issues.listForRepo({
                    owner: org,
                    repo: repo,
                    labels: 'incident,bug,outage',
                    state: 'all',
                    since: since.toISOString(),
                    per_page: 100
                });
                for (const issue of issues) {
                    const incident = {
                        id: `${product.id}-issue-${issue.number}`,
                        productId: product.id,
                        severity: this.extractSeverityFromIssue(issue),
                        status: issue.state === 'open' ? 'open' : 'resolved',
                        title: issue.title,
                        description: issue.body || '',
                        startTime: issue.created_at,
                        resolvedTime: issue.closed_at || undefined,
                        duration: issue.closed_at ?
                            Math.round((new Date(issue.closed_at).getTime() - new Date(issue.created_at).getTime()) / 60000) :
                            undefined,
                        recoveryActions: this.extractRecoveryActions(issue.body || '')
                    };
                    incidents.push(incident);
                }
            }
            catch (error) {
                console.error(`Error fetching incident data for ${product.name}:`, error);
            }
        }
        return incidents.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }
    /**
     * Calculate deployment frequency metrics
     */
    calculateDeploymentFrequency(deployments, timeRange) {
        const successfulDeployments = deployments.filter(d => d.status === 'success');
        const days = this.getTimeRangeDays(timeRange);
        return {
            daily: Math.round((successfulDeployments.length / days) * 100) / 100,
            weekly: Math.round((successfulDeployments.length / days) * 7 * 100) / 100,
            monthly: Math.round((successfulDeployments.length / days) * 30 * 100) / 100,
            trend: this.calculateTrend(successfulDeployments, 'deployment')
        };
    }
    /**
     * Calculate lead time for changes (commit to production)
     */
    calculateLeadTimeForChanges(deployments) {
        const productionDeployments = deployments.filter(d => d.environment === 'production' && d.duration !== undefined);
        if (productionDeployments.length === 0) {
            return {
                averageHours: 0,
                p50Hours: 0,
                p95Hours: 0,
                trend: 'stable'
            };
        }
        const durations = productionDeployments
            .map(d => d.duration)
            .sort((a, b) => a - b);
        return {
            averageHours: Math.round((durations.reduce((sum, d) => sum + d, 0) / durations.length / 60) * 100) / 100,
            p50Hours: Math.round((durations[Math.floor(durations.length * 0.5)] / 60) * 100) / 100,
            p95Hours: Math.round((durations[Math.floor(durations.length * 0.95)] / 60) * 100) / 100,
            trend: this.calculateTrend(productionDeployments, 'leadtime')
        };
    }
    /**
     * Calculate Mean Time to Recovery
     */
    calculateMTTR(incidents) {
        const resolvedIncidents = incidents.filter(i => i.duration !== undefined);
        if (resolvedIncidents.length === 0) {
            return {
                averageMinutes: 0,
                p50Minutes: 0,
                p95Minutes: 0,
                trend: 'stable'
            };
        }
        const durations = resolvedIncidents
            .map(i => i.duration)
            .sort((a, b) => a - b);
        return {
            averageMinutes: Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length),
            p50Minutes: durations[Math.floor(durations.length * 0.5)],
            p95Minutes: durations[Math.floor(durations.length * 0.95)],
            trend: this.calculateTrend(resolvedIncidents, 'recovery')
        };
    }
    /**
     * Calculate change failure rate
     */
    calculateChangeFailureRate(deployments, incidents) {
        const productionDeployments = deployments.filter(d => d.environment === 'production');
        const failedDeployments = productionDeployments.filter(d => d.status === 'failure');
        // Add incidents caused by deployments
        const deploymentCausedIncidents = incidents.filter(i => i.causedByDeployment);
        const totalFailures = failedDeployments.length + deploymentCausedIncidents.length;
        const percentage = productionDeployments.length > 0 ?
            Math.round((totalFailures / productionDeployments.length) * 100 * 100) / 100 : 0;
        return {
            percentage,
            totalDeployments: productionDeployments.length,
            failedDeployments: totalFailures,
            trend: this.calculateTrend(failedDeployments, 'failure')
        };
    }
    // Helper methods
    getTimeRangeDate(timeRange) {
        const now = new Date();
        switch (timeRange) {
            case '1h': return new Date(now.getTime() - 1 * 60 * 60 * 1000);
            case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
            case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
    }
    getTimeRangeDays(timeRange) {
        switch (timeRange) {
            case '1h': return 1 / 24;
            case '6h': return 0.25;
            case '24h': return 1;
            case '7d': return 7;
            case '30d': return 30;
            case '90d': return 90;
            default: return 30;
        }
    }
    extractEnvironmentFromRun(run) {
        const name = run.name?.toLowerCase() || '';
        const path = run.path?.toLowerCase() || '';
        if (name.includes('prod') || path.includes('prod'))
            return 'production';
        if (name.includes('staging') || path.includes('staging'))
            return 'staging';
        return 'development';
    }
    mapWorkflowStatusToDeploymentStatus(conclusion) {
        switch (conclusion) {
            case 'success': return 'success';
            case 'failure': return 'failure';
            case 'cancelled': return 'cancelled';
            default: return 'in_progress';
        }
    }
    extractPRNumber(run) {
        // Try to extract PR number from event payload
        if (run.pull_requests && run.pull_requests.length > 0) {
            return run.pull_requests[0].number;
        }
        return undefined;
    }
    extractSeverityFromIssue(issue) {
        const labels = issue.labels?.map((l) => l.name?.toLowerCase()) || [];
        if (labels.includes('critical') || labels.includes('p1'))
            return 'critical';
        if (labels.includes('high') || labels.includes('p2'))
            return 'high';
        if (labels.includes('medium') || labels.includes('p3'))
            return 'medium';
        return 'low';
    }
    extractRecoveryActions(body) {
        // Simple extraction of recovery actions from issue body
        const lines = body.split('\n');
        const recoverySection = lines.findIndex(line => line.toLowerCase().includes('recovery') ||
            line.toLowerCase().includes('resolution') ||
            line.toLowerCase().includes('fix'));
        if (recoverySection === -1)
            return [];
        return lines.slice(recoverySection + 1, recoverySection + 5)
            .filter(line => line.trim().length > 0)
            .map(line => line.trim());
    }
    calculateTrend(data, type) {
        // Simple trend calculation based on recent vs older data
        if (data.length < 4)
            return 'stable';
        const midpoint = Math.floor(data.length / 2);
        const recent = data.slice(0, midpoint);
        const older = data.slice(midpoint);
        const recentAvg = recent.length;
        const olderAvg = older.length;
        const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
        if (type === 'failure' || type === 'recovery') {
            // For failures and recovery time, decreasing is improving
            if (changePercent < -10)
                return 'improving';
            if (changePercent > 10)
                return 'degrading';
        }
        else {
            // For deployments and lead time, increasing frequency is good, decreasing lead time is good
            if (type === 'deployment') {
                if (changePercent > 10)
                    return 'increasing';
                if (changePercent < -10)
                    return 'decreasing';
            }
            else if (type === 'leadtime') {
                if (changePercent < -10)
                    return 'improving';
                if (changePercent > 10)
                    return 'degrading';
            }
        }
        return 'stable';
    }
}
exports.DORAMetricsCollector = DORAMetricsCollector;
