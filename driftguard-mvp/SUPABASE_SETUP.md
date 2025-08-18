# DriftGuard Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to: https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization or create one
4. Project details:
   - **Name**: `driftguard-mvp`
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for MVP

## Step 2: Get Project Credentials

After project creation, go to Project Settings > API:

**Required values:**
- **Project URL**: `https://your-project-ref.supabase.co`
- **API Keys**:
  - `anon` (public) key: For client-side access
  - `service_role` (secret) key: For server-side access

## Step 3: Database Schema (Already Created)

Our `check_runs` table schema is already defined in `schema.sql`. However, Supabase uses PostgreSQL, so we need a PostgreSQL-compatible version:

```sql
-- PostgreSQL version for Supabase
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
    metadata JSONB, -- PostgreSQL JSONB for metadata
    
    -- Indexes for performance
    CONSTRAINT check_runs_github_check_run_id_key UNIQUE (github_check_run_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_check_runs_repository ON check_runs(repository_owner, repository_name);
CREATE INDEX IF NOT EXISTS idx_check_runs_commit ON check_runs(commit_sha);
CREATE INDEX IF NOT EXISTS idx_check_runs_created ON check_runs(created_at);
CREATE INDEX IF NOT EXISTS idx_check_runs_status ON check_runs(status);
CREATE INDEX IF NOT EXISTS idx_check_runs_repo_tool ON check_runs(repository_owner, repository_name, tool_name);
CREATE INDEX IF NOT EXISTS idx_check_runs_recent ON check_runs(created_at DESC, repository_owner, repository_name);
```

## Step 4: Execute Schema

1. Go to Supabase Dashboard > SQL Editor
2. Paste the PostgreSQL schema above
3. Click "Run" to execute

## Step 5: Row Level Security (RLS)

For production security, enable RLS:

```sql
-- Enable RLS on check_runs table
ALTER TABLE check_runs ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (for our Worker)
CREATE POLICY "Service role can do everything" ON check_runs
FOR ALL USING (auth.role() = 'service_role');

-- Public read access for authenticated users (optional)
CREATE POLICY "Public read access" ON check_runs
FOR SELECT USING (true);
```

## Step 6: Test Connection

After schema setup, test the connection:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_SERVICE_KEY'
)

// Test query
const { data, error } = await supabase
  .from('check_runs')
  .select('*')
  .limit(1)

console.log('Supabase connection test:', { data, error })
```

## Required Environment Variables

After setup, you'll have:
- `SUPABASE_URL`: Project URL
- `SUPABASE_ANON_KEY`: Public anon key  
- `SUPABASE_SERVICE_KEY`: Secret service role key (for Worker)

The Worker uses the service_role key for full database access.