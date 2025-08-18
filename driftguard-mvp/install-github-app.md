# 🚀 Install DriftGuard GitHub App

## Step 1: Click this link to install
👉 **[Install DriftGuard GitHub App](https://github.com/apps/driftguard-mmtu/installations/new)**

## Step 2: Select Repository
1. Choose "Only select repositories"
2. Select `mattjutt1/driftguard-test-repo`
3. Click **"Install"**

## Step 3: Verify Installation
After installation, you'll be redirected to a success page showing:
- ✅ Repository access granted
- ✅ Webhook configured
- ✅ Check runs permission enabled

## Step 4: Test Integration
Once installed, run this command to test:

```bash
curl -X POST https://driftguard-checks.mmtu.workers.dev/api/ctrf/ingest \
  -H 'Content-Type: application/json' \
  -d @test-official-ctrf.json
```

## Expected Result
- ✅ HTTP 200/201 response
- ✅ Check run appears on GitHub repository
- ✅ DriftGuard shows "1 check" instead of "0 checks"

---

**Installation URL**: https://github.com/apps/driftguard-mmtu/installations/new
**Test Repository**: https://github.com/mattjutt1/driftguard-test-repo