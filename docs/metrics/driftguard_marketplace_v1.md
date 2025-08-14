# DriftGuard Marketplace V1 Metrics Specification

**Experiment**: `driftguard_marketplace_v1`  
**Type**: Marketplace Funnel  
**Launch Date**: 2025-01-14  
**Status**: Pending Launch

## Overview

DriftGuard GitHub Marketplace launch tracking. Measures full funnel from marketplace discovery through active usage, focusing on install conversion and first-run completion as leading indicators of product-market fit.

**Success Thresholds**:
- Install Rate: ≥10% of marketplace views
- First-Run Completion: ≥60% of installs
- D7 Retention: Track but no initial threshold

## Event Schema

All events include standard properties:
- `timestamp`: ISO 8601 string
- `app`: "driftguard"
- `$current_url`: Full URL when applicable
- `$referrer`: Referring URL

### Primary Events

#### `marketplace_view`
**Trigger**: User visits DriftGuard listing on GitHub Marketplace  
**Frequency**: Multiple per user (session-based deduplication recommended)

```json
{
  "source": "marketplace_search"
}
```

**Properties**:
- `source` (string): Traffic source - "marketplace_search" | "marketplace_browse" | "direct_link" | "github_notification" | "referral"

#### `install_clicked`
**Trigger**: User clicks "Install" button on marketplace listing  
**Frequency**: Multiple per user

```json
{
  "source": "marketplace_search"
}
```

**Properties**:
- `source` (string): Same as marketplace_view for attribution

#### `install_success`
**Trigger**: GitHub App installation completes successfully  
**Frequency**: Once per repository installation

```json
{
  "app_id": "driftguard_checks"
}
```

**Properties**:
- `app_id` (string): GitHub App identifier
- `installation_id` (number): GitHub installation ID (for support)
- `repository_count` (number): Number of repositories granted access
- `organization` (string): Organization name (hashed for privacy)

#### `first_run_completed`
**Trigger**: DriftGuard completes first workflow run on installed repository  
**Frequency**: Once per installation

```json
{
  "app_id": "driftguard_checks",
  "checks_run": 12,
  "issues_found": 3,
  "runtime_seconds": 45
}
```

**Properties**:
- `app_id` (string): GitHub App identifier  
- `checks_run` (number): Number of security checks executed
- `issues_found` (number): Number of issues detected
- `runtime_seconds` (number): Workflow execution time
- `repository_language` (string): Primary repository language

#### `config_saved`
**Trigger**: User customizes DriftGuard configuration file  
**Frequency**: Multiple per installation

```json
{
  "keyset": "security_level_high"
}
```

**Properties**:
- `keyset` (string): Configuration profile - "security_level_low" | "security_level_medium" | "security_level_high" | "custom"
- `checks_enabled` (number): Number of individual checks enabled
- `custom_rules` (boolean): Whether user added custom rules

### Retention Events

#### `weekly_active` 
**Trigger**: DriftGuard runs checks in past 7 days (automated tracking)  
**Frequency**: Weekly

```json
{
  "app_id": "driftguard_checks",
  "week_number": 1
}
```

#### `monthly_active`
**Trigger**: DriftGuard runs checks in past 30 days (automated tracking)  
**Frequency**: Monthly  

```json
{
  "app_id": "driftguard_checks", 
  "month_number": 1
}
```

## Derived Metrics

### Primary KPIs

**Install Conversion Rate**
```sql
SELECT 
  DATE(v.timestamp) as date,
  v.source,
  COUNT(DISTINCT v.user_id) as marketplace_views,
  COUNT(DISTINCT i.user_id) as installs,
  COUNT(DISTINCT i.user_id) * 100.0 / COUNT(DISTINCT v.user_id) as install_rate_pct
FROM marketplace_view v
LEFT JOIN install_success i ON v.user_id = i.user_id 
  AND i.timestamp >= v.timestamp 
  AND i.timestamp <= v.timestamp + INTERVAL '1 hour'
WHERE v.timestamp >= '2025-01-14'
GROUP BY DATE(v.timestamp), v.source
ORDER BY date DESC, install_rate_pct DESC
```

**First-Run Completion Rate**  
```sql
SELECT 
  DATE(i.timestamp) as install_date,
  COUNT(DISTINCT i.installation_id) as installs,
  COUNT(DISTINCT f.installation_id) as first_runs_completed,
  COUNT(DISTINCT f.installation_id) * 100.0 / COUNT(DISTINCT i.installation_id) as first_run_completion_rate_pct,
  AVG(f.runtime_seconds) as avg_first_run_time,
  AVG(f.issues_found) as avg_issues_per_repo
FROM install_success i
LEFT JOIN first_run_completed f ON i.installation_id = f.installation_id
  AND f.timestamp >= i.timestamp
  AND f.timestamp <= i.timestamp + INTERVAL '24 hours'
WHERE i.timestamp >= '2025-01-14'
GROUP BY DATE(i.timestamp)
ORDER BY install_date DESC
```

**D7 Retention Rate**
```sql
WITH install_cohorts AS (
  SELECT 
    installation_id,
    DATE(timestamp) as install_date,
    timestamp as install_timestamp
  FROM install_success
  WHERE timestamp >= '2025-01-14'
),
d7_activity AS (
  SELECT DISTINCT 
    installation_id,
    'active' as status
  FROM weekly_active w
  WHERE w.week_number = 1  -- First week after install
)
SELECT 
  i.install_date,
  COUNT(DISTINCT i.installation_id) as cohort_size,
  COUNT(DISTINCT d7.installation_id) as d7_active,
  COUNT(DISTINCT d7.installation_id) * 100.0 / COUNT(DISTINCT i.installation_id) as d7_retention_pct
FROM install_cohorts i
LEFT JOIN d7_activity d7 ON i.installation_id = d7.installation_id
WHERE i.install_date <= CURRENT_DATE - INTERVAL '7 days'
GROUP BY i.install_date
ORDER BY i.install_date DESC
```

### Funnel Analysis

**Complete Marketplace Funnel**
```sql
WITH funnel_stages AS (
  SELECT 
    'Marketplace View' as stage,
    1 as stage_order,
    COUNT(DISTINCT user_id) as users
  FROM marketplace_view
  WHERE timestamp >= '2025-01-14'
  
  UNION ALL
  
  SELECT 
    'Install Clicked' as stage,
    2 as stage_order,
    COUNT(DISTINCT user_id) as users  
  FROM install_clicked
  WHERE timestamp >= '2025-01-14'
  
  UNION ALL
  
  SELECT 
    'Install Success' as stage,
    3 as stage_order,
    COUNT(DISTINCT installation_id) as users
  FROM install_success
  WHERE timestamp >= '2025-01-14'
  
  UNION ALL
  
  SELECT 
    'First Run Completed' as stage,
    4 as stage_order,
    COUNT(DISTINCT installation_id) as users
  FROM first_run_completed
  WHERE timestamp >= '2025-01-14'
  
  UNION ALL
  
  SELECT 
    'Config Customized' as stage,
    5 as stage_order,
    COUNT(DISTINCT installation_id) as users
  FROM config_saved
  WHERE timestamp >= '2025-01-14'
)
SELECT 
  stage,
  users,
  users * 100.0 / FIRST_VALUE(users) OVER (ORDER BY stage_order) as pct_of_views,
  users * 100.0 / LAG(users) OVER (ORDER BY stage_order) as step_conversion_rate
FROM funnel_stages
ORDER BY stage_order
```

### Segmentation Analysis

**By Traffic Source**
```sql
SELECT 
  v.source,
  COUNT(DISTINCT v.user_id) as views,
  COUNT(DISTINCT i.user_id) as installs,
  COUNT(DISTINCT f.installation_id) as first_runs,
  COUNT(DISTINCT i.user_id) * 100.0 / COUNT(DISTINCT v.user_id) as install_rate,
  COUNT(DISTINCT f.installation_id) * 100.0 / COUNT(DISTINCT i.user_id) as first_run_rate
FROM marketplace_view v
LEFT JOIN install_success i ON v.user_id = i.user_id
LEFT JOIN first_run_completed f ON i.installation_id = f.installation_id
WHERE v.timestamp >= '2025-01-14'
GROUP BY v.source
ORDER BY install_rate DESC
```

**By Repository Language**
```sql
SELECT 
  f.repository_language,
  COUNT(DISTINCT f.installation_id) as installs_with_first_run,
  AVG(f.checks_run) as avg_checks_run,
  AVG(f.issues_found) as avg_issues_found,
  AVG(f.runtime_seconds) as avg_runtime_seconds,
  COUNT(DISTINCT w.installation_id) as d7_retained
FROM first_run_completed f
LEFT JOIN weekly_active w ON f.installation_id = w.installation_id AND w.week_number = 1
WHERE f.timestamp >= '2025-01-14'
GROUP BY f.repository_language
ORDER BY installs_with_first_run DESC
```

## Promotion Gates

### Marketplace Ready Criteria
- **Install Rate**: ≥10% of marketplace views
- **First-Run Completion**: ≥60% of installs  
- **Sample Size**: ≥100 marketplace views
- **Error Rate**: <5% install failures
- **Support Load**: <10% of installs create support tickets

### Success Metrics Tracking
- **Primary**: Install-to-first-run conversion rate
- **Secondary**: D7 retention, configuration customization rate
- **Leading Indicators**: Time to first run, issues found per repository

## Sample Queries

### Weekly Performance Report
```sql
SELECT 
  DATE_TRUNC('week', v.timestamp) as week,
  COUNT(DISTINCT v.user_id) as marketplace_views,
  COUNT(DISTINCT ic.user_id) as install_clicks,
  COUNT(DISTINCT i.user_id) as installs,
  COUNT(DISTINCT f.installation_id) as first_runs,
  COUNT(DISTINCT c.installation_id) as configs_saved,
  -- Conversion rates
  COUNT(DISTINCT ic.user_id) * 100.0 / COUNT(DISTINCT v.user_id) as click_rate,
  COUNT(DISTINCT i.user_id) * 100.0 / COUNT(DISTINCT v.user_id) as install_rate,
  COUNT(DISTINCT f.installation_id) * 100.0 / COUNT(DISTINCT i.user_id) as first_run_rate
FROM marketplace_view v
LEFT JOIN install_clicked ic ON v.user_id = ic.user_id
LEFT JOIN install_success i ON v.user_id = i.user_id  
LEFT JOIN first_run_completed f ON i.installation_id = f.installation_id
LEFT JOIN config_saved c ON i.installation_id = c.installation_id
WHERE v.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('week', v.timestamp)
ORDER BY week DESC
```

### Retention Cohort Analysis
```sql
WITH install_cohorts AS (
  SELECT 
    installation_id,
    DATE_TRUNC('week', timestamp) as install_week
  FROM install_success
  WHERE timestamp >= '2025-01-14'
),
retention_data AS (
  SELECT 
    c.install_week,
    c.installation_id,
    MAX(CASE WHEN w.week_number = 1 THEN 1 ELSE 0 END) as week_1,
    MAX(CASE WHEN w.week_number = 2 THEN 1 ELSE 0 END) as week_2,
    MAX(CASE WHEN w.week_number = 4 THEN 1 ELSE 0 END) as week_4
  FROM install_cohorts c
  LEFT JOIN weekly_active w ON c.installation_id = w.installation_id
  GROUP BY c.install_week, c.installation_id
)
SELECT 
  install_week,
  COUNT(installation_id) as cohort_size,
  AVG(week_1) * 100 as week_1_retention,
  AVG(week_2) * 100 as week_2_retention, 
  AVG(week_4) * 100 as week_4_retention
FROM retention_data
GROUP BY install_week
ORDER BY install_week DESC
```

## GitHub Marketplace Integration

### App Installation Webhook
```javascript
// GitHub webhook handler for app installations
app.post('/webhooks/installation', (req, res) => {
  const { action, installation, repositories } = req.body;
  
  if (action === 'created') {
    analytics.installSuccess('driftguard_checks', {
      installation_id: installation.id,
      repository_count: repositories.length,
      organization: hashString(installation.account.login)
    });
  }
});
```

### First Run Detection
```yaml
# GitHub Actions workflow trigger
name: DriftGuard Security Checks
on:
  push:
  pull_request:
  workflow_dispatch:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Track First Run
        if: github.run_number == 1
        run: |
          # Call analytics API
          curl -X POST "$ANALYTICS_ENDPOINT/first_run_completed" \
            -H "Content-Type: application/json" \
            -d '{
              "app_id": "driftguard_checks",
              "installation_id": "${{ github.event.installation.id }}",
              "checks_run": 12,
              "issues_found": 3,
              "runtime_seconds": 45,
              "repository_language": "${{ github.event.repository.language }}"
            }'
```

## Privacy & Compliance

- **GitHub Data**: Only use public installation/repository metadata
- **User Identity**: Hash organization names, no personal emails
- **Data Retention**: Follow GitHub's data retention policies
- **Repository Access**: Only track aggregate statistics, not code content
- **GDPR**: Support deletion via GitHub App uninstallation

## Testing & Validation

### Event Validation Checklist
- [ ] Marketplace views tracked on listing page load
- [ ] Install clicks captured before GitHub OAuth redirect
- [ ] Install success events fire on webhook receipt
- [ ] First run events fire on initial workflow completion
- [ ] Config events fire on .driftguard.yml changes

### Funnel Integrity Checks
- [ ] Event sequence validation (view → click → install → first_run)
- [ ] No duplicate installs for same user/repository combination  
- [ ] First run events only fire once per installation
- [ ] Retention events respect weekly/monthly boundaries
- [ ] Source attribution preserved throughout funnel