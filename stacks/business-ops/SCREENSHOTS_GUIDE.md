# Screenshots Collection Guide

## Required Screenshots for PR Documentation

### Service Interfaces

#### 1. EspoCRM (http://localhost:8081)
- **Main Page**: Initial application interface showing JavaScript loading
- **Setup Wizard**: Installation wizard if accessible  
- **Purpose**: Demonstrate CRM system is operational

#### 2. Documenso (http://localhost:8083) 
- **Sign In Page**: Authentication interface (HTTP 302 redirect)
- **Login Form**: React application with auth components
- **Purpose**: Show document signing platform ready for admin setup

#### 3. Listmonk (http://localhost:9000)
- **Health Check**: API endpoint showing `{"data":true}` response
- **Admin Interface**: Login page or dashboard if accessible
- **Purpose**: Confirm email marketing platform operational

#### 4. Traefik (http://localhost:8091)
- **Dashboard**: Traefik proxy dashboard (HTTP 301 redirect)
- **Service Discovery**: Show services being routed
- **Purpose**: Verify reverse proxy configuration

### Service Status

#### 5. Docker Compose Status
```bash
docker-compose ps
```
- **Terminal Output**: Show all service states
- **Health Status**: Highlight healthy databases vs unhealthy applications
- **Purpose**: Document current operational state

#### 6. Service Logs (Key Services)
```bash
docker-compose logs espocrm | tail -20
docker-compose logs documenso | tail -20  
docker-compose logs listmonk | tail -20
```
- **EspoCRM Logs**: Show successful startup
- **Documenso Logs**: Confirm database connections
- **Listmonk Logs**: Health check responses
- **Purpose**: Prove services are functioning despite "unhealthy" status

### Infrastructure

#### 7. Database Connections
```bash
docker-compose logs espocrm-db | tail -10
docker-compose logs listmonk-db | tail -10
```
- **Database Startup**: Show successful initialization  
- **Connection Logs**: Prove application-database connectivity
- **Purpose**: Confirm infrastructure health

#### 8. Network Configuration
```bash
docker network ls
docker-compose config --services
```
- **Networks**: Show Docker network setup
- **Service Discovery**: List all configured services
- **Purpose**: Demonstrate orchestration setup

### Problem Areas

#### 9. Cal.com Issues
```bash
docker-compose logs calcom | tail -30
```
- **Error Messages**: Show encryption key issues
- **Restart Loop**: Document continuous restart behavior
- **Purpose**: Document known issues for resolution

#### 10. Zammad Status  
```bash
docker-compose logs zammad | tail -30
```
- **Exit Logs**: Show why service stopped
- **Configuration Issues**: Document startup problems
- **Purpose**: Document scope of issues

### File Structure

#### 11. Directory Tree
```bash
tree /home/matt/MMTUEntertainment/stacks/business-ops -a -I '.git'
```
- **Complete Structure**: Show all created files and directories
- **Configuration Files**: Highlight key configs
- **Purpose**: Document complete implementation

#### 12. Key Configuration Files
- **docker-compose.yml**: Show service definitions
- **.env.example**: Template variables
- **traefik/traefik.yml**: Proxy configuration
- **Purpose**: Show infrastructure-as-code implementation

## Screenshot Capture Instructions

### Browser Screenshots
1. Open each service URL in browser
2. Capture full page including URL bar
3. Save as PNG with service name (e.g., `espocrm-interface.png`)
4. Include timestamp in filename if multiple captures

### Terminal Screenshots  
1. Use terminal with clear readable font
2. Include command and full output
3. Save as PNG with descriptive names (e.g., `docker-compose-status.png`)
4. Crop to relevant content only

### Code Screenshots
1. Use syntax highlighting editor
2. Show line numbers if important  
3. Capture key sections rather than full files
4. Save with file name reference (e.g., `docker-compose-yml-services.png`)

## Organization Structure
```
screenshots/
├── services/
│   ├── espocrm-interface.png
│   ├── documenso-signin.png
│   ├── listmonk-health.png
│   └── traefik-dashboard.png
├── infrastructure/
│   ├── docker-compose-status.png
│   ├── database-logs.png
│   └── network-config.png
├── issues/
│   ├── calcom-errors.png
│   └── zammad-exit.png
└── configuration/
    ├── directory-tree.png
    └── key-configs.png
```

## PR Integration
- Reference screenshots in PR description
- Link to specific issues with screenshot evidence
- Use screenshots to validate claims in documentation
- Include before/after if showing fixes

---
*This guide ensures comprehensive visual documentation of the Business-Ops Stack implementation*