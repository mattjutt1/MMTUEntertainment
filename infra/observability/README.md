# Portfolio Observability Infrastructure

Comprehensive monitoring, alerting, and DORA metrics infrastructure for MMTU Entertainment portfolio.

## Overview

This infrastructure provides:
- **DORA Metrics Collection**: Automated tracking of deployment frequency, lead time, MTTR, and change failure rate
- **Real-time Monitoring**: Cloudflare-based performance and uptime monitoring
- **Automated Alerting**: Multi-channel notifications for incidents and performance degradation
- **Portfolio Dashboard**: Centralized analytics dashboard with PostHog integration
- **Infrastructure as Code**: Terraform-managed observability infrastructure

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   Cloudflare    │    │   PostHog       │
│   Actions       │────│   Workers       │────│   Analytics     │
│   (DORA)        │    │   (Performance) │    │   (User Data)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Portfolio     │
                    │   Dashboard     │
                    │   (React App)   │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Slack         │    │   GitHub        │    │   Email         │
│   Notifications │    │   Issues        │    │   Alerts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### 1. Portfolio Analytics Package (`packages/portfolio-analytics/`)
- **DORA Metrics Collector**: GitHub API integration for deployment and incident data
- **Cloudflare Integration**: Performance metrics via CF Observability MCP server  
- **PostHog Integration**: User analytics and business metrics
- **Dashboard Data Provider**: Aggregated portfolio insights

### 2. Portfolio Dashboard (`apps/portfolio-dashboard/`)
- **React Application**: Modern dashboard with real-time updates
- **Portfolio Overview**: High-level health and performance metrics
- **DORA Metrics View**: Detailed DevOps performance tracking
- **Product Details**: Individual product monitoring and incidents
- **Alerts Center**: Centralized alert management and incident response

### 3. Automated Monitoring (`.github/workflows/portfolio-monitoring.yml`)
- **15-minute Intervals**: Continuous metrics collection and analysis
- **Critical Alert Detection**: Immediate notifications for urgent issues
- **GitHub Issues**: Automatic incident tracking and management
- **Performance Analysis**: Trend analysis and improvement recommendations

### 4. Infrastructure as Code (`infra/observability/terraform/`)
- **Cloudflare Health Checks**: Automated uptime monitoring for all products
- **Notification Policies**: Multi-channel alerting configuration
- **GitHub Repository Management**: Automated setup for portfolio monitoring
- **Security Controls**: Branch protection and access management

## Quick Start

### Prerequisites
- Node.js 18+
- Terraform 1.0+
- GitHub CLI
- Cloudflare account with API access
- PostHog account (optional)

### 1. Install Dependencies
```bash
# Install portfolio analytics package
cd packages/portfolio-analytics
npm install
npm run build

# Install dashboard dependencies  
cd ../../apps/portfolio-dashboard
npm install
```

### 2. Configure Environment Variables
```bash
# Copy environment template
cp apps/portfolio-dashboard/.env.example apps/portfolio-dashboard/.env.local

# Edit with your configuration
VITE_POSTHOG_KEY=your-posthog-key
VITE_CLOUDFLARE_API_TOKEN=your-cloudflare-token
VITE_CLOUDFLARE_ACCOUNT_ID=your-account-id
VITE_GITHUB_TOKEN=your-github-token
```

### 3. Deploy Infrastructure
```bash
cd infra/observability/terraform

# Copy configuration template
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars

# Deploy infrastructure
terraform init
terraform plan
terraform apply
```

### 4. Launch Dashboard
```bash
cd apps/portfolio-dashboard
npm run dev
```

Access dashboard at: http://localhost:3000

## Configuration

### Portfolio Products
Configure your products in `infra/observability/terraform/terraform.tfvars`:

```hcl
portfolio_products = [
  {
    id                      = "your-product"
    name                    = "Your Product Name"
    repository              = "your-org/your-repo"
    cloudflare_service_id   = "your-service-id"
    deployment_environments = ["production", "staging"]
    health_endpoint         = "/health"
    alerting_config = {
      uptime_threshold       = 99.5
      error_rate_threshold   = 1.0
      response_time_threshold = 1000
    }
  }
]
```

### Notification Channels
```hcl
notification_channels = {
  slack_webhook_url = "your-slack-webhook"
  email_recipients  = ["alerts@company.com"]
  pager_duty_key    = "your-pagerduty-key"
}
```

## DORA Metrics

### Deployment Frequency
- **Data Source**: GitHub Actions workflow runs
- **Calculation**: Successful deployments per day/week/month
- **Threshold**: Daily deployments = Elite performance

### Lead Time for Changes
- **Data Source**: Git commit to production deployment time
- **Calculation**: Average time from commit to production
- **Threshold**: <1 hour = Elite performance

### Mean Time to Recovery (MTTR)
- **Data Source**: GitHub issues labeled as incidents
- **Calculation**: Time from incident start to resolution
- **Threshold**: <1 hour = Elite performance

### Change Failure Rate
- **Data Source**: Failed deployments + incident-causing deployments
- **Calculation**: (Failed changes / Total changes) × 100
- **Threshold**: <5% = Elite performance

## Alerting Strategy

### Alert Severities
- **Critical**: Service outages, security breaches, data loss
- **Warning**: Performance degradation, approaching thresholds
- **Info**: Deployment notifications, maintenance updates

### Notification Channels
- **Slack**: Real-time team notifications with dashboard links
- **Email**: Detailed incident reports and summaries
- **GitHub Issues**: Automatic incident tracking and assignment
- **PagerDuty**: Critical alerts with escalation policies

### Alert Thresholds
Configurable per product:
- **Uptime**: Default 99.5% (customizable)
- **Error Rate**: Default 1% (customizable)  
- **Response Time**: Default 1000ms (customizable)

## Dashboard Features

### Portfolio Overview
- Overall health status across all products
- Active incidents and critical alerts count
- Daily deployment statistics
- High-level DORA metrics summary

### Product Details
- Individual product health and performance metrics
- Recent deployment history and success rates
- Active incidents and resolution status
- Real-time performance charts and trends

### DORA Metrics Dashboard
- Industry benchmark comparisons
- Historical trend analysis
- Performance level classification (Elite/High/Medium/Low)
- Improvement recommendations

### Alerts Management
- Real-time alert monitoring and filtering
- Alert acknowledgment and resolution tracking
- Incident response workflow integration
- Performance impact analysis

## Maintenance

### Weekly Tasks
- Review DORA metrics trends and identify improvement opportunities
- Validate alert thresholds and adjust based on performance baselines
- Update product configurations for new services
- Check dashboard performance and optimize queries

### Monthly Tasks
- Analyze incident patterns and update response procedures
- Review notification channel effectiveness
- Update infrastructure configurations
- Performance optimization and cost analysis

### Quarterly Tasks
- DORA metrics benchmarking against industry standards
- Security review of monitoring infrastructure
- Disaster recovery testing for monitoring systems
- Team training on new monitoring capabilities

## Troubleshooting

### Common Issues

**Dashboard not loading data:**
```bash
# Check environment variables
cat apps/portfolio-dashboard/.env.local

# Verify API tokens
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify
```

**DORA metrics not updating:**
```bash
# Check GitHub Actions workflow
gh workflow run portfolio-monitoring.yml

# View workflow logs
gh run list --workflow=portfolio-monitoring.yml
```

**Alerts not firing:**
```bash
# Verify Cloudflare notification policies
terraform plan -var-file=terraform.tfvars

# Check health check status
curl https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/healthchecks
```

### Support
- **Issues**: GitHub Issues for bug reports and feature requests
- **Documentation**: `/docs` directory for detailed guides
- **Monitoring**: Real-time status at portfolio dashboard

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/monitoring-improvement`
3. Make changes and test thoroughly
4. Update documentation as needed
5. Submit pull request with detailed description

### Development Guidelines
- Follow Infrastructure as Code principles
- Include comprehensive monitoring for new features
- Maintain backward compatibility for configuration changes
- Add tests for new analytics features

## Security

### Access Control
- GitHub repository access via team membership
- Cloudflare API tokens with minimal required permissions
- Environment-specific secrets management
- Regular access reviews and token rotation

### Data Privacy
- No sensitive user data stored in monitoring systems
- Aggregated metrics only, no individual user tracking
- GDPR-compliant data handling procedures
- Secure token storage and transmission

### Incident Response
- Automated security alert escalation
- Incident response playbooks for monitoring failures
- Regular security reviews of monitoring infrastructure
- Vulnerability scanning and patch management