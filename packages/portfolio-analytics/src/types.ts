/**
 * Portfolio Analytics Types
 * Centralized type definitions for DORA metrics, Cloudflare data, and analytics
 */

// DORA Metrics Types
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

// Portfolio Product Types
export interface PortfolioProduct {
  id: string;
  name: string;
  repository: string;
  cloudflareServiceId?: string;
  posthogProject?: string;
  deploymentEnvironments: ('production' | 'staging' | 'development')[];
  healthEndpoint?: string;
  alertingConfig: {
    uptimeThreshold: number; // percentage
    errorRateThreshold: number; // percentage
    responseTimeThreshold: number; // milliseconds
  };
}

// Cloudflare Performance Data
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
    downtime: number; // minutes
  };
}

// GitHub/Deployment Data
export interface DeploymentData {
  id: string;
  productId: string;
  environment: string;
  status: 'success' | 'failure' | 'in_progress' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number; // minutes
  commitSha: string;
  branch: string;
  triggeredBy: string;
  pullRequestNumber?: number;
  rollbackId?: string;
}

// Incident Data
export interface IncidentData {
  id: string;
  productId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  title: string;
  description: string;
  startTime: string;
  resolvedTime?: string;
  duration?: number; // minutes
  causedByDeployment?: string; // deployment ID
  recoveryActions: string[];
}

// Portfolio Dashboard Data
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

// Configuration Types
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

// Time Range Types
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | '90d';

// Query Options
export interface MetricsQuery {
  timeRange: TimeRange;
  products?: string[];
  environments?: string[];
  includeHistoricalData?: boolean;
}