# Follow-Up Tickets

## 1. Un-quarantine Brittle E2E Tests
**Priority**: Medium
**Labels**: testing, e2e, stability

### Description
Two E2E tests are currently quarantined (skipped but visible) to maintain CI stability:
- Test 1: [Specify quarantined test]
- Test 2: [Specify quarantined test]

### Acceptance Criteria
- [ ] Investigate root cause of flakiness
- [ ] Fix underlying issues (timing, selectors, data dependencies)
- [ ] Remove @quarantine tag after confirming stability
- [ ] Run tests 10x in CI to verify stability
- [ ] Ensure runtime stays under 3 minutes

### Technical Notes
- Quarantined tests are marked with `@quarantine` tag
- Tests are visible in reports but don't affect pass/fail status
- Focus on deterministic selectors and proper wait conditions

---

## 2. Fix Non-Gating Scan Job Failures
**Priority**: Low (non-blocking)
**Labels**: security, ci, technical-debt

### Description
Two scan jobs are currently failing but non-gating:
- `scan` job in ai-guardrails workflow
- `scan` job in mantra-scan workflow

### Current State
- Jobs fail consistently but don't block PR merge
- Status: UNSTABLE (not BLOCKED)
- Run IDs: 17146121443, 17146121884

### Acceptance Criteria
- [ ] Investigate scan failure root causes
- [ ] Fix security/compliance issues if legitimate
- [ ] Update scan configurations if false positives
- [ ] Make jobs pass consistently
- [ ] Consider making them gating once stable

### Technical Notes
- These jobs are intentionally non-gating during foundation phase
- Document any suppressions or exceptions clearly
- Consider gradual enforcement strategy

---

## Gate Verification Complete ✅

PR #44 successfully demonstrated:
1. Gate blocks merge when `Site E2E Smoke Tests (≤3min)` fails
2. Gate allows merge when tests pass (status: UNSTABLE due to non-gating failures)
3. Runtime: 2m2s (within 3-minute target)
4. Artifacts upload working on both success and failure