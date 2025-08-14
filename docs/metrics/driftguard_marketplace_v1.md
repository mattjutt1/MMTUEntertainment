# DriftGuard Marketplace v1 Metrics

## Overview
GitHub marketplace funnel tracking: view → install → first_run → retention.

## Events Schema

### marketplace_view (ONE-SHOT per session)
**Description**: User views DriftGuard on GitHub marketplace
**Frequency**: One per session
```json
{
  "source": "marketplace_search|marketplace_browse|direct_link|github_notification|referral",
  "app_id": "driftguard_checks"
}
```

### install_clicked  
**Description**: User clicks install button
```json
{
  "source": "marketplace_search|marketplace_browse|direct_link|github_notification|referral",
  "app_id": "driftguard_checks"
}
```

### install_success
**Description**: GitHub App successfully installed  
```json
{
  "app_id": "driftguard_checks",
  "installation_id": 12345678,
  "repository_count": 3,
  "organization_type": "javascript_org" // Hashed/anonymized
}
```

### first_run_completed
**Description**: First DriftGuard workflow run completes
```json
{
  "app_id": "driftguard_checks", 
  "installation_id": 12345678,
  "checks_run": 12,
  "issues_found": 3,
  "runtime_seconds": 45,
  "repository_language": "TypeScript"
}
```

### config_saved
**Description**: User customizes DriftGuard configuration
```json
{
  "keyset": "security_level_low|security_level_medium|security_level_high|custom",
  "checks_enabled": 15,
  "custom_rules": true,
  "installation_id": 12345678  
}
```

## Key Metrics Calculation

### Marketplace Funnel Conversion
```sql
WITH funnel_data AS (
  SELECT
    COUNT(DISTINCT CASE WHEN event = 'marketplace_view' THEN session_id END) as views,
    COUNT(DISTINCT CASE WHEN event = 'install_clicked' THEN session_id END) as install_clicks,
    COUNT(DISTINCT CASE WHEN event = 'install_success' THEN properties.installation_id END) as installs,
    COUNT(DISTINCT CASE WHEN event = 'first_run_completed' THEN properties.installation_id END) as first_runs,
    COUNT(DISTINCT CASE WHEN event = 'config_saved' THEN properties.installation_id END) as configurations
  FROM posthog_events
  WHERE event IN ('marketplace_view', 'install_clicked', 'install_success', 'first_run_completed', 'config_saved')
    AND properties.app_id = 'driftguard_checks'
    AND timestamp >= experiment_start_time
)
SELECT 
  views,
  install_clicks,
  installs,
  first_runs,
  configurations,
  ROUND(install_clicks * 100.0 / views, 1) as view_to_click_pct,
  ROUND(installs * 100.0 / views, 1) as view_to_install_pct,
  ROUND(first_runs * 100.0 / installs, 1) as install_to_first_run_pct,
  ROUND(configurations * 100.0 / installs, 1) as install_to_config_pct
FROM funnel_data
```

### Install Rate by Source
```sql
SELECT 
  properties.source,
  COUNT(DISTINCT CASE WHEN event = 'marketplace_view' THEN session_id END) as views,
  COUNT(DISTINCT CASE WHEN event = 'install_success' THEN properties.installation_id END) as installs,
  ROUND(
    COUNT(DISTINCT CASE WHEN event = 'install_success' THEN properties.installation_id END) * 100.0 /
    COUNT(DISTINCT CASE WHEN event = 'marketplace_view' THEN session_id END),
    1
  ) as install_rate_pct
FROM posthog_events
WHERE event IN ('marketplace_view', 'install_success')
  AND properties.app_id = 'driftguard_checks'
  AND timestamp >= experiment_start_time
GROUP BY properties.source
ORDER BY install_rate_pct DESC
```

### D1/D7 Retention Calculation
```sql
-- Note: This would require additional events for weekly/daily activity
WITH installation_cohorts AS (
  SELECT 
    properties.installation_id,
    DATE(timestamp) as install_date
  FROM posthog_events
  WHERE event = 'install_success'
    AND properties.app_id = 'driftguard_checks'
),
daily_activity AS (
  SELECT 
    properties.installation_id,
    DATE(timestamp) as activity_date
  FROM posthog_events  
  WHERE event IN ('first_run_completed', 'config_saved')
    AND properties.app_id = 'driftguard_checks'
  GROUP BY properties.installation_id, DATE(timestamp)
)
SELECT 
  ic.install_date,
  COUNT(DISTINCT ic.installation_id) as installs,
  COUNT(DISTINCT CASE 
    WHEN da.activity_date = DATE_ADD(ic.install_date, INTERVAL 1 DAY) 
    THEN ic.installation_id 
  END) as d1_retained,
  COUNT(DISTINCT CASE 
    WHEN da.activity_date BETWEEN DATE_ADD(ic.install_date, INTERVAL 1 DAY) 
                               AND DATE_ADD(ic.install_date, INTERVAL 7 DAY)
    THEN ic.installation_id
  END) as d7_retained,
  ROUND(
    COUNT(DISTINCT CASE 
      WHEN da.activity_date = DATE_ADD(ic.install_date, INTERVAL 1 DAY) 
      THEN ic.installation_id 
    END) * 100.0 / COUNT(DISTINCT ic.installation_id),
    1
  ) as d1_retention_pct,
  ROUND(
    COUNT(DISTINCT CASE 
      WHEN da.activity_date BETWEEN DATE_ADD(ic.install_date, INTERVAL 1 DAY) 
                                 AND DATE_ADD(ic.install_date, INTERVAL 7 DAY)
      THEN ic.installation_id
    END) * 100.0 / COUNT(DISTINCT ic.installation_id),
    1
  ) as d7_retention_pct
FROM installation_cohorts ic
LEFT JOIN daily_activity da ON ic.installation_id = da.installation_id
WHERE ic.install_date >= DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY)
GROUP BY ic.install_date
ORDER BY ic.install_date DESC
```

## Promotion Criteria

### Install Rate Gate
- **Minimum**: ≥10% of marketplace views result in installs
- **Measurement**: 7-day rolling average

### First-Run Completion Gate  
- **Minimum**: ≥60% of installs complete first workflow run
- **Measurement**: Within 48 hours of installation

### D7 Retention Tracking
- **Target**: ≥40% of installations active after 7 days
- **Required**: For long-term success assessment

## Dashboard Queries

### Real-time Funnel Performance
```sql
SELECT 
  'Last 24h' as period,
  COUNT(DISTINCT CASE WHEN event = 'marketplace_view' THEN session_id END) as views,
  COUNT(DISTINCT CASE WHEN event = 'install_success' THEN properties.installation_id END) as installs,
  COUNT(DISTINCT CASE WHEN event = 'first_run_completed' THEN properties.installation_id END) as first_runs,
  ROUND(
    COUNT(DISTINCT CASE WHEN event = 'install_success' THEN properties.installation_id END) * 100.0 /
    COUNT(DISTINCT CASE WHEN event = 'marketplace_view' THEN session_id END),
    1
  ) as install_rate_pct,
  ROUND(
    COUNT(DISTINCT CASE WHEN event = 'first_run_completed' THEN properties.installation_id END) * 100.0 /
    COUNT(DISTINCT CASE WHEN event = 'install_success' THEN properties.installation_id END),
    1  
  ) as first_run_completion_pct
FROM posthog_events
WHERE event IN ('marketplace_view', 'install_success', 'first_run_completed')
  AND properties.app_id = 'driftguard_checks'
  AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
```

### Installation Quality Metrics
```sql
SELECT
  AVG(properties.checks_run) as avg_checks_per_run,
  AVG(properties.issues_found) as avg_issues_found,
  AVG(properties.runtime_seconds) as avg_runtime_seconds,
  properties.repository_language,
  COUNT(*) as first_runs
FROM posthog_events
WHERE event = 'first_run_completed'
  AND properties.app_id = 'driftguard_checks'  
  AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY properties.repository_language
ORDER BY first_runs DESC
```
