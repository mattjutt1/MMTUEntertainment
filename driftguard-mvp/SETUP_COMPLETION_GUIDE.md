# DriftGuard MVP Setup Completion Guide

## Current Status ✅

**Infrastructure Complete:**
- ✅ Cloudflare Workers deployed: `https://driftguard-checks.mmtu.workers.dev`
- ✅ KV namespace configured: `2df5e78ed8f14958a07a995e1c116bd0`
- ✅ D1 database with schema: `driftguard-prod`
- 📝 R2 bucket ready (needs dashboard activation)

**Setup Guides Created:**
- ✅ GitHub App setup guide: `GITHUB_APP_SETUP.md`
- ✅ Supabase setup guide: `SUPABASE_SETUP.md` + schema: `supabase-schema.sql`
- ✅ Stripe setup guide: `STRIPE_SETUP.md`
- ✅ PostHog setup guide: `POSTHOG_SETUP.md`

## Next Steps to Complete Configuration

### Step 1: Set Up External Services

Follow the setup guides in this order:

1. **PostHog** (5 mins) - Create account, get API key
2. **Supabase** (10 mins) - Create project, run schema, get credentials
3. **GitHub App** (15 mins) - Create app, set permissions, get keys
4. **Stripe** (15 mins) - Create products, set up webhooks, get API keys

### Step 2: Update Environment Variables

Copy the template and update with your actual values:

```bash
# Copy template to working file
cp wrangler.toml.template wrangler.toml

# Edit wrangler.toml and replace all YOUR_* placeholders with actual values
# See wrangler.toml.template for detailed instructions
```

### Step 3: Set Secrets

Use the provided script to configure all secrets interactively:

```bash
# Run the interactive secret configuration script
./configure-secrets.sh
```

**Manual alternative:**
```bash
# Set GitHub private key (paste contents of .pem file)
wrangler secret put GITHUB_PRIVATE_KEY

# Set GitHub webhook secret (from app setup)
wrangler secret put GITHUB_WEBHOOK_SECRET

# Set Stripe secret key
wrangler secret put STRIPE_SECRET_KEY

# Set Stripe webhook secret
wrangler secret put STRIPE_WEBHOOK_SECRET

# Set Supabase service key
wrangler secret put SUPABASE_SERVICE_KEY
```

### Step 3.5: Validate Setup

Verify everything is configured correctly:

```bash
# Validate all setup requirements
node validate-setup.js
```

### Step 4: Redeploy Worker

```bash
pnpm run deploy
```

### Step 5: Test Endpoints

After deployment, test:

```bash
# Health check (should work)
curl https://driftguard-checks.mmtu.workers.dev/health

# Dashboard (should load)
curl https://driftguard-checks.mmtu.workers.dev/dashboard

# CTRF endpoint (should validate)
curl -X POST https://driftguard-checks.mmtu.workers.dev/api/ctrf/ingest \
  -H "Content-Type: application/json" \
  -d '{"test": "validation"}'
```

## Expected Outcomes

**After completing setup:**
- ✅ All endpoints return 200 status codes (not 500 errors)
- ✅ Dashboard loads and shows Supabase connection
- ✅ CTRF ingestion validates requests and connects to GitHub
- ✅ Webhook endpoints respond to GitHub and Stripe events
- ✅ Analytics events appear in PostHog dashboard

## Troubleshooting

**Common Issues:**

1. **500 errors persist** → Check secrets are set correctly
2. **GitHub App webhook fails** → Verify permissions and webhook URL
3. **Supabase connection fails** → Check service key and database schema
4. **Stripe webhook signature fails** → Verify webhook secret matches

## Ready for Production

Once all tests pass:
1. Install GitHub App on target repositories
2. Set up Stripe live mode for real payments
3. Configure custom domain (optional)
4. Submit to GitHub Marketplace

The MVP is fully functional and ready for user onboarding!