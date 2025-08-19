# HubSpot MCP Server Setup Guide

HubSpot integration provides CRM data and marketing automation for customer lifecycle management and LTV:CAC optimization.

## Overview

HubSpot tracks:
- Customer acquisition costs (CAC)
- Customer lifetime value (LTV)
- Sales pipeline and conversion rates
- Customer communication history
- Marketing campaign effectiveness

## Authentication Setup

### Step 1: Create HubSpot Private App

1. **Login to HubSpot**:
   - Go to https://app.hubspot.com/login
   - Login with your HubSpot account

2. **Navigate to Private Apps**:
   - Click the settings icon (gear) in the top right
   - Go to "Integrations" → "Private Apps"
   - Or directly visit: https://app.hubspot.com/settings/integrations/private-apps

3. **Create New Private App**:
   - Click "Create a private app"
   - Fill in app details:
     - **Name**: "MMTU Revenue Optimization"
     - **Description**: "MCP integration for revenue metrics tracking"

4. **Configure Scopes**:
   Select the following scopes for revenue optimization:
   
   **Contacts (Read & Write)**:
   - `contacts.read`
   - `contacts.write`
   
   **Companies (Read & Write)**:
   - `companies.read`
   - `companies.write`
   
   **Deals (Read & Write)**:
   - `deals.read`
   - `deals.write`
   
   **Tickets (Read & Write)**:
   - `tickets.read`
   - `tickets.write`
   
   **Marketing Events (Read)**:
   - `marketing-events.read`

5. **Generate Token**:
   - Click "Create app"
   - Copy the generated private app token
   - This is your `HUBSPOT_PRIVATE_APP_TOKEN`

### Step 2: Configure Environment

Add to your `.env.mcp` file:
```bash
# HubSpot Configuration
HUBSPOT_PRIVATE_APP_TOKEN=your_hubspot_private_app_token_here
```

### Step 3: Test Connection

```bash
# Test HubSpot MCP server
npx @modelcontextprotocol/server-hubspot --version

# Run full integration test
./scripts/test-mcp-integration.sh
```

## Revenue Metrics Integration

### LTV:CAC Ratio Tracking

HubSpot provides critical data for LTV:CAC calculations (≥3.0 target):

#### Customer Acquisition Cost (CAC)
```bash
# Data pulled from HubSpot:
# - Marketing spend per customer
# - Sales team costs
# - Advertising costs
# - Attribution data
```

#### Customer Lifetime Value (LTV)
```bash
# Data pulled from HubSpot:
# - Average deal size
# - Customer retention rates
# - Upsell/cross-sell revenue
# - Customer tenure
```

### Key HubSpot Objects for Revenue Tracking

1. **Contacts**:
   - Lead source attribution
   - Conversion timestamps
   - Customer segment classification
   - Engagement scores

2. **Deals**:
   - Deal value and stage
   - Sales cycle length
   - Win/loss reasons
   - Revenue attribution

3. **Companies**:
   - Account value
   - Subscription tier
   - Renewal dates
   - Expansion opportunities

## CRM Integration Points

### Lead Capture Integration

The site's CRM configuration integrates with HubSpot:

```json
// products/site/config/crm.json
{
  "form_endpoint": "https://api.hsforms.com/submissions/v3/integration/submit/PORTAL_ID/FORM_ID",
  "email_field": "email",
  "providers": {
    "hubspot": "YOUR_HUBSPOT_FORM_ENDPOINT"
  }
}
```

### E2E Testing Integration

The E2E tests validate HubSpot CRM integration:

```typescript
// products/site/e2e/mcp-integration.spec.ts
test('should capture conversion events for LTV:CAC analysis', async ({ page }) => {
  // Test CTA elements that feed into HubSpot
  // Validate customer data collection
  // Ensure proper attribution tracking
});
```

## Revenue Optimization Use Cases

### 1. Customer Acquisition Cost Analysis

```bash
# Use HubSpot MCP to calculate CAC:
# - Total marketing spend / New customers acquired
# - Track acquisition channels and costs
# - Optimize highest-performing channels
```

### 2. Lifetime Value Calculation

```bash
# Use HubSpot MCP to calculate LTV:
# - Average customer revenue over time
# - Retention rates by customer segment
# - Upsell/cross-sell opportunities
```

### 3. Sales Pipeline Optimization

- Identify bottlenecks in sales process
- Optimize conversion rates between stages
- Track sales velocity improvements
- Monitor deal size trends

### 4. Customer Segmentation

- High-value customer identification
- Retention risk analysis
- Expansion opportunity tracking
- Churn prediction modeling

## Pipeline Integration

### Revenue Optimization Pipeline

The HubSpot MCP server feeds data into the automated revenue optimization pipeline:

```bash
# scripts/revenue-optimization-pipeline.sh uses HubSpot data for:
# - LTV:CAC ratio calculations
# - Customer acquisition analysis
# - Revenue trend monitoring
# - Optimization recommendations
```

### Automated Reporting

Daily reports include HubSpot-sourced metrics:
- New customer acquisition counts
- Revenue pipeline health
- Customer lifecycle stage distribution
- CAC trends by acquisition channel

## Troubleshooting

### Common Issues

1. **"Insufficient Scopes"**:
   - Verify all required scopes are selected
   - Contacts, Companies, Deals (read/write minimum)
   - Regenerate token if scopes were added

2. **"Invalid Token"**:
   - Ensure token starts with appropriate prefix
   - Check for extra spaces or characters
   - Verify token is from correct HubSpot account

3. **"Rate Limit Exceeded"**:
   - HubSpot has API rate limits
   - Implement retry logic with exponential backoff
   - Consider reducing frequency of API calls

### Debug Commands

```bash
# Test MCP server connection
DEBUG=1 npx @modelcontextprotocol/server-hubspot

# Validate environment variables
echo "Token: ${HUBSPOT_PRIVATE_APP_TOKEN:0:10}..."

# Check Claude Desktop configuration
cat ~/.config/claude-desktop/claude_desktop_config.json | jq .mcpServers.hubspot
```

### HubSpot API Testing

```bash
# Test API connection directly
curl -X GET \
  https://api.hubapi.com/contacts/v1/lists/all/contacts/all \
  -H "Authorization: Bearer $HUBSPOT_PRIVATE_APP_TOKEN"
```

## Performance Considerations

- HubSpot API has rate limits (100 requests/10 seconds for most endpoints)
- Use batch operations when possible
- Cache frequently accessed data
- Implement proper error handling and retry logic

## Security Best Practices

- Use minimum required scopes for the private app
- Rotate private app tokens regularly
- Monitor API usage for unusual patterns
- Store tokens securely and never commit to version control

## Advanced Configuration

### Custom Properties for Revenue Tracking

Add custom properties to HubSpot objects:

```javascript
// Contact properties for revenue tracking
{
  "ltv_prediction": "number",
  "acquisition_cost": "number", 
  "revenue_segment": "enumeration",
  "retention_score": "number"
}
```

### Workflows for Revenue Optimization

Set up HubSpot workflows that trigger on:
- High-value prospect identification
- Retention risk detection
- Upsell opportunity recognition
- Churn prediction alerts

### Integration with Other Tools

Connect HubSpot with other revenue optimization tools:
- Sync customer data with PostgreSQL analytics
- Feed conversion data to PostHog
- Update Grafana dashboards with CRM metrics

## Revenue Metrics Dashboard

Key metrics to monitor in HubSpot:

1. **Acquisition Metrics**:
   - Cost per lead by channel
   - Lead-to-customer conversion rate
   - Average time to close

2. **Lifetime Value Metrics**:
   - Average customer revenue
   - Customer retention rates
   - Expansion revenue per customer

3. **Pipeline Health**:
   - Deal velocity
   - Win rate by source
   - Average deal size

## Next Steps

1. ✅ Complete HubSpot private app setup
2. ✅ Configure required scopes and generate token
3. ✅ Verify connection with test script
4. ✅ Review CRM integration points
5. 📊 Start tracking LTV:CAC metrics
6. 📈 Implement revenue optimization workflows

## Support Resources

- [HubSpot Developer Documentation](https://developers.hubspot.com/)
- [HubSpot API Reference](https://developers.hubspot.com/docs/api/overview)
- [Private Apps Guide](https://developers.hubspot.com/docs/api/private-apps)
- [MMTU Integration Tests](../scripts/test-mcp-integration.sh)