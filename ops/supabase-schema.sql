-- Gatekeeper Database Schema for MMTU Entertainment
-- Feature flags and experiment management with Row Level Security
-- Updated: 2025-01-14

-- Feature flags table for remote experiment control
CREATE TABLE IF NOT EXISTS feature_flags (
  name TEXT PRIMARY KEY,
  pct INTEGER NOT NULL DEFAULT 0 CHECK (pct >= 0 AND pct <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL DEFAULT 'system',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Experiment decisions audit log
CREATE TABLE IF NOT EXISTS experiment_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor TEXT NOT NULL CHECK (actor IN ('gatekeeper', 'manual', 'emergency')),
  action TEXT NOT NULL CHECK (action IN ('promote', 'kill', 'rollback', 'evaluate', 'deny')),
  experiment TEXT NOT NULL,
  from_stage TEXT NOT NULL,
  to_stage TEXT NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 0,
  metrics JSONB DEFAULT '{}',
  decision TEXT NOT NULL CHECK (decision IN ('ALLOW', 'DENY', 'PENDING')),
  reason TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  metadata JSONB DEFAULT '{}'
);

-- Experiment metadata table
CREATE TABLE IF NOT EXISTS experiments (
  name TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('revenue_optimization', 'pricing_experiment', 'marketplace_funnel')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending_launch', 'paused', 'completed')),
  current_stage INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

-- Feature flags policies
CREATE POLICY "feature_flags_read_all" ON feature_flags
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "feature_flags_write_service_only" ON feature_flags  
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Prevent regular users from writing feature flags
CREATE POLICY "feature_flags_no_user_writes" ON feature_flags
  FOR INSERT, UPDATE, DELETE TO authenticated
  USING (false);

-- Experiment decisions - append-only audit log
CREATE POLICY "experiment_decisions_read_authenticated" ON experiment_decisions
  FOR SELECT TO authenticated, service_role
  USING (true);

CREATE POLICY "experiment_decisions_insert_service_only" ON experiment_decisions
  FOR INSERT TO service_role
  WITH CHECK (true);

-- No updates or deletes on audit log
CREATE POLICY "experiment_decisions_no_modifications" ON experiment_decisions
  FOR UPDATE, DELETE TO authenticated, service_role
  USING (false);

-- Experiments table
CREATE POLICY "experiments_read_all" ON experiments
  FOR SELECT TO authenticated, anon, service_role
  USING (true);

CREATE POLICY "experiments_write_service_only" ON experiments
  FOR INSERT, UPDATE, DELETE TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_updated_at ON feature_flags(updated_at);
CREATE INDEX IF NOT EXISTS idx_experiment_decisions_ts ON experiment_decisions(ts);
CREATE INDEX IF NOT EXISTS idx_experiment_decisions_experiment ON experiment_decisions(experiment);
CREATE INDEX IF NOT EXISTS idx_experiment_decisions_actor ON experiment_decisions(actor);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiments_type ON experiments(type);

-- Functions and triggers

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER experiments_updated_at
  BEFORE UPDATE ON experiments  
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to safely update feature flags (with validation)
CREATE OR REPLACE FUNCTION update_feature_flag(
  flag_name TEXT,
  new_pct INTEGER,
  updated_by_user TEXT DEFAULT 'gatekeeper'
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Validation
  IF new_pct < 0 OR new_pct > 100 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Percentage must be between 0 and 100'
    );
  END IF;
  
  -- Update or insert flag
  INSERT INTO feature_flags (name, pct, updated_by)
  VALUES (flag_name, new_pct, updated_by_user)
  ON CONFLICT (name) 
  DO UPDATE SET 
    pct = EXCLUDED.pct,
    updated_by = EXCLUDED.updated_by,
    updated_at = NOW();
    
  -- Return success with current state
  SELECT jsonb_build_object(
    'success', true,
    'flag', row_to_json(feature_flags)
  ) INTO result
  FROM feature_flags 
  WHERE name = flag_name;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log experiment decision
CREATE OR REPLACE FUNCTION log_experiment_decision(
  decision_data JSONB
)
RETURNS UUID AS $$
DECLARE
  decision_id UUID;
BEGIN
  INSERT INTO experiment_decisions (
    ts, actor, action, experiment, from_stage, to_stage,
    sample_size, metrics, decision, reason, confidence
  )
  VALUES (
    COALESCE((decision_data->>'ts')::TIMESTAMPTZ, NOW()),
    decision_data->>'actor',
    decision_data->>'action', 
    decision_data->>'experiment',
    decision_data->>'from_stage',
    decision_data->>'to_stage',
    COALESCE((decision_data->>'sample_size')::INTEGER, 0),
    COALESCE(decision_data->'metrics', '{}'),
    decision_data->>'decision',
    decision_data->>'reason',
    COALESCE((decision_data->>'confidence')::DECIMAL, NULL)
  )
  RETURNING id INTO decision_id;
  
  RETURN decision_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Realtime subscriptions setup
-- Enable realtime for feature flags so clients can react immediately
ALTER PUBLICATION supabase_realtime ADD TABLE feature_flags;

-- Initial feature flag data
INSERT INTO feature_flags (name, pct, updated_by) VALUES
  ('post_purchase_bundle_v1_pct', 25, 'initial_setup'),
  ('overlay_pricing_ab_v1_enabled', 100, 'initial_setup'),
  ('driftguard_marketplace_v1_enabled', 0, 'initial_setup')
ON CONFLICT (name) DO NOTHING;

-- Initial experiment configurations
INSERT INTO experiments (name, type, status, current_stage, config) VALUES
  (
    'post_purchase_bundle_v1',
    'revenue_optimization', 
    'active',
    25,
    '{
      "description": "Security bundle upsell on Reports confirmation page",
      "target_audience": "new_customers",
      "success_metrics": ["attach_rate", "refund_delta"],
      "ramp_schedule": [25, 50, 100]
    }'
  ),
  (
    'overlay_pricing_ab_v1',
    'pricing_experiment',
    'active', 
    100,
    '{
      "description": "A/B test $19 vs $9 pricing for Overlay Studio Pro",
      "arms": ["$19_control", "$9_variant", "$19_no_promo_holdout"],
      "traffic_split": [45, 45, 10],
      "success_metrics": ["revenue_per_visitor", "conversion_rate"]
    }'
  ),
  (
    'driftguard_marketplace_v1',
    'marketplace_funnel',
    'pending_launch',
    0,
    '{
      "description": "DriftGuard GitHub Marketplace launch funnel",
      "funnel_stages": ["view", "install", "first_run", "config_complete"],
      "success_metrics": ["install_rate", "first_run_completion", "d7_retention"]
    }'
  )
ON CONFLICT (name) DO NOTHING;

-- Views for easier querying

-- Current experiment status view
CREATE OR REPLACE VIEW experiment_status AS
SELECT 
  e.name,
  e.type,
  e.status,
  e.current_stage,
  ff.pct as current_traffic_pct,
  e.config,
  e.updated_at as last_config_update,
  ff.updated_at as last_traffic_update,
  ff.updated_by as last_updated_by
FROM experiments e
LEFT JOIN feature_flags ff ON ff.name = e.name || '_pct' OR ff.name = e.name || '_enabled';

-- Recent decisions view (last 24 hours)
CREATE OR REPLACE VIEW recent_decisions AS
SELECT *
FROM experiment_decisions
WHERE ts >= NOW() - INTERVAL '24 hours'
ORDER BY ts DESC;

-- Experiment performance summary (would be populated by analytics)
CREATE OR REPLACE VIEW experiment_performance AS
SELECT 
  experiment,
  COUNT(*) as total_decisions,
  COUNT(*) FILTER (WHERE decision = 'ALLOW') as promotions,
  COUNT(*) FILTER (WHERE decision = 'DENY') as denials,
  COUNT(*) FILTER (WHERE action = 'kill') as kill_switches,
  MAX(ts) as last_evaluation,
  AVG(confidence) as avg_confidence
FROM experiment_decisions
WHERE ts >= NOW() - INTERVAL '30 days'
GROUP BY experiment;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Comments for documentation
COMMENT ON TABLE feature_flags IS 'Remote feature flags for experiment control with RLS enforcement';
COMMENT ON TABLE experiment_decisions IS 'Append-only audit log of all experiment decisions';
COMMENT ON TABLE experiments IS 'Experiment metadata and configuration';
COMMENT ON FUNCTION update_feature_flag IS 'Safely update feature flag with validation';
COMMENT ON FUNCTION log_experiment_decision IS 'Log experiment decision to audit trail';

-- Performance and maintenance

-- Cleanup old audit records (retain 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_decisions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM experiment_decisions 
  WHERE ts < NOW() - INTERVAL '365 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-old-decisions', '0 2 * * 0', 'SELECT cleanup_old_decisions()');

COMMIT;