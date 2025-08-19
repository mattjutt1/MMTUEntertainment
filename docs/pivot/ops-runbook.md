# Site E2E Testing Operations Runbook

## Overview

This runbook covers the operation and maintenance of E2E tests for the MMTU Entertainment revenue site (`products/site/`).

## Test Architecture

### Smoke Tests (PR Gates)
- **File**: `.github/workflows/site-e2e-smoke.yml`
- **Trigger**: PRs touching `products/site/**`
- **Runtime**: ≤3 minutes 
- **Browser**: Chromium only
- **Purpose**: Fast feedback for critical revenue paths

### Full Test Suite (Nightly/On-Demand)
- **File**: `.github/workflows/site-e2e-full.yml`
- **Trigger**: Nightly at 2 AM UTC + manual dispatch
- **Runtime**: ≤30 minutes
- **Browsers**: Chromium, Firefox, WebKit
- **Purpose**: Comprehensive cross-browser validation

## Test Configuration

### Playwright Config
- **Location**: `products/site/playwright.config.ts`
- **Web Server**: `cd products/site && node build.js --port 4173`
- **Base URL**: `http://localhost:4173`
- **Timeout**: 30 seconds
- **Reporters**: GitHub + line

### Test Scripts
```bash
# Run smoke tests locally
pnpm test:e2e:site

# Run specific browser
pnpm exec playwright test -c products/site/playwright.config.ts --project=chromium

# Run with live Stripe links (debug mode)
TEST_LIVE=1 pnpm test:e2e:site
```

## Test Coverage

### Revenue Funnel Tests (`revenue-funnel.spec.ts`)
- **$97 Offer**: Security Scan Starter (`/offer/97`)
- **$297 Offer**: Security Audit Pro (`/offer/297`) 
- **$997 Offer**: Security Transformation Complete (`/offer/997`)

**Key Validations**:
- Page rendering and content accuracy
- Analytics script integration (`analytics.js`)
- CRM form functionality (`crm.js`)
- Stripe button tracking and analytics
- Navigation consistency
- Configuration file loading (`/config/*.json`)

### Revenue Path Tests (`revenue-path.spec.ts`)
- **Legacy Tests**: Currently marked as `test.fixme()` due to URL mismatch
- **Home Page**: Main landing page validation
- **Contact Page**: Email links and offer cards
- **Legal Pages**: Terms and Privacy policy
- **Mobile Responsive**: Viewport testing at 375x667
- **SEO/Accessibility**: Meta tags and ARIA labels

## Runtime Metrics

### Current Performance
- **Smoke Tests**: 19.0 seconds (target: ≤3 minutes) ✅
- **Test Count**: 21 passed, 5 skipped
- **Browser**: Chromium only (smoke)
- **Stability**: All critical paths passing consistently

## Branch Protection Setup

After PR merge, configure the smoke test as a required status check:

1. **Run smoke job once to get exact name**:
```bash
gh workflow run "Site E2E Smoke" -r main
gh run watch
gh run view --json jobs -q '.jobs[].name'
```

2. **Add to branch protection**:
   - Settings → Rules → main ruleset → Require status checks
   - Add: `Site E2E Smoke / smoke` (exact job name)

## Troubleshooting

### Smoke Test Failures (Critical)
```bash
# 1. Run locally to reproduce
pnpm test:e2e:site

# 2. Debug with UI
pnpm exec playwright test -c products/site/playwright.config.ts --debug

# 3. Check build output
cd products/site && node build.js --port 4173
```

### Common Issues
- **Build failures**: Check `products/site/build.js` and config files
- **Port conflicts**: Build script uses port 4173
- **Missing files**: Verify all config files exist in `products/site/config/`