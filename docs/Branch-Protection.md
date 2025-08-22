# Branch Protection - MMTUEntertainment

## Required CI Checks

### Service Health Workflow Integration

**Status Check Name**: 
```
Stack Health Check / Services Health Check (core)
```

**Purpose**: Validates Business-Ops Stack health (Cal.com + Zammad) before merging infrastructure changes.

### Site E2E Smoke Tests

**Status Check Name**:
```
Site E2E Smoke Tests (≤3min)
```

**Purpose**: Validates critical revenue funnel paths and site functionality before merging. Uses optimized smoke configuration with Chromium-only testing, 15s test timeouts, and quarantine support for brittle tests.

**Configuration**:
- **Workflow**: `.github/workflows/site-e2e-smoke.yml`
- **Playwright Config**: `products/site/playwright.smoke.ts`
- **Command**: `pnpm test:e2e:site:smoke --grep @smoke`
- **Timeout**: 3 minutes (job-level hard limit)
- **Browser**: Chromium only for speed
- **Artifacts**: JUnit XML + HTML report (7-day retention)

**Evidence & Citations**: See `docs/Runbook-Site-E2E.md` for detailed configuration

## GitHub Configuration

### 1. Branch Protection Rules
Navigate to: `Repository → Settings → Branches → Add rule`

**Protected Branches**:
- `main`
- `develop` 
- `release/*`

### 2. Required Settings
- ✅ **Require a pull request before merging**
- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - ✅ **Status checks that are required:**
    - `Stack Health Check / Services Health Check (core)`
    - `Site E2E Smoke Tests (≤3min)`

### 3. Recommended Settings
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Include administrators** (enforce rules for admins)

## Workflow Triggers

### Automatic Execution
```yaml
pull_request:
  paths:
    - 'stacks/business-ops/docker-compose*.yml'
    - '.env*'
    - '.github/workflows/stack-health-check.yml'

schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
```

### Success Criteria
1. **Cal.com Health**: HTTP 200 from `/auth/setup?step=1`
2. **Zammad Health**: Rails server responding at port 3000
3. **Database Health**: PostgreSQL containers operational
4. **Timeout Compliance**: Execution <15 minutes

## Local Testing

### Before Creating PR
```bash
# From repo root
cd stacks/business-ops

# Start services
docker compose up -d
sleep 60

# Validate health
curl -f "http://localhost:8085/auth/setup?step=1"  # Cal.com
curl -f "http://localhost:8084"                   # Zammad

# Cleanup
docker compose down -v
```

### Quick Validation Script
Use: `scripts/run-stack-health-local.sh`

## Emergency Procedures

### Override Process
1. **Verify local functionality** using scripts above
2. **Check CI logs** for specific failure details
3. **Admin override** if business-critical (document in incident report)
4. **Fix underlying issue** and re-enable protection

### Incident Response
- **Escalation**: GitHub admins can temporarily disable protection
- **Documentation**: Record all overrides with justification
- **Recovery**: Re-enable protection immediately after emergency merge

## Monitoring & Metrics

### Target KPIs
- **CI Pass Rate**: >95%
- **Execution Time**: <15 minutes
- **False Positive Rate**: <5%
- **Stack Health Score**: 8+/10

### Review Schedule
- **Weekly**: Pass rate analysis
- **Monthly**: Failure pattern review
- **Quarterly**: Full protection rule audit

## Documentation Hierarchy

```
README.md → docs/Branch-Protection.md (this file)
├── docs/Project-Instructions.md (contributor guide)
├── docs/Checklist-PR-Smoke.md (pre-merge validation)
├── docs/Checklist-After-Merge.md (post-merge monitoring)
└── docs/best-practices/smoke-testing-references.md (research evidence)
```

---

**Implementation**: Research-backed CI health gate maintaining 8+/10 stack health while enabling confident development velocity.