# Pre-PR Checklist: Infrastructure Changes

## Service Health Validation Checklist

Use this checklist before creating PRs that modify infrastructure files.

### ✅ **Required: Local Validation**

#### 1. Service Startup Test
```bash
cd stacks/business-ops

# Start all services
docker compose up -d

# Wait for initialization (60s minimum)
sleep 60
```

#### 2. Health Endpoint Validation
```bash
# Cal.com health check
curl -f "http://localhost:8085/auth/setup?step=1"
# Expected: HTTP 200 OK

# Zammad health check  
curl -f "http://localhost:8084"
# Expected: HTTP 200 OK with web interface
```

#### 3. Database Health Check
```bash
# PostgreSQL containers
docker compose exec calcom-db pg_isready
docker compose exec zammad-postgresql pg_isready
# Expected: accepting connections
```

#### 4. Service Cleanup
```bash
# Clean shutdown
docker compose down -v

# Verify cleanup
docker compose ps
# Expected: No running containers
```

### ✅ **Automated Script Option**
```bash
# Use validation script (faster)
scripts/run-stack-health-local.sh
# Expected: ✅ All health checks pass
```

### ✅ **CI Preparation**

#### Expected CI Behavior
- **Workflow**: `Stack Health Check / Services Health Check (core)`
- **Execution Time**: <15 minutes
- **Retry Logic**: Cal.com (12×15s), Zammad (8×20s)
- **Success Criteria**: Both services HTTP 200

#### Trigger Conditions
Your PR will trigger CI if it modifies:
- `stacks/business-ops/docker-compose*.yml`
- `stacks/business-ops/.env*`
- `.github/workflows/stack-health-check.yml`

### ✅ **Documentation Updates**

If your changes affect:
- **Service configuration**: Update runbooks
- **Health endpoints**: Update this checklist  
- **Retry logic**: Update evidence documentation
- **New services**: Add to health check workflow

### ✅ **Branch Protection Compliance**

#### Status Check Requirements
- **Required**: `Stack Health Check / Services Health Check (core)`
- **Timeout**: 15-minute maximum
- **Retry Policy**: Built-in service-specific retries
- **Override**: Admin bypass available for emergencies

#### PR Requirements
- ✅ All commits signed
- ✅ Conversation resolution required
- ✅ Branch up-to-date with target
- ✅ Status checks passing

### ❌ **Common Failure Scenarios**

#### Cal.com Issues
```bash
# Symptoms
curl: (7) Failed to connect to localhost:8085

# Debugging
docker compose logs calcom
docker compose ps calcom

# Common causes
- Port 8085 already in use
- Database initialization timeout
- Environment variable misconfiguration
```

#### Zammad Issues
```bash
# Symptoms  
curl: (7) Failed to connect to localhost:8084

# Debugging
docker compose logs zammad-railsserver
docker compose ps | grep zammad

# Common causes
- Rails server startup delay (>60s)
- PostgreSQL dependency not ready
- Redis/Memcached connectivity issues
```

#### Database Issues
```bash
# Symptoms
pg_isready: no response

# Debugging
docker compose logs calcom-db
docker compose logs zammad-postgresql

# Common causes
- Volume mount permissions
- Insufficient memory allocation
- Port conflicts (5432)
```

### 🚨 **Emergency Procedures**

#### If Local Tests Fail
1. **Don't create PR** until local validation passes
2. **Debug systematically** using steps above
3. **Check recent changes** for configuration drift
4. **Consult runbooks** in `docs/runbooks/`

#### If CI Tests Fail After PR Creation
1. **Check CI logs** for specific error details
2. **Re-run local validation** to reproduce issue
3. **Update PR** with fixes before requesting review
4. **Document any infrastructure changes** in PR description

### 📋 **PR Description Template**

```markdown
## Infrastructure Changes

### Services Modified
- [ ] Cal.com configuration
- [ ] Zammad configuration  
- [ ] Database setup
- [ ] Environment variables

### Local Validation
- [ ] ✅ scripts/run-stack-health-local.sh passes
- [ ] ✅ Cal.com health endpoint (200 OK)
- [ ] ✅ Zammad health endpoint (200 OK)
- [ ] ✅ Database health checks pass

### Expected CI Behavior
- [ ] ✅ Stack Health Check / Services Health Check (core) will pass
- [ ] ✅ Execution time <15 minutes
- [ ] ✅ No breaking changes to health endpoints

### Documentation Updates
- [ ] Runbooks updated (if applicable)
- [ ] Health check procedures updated (if applicable)
- [ ] Evidence documentation updated (if applicable)
```

---

**Remember**: Local validation is required before CI validation. This prevents wasted CI time and ensures reliable infrastructure changes.