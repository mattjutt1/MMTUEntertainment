---
description: Interactive one-time setup wizard (Stripe, Calendly, Supabase, PostHog, GitHub App)
allowed-tools: [Bash(node:*), Bash(wrangler:*), Read, Write, Edit]
argument-hint: [none]
model: opus-4
---

Execute one-time setup wizard to collect all secrets and configure environment:

!`node scripts/setup.js`

This command:
1. Collects all required secrets interactively
2. Creates .env file with proper variable names
3. Deploys secrets to Cloudflare Workers
4. Validates configuration