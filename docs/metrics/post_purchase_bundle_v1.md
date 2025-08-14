# Post-Purchase Bundle V1 Metrics Specification

**Experiment**: `post_purchase_bundle_v1`  
**Type**: Revenue Optimization  
**Launch Date**: 2025-01-14  
**Status**: Active (25% ramp)

## Overview

Security compliance bundle upsell on Reports platform confirmation page. Offers DriftGuard + Posture analysis bundle at 25% discount during 15-minute timer window.

## Event Schema

All events include standard properties:
- `timestamp`: ISO 8601 string
- `app`: "reports" 
- `$current_url`: Full URL
- `$referrer`: Referring URL

### Primary Events

#### `bundle_offer_shown`
**Trigger**: Bundle upsell modal appears on confirmation page  
**Frequency**: Once per eligible order  

```json
{
  "order_id": "ord_abc123",
  "primary_sku": "security_posture_report", 
  "segment": "first_time_customer",
  "price": 74.25,
  "timer_seconds": 900,
  "variant_id": "bundle_v1_standard"
}
```

**Properties**:
- `order_id` (string): Unique order identifier
- `primary_sku` (string): Original product purchased
- `segment` (string): Customer segment (first_time_customer, returning, enterprise)
- `price` (number): Bundle price in USD
- `timer_seconds` (number): Countdown timer duration (default 900)
- `variant_id` (string): A/B test variant identifier

#### `bundle_timer_started`
**Trigger**: 15-minute countdown timer begins  
**Frequency**: Once per bundle offer

```json
{
  "order_id": "ord_abc123"
}
```

#### `bundle_timer_expired` 
**Trigger**: Timer reaches zero without action
**Frequency**: Once per bundle offer (if not accepted/declined first)

```json
{
  "order_id": "ord_abc123"
}
```

#### `bundle_offer_accepted`
**Trigger**: Customer clicks "Add Bundle" and completes payment
**Frequency**: Once per bundle offer

```json
{
  "order_id": "ord_abc123", 
  "addl_revenue": 74.25
}
```

**Properties**:
- `addl_revenue` (number): Additional revenue from bundle purchase

#### `bundle_offer_declined`
**Trigger**: Customer clicks "No Thanks" or closes modal  
**Frequency**: Once per bundle offer

```json
{
  "order_id": "ord_abc123"
}
```

#### `bundle_payment_error`
**Trigger**: Payment processing fails during bundle checkout
**Frequency**: Multiple (per retry)

```json
{
  "order_id": "ord_abc123",
  "code": "card_declined"
}
```

**Properties**:
- `code` (string): Error code from payment processor

#### `bundle_refund_within_7d`
**Trigger**: Bundle refund processed within 7 days
**Frequency**: Once per refund

```json
{
  "order_id": "ord_abc123",
  "amount": 74.25
}
```

## Derived Metrics

### Primary KPIs

**Attach Rate**
```sql
SELECT 
  COUNT(DISTINCT accepted.order_id) * 100.0 / COUNT(DISTINCT shown.order_id) as attach_rate_pct
FROM bundle_offer_shown shown
LEFT JOIN bundle_offer_accepted accepted ON shown.order_id = accepted.order_id
WHERE shown.timestamp >= '2025-01-14'
```

**Revenue Per Visitor (RPV) Delta**
```sql
WITH bundle_rpv AS (
  SELECT AVG(addl_revenue) as avg_bundle_revenue
  FROM bundle_offer_accepted
  WHERE timestamp >= '2025-01-14'
),
total_visitors AS (
  SELECT COUNT(DISTINCT order_id) as total_eligible
  FROM bundle_offer_shown
  WHERE timestamp >= '2025-01-14'  
)
SELECT 
  (bundle_rpv.avg_bundle_revenue * attach_rate) / 100 as rpv_delta
FROM bundle_rpv, total_visitors
```

**Refund Rate Delta**
```sql
WITH baseline AS (
  SELECT 2.5 as baseline_refund_rate_pct -- Historical average
),
bundle_refund_rate AS (
  SELECT 
    COUNT(DISTINCT refund.order_id) * 100.0 / COUNT(DISTINCT accepted.order_id) as bundle_refund_rate_pct
  FROM bundle_offer_accepted accepted
  LEFT JOIN bundle_refund_within_7d refund ON accepted.order_id = refund.order_id
  WHERE accepted.timestamp >= '2025-01-14'
)
SELECT 
  bundle_refund_rate_pct - baseline_refund_rate_pct as refund_delta
FROM baseline, bundle_refund_rate
```

### Secondary Metrics

**Time to Decision**
```sql
SELECT 
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY 
    EXTRACT(EPOCH FROM (decided.timestamp - shown.timestamp)) / 60
  ) as median_decision_time_minutes
FROM bundle_offer_shown shown
JOIN (
  SELECT order_id, timestamp FROM bundle_offer_accepted
  UNION ALL
  SELECT order_id, timestamp FROM bundle_offer_declined
) decided ON shown.order_id = decided.order_id
```

**Timer Completion Rate**
```sql
SELECT 
  COUNT(DISTINCT expired.order_id) * 100.0 / COUNT(DISTINCT shown.order_id) as timer_completion_pct
FROM bundle_offer_shown shown
LEFT JOIN bundle_timer_expired expired ON shown.order_id = expired.order_id
```

**Payment Error Rate**
```sql
SELECT 
  COUNT(DISTINCT error.order_id) * 100.0 / COUNT(DISTINCT accepted.order_id) as payment_error_pct
FROM bundle_offer_accepted accepted
LEFT JOIN bundle_payment_error error ON accepted.order_id = error.order_id
```

## Segmentation Analysis

**By Customer Segment**
```sql
SELECT 
  segment,
  COUNT(DISTINCT shown.order_id) as offers_shown,
  COUNT(DISTINCT accepted.order_id) as offers_accepted,
  COUNT(DISTINCT accepted.order_id) * 100.0 / COUNT(DISTINCT shown.order_id) as attach_rate_pct,
  AVG(accepted.addl_revenue) as avg_bundle_revenue
FROM bundle_offer_shown shown
LEFT JOIN bundle_offer_accepted accepted ON shown.order_id = accepted.order_id
GROUP BY segment
```

**By Primary SKU**
```sql
SELECT 
  primary_sku,
  COUNT(DISTINCT shown.order_id) as offers_shown,
  COUNT(DISTINCT accepted.order_id) * 100.0 / COUNT(DISTINCT shown.order_id) as attach_rate_pct
FROM bundle_offer_shown shown
LEFT JOIN bundle_offer_accepted accepted ON shown.order_id = accepted.order_id
GROUP BY primary_sku
ORDER BY attach_rate_pct DESC
```

## Promotion Gates

### Stage 25% → 50%
- **Minimum Sample**: 200 eligible orders
- **Minimum Duration**: 48 hours
- **Attach Rate**: ≥3.0%
- **Refund Delta**: ≤+0.5 percentage points
- **Confidence Level**: 90%

### Stage 50% → 100%
- **Minimum Sample**: 500 eligible orders  
- **Minimum Duration**: 168 hours (7 days)
- **Attach Rate**: ≥3.0%
- **Refund Delta**: ≤+0.5 percentage points
- **Confidence Level**: 95%

### Kill Switch
- **Condition**: Attach rate <2.0% AND sample ≥500
- **Action**: Set traffic to 0%
- **Alert**: #revenue-alerts, #engineering

## Sample Queries

### Daily Performance Dashboard
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT shown.order_id) as eligible_orders,
  COUNT(DISTINCT accepted.order_id) as bundles_sold,
  COUNT(DISTINCT accepted.order_id) * 100.0 / COUNT(DISTINCT shown.order_id) as attach_rate_pct,
  SUM(accepted.addl_revenue) as bundle_revenue,
  COUNT(DISTINCT error.order_id) as payment_errors
FROM bundle_offer_shown shown
LEFT JOIN bundle_offer_accepted accepted ON shown.order_id = accepted.order_id
LEFT JOIN bundle_payment_error error ON shown.order_id = error.order_id
WHERE shown.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC
```

### Funnel Analysis
```sql
SELECT 
  'Bundle Shown' as stage,
  COUNT(DISTINCT order_id) as count,
  100.0 as pct_of_shown
FROM bundle_offer_shown
WHERE timestamp >= '2025-01-14'

UNION ALL

SELECT 
  'Timer Started' as stage,
  COUNT(DISTINCT t.order_id) as count,
  COUNT(DISTINCT t.order_id) * 100.0 / s.total as pct_of_shown
FROM bundle_timer_started t
CROSS JOIN (SELECT COUNT(DISTINCT order_id) as total FROM bundle_offer_shown WHERE timestamp >= '2025-01-14') s
WHERE t.timestamp >= '2025-01-14'

UNION ALL

SELECT 
  'Bundle Accepted' as stage,
  COUNT(DISTINCT a.order_id) as count,
  COUNT(DISTINCT a.order_id) * 100.0 / s.total as pct_of_shown
FROM bundle_offer_accepted a
CROSS JOIN (SELECT COUNT(DISTINCT order_id) as total FROM bundle_offer_shown WHERE timestamp >= '2025-01-14') s
WHERE a.timestamp >= '2025-01-14'
```

## Privacy & Compliance

- **PII Handling**: No email addresses or personal info in events
- **Data Retention**: 90 days in PostHog, 1 year in audit logs
- **GDPR**: Events support user deletion via PostHog's GDPR deletion API
- **Identifiers**: Use hashed order IDs, avoid exposing internal user IDs

## Testing & Validation

### Event Validation Checklist
- [ ] All events fire in correct sequence during happy path
- [ ] Timer expiration works without JavaScript errors
- [ ] Payment errors are captured with appropriate codes
- [ ] One-time events (bundle_offer_shown) don't duplicate
- [ ] Bundle acceptance triggers both bundle_offer_accepted and payment completion

### Data Quality Checks
- [ ] No negative revenue values
- [ ] Timer seconds always 900 (15 minutes)
- [ ] Order IDs match primary purchase transaction
- [ ] Timestamps are sequential (shown → timer_started → accepted/declined)
- [ ] No orphaned timer events without corresponding bundle_offer_shown