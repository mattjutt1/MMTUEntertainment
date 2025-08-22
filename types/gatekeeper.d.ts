// Gatekeeper TypeScript Definitions
// Type safety for launch gates and experiment management

export interface LaunchGateConfig {
  experiments: Record<string, ExperimentConfig>;
  gatekeeper: GatekeeperConfig;
  analytics: AnalyticsConfig;
  database: DatabaseConfig;
}

export interface ExperimentConfig {
  name: string;
  type: 'revenue_optimization' | 'pricing_experiment' | 'marketplace_funnel';
  status: 'active' | 'pending_launch' | 'paused' | 'completed';
  current_stage?: number;
  ramp_stages?: number[];
  arms?: string[];
  traffic_split?: number[];
  
  promotion_criteria?: {
    [stage: string]: PromotionCriteria;
  };
  
  evaluation_criteria?: EvaluationCriteria;
  decision_rules?: DecisionRules;
  kill_switch?: KillSwitch;
  rollback_plan?: RollbackPlan;
  funnel_stages?: string[];
  success_metrics?: MetricDefinition;
  metrics?: MetricDefinition;
}

export interface PromotionCriteria {
  min_sample: number;
  min_duration_hours: number;
  metrics: {
    [metricName: string]: number;
  };
  confidence_level: number;
}

export interface EvaluationCriteria {
  min_visitors_per_arm: number;
  min_purchases_per_arm: number;
  evaluation_frequency_hours: number;
}

export interface DecisionRules {
  kill_variant?: {
    condition: string;
    confidence_level: number;
    action: string;
  };
  follow_up?: {
    condition: string;
    action: string;
  };
}

export interface KillSwitch {
  condition: string;
  action: string;
  alert_channels: string[];
}

export interface RollbackPlan {
  trigger: string;
  steps: string[];
}

export interface MetricDefinition {
  primary: string;
  secondary?: string[];
}

export interface GatekeeperConfig {
  evaluation_frequency_minutes: number;
  decision_confidence_threshold: number;
  max_auto_promotion_per_day: number;
  emergency_contacts: string[];
}

export interface AnalyticsConfig {
  provider: string;
  events_prefix: string;
  retention_days: number;
}

export interface DatabaseConfig {
  feature_flags_table: string;
  audit_log_table: string;
  backup_frequency_hours: number;
}

// Decision logging schema
export interface GatekeeperDecision {
  ts: string;
  actor: 'gatekeeper' | 'manual' | 'emergency';
  action: 'promote' | 'kill' | 'rollback' | 'evaluate' | 'deny';
  exp: string;
  from: string | number;
  to: string | number;
  sample: number;
  metrics: Record<string, number>;
  decision: 'ALLOW' | 'DENY' | 'PENDING';
  reason: string;
  confidence?: number;
}

// PostHog integration types
export interface MetricsData {
  experiment: string;
  stage: number;
  sample_size: number;
  metrics: {
    attach_rate?: number;
    refund_delta?: number;
    revenue_per_visitor?: number;
    conversion_rate?: number;
    install_rate?: number;
    first_run_completion?: number;
    d7_retention?: number;
  };
  confidence_intervals?: Record<string, [number, number]>;
}

// Supabase feature flags table
export interface FeatureFlag {
  name: string;
  pct: number;
  updated_at: string;
  updated_by: string;
  metadata?: Record<string, any>;
}

// API responses
export interface GatekeeperResponse {
  success: boolean;
  decision: 'ALLOW' | 'DENY' | 'PENDING';
  reason: string;
  metrics?: MetricsData;
  next_evaluation?: string;
}

export interface FlagUpdateRequest {
  name: string;
  pct: number;
  reason: string;
  override?: boolean;
}