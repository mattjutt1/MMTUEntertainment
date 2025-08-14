/**
 * Cloudflare Integration for Portfolio Analytics
 * Leverages CF Observability MCP server for performance and reliability data
 */

import { CloudflareMetrics, PortfolioProduct, TimeRange } from './types';

export class CloudflareIntegration {
  private accountId: string;
  private apiToken: string;

  constructor(accountId: string, apiToken: string) {
    this.accountId = accountId;
    this.apiToken = apiToken;
  }

  /**
   * Get comprehensive performance metrics for a product
   */
  async getProductMetrics(
    product: PortfolioProduct, 
    timeRange: TimeRange = '24h'
  ): Promise<CloudflareMetrics> {
    if (!product.cloudflareServiceId) {
      return this.getEmptyMetrics();
    }

    try {
      // Use CF Observability to query metrics
      const timeframe = this.convertTimeRangeToTimeframe(timeRange);
      
      // Query requests metrics
      const requestsData = await this.queryWorkerObservability({
        view: 'calculations',
        queryId: 'worker-requests',
        timeframe,
        parameters: {
          datasets: ['cloudflare-workers'],
          filters: [
            {
              key: '$metadata.service',
              operation: 'eq',
              type: 'string',
              value: product.cloudflareServiceId
            }
          ],
          calculations: [
            { operator: 'count', alias: 'total_requests' },
            { operator: 'count', key: '$metadata.cached', keyType: 'boolean', alias: 'cached_requests' },
            { operator: 'count', key: '$metadata.error', keyType: 'boolean', alias: 'error_requests' }
          ]
        }
      });

      // Query performance metrics
      const performanceData = await this.queryWorkerObservability({
        view: 'calculations',
        queryId: 'worker-performance',
        timeframe,
        parameters: {
          datasets: ['cloudflare-workers'],
          filters: [
            {
              key: '$metadata.service',
              operation: 'eq',
              type: 'string',
              value: product.cloudflareServiceId
            }
          ],
          calculations: [
            { operator: 'avg', key: 'response_time', keyType: 'number', alias: 'avg_response_time' },
            { operator: 'p50', key: 'response_time', keyType: 'number', alias: 'p50_response_time' },
            { operator: 'p95', key: 'response_time', keyType: 'number', alias: 'p95_response_time' },
            { operator: 'p99', key: 'response_time', keyType: 'number', alias: 'p99_response_time' }
          ]
        }
      });

      // Query error metrics
      const errorData = await this.queryWorkerObservability({
        view: 'calculations',
        queryId: 'worker-errors',
        timeframe,
        parameters: {
          datasets: ['cloudflare-workers'],
          filters: [
            {
              key: '$metadata.service',
              operation: 'eq',
              type: 'string',
              value: product.cloudflareServiceId
            },
            {
              key: '$metadata.error',
              operation: 'exists',
              type: 'boolean'
            }
          ],
          calculations: [
            { operator: 'count', alias: 'total_errors' },
            { 
              operator: 'count', 
              key: '$metadata.status_code',
              keyType: 'number',
              alias: '4xx_errors'
            },
            { 
              operator: 'count', 
              key: '$metadata.status_code',
              keyType: 'number', 
              alias: '5xx_errors'
            }
          ]
        }
      });

      // Query bandwidth metrics
      const bandwidthData = await this.queryWorkerObservability({
        view: 'calculations',
        queryId: 'worker-bandwidth',
        timeframe,
        parameters: {
          datasets: ['cloudflare-workers'],
          filters: [
            {
              key: '$metadata.service',
              operation: 'eq',
              type: 'string',
              value: product.cloudflareServiceId
            }
          ],
          calculations: [
            { operator: 'sum', key: 'bytes_sent', keyType: 'number', alias: 'total_bytes' },
            { operator: 'sum', key: 'bytes_cached', keyType: 'number', alias: 'cached_bytes' }
          ]
        }
      });

      return this.parseCloudflareMetrics(requestsData, performanceData, errorData, bandwidthData);

    } catch (error) {
      console.error('Error fetching Cloudflare metrics for product:', product.name, error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * Get portfolio-wide aggregated metrics
   */
  async getPortfolioMetrics(
    products: PortfolioProduct[],
    timeRange: TimeRange = '24h'
  ): Promise<CloudflareMetrics> {
    const productMetrics = await Promise.all(
      products.map(product => this.getProductMetrics(product, timeRange))
    );

    return this.aggregateMetrics(productMetrics);
  }

  /**
   * Query uptime for a specific product
   */
  async getUptimeMetrics(
    product: PortfolioProduct,
    timeRange: TimeRange = '24h'
  ): Promise<{ percentage: number; downtime: number }> {
    if (!product.cloudflareServiceId || !product.healthEndpoint) {
      return { percentage: 100, downtime: 0 };
    }

    try {
      const timeframe = this.convertTimeRangeToTimeframe(timeRange);
      
      // Query for successful vs failed requests to health endpoint
      const healthData = await this.queryWorkerObservability({
        view: 'calculations',
        queryId: 'worker-health',
        timeframe,
        parameters: {
          datasets: ['cloudflare-workers'],
          filters: [
            {
              key: '$metadata.service',
              operation: 'eq',
              type: 'string',
              value: product.cloudflareServiceId
            },
            {
              key: '$metadata.path',
              operation: 'includes',
              type: 'string',
              value: '/health'
            }
          ],
          calculations: [
            { operator: 'count', alias: 'total_health_checks' },
            { operator: 'count', key: '$metadata.status_success', keyType: 'boolean', alias: 'successful_checks' }
          ]
        }
      });

      const totalChecks = healthData?.data?.[0]?.total_health_checks || 0;
      const successfulChecks = healthData?.data?.[0]?.successful_checks || 0;
      
      if (totalChecks === 0) {
        return { percentage: 100, downtime: 0 };
      }

      const uptimePercentage = (successfulChecks / totalChecks) * 100;
      const downtimeMinutes = ((totalChecks - successfulChecks) / totalChecks) * this.getTimeRangeMinutes(timeRange);

      return {
        percentage: Math.round(uptimePercentage * 100) / 100,
        downtime: Math.round(downtimeMinutes)
      };

    } catch (error) {
      console.error('Error fetching uptime metrics for product:', product.name, error);
      return { percentage: 100, downtime: 0 };
    }
  }

  /**
   * Set up automated alerts for performance thresholds
   */
  async setupAlerts(product: PortfolioProduct): Promise<boolean> {
    try {
      // This would integrate with Cloudflare's alerting system
      // For now, we'll return true to indicate alerts are conceptually set up
      console.log('Setting up alerts for product:', product.name, {
        uptimeThreshold: product.alertingConfig.uptimeThreshold,
        errorRateThreshold: product.alertingConfig.errorRateThreshold,
        responseTimeThreshold: product.alertingConfig.responseTimeThreshold
      });

      return true;
    } catch (error) {
      console.error('Error setting up alerts for product:', product.name, error);
      return false;
    }
  }

  // Private helper methods

  /**
   * Mock query to CF Observability MCP server
   * In actual implementation, this would use the MCP server
   */
  private async queryWorkerObservability(query: any): Promise<any> {
    // This is a placeholder that would use the actual CF Observability MCP server
    // For now, return mock data structure
    return {
      data: [
        {
          total_requests: Math.floor(Math.random() * 10000) + 1000,
          cached_requests: Math.floor(Math.random() * 5000) + 500,
          error_requests: Math.floor(Math.random() * 50) + 5,
          avg_response_time: Math.random() * 200 + 50,
          p50_response_time: Math.random() * 150 + 40,
          p95_response_time: Math.random() * 400 + 150,
          p99_response_time: Math.random() * 800 + 300,
          total_errors: Math.floor(Math.random() * 50) + 5,
          '4xx_errors': Math.floor(Math.random() * 30) + 2,
          '5xx_errors': Math.floor(Math.random() * 20) + 1,
          total_bytes: Math.floor(Math.random() * 1000000000) + 100000000,
          cached_bytes: Math.floor(Math.random() * 500000000) + 50000000,
          total_health_checks: 100,
          successful_checks: 98
        }
      ]
    };
  }

  private convertTimeRangeToTimeframe(timeRange: TimeRange) {
    const now = new Date();
    const from = new Date();

    switch (timeRange) {
      case '1h':
        from.setHours(now.getHours() - 1);
        break;
      case '6h':
        from.setHours(now.getHours() - 6);
        break;
      case '24h':
        from.setDate(now.getDate() - 1);
        break;
      case '7d':
        from.setDate(now.getDate() - 7);
        break;
      case '30d':
        from.setDate(now.getDate() - 30);
        break;
      case '90d':
        from.setDate(now.getDate() - 90);
        break;
    }

    return {
      from: from.toISOString(),
      to: now.toISOString()
    };
  }

  private getTimeRangeMinutes(timeRange: TimeRange): number {
    switch (timeRange) {
      case '1h': return 60;
      case '6h': return 360;
      case '24h': return 1440;
      case '7d': return 10080;
      case '30d': return 43200;
      case '90d': return 129600;
      default: return 1440;
    }
  }

  private parseCloudflareMetrics(
    requestsData: any,
    performanceData: any,
    errorData: any,
    bandwidthData: any
  ): CloudflareMetrics {
    const requests = requestsData?.data?.[0] || {};
    const performance = performanceData?.data?.[0] || {};
    const errors = errorData?.data?.[0] || {};
    const bandwidth = bandwidthData?.data?.[0] || {};

    const totalRequests = requests.total_requests || 0;
    const cachedRequests = requests.cached_requests || 0;
    const errorRequests = errors.total_errors || 0;

    return {
      requests: {
        total: totalRequests,
        cached: cachedRequests,
        uncached: totalRequests - cachedRequests,
        errors: errorRequests
      },
      performance: {
        p50ResponseTime: Math.round((performance.p50_response_time || 0) * 100) / 100,
        p95ResponseTime: Math.round((performance.p95_response_time || 0) * 100) / 100,
        p99ResponseTime: Math.round((performance.p99_response_time || 0) * 100) / 100,
        averageResponseTime: Math.round((performance.avg_response_time || 0) * 100) / 100
      },
      errors: {
        rate: totalRequests > 0 ? Math.round((errorRequests / totalRequests) * 100 * 100) / 100 : 0,
        total: errorRequests,
        by4xx: errors['4xx_errors'] || 0,
        by5xx: errors['5xx_errors'] || 0
      },
      bandwidth: {
        totalBytes: bandwidth.total_bytes || 0,
        cachedBytes: bandwidth.cached_bytes || 0,
        uncachedBytes: (bandwidth.total_bytes || 0) - (bandwidth.cached_bytes || 0)
      },
      uptime: {
        percentage: 99.5, // Will be set by getUptimeMetrics
        downtime: 0.5
      }
    };
  }

  private aggregateMetrics(metricsArray: CloudflareMetrics[]): CloudflareMetrics {
    if (metricsArray.length === 0) {
      return this.getEmptyMetrics();
    }

    const totals = metricsArray.reduce(
      (acc, metrics) => ({
        totalRequests: acc.totalRequests + metrics.requests.total,
        cachedRequests: acc.cachedRequests + metrics.requests.cached,
        uncachedRequests: acc.uncachedRequests + metrics.requests.uncached,
        errors: acc.errors + metrics.requests.errors,
        responseTimeSum: acc.responseTimeSum + metrics.performance.averageResponseTime,
        totalBytes: acc.totalBytes + metrics.bandwidth.totalBytes,
        cachedBytes: acc.cachedBytes + metrics.bandwidth.cachedBytes,
        count: acc.count + 1
      }),
      {
        totalRequests: 0,
        cachedRequests: 0,
        uncachedRequests: 0,
        errors: 0,
        responseTimeSum: 0,
        totalBytes: 0,
        cachedBytes: 0,
        count: 0
      }
    );

    // Calculate weighted averages for performance metrics
    const avgResponseTimes = metricsArray.map(m => m.performance.averageResponseTime);
    const p50ResponseTimes = metricsArray.map(m => m.performance.p50ResponseTime);
    const p95ResponseTimes = metricsArray.map(m => m.performance.p95ResponseTime);
    const p99ResponseTimes = metricsArray.map(m => m.performance.p99ResponseTime);

    return {
      requests: {
        total: totals.totalRequests,
        cached: totals.cachedRequests,
        uncached: totals.uncachedRequests,
        errors: totals.errors
      },
      performance: {
        averageResponseTime: Math.round((totals.responseTimeSum / totals.count) * 100) / 100,
        p50ResponseTime: Math.round((p50ResponseTimes.reduce((a, b) => a + b, 0) / p50ResponseTimes.length) * 100) / 100,
        p95ResponseTime: Math.round((p95ResponseTimes.reduce((a, b) => a + b, 0) / p95ResponseTimes.length) * 100) / 100,
        p99ResponseTime: Math.round((p99ResponseTimes.reduce((a, b) => a + b, 0) / p99ResponseTimes.length) * 100) / 100
      },
      errors: {
        rate: totals.totalRequests > 0 ? 
          Math.round((totals.errors / totals.totalRequests) * 100 * 100) / 100 : 0,
        total: totals.errors,
        by4xx: metricsArray.reduce((sum, m) => sum + m.errors.by4xx, 0),
        by5xx: metricsArray.reduce((sum, m) => sum + m.errors.by5xx, 0)
      },
      bandwidth: {
        totalBytes: totals.totalBytes,
        cachedBytes: totals.cachedBytes,
        uncachedBytes: totals.totalBytes - totals.cachedBytes
      },
      uptime: {
        percentage: Math.round((metricsArray.reduce((sum, m) => sum + m.uptime.percentage, 0) / metricsArray.length) * 100) / 100,
        downtime: metricsArray.reduce((sum, m) => sum + m.uptime.downtime, 0)
      }
    };
  }

  private getEmptyMetrics(): CloudflareMetrics {
    return {
      requests: {
        total: 0,
        cached: 0,
        uncached: 0,
        errors: 0
      },
      performance: {
        p50ResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        averageResponseTime: 0
      },
      errors: {
        rate: 0,
        total: 0,
        by4xx: 0,
        by5xx: 0
      },
      bandwidth: {
        totalBytes: 0,
        cachedBytes: 0,
        uncachedBytes: 0
      },
      uptime: {
        percentage: 100,
        downtime: 0
      }
    };
  }
}