# Overlay Studio Pricing A/B v1 Metrics

## Overview
Multi-arm bandit pricing test: $19 control vs $9 variant vs $19 no-promo holdout.

## Events Schema

### price_arm_exposed (ONE-SHOT)
**Description**: User assigned to pricing arm (once per user per experiment)
**Frequency**: One-shot per user
```json
{
  "arm": "$19_control|$9_variant|$19_no_promo_holdout",
  "user_hash": "sha256_hash_of_user_id",
  "experiment_id": "overlay_pricing_ab_v1"
}
```

### checkout_started
**Description**: User begins checkout process
```json
{
  "arm": "$19_control|$9_variant|$19_no_promo_holdout", 
  "product_sku": "overlay-studio-pro",
  "price": 19.00
}
```

### purchase_completed
**Description**: Successful payment completion
```json
{
  "arm": "$19_control|$9_variant|$19_no_promo_holdout",
  "gross_amount": 19.00,
  "discount_amount": 0.00,
  "net_amount": 19.00,
  "currency": "USD",
  "order_id": "ord_abc123"
}
```

### support_ticket_opened
**Description**: Pricing-related support ticket
```json
{
  "tag": "pricing",
  "arm": "$19_control|$9_variant|$19_no_promo_holdout",
  "ticket_type": "refund_request|pricing_question|payment_issue"
}
```

## Key Metrics Calculation

### Revenue Per Visitor (RPV) by Arm
```sql
SELECT 
  properties.arm,
  COUNT(DISTINCT CASE WHEN event = 'price_arm_exposed' THEN properties.user_hash END) as visitors,
  COUNT(DISTINCT CASE WHEN event = 'purchase_completed' THEN properties.order_id END) as purchases,
  SUM(CASE WHEN event = 'purchase_completed' THEN properties.net_amount ELSE 0 END) as total_revenue,
  SUM(CASE WHEN event = 'purchase_completed' THEN properties.net_amount ELSE 0 END) * 1.0 / 
    COUNT(DISTINCT CASE WHEN event = 'price_arm_exposed' THEN properties.user_hash END) as rpv
FROM posthog_events
WHERE event IN ('price_arm_exposed', 'purchase_completed')
  AND properties.experiment_id = 'overlay_pricing_ab_v1'
  AND timestamp >= experiment_start_time
GROUP BY properties.arm
```

### Conversion Rate by Arm
```sql
SELECT
  properties.arm,
  COUNT(DISTINCT CASE WHEN event = 'price_arm_exposed' THEN properties.user_hash END) as exposed_users,
  COUNT(DISTINCT CASE WHEN event = 'purchase_completed' THEN properties.order_id END) as purchases,
  ROUND(
    COUNT(DISTINCT CASE WHEN event = 'purchase_completed' THEN properties.order_id END) * 100.0 /
    COUNT(DISTINCT CASE WHEN event = 'price_arm_exposed' THEN properties.user_hash END),
    2
  ) as conversion_rate_pct
FROM posthog_events  
WHERE event IN ('price_arm_exposed', 'purchase_completed')
  AND properties.experiment_id = 'overlay_pricing_ab_v1'
  AND timestamp >= experiment_start_time
GROUP BY properties.arm
```

### Statistical Significance Test
```sql
-- Chi-square test for conversion rate differences
WITH arm_stats AS (
  SELECT 
    properties.arm,
    COUNT(DISTINCT CASE WHEN event = 'price_arm_exposed' THEN properties.user_hash END) as visitors,
    COUNT(DISTINCT CASE WHEN event = 'purchase_completed' THEN properties.order_id END) as conversions
  FROM posthog_events
  WHERE event IN ('price_arm_exposed', 'purchase_completed')
    AND properties.experiment_id = 'overlay_pricing_ab_v1'
    AND timestamp >= experiment_start_time
  GROUP BY properties.arm
)
SELECT 
  arm,
  visitors,
  conversions,
  ROUND(conversions * 100.0 / visitors, 2) as conversion_rate_pct,
  -- Statistical significance calculation would require chi-square implementation
  CASE 
    WHEN visitors >= 1000 AND conversions >= 50 THEN 'READY_FOR_ANALYSIS'
    ELSE 'INSUFFICIENT_SAMPLE'
  END as sample_status
FROM arm_stats
```

## Decision Criteria

### Minimum Read Requirements
- **Visitors per arm**: ≥1,000
- **Purchases per arm**: ≥50

### Kill Criteria for $9 Variant
- **RPV Threshold**: <85% of $19 control arm
- **Action**: Remove $9 variant from test

### Follow-up Test Trigger
- **RPV Range**: $9 variant performs 95-105% of $19 control
- **Downstream Lift**: AND increases bundle attach rate
- **Next Test**: Schedule $14 mid-point pricing test

## Arm Allocation
- **$19_control**: 45% of traffic
- **$9_variant**: 45% of traffic  
- **$19_no_promo_holdout**: 10% of traffic (for measurement baseline)

## Dashboard Queries

### Real-time RPV Comparison
```sql
SELECT
  DATE(timestamp) as date,
  properties.arm,
  SUM(CASE WHEN event = 'purchase_completed' THEN properties.net_amount ELSE 0 END) /
    COUNT(DISTINCT CASE WHEN event = 'price_arm_exposed' THEN properties.user_hash END) as daily_rpv
FROM posthog_events
WHERE event IN ('price_arm_exposed', 'purchase_completed')
  AND properties.experiment_id = 'overlay_pricing_ab_v1'
  AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(timestamp), properties.arm
ORDER BY date DESC, properties.arm
```

### Support Impact by Arm
```sql
SELECT 
  properties.arm,
  COUNT(*) as tickets,
  properties.ticket_type,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY properties.arm), 2) as pct_of_arm_tickets
FROM posthog_events
WHERE event = 'support_ticket_opened' 
  AND properties.tag = 'pricing'
  AND timestamp >= experiment_start_time
GROUP BY properties.arm, properties.ticket_type
ORDER BY properties.arm, tickets DESC
```
