# Business-Ops Stack Service Setup Guide

## Service Access URLs

After starting the Docker Compose stack with `docker compose --profile core up -d`, access the services at:

| Service | URL | Status | Setup Required |
|---------|-----|--------|----------------|
| EspoCRM | http://localhost:8081 | ✅ Running | Initial setup wizard |
| Documenso | http://localhost:8083 | ✅ Running | Sign-in page ready |
| Listmonk | http://localhost:9000 | ✅ Running | Admin interface |
| Traefik Dashboard | http://localhost:8091 | ✅ Running | Dashboard available |
| Cal.com | http://localhost:8085 | ❌ Restarting | Environment issues |
| Zammad | http://localhost:8082 | ❌ Restarting | Database connection issues |

## Setup Status Summary

### ✅ Working Services

**EspoCRM (CRM)**
- URL: http://localhost:8081
- Status: Shows application interface
- Next: Complete installation wizard
- Database: MariaDB (healthy)

**Documenso (Document Signing)**
- URL: http://localhost:8083
- Status: Sign-in page loaded
- Next: Create admin account
- Database: PostgreSQL (healthy)

**Listmonk (Email Marketing)**
- URL: http://localhost:9000
- Status: Health endpoint responding
- Next: Access admin interface
- Database: PostgreSQL (healthy, initialized)

**Traefik (Reverse Proxy)**
- URL: http://localhost:8091
- Status: Dashboard accessible
- Configuration: Dynamic routing configured

### ❌ Problematic Services

**Cal.com (Scheduling)**
- Issue: CALENDSO_ENCRYPTION_KEY environment variable problems
- Action Taken: Added env_file directive, multiple key formats
- Database: PostgreSQL (healthy, 470 migrations applied)
- Status: Still restarting

**Zammad (Help Desk)**
- Issue: Service restart loop despite healthy database
- Action Taken: Updated PostgreSQL environment variables
- Database: PostgreSQL (healthy, all tables migrated)
- Status: Still restarting

## Troubleshooting Applied

1. **Port Conflicts**: Changed from 80/443/8081 to 8090/8443/8091
2. **Listmonk**: Fixed TOML syntax, initialized database with `--install --yes`
3. **Cal.com**: Added env_file, multiple encryption key variables
4. **Zammad**: Enhanced PostgreSQL environment configuration
5. **Database Migrations**: All services have healthy, migrated databases

## Next Steps

1. Complete setup wizards for working services
2. Create test data for smoke testing
3. Continue troubleshooting Cal.com/Zammad issues
4. Document working configurations
5. Prepare production deployment guide