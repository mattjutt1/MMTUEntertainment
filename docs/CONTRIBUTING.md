# Contributing to Documentation

## Choose the right doc type (Diátaxis)
| If your change is… | Use | Why |
|---|---|---|
| Onboarding flow or end-to-end learning path | Tutorial | Guided learning, step-by-step |
| A specific task (enable X, configure Y) | How‑to | Goal- and outcome‑oriented |
| Facts (CLI flags, API fields, config keys) | Reference | Accurate, exhaustive, stable |
| Background, rationale, trade-offs, ADRs | Explanation | Understanding concepts & decisions |

## Writing rules
- Follow the Google developer documentation style guide for grammar, voice, and terminology.
- One purpose per page. Don’t mix how‑to steps with background theory.
- Prefer short sentences and active voice; show exact commands and expected outputs.
- Include Prerequisites, Steps, Verification, and Next sections in how‑tos.

## File naming
- kebab-case.md; start with a one‑sentence summary.
- Keep code blocks runnable; prefer copy‑paste commands.

## Review & CI
- Docs changes run spell and link checks on PRs.
- If link‑check flakes, add `docs/lychee.toml` allow‑lists vs. disabling the job.

## Weekly PPP
- Use `docs/templates/PPP.md` for team status (Progress, Plans, Problems).
