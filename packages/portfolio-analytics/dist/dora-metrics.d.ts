/**
 * DORA Metrics Implementation
 * Automated collection and calculation of DevOps Research and Assessment metrics
 */
import { DORAMetrics, PortfolioProduct, TimeRange } from './types';
export declare class DORAMetricsCollector {
    private octokit;
    private products;
    constructor(githubToken: string, products: PortfolioProduct[]);
    /**
     * Calculate comprehensive DORA metrics for the portfolio
     */
    calculateDORAMetrics(timeRange?: TimeRange): Promise<DORAMetrics>;
    /**
     * Get deployment data from GitHub Actions across all products
     */
    private getDeploymentsData;
    /**
     * Get incident data from GitHub issues labeled as incidents
     */
    private getIncidentsData;
    /**
     * Calculate deployment frequency metrics
     */
    private calculateDeploymentFrequency;
    /**
     * Calculate lead time for changes (commit to production)
     */
    private calculateLeadTimeForChanges;
    /**
     * Calculate Mean Time to Recovery
     */
    private calculateMTTR;
    /**
     * Calculate change failure rate
     */
    private calculateChangeFailureRate;
    private getTimeRangeDate;
    private getTimeRangeDays;
    private extractEnvironmentFromRun;
    private mapWorkflowStatusToDeploymentStatus;
    private extractPRNumber;
    private extractSeverityFromIssue;
    private extractRecoveryActions;
    private calculateTrend;
}
