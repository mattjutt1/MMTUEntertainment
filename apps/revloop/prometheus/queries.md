# RevLoop Andon Metrics - PromQL Query Reference

Essential PromQL queries for monitoring RevLoop Digital Andon system with SPC-based anomaly detection.

## Core Metrics

### Raw Counters
```promql
# STOP events by rule (critical threshold breaches)
revloop_andon_stop_total{rule="sigma"}
revloop_andon_stop_total{rule="weco"}

# ATTENTION events by rule (warning threshold breaches)  
revloop_andon_attention_total{rule="sigma"}
revloop_andon_attention_total{rule="weco"}
```

## Dashboard Queries

### Quick Panels (from user specification)

**STOP Events Last 5m (Stat Panel):**
```promql
# Pre-computed recording rule (preferred for performance)
revloop:stop_5m

# Raw query equivalent
sum(increase(revloop_andon_stop_total[5m])) by (rule)
```

**ATTENTION Events Last 10m (Bar Chart by Rule):**
```promql
# Pre-computed recording rule (preferred for performance)
revloop:attention_10m

# Raw query equivalent  
sum(increase(revloop_andon_attention_total[10m])) by (rule)
```

## Operational Queries

### Event Rates
```promql
# Current event rate per minute (1h window)
sum(rate(revloop_andon_stop_total[1h]) + rate(revloop_andon_attention_total[1h])) by (rule) * 60

# Combined event rate (all rules)
sum(rate(revloop_andon_stop_total[1h]) + rate(revloop_andon_attention_total[1h])) * 60
```

### Rule Effectiveness Analysis
```promql
# Western Electric rule effectiveness percentage
(
  sum(increase(revloop_andon_stop_total{rule="weco"}[1h])) +
  sum(increase(revloop_andon_attention_total{rule="weco"}[1h]))
) /
(
  sum(increase(revloop_andon_stop_total[1h])) +
  sum(increase(revloop_andon_attention_total[1h]))
)

# Sigma rule effectiveness percentage
(
  sum(increase(revloop_andon_stop_total{rule="sigma"}[1h])) +
  sum(increase(revloop_andon_attention_total{rule="sigma"}[1h]))
) /
(
  sum(increase(revloop_andon_stop_total[1h])) +
  sum(increase(revloop_andon_attention_total[1h]))
)
```

## Alert Queries (from alerting-rules.yml)

### P1 Critical Alerts
```promql
# STOP events detected (any value >0 is critical)
sum(increase(revloop_andon_stop_total[5m])) > 0

# Metrics missing (monitoring failure)
absent(revloop_andon_stop_total) or absent(revloop_andon_attention_total)
```

### P2 High Priority Alerts  
```promql
# ATTENTION surge detection (>5 events in 10m)
sum(increase(revloop_andon_attention_total[10m])) by (rule) > 5

# High false positive rate detection (>80% ATTENTION vs total)
(
  sum(increase(revloop_andon_attention_total[1h])) /
  (sum(increase(revloop_andon_attention_total[1h])) + sum(increase(revloop_andon_stop_total[1h])))
) > 0.8
```

### P3 Operational Insights
```promql
# Rule imbalance detection (>90% skew between sigma/weco)
abs(
  sum(increase(revloop_andon_attention_total{rule="sigma"}[4h])) -
  sum(increase(revloop_andon_attention_total{rule="weco"}[4h]))
) / 
sum(increase(revloop_andon_attention_total[4h])) > 0.9
```

## Troubleshooting Queries

### Service Health Validation
```promql
# Check if metrics are being collected
up{job="revloop-andon"}

# Time since last metric update
time() - (revloop_andon_stop_total + revloop_andon_attention_total > bool 0)
```

### Historical Analysis
```promql
# Events over time (1 week)
sum(increase(revloop_andon_stop_total[1d])) by (rule)
sum(increase(revloop_andon_attention_total[1d])) by (rule)

# Peak event rates by hour
sort_desc(
  sum(increase(revloop_andon_stop_total[1h])) by (rule) +
  sum(increase(revloop_andon_attention_total[1h])) by (rule)
)
```

## Recording Rules Reference

Pre-computed metrics for dashboard performance (see `recording-rules.yml`):

- `revloop:stop_5m` - STOP events last 5m by rule
- `revloop:attention_10m` - ATTENTION events last 10m by rule  
- `revloop:andon_events_5m` - Combined events last 5m by rule
- `revloop:andon_rate_1h` - Event rate per minute (1h window)
- `revloop:rule_effectiveness_5m` - WE rule effectiveness percentage

## Query Performance Tips

1. **Use Recording Rules**: Prefer `revloop:*` recording rules over raw queries for dashboards
2. **Bounded Time Ranges**: Use specific time ranges (5m, 10m, 1h) rather than open-ended
3. **Label Filtering**: Always filter by `rule` label when analyzing specific detection methods
4. **Rate vs Increase**: Use `increase()` for counters in dashboards, `rate()` for alerting
5. **Aggregation Order**: Aggregate first, then compute ratios for better performance

## Labels Reference

- `rule`: Detection method (`"sigma"` | `"weco"`)
- `service`: Always `"revloop"`
- `metric_type`: Recording rule classification (`"andon_event"`, `"andon_rate"`, `"rule_analysis"`)

## Integration Notes

- **Cardinality**: Limited to 2 rule values to prevent metric explosion
- **Retention**: Matches Prometheus retention policy (default 15 days)
- **Scrape Interval**: 30s default, configurable via `METRICS_PORT` environment
- **Feature Gated**: Metrics only active when `METRICS_PORT` environment variable set