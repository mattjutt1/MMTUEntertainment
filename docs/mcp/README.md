# MMTU Entertainment MCP Server Integration

This document provides comprehensive setup and usage instructions for all MCP servers integrated into the MMTU Entertainment revenue optimization pipeline.

## Overview

The MCP (Model Context Protocol) integration enables direct access to:
- **PostHog**: Product analytics and user behavior tracking
- **HubSpot**: CRM data and marketing automation
- **PostgreSQL**: Custom analytics database
- **Grafana**: Real-time dashboards and monitoring
- **Kubernetes**: Container orchestration (optional)
- **Docker**: Container management (optional)

## Revenue Metrics Targets

- **LTV:CAC Ratio**: ≥ 3.0
- **Week 4 Retention**: ≥ 20%
- **Gross Margin**: ≥ 60%

## Quick Start

1. **Setup Environment**:
   ```bash
   cd /home/matt/MMTUEntertainment
   cp .env.mcp.template .env.mcp
   # Edit .env.mcp with your actual credentials
   ```

2. **Run Setup Script**:
   ```bash
   chmod +x scripts/setup-mcp-servers.sh
   ./scripts/setup-mcp-servers.sh
   ```

3. **Verify Integration**:
   ```bash
   ./scripts/test-mcp-integration.sh
   ```

## Authentication Setup

### PostHog Setup
1. Go to https://app.posthog.com/settings/project-details
2. Copy your Project API Key
3. Add to `.env.mcp`: `POSTHOG_API_KEY=your_key_here`

### HubSpot Setup
1. Go to https://developers.hubspot.com/docs/api/private-apps
2. Create a new private app with scopes: contacts, companies, deals, tickets (read/write)
3. Copy the private app token
4. Add to `.env.mcp`: `HUBSPOT_PRIVATE_APP_TOKEN=your_token_here`

### PostgreSQL Setup
1. Set up PostgreSQL database for analytics
2. Create connection string: `postgresql://username:password@host:port/database`
3. Add to `.env.mcp`: `POSTGRES_CONNECTION_STRING=your_connection_string`

### Grafana Setup
1. Access your Grafana instance
2. Go to Configuration > API Keys
3. Create new API key with Editor role
4. Add to `.env.mcp`: `GRAFANA_URL=your_grafana_url` and `GRAFANA_API_KEY=your_api_key`

## E2E Testing Integration

The MCP servers are integrated into the site E2E testing workflows:
- **Smoke tests**: Basic connectivity validation
- **Full tests**: Comprehensive metrics validation across all servers

## Revenue Optimization Pipeline

The automated revenue optimization pipeline runs daily and provides:
- Real-time revenue metrics monitoring
- Automated alerts for threshold breaches
- Optimization recommendations
- Integration with existing CI/CD workflows

### Running the Pipeline

```bash
# Manual execution
./scripts/revenue-optimization-pipeline.sh

# View latest report
ls -la pivot-checks/revenue-optimization-*.md | tail -1
```

## CI/CD Integration

The MCP servers are integrated into GitHub Actions workflows:

### Site E2E Smoke Tests
- Runs on every PR to main branch
- Validates MCP connectivity
- Tests critical revenue funnel paths
- Runtime target: ≤3 minutes

### Site E2E Full Tests  
- Runs nightly and on-demand
- Cross-browser testing (Chrome, Firefox, Safari)
- Comprehensive MCP integration validation
- Revenue metrics validation

## File Structure

```
/home/matt/MMTUEntertainment/
├── mcp-config.json                    # MCP server configuration
├── .env.mcp.template                  # Environment template
├── .env.mcp                          # Your credentials (do not commit)
├── scripts/
│   ├── setup-mcp-servers.sh         # Setup and installation script
│   ├── test-mcp-integration.sh      # Integration testing script
│   └── revenue-optimization-pipeline.sh # Revenue metrics pipeline
├── products/site/
│   └── e2e/
│       └── mcp-integration.spec.ts   # E2E tests for MCP integration
├── .github/workflows/
│   ├── site-e2e-smoke.yml           # Smoke tests with MCP validation
│   └── site-e2e-full.yml            # Full tests with MCP validation
└── docs/mcp/
    ├── README.md                     # This file
    ├── posthog-setup.md             # PostHog detailed setup
    ├── hubspot-setup.md             # HubSpot detailed setup
    ├── postgresql-setup.md          # PostgreSQL detailed setup
    └── grafana-setup.md             # Grafana detailed setup
```

## Troubleshooting

### Common Issues

1. **"MCP server not responding"**
   - Check internet connectivity
   - Verify API credentials in `.env.mcp`
   - Test with `./scripts/test-mcp-integration.sh`

2. **"Environment variables missing"**
   - Ensure `.env.mcp` exists and has correct values
   - Copy from `.env.mcp.template` if needed
   - Check for typos in variable names

3. **"Permission denied"**
   - Make scripts executable: `chmod +x scripts/*.sh`
   - Check file ownership and permissions

4. **"Claude Desktop not loading MCP servers"**
   - Restart Claude Desktop application
   - Check `~/.config/claude-desktop/claude_desktop_config.json`
   - Verify JSON syntax is valid

### Debug Mode

Run any script with debug output:
```bash
DEBUG=1 ./scripts/test-mcp-integration.sh
```

### Getting Help

1. Check individual setup guides in `docs/mcp/`
2. Review error logs in script output
3. Validate configuration with test script
4. Check GitHub Actions logs for CI/CD issues

## Security Considerations

- **Never commit `.env.mcp`** - contains sensitive credentials
- Use least-privilege API keys for each service
- Regularly rotate API keys and tokens
- Monitor API usage for unusual activity
- Use environment variables in CI/CD, not hardcoded values

## Performance Optimization

- MCP servers run on-demand to minimize resource usage
- Connection pooling for database connections
- Caching for frequently accessed data
- Timeout limits to prevent hanging connections
- Parallel execution where possible

## Monitoring and Alerts

The revenue optimization pipeline provides:
- **Daily automated runs** at 9 AM UTC
- **Real-time alerts** for threshold breaches
- **Weekly summary reports** with optimization recommendations
- **Integration health checks** in E2E test workflows

## Next Steps

1. Complete authentication setup for all required MCP servers
2. Run initial validation with test script
3. Verify E2E test integration in CI/CD pipelines
4. Monitor revenue metrics and optimization recommendations
5. Implement suggested optimizations for revenue targets

## Support

For issues or questions:
1. Review troubleshooting section above
2. Check individual server setup documentation
3. Run diagnostic scripts for detailed error information
4. Monitor CI/CD pipeline logs for integration issues