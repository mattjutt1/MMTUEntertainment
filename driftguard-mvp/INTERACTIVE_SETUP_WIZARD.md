# 🧙‍♂️ DriftGuard Interactive Setup Wizard

**Complete setup in 30 minutes with clickable links and copy-paste values!**

---

## 🎯 Setup Overview

You'll create accounts and get API keys from 4 services:
1. **PostHog** (5 mins) - Analytics tracking
2. **Supabase** (10 mins) - Database 
3. **GitHub** (10 mins) - GitHub App
4. **Stripe** (10 mins) - Payments

---

## 📊 Step 1: PostHog Analytics (5 minutes)

### 1.1 Create Account
👉 **[Click here to sign up for PostHog](https://app.posthog.com/signup)**

- Choose "PostHog Cloud" (free tier)
- Company name: Your company
- Project name: `DriftGuard MVP`

### 1.2 Get API Key
After signup, you'll see your dashboard:

👉 **[Go to Project Settings](https://app.posthog.com/project/settings)**

1. Click "Project API Key" in the left sidebar
2. Copy the key that starts with `phc_...`

### 1.3 Save Your PostHog Key
```bash
# Copy this key - you'll need it later
POSTHOG_API_KEY=phc_YOUR_ACTUAL_KEY_HERE
```

✅ **PostHog Complete!** 

---

## 🗄️ Step 2: Supabase Database (10 minutes)

### 2.1 Create Account
👉 **[Click here to sign up for Supabase](https://supabase.com/dashboard)**

- Sign up with GitHub (recommended)
- Free tier includes everything we need

### 2.2 Create Project
👉 **[Create New Project](https://supabase.com/dashboard/projects)**

1. Click "New Project"
2. **Name**: `driftguard-mvp`
3. **Database Password**: Generate a strong password (save it!)
4. **Region**: Choose closest to your users
5. Click "Create new project"

⏱️ **Wait 2-3 minutes for project to initialize**

### 2.3 Get Project Details
Once your project is ready:

👉 **[Go to Project Settings > API](https://supabase.com/dashboard/project/_/settings/api)**

Copy these 3 values:
```bash
# Project URL (starts with https://)
SUPABASE_URL=https://your-project-id.supabase.co

# Anonymous key (starts with eyJhbGciOi...)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role key (starts with eyJhbGciOi...) - KEEP THIS SECRET!
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.4 Set Up Database Schema
👉 **[Go to SQL Editor](https://supabase.com/dashboard/project/_/sql)**

1. Click "New Query"
2. Copy and paste this SQL:

```sql
-- DriftGuard Database Schema
CREATE TABLE IF NOT EXISTS check_runs (
    id BIGSERIAL PRIMARY KEY,
    github_check_run_id BIGINT NOT NULL UNIQUE,
    repository_owner TEXT NOT NULL,
    repository_name TEXT NOT NULL,
    commit_sha TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    tool_version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'skipped')),
    test_count INTEGER NOT NULL DEFAULT 0,
    passed_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    report_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_check_runs_repository ON check_runs(repository_owner, repository_name);
CREATE INDEX IF NOT EXISTS idx_check_runs_commit ON check_runs(commit_sha);
CREATE INDEX IF NOT EXISTS idx_check_runs_created ON check_runs(created_at);
CREATE INDEX IF NOT EXISTS idx_check_runs_status ON check_runs(status);

-- Enable security
ALTER TABLE check_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can do everything" ON check_runs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public read access" ON check_runs FOR SELECT USING (true);
```

3. Click "Run" to execute the schema

✅ **Supabase Complete!**

---

## 🔧 Step 3: GitHub App (10 minutes)

### 3.1 Create GitHub App
👉 **[Click here to create a GitHub App](https://github.com/settings/apps/new)**

Fill out the form:

**Basic Information:**
- **GitHub App name**: `DriftGuard-YourUsername` (must be unique)
- **Description**: `Universal GitHub check run aggregation service`
- **Homepage URL**: `https://driftguard-checks.mmtu.workers.dev`

**Webhook:**
- ✅ **Active**: Checked
- **Webhook URL**: `https://driftguard-checks.mmtu.workers.dev/api/github/webhook`
- **Webhook secret**: Generate a random string (save it!)

**Permissions:**
- **Repository permissions:**
  - ✅ **Checks**: Read & Write
  - ✅ **Contents**: Read
  - ✅ **Metadata**: Read
  - ✅ **Pull requests**: Read

**Events (Subscribe to events):**
- ✅ **Check run**
- ✅ **Check suite** 
- ✅ **Pull request**
- ✅ **Push**

**Where can this GitHub App be installed?**
- ✅ **Any account** (recommended for public use)

### 3.2 Get GitHub App Details
After creating the app:

1. **App ID**: Copy the numeric ID at the top
2. **Generate private key**: Click "Generate a private key" button
3. **Download the `.pem` file** - you'll need its contents

### 3.3 Save Your GitHub Values
```bash
# App ID (numeric)
GITHUB_APP_ID=123456

# Webhook secret (you created this)
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# Private key (contents of the .pem file)
GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
...entire contents of your .pem file...
-----END RSA PRIVATE KEY-----
```

✅ **GitHub App Complete!**

---

## 💳 Step 4: Stripe Payments (10 minutes)

### 4.1 Create Account
👉 **[Click here to sign up for Stripe](https://dashboard.stripe.com/register)**

- Business type: Individual or Company
- Complete the signup process
- **Switch to Test Mode** (toggle in top left)

### 4.2 Create Products
👉 **[Go to Products](https://dashboard.stripe.com/products)**

**Create Product 1:**
1. Click "+ Add Product"
2. **Name**: `DriftGuard Starter`
3. **Description**: `Essential GitHub check run aggregation for small teams`
4. **Pricing model**: Standard pricing
5. **Price**: `$5.00`
6. **Billing period**: Monthly
7. Click "Save product"

**Create Product 2:**
1. Click "+ Add Product" 
2. **Name**: `DriftGuard Pro`
3. **Description**: `Advanced GitHub check run aggregation with enhanced analytics`
4. **Price**: `$15.00`
5. **Billing period**: Monthly
6. Click "Save product"

**Create Product 3:**
1. Click "+ Add Product"
2. **Name**: `DriftGuard Enterprise` 
3. **Description**: `Enterprise-grade GitHub check run aggregation with premium support`
4. **Price**: `$25.00`
5. **Billing period**: Monthly
6. Click "Save product"

### 4.3 Set Up Webhook
👉 **[Go to Webhooks](https://dashboard.stripe.com/webhooks)**

1. Click "+ Add endpoint"
2. **Endpoint URL**: `https://driftguard-checks.mmtu.workers.dev/api/stripe/webhook`
3. **Events to send**: Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
4. Click "Add endpoint"
5. **Copy the signing secret** (`whsec_...`)

### 4.4 Get API Keys
👉 **[Go to API Keys](https://dashboard.stripe.com/apikeys)**

Copy both keys:
```bash
# Publishable key (safe for client-side)
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Secret key (keep this secure!)
STRIPE_SECRET_KEY=sk_test_...

# Webhook secret (from webhook setup)
STRIPE_WEBHOOK_SECRET=whsec_...
```

✅ **Stripe Complete!**

---

## ⚙️ Step 5: Configure DriftGuard (5 minutes)

### 5.1 Update Environment Variables
```bash
# Copy the template
cp wrangler.toml.template wrangler.toml

# Edit wrangler.toml and replace these values:
```

**Replace in `wrangler.toml`:**
```toml
[vars]
GITHUB_APP_ID = "YOUR_GITHUB_APP_ID"           # From Step 3
STRIPE_PUBLISHABLE_KEY = "YOUR_STRIPE_PUB_KEY" # From Step 4  
SUPABASE_URL = "YOUR_SUPABASE_URL"             # From Step 2
SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"   # From Step 2
POSTHOG_API_KEY = "YOUR_POSTHOG_API_KEY"       # From Step 1
```

### 5.2 Set Secrets
```bash
# Run the interactive secret setup
./configure-secrets.sh
```

When prompted, paste:
- **GITHUB_PRIVATE_KEY**: Contents of your `.pem` file
- **GITHUB_WEBHOOK_SECRET**: From Step 3
- **STRIPE_SECRET_KEY**: From Step 4
- **STRIPE_WEBHOOK_SECRET**: From Step 4
- **SUPABASE_SERVICE_KEY**: From Step 2

### 5.3 Validate Setup
```bash
# Check everything is configured correctly
pnpm run setup:validate
```

### 5.4 Deploy!
```bash
# Deploy your fully configured DriftGuard
pnpm run deploy
```

---

## 🎉 Step 6: Test Your Setup

### 6.1 Test Health Endpoint
```bash
curl https://driftguard-checks.mmtu.workers.dev/health
# Should return: {"status": "ok", "timestamp": "..."}
```

### 6.2 Test Dashboard
👉 **[Open Dashboard](https://driftguard-checks.mmtu.workers.dev/dashboard)**

You should see the DriftGuard dashboard load successfully!

### 6.3 Install GitHub App
👉 **[Install your GitHub App](https://github.com/apps/YOUR_APP_NAME/installations/new)**

1. Choose repositories to install on
2. Click "Install"

---

## 🚀 You're Done!

**Your DriftGuard MVP is now fully functional!**

**What you've built:**
- ✅ GitHub App that posts check runs
- ✅ CTRF ingestion endpoint
- ✅ Stripe subscription handling
- ✅ Analytics with PostHog
- ✅ Database with Supabase

**Next Steps:**
1. Test CTRF ingestion with your CI/CD
2. Set up payment flows
3. Monitor analytics in PostHog
4. Scale to production!

---

## 🆘 Need Help?

**Common Issues:**
- **500 errors**: Check secrets are set correctly with `pnpm run setup:validate`
- **GitHub webhook fails**: Verify webhook URL and secret
- **Database errors**: Check Supabase service key and schema
- **Payment errors**: Verify Stripe webhook secret

**Support:**
- Check the detailed setup guides in project directory
- Validate setup with `pnpm run setup:validate`
- Test endpoints with curl commands above