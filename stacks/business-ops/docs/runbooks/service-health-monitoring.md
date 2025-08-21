# Service Health Monitoring Runbook

## Overview

This runbook documents health endpoints and monitoring procedures for the Business-Ops Stack services after the 2025-08-21 architecture improvements.

## Critical Health Endpoints

### Cal.com (Port 8085)
- **Health Endpoint**: `GET http://localhost:8085/auth/setup?step=1`
- **Expected Response**: HTTP 200 with HTML content (setup page)
- **Note**: Previous `/api/health` endpoint was non-existent; this endpoint confirmed working
- **Timeout**: 10 seconds
- **Retry Logic**: 12 attempts with 15-second intervals for startup

### Zammad Multi-Service (Port 8084 → Rails 3000)
- **Health Endpoint**: `GET http://[rails-container-ip]:3000/api/v1/getting_started`
- **Expected Response**: HTTP 200 with JSON: `{"setup_done":false,"import_mode":false,...}`
- **Architecture**: Multi-service setup (PostgreSQL + Redis + Memcached + Rails + Scheduler + WebSocket)
- **Note**: Single-container image `zammad/zammad-docker-compose:6.5` deprecated due to entrypoint failures
- **Timeout**: 10 seconds
- **Retry Logic**: 8 attempts with 20-second intervals for startup

## Service Dependencies

### Cal.com Dependencies
```yaml
calcom → calcom-db (PostgreSQL)
Health: pg_isready -U calendso
```

### Zammad Multi-Service Dependencies
```yaml
zammad-railsserver → zammad-postgresql (PostgreSQL)
                  → zammad-memcached (Memcached) 
                  → zammad-redis-new (Redis)
                  → zammad-init (Database migration)
Health: pg_isready -U zammad
```

## Monitoring Commands

### Quick Health Check
```bash
# Cal.com
curl -f -s --max-time 10 "http://localhost:8085/auth/setup?step=1" >/dev/null && echo "✅ Cal.com OK" || echo "❌ Cal.com Failed"

# Zammad (get Rails container IP first)
RAILS_IP=$(docker inspect business-ops_zammad-railsserver_1 | jq -r '.[0].NetworkSettings.Networks."business-ops-network".IPAddress')
curl -f -s --max-time 10 "http://$RAILS_IP:3000/api/v1/getting_started" | jq -e '.setup_done != null' >/dev/null && echo "✅ Zammad OK" || echo "❌ Zammad Failed"
```

### Service Status Overview
```bash
cd stacks/business-ops
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### Detailed Diagnostics
```bash
# Cal.com logs
docker compose logs calcom --tail=20

# Zammad multi-service logs
docker compose logs zammad-railsserver --tail=20
docker compose logs zammad-postgresql --tail=10
docker compose logs zammad-memcached --tail=5
```

## Troubleshooting

### Cal.com Issues
1. **404 on health endpoint**: Ensure using `/auth/setup?step=1` not `/api/health`
2. **Slow startup**: Allow 2-3 minutes for Next.js compilation
3. **Database connection**: Verify `calcom-db` container is healthy

### Zammad Issues
1. **Rails container not starting**: Check init container completed database migration
2. **Empty logs with exit code 0**: Indicates single-container image issue - ensure using multi-service setup
3. **Store::Provider errors**: Legacy single-container issue - verify using `ghcr.io/zammad/zammad:6.5.1` multi-service
4. **Connection refused**: Verify all dependency containers (PostgreSQL, Redis, Memcached) are healthy

## CI Integration

### Branch Protection Requirements
The stack health check is enforced via `.github/workflows/stack-health-check.yml` for:
- PRs touching `docker-compose*.yml`
- PRs touching `.env*` files
- Direct pushes to `main`/`develop`

### Required Status Check
Add to branch protection rules:
```
Stack Health Check / Services Health Check (core)
```

## Architecture Notes

### Research-Based Improvements (2025-08-21)
- **Problem**: Single-container `zammad/zammad-docker-compose:6.5` had entrypoint script failures
- **Solution**: Replaced with official multi-service architecture
- **Evidence**: GitHub Issues #110 (sudden stops) and #94 (rsync syntax errors)
- **Recommendation**: Single-container images deprecated for production use

### Service Ports
- Cal.com: `localhost:8085` → Container `3000`
- Zammad Rails: Container IP `3000` (internal)
- Zammad PostgreSQL: Container `5432` (internal)
- Zammad Redis: Container `6379` (internal)
- Zammad Memcached: Container `11211` (internal)

## Rollback Procedure

### Emergency Rollback
1. **Backup current config**: `cp docker-compose.override.yml docker-compose.override.yml.backup`
2. **Revert to previous**: `git checkout HEAD~1 -- docker-compose.override.yml`
3. **Restart services**: `docker compose down && docker compose up -d`
4. **Verify health**: Run health checks above

### Data Safety
- All databases use persistent volumes
- No schema changes in architecture migration
- Rollback is configuration-only, no data loss risk

## Knowledge Index Updates

### Deprecation Notice
```markdown
❌ DEPRECATED: zammad/zammad-docker-compose:6.5 (single-container)
✅ RECOMMENDED: ghcr.io/zammad/zammad:6.5.1 (multi-service)

Reason: Single-container images have entrypoint script failures and are designed for testing only.
Migration: Use official docker-compose setup with separate Rails/PostgreSQL/Redis/Memcached containers.
```

## Success Metrics

### Target Health Score: 8+/10
- **Cal.com**: ✅ 200 OK response from `/auth/setup?step=1`
- **Zammad**: ✅ JSON response from Rails API `/api/v1/getting_started`
- **Dependencies**: ✅ All database containers healthy
- **Startup Time**: <3 minutes for full stack initialization
- **CI Pass Rate**: >95% for stack health checks

### Monitoring Frequency
- **CI**: Every PR + push to main branches
- **Scheduled**: Every 6 hours via GitHub Actions
- **Manual**: On-demand via `workflow_dispatch`