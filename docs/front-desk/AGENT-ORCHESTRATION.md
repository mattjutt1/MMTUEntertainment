# Agent Orchestration (ChatGPT Agent ↔ Claude Code)

- ChatGPT Agent handles GitHub web UI & admin consoles; Claude Code handles multi-file repo edits via PR.
- Handoff → Claude: post a "/claude-command v1 …" packet as a PR comment and tag @claude.
- Return ← Agent: Claude must comment a "/agent-resume v1" packet with status, PR URL, summary, next actions, artifacts.
- One PR per module; small diffs; rollback notes required.