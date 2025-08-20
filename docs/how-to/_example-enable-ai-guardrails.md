# How‑to: Enable the AI guardrails workflow on a repo

**Goal:** Ensure PRs are checked for basic prompt‑injection and allow‑list guardrails.

**Prerequisites**
- Repo admin access
- GitHub Actions enabled

**Steps**
1. Create `.github/workflows/ai-guardrails.yml` (see repo example).
2. Add the job name to branch protection required checks.
3. Open a PR; verify both required checks pass.

**Verification**
- PR shows **ai‑guardrails** ✅

**Next**
- Extend with red‑team tests when needed.
