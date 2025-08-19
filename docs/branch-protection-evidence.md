# Branch Protection Evidence – MMTU Entertainment

**Generated**: 2025-08-19  
**Purpose**: Document smoke test gating implementation and verification  

---

## 🔒 Branch Protection Configuration – `main`

### Required Settings (Locked Configuration)
1) **Required status checks**:
   - `Site E2E Smoke Tests (≤3min)` ← **EXACT NAME** (prevents drift)
   - (Optional) enforce "Require branches to be up to date"
2) Do **NOT** allow bypassing required checks for write collaborators  
3) Keep "Do not require status checks on creation" **UNCHECKED** for strict gating

**Reason**: Required checks are name-sensitive; this prevents future "what was that string again?" issues.

> **Why other jobs can appear "skipped/neutral" but still comply**  
> - GitHub treats **successful/skipped/neutral** as acceptable for required checks under branch protection.  
> - We intentionally gate non-smoke jobs at the **job level** (not workflow level) so that docs-only PRs don't get blocked by "Pending" checks.  
> - References:  
>   - Skipped workflows can leave checks **Pending** (blocks merges). https://docs.github.com/actions/managing-workflow-runs/skipping-workflow-runs  
>   - Skipped jobs via `if:` report **Success** (don't block). https://docs.github.com/actions/using-jobs/using-conditions-to-control-job-execution  
>   - Branch protection accepts successful/skipped/neutral. https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches

### Re-verification Command
```bash
gh pr checks https://github.com/mattjutt1/MMTUEntertainment/pull/5 --json name,state,completedAt,startedAt
```
*JSON output makes audits/screenshots trivial for team use.*

**Example Output**: Shows `Site E2E Smoke Tests (≤3min)` with `"state":"SUCCESS"` confirming gate works.

### API Context Verification
```bash
gh api repos/mattjutt1/MMTUEntertainment/branches/main/protection/required_status_checks/contexts
```
**Current Output**: `["Site E2E Smoke Tests (≤3min)"]`
*Use for future diff comparison if required checks change.*

### Live JSON Output (2025-08-19)
```json
[
  {"completedAt":"2025-08-19T19:31:26Z","name":"Site E2E Smoke Tests (≤3min)","startedAt":"2025-08-19T19:30:23Z","state":"SUCCESS"},
  {"completedAt":"2025-08-19T19:30:41Z","name":"scan","startedAt":"2025-08-19T19:30:23Z","state":"SUCCESS"},
  {"completedAt":"2025-08-19T19:30:33Z","name":"scan","startedAt":"2025-08-19T19:30:20Z","state":"SUCCESS"},
  {"completedAt":"2025-08-19T19:30:34Z","name":"repo-audit","startedAt":"2025-08-19T19:30:22Z","state":"FAILURE"},
  {"completedAt":"2025-08-19T19:30:30Z","name":"scan","startedAt":"2025-08-19T19:30:23Z","state":"FAILURE"},
  {"completedAt":"2025-08-19T19:30:28Z","name":"scan","startedAt":"2025-08-19T19:30:20Z","state":"FAILURE"},
  {"completedAt":"2025-08-19T19:30:27Z","name":"lint","startedAt":"2025-08-19T19:30:20Z","state":"FAILURE"},
  {"completedAt":"2025-08-19T19:30:31Z","name":"lint","startedAt":"2025-08-19T19:30:23Z","state":"FAILURE"}
]
```
**Key**: Required check `Site E2E Smoke Tests (≤3min)` shows `SUCCESS` - merge gate functional.

---

## ✅ Implementation Evidence

### 1. Required Status Check Configuration
**Job Name**: `Site E2E Smoke Tests (≤3min)`
**Status**: ✅ PASS (1m3s execution time)

### 2. Branch Protection API Verification
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Site E2E Smoke Tests (≤3min)"],
    "checks": [
      {
        "context": "Site E2E Smoke Tests (≤3min)",
        "app_id": 15368
      }
    ]
  },
  "enforce_admins": {
    "enabled": false
  },
  "allow_force_pushes": {
    "enabled": false
  },
  "allow_deletions": {
    "enabled": false
  }
}
```

### 3. PR #5 Verification
**URL**: https://github.com/mattjutt1/MMTUEntertainment/pull/5
**Required Check Status**: ✅ PASS
**Other Checks**: Multiple failures (lint, repo-audit, scan) but not blocking merge
**Gate Status**: **ACTIVE** - Smoke test requirement enforced

---

## 🎯 Success Criteria Met

| Criteria | Status | Evidence |
|----------|--------|----------|
| Exact job name captured | ✅ | `Site E2E Smoke Tests (≤3min)` |
| Branch protection configured | ✅ | API shows required_status_checks active |
| Required check passing | ✅ | PR #5 shows PASS status |
| Merge gating active | ✅ | Protection rule enforced on main |
| Rollback documented | ✅ | Instructions below |

---

## 🔧 Rollback Instructions

### Option 1: Remove Required Check (UI)
1. Navigate to: Repository → Settings → Branches
2. Edit branch protection rule for `main`
3. Under "Require status checks to pass before merging"
4. Remove `Site E2E Smoke Tests (≤3min)` from required checks
5. Save changes

### Option 2: Remove Required Check (API)
```bash
# Remove all required status checks
gh api repos/mattjutt1/MMTUEntertainment/branches/main/protection/required_status_checks \
  --method DELETE

# Or update to remove specific check
gh api repos/mattjutt1/MMTUEntertainment/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":false,"contexts":[]}'
```

### Option 3: Revert Bad Merges
If a problematic merge occurs:
```bash
# Revert the specific commit
git revert <commit-hash> --mainline 1

# Or reset to known good state
git checkout main
git reset --hard <good-commit-hash>
git push --force-with-lease origin main  # CAUTION: Destructive
```

---

## 📊 ROI & Risk Assessment

### ROI Benefits
- **Quality Gate**: Prevents main regression due to broken smoke tests
- **Automation**: Reduces manual review burden for basic functionality
- **Confidence**: Ensures core user flows remain functional
- **Triage Reduction**: Prevents accumulation of broken functionality

### Risk Analysis
- **Risk Level**: LOW
- **Impact**: Repository settings only, no code changes
- **Reversibility**: Fully reversible via UI or API
- **Friction**: Minimal - smoke tests are fast (≤3min) and stable

### Current Status
**Decision**: ✅ Protection active with smoke test gating
**Rationale**: We have inventory + docs; gating prevents re-bloat and ensures future safety
**Next**: Monitor PR #5 merge behavior and adjust if needed

---

*Branch protection successfully configured. Main branch now requires smoke tests to pass before merge.*