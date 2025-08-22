# Weekly Reports Format

## Purpose
Weekly reports aggregate marriage protection data to show work patterns, compliance trends, and relationship impact metrics.

## Automated Generation
Reports are generated every Sunday by `daily_loop.sh` and on-demand via `make_weekly_report.py`.

## Standard Format

```markdown
# Weekly Report - YYYY-WW

**Period:** Monday YYYY-MM-DD to Sunday YYYY-MM-DD  
**Generated:** YYYY-MM-DD HH:MM:SS  

## Marriage Protection Summary
- **Total work hours:** XXh XXm
- **Daily average:** XXh XXm  
- **Days worked:** X/7
- **Overtime days:** X
- **Wife approval requests:** X
- **Emergency halts:** X

## Daily Breakdown
| Day | Hours | Status | Approvals | Notes |
|-----|-------|--------|-----------|-------|
| Mon | 7h 30m | ✅ Within limit | 0 | - |
| Tue | 8h 45m | ⚠️  Overtime | 1 | Wife approved extra hour |
| ... | ... | ... | ... | ... |

## Compliance Metrics
- **Daily limit adherence:** X/7 days (XX%)
- **Check-in compliance:** XX% (based on log entries)
- **Average work session:** XX minutes
- **Idle time percentage:** XX%

## Relationship Health Indicators
- **Spouse interventions:** X (approvals + halts)
- **Communication events:** X (check-ins logged)
- **Voluntary stops:** X (under 8h days)
- **Weekend work:** X hours

## Success Criteria Assessment
✅/❌ **Under 56h/week:** XXh (WHO recommended maximum)  
✅/❌ **≤2 overtime days:** X days  
✅/❌ **≥80% check-in compliance:** XX%  
✅/❌ **Zero marriage escalations:** X emergency halts  

## Recommendations
[Auto-generated based on patterns]
- Reduce Tuesday/Wednesday overtime trend
- Improve check-in consistency 
- Consider earlier work start times
- Schedule relationship time blocks

## Raw Data Summary
- **Total log events:** XXX
- **Marriage protection events:** XX
- **Triage events:** XX  
- **System uptime:** XX%
```

## Success Criteria

Weekly reports must demonstrate:

1. **Health Protection**: ≤56 hours/week total work time
2. **Marriage Priority**: ≤2 overtime days per week
3. **Communication**: ≥80% check-in compliance rate
4. **Relationship Respect**: Zero emergency wife shutdowns

## Data Sources

- `.ops/session/YYYY-MM-DD.state` - Daily work time tracking
- `front-desk/log.jsonl` - Complete event audit trail
- `reports/daily/YYYY-MM-DD.md` - Daily summaries
- `.ops/approvals/YYYY-MM-DD.code` - Approval code usage

## Quality Checks

Before report publication:
- Verify all 7 days have data or explanation
- Calculate percentages accurately 
- Include actionable recommendations
- Highlight concerning patterns
- Show positive relationship indicators

## Privacy Notes

Weekly reports focus on time patterns and compliance metrics, not work content. No task details or personal information included beyond marriage protection system interactions.