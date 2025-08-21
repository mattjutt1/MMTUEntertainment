# Prompt – Claude Code (IDE)

> **Decision Filter:** All proposed changes must align with the mission & pillars (“We build software that fixes what truly hurts—so real people win.”)

## Operating Rules (short)
- Never push to `main`; propose PRs with diffs + commit messages + `gh` commands.
- Keep smoke ≤3 minutes; preserve CI job names required by branch protection.
- On failure: quote the exact failing log line and propose the smallest safe diff.
