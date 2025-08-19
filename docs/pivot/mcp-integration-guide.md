# MCP Integration Guide for MMTU Entertainment

## Business Analytics MCP Servers

### PostHog (Revenue Analytics)
**Purpose**: Track revenue metrics, funnel analysis, and user behavior aligned with pivot strategy.

**Installation**: Already configured
```bash
claude mcp add posthog "npx -y mcp-remote@latest https://mcp.posthog.com/mcp"
```

**Authentication**: 
- Get Personal API key from: https://app.posthog.com/settings/user-api-keys?preset=mcp_server
- Set environment variable: `POSTHOG_AUTH_HEADER="Bearer YOUR_API_KEY"`

**Revenue Focus Applications**:
- W4 conversion tracking (≥20% target)
- LTV:CAC ratio analysis (≥3.0 target) 
- Smoke conversion monitoring (≥5% target)
- Gross margin calculation support (≥60% target)

### HubSpot (CRM Integration)
**Purpose**: Customer relationship management and sales funnel optimization.

**Installation**: Already configured  
```bash
claude mcp add hubspot "npx @hubspot/mcp-server@latest"
```

**Authentication**:
- Create private app in HubSpot Settings > Integrations > Private Apps
- Set environment variable: `PRIVATE_APP_ACCESS_TOKEN="your-token"`

**Revenue Focus Applications**:
- Lead qualification scoring
- Sales pipeline optimization
- Customer lifetime value tracking
- Revenue attribution analysis

### PostgreSQL (Data Warehouse)
**Purpose**: Customer data analysis and revenue query capabilities.

**Installation**: Already configured
```bash
claude mcp add postgresql "npx @henkey/postgres-mcp-server"
```

**Authentication**: Database connection string required
- Format: `postgresql://user:password@host:port/database`

**Revenue Focus Applications**:
- Customer data warehouse queries
- Revenue trend analysis
- Product performance metrics
- Churn analysis and prediction

## Infrastructure Monitoring MCP Servers

### Grafana (Observability)
**Purpose**: Monitor application performance and business metrics dashboards.

**Installation**: Already configured
```bash
claude mcp add grafana "docker run --rm -i mcp/grafana -t stdio"
```

**Authentication**:
- `GRAFANA_URL`: Your Grafana instance URL
- `GRAFANA_API_KEY`: Service account token

**Revenue Focus Applications**:
- Revenue dashboard monitoring
- Application performance impact on conversions
- Real-time business metrics visualization

### Kubernetes (Container Orchestration)
**Purpose**: Manage containerized applications and ensure high availability.

**Installation**: Already configured
```bash
claude mcp add kubernetes "npx mcp-server-kubernetes"
```

**Authentication**: Requires configured kubectl context

**Revenue Focus Applications**:
- Production environment stability
- Scaling based on traffic/revenue patterns
- Cost optimization for infrastructure

### Docker (Container Management)
**Purpose**: Container lifecycle management and development environment consistency.

**Installation**: Already configured
```bash
claude mcp add docker "npx @smithery/cli install docker-mcp"
```

**Authentication**: Requires Docker Engine running

**Revenue Focus Applications**:
- Development environment standardization
- Container resource optimization
- Deployment reliability

## Additional Development MCP Servers

### GitHub (Version Control)
**Purpose**: Code repository management and development workflow automation.

**Status**: ✅ Connected
- Enables repository analysis and contribution tracking
- Supports automated quality gates and deployment workflows

### Memory (Session Context)
**Purpose**: Maintain context across AI sessions for complex multi-stage operations.

**Status**: ✅ Connected
- Preserves project context and decision history
- Supports long-term strategic planning sessions

### Filesystem (Project Access)
**Purpose**: Direct project file system access for comprehensive analysis.

**Status**: ✅ Connected
- Scoped to: `/home/matt/MMTUEntertainment`
- Enables full project structure analysis and modifications

### Time (Temporal Operations)
**Purpose**: Time-based operations and scheduling support.

**Status**: ✅ Connected
- Supports automated scheduling and time-based metrics
- Enables temporal analysis of revenue trends

### Fetch (Web Integration)
**Purpose**: External data integration and web API access.

**Status**: ✅ Connected
- Supports integration with external revenue data sources
- Enables competitive analysis and market research

## Integration Workflows

### Revenue Monitoring Workflow
1. **PostHog**: Collect conversion and revenue metrics
2. **HubSpot**: Track customer lifecycle and sales data  
3. **PostgreSQL**: Store and analyze customer data warehouse
4. **Grafana**: Visualize real-time business metrics dashboard

### Development Efficiency Workflow
1. **GitHub**: Version control and code quality gates
2. **Docker**: Consistent development environments
3. **Kubernetes**: Production deployment management
4. **Grafana**: Application performance monitoring

### Strategic Analysis Workflow
1. **Memory**: Preserve strategic context across sessions
2. **Filesystem**: Analyze entire project structure
3. **Time**: Track temporal trends and schedule reviews
4. **Fetch**: Gather external market intelligence

## Authentication Setup Priority

### High Priority (Revenue Impact)
1. **PostHog**: Direct revenue tracking capability
2. **HubSpot**: Customer relationship optimization
3. **PostgreSQL**: Customer data analysis

### Medium Priority (Operational)
1. **Grafana**: Performance monitoring
2. **Kubernetes**: Production stability

### Low Priority (Development)
1. **Docker**: Development environment (already functional)
2. **GitHub**: Already connected and functional

## Revenue Optimization Automation

The system includes automated revenue monitoring via:
- `/home/matt/MMTUEntertainment/scripts/revenue-optimization.sh`
- Checks LTV:CAC ≥ 3, W4 ≥ 20%, Gross margin ≥ 60%
- Generates automated reports in `/pivot-checks/`
- Integrates with MCP servers for data collection

## Next Steps

1. **Immediate**: Configure authentication for PostHog and HubSpot
2. **Week 1**: Set up revenue dashboard in Grafana
3. **Week 2**: Implement automated revenue threshold alerts
4. **Week 3**: Create comprehensive business intelligence workflows
5. **Month 1**: Full integration of all MCP servers with business operations

This integration strategy aligns with MMTU Entertainment's pivot to revenue-focused operations while maintaining operational excellence through comprehensive monitoring and automation.