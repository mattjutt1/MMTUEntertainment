# Post-Purchase Bundle v1 Metrics

## Overview
Security→Compliance bundle upsell experiment measuring attach rate and revenue impact.

## Events Schema

### bundle_offer_shown
**Description**: Bundle upsell displayed to user post-purchase
**Frequency**: Once per order
```json
{
  "order_id": "ord_abc123",
  "primary_sku": "security-audit-report",
  "segment": "security|compliance|quality", 
  "price": 199.00,
  "timer_seconds": 900,
  "variant_id": "bundle_v1_security"
}
```

### bundle_timer_started
**Description**: 15-minute timer starts counting down
```json
{
  "order_id": "ord_abc123",
  "timer_seconds": 900
}
```

### bundle_timer_expired  
**Description**: Timer reaches zero
```json
{
  "order_id": "ord_abc123", 
  "elapsed_seconds": 900
}
```

### bundle_offer_accepted
**Description**: User accepts bundle upsell
```json
{
  "order_id": "ord_abc123",
  "addl_revenue": 199.00,
  "bundle_sku": "5-report-security-bundle"
}
```

### bundle_offer_declined
**Description**: User declines or ignores upsell
```json
{
  "order_id": "ord_abc123",
  "decline_reason": "explicit|timeout|navigation"
}
```

### bundle_payment_error
**Description**: Payment processing fails for bundle
```json
{
  "order_id": "ord_abc123",
  "error_code": "card_declined",
  "payment_method": "visa_ending_4242"
}
```

### bundle_refund_within_7d
**Description**: Bundle refund within 7 days (quality signal)
```json
{
  "order_id": "ord_abc123",
  "refund_amount": 199.00,
  "days_after_purchase": 3
}
```

## Key Metrics Calculation

### Attach Rate
```sql
SELECT 
  COUNT(DISTINCT bundle_offer_accepted.order_id) * 100.0 / 
  COUNT(DISTINCT bundle_offer_shown.order_id) as attach_rate_pct
FROM bundle_offer_shown 
LEFT JOIN bundle_offer_accepted USING(order_id)
WHERE bundle_offer_shown.timestamp >= experiment_start_time
```

### Revenue Per Visitor (RPV) 
```sql  
SELECT 
  AVG(bundle_offer_accepted.addl_revenue) as avg_bundle_revenue
FROM bundle_offer_shown
LEFT JOIN bundle_offer_accepted USING(order_id)
WHERE bundle_offer_shown.timestamp >= experiment_start_time
```

### Refund Delta (Percentage Points)
```sql
SELECT 
  (bundle_refund_rate - baseline_refund_rate) as refund_delta_pp
WHERE
  bundle_refund_rate = (
    COUNT(bundle_refund_within_7d) * 100.0 / COUNT(bundle_offer_accepted)
  )
  AND baseline_refund_rate = 2.1 -- Historical baseline
```

## Promotion Gates

### 25% → 50%
- **Min Sample**: 200 eligible orders
- **Min Time**: 48 hours  
- **Attach Rate**: ≥3.0%
- **Refund Delta**: ≤+0.5 percentage points

### 50% → 100%  
- **Min Sample**: 500 eligible orders
- **Min Time**: 7 days
- **Attach Rate**: ≥3.0% 
- **Refund Delta**: ≤+0.5 percentage points

### Stop Loss
- **Trigger**: Attach rate <2.0% at 500 orders
- **Action**: Set experiment to 0%

## Dashboard Queries

### Real-time Attach Rate
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT CASE WHEN event = 'bundle_offer_shown' THEN order_id END) as offers_shown,
  COUNT(DISTINCT CASE WHEN event = 'bundle_offer_accepted' THEN order_id END) as offers_accepted,
  ROUND(
    COUNT(DISTINCT CASE WHEN event = 'bundle_offer_accepted' THEN order_id END) * 100.0 /
    COUNT(DISTINCT CASE WHEN event = 'bundle_offer_shown' THEN order_id END), 
    2
  ) as attach_rate_pct
FROM posthog_events 
WHERE event IN ('bundle_offer_shown', 'bundle_offer_accepted')
  AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(timestamp)
ORDER BY date DESC
```

### Revenue Impact
```sql
SELECT
  SUM(properties.addl_revenue) as total_bundle_revenue,
  COUNT(*) as total_bundles_sold,
  AVG(properties.addl_revenue) as avg_bundle_value
FROM posthog_events
WHERE event = 'bundle_offer_accepted'
  AND timestamp >= experiment_start_time
```
