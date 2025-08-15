---
description: Deploy SOC2 Express with Stripe + Calendly integration
allowed-tools: [Bash(pnpm:*), Bash(wrangler:*), Read, Edit]
argument-hint: [domain]
model: sonnet-4
---

Deploy SOC2 Express to production with payment processing:

!`pnpm run deploy:soc2 {{domain}}`

This command:
1. Builds the Reports app with Next.js
2. Deploys to Cloudflare Pages 
3. Returns pages.dev URL for domain attachment
4. Validates payment and PDF generation