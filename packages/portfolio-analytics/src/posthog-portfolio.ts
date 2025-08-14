/**
 * PostHog Portfolio Integration
 * Extends existing PostHog analytics to portfolio-wide level
 */

import posthog from 'posthog-js';
import { PortfolioProduct, AnalyticsConfig } from './types';

export class PostHogPortfolioAnalytics {
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.initializePostHog();
  }

  /**
   * Initialize PostHog with portfolio configuration
   */
  private initializePostHog() {
    if (typeof window !== 'undefined' && this.config.posthog.apiKey) {
      posthog.init(this.config.posthog.apiKey, {
        api_host: this.config.posthog.host || 'https://app.posthog.com',
        autocapture: false,
        capture_pageview: false,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog Portfolio Analytics initialized');
          }
        }
      });
    }
  }

  /**
   * Track deployment events across portfolio
   */
  trackDeployment(productId: string, deployment: {
    environment: string;
    status: 'started' | 'success' | 'failure';
    version?: string;
    commitSha?: string;
    duration?: number;
  }) {
    this.trackEvent('portfolio_deployment', {
      product_id: productId,
      environment: deployment.environment,
      deployment_status: deployment.status,
      version: deployment.version,
      commit_sha: deployment.commitSha,
      deployment_duration: deployment.duration,
      deployment_timestamp: new Date().toISOString()
    });
  }

  /**
   * Track incident events across portfolio
   */
  trackIncident(productId: string, incident: {
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'started' | 'investigating' | 'resolved';
    title: string;
    duration?: number;
    causedByDeployment?: boolean;
  }) {
    this.trackEvent('portfolio_incident', {
      product_id: productId,
      incident_severity: incident.severity,
      incident_status: incident.status,
      incident_title: incident.title,
      incident_duration: incident.duration,
      caused_by_deployment: incident.causedByDeployment,
      incident_timestamp: new Date().toISOString()
    });
  }

  /**
   * Track DORA metrics changes
   */
  trackDORAMetrics(metrics: {
    deploymentFrequency: number;
    leadTimeHours: number;
    mttrMinutes: number;
    changeFailureRate: number;
    period: string;
  }) {
    this.trackEvent('portfolio_dora_metrics', {
      deployment_frequency: metrics.deploymentFrequency,
      lead_time_hours: metrics.leadTimeHours,
      mttr_minutes: metrics.mttrMinutes,
      change_failure_rate: metrics.changeFailureRate,
      metrics_period: metrics.period,
      metrics_timestamp: new Date().toISOString()
    });
  }

  /**
   * Track performance alerts
   */
  trackPerformanceAlert(productId: string, alert: {
    type: 'response_time' | 'error_rate' | 'uptime';
    threshold: number;
    actualValue: number;
    severity: 'warning' | 'critical';
  }) {
    this.trackEvent('portfolio_performance_alert', {
      product_id: productId,
      alert_type: alert.type,
      alert_threshold: alert.threshold,
      actual_value: alert.actualValue,
      alert_severity: alert.severity,
      alert_timestamp: new Date().toISOString()
    });
  }

  /**
   * Track user interactions with portfolio dashboard
   */
  trackDashboardInteraction(interaction: {
    action: 'view_product' | 'filter_timerange' | 'view_metrics' | 'acknowledge_alert';
    productId?: string;
    timeRange?: string;
    metricType?: string;
    alertId?: string;
  }) {
    this.trackEvent('portfolio_dashboard_interaction', {
      dashboard_action: interaction.action,
      product_id: interaction.productId,
      time_range: interaction.timeRange,
      metric_type: interaction.metricType,
      alert_id: interaction.alertId,
      interaction_timestamp: new Date().toISOString()
    });
  }

  /**
   * Track feature usage across products
   */
  trackFeatureUsage(productId: string, feature: {
    name: string;
    action: string;
    userId?: string;
    properties?: Record<string, any>;
  }) {
    this.trackEvent('portfolio_feature_usage', {
      product_id: productId,
      feature_name: feature.name,
      feature_action: feature.action,
      user_id: feature.userId,
      ...feature.properties,
      usage_timestamp: new Date().toISOString()
    });
  }

  /**
   * Set up custom events for each product
   */
  setupProductEvents(product: PortfolioProduct) {
    const productContext = {
      product_id: product.id,
      product_name: product.name,
      repository: product.repository
    };

    // Set product context for future events
    posthog.register(productContext);

    return {
      trackPageView: (path: string) => {
        this.trackEvent('portfolio_page_view', {
          ...productContext,
          page_path: path,
          page_timestamp: new Date().toISOString()
        });
      },
      trackError: (error: { message: string; stack?: string; component?: string }) => {
        this.trackEvent('portfolio_error', {
          ...productContext,
          error_message: error.message,
          error_stack: error.stack,
          error_component: error.component,
          error_timestamp: new Date().toISOString()
        });
      },
      trackConversion: (conversionType: string, value?: number) => {
        this.trackEvent('portfolio_conversion', {
          ...productContext,
          conversion_type: conversionType,
          conversion_value: value,
          conversion_timestamp: new Date().toISOString()
        });
      }
    };
  }

  /**
   * Get analytics data for dashboard
   */
  async getAnalyticsData(timeRange: string = '7d'): Promise<any> {
    // This would typically query PostHog's API
    // For now, return mock structure that matches expected format
    return {
      deployments: {
        total: 45,
        successful: 42,
        failed: 3,
        byProduct: this.config.products.map(p => ({
          productId: p.id,
          count: Math.floor(Math.random() * 10) + 1
        }))
      },
      incidents: {
        total: 3,
        resolved: 2,
        active: 1,
        byProduct: this.config.products.map(p => ({
          productId: p.id,
          count: Math.floor(Math.random() * 2)
        }))
      },
      performance: {
        alertsTriggered: 8,
        avgResponseTime: 145,
        errorRate: 0.2,
        uptime: 99.8
      },
      userActivity: {
        totalSessions: 1250,
        activeProducts: this.config.products.length,
        conversionsByProduct: this.config.products.map(p => ({
          productId: p.id,
          conversions: Math.floor(Math.random() * 50) + 5
        }))
      }
    };
  }

  /**
   * Identify user for portfolio-wide tracking
   */
  identifyUser(userId: string, properties: {
    role?: 'admin' | 'developer' | 'manager';
    products?: string[];
    permissions?: string[];
  }) {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, {
        portfolio_role: properties.role,
        accessible_products: properties.products,
        user_permissions: properties.permissions,
        identified_timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Set up automated tracking for common patterns
   */
  setupAutomatedTracking() {
    // Track unhandled errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.trackEvent('portfolio_unhandled_error', {
          error_message: event.message,
          error_filename: event.filename,
          error_line: event.lineno,
          error_column: event.colno,
          error_timestamp: new Date().toISOString()
        });
      });

      // Track performance metrics
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (perfData) {
            this.trackEvent('portfolio_performance_timing', {
              page_load_time: perfData.loadEventEnd - perfData.fetchStart,
              dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
              first_byte: perfData.responseStart - perfData.fetchStart,
              performance_timestamp: new Date().toISOString()
            });
          }
        }, 0);
      });
    }
  }

  /**
   * Track custom event with portfolio context
   */
  private trackEvent(eventName: string, properties: Record<string, any> = {}) {
    if (typeof window !== 'undefined') {
      posthog.capture(eventName, {
        ...properties,
        $current_url: window.location.href,
        $referrer: document.referrer,
        user_agent: navigator.userAgent,
        portfolio_timestamp: new Date().toISOString()
      });
    }

    // Also log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Portfolio Analytics:', eventName, properties);
    }
  }

  /**
   * Clean up and flush events
   */
  cleanup() {
    if (typeof window !== 'undefined') {
      posthog.capture('portfolio_session_end', {
        session_duration: performance.now(),
        session_timestamp: new Date().toISOString()
      });
    }
  }
}