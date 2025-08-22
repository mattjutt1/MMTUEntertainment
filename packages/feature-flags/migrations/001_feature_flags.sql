-- Feature Flags Table for Launch Gates System
-- Supabase migration for remote flag control

CREATE TABLE IF NOT EXISTS feature_flags (
  name TEXT PRIMARY KEY,
  pct INTEGER NOT NULL CHECK (pct >= 0 AND pct <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT DEFAULT 'system',
  description TEXT,
  experiment_config JSONB DEFAULT '{}'::jsonb
);

-- Row Level Security (RLS) policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read flags
CREATE POLICY "Allow authenticated read" ON feature_flags
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can write flags (gatekeeper enforcement)
CREATE POLICY "Service role can write" ON feature_flags
  FOR ALL USING (auth.role() = 'service_role');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feature_flags_updated_at 
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert initial experiment flags
INSERT INTO feature_flags (name, pct, description, experiment_config) VALUES
  ('post_purchase_bundle_v1_pct', 25, 'Security→Compliance bundle upsell experiment', 
   '{"experiment": "post_purchase_bundle_v1", "stage": "25_to_50", "gate_status": "evaluating"}'::jsonb),
  ('overlay_pricing_ab_v1_enabled', 100, 'Overlay Studio pricing A/B test', 
   '{"experiment": "overlay_pricing_ab_v1", "arms": ["$19_control", "$9_variant", "$19_no_promo_holdout"], "allocation": [45, 45, 10]}'::jsonb),
  ('driftguard_marketplace_v1_enabled', 0, 'DriftGuard marketplace funnel tracking', 
   '{"experiment": "driftguard_marketplace_v1", "stage": "pre_launch", "funnel": ["view", "install", "first_run"]}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_updated_at ON feature_flags(updated_at);
CREATE INDEX IF NOT EXISTS idx_feature_flags_pct ON feature_flags(pct);

-- Enable realtime for instant flag updates
ALTER publication supabase_realtime ADD TABLE feature_flags;

COMMENT ON TABLE feature_flags IS 'Launch gates experiment flags with gatekeeper enforcement';
COMMENT ON COLUMN feature_flags.pct IS 'Percentage of users exposed (0-100)';
COMMENT ON COLUMN feature_flags.experiment_config IS 'JSON metadata for experiment configuration';
