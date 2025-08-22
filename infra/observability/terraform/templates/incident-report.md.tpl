---
name: Incident Report
about: Report a production incident affecting portfolio products
title: '[INCIDENT] Brief description of the incident'
labels: ['incident', 'portfolio', 'priority-high']
assignees: []
---

## Incident Summary
**Product(s) Affected:** 
**Severity:** Critical / High / Medium / Low
**Status:** Investigating / Identified / Monitoring / Resolved
**Start Time:** YYYY-MM-DD HH:MM UTC
**End Time:** YYYY-MM-DD HH:MM UTC (if resolved)

## Impact Assessment
- **User Impact:** Describe how users are affected
- **Service Availability:** % uptime during incident  
- **Error Rate:** Current error rate vs normal
- **Performance Impact:** Response time degradation

## Timeline
- **[HH:MM UTC]** Initial detection/alert
- **[HH:MM UTC]** Investigation started
- **[HH:MM UTC]** Root cause identified
- **[HH:MM UTC]** Mitigation applied
- **[HH:MM UTC]** Service restored

## Root Cause
Detailed explanation of what caused the incident.

## Resolution Steps
1. Step taken to resolve
2. Another step
3. Final resolution

## DORA Metrics Impact
- **Mean Time to Recovery (MTTR):** XX minutes
- **Change Failure Rate:** Was this caused by a recent deployment? Y/N
- **Lead Time Impact:** How does this affect our deployment confidence?

## Prevention Measures
- [ ] Monitoring improvements
- [ ] Alerting threshold adjustments  
- [ ] Process improvements
- [ ] Code changes required
- [ ] Infrastructure changes

## Follow-up Actions
- [ ] Post-incident review scheduled
- [ ] Update runbooks
- [ ] Improve monitoring/alerting
- [ ] Update incident response procedures

## Communication
- **Internal notifications sent:** Y/N
- **Customer communications:** Y/N  
- **Status page updated:** Y/N

---
**Auto-assigned to:** Infrastructure Team
**Related Dashboard:** https://portfolio-dashboard.mmtu.app