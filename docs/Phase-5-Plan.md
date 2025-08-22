# Phase 5 Plan – Throughput & Velocity

## ✅ Current State (as of PR #54)
- Branch protection enforced: `Site E2E Smoke Tests (≤3min)`, `Prompt Contract Lint`
- Mixed-change logic fix verified with PRs #67–69
- Docs-only optimization tracked in Issue #71 (runtime ~56s)
- All stale PRs triaged and closed; repo is in a known-good state
- CI stabilized with ≤3min smoke lane

## 🎯 Phase 5 Goals
1. CI noise cleanup – convert failing scan jobs (Semgrep/GitLeaks) to non-blocking until fixed
2. Docs-only optimization – resolve Issue #71 for true ≤5s noop runtime
3. Throughput enhancements – add fast-track `ci:fast-lane` label to prioritize small PRs
4. Developer velocity – document guidance in this plan and streamline merge flow

## 📝 Action Items
- [ ] Update workflows to mark Semgrep/GitLeaks as `allow-failure`
- [ ] Implement docs-only noop optimization
- [ ] Verify docs-only PR shows SUCCESS ≤5s
- [ ] Ensure site/mixed PRs still run full E2E ≤3min
- [ ] Add ROI snapshot (CI minutes saved, latency reduced)
- [ ] Document developer guidance

## 📊 ROI
- Faster merges: reduced latency by eliminating noisy failures
- CI efficiency: ~53s saved per docs-only PR
- Developer throughput: more small PRs merged quickly, protecting ARR experiments

## 🛡️ Rollback Plan
- If docs-only noop fails → revert to current 56s path
- If security scans hide critical bug → restore as required within 24h
- If fast-track abused → enforce CODEOWNERS on label usage