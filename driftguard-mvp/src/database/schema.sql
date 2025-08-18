-- DriftGuard Database Schema for Supabase
-- Production-ready tables for MVP deployment

-- GitHub App installations
CREATE TABLE installations (
    id SERIAL PRIMARY KEY,
    github_installation_id BIGINT UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('User', 'Organization')),
    account_login VARCHAR(100) NOT NULL,
    account_id BIGINT NOT NULL,
    permissions JSONB,
    repository_selection VARCHAR(20) DEFAULT 'selected',
    installed_by VARCHAR(100) NOT NULL,
    installed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repositories associated with installations
CREATE TABLE installation_repositories (
    id SERIAL PRIMARY KEY,
    github_installation_id BIGINT NOT NULL REFERENCES installations(github_installation_id),
    repository_id BIGINT NOT NULL,
    repository_name VARCHAR(100) NOT NULL,
    repository_full_name VARCHAR(200) NOT NULL,
    private BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL,
    removed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(github_installation_id, repository_id)
);

-- Subscription management
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    stripe_customer_id VARCHAR(100) UNIQUE NOT NULL,
    stripe_subscription_id VARCHAR(100) UNIQUE NOT NULL,
    github_installation_id BIGINT NOT NULL REFERENCES installations(github_installation_id),
    account_login VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    plan_name VARCHAR(50) NOT NULL,
    price_id VARCHAR(100) NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    last_payment_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check runs tracking
CREATE TABLE check_runs (
    id SERIAL PRIMARY KEY,
    github_check_run_id BIGINT UNIQUE NOT NULL,
    repository_owner VARCHAR(100) NOT NULL,
    repository_name VARCHAR(100) NOT NULL,
    commit_sha CHAR(40) NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    tool_version VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    conclusion VARCHAR(20),
    test_count INTEGER DEFAULT 0,
    passed_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    report_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_check_runs_repository (repository_owner, repository_name),
    INDEX idx_check_runs_commit (commit_sha),
    INDEX idx_check_runs_tool (tool_name),
    INDEX idx_check_runs_created (created_at DESC)
);

-- Usage analytics (for rate limiting and billing)
CREATE TABLE usage_analytics (
    id SERIAL PRIMARY KEY,
    github_installation_id BIGINT NOT NULL REFERENCES installations(github_installation_id),
    repository_owner VARCHAR(100) NOT NULL,
    repository_name VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_count INTEGER DEFAULT 1,
    date_bucket DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(github_installation_id, repository_owner, repository_name, event_type, date_bucket)
);

-- API rate limiting (if KV is not sufficient)
CREATE TABLE rate_limits (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(200) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(identifier, window_start)
);

-- Audit log for security and compliance
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    github_installation_id BIGINT REFERENCES installations(github_installation_id),
    actor VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(200),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_audit_logs_installation (github_installation_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_created (created_at DESC)
);

-- RLS (Row Level Security) policies for multi-tenancy
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies (users can only access their own installation data)
CREATE POLICY "Users can view their own installations" ON installations
    FOR SELECT USING (auth.jwt() ->> 'github_login' = account_login);

CREATE POLICY "Users can view their own repositories" ON installation_repositories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM installations 
            WHERE installations.github_installation_id = installation_repositories.github_installation_id
            AND installations.account_login = auth.jwt() ->> 'github_login'
        )
    );

CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (account_login = auth.jwt() ->> 'github_login');

CREATE POLICY "Users can view their own check runs" ON check_runs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM installation_repositories ir
            JOIN installations i ON i.github_installation_id = ir.github_installation_id
            WHERE ir.repository_name = check_runs.repository_name
            AND ir.repository_full_name = check_runs.repository_owner || '/' || check_runs.repository_name
            AND i.account_login = auth.jwt() ->> 'github_login'
        )
    );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_installations_updated_at BEFORE UPDATE ON installations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_installations_account ON installations(account_login, github_installation_id);
CREATE INDEX idx_repositories_installation ON installation_repositories(github_installation_id, repository_name);
CREATE INDEX idx_subscriptions_installation ON subscriptions(github_installation_id, status);
CREATE INDEX idx_usage_analytics_date ON usage_analytics(date_bucket, github_installation_id);

-- Materialized view for dashboard analytics
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
    COUNT(DISTINCT i.github_installation_id) as total_installations,
    COUNT(DISTINCT ir.repository_id) as total_repositories,
    COUNT(DISTINCT cr.id) as total_check_runs,
    COUNT(DISTINCT s.id) as active_subscriptions,
    SUM(CASE WHEN cr.created_at >= NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as check_runs_24h,
    SUM(CASE WHEN cr.created_at >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as check_runs_7d,
    AVG(cr.duration_ms)::INTEGER as avg_duration_ms,
    (SUM(cr.passed_count)::FLOAT / NULLIF(SUM(cr.test_count), 0) * 100)::DECIMAL(5,2) as overall_pass_rate
FROM installations i
LEFT JOIN installation_repositories ir ON i.github_installation_id = ir.github_installation_id
    AND ir.removed_at IS NULL
LEFT JOIN check_runs cr ON ir.repository_owner = cr.repository_owner 
    AND ir.repository_name = cr.repository_name
LEFT JOIN subscriptions s ON i.github_installation_id = s.github_installation_id
    AND s.status = 'active'
WHERE i.deleted_at IS NULL;

-- Refresh the materialized view hourly (set up via cron or scheduled job)
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE installations IS 'GitHub App installations tracking';
COMMENT ON TABLE installation_repositories IS 'Repositories associated with each installation';
COMMENT ON TABLE subscriptions IS 'Stripe subscription management';
COMMENT ON TABLE check_runs IS 'GitHub check runs created by DriftGuard';
COMMENT ON TABLE usage_analytics IS 'Daily usage metrics for billing and analytics';
COMMENT ON TABLE audit_logs IS 'Security and compliance audit trail';
COMMENT ON MATERIALIZED VIEW dashboard_stats IS 'Aggregated statistics for dashboard display';

-- Initial data seeding would go here for development
-- INSERT INTO installations (github_installation_id, account_type, account_login, account_id, installed_by, installed_at)
-- VALUES (12345, 'Organization', 'mmtu-entertainment', 67890, 'admin', NOW());