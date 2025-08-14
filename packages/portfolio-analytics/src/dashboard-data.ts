/**
 * Portfolio Dashboard Data Aggregation
 * Combines DORA metrics, Cloudflare performance, and PostHog analytics
 */

import { DORAMetricsCollector } from './dora-metrics';
import { CloudflareIntegration } from './cloudflare-integration';
import { PostHogPortfolioAnalytics } from './posthog-portfolio';
import {
  AnalyticsConfig,
  PortfolioDashboardData,
  PortfolioProduct,
  TimeRange,
  DeploymentData,
  IncidentData
} from './types';

export class PortfolioDashboardDataProvider {
  private doraCollector: DORAMetricsCollector;
  private cloudflareIntegration: CloudflareIntegration;
  private posthogAnalytics: PostHogPortfolioAnalytics;
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.doraCollector = new DORAMetricsCollector(config.github.token, config.products);
    this.cloudflareIntegration = new CloudflareIntegration(
      config.cloudflare.accountId,
      config.cloudflare.apiToken
    );
    this.posthogAnalytics = new PostHogPortfolioAnalytics(config);
  }

  /**
   * Get comprehensive portfolio dashboard data
   */
  async getPortfolioDashboard(timeRange: TimeRange = '24h'): Promise<PortfolioDashboardData> {
    try {
      // Collect data in parallel for performance
      const [doraMetrics, cloudflareMetrics, posthogData] = await Promise.all([
        this.doraCollector.calculateDORAMetrics(timeRange),
        this.cloudflareIntegration.getPortfolioMetrics(this.config.products, timeRange),
        this.posthogAnalytics.getAnalyticsData(timeRange)
      ]);

      // Get product-specific metrics
      const productMetrics = await Promise.all(
        this.config.products.map(async (product) => {
          const [productCloudflareMetrics, uptimeMetrics, recentDeployments, activeIncidents] = await Promise.all([
            this.cloudflareIntegration.getProductMetrics(product, timeRange),
            this.cloudflareIntegration.getUptimeMetrics(product, timeRange),
            this.getRecentDeployments(product, 5),
            this.getActiveIncidents(product)
          ]);

          // Update uptime in Cloudflare metrics
          productCloudflareMetrics.uptime = uptimeMetrics;

          return {
            product,
            cloudflareMetrics: productCloudflareMetrics,
            recentDeployments,
            activeIncidents,
            healthStatus: this.calculateHealthStatus(productCloudflareMetrics, activeIncidents)
          };
        })
      );

      // Generate alerts based on thresholds
      const alerts = await this.generateAlerts(productMetrics);

      // Calculate overall portfolio health
      const overallHealth = this.calculateOverallHealth(productMetrics);

      return {
        overview: {
          totalProducts: this.config.products.length,
          activeIncidents: productMetrics.reduce((sum, pm) => sum + pm.activeIncidents.length, 0),
          deploymentsToday: posthogData.deployments?.total || 0,
          overallHealth
        },
        doraMetrics,
        productMetrics,
        alerts
      };

    } catch (error) {
      console.error('Error generating portfolio dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get real-time status for all products
   */
  async getRealtimeStatus(): Promise<Array<{
    productId: string;
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
    lastChecked: string;
  }>> {
    return Promise.all(
      this.config.products.map(async (product) => {
        try {
          const [cloudflareMetrics, uptimeMetrics] = await Promise.all([
            this.cloudflareIntegration.getProductMetrics(product, '1h'),
            this.cloudflareIntegration.getUptimeMetrics(product, '1h')
          ]);

          const status = this.determineRealtimeStatus(
            uptimeMetrics.percentage,
            cloudflareMetrics.performance.averageResponseTime,
            cloudflareMetrics.errors.rate,
            product.alertingConfig
          );

          return {
            productId: product.id,
            status,
            uptime: uptimeMetrics.percentage,
            responseTime: cloudflareMetrics.performance.averageResponseTime,
            errorRate: cloudflareMetrics.errors.rate,
            lastChecked: new Date().toISOString()
          };

        } catch (error) {
          console.error('Error getting realtime status for product:', product.name, error);
          return {
            productId: product.id,
            status: 'warning' as const,
            uptime: 0,
            responseTime: 0,
            errorRate: 0,
            lastChecked: new Date().toISOString()
          };
        }
      })
    );
  }

  /**
   * Get historical trends for DORA metrics
   */
  async getDORATrends(timeRange: TimeRange = '30d'): Promise<{
    deploymentFrequency: Array<{ date: string; value: number }>;
    leadTime: Array<{ date: string; value: number }>;
    mttr: Array<{ date: string; value: number }>;
    changeFailureRate: Array<{ date: string; value: number }>;
  }> {
    // This would typically query historical data
    // For now, generate sample trend data
    const days = this.getTimeRangeDays(timeRange);
    const dates = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return {
      deploymentFrequency: dates.map(date => ({
        date,
        value: Math.random() * 5 + 1
      })),
      leadTime: dates.map(date => ({
        date,
        value: Math.random() * 10 + 2
      })),
      mttr: dates.map(date => ({
        date,
        value: Math.random() * 120 + 30
      })),
      changeFailureRate: dates.map(date => ({
        date,
        value: Math.random() * 10 + 1
      }))
    };
  }

  /**
   * Setup automated monitoring for all products
   */
  async setupAutomatedMonitoring(): Promise<{
    alertsConfigured: number;
    healthChecksEnabled: number;
    errors: string[];
  }> {
    const results = {
      alertsConfigured: 0,
      healthChecksEnabled: 0,
      errors: [] as string[]
    };

    for (const product of this.config.products) {
      try {
        // Setup Cloudflare alerts
        const alertsSetup = await this.cloudflareIntegration.setupAlerts(product);
        if (alertsSetup) {
          results.alertsConfigured++;
        }

        // Setup PostHog product tracking
        this.posthogAnalytics.setupProductEvents(product);

        if (product.healthEndpoint) {
          results.healthChecksEnabled++;
        }

      } catch (error) {
        results.errors.push(`Failed to setup monitoring for ${product.name}: ${error}`);
      }
    }

    return results;
  }

  // Private helper methods

  private async getRecentDeployments(product: PortfolioProduct, limit: number = 5): Promise<DeploymentData[]> {
    try {
      // This would typically query the DORA collector for product-specific deployments
      // For now, return mock data
      return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
        id: `${product.id}-deploy-${i}`,
        productId: product.id,
        environment: i === 0 ? 'production' : 'staging',
        status: Math.random() > 0.1 ? 'success' : 'failure',
        startTime: new Date(Date.now() - i * 3600000).toISOString(),
        endTime: new Date(Date.now() - i * 3600000 + 600000).toISOString(),
        duration: 10 + Math.floor(Math.random() * 20),
        commitSha: Math.random().toString(36).substring(2, 8),
        branch: 'main',
        triggeredBy: 'github-actions'
      }));
    } catch (error) {
      console.error('Error getting recent deployments for product:', product.name, error);
      return [];
    }
  }

  private async getActiveIncidents(product: PortfolioProduct): Promise<IncidentData[]> {
    try {
      // This would typically query the DORA collector for active incidents
      // For now, return mock data occasionally
      if (Math.random() > 0.8) { // 20% chance of having an active incident
        return [{
          id: `${product.id}-incident-${Date.now()}`,
          productId: product.id,
          severity: 'medium',
          status: 'investigating',
          title: 'Elevated Response Times',
          description: 'Users experiencing slower than normal response times',
          startTime: new Date(Date.now() - 1800000).toISOString(),
          recoveryActions: ['Scaled instances', 'Investigating database performance']
        }];
      }
      return [];
    } catch (error) {
      console.error('Error getting active incidents for product:', product.name, error);
      return [];
    }
  }

  private calculateHealthStatus(
    cloudflareMetrics: any,
    activeIncidents: IncidentData[]
  ): 'healthy' | 'warning' | 'critical' {
    // Critical if there are critical incidents
    if (activeIncidents.some(i => i.severity === 'critical')) {
      return 'critical';
    }

    // Warning if there are incidents or metrics exceed thresholds
    if (
      activeIncidents.length > 0 ||
      cloudflareMetrics.uptime.percentage < 99 ||
      cloudflareMetrics.errors.rate > 1 ||
      cloudflareMetrics.performance.averageResponseTime > 1000
    ) {
      return 'warning';
    }

    return 'healthy';
  }

  private calculateOverallHealth(productMetrics: any[]): 'excellent' | 'good' | 'degraded' | 'poor' {
    const healthScores = productMetrics.map(pm => {
      switch (pm.healthStatus) {
        case 'healthy': return 100;
        case 'warning': return 60;
        case 'critical': return 20;
        default: return 50;
      }
    });

    const avgHealth = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;

    if (avgHealth >= 90) return 'excellent';
    if (avgHealth >= 75) return 'good';
    if (avgHealth >= 50) return 'degraded';
    return 'poor';
  }

  private async generateAlerts(productMetrics: any[]): Promise<any[]> {
    const alerts = [];

    for (const pm of productMetrics) {
      const product = pm.product;
      const metrics = pm.cloudflareMetrics;

      // Uptime alert
      if (metrics.uptime.percentage < product.alertingConfig.uptimeThreshold) {
        alerts.push({
          id: `uptime-${product.id}-${Date.now()}`,
          productId: product.id,
          type: 'uptime',
          severity: metrics.uptime.percentage < (product.alertingConfig.uptimeThreshold - 1) ? 'critical' : 'warning',
          message: `${product.name} uptime (${metrics.uptime.percentage}%) below threshold (${product.alertingConfig.uptimeThreshold}%)`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }

      // Error rate alert
      if (metrics.errors.rate > product.alertingConfig.errorRateThreshold) {
        alerts.push({
          id: `error-rate-${product.id}-${Date.now()}`,
          productId: product.id,
          type: 'error_rate',
          severity: metrics.errors.rate > (product.alertingConfig.errorRateThreshold * 2) ? 'critical' : 'warning',
          message: `${product.name} error rate (${metrics.errors.rate}%) above threshold (${product.alertingConfig.errorRateThreshold}%)`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }

      // Response time alert
      if (metrics.performance.averageResponseTime > product.alertingConfig.responseTimeThreshold) {
        alerts.push({
          id: `response-time-${product.id}-${Date.now()}`,
          productId: product.id,
          type: 'performance',
          severity: metrics.performance.averageResponseTime > (product.alertingConfig.responseTimeThreshold * 2) ? 'critical' : 'warning',
          message: `${product.name} response time (${metrics.performance.averageResponseTime}ms) above threshold (${product.alertingConfig.responseTimeThreshold}ms)`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
    }

    return alerts;
  }

  private determineRealtimeStatus(
    uptime: number,
    responseTime: number,
    errorRate: number,
    alertingConfig: any
  ): 'healthy' | 'warning' | 'critical' {
    if (
      uptime < (alertingConfig.uptimeThreshold - 1) ||
      errorRate > (alertingConfig.errorRateThreshold * 2) ||
      responseTime > (alertingConfig.responseTimeThreshold * 2)
    ) {
      return 'critical';
    }

    if (
      uptime < alertingConfig.uptimeThreshold ||
      errorRate > alertingConfig.errorRateThreshold ||
      responseTime > alertingConfig.responseTimeThreshold
    ) {
      return 'warning';
    }

    return 'healthy';
  }

  private getTimeRangeDays(timeRange: TimeRange): number {
    switch (timeRange) {
      case '1h': return 1/24;
      case '6h': return 0.25;
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  }
}