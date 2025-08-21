# Branch Protection Setup for Business-Ops Stack

## Required Status Checks

Add these status checks to your branch protection rules in GitHub:

### Primary Status Check
```
Stack Health Check / Services Health Check (core)
```

This check validates:
- ✅ Cal.com health endpoint responding (200 OK)  
- ✅ Zammad multi-service architecture functional
- ✅ All database dependencies healthy
- ✅ Service startup within timeout limits

## GitHub Branch Protection Configuration

### 1. Navigate to Branch Protection
```
Repository → Settings → Branches → Add rule (or edit existing)
```

### 2. Branch Name Pattern
```
main
develop
release/*
```

### 3. Required Settings
- ✅ **Require a pull request before merging**
- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - ✅ **Status checks that are required:**
    - `Stack Health Check / Services Health Check (core)`

### 4. Additional Recommended Settings
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Include administrators** (enforce rules for admins)

## Triggering Conditions

The stack health check runs automatically on:

### Pull Requests
```yaml
paths:
  - 'stacks/business-ops/docker-compose*.yml'
  - 'stacks/business-ops/.env*'
  - '.github/workflows/stack-health-check.yml'
```

### Direct Pushes
```yaml
branches: [main, develop]
paths:
  - 'stacks/business-ops/docker-compose*.yml'
  - 'stacks/business-ops/.env*'
```

### Scheduled Monitoring
```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
```

## Status Check Details

### Success Criteria
1. **Service Startup**: All containers start within 15-minute timeout
2. **Database Health**: PostgreSQL containers respond to `pg_isready`
3. **Cal.com Health**: HTTP 200 from `/auth/setup?step=1`
4. **Zammad Health**: Valid JSON from Rails API `/api/v1/getting_started`

### Failure Scenarios
- Container startup timeout (>15 minutes)
- Database connection failures
- Health endpoint non-responsive
- Invalid response format from APIs

## Local Testing

### Before Creating PR
```bash
cd stacks/business-ops

# Start stack
docker compose --profile core up -d

# Wait for initialization
sleep 60

# Test health endpoints
curl -f "http://localhost:8085/auth/setup?step=1"

# Get Zammad Rails IP and test
RAILS_IP=$(docker inspect business-ops_zammad-railsserver_1 | jq -r '.[0].NetworkSettings.Networks."business-ops-network".IPAddress')
curl -f "http://$RAILS_IP:3000/api/v1/getting_started"

# Cleanup
docker compose down -v
```

### Quick Validation Script
```bash
#!/bin/bash
set -e

echo "🧪 Testing stack health locally..."

cd stacks/business-ops
docker compose --profile core up -d
sleep 60

echo "Testing Cal.com..."
curl -f -s "http://localhost:8085/auth/setup?step=1" > /dev/null && echo "✅ Cal.com OK"

echo "Testing Zammad..."
RAILS_IP=$(docker inspect business-ops_zammad-railsserver_1 | jq -r '.[0].NetworkSettings.Networks."business-ops-network".IPAddress')
curl -f -s "http://$RAILS_IP:3000/api/v1/getting_started" | jq -e '.setup_done != null' > /dev/null && echo "✅ Zammad OK"

echo "🎉 Local health check passed!"
docker compose down -v
```

## Monitoring Dashboard

### GitHub Actions Status
Monitor at: `https://github.com/[org]/[repo]/actions/workflows/stack-health-check.yml`

### Key Metrics to Watch
- **Pass Rate**: Target >95%
- **Execution Time**: Target <15 minutes
- **Failure Patterns**: Identify recurring issues

### Alert Conditions
- 2+ consecutive failures
- Execution time >20 minutes
- Cal.com or Zammad endpoint failures

## Rollback Procedure

### If CI Blocks Valid Changes
1. **Verify local functionality** using script above
2. **Check CI logs** for specific failure points
3. **Temporary bypass** (admin override) if business-critical
4. **Fix underlying issue** and re-enable protection

### Emergency Override
GitHub admins can temporarily:
1. Disable branch protection
2. Merge critical fixes
3. Re-enable protection immediately after

⚠️ **Document all overrides** in incident reports.

## ROI Analysis

### Benefits
- **Prevent regressions**: Catch service breakages before merge
- **Increase confidence**: Validate stack health automatically  
- **Reduce downtime**: Early detection of configuration issues
- **Documentation**: Living proof that endpoints work

### Costs
- **CI time**: ~15 minutes per check
- **Complexity**: Additional maintenance overhead
- **False positives**: Occasional flaky test failures

### Risk Mitigation
- **Timeout protection**: 15-minute maximum execution
- **Retry logic**: Built-in retry for startup delays
- **Detailed logging**: Full container logs on failure
- **Manual override**: Admin bypass for emergencies

## Success Metrics

### Target KPIs
- **CI Pass Rate**: >95%
- **Mean Time to Detection**: <15 minutes
- **False Positive Rate**: <5%
- **Stack Health Score**: Consistent 8+/10

### Review Schedule
- **Weekly**: CI pass rate and execution times
- **Monthly**: Failure pattern analysis
- **Quarterly**: Full branch protection rule review