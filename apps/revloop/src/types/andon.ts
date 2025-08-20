/**
 * Digital Andon Types - TPS Jidoka Implementation
 * 
 * Implements Toyota Production System concepts for abnormality detection
 * and immediate response in checkout funnel monitoring.
 */

import { z } from 'zod';

// Core Andon States (TPS Standard)
export enum AndonState {
  NORMAL = 'normal',     // Green - All systems operating normally
  ATTENTION = 'attention', // Yellow - Abnormality detected, monitoring
  STOP = 'stop',         // Red - Critical issue, immediate action required
  UNKNOWN = 'unknown'    // Gray - Insufficient data
}

// Statistical Process Control thresholds (3-sigma bands)
export const SPC_CONFIG = {
  ATTENTION_THRESHOLD: 2.0,  // 2-sigma warning
  STOP_THRESHOLD: 3.0,       // 3-sigma critical
  MIN_SAMPLE_SIZE: 30,       // Minimum for statistical significance
  LOOKBACK_HOURS: 24         // Historical baseline window
} as const;

// Funnel Stage Schema
export const FunnelStageSchema = z.object({
  stage: z.enum(['landing', 'pricing', 'checkout', 'payment', 'confirmation']),
  timestamp: z.date(),
  sessionId: z.string(),
  userId: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export type FunnelStage = z.infer<typeof FunnelStageSchema>;

// Drop-off Event Schema  
export const DropoffEventSchema = z.object({
  sessionId: z.string(),
  fromStage: z.string(),
  toStage: z.string().optional(), // null = exit without progression
  timestamp: z.date(),
  dropoffType: z.enum(['exit', 'timeout', 'error', 'abandonment']),
  errorDetails: z.string().optional(),
  value: z.number().optional() // potential revenue lost
});

export type DropoffEvent = z.infer<typeof DropoffEventSchema>;

// Andon Alert Schema
export const AndonAlertSchema = z.object({
  id: z.string(),
  state: z.nativeEnum(AndonState),
  stage: z.string(),
  message: z.string(),
  timestamp: z.date(),
  metrics: z.object({
    currentRate: z.number(),
    baselineRate: z.number(), 
    standardDeviation: z.number(),
    sigmaLevel: z.number(),
    sampleSize: z.number()
  }),
  actions: z.array(z.object({
    type: z.enum(['notify', 'escalate', 'investigate', 'stop_traffic']),
    target: z.string(),
    timestamp: z.date(),
    status: z.enum(['pending', 'completed', 'failed'])
  })).optional()
});

export type AndonAlert = z.infer<typeof AndonAlertSchema>;

// Monitoring Configuration
export const MonitoringConfigSchema = z.object({
  enabled: z.boolean().default(true),
  stages: z.array(z.string()),
  alertThresholds: z.object({
    attention: z.number().default(SPC_CONFIG.ATTENTION_THRESHOLD),
    stop: z.number().default(SPC_CONFIG.STOP_THRESHOLD)
  }),
  sampleConfig: z.object({
    minSampleSize: z.number().default(SPC_CONFIG.MIN_SAMPLE_SIZE),
    lookbackHours: z.number().default(SPC_CONFIG.LOOKBACK_HOURS)
  }),
  notifications: z.object({
    slack: z.object({
      enabled: z.boolean().default(false),
      webhook: z.string().optional(),
      channels: z.record(z.string()).optional() // stage -> channel mapping
    }).optional(),
    email: z.object({
      enabled: z.boolean().default(false),
      recipients: z.array(z.string()).optional()
    }).optional()
  }).optional()
});

export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;

// Metrics interfaces for dashboard
export interface FunnelMetrics {
  stage: string;
  conversions: number;
  dropoffs: number;
  conversionRate: number;
  timeSpent: number; // average seconds in stage
  value: number; // potential revenue
}

export interface AndonDashboard {
  overallStatus: AndonState;
  stages: Array<{
    name: string;
    status: AndonState;
    metrics: FunnelMetrics;
    alerts: AndonAlert[];
  }>;
  summary: {
    totalSessions: number;
    totalDropoffs: number;
    overallConversionRate: number;
    potentialRevenueLost: number;
    lastUpdated: Date;
  };
}

// Statistical analysis types
export interface StatisticalMetrics {
  mean: number;
  standardDeviation: number;
  upperControlLimit: number; // mean + 3*sigma
  lowerControlLimit: number; // mean - 3*sigma
  upperWarningLimit: number; // mean + 2*sigma  
  lowerWarningLimit: number; // mean - 2*sigma
  sampleSize: number;
  lastCalculated: Date;
}

export interface ProcessCapability {
  stage: string;
  baselineMetrics: StatisticalMetrics;
  currentValue: number;
  sigmaLevel: number;
  capability: 'stable' | 'unstable' | 'improving' | 'degrading';
  trend: 'increasing' | 'decreasing' | 'stable';
}