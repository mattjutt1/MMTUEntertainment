-- Supabase table schema for Front Desk events
-- Run this in your Supabase SQL editor to create the events table

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  contact JSONB,
  tags TEXT[],
  priority TEXT,
  status TEXT,
  category TEXT,
  correlation_id TEXT,
  ingested_at TIMESTAMPTZ,
  ingested_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_events_source ON events(source);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_correlation_id ON events(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_events_contact_email ON events((contact->>'email'));

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create a policy for anon users to insert events
CREATE POLICY "Enable insert for anon users" ON events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create a policy for anon users to read their own events (optional)
CREATE POLICY "Enable read for anon users" ON events
  FOR SELECT
  TO anon
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add table comment
COMMENT ON TABLE events IS 'Front Desk webhook events from helpdesk systems';
COMMENT ON COLUMN events.id IS 'ULID unique identifier';
COMMENT ON COLUMN events.source IS 'Source system (zammad, freescout, manual, etc)';
COMMENT ON COLUMN events.contact IS 'Contact information as JSON';
COMMENT ON COLUMN events.tags IS 'Array of tags';
COMMENT ON COLUMN events.correlation_id IS 'External system ID for correlation';