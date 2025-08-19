# PostHog MCP Server Setup Guide

PostHog integration provides product analytics and user behavior tracking for revenue optimization.

## Overview

PostHog tracks:
- User sessions and page views
- Conversion events in revenue funnel
- Feature adoption and usage patterns
- A/B test results and performance
- Customer journey analytics

## Authentication Setup

### Step 1: Get PostHog API Key

1. **Login to PostHog**:
   - Go to https://app.posthog.com/login
   - Login with your PostHog account

2. **Navigate to Project Settings**:
   - Click on your project name in the top left
   - Go to "Settings" → "Project Details"
   - Or directly visit: https://app.posthog.com/settings/project-details

3. **Copy API Key**:
   - Find the "Project API Key" section
   - Copy the API key (starts with `phc_`)
   - This is your `POSTHOG_API_KEY`

4. **Optional - Set Custom Host**:
   - If using self-hosted PostHog, note your instance URL
   - For PostHog Cloud, use: `https://app.posthog.com`

### Step 2: Configure Environment

Add to your `.env.mcp` file:
```bash
# PostHog Configuration
POSTHOG_API_KEY=phc_your_actual_api_key_here
POSTHOG_HOST=https://app.posthog.com
```

### Step 3: Test Connection

```bash
# Test PostHog MCP server
npx @modelcontextprotocol/server-posthog --version

# Run full integration test
./scripts/test-mcp-integration.sh
```

## Revenue Metrics Integration

### Key Events for Revenue Tracking

PostHog tracks these critical events for MMTU Entertainment:

1. **Page Views**:
   - Landing page visits
   - Offer page views (97/297/997)
   - Checkout page visits

2. **Conversion Events**:
   - CTA clicks
   - Email signups
   - Purchase completions
   - Subscription activations

3. **Retention Events**:
   - Return visits
   - Feature usage
   - Engagement depth
   - Week 4+ activity

### Week 4 Retention Tracking

PostHog specifically monitors Week 4 retention (≥20% target):

```javascript
// Example: Track retention events
posthog.track('user_returned_week_4', {
  user_id: userId,
  cohort_date: cohortDate,
  retention_week: 4,
  days_since_signup: 28
});
```

## Site Integration

### Analytics Script Integration

The site already includes analytics tracking. PostHog events are automatically captured:

```javascript
// products/site/js/analytics.js integration
if (window.posthog) {
  // Track page views
  posthog.track('page_view', {
    page: window.location.pathname,
    revenue_funnel_step: getFunnelStep()
  });
  
  // Track conversions
  posthog.track('cta_click', {
    offer_type: getOfferType(),
    cta_position: getCtaPosition()
  });
}
```

### E2E Testing Integration

The E2E tests validate PostHog integration:

```typescript
// products/site/e2e/mcp-integration.spec.ts
test('should track page views for revenue funnel analysis', async ({ page }) => {
  await page.goto('/');
  // Analytics events are automatically tracked
  // PostHog MCP server provides data for optimization
});
```

## Revenue Optimization Use Cases

### 1. Conversion Funnel Analysis

```bash
# Use PostHog MCP to analyze funnel performance
# This data feeds into LTV:CAC ratio calculations
```

### 2. User Behavior Insights

- Identify high-value user paths
- Optimize low-performing pages
- A/B test different offer presentations
- Track feature adoption rates

### 3. Retention Optimization

- Monitor Week 4 retention rates
- Identify retention-driving features
- Track user engagement patterns
- Optimize onboarding flow

## Troubleshooting

### Common Issues

1. **"Invalid API Key"**:
   - Verify key starts with `phc_`
   - Check for extra spaces or characters
   - Ensure key is from correct PostHog project

2. **"Connection Timeout"**:
   - Check internet connectivity
   - Verify POSTHOG_HOST URL is correct
   - For self-hosted, ensure server is accessible

3. **"No Data Appearing"**:
   - Events may take a few minutes to appear
   - Check PostHog project is active
   - Verify events are being sent correctly

### Debug Commands

```bash
# Test MCP server connection
DEBUG=1 npx @modelcontextprotocol/server-posthog

# Validate environment variables
echo "API Key: ${POSTHOG_API_KEY:0:10}..."
echo "Host: $POSTHOG_HOST"

# Check Claude Desktop configuration
cat ~/.config/claude-desktop/claude_desktop_config.json | jq .mcpServers.posthog
```

## Performance Considerations

- PostHog has rate limits on API calls
- Events are batched for optimal performance
- Historical data queries are cached
- Real-time events have minimal latency

## Security Best Practices

- Use read-only API keys when possible
- Rotate API keys regularly
- Monitor API usage for unusual patterns
- Never expose API keys in client-side code

## Advanced Configuration

### Custom Event Properties

Track additional revenue-specific properties:

```javascript
posthog.track('purchase_completed', {
  revenue: 297.00,
  offer_type: 'mid_tier',
  customer_segment: 'new',
  ltv_prediction: 890.00
});
```

### Cohort Analysis

Set up cohorts for retention analysis:

```javascript
posthog.group('company', companyId, {
  subscription_tier: 'premium',
  signup_date: '2024-01-15',
  revenue_segment: 'high_value'
});
```

## Next Steps

1. ✅ Complete PostHog authentication setup
2. ✅ Verify connection with test script
3. ✅ Review site analytics integration
4. ✅ Monitor E2E test results
5. 📊 Start tracking revenue metrics
6. 📈 Implement optimization recommendations

## Support Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog API Reference](https://posthog.com/docs/api)
- [PostHog Community](https://posthog.com/questions)
- [MMTU Integration Tests](../scripts/test-mcp-integration.sh)