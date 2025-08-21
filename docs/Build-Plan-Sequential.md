# MMTU Company Build Plan (Sequential)
_House order: Foundation → Framing → Roof → Utilities → Finishes. WIP=1. Smallest safe change. Always branch; never main._

## 0) Non-negotiables (backed by industry research)
- **Small batches & trunk habits** → faster feedback, lower merge pain.
- **Tiny PRs** (single concern, quick to review).
- **WIP limit = 1** to avoid context switching; queue everything else.
- **Lane control:** Protected branches with **required status checks**; Actions **`concurrency`** + `cancel-in-progress: true`.
- **Test Pyramid discipline:** minimal PR E2E; rely on lower-level tests for breadth.
- **Feature flags** for safe rollout/rollback; **ADRs** for decision memory.

## 1) Consensus Log
| # | Date | Decision | Why | Phase | Owner |
|---|------|----------|-----|-------|------|
| 1 | 2025-08-21 | Build strictly sequential with WIP=1 | Prevent drift & context switching | Global | Matt |

## 2) Phases & Acceptance Criteria
### A. Foundation — Repo & CI Guardrails
**Do:** (1) Protect `main` with exact **required check** names & 1+ approval; (2) Add Actions **`concurrency`** per branch with **`cancel-in-progress: true`**; (3) Harden `.gitignore`; enable secret scans (report-only).
**Done when:** Protected-branch rule blocks merges without green checks; new pushes cancel in-flight runs; security annotations appear on PRs.
**Rollback:** Temporarily relax the branch rule; adjust/remove `concurrency`; re-enable after fix.

### B. Framing — Team Rules & Claude Handoffs
**Do:** Add `/docs/prompts/` registry and the standard **Handoff Block** (Goal, Constraints, Files, Test/Run, Done, Rollback). Create `/docs/process/BUILD-QUEUE.md` (FIFO, priorities, WIP=1).
**Done when:** One complete handoff produces diff + commit + PR + runlog pointer.

### C. Roof — Security, Observability, Resilience
**Do:** Semgrep & Gitleaks (report-only), minimal uptime check, error logging standard.
**Done when:** PRs show scan reports; uptime ping visible; failure path documented.

### D. Utilities — Identity, Payments, Infra Glue
**Do:** Auth skeleton (OSS), Stripe dry-run, Supabase/Cloudflare config; commit `env.example` only (no secrets).
**Done when:** Local/dev flows pass; flags can disable features instantly.

### E. Finishes — Revenue Funnels (later)
**Do:** Pricing/checkout/membership, analytics, email capture.
**Done when:** Baselines measured; rollback playbooks ready.

## 3) Definition of Done (every change)
1) Tiny PR targeting one outcome; includes tests/docs.
2) Evidence artifacts: `.orchestrator/runlog.jsonl`, PR link, CI URL.
3) Rollback owner + exact revert path (flag/command/commit).

## 4) Decision Records (ADR)
Store under `/docs/adr/NNN-title.md` using Nygard/MADR style (Context → Decision → Consequences → Alternatives).

## 5) Test Strategy
- **PR Smoke (≤3m):** minimal critical-path E2E; Chromium-only.
- **Nightly Full:** cross-browser; flakes quarantined; not PR-blocking.
- Prefer integration/unit tests for breadth; E2E is the pyramid tip.

## 6) Branch & PR Discipline
- Branch name: `<area>/<desc>-YYYYMMDD`; never push to `main`.
- PR size: small CL ethos; one concern per PR.
- Concurrency group: `${{ github.workflow }}-${{ github.ref }}`; `cancel-in-progress: true`.

## 7) Rollback Playbook
- **Code:** `git revert <sha>` or revert PR in GitHub UI.
- **Flags:** Kill switch per feature in config.
- **Infra:** Disable affected workflow/job; re-run last green commit.