/**
 * Cloudflare Integration for Portfolio Analytics
 * Leverages CF Observability MCP server for performance and reliability data
 */
import { CloudflareMetrics, PortfolioProduct, TimeRange } from './types';
export declare class CloudflareIntegration {
    private accountId;
    private apiToken;
    constructor(accountId: string, apiToken: string);
    /**
     * Get comprehensive performance metrics for a product
     */
    getProductMetrics(product: PortfolioProduct, timeRange?: TimeRange): Promise<CloudflareMetrics>;
    /**
     * Get portfolio-wide aggregated metrics
     */
    getPortfolioMetrics(products: PortfolioProduct[], timeRange?: TimeRange): Promise<CloudflareMetrics>;
    /**
     * Query uptime for a specific product
     */
    getUptimeMetrics(product: PortfolioProduct, timeRange?: TimeRange): Promise<{
        percentage: number;
        downtime: number;
    }>;
    /**
     * Set up automated alerts for performance thresholds
     */
    setupAlerts(product: PortfolioProduct): Promise<boolean>;
    /**
     * Mock query to CF Observability MCP server
     * In actual implementation, this would use the MCP server
     */
    private queryWorkerObservability;
    private convertTimeRangeToTimeframe;
    private getTimeRangeMinutes;
    private parseCloudflareMetrics;
    private aggregateMetrics;
    private getEmptyMetrics;
}
