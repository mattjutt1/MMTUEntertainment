---
description: Deploy DriftGuard GitHub App and prepare marketplace submission
allowed-tools: [Bash(pnpm:*), Bash(git:*), Read, Write, Edit]
argument-hint: [app-name]
model: sonnet-4
---

Create GitHub App and deploy DriftGuard Checks API:

!`pnpm run deploy:driftguard {{app-name}}`

This command:
1. Creates GitHub App via manifest flow
2. Deploys Checks API with rate limiting
3. Tests PR annotation batching
4. Prepares marketplace listing assets