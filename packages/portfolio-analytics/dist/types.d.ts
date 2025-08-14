/**
 * Portfolio Analytics Types
 * Centralized type definitions for DORA metrics, Cloudflare data, and analytics
 */
export interface DORAMetrics {
    deploymentFrequency: {
        daily: number;
        weekly: number;
        monthly: number;
        trend: 'increasing' | 'stable' | 'decreasing';
    };
    leadTimeForChanges: {
        averageHours: number;
        p50Hours: number;
        p95Hours: number;
        trend: 'improving' | 'stable' | 'degrading';
    };
    meanTimeToRecovery: {
        averageMinutes: number;
        p50Minutes: number;
        p95Minutes: number;
        trend: 'improving' | 'stable' | 'degrading';
    };
    changeFailureRate: {
        percentage: number;
        totalDeployments: number;
        failedDeployments: number;
        trend: 'improving' | 'stable' | 'degrading';
    };
}
export interface PortfolioProduct {
    id: string;
    name: string;
    repository: string;
    cloudflareServiceId?: string;
    posthogProject?: string;
    deploymentEnvironments: ('production' | 'staging' | 'development')[];
    healthEndpoint?: string;
    alertingConfig: {
        uptimeThreshold: number;
        errorRateThreshold: number;
        responseTimeThreshold: number;
    };
}
export interface CloudflareMetrics {
    requests: {
        total: number;
        cached: number;
        uncached: number;
        errors: number;
    };
    performance: {
        p50ResponseTime: number;
        p95ResponseTime: number;
        p99ResponseTime: number;
        averageResponseTime: number;
    };
    errors: {
        rate: number;
        total: number;
        by4xx: number;
        by5xx: number;
    };
    bandwidth: {
        totalBytes: number;
        cachedBytes: number;
        uncachedBytes: number;
    };
    uptime: {
        percentage: number;
        downtime: number;
    };
}
export interface DeploymentData {
    id: string;
    productId: string;
    environment: string;
    status: 'success' | 'failure' | 'in_progress' | 'cancelled';
    startTime: string;
    endTime?: string;
    duration?: number;
    commitSha: string;
    branch: string;
    triggeredBy: string;
    pullRequestNumber?: number;
    rollbackId?: string;
}
export interface IncidentData {
    id: string;
    productId: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    title: string;
    description: string;
    startTime: string;
    resolvedTime?: string;
    duration?: number;
    causedByDeployment?: string;
    recoveryActions: string[];
}
export interface PortfolioDashboardData {
    overview: {
        totalProducts: number;
        activeIncidents: number;
        deploymentsToday: number;
        overallHealth: 'excellent' | 'good' | 'degraded' | 'poor';
    };
    doraMetrics: DORAMetrics;
    productMetrics: Array<{
        product: PortfolioProduct;
        cloudflareMetrics: CloudflareMetrics;
        recentDeployments: DeploymentData[];
        activeIncidents: IncidentData[];
        healthStatus: 'healthy' | 'warning' | 'critical';
    }>;
    alerts: Array<{
        id: string;
        productId: string;
        type: 'performance' | 'error_rate' | 'uptime' | 'deployment';
        severity: 'critical' | 'warning' | 'info';
        message: string;
        timestamp: string;
        resolved: boolean;
    }>;
}
export interface AnalyticsConfig {
    posthog: {
        apiKey: string;
        host?: string;
        projectId?: string;
    };
    cloudflare: {
        apiToken: string;
        accountId: string;
    };
    github: {
        token: string;
        organization: string;
    };
    products: PortfolioProduct[];
    alerting: {
        webhookUrl?: string;
        slackChannel?: string;
        emailRecipients?: string[];
    };
}
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | '90d';
export interface MetricsQuery {
    timeRange: TimeRange;
    products?: string[];
    environments?: string[];
    includeHistoricalData?: boolean;
}
