-- DriftGuard Supabase PostgreSQL Schema
-- Execute this in Supabase SQL Editor

-- Create check_runs table
CREATE TABLE IF NOT EXISTS check_runs (
    id BIGSERIAL PRIMARY KEY,
    github_check_run_id BIGINT NOT NULL UNIQUE,
    repository_owner TEXT NOT NULL,
    repository_name TEXT NOT NULL,
    commit_sha TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    tool_version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'skipped')),
    test_count INTEGER NOT NULL DEFAULT 0,
    passed_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    report_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB -- PostgreSQL JSONB for metadata
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_check_runs_repository ON check_runs(repository_owner, repository_name);
CREATE INDEX IF NOT EXISTS idx_check_runs_commit ON check_runs(commit_sha);
CREATE INDEX IF NOT EXISTS idx_check_runs_created ON check_runs(created_at);
CREATE INDEX IF NOT EXISTS idx_check_runs_status ON check_runs(status);
CREATE INDEX IF NOT EXISTS idx_check_runs_repo_tool ON check_runs(repository_owner, repository_name, tool_name);
CREATE INDEX IF NOT EXISTS idx_check_runs_recent ON check_runs(created_at DESC, repository_owner, repository_name);

-- Enable Row Level Security
ALTER TABLE check_runs ENABLE ROW LEVEL SECURITY;

-- Policy for service role (our Cloudflare Worker)
CREATE POLICY "Service role can do everything" ON check_runs
FOR ALL USING (auth.role() = 'service_role');

-- Optional: Public read access for dashboard
CREATE POLICY "Public read access" ON check_runs
FOR SELECT USING (true);