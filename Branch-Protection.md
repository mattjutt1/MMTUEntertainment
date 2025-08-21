# Branch Protection — `main`

This document mirrors GitHub’s Branch Protection settings so PR authors and reviewers know exactly which checks must pass.

## Required status checks (exact job names)
> Copy these **verbatim** from a green `main` run (Checks tab). Job names are case‑ and space‑sensitive.

### Security gates
- Security Gates / Dependency Review
- Security Gates / SAST – Semgrep
- Security Gates / Secrets – Gitleaks
- Security Gates / SBOM + SCA (Syft/Grype)

### Docs & site
- docs-checks / docs-ci
- site-e2e-smoke / chromium
- billing-smoke / smoke

## Merge queue & currency
- Enabled for `pull_request` and `merge_group` events on all lanes above.
- “Require branches to be up to date before merging”: **Enabled**.
- Workflow concurrency: `cancel-in-progress: true` on site, docs, and billing lanes.

## Guardrails & conventions
- **Do not rename CI jobs** without updating this file and the GitHub rule.
- Site smoke contract: **Chromium‑only**, ≤ 3 minutes, path‑scoped to `products/site/**`.
- For larger refactors, first open a “rename‑only” PR that updates: workflows → this doc → GitHub protection (in that order).

## Verification playbook
1. Open a no‑op PR (e.g., README whitespace) and confirm all checks above appear.
2. Confirm `site-e2e-smoke / chromium` completes ≤ 3 minutes with inline annotations.
3. After merging, verify the nightly full suite executed at 02:00 UTC and passed.
