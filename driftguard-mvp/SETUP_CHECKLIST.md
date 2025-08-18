# ✅ DriftGuard Setup Checklist

**Quick 30-minute setup with copy-paste values!**

---

## 🚀 Choose Your Setup Method

### Option 1: Automated Setup (Recommended)
```bash
./quick-setup.sh
```
**Pros**: Guided, automated, validates everything
**Time**: 30 minutes with hand-holding

### Option 2: Manual Setup
```bash
# Follow the interactive wizard
open INTERACTIVE_SETUP_WIZARD.md
```
**Pros**: Full control, detailed explanations
**Time**: 30-45 minutes

### Option 3: Expert Mode
```bash
# Set secrets manually
./configure-secrets.sh
# Validate when done
pnpm run setup:validate
```
**Pros**: Fastest if you know what you're doing
**Time**: 15 minutes

---

## 📋 What You'll Create

| Service | What | Time | What You Get |
|---------|------|------|--------------|
| 🟢 **PostHog** | Analytics account | 5 min | `phc_...` API key |
| 🟦 **Supabase** | Database project | 10 min | Database URL + 2 keys |
| 🟡 **GitHub** | GitHub App | 10 min | App ID + webhook secret + private key |
| 🟣 **Stripe** | Payment account | 10 min | 2 API keys + webhook secret |

---

## 🔗 Quick Links

**If you want to jump straight to creating accounts:**

1. **PostHog**: [Sign up](https://app.posthog.com/signup) → [Get API key](https://app.posthog.com/project/settings)
2. **Supabase**: [Sign up](https://supabase.com/dashboard) → [Create project](https://supabase.com/dashboard/projects) → [Get keys](https://supabase.com/dashboard/project/_/settings/api)
3. **GitHub**: [Create app](https://github.com/settings/apps/new) → Get App ID, webhook secret, private key
4. **Stripe**: [Sign up](https://dashboard.stripe.com/register) → [Create products](https://dashboard.stripe.com/products) → [Setup webhook](https://dashboard.stripe.com/webhooks) → [Get keys](https://dashboard.stripe.com/apikeys)

---

## ⚡ Super Quick Start

**For the impatient:**

```bash
# 1. Run automated setup
./quick-setup.sh

# 2. Follow prompts to create accounts
# 3. Copy-paste the API keys when asked
# 4. Script handles the rest automatically

# Done! Your DriftGuard is live in 30 minutes.
```

---

## 🔍 What Each Service Does

### PostHog (Analytics)
- **Purpose**: Track usage, errors, performance
- **What you create**: Project called "DriftGuard MVP"
- **What you get**: API key starting with `phc_`
- **Used for**: Monitoring how people use DriftGuard

### Supabase (Database)
- **Purpose**: Store check run data and user info
- **What you create**: Database project called "driftguard-mvp"
- **What you get**: Project URL + anonymous key + service key
- **Used for**: Storing all the test results and analytics

### GitHub App
- **Purpose**: Post check runs to GitHub PRs
- **What you create**: App called "DriftGuard-YourUsername"
- **What you get**: App ID + webhook secret + private key file
- **Used for**: The core functionality - posting test results

### Stripe (Payments)
- **Purpose**: Handle subscriptions and payments
- **What you create**: 3 products ($5, $15, $25/month)
- **What you get**: Publishable key + secret key + webhook secret
- **Used for**: Monetizing DriftGuard with subscriptions

---

## 🆘 Troubleshooting

**"I'm getting 500 errors"**
```bash
# Check what's missing
pnpm run setup:validate
```

**"GitHub webhook isn't working"**
- Make sure webhook URL is: `https://driftguard-checks.mmtu.workers.dev/api/github/webhook`
- Check webhook secret matches what you set

**"Database connection failed"**
- Verify Supabase service key is correct
- Make sure you ran the SQL schema

**"Stripe payments not working"**
- Confirm webhook URL is: `https://driftguard-checks.mmtu.workers.dev/api/stripe/webhook`
- Check webhook secret matches

---

## ✨ After Setup

**Test your setup:**
```bash
# 1. Health check
curl https://driftguard-checks.mmtu.workers.dev/health

# 2. Open dashboard
open https://driftguard-checks.mmtu.workers.dev/dashboard

# 3. Install GitHub App on repositories
# Go to: https://github.com/apps/YOUR_APP_NAME/installations/new
```

**You're ready to:**
- 📊 Receive CTRF test reports
- ✅ Post check runs to GitHub PRs  
- 💳 Handle subscription payments
- 📈 Track usage analytics
- 🚀 Scale to production!

---

**Questions? Check the detailed guides:**
- `INTERACTIVE_SETUP_WIZARD.md` - Step-by-step with screenshots
- Individual setup guides for each service
- `validate-setup.js` - Verify everything works