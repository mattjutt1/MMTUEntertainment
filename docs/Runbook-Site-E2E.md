# Site E2E Smoke Tests Runbook

## Overview

**Status Check Name**: `Site E2E Smoke Tests (≤3min)`

**Purpose**: Validates critical revenue funnel paths and site functionality before merging. Runs Playwright tests with quarantine support for known brittle tests and optimized smoke configuration for ≤3-minute runtime.

## Configuration

### Playwright Smoke Config
- **File**: `products/site/playwright.smoke.ts`
- **Timeout**: 15s per test (reduced from 30s)
- **Expect Timeout**: 3s (reduced from 5s)  
- **Browser**: Chromium only
- **Retries**: 0 (deterministic for CI)
- **Artifacts**: JUnit XML + HTML report

### CI Integration
- **Workflow**: `.github/workflows/site-e2e-smoke.yml`
- **Command**: `pnpm test:e2e:site:smoke`
- **Job Timeout**: 3 minutes (hard limit)
- **Triggers**: PRs affecting `products/site/**` or workflow files

## Test Execution

### Local Development
```bash
# Full E2E suite (all browsers)
pnpm test:e2e:site

# Smoke tests (Chromium only, fast)
pnpm test:e2e:site:smoke

# Run specific test with debug
pnpm exec playwright test revenue-path.spec.ts --debug
```

### CI Behavior
```yaml
# Automatic execution on:
- Pull requests to main
- Changes to products/site/**
- Changes to .github/workflows/site-e2e-smoke.yml

# Skip conditions:
- Docs-only changes (*.md, .cspell.json, etc.)
- Non-site changes trigger failure (must add site changes)
```

## Test Organization

### Test Tags
- `@smoke`: Core revenue path tests (included in CI)
- `@quarantine`: Flaky tests (skipped in CI but visible)
- `@landing`: Homepage and core funnel tests

### Critical Test Scenarios
1. **Homepage Load**: Title, hero message, foundation-first messaging
2. **Contact Navigation**: Primary CTA functionality
3. **Revenue Funnel**: Critical conversion paths
4. **Performance**: Page load times under threshold

## Artifact Management

### CI Artifacts
- **JUnit XML**: `products/site/test-results/junit.xml`
- **HTML Report**: `products/site/playwright-report/**`
- **Retention**: 7 days
- **Upload**: Always (success or failure)

### Local Artifacts
```bash
# View HTML report after local run
npx playwright show-report products/site/playwright-report

# Clean artifacts
rm -rf products/site/test-results products/site/playwright-report
```

## Troubleshooting

### Common Failures

#### Timeout Issues
```bash
# Symptoms: Tests exceed 3-minute CI limit
# Solution: Check for @quarantine tags, optimize selectors

# Debug locally with extended timeout
TIMEOUT=60000 pnpm test:e2e:site:smoke
```

#### Flaky Tests
```bash
# Add @quarantine tag to skip in CI
test('flaky feature @quarantine', async ({ page }) => {
  // Test content - visible in reports but doesn't affect pass/fail
});

# Remove @quarantine after fixing root cause
```

#### Build Failures
```bash
# Check site build step
cd products/site && node build.js

# Verify served content
npx serve dist -p 4173
curl http://localhost:4173
```

#### Artifact Upload Issues
```bash
# Verify reporters in smoke config
grep -A5 "reporter:" products/site/playwright.smoke.ts

# Check CI step outputs
gh run view <run-id> --json
```

## Branch Protection Integration

### Required Status Check
- **Exact Name**: `Site E2E Smoke Tests (≤3min)`
- **Enforcement**: Blocks merge on failure
- **Bypass**: Admin override available for emergencies

### Success Criteria
1. All `@smoke` tests pass
2. Runtime ≤ 3 minutes
3. Artifacts uploaded successfully
4. No @quarantine tests affecting results

## Performance Targets

### Runtime Metrics
- **Target**: ≤ 3 minutes total
- **Typical**: 1m30s - 2m30s
- **Breakdown**: 
  - Setup: ~30s
  - Tests: ~60s
  - Artifacts: ~20s

### Quality Metrics
- **Pass Rate**: >95%
- **Flake Rate**: <5%
- **Coverage**: Critical revenue paths only

## Maintenance

### Weekly Review
```bash
# Analyze recent run performance
gh run list --workflow=site-e2e-smoke.yml --limit=20

# Check for @quarantine accumulation  
grep -r "@quarantine" products/site/e2e/
```

### Monthly Assessment
- **Un-quarantine stable tests**: Remove @quarantine tags after fixes
- **Performance optimization**: Review timeout settings
- **Coverage review**: Ensure critical paths remain covered

## Emergency Procedures

### CI Failure Response
1. **Check specific failure**: Review HTML report in artifacts
2. **Reproduce locally**: `pnpm test:e2e:site:smoke`
3. **Quick fix**: @quarantine problematic test if blocking critical merge
4. **Root cause**: Fix underlying issue and remove @quarantine

### Branch Protection Override
1. **Verify local functionality**: Ensure site works manually
2. **Document override**: Include business justification  
3. **Admin action**: Temporary protection disable
4. **Re-enable**: Restore protection after emergency merge

---

**Integration**: This runbook supports the Service Health Workflow (Cal.com + Zammad) and Site E2E gates maintaining 8+/10 operational health while enabling confident development velocity.