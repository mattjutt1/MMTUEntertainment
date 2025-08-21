# Post-Merge Checklist: Infrastructure Changes

## Service Health Monitoring Checklist

Use this checklist after merging infrastructure changes to ensure continued system health.

### ✅ **Immediate Post-Merge Validation**

#### 1. CI Workflow Execution
```bash
# Check latest workflow run
gh run list --workflow=stack-health-check.yml --limit=1

# Expected status: completed ✅
# Expected conclusion: success ✅
# Expected duration: <15 minutes
```

#### 2. Scheduled Monitoring Status
```bash
# Verify scheduled runs (every 6 hours)
gh run list --workflow=stack-health-check.yml --limit=5

# Expected: Recent scheduled runs successful
# Pattern: Every 6 hours, consistent success
```

#### 3. Live Service Validation
```bash
# Quick production health check
cd stacks/business-ops

# Start services with latest configuration
docker compose up -d
sleep 60

# Validate endpoints
curl -f "http://localhost:8085/auth/setup?step=1"  # Cal.com
curl -f "http://localhost:8084"                   # Zammad

# Cleanup
docker compose down -v
```

### ✅ **Branch Protection Verification**

#### Status Check Integration
- ✅ **Required check active**: `Stack Health Check / Services Health Check (core)`
- ✅ **Protection rules enforced**: No bypassed merges
- ✅ **Admin compliance**: Rules apply to administrators
- ✅ **Conversation resolution**: All discussions closed

#### Recent PR Analysis
```bash
# Check last 3 PRs for status check compliance
gh pr list --state merged --limit 3

# Expected: All PRs passed required status checks
# Expected: No emergency overrides without documentation
```

### ✅ **Performance Monitoring**

#### CI Execution Metrics
Monitor for performance degradation:

```bash
# Get execution times for last 10 runs
gh run list --workflow=stack-health-check.yml --limit=10 \
  --json conclusion,createdAt,updatedAt

# Target metrics:
# - Execution time: <15 minutes
# - Success rate: >95%
# - No timeout failures
```

#### Health Check Response Times
```bash
# Test endpoint response times
time curl -s "http://localhost:8085/auth/setup?step=1"
time curl -s "http://localhost:8084"

# Target metrics:
# - Cal.com response: <5 seconds
# - Zammad response: <10 seconds
```

### ✅ **Stack Health Score Validation**

#### Current Health Assessment
```
Cal.com Service:
- ✅ HTTP 200 from /auth/setup?step=1
- ✅ Database connectivity
- ✅ Port 8085 accessible

Zammad Service:
- ✅ Rails server responding
- ✅ Multi-service architecture operational
- ✅ Port 8084 accessible

Overall Score: 8+/10 ✅
```

#### Trend Analysis
- **Weekly**: Review CI success rate trends
- **Daily**: Monitor scheduled run results
- **Hourly**: Check for any alert notifications

### ✅ **Documentation Synchronization**

#### Updated Documentation
Verify documentation reflects current state:

- [ ] **Branch Protection**: `docs/Branch-Protection.md` current
- [ ] **Project Instructions**: `docs/Project-Instructions.md` aligned
- [ ] **Evidence Base**: `docs/best-practices/smoke-testing-references.md` cited
- [ ] **Runbooks**: Service-specific procedures updated

#### Configuration Drift Prevention
```bash
# Verify workflow configuration matches documentation
diff .github/workflows/stack-health-check.yml \
     docs/examples/stack-health-check.yml.expected

# Expected: No differences (or documented differences only)
```

### ✅ **Alert Configuration**

#### Monitoring Setup
Ensure alerting is configured for:

- **2+ consecutive CI failures**
- **Execution time >20 minutes**  
- **Scheduled run failures**
- **Health endpoint failures**

#### Escalation Procedures
- **First failure**: Investigate immediately
- **Second failure**: Page on-call engineer
- **Third failure**: Emergency incident response
- **Timeout failures**: Infrastructure team escalation

### 🚨 **Failure Response Procedures**

#### If CI Starts Failing After Merge
```bash
# 1. Check recent changes
git log --oneline -10

# 2. Rollback if necessary
git revert <problematic-commit>

# 3. Test rollback locally
scripts/run-stack-health-local.sh

# 4. Create rollback PR
gh pr create --title "Rollback: Fix CI failure" \
             --body "Rollback commit causing CI failures"
```

#### If Scheduled Monitoring Fails
```bash
# 1. Check GitHub Actions status
curl -s https://www.githubstatus.com/api/v2/status.json

# 2. Test services manually
cd stacks/business-ops
docker compose up -d
# ... manual health checks ...

# 3. File incident if services healthy but CI failing
# 4. Update stakeholders via established channels
```

### 📊 **Success Metrics Tracking**

#### Weekly Review Checklist
```bash
# CI Performance Analysis
gh run list --workflow=stack-health-check.yml \
  --created=$(date -d '7 days ago' '+%Y-%m-%d') \
  --json conclusion,createdAt

# Calculate:
# - Success rate (target: >95%)
# - Average execution time (target: <15 min)
# - Failure patterns (investigate recurring issues)
```

#### Monthly Health Assessment
- **Stack Health Score**: Maintain 8+/10
- **False Positive Rate**: <5%
- **Mean Time to Detection**: <15 minutes
- **Documentation Currency**: 100% up-to-date

### 📋 **Incident Documentation**

#### Required Documentation for Overrides
```markdown
## Emergency Override Report

**Date**: YYYY-MM-DD HH:MM UTC
**Duration**: X minutes
**Reason**: [Business justification]
**Override Authority**: [GitHub admin username]

### Incident Details
- Original failure: [CI log link]
- Business impact: [description]
- Risk assessment: [low/medium/high]

### Resolution
- Immediate fix: [description]
- Root cause: [analysis]
- Prevention: [future measures]

### Validation
- [ ] Services manually tested
- [ ] Configuration verified
- [ ] Documentation updated
- [ ] Branch protection re-enabled
```

### ✅ **Continuous Improvement**

#### Quarterly Review Items
- **Retry logic effectiveness**: Analyze failure patterns
- **Timeout optimization**: Review execution time data
- **Documentation gaps**: Update based on incidents
- **Tool integration**: Evaluate new monitoring options

#### Performance Optimization Opportunities
- **Container startup time**: Optimize base images
- **Database initialization**: Improve migration speed
- **Network connectivity**: Reduce service discovery delays
- **Resource allocation**: Monitor CPU/memory usage

---

**Goal**: Maintain 8+/10 stack health with <5% false positive rate while providing early detection of regressions.