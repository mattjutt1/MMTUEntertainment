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
- **Web Server**: `node build.js && npx http-server dist`
- **Base URL**: `http://127.0.0.1:4173`
- **Timeout**: 60 seconds
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

## Maintenance

### Adding New Tests
1. Add tests to appropriate spec file
2. Follow existing patterns for page objects
3. Use `test.fixme()` for unstable/flaky tests
4. Include TODO comments with GitHub issue references

### Handling Test Failures

#### Smoke Test Failures (Critical)
```bash
# 1. Check GitHub Actions artifacts
# 2. Run locally to reproduce
pnpm test:e2e:site

# 3. Debug specific test
pnpm exec playwright test -c products/site/playwright.config.ts --debug

# 4. Fix and validate
pnpm test:e2e:site
```

#### Full Test Failures (Non-blocking)
- Review nightly failure notifications
- Download test artifacts for debugging
- Prioritize cross-browser compatibility issues
- Update tests for new features/changes

### Configuration Updates

#### Stripe Links
- **File**: `products/site/config/links.json`
- **Format**: Live Stripe URLs or `TODO_*` placeholders
- **Tests**: Automatically adapt based on configuration

#### Analytics
- **File**: `products/site/config/analytics.json`
- **Key**: `ga4_measurement_id`
- **Tests**: Skip tracking if TODO placeholder

#### CRM Integration
- **File**: `products/site/config/crm.json`
- **Key**: `form_endpoint`
- **Tests**: Fallback to demo mode if TODO placeholder

## Performance Targets

### Smoke Tests
- **Target**: ≤3 minutes total runtime
- **Current**: ~20 seconds (well under target)
- **Browser**: Chromium only for speed

### Full Tests
- **Target**: ≤30 minutes total runtime
- **Browsers**: Chromium + Firefox + WebKit
- **Parallelization**: Matrix strategy for cross-browser

## Troubleshooting

### Common Issues

#### "Page not found" errors
- Check if offer URLs have changed (`/offer/97`, `/offer/297`, `/offer/997`)
- Verify build script generates all required pages

#### Analytics tracking failures
- Verify `analytics.js` script loads
- Check `/config/analytics.json` configuration
- Ensure gtag mock setup in tests

#### CRM form failures
- Verify `crm.js` script loads
- Check `/config/crm.json` configuration
- Validate form endpoint accessibility

#### Playwright setup failures
```bash
# Reinstall browsers
pnpm exec playwright install --with-deps

# Clear cache
rm -rf node_modules/.cache/playwright
```

### Debugging Commands

```bash
# Run with debug UI
pnpm exec playwright test -c products/site/playwright.config.ts --debug

# Run specific test file
pnpm exec playwright test -c products/site/playwright.config.ts revenue-funnel.spec.ts

# Run in headed mode
pnpm exec playwright test -c products/site/playwright.config.ts --headed

# Generate test code
pnpm exec playwright codegen http://localhost:4173
```

## Branch Protection

### Required Status Check
The smoke test job should be configured as a required status check on the `main` branch:

```bash
# Command to add required status check (requires admin permissions)
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["smoke"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

### Protection Settings
- **Strict status checks**: Enabled
- **Required checks**: `smoke` job from `site-e2e-smoke` workflow
- **Admin enforcement**: Enabled
- **PR reviews**: 1 approving review required

## Monitoring & Alerts

### Success Metrics
- **Smoke test pass rate**: Target >99%
- **Smoke test runtime**: Target ≤3 minutes
- **Full test pass rate**: Target >95%
- **Cross-browser compatibility**: All browsers passing

### Alert Conditions
- Smoke test failures (immediate attention)
- Smoke test runtime >5 minutes
- Full test failures >2 consecutive days
- New cross-browser compatibility issues

## Security Considerations

### Test Data
- No real payment processing in tests
- Use Stripe test mode links only
- No sensitive data in test configurations
- Mock external services appropriately

### Dependency Management
- Playwright pinned to v1.54.2
- Regular security updates for test dependencies
- Isolated test environment (no production access)

## Links & Resources

- **Playwright Documentation**: https://playwright.dev/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Site Configuration**: `products/site/config/`
- **Test Files**: `products/site/e2e/`
- **Build Script**: `products/site/build.js`