# GitHub Marketplace Webhooks - DriftGuard

## Webhook Configuration

**Endpoint**: `https://mmtu-marketplace-webhooks.workers.dev/`
**Events**: marketplace_purchase
**Secret**: Configured in Cloudflare Workers environment

## Marketplace Purchase Events

### Event Types

#### `purchased`
- **Trigger**: New subscription started
- **Action**: Create organization record, set plan limits, send welcome email
- **Plan Mapping**: Extract plan from `marketplace_purchase.plan.name`

#### `pending_change`
- **Trigger**: Plan change initiated but not yet effective
- **Action**: Log pending change, prepare for transition
- **Note**: No immediate plan updates until `changed` event

#### `changed`
- **Trigger**: Plan change is now effective (upgrade/downgrade)
- **Action**: Update organization limits, adjust billing cycle
- **Plan Transition**: Map new plan to feature set and repository limits

#### `cancelled`
- **Trigger**: Subscription cancelled
- **Action**: Set grace period, disable features after 30 days, export data
- **Retention**: Maintain read-only access during grace period

## Plan Mapping

### Plan Configuration
```typescript
const PLANS = {
  "starter": {
    price: 99,
    repositories: 10,
    reports_per_month: 1,
    api_access: false
  },
  "growth": {
    price: 299,
    repositories: 50,
    reports_per_month: 4,
    api_access: true
  },
  "audit_ready": {
    price: 799,
    repositories: -1, // unlimited
    reports_per_month: -1, // unlimited
    api_access: true,
    custom_frameworks: true,
    dedicated_support: true
  }
};
```

### Trial Handling
- **Free Trial**: 14 days, 3 repositories, 5 PR checks
- **Trial Conversion**: Automatic upgrade to selected plan
- **Trial Extensions**: Manual approval for enterprise prospects

## Security

### Webhook Verification
- **Signature**: `x-hub-signature-256` HMAC validation
- **Secret**: Stored in Cloudflare Workers environment variables
- **Timing Attack Protection**: Constant-time comparison

### Error Handling
- **Invalid Signature**: 401 Unauthorized
- **Malformed Payload**: 400 Bad Request
- **Processing Errors**: Log and retry with exponential backoff

## Data Flow

1. **GitHub** → Webhook payload with plan change
2. **Worker** → Verify signature and extract plan details
3. **Supabase** → Update organization plan and limits
4. **PostHog** → Track plan change events for analytics
5. **Email** → Notify organization admin of change

## Monitoring

### Webhook Health
- Response time tracking
- Error rate monitoring
- Signature validation failures
- Plan change success rates

### Alerting
- Failed webhook processing (> 5% error rate)
- Signature validation failures (potential security issue)
- Plan downgrade errors (billing issue)

## Testing

### Local Development
```bash
# Install webhook testing tool
npm install -g @shopify/ngrok

# Expose local development server
ngrok http 3000

# Configure test webhook in GitHub
```

### Payload Examples
See `tests/fixtures/marketplace-webhooks.json` for sample payloads for each event type.

## Support

For webhook configuration issues:
- **Technical**: [dev@mmtuentertainment.com](mailto:dev@mmtuentertainment.com)
- **Billing**: [billing@mmtuentertainment.com](mailto:billing@mmtuentertainment.com)
- **Emergencies**: Slack #driftguard-alerts