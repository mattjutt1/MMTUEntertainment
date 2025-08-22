/**
 * Portfolio Dashboard Data Aggregation
 * Combines DORA metrics, Cloudflare performance, and PostHog analytics
 */
import { AnalyticsConfig, PortfolioDashboardData, TimeRange } from './types';
export declare class PortfolioDashboardDataProvider {
    private doraCollector;
    private cloudflareIntegration;
    private posthogAnalytics;
    private config;
    constructor(config: AnalyticsConfig);
    /**
     * Get comprehensive portfolio dashboard data
     */
    getPortfolioDashboard(timeRange?: TimeRange): Promise<PortfolioDashboardData>;
    /**
     * Get real-time status for all products
     */
    getRealtimeStatus(): Promise<Array<{
        productId: string;
        status: 'healthy' | 'warning' | 'critical';
        uptime: number;
        responseTime: number;
        errorRate: number;
        lastChecked: string;
    }>>;
    /**
     * Get historical trends for DORA metrics
     */
    getDORATrends(timeRange?: TimeRange): Promise<{
        deploymentFrequency: Array<{
            date: string;
            value: number;
        }>;
        leadTime: Array<{
            date: string;
            value: number;
        }>;
        mttr: Array<{
            date: string;
            value: number;
        }>;
        changeFailureRate: Array<{
            date: string;
            value: number;
        }>;
    }>;
    /**
     * Setup automated monitoring for all products
     */
    setupAutomatedMonitoring(): Promise<{
        alertsConfigured: number;
        healthChecksEnabled: number;
        errors: string[];
    }>;
    private getRecentDeployments;
    private getActiveIncidents;
    private calculateHealthStatus;
    private calculateOverallHealth;
    private generateAlerts;
    private determineRealtimeStatus;
    private getTimeRangeDays;
}
