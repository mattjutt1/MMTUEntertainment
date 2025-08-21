# Billing (Stripe on Cloudflare Pages/Functions)

This service implements a hardened membership lane using Stripe Checkout (subscriptions) and the Customer Portal on Cloudflare Pages Functions.

## Env vars (do not commit secrets)
- `STRIPE_SECRET_KEY` – set in Cloudflare Pages project (Production/Preview) and locally in `.dev.vars`
- `STRIPE_WEBHOOK_SECRET` – from `stripe listen`, set in `.dev.vars` for local and in Pages project for prod/previews
- Optional: `STRIPE_PUBLIC_KEY`, `STRIPE_ACCOUNT_COUNTRY`

If keys already exist in your environment, reuse them. Do not create duplicates.

## Local dev
- Install deps: `pnpm i`
- Run Pages Functions (if using wrangler): `wrangler pages dev --port 8788`
- Forward webhooks: `stripe listen --forward-to http://127.0.0.1:8788/api/billing/webhook`
- Run site smoke tests: `pnpm exec playwright test -c products/site/playwright.config.ts -g "billing smoke" --project=chromium --reporter=line`

## Smart retries & emails
Turn on Stripe Smart Retries and automated billing emails in the Stripe Dashboard. On `invoice.payment_failed`, we set an in‑app dunning flag so the UI can show an **Update payment method** banner that links to the Portal.

## Refund & cancel policy
See `/legal/BILLING.md` for the published terms (7‑day first‑time annual refund; monthly cancels at period end; prorated seat changes for Team).

## Migration notes (do not edit live Prices)
- Immutable Products/Prices: never mutate old. Add new prices and map accordingly.
- For bulk moves or plan changes, use `billing_cycle_anchor` and `proration_behavior`.
- Entitlements mapping lives in `services/billing/entitlements.ts` and should be driven by price/product metadata.

