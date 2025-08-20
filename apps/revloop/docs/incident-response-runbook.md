# Revenue Loop Incident Response Runbook

**Version**: 1.0  
**Last Updated**: August 2025  
**Owner**: Revenue Operations Team

## Overview

This runbook provides step-by-step procedures for responding to Digital Andon alerts in the Revenue Loop monitoring system. Based on Toyota Production System (TPS) Jidoka principles for immediate problem detection and response.

## Alert Severity Levels

### 🔴 P1 - CRITICAL (STOP)
**SLA**: MTTA 15min, MTTR 1hr  
**Threshold**: >3σ deviation from baseline (configurable via `Z_STOP`)  
**Impact**: Revenue-affecting outage

**MTTA/MTTR Targets**:
- **Mean Time to Acknowledge (MTTA)**: 15 minutes
- **Mean Time to Repair (MTTR)**: 1 hour
- **Escalation**: Auto-escalate if MTTA exceeded

**Immediate Actions**:
1. **STOP** - Acknowledge alert within 15 minutes
2. **CONTAIN** - Assess revenue impact and user experience  
3. **COMMUNICATE** - Notify revenue team and on-call engineer
4. **INVESTIGATE** - Begin root cause analysis

### 🟡 P2 - HIGH (ATTENTION)  
**SLA**: MTTA 1hr, MTTR 4hr  
**Threshold**: >2σ deviation from baseline (configurable via `Z_ATTENTION`)  
**Impact**: Elevated drop-off rates, Western Electric rules triggered

**MTTA/MTTR Targets**:
- **Mean Time to Acknowledge (MTTA)**: 1 hour
- **Mean Time to Repair (MTTR)**: 4 hours
- **Escalation**: Escalate to P1 if MTTR exceeded or conditions worsen

**Immediate Actions**:
1. **MONITOR** - Enhanced observation for 30 minutes
2. **ASSESS** - Determine if escalation to P1 needed
3. **INVESTIGATE** - Review recent deployments and changes
4. **DOCUMENT** - Log findings for trend analysis

### 🟢 P3 - NORMAL
**SLA**: MTTA 4hr, MTTR 24hr  
**Threshold**: <2σ from baseline  
**Impact**: Normal operations, routine optimization opportunities

**MTTA/MTTR Targets**:
- **Mean Time to Acknowledge (MTTA)**: 4 hours (non-urgent)
- **Mean Time to Repair (MTTR)**: 24 hours (next business day)
- **Escalation**: Review in weekly operational meetings

**Actions**:
1. **CONTINUE** - Standard monitoring procedures
2. **OPTIMIZE** - Look for improvement opportunities
3. **BASELINE** - Update statistical baselines as needed

---

## Incident Response Procedures

### Phase 1: Initial Response (0-15 minutes)

#### For P1 Critical Alerts

1. **Acknowledge Alert** ⏱️ *Target: 5 minutes*
   ```bash
   # Log into Revenue Loop dashboard
   # Click "Acknowledge" on the active alert
   # This stops alert escalation
   ```

2. **Assess Scope** ⏱️ *Target: 10 minutes*
   - Which funnel stage is affected?
   - What is the current drop-off rate vs. baseline?
   - How many users are impacted?
   - What's the estimated revenue impact?

3. **Initial Communication** ⏱️ *Target: 15 minutes*
   ```
   Subject: P1 Revenue Alert - [Stage] Critical Issue
   
   SUMMARY: [Stage] experiencing [X]% drop-off rate (baseline: [Y]%)
   IMPACT: ~$[Z] estimated revenue loss per hour
   STATUS: Investigation in progress
   ETA: Update in 30 minutes
   
   Revenue Impact Dashboard: [link]
   Incident Channel: #revenue-incidents
   ```

#### For P2 High Alerts

1. **Monitor Trend** ⏱️ *Target: 30 minutes*
   - Track if anomaly is increasing, stable, or decreasing
   - Check correlated stages for impact spreading

2. **Check Recent Changes**
   - Review deployments in last 24 hours
   - Check A/B test configurations
   - Verify pricing/promotion changes
   - Confirm payment processor status

3. **Enhanced Monitoring**
   - Reduce sample size for faster detection
   - Enable real-time alerting for related stages

### Phase 2: Investigation (15-60 minutes)

#### Root Cause Analysis Checklist

**Technical Factors** 🔧
- [ ] Page load time performance
- [ ] API response times and error rates  
- [ ] Payment processor integration status
- [ ] CDN and infrastructure health
- [ ] Mobile vs desktop performance differences

**Product Factors** 📱
- [ ] Recent UI/UX changes or experiments
- [ ] Pricing displays and shipping costs
- [ ] Product availability and inventory
- [ ] Checkout form validation and errors

**External Factors** 🌐  
- [ ] Marketing campaign traffic spikes
- [ ] Social media mentions or viral content
- [ ] Competitor actions or market changes
- [ ] Seasonal or time-of-day variations

**Data Quality** 📊
- [ ] Tracking pixel functionality
- [ ] Event attribution accuracy
- [ ] Data pipeline health and latency
- [ ] Statistical baseline validity

#### Investigation Tools

1. **Revenue Loop Dashboard**
   ```
   URL: /apps/revloop/dashboard
   - Real-time funnel metrics
   - Alert details and timelines
   - Statistical control charts
   ```

2. **Analytics Platform**
   ```
   - User session recordings
   - Conversion funnel analysis  
   - Geographic and device breakdowns
   - Traffic source attribution
   ```

3. **Infrastructure Monitoring**
   ```
   - Application performance metrics
   - Database query performance
   - Payment gateway status pages
   - CDN cache hit rates
   ```

4. **Double-Entry Ledger Validation**
   ```typescript
   // Verify revenue impact calculations
   const revenueImpact = await validateRevenueTransaction([
     {
       accountCode: '6200', // Lost Revenue Expense
       accountType: AccountType.EXPENSE,
       amount: estimatedLoss,
       description: `Revenue loss - ${stage} anomaly`
     }
   ]);
   ```

### Phase 3: Mitigation (30-240 minutes)

#### Immediate Mitigation Options

**Traffic Routing** 🚦
- Redirect traffic from problematic pages
- Enable maintenance mode for affected stages
- Route payments through backup processor

**Quick Fixes** ⚡
- Rollback recent deployments
- Disable problematic A/B tests
- Update pricing/shipping displays
- Clear CDN cache for affected pages

**Customer Communication** 📢
- Add status banner for known issues
- Update checkout error messages
- Enable proactive customer support

#### Long-term Fixes

**Code Changes** 💻
- Performance optimizations
- Bug fixes and validation improvements
- Enhanced error handling and retry logic

**Infrastructure** 🏗️
- Scale server resources
- Update payment processor configuration
- Implement redundancy for critical services

**Process Improvements** 📋
- Update monitoring thresholds
- Enhance alerting rules  
- Improve deployment procedures

### Phase 4: Communication (Ongoing)

#### Stakeholder Updates

**Revenue Team** (Every 30 minutes during P1)
```
UPDATE: [Stage] incident - [timestamp]

CURRENT STATUS: [In progress/Mitigated/Resolved]
REVENUE IMPACT: $[amount] estimated loss
ROOT CAUSE: [Known/Under investigation]
NEXT STEPS: [Action items]
ETA: [Next update time]
```

**Engineering Team** (Every hour during P1)
```
TECHNICAL UPDATE: [Stage] performance issue

SYMPTOMS: [Drop-off rate, response times, error rates]
INVESTIGATION: [Findings so far]
MITIGATION: [Actions taken/planned]
MONITORING: [Enhanced alerting enabled]
```

**Executive Summary** (Daily for ongoing P1/P2)
```
REVENUE IMPACT SUMMARY - [Date]

INCIDENTS: [Count] active, [Count] resolved
REVENUE IMPACT: $[total] estimated loss
TOP ISSUES: [List of main problem areas]
IMPROVEMENTS: [Process/system enhancements made]
```

### Phase 5: Resolution (Variable)

#### Resolution Criteria

**P1 Critical**
- Drop-off rate returns to within 2σ of baseline
- No new related alerts for 2 hours
- Revenue impact eliminated or minimized
- Root cause identified and documented

**P2 High** 
- Anomaly trend stabilized or improving
- No escalation to P1 for 4 hours
- Mitigation actions proving effective

#### Post-Incident Actions

1. **Incident Report** ⏱️ *Target: 24 hours*
   ```markdown
   ## Incident Summary
   - Duration: [start] to [end]
   - Severity: [P1/P2]
   - Impact: $[amount] revenue loss, [users] affected
   
   ## Root Cause
   [Detailed analysis]
   
   ## Timeline
   [Key events and responses]
   
   ## Lessons Learned
   [Process improvements identified]
   
   ## Action Items
   [Preventive measures and owners]
   ```

2. **Update Monitoring** ⏱️ *Target: 1 week*
   - Adjust statistical baselines if needed
   - Add new alerting rules for similar issues
   - Enhance detection for identified failure modes

3. **Process Improvements** ⏱️ *Target: 2 weeks*
   - Update runbook based on learnings
   - Improve response procedures
   - Enhance monitoring coverage

---

## Contact Information

### Primary On-Call
- **Revenue Operations**: revenue-oncall@company.com
- **Engineering**: eng-oncall@company.com  
- **Product**: product-oncall@company.com

### Escalation Path
1. **L1**: On-call engineer (15 min response)
2. **L2**: Engineering manager (30 min response)
3. **L3**: VP Engineering (1 hr response)
4. **Executive**: CTO/CEO (2 hr response)

### Communication Channels
- **Incident Channel**: #revenue-incidents
- **Status Updates**: #revenue-alerts
- **Engineering**: #eng-incidents
- **Executive**: #exec-alerts

---

## SPC Configuration

### Environment Variables
Configure Statistical Process Control thresholds via environment variables:

```bash
# SPC Threshold Configuration
export Z_ATTENTION="2.0"    # Sigma level for attention alerts (default: 2.0)
export Z_STOP="3.0"         # Sigma level for critical alerts (default: 3.0)
export WE_RULES="true"      # Enable Western Electric rules (default: true)
```

### Western Electric Rules
When enabled (`WE_RULES=true`), the system applies enhanced sensitivity rules:

- **Rule 2**: 2 out of 3 consecutive points beyond 2σ from centerline
- **Early Detection**: Triggers P2 alerts before reaching `Z_ATTENTION` threshold
- **Production Tuning**: Can be disabled in high-noise environments

### Configuration Examples

**High Sensitivity (Development)**:
```bash
Z_ATTENTION="1.5"  # Lower threshold for development
Z_STOP="2.5"       # Lower critical threshold
WE_RULES="true"    # Enable early detection
```

**Standard Production**:
```bash
Z_ATTENTION="2.0"  # Standard 2-sigma attention
Z_STOP="3.0"       # Standard 3-sigma critical
WE_RULES="true"    # Balanced sensitivity
```

**Low Noise (High Traffic)**:
```bash
Z_ATTENTION="2.5"  # Higher threshold for noisy data
Z_STOP="3.5"       # Higher critical threshold
WE_RULES="false"   # Disable for high-traffic periods
```

---

## Tools and Resources

### Monitoring Dashboards
- **Revenue Loop Monitor**: `/apps/revloop/dashboard`
- **System Health**: `/monitoring/system`
- **Payment Gateway**: `[payment-provider-status]`

### Investigation Tools
- **User Session Recordings**: `[analytics-platform]`
- **Performance Monitoring**: `[apm-tool]`
- **Log Aggregation**: `[logging-platform]`

### Documentation
- **System Architecture**: `/docs/architecture.md`
- **Deployment Procedures**: `/docs/deployment.md`
- **Monitoring Configuration**: `/docs/monitoring.md`

---

## Quick Reference

### Alert Response Times
| Severity | Response | Resolution | Notification |
|----------|----------|------------|--------------|
| P1 Critical | 15 min | 1 hour | Immediate |
| P2 High | 1 hour | 4 hours | 30 minutes |
| P3 Normal | 4 hours | 24 hours | Daily summary |

### Statistical Thresholds (Configurable)
- **Normal**: <2σ from baseline
- **Attention**: ≥2σ from baseline (env: `Z_ATTENTION`, default: 2.0)
- **Critical**: ≥3σ from baseline (env: `Z_STOP`, default: 3.0)
- **Western Electric**: 2 of 3 points beyond 2σ (env: `WE_RULES`, default: true)

### MTTA/MTTR Performance Targets
| Severity | MTTA Target | MTTR Target | Escalation Trigger |
|----------|-------------|-------------|-------------------|
| P1 Critical | 15 minutes | 1 hour | Auto if MTTA exceeded |
| P2 High | 1 hour | 4 hours | Manual if MTTR exceeded |
| P3 Normal | 4 hours | 24 hours | Weekly review cycle |

### Revenue Impact Calculation
```
Hourly Revenue Loss = (Baseline Rate - Current Rate) × Hourly Traffic × AOV
Daily Revenue Loss = Hourly Loss × 24 × Duration Factor
```

### Emergency Contacts
- **Payment Processor**: [emergency-number]
- **CDN Provider**: [emergency-number]
- **Hosting Provider**: [emergency-number]

---

*This runbook is a living document. Update it based on incident learnings and system changes.*