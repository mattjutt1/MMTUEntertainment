# Security Triage – MMTU Entertainment

## Purpose
Make security findings actionable, low-noise, and business-aligned. This doc defines how we label, gate, fix, and close findings.

## Inputs & Gates (as configured)
- **Semgrep (SARIF, full):** Non-blocking upload → Security » Code scanning.
- **Semgrep (gate):** Blocks **High/Critical** findings **new since baseline** (`merge-base` with PR's base). 
- **Gitleaks (secrets):** Blocking; allowlist via `.gitleaks.toml`; `--redact` enabled.
- **Smoke (required check):** "Site E2E Smoke Tests (≤3min)" must pass.

## Labels & SLA
- `sec:critical` → Hotfix branch, patch < 24h, post-mortem required.
- `sec:high`     → Fix < 5 days or add **risk-acceptance.md** with justification & expiry.
- `sec:medium`   → Backlog; fix < 30 days or convert to rule-tuning if noise.
- `sec:low`      → Document and batch; fix opportunistically.

## Triage Workflow
1. **Confirm**: Reproduce locally (link to rule, file, line). 
2. **Classify**: Label severity; add `area/*` and `owner` (CODEOWNERS).
3. **Decide**:
   - Fix now (PR) **or** tune rule (**paths/pattern-not**) **or** temporary accept (documented).
4. **Verify**: CI green (Semgrep gate clean; smoke passes).
5. **Close**: Link PR; add short "fix note" in issue; if accepted, set expiry & recheck.

## Rule Tuning Policy
Prefer precise rule edits (e.g., `pattern-not`, scoped `paths`) over global ignores. Keep SARIF visibility; keep the gate narrow (High/Critical deltas).

## Evidence & Audits
- Semgrep SARIF in **Security » Code scanning**.
- Gitleaks logs attached to PR run (redacted).
- Branch protection rule: required check = **Site E2E Smoke Tests (≤3min)**.

## Rollback
Revert workflow/config PRs if tuning misfires. Required smoke gate remains unchanged.