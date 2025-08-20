# Business-Ops Starter Stack - Operational Runbook

Complete operational guide for the Business-Ops Starter Stack: EspoCRM, Zammad, Documenso, Listmonk with Traefik reverse proxy and optional Nextcloud AIO.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- 4GB+ RAM (6GB+ recommended for full stack)
- Available ports: 80, 443, 8080-8084, 9000
- Domain or localhost for development

### Initial Setup
```bash
# Clone and navigate to stack
cd stacks/business-ops

# Copy and configure environment
cp .env.example .env
# Edit .env with your configuration

# Validate configuration
docker compose config -q

# Start core services
COMPOSE_PROFILES=core docker compose up -d

# Check service status
docker compose ps
```

## 📋 Service Overview

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Traefik** | 8080 | http://localhost:8080 | Reverse proxy dashboard |
| **EspoCRM** | 8081 | http://localhost:8081 | Customer relationship management |
| **Zammad** | 8082 | http://localhost:8082 | Helpdesk & customer support |
| **Documenso** | 8083 | http://localhost:8083 | Digital document signing |
| **Listmonk** | 9000 | http://localhost:9000 | Email newsletter & marketing |
| **Nextcloud AIO** | 8084 | http://localhost:8084 | Groupware suite (optional) |

### Service Dependencies
```
EspoCRM → MariaDB
Zammad → PostgreSQL + Redis
Documenso → PostgreSQL
Listmonk → PostgreSQL
All → Traefik (optional, direct ports available)
```

## ✅ First-Run Setup Checklist

### 1. EspoCRM Setup
**URL**: http://localhost:8081

- [ ] Complete installation wizard
  - [ ] Database connection (auto-configured)
  - [ ] Admin user creation
  - [ ] System settings configuration
- [ ] Verify login with admin credentials
- [ ] **Smoke Test**: Create Account + Contact record
- [ ] **Export Test**: Export data to CSV successfully

**Default Credentials**: See `.env` file (`ESPOCRM_ADMIN_*` variables)

**Documentation**: https://docs.espocrm.com/administration/installation/#docker

### 2. Zammad Setup  
**URL**: http://localhost:8082

- [ ] Complete initial setup wizard
  - [ ] Admin user creation
  - [ ] Organization setup
  - [ ] System configuration
- [ ] **Smoke Test**: Create test ticket
- [ ] **Email Test**: Configure inbound email channel (optional)
- [ ] Verify helpdesk interface loads correctly

**Note**: Elasticsearch disabled by default for resource optimization. Set `ELASTICSEARCH_ENABLED=true` and uncomment service for full-text search.

**Documentation**: https://docs.zammad.org/en/latest/install/docker-compose.html

### 3. Documenso Setup
**URL**: http://localhost:8083

- [ ] Complete initial account setup
- [ ] Verify database connection
- [ ] Configure SMTP (optional for development)
- [ ] **Smoke Test**: 
  - [ ] Upload test PDF document
  - [ ] Add signer field
  - [ ] Complete signing workflow
  - [ ] Verify signed document download

**Security Note**: Self-signed certificates work but show browser warnings. For production, use proper PKI certificates.

**Documentation**: https://docs.documenso.com/self-hosting/docker

### 4. Listmonk Setup
**URL**: http://localhost:9000

- [ ] Run database initialization (automatic on first start)
- [ ] Login with admin credentials
- [ ] **Smoke Test**:
  - [ ] Create subscriber list
  - [ ] Add test subscriber
  - [ ] Create simple campaign
  - [ ] Send test email (requires SMTP)
- [ ] Verify dashboard loads and displays metrics

**Default Credentials**: See `listmonk/config.toml` file

**Documentation**: https://listmonk.app/docs/installation/#docker

### 5. Traefik Dashboard (Optional)
**URL**: http://localhost:8080

- [ ] Access dashboard (auth: admin/admin)
- [ ] Verify all services discovered
- [ ] Check SSL certificate status
- [ ] Review routing rules

**Security Note**: Dashboard should be disabled or secured in production.

### 6. Nextcloud AIO (Optional Profile)
**URL**: http://localhost:8084

Only if using `nextcloud` profile:
- [ ] Complete AIO setup wizard
- [ ] Configure admin account
- [ ] **Smoke Test**: Upload/download file
- [ ] Verify sync functionality

**Documentation**: https://github.com/nextcloud/all-in-one#docker-compose

## 🏥 Health Check Validation

### Automated Health Checks
```bash
# Check all container health
docker compose ps

# View detailed health status
docker compose exec espocrm curl -f http://localhost/api/v1/App/user
docker compose exec zammad curl -f http://localhost:3000/api/v1/getting_started  
docker compose exec documenso curl -f http://localhost:3000/api/health
docker compose exec listmonk curl -f http://localhost:9000/health
```

### "What Good Looks Like"
✅ **All containers show "healthy" status**  
✅ **All web interfaces load without errors**  
✅ **Database connections established**  
✅ **One successful operation per service** (create record, ticket, signature, campaign)  
✅ **No critical errors in logs**

### Troubleshooting Common Issues

**Container Won't Start**:
```bash
# Check logs
docker compose logs [service-name]

# Check resource usage
docker stats

# Verify ports not in use
sudo lsof -iTCP -sTCP:LISTEN | grep -E '80|443|8080|8081|8082|8083|9000'
```

**Service Unhealthy**:
- Increase `start_period` in compose file for slow-starting services
- Check database connectivity
- Verify environment variables are set correctly

**Memory Issues**:
- Minimum 4GB RAM required
- Consider disabling Elasticsearch for Zammad
- Use `minimal` profile for testing (Listmonk only)

## 🔒 Security Configuration

### Development Security
- [ ] All services use non-default passwords
- [ ] Database access limited to application users  
- [ ] Traefik dashboard secured or disabled
- [ ] Self-signed certificates for HTTPS (dev only)

### Production Security Hardening

#### 1. HTTPS & TLS
- [ ] Use proper SSL certificates (Let's Encrypt or commercial)
- [ ] Enforce HTTPS redirects (configured in Traefik)
- [ ] Disable HTTP access on port 80 in production
- [ ] Review TLS cipher suites in `traefik/dynamic.yml`

#### 2. Database Security
- [ ] Use strong, unique passwords (20+ characters)
- [ ] Create least-privilege database users
- [ ] Disable default/root database access
- [ ] Enable database connection encryption

#### 3. Application Security
- [ ] Change all default admin passwords
- [ ] Enable two-factor authentication where supported
- [ ] Configure rate limiting in Traefik
- [ ] Review CORS and security headers

#### 4. OAuth & MCP Security
- [ ] Gmail MCP: Read-only or send-only scopes as needed
- [ ] Google Drive MCP: Limit to specific folders  
- [ ] Supabase MCP: Use read-only keys unless write required
- [ ] Store OAuth credentials securely, never in version control

#### 5. Network Security
- [ ] Use internal networks for database communication
- [ ] Expose only necessary ports via Traefik
- [ ] Consider firewall rules for production
- [ ] Monitor for unusual access patterns

#### 6. Backup & Recovery
- [ ] Regular database backups for each service
- [ ] Document restore procedures
- [ ] Test backup/restore process
- [ ] Secure backup storage (encrypted, off-site)

## 🔧 Operational Commands

### Stack Management
```bash
# Start services
COMPOSE_PROFILES=core docker compose up -d

# Start with Nextcloud
COMPOSE_PROFILES=core,nextcloud docker compose up -d

# Start minimal (Listmonk only)
COMPOSE_PROFILES=minimal docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes (⚠️ DATA LOSS)
docker compose down -v

# View logs
docker compose logs -f [service-name]

# Update services
docker compose pull && docker compose up -d
```

### Backup Operations
```bash
# Backup all databases
docker compose exec espocrm-db mysqldump -u root -p espocrm > backup-espocrm.sql
docker compose exec zammad-db pg_dump -U zammad zammad > backup-zammad.sql
docker compose exec documenso-db pg_dump -U documenso documenso > backup-documenso.sql
docker compose exec listmonk-db pg_dump -U listmonk listmonk > backup-listmonk.sql

# Backup application data
docker run --rm -v business-ops-espocrm-data:/data -v $(pwd):/backup alpine tar czf /backup/espocrm-data.tar.gz -C /data .
docker run --rm -v business-ops-zammad-data:/data -v $(pwd):/backup alpine tar czf /backup/zammad-data.tar.gz -C /data .
```

### Monitoring & Logs
```bash
# Follow all logs
docker compose logs -f

# Monitor resource usage
docker stats

# Check container health
docker compose ps

# Disk usage by volumes
docker system df
docker volume ls | grep business-ops
```

## 📊 Performance Optimization

### Resource Allocation
- **EspoCRM**: 512MB RAM minimum
- **Zammad**: 1GB RAM minimum (2GB with Elasticsearch)
- **Documenso**: 256MB RAM minimum  
- **Listmonk**: 128MB RAM minimum
- **Traefik**: 64MB RAM minimum

### Performance Tuning
```bash
# Optimize for SSD
echo 'vm.swappiness=10' >> /etc/sysctl.conf

# For Elasticsearch (if enabled)
echo 'vm.max_map_count=262144' >> /etc/sysctl.conf
sysctl -p
```

### Scaling Considerations
- Use external databases for multi-instance deployments
- Consider load balancing with multiple Traefik instances
- Implement proper session persistence for scaled services
- Monitor and tune database connection pools

## 🚨 Incident Response

### Service Down Procedure
1. **Identify**: Check `docker compose ps` for unhealthy containers
2. **Isolate**: Review logs with `docker compose logs [service]`
3. **Restore**: Restart affected services with `docker compose restart [service]`
4. **Verify**: Confirm service health and functionality
5. **Document**: Record incident details and resolution

### Data Recovery
1. **Assess**: Determine scope of data loss
2. **Stop**: Halt affected services to prevent further damage
3. **Restore**: Apply most recent backup
4. **Verify**: Confirm data integrity post-restore
5. **Resume**: Restart services and verify operations

### Emergency Contacts
- **System Admin**: [Define emergency contact]
- **Backup Location**: [Define backup storage location]
- **Recovery Documentation**: [Link to detailed recovery procedures]

## 🔗 Integration Points

### MCP Server Integration
- **Gmail**: Automated email notifications and campaigns
- **Google Drive**: Document storage and sharing workflows
- **Supabase**: Analytics and data integration

### Business Workflows
1. **Lead → Customer Journey**: EspoCRM → Zammad → Documenso
2. **Support Workflow**: Email → Zammad → Resolution tracking
3. **Marketing Automation**: Listmonk → Analytics → EspoCRM
4. **Document Workflow**: Generate → Documenso → Drive storage

## 📚 Additional Resources

### Official Documentation
- **EspoCRM**: https://docs.espocrm.com/
- **Zammad**: https://docs.zammad.org/
- **Documenso**: https://docs.documenso.com/
- **Listmonk**: https://listmonk.app/docs/
- **Traefik**: https://doc.traefik.io/traefik/
- **Nextcloud AIO**: https://github.com/nextcloud/all-in-one

### Community Support
- **EspoCRM**: https://forum.espocrm.com/
- **Zammad**: https://community.zammad.org/
- **Documenso**: https://github.com/documenso/documenso/discussions
- **Listmonk**: https://github.com/knadh/listmonk/discussions

### Professional Services
Consider professional services for:
- Production deployment planning
- Security auditing and hardening
- Custom integration development
- Performance optimization consulting
- Business process automation

---

**Version**: 1.0  
**Last Updated**: 2025-01-20  
**Maintainer**: MMTU Entertainment DevOps Team