# Front Desk Module - Governance Policy

**Version:** 1.0  
**Effective:** 2025-08-22  
**Authority:** Solo Operator  
**Review Cycle:** 14 days  

## Mission Statement

"We help neighbors, one small fix at a time."

The Front Desk module shall maintain operational excellence while respecting marriage boundaries and preserving complete audit trails for all task management activities.

## Core Principles

### 1. Time Boundaries (Marriage Protection)
- **Daily work limit:** 8 hours maximum with automatic enforcement
- **Daily loop cap:** ≤20 minutes per execution
- **Wife check-ins:** Every 2 hours during work sessions
- **Overtime approval:** Requires explicit wife authorization code
- **Emergency shutdown:** Wife has unilateral stop authority

### 2. Data Integrity (Cryptographic Audit Trail)
- **Append-only logging:** No modification of historical records
- **Hash chaining:** SHA-256 cryptographic linking of all entries
- **Verification requirement:** Daily integrity checks before processing
- **Backup discipline:** Git commits after each significant change
- **Tamper detection:** Immediate failure on any chain breaks

### 3. Operational Rhythm (Sustainable Productivity)
- **Daily execution:** `daily_loop.sh` run ≥5 days per week
- **Weekly reporting:** Auto-generated summaries every 7 days
- **Triage limits:** Maximum 10 items processed per session
- **Processing cap:** ≤30 seconds per individual item
- **Evidence requirement:** All actions logged with timestamps

## Triage Classification System

### Standard Tags
- **`customer:`** - External stakeholder requests requiring response
- **`ops:`** - Infrastructure, reliability, and maintenance tasks  
- **`finance:`** - Revenue, costs, accounting, and business metrics
- **`idea:`** - Future features, experiments, and research items
- **`personal:`** - Non-business tasks affecting work capacity
- **`urgent:`** - Requires completion within 24 hours
- **`blocked:`** - Cannot proceed without external dependency

### Priority Assignment Rules
1. **Critical (≤4 hours):** Customer complaints, production outages
2. **High (≤24 hours):** Customer requests, security issues, urgent: tag
3. **Medium (≤7 days):** Standard ops:, finance:, development tasks
4. **Low (≤30 days):** idea:, personal:, future planning

### Processing Order
1. Verification failures (immediate stop)
2. Critical priority items
3. Customer-tagged items
4. Time-sensitive ops tasks
5. Regular business operations
6. Ideas and future planning

## Success Gates

### 14-Day Proof Period (2025-08-22 to 2025-09-05)

**Minimum Requirements:**
- **Usage compliance:** ≥12 of 14 days with daily_loop execution
- **Data quality:** Zero hash chain verification failures
- **Marriage protection:** No unauthorized overtime violations
- **Evidence preservation:** All sessions logged in marriage protection system
- **Reporting compliance:** Weekly summaries generated for weeks 1 and 2

**Success Metrics:**
- **Productivity:** ≥50 items processed through triage system
- **Quality:** ≥90% of triage entries result in actionable T-XXXX IDs
- **Efficiency:** Average daily loop execution ≤15 minutes
- **Reliability:** ≥95% uptime for integrity verification
- **Balance:** Wife satisfaction rating ≥7/10 (subjective assessment)

## Enforcement Mechanisms

### Automated Controls
- **Time limits:** Scripts refuse execution after caps exceeded
- **Hash verification:** System stops on integrity failures
- **Marriage protection:** Hard technical barriers to overtime
- **Backup automation:** Git commits integrated into daily flow
- **Report generation:** Weekly summaries auto-created

### Manual Overrides
- **Wife approval:** Emergency overtime authorization system
- **Integrity recovery:** Restore from git backup procedures
- **Policy exceptions:** Documented in decision log with rationale
- **System bypass:** Only for true emergencies with full audit trail
- **Process changes:** Require minimum 7-day notice period

## Violation Response

### Technical Failures
1. **Hash chain break:** Immediate stop, restore from backup, investigate cause
2. **Missing daily loop:** Log missed day, analyze pattern for systematic issues
3. **Time overruns:** Marriage protection intervention, review workload
4. **Git corruption:** Full repository integrity check and recovery

### Policy Violations  
1. **Unauthorized overtime:** Marriage protection discussion and policy review
2. **Triage limits exceeded:** Investigate scope creep and process discipline
3. **Missing reports:** Immediate generation and gap analysis
4. **Evidence gaps:** Backfill logs and strengthen verification procedures

## Review and Amendment

### Regular Review (Every 14 Days)
- Marriage protection effectiveness assessment
- Productivity metrics analysis vs. time investment
- Technical debt and system reliability evaluation
- Wife satisfaction and work-life balance review

### Emergency Review (Triggered Events)
- Multiple hash chain failures within 7 days
- Marriage protection system failure or bypass
- Productivity collapse (≤5 items processed in 7 days)
- External stakeholder complaints about responsiveness

### Amendment Process
1. **Proposal:** Written change with rationale and impact analysis
2. **Testing:** 7-day pilot period with detailed logging
3. **Review:** Assessment of pilot results and stakeholder feedback
4. **Implementation:** Updated policy with version increment
5. **Communication:** All stakeholders notified of changes

## Decision Log

All policy decisions, exceptions, and amendments shall be recorded in the primary `log.jsonl` with `type: "decision"` and complete rationale.

**Example:**
```json
{
  "ts": "2025-08-22T21:00:00Z",
  "type": "decision", 
  "decision": "reduced daily loop cap from 30 to 20 minutes",
  "rationale": "improving marriage protection effectiveness",
  "authority": "solo operator",
  "effective_date": "2025-08-23",
  "review_date": "2025-09-05"
}
```

---

**This policy serves as the foundation for sustainable, auditable, marriage-protected business operations.**