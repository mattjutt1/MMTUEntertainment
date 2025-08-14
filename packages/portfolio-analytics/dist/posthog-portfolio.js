"use strict";
/**
 * PostHog Portfolio Integration
 * Extends existing PostHog analytics to portfolio-wide level
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostHogPortfolioAnalytics = void 0;
const posthog_js_1 = __importDefault(require("posthog-js"));
class PostHogPortfolioAnalytics {
    constructor(config) {
        this.config = config;
        this.initializePostHog();
    }
    /**
     * Initialize PostHog with portfolio configuration
     */
    initializePostHog() {
        if (typeof window !== 'undefined' && this.config.posthog.apiKey) {
            posthog_js_1.default.init(this.config.posthog.apiKey, {
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
    trackDeployment(productId, deployment) {
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
    trackIncident(productId, incident) {
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
    trackDORAMetrics(metrics) {
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
    trackPerformanceAlert(productId, alert) {
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
    trackDashboardInteraction(interaction) {
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
    trackFeatureUsage(productId, feature) {
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
    setupProductEvents(product) {
        const productContext = {
            product_id: product.id,
            product_name: product.name,
            repository: product.repository
        };
        // Set product context for future events
        posthog_js_1.default.register(productContext);
        return {
            trackPageView: (path) => {
                this.trackEvent('portfolio_page_view', {
                    ...productContext,
                    page_path: path,
                    page_timestamp: new Date().toISOString()
                });
            },
            trackError: (error) => {
                this.trackEvent('portfolio_error', {
                    ...productContext,
                    error_message: error.message,
                    error_stack: error.stack,
                    error_component: error.component,
                    error_timestamp: new Date().toISOString()
                });
            },
            trackConversion: (conversionType, value) => {
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
    async getAnalyticsData(timeRange = '7d') {
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
    identifyUser(userId, properties) {
        if (typeof window !== 'undefined') {
            posthog_js_1.default.identify(userId, {
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
                    const perfData = performance.getEntriesByType('navigation')[0];
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
    trackEvent(eventName, properties = {}) {
        if (typeof window !== 'undefined') {
            posthog_js_1.default.capture(eventName, {
                ...properties,
                $current_url: window.location.href,
                $referrer: document.referrer,
                user_agent: navigator.userAgent,
                portfolio_timestamp: new Date().toISOString()
            });
        }
        // Also log in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`Portfolio Analytics: ${eventName}`, properties);
        }
    }
    /**
     * Clean up and flush events
     */
    cleanup() {
        if (typeof window !== 'undefined') {
            posthog_js_1.default.capture('portfolio_session_end', {
                session_duration: performance.now(),
                session_timestamp: new Date().toISOString()
            });
        }
    }
}
exports.PostHogPortfolioAnalytics = PostHogPortfolioAnalytics;
