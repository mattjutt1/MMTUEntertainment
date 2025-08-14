# Overlay Studio Pricing Experiment V1 Metrics

**Experiment**: `overlay_pricing_ab_v1`  
**Type**: Pricing Experiment  
**Launch Date**: 2025-01-14  
**Status**: Active (A/B testing)

## Overview

Multi-arm bandit pricing test for Overlay Studio Pro subscription. Tests $19 control vs $9 variant vs $19 no-promo holdout to optimize revenue per visitor while measuring downstream impact.

**Traffic Split**:
- $19 Control: 45%
- $9 Variant: 45% 
- $19 No-Promo Holdout: 10%

## Event Schema

All events include standard properties:
- `timestamp`: ISO 8601 string
- `app`: "stream-overlay-studio"
- `$current_url`: Full URL
- `$referrer`: Referring URL
- `arm`: Pricing arm identifier

### Primary Events

#### `price_arm_exposed` ⚠️ ONE-SHOT
**Trigger**: User assigned to pricing arm (session-based)  
**Frequency**: Once per session per user  
**Deduplication**: Via sessionStorage check

```json
{
  "arm": "$19_control",
  "session_id": "sess_abc123"
}
```

**Properties**:
- `arm` (string): Pricing arm - "$19_control" | "$9_variant" | "$19_no_promo_holdout"
- `session_id` (string): Optional session identifier for deduplication

**Implementation Note**: Uses sessionStorage to prevent duplicate events within same session.

#### `checkout_started`
**Trigger**: User clicks "Upgrade to Pro" or similar CTA  
**Frequency**: Multiple per session

```json
{
  "arm": "$19_control"
}
```

#### `purchase_completed`
**Trigger**: Successful payment processing  
**Frequency**: Once per successful purchase

```json
{
  "arm": "$19_control",
  "gross": 19.00,
  "discount": 0.00, 
  "net": 19.00,
  "currency": "USD"
}
```

**Properties**:
- `gross` (number): Pre-discount amount
- `discount` (number): Discount applied (if any)
- `net` (number): Final amount charged
- `currency` (string): Currency code (default "USD")

**Companion Event**: Also triggers `$revenue` event for PostHog revenue tracking:
```json
{
  "amount": 19.00,
  "currency": "USD", 
  "arm": "$19_control"
}
```

#### `support_ticket_opened`
**Trigger**: User creates support ticket tagged with pricing  
**Frequency**: Multiple per user

```json
{
  "tag": "pricing",
  "arm": "$19_control"
}
```

## Derived Metrics

### Primary KPIs

**Revenue Per Visitor (RPV) by Arm**
```sql
WITH arm_stats AS (
  SELECT 
    arm,
    COUNT(DISTINCT user_id) as unique_visitors,
    COUNT(DISTINCT p.user_id) as purchasers,
    SUM(p.net) as total_revenue
  FROM price_arm_exposed e
  LEFT JOIN purchase_completed p ON e.user_id = p.user_id AND e.arm = p.arm
  WHERE e.timestamp >= '2025-01-14'
  GROUP BY arm
)
SELECT 
  arm,
  unique_visitors,
  purchasers,
  total_revenue,
  COALESCE(total_revenue / NULLIF(unique_visitors, 0), 0) as rpv,
  COALESCE(purchasers * 100.0 / NULLIF(unique_visitors, 0), 0) as conversion_rate_pct
FROM arm_stats
ORDER BY rpv DESC
```

**Statistical Significance Test** 
```sql
WITH arm_performance AS (
  SELECT 
    arm,
    COUNT(*) as n,
    AVG(CASE WHEN p.user_id IS NOT NULL THEN p.net ELSE 0 END) as avg_revenue,
    STDDEV(CASE WHEN p.user_id IS NOT NULL THEN p.net ELSE 0 END) as stddev_revenue
  FROM price_arm_exposed e
  LEFT JOIN purchase_completed p ON e.user_id = p.user_id
  WHERE e.timestamp >= '2025-01-14'
  GROUP BY arm
),
control_stats AS (
  SELECT avg_revenue, stddev_revenue, n 
  FROM arm_performance 
  WHERE arm = '$19_control'
)
SELECT 
  a.arm,
  a.avg_revenue,
  c.avg_revenue as control_avg_revenue,
  (a.avg_revenue - c.avg_revenue) / c.avg_revenue * 100 as pct_difference,
  -- Simplified t-test (would use proper statistical functions in production)
  ABS(a.avg_revenue - c.avg_revenue) / SQRT((a.stddev_revenue^2/a.n) + (c.stddev_revenue^2/c.n)) as t_stat
FROM arm_performance a
CROSS JOIN control_stats c
WHERE a.arm != '$19_control'
```

### Secondary Metrics

**Conversion Funnel by Arm**
```sql
SELECT 
  e.arm,
  COUNT(DISTINCT e.user_id) as exposed_users,
  COUNT(DISTINCT c.user_id) as checkout_started,
  COUNT(DISTINCT p.user_id) as purchases_completed,
  COUNT(DISTINCT c.user_id) * 100.0 / COUNT(DISTINCT e.user_id) as checkout_start_rate,
  COUNT(DISTINCT p.user_id) * 100.0 / COUNT(DISTINCT c.user_id) as checkout_completion_rate,
  COUNT(DISTINCT p.user_id) * 100.0 / COUNT(DISTINCT e.user_id) as overall_conversion_rate
FROM price_arm_exposed e
LEFT JOIN checkout_started c ON e.user_id = c.user_id AND e.arm = c.arm
LEFT JOIN purchase_completed p ON e.user_id = p.user_id AND e.arm = p.arm
WHERE e.timestamp >= '2025-01-14'
GROUP BY e.arm
```

**Support Load by Arm**
```sql
SELECT 
  s.arm,
  COUNT(*) as support_tickets,
  COUNT(DISTINCT s.user_id) as unique_users_with_tickets,
  COUNT(*) * 100.0 / e.total_exposed as tickets_per_100_exposed
FROM support_ticket_opened s
JOIN (
  SELECT arm, COUNT(DISTINCT user_id) as total_exposed
  FROM price_arm_exposed
  WHERE timestamp >= '2025-01-14'
  GROUP BY arm
) e ON s.arm = e.arm
WHERE s.timestamp >= '2025-01-14' AND s.tag = 'pricing'
GROUP BY s.arm, e.total_exposed
```

## Decision Rules

### Variant Kill Condition
**Rule**: Kill $9 variant if RPV < 85% of $19 control  
**Minimum Sample**: 1,000 visitors per arm + 50 purchases per arm  
**Confidence Level**: 90%

```sql
WITH rpv_comparison AS (
  SELECT 
    (SELECT AVG(net) FROM price_arm_exposed e LEFT JOIN purchase_completed p ON e.user_id = p.user_id WHERE arm = '$9_variant') as variant_rpv,
    (SELECT AVG(net) FROM price_arm_exposed e LEFT JOIN purchase_completed p ON e.user_id = p.user_id WHERE arm = '$19_control') as control_rpv
)
SELECT 
  variant_rpv / control_rpv as rpv_ratio,
  CASE WHEN variant_rpv / control_rpv < 0.85 THEN 'KILL_VARIANT' ELSE 'CONTINUE' END as decision
FROM rpv_comparison
```

### Follow-up Test Condition  
**Rule**: If $9 variant RPV is 95-105% of control AND shows downstream attach lift, schedule $14 mid-point test

### Minimum Read Requirements
- **Sample Size**: ≥1,000 visitors per arm
- **Purchase Volume**: ≥50 purchases per arm  
- **Evaluation Frequency**: Every 24 hours
- **Statistical Power**: 80% to detect 15% RPV difference

## Sample Queries

### Daily Performance Dashboard
```sql
SELECT 
  DATE(e.timestamp) as date,
  e.arm,
  COUNT(DISTINCT e.user_id) as unique_visitors,
  COUNT(DISTINCT c.user_id) as checkout_starts, 
  COUNT(DISTINCT p.user_id) as purchases,
  SUM(p.net) as revenue,
  AVG(p.net) as avg_order_value,
  SUM(p.net) / COUNT(DISTINCT e.user_id) as rpv
FROM price_arm_exposed e
LEFT JOIN checkout_started c ON e.user_id = c.user_id AND e.arm = c.arm
LEFT JOIN purchase_completed p ON e.user_id = p.user_id AND e.arm = p.arm
WHERE e.timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(e.timestamp), e.arm
ORDER BY date DESC, arm
```

### Cumulative Results Since Launch
```sql
SELECT 
  e.arm,
  COUNT(DISTINCT e.user_id) as total_visitors,
  COUNT(DISTINCT p.user_id) as total_purchases,
  SUM(p.net) as total_revenue,
  COUNT(DISTINCT p.user_id) * 100.0 / COUNT(DISTINCT e.user_id) as conversion_rate_pct,
  SUM(p.net) / COUNT(DISTINCT e.user_id) as rpv,
  -- Confidence intervals (simplified)
  SUM(p.net) / COUNT(DISTINCT e.user_id) - (1.96 * SQRT(VAR(COALESCE(p.net, 0)) / COUNT(DISTINCT e.user_id))) as rpv_ci_lower,
  SUM(p.net) / COUNT(DISTINCT e.user_id) + (1.96 * SQRT(VAR(COALESCE(p.net, 0)) / COUNT(DISTINCT e.user_id))) as rpv_ci_upper
FROM price_arm_exposed e
LEFT JOIN purchase_completed p ON e.user_id = p.user_id AND e.arm = p.arm
WHERE e.timestamp >= '2025-01-14'
GROUP BY e.arm
ORDER BY rpv DESC
```

### Statistical Significance Monitor
```sql
WITH daily_arm_stats AS (
  SELECT 
    DATE(e.timestamp) as date,
    e.arm,
    COUNT(DISTINCT e.user_id) as visitors,
    COUNT(DISTINCT p.user_id) as purchases,
    SUM(p.net) as revenue
  FROM price_arm_exposed e
  LEFT JOIN purchase_completed p ON e.user_id = p.user_id AND e.arm = p.arm
  WHERE e.timestamp >= '2025-01-14'
  GROUP BY DATE(e.timestamp), e.arm
),
cumulative_stats AS (
  SELECT 
    date,
    arm,
    SUM(visitors) OVER (PARTITION BY arm ORDER BY date) as cum_visitors,
    SUM(purchases) OVER (PARTITION BY arm ORDER BY date) as cum_purchases,
    SUM(revenue) OVER (PARTITION BY arm ORDER BY date) as cum_revenue
  FROM daily_arm_stats
)
SELECT 
  date,
  arm,
  cum_visitors,
  cum_purchases, 
  cum_revenue,
  cum_revenue / cum_visitors as rpv,
  CASE 
    WHEN cum_visitors >= 1000 AND cum_purchases >= 50 THEN 'READY_FOR_DECISION'
    ELSE 'COLLECTING_DATA'
  END as sample_status
FROM cumulative_stats
WHERE date = CURRENT_DATE
ORDER BY arm
```

## A/B Testing Implementation

### Session-Based Bucketing
```javascript
// Client-side bucketing logic
function assignPricingArm(userId) {
  const hash = simpleHash(userId + 'overlay_pricing_v1');
  const bucket = hash % 100;
  
  if (bucket < 45) return '$19_control';
  if (bucket < 90) return '$9_variant'; 
  return '$19_no_promo_holdout';
}

// Track assignment (one-shot)
function trackArmExposure(arm) {
  const storageKey = `price_arm_exposed_${userId}`;
  if (!sessionStorage.getItem(storageKey)) {
    analytics.priceArmExposed(arm, userId);
    sessionStorage.setItem(storageKey, 'true');
  }
}
```

### Feature Flag Integration
```typescript
// Feature flag check
const pricingExperimentEnabled = await featureFlags.isEnabled('overlay_pricing_ab_v1_enabled');
if (pricingExperimentEnabled) {
  const arm = assignPricingArm(userId);
  trackArmExposure(arm);
  return getPricingForArm(arm);
} else {
  return getDefaultPricing();
}
```

## Privacy & Compliance

- **User Identification**: Hash-based bucketing, no PII in events
- **Data Retention**: 90 days in PostHog, 1 year in audit logs  
- **GDPR Compliance**: Support user deletion via PostHog APIs
- **Session Tracking**: Use sessionStorage, not persistent identifiers
- **Revenue Data**: Aggregated reporting only, no individual transaction details

## Testing & Validation

### Event Validation Checklist
- [ ] `price_arm_exposed` fires exactly once per session
- [ ] Checkout events fire on pricing CTA clicks
- [ ] Purchase events include correct arm and revenue amounts  
- [ ] Revenue events ($revenue) fire alongside purchase_completed
- [ ] Support tickets tagged with correct arm when related to pricing

### Experiment Integrity Checks  
- [ ] Traffic split maintains 45/45/10 distribution (±2%)
- [ ] No arm leakage (users switching arms within session)
- [ ] Consistent arm assignment across page reloads
- [ ] Correct pricing display matches assigned arm
- [ ] Session storage prevents duplicate exposures