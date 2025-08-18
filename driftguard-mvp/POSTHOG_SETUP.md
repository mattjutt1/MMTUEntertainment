# DriftGuard PostHog Analytics Setup Guide

## Step 1: Create PostHog Account

1. Go to: https://app.posthog.com/signup
2. Create account (free tier available)
3. Choose deployment:
   - **PostHog Cloud** (recommended for MVP)
   - Self-hosted (for enterprise)

## Step 2: Create Project

1. After signup, create a new project
2. **Project name**: `DriftGuard MVP`
3. **Company name**: Your company name
4. **Industry**: Developer Tools / SaaS

## Step 3: Get Project API Key

1. Go to Project Settings > Project API Key
2. Copy the **Project API Key**: `phc_...`
3. Note the **API Host**: `https://app.posthog.com` (for cloud)

## Step 4: Configure Events

Our Worker tracks these events (already implemented in code):

### Event 1: `ctrf_report_processed`
**Properties:**
- `repository`: Repository name (e.g., "owner/repo")
- `tool`: Testing tool name (e.g., "Jest", "Playwright")
- `status`: Report status ("passed", "failed", "skipped")
- `test_count`: Number of tests
- `failed_count`: Number of failed tests
- `duration_ms`: Test duration in milliseconds
- `has_metadata`: Whether additional metadata was provided

### Event 2: `ctrf_ingestion_error`
**Properties:**
- `error`: Error message
- `timestamp`: Error timestamp

## Step 5: Dashboard Setup

Create dashboards to track:

### Dashboard 1: DriftGuard Usage
- Total reports processed (daily/weekly/monthly)
- Success vs failure rates
- Most active repositories
- Most used testing tools

### Dashboard 2: Performance Metrics
- Average processing time
- Error rates by endpoint
- API response times
- Rate limit hits

### Dashboard 3: Business Metrics
- User adoption (distinct repositories)
- Feature usage (dashboard views, API calls)
- Subscription events (when Stripe integration is active)

## Step 6: Test Integration

Test PostHog integration:

```javascript
import { PostHog } from 'posthog-node'

const posthog = new PostHog('phc_your_api_key', {
  host: 'https://app.posthog.com',
  flushAt: 1, // Flush immediately for testing
  flushInterval: 0
})

// Test event
posthog.capture({
  distinctId: 'test-user',
  event: 'test_event',
  properties: {
    test_property: 'test_value'
  }
})

await posthog.flush() // Ensure event is sent
```

## Step 7: Privacy Compliance

PostHog configuration for privacy:

1. **Data Retention**: Set appropriate retention periods
2. **IP Anonymization**: Enable if required
3. **GDPR Compliance**: Configure data deletion policies
4. **Cookie Settings**: Configure for website tracking (if needed)

## Required Environment Variables

After setup, you'll have:
- `POSTHOG_API_KEY`: `phc_...` (can be public in wrangler.toml [vars])

## Events Already Implemented

The following events are already tracked in our Worker code:

1. **`ctrf_report_processed`** - When CTRF report is successfully processed
2. **`ctrf_ingestion_error`** - When CTRF ingestion fails

Events include relevant properties and are automatically flushed for serverless environments.

## Analytics Goals

Track these key metrics:
- **Adoption**: Unique repositories using DriftGuard
- **Usage**: Number of reports processed per day/week/month
- **Quality**: Success rates and error patterns
- **Performance**: Processing times and bottlenecks
- **Business**: Conversion from free trial to paid plans

PostHog will provide insights into user behavior and system performance to guide product development.