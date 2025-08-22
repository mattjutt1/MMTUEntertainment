/**
 * PostHog Portfolio Integration
 * Extends existing PostHog analytics to portfolio-wide level
 */
import { PortfolioProduct, AnalyticsConfig } from './types';
export declare class PostHogPortfolioAnalytics {
    private config;
    constructor(config: AnalyticsConfig);
    /**
     * Initialize PostHog with portfolio configuration
     */
    private initializePostHog;
    /**
     * Track deployment events across portfolio
     */
    trackDeployment(productId: string, deployment: {
        environment: string;
        status: 'started' | 'success' | 'failure';
        version?: string;
        commitSha?: string;
        duration?: number;
    }): void;
    /**
     * Track incident events across portfolio
     */
    trackIncident(productId: string, incident: {
        severity: 'critical' | 'high' | 'medium' | 'low';
        status: 'started' | 'investigating' | 'resolved';
        title: string;
        duration?: number;
        causedByDeployment?: boolean;
    }): void;
    /**
     * Track DORA metrics changes
     */
    trackDORAMetrics(metrics: {
        deploymentFrequency: number;
        leadTimeHours: number;
        mttrMinutes: number;
        changeFailureRate: number;
        period: string;
    }): void;
    /**
     * Track performance alerts
     */
    trackPerformanceAlert(productId: string, alert: {
        type: 'response_time' | 'error_rate' | 'uptime';
        threshold: number;
        actualValue: number;
        severity: 'warning' | 'critical';
    }): void;
    /**
     * Track user interactions with portfolio dashboard
     */
    trackDashboardInteraction(interaction: {
        action: 'view_product' | 'filter_timerange' | 'view_metrics' | 'acknowledge_alert';
        productId?: string;
        timeRange?: string;
        metricType?: string;
        alertId?: string;
    }): void;
    /**
     * Track feature usage across products
     */
    trackFeatureUsage(productId: string, feature: {
        name: string;
        action: string;
        userId?: string;
        properties?: Record<string, any>;
    }): void;
    /**
     * Set up custom events for each product
     */
    setupProductEvents(product: PortfolioProduct): {
        trackPageView: (path: string) => void;
        trackError: (error: {
            message: string;
            stack?: string;
            component?: string;
        }) => void;
        trackConversion: (conversionType: string, value?: number) => void;
    };
    /**
     * Get analytics data for dashboard
     */
    getAnalyticsData(timeRange?: string): Promise<any>;
    /**
     * Identify user for portfolio-wide tracking
     */
    identifyUser(userId: string, properties: {
        role?: 'admin' | 'developer' | 'manager';
        products?: string[];
        permissions?: string[];
    }): void;
    /**
     * Set up automated tracking for common patterns
     */
    setupAutomatedTracking(): void;
    /**
     * Track custom event with portfolio context
     */
    private trackEvent;
    /**
     * Clean up and flush events
     */
    cleanup(): void;
}
