-- DriftGuard Database Schema
-- Check runs table for storing CTRF ingestion data and analytics

CREATE TABLE IF NOT EXISTS check_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    github_check_run_id INTEGER NOT NULL,
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
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT, -- JSON string for additional metadata
    
    -- Unique constraint
    UNIQUE(github_check_run_id)
);

-- Create index on commonly queried columns
CREATE INDEX IF NOT EXISTS idx_repo_tool ON check_runs(repository_owner, repository_name, tool_name);
CREATE INDEX IF NOT EXISTS idx_recent_runs ON check_runs(created_at DESC, repository_owner, repository_name);