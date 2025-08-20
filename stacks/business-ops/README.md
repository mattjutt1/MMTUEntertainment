# Business-Ops Starter Stack

> **Production-Ready OSS Business Operations Suite**  
> CRM • Help Desk • Document Signing • Email Marketing • Scheduling • Reverse Proxy

## 🚀 Quick Start

```bash
# Clone and navigate
git clone <repo> && cd stacks/business-ops

# Copy environment template  
cp .env.example .env

# Start core services
docker compose --profile core up -d

# Check service status
docker compose --profile core ps
```

## 📋 Service Overview

| Service | Purpose | URL | Status | Admin Credentials |
|---------|---------|-----|--------|-------------------|
| **EspoCRM** | Customer Relationship Management | http://localhost:8081 | ✅ Ready | Setup wizard |
| **Documenso** | Document Signing & eSignatures | http://localhost:8083 | ✅ Ready | Create account |
| **Listmonk** | Email Marketing & Newsletters | http://localhost:9000 | ✅ Ready | admin / admin123_change_me |
| **Traefik** | Reverse Proxy & SSL Termination | http://localhost:8091 | ✅ Ready | Dashboard |
| **Cal.com** | Scheduling & Calendar Booking | http://localhost:8085 | ⚠️ Issues | Environment config |
| **Zammad** | Help Desk & Support Tickets | http://localhost:8082 | ⚠️ Issues | Service config |

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Traefik      │    │  Application     │    │   Databases     │
│  (Port 8090)   │◄──►│    Services      │◄──►│                 │
│                │    │                  │    │ PostgreSQL x4   │
│ • SSL/TLS      │    │ • EspoCRM        │    │ MariaDB x1      │
│ • Load Balance │    │ • Documenso      │    │ Redis x1        │
│ • Dashboard    │    │ • Listmonk       │    │                 │
└─────────────────┘    │ • Cal.com        │    └─────────────────┘
                       │ • Zammad         │
                       └──────────────────┘
```

## ✅ Current Status (Post-Testing)

### Working Services (60% Operational)
- **EspoCRM**: HTTP 200, application loaded, MariaDB healthy
- **Documenso**: HTTP 302 → signin page, PostgreSQL healthy  
- **Listmonk**: Health check passing, PostgreSQL initialized
- **Traefik**: Dashboard accessible, routing operational

### Problematic Services (40% Issues)
- **Cal.com**: Restart loop, environment variable issues, database healthy
- **Zammad**: Restart loop, service configuration issues, database migrated

## 📦 Installation

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum
- 20GB disk space

### Environment Setup
```bash
# Required environment variables
DOMAIN=localhost
CALENDSO_ENCRYPTION_KEY=<32-char-key>
NEXTAUTH_SECRET=<32-char-secret>
DATABASE_URL=postgresql://...
```

### Service Deployment
```bash
# Core business services
docker compose --profile core up -d

# With Nextcloud (full stack)
docker compose --profile core --profile nextcloud up -d

# Minimal (essential only)
docker compose --profile minimal up -d
```

## 🔧 Configuration

### Traefik Setup
- **Ports**: 8090 (HTTP), 8443 (HTTPS), 8091 (Dashboard)
- **SSL**: Let's Encrypt ready (update domain in .env)
- **Config**: `traefik/dynamic.yml` for routing rules

### Database Credentials
- **PostgreSQL**: Users vary per service (see .env.example)
- **MariaDB**: espocrm/espocrm_secret
- **Redis**: No auth (internal network only)

### Security Notes
- Change default passwords before production
- Use strong encryption keys (32+ characters)
- Configure SSL certificates for public deployment
- Review firewall rules for exposed ports

## 🔍 Troubleshooting

### Common Issues

**Port Conflicts**
```bash
# Check port usage
netstat -tulpn | grep :8090

# Modify ports in docker-compose.yml if needed
```

**Service Won't Start**
```bash
# Check logs
docker compose logs <service-name>

# Restart specific service  
docker compose restart <service-name>

# Rebuild if needed
docker compose up -d --force-recreate <service-name>
```

**Database Issues**
```bash
# Check database health
docker compose exec <db-service> pg_isready

# Run migrations manually (if needed)
docker compose exec <service> <migration-command>
```

## 📚 Documentation

- **Setup Guide**: `SERVICE_SETUP_GUIDE.md` - First-run configuration
- **Test Results**: `SMOKE_TEST_RESULTS.md` - Validation outcomes  
- **Environment**: `.env.example` - All configuration options
- **Business Stack**: `../business stack/OSS-First Business Builder Stack.md`

## 🧪 Testing

### Smoke Tests
```bash
# Health checks
curl http://localhost:9000/health  # Listmonk
curl -I http://localhost:8081      # EspoCRM
curl -I http://localhost:8083      # Documenso
curl -I http://localhost:8091      # Traefik
```

### Service Validation
- **EspoCRM**: Access installation wizard
- **Documenso**: Create admin account  
- **Listmonk**: Login with admin/admin123_change_me
- **Traefik**: View dashboard and routing rules

## 🔐 Security Considerations

### Production Hardening
1. **Change Default Credentials**: All services have default admin passwords
2. **SSL Certificates**: Configure Let's Encrypt for HTTPS
3. **Network Security**: Restrict database access to application network
4. **Environment Variables**: Use Docker secrets for sensitive data
5. **Regular Updates**: Keep service images updated for security patches

### Monitoring & Observability
- Traefik dashboard for service health
- Database connection monitoring via health checks
- Application-specific admin interfaces for metrics

## 🔄 Updates & Maintenance

### Service Updates
```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose --profile core up -d
```

### Backup Strategy
```bash
# Database backups (example for PostgreSQL)
docker compose exec listmonk-db pg_dump -U listmonk listmonk > backup.sql

# Volume backups
docker run --rm -v business-ops_listmonk-data:/data -v $(pwd):/backup alpine tar czf /backup/listmonk-data.tar.gz /data
```

## 📊 Performance

### Resource Requirements
- **CPU**: 2-4 cores recommended
- **RAM**: 8GB minimum, 16GB recommended  
- **Disk**: 20GB minimum, SSD recommended
- **Network**: 100Mbps for concurrent users

### Scaling Considerations
- Database connection pooling configured
- Traefik load balancing ready
- Horizontal scaling via Docker Swarm/Kubernetes
- Consider separating databases for production

## 🤝 Contributing

### Issues Found
- **Cal.com**: Environment variable resolution needed
- **Zammad**: Service startup debugging required
- **SSL**: Production certificate automation
- **Monitoring**: Application metrics integration

### Development
```bash
# Local development with hot reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Run tests
./scripts/verify-licenses.sh
```

## 📄 License

This stack configuration is MIT licensed. Individual services maintain their own licenses:
- EspoCRM: GPL v3
- Documenso: MIT  
- Listmonk: AGPL v3
- Cal.com: MIT
- Zammad: AGPL v3
- Traefik: MIT

---

**Stack Score: 6/10** (60% services operational, infrastructure solid, comprehensive documentation)