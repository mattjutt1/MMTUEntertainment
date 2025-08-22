# @mmtu/feature-flags

Remote feature flags with Supabase integration and gatekeeper control.

## Quick Start

```typescript
import { createFeatureFlagClient, featureFlags } from '@mmtu/feature-flags'

// Initialize client (once per application)
const client = createFeatureFlagClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  enableRealtime: true,
  fallbackFlags: {
    'post_purchase_bundle_v1_pct': 0,
    'overlay_pricing_ab_v1_enabled': 100
  }
})

// Use flags
if (featureFlags.shouldShowBundleUpsell(orderId)) {
  // Show bundle upsell UI
}
```

## Features

- **Gatekeeper Control**: Only service role can update flags via `/scripts/set_flag.ts`
- **Realtime Updates**: Flags sync automatically across all clients
- **Deterministic Bucketing**: Consistent user assignment with `hash(userId + flagName) % 100`
- **Fallback Support**: Graceful degradation when Supabase unavailable
- **Type Safety**: Full TypeScript support with interfaces

## Flag Management

```bash
# Set bundle upsell to 25% (requires gatekeeper approval)
node scripts/set_flag.ts post_purchase_bundle_v1_pct 25

# Enable pricing experiment (emergency override)
node scripts/set_flag.ts overlay_pricing_ab_v1_enabled 100 --emergency

# List all flags
node scripts/set_flag.ts --list
```

## Valid Flags

- `post_purchase_bundle_v1_pct`: Bundle upsell percentage (0-100)
- `overlay_pricing_ab_v1_enabled`: Pricing experiment enabled (0/100)  
- `driftguard_marketplace_v1_enabled`: Marketplace tracking (0/100)

## Flag Progression

Valid transitions (enforced by gatekeeper):
- **Launch**: 0% → 25% → 50% → 100%
- **Rollback**: 100% → 50% → 25% → 0%

## Environment Setup

```bash
# Required environment variables
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # For CLI only
```

## Integration Examples

### Bundle Upsell (Post-Purchase)

```typescript
import { featureFlags } from '@mmtu/feature-flags'

// In checkout success component
const orderId = searchParams.get('order_id')
const showBundle = featureFlags.shouldShowBundleUpsell(orderId)

return (
  <div>
    {showBundle && <BundleUpsellCard orderId={orderId} />}
  </div>
)
```

### Pricing Experiment

```typescript
import { featureFlags } from '@mmtu/feature-flags'

// Pricing experiment runs at 100% but tracks arms separately
const experimentEnabled = featureFlags.isPricingExperimentEnabled()

// Uses existing pricing.ts multi-arm bandit for $19/$9 assignment
```

### Marketplace Tracking

```typescript
import { featureFlags } from '@mmtu/feature-flags'

// Track DriftGuard marketplace events only when enabled
const trackingEnabled = featureFlags.isMarketplaceTrackingEnabled()

if (trackingEnabled) {
  analytics.track('marketplace_view', { source: 'github' })
}
```

## Security Model

1. **Database RLS**: Only `service_role` can write to `feature_flags` table
2. **CLI Gatekeeper**: `/scripts/set_flag.ts` validates transitions and logs decisions
3. **Emergency Override**: `--emergency` flag for incident response (use sparingly)
4. **Audit Trail**: All changes logged to `.orchestrator/runlog.jsonl`

## Architecture

- **Client**: `FeatureFlagClient` class with Supabase integration
- **Realtime**: PostgreSQL triggers notify clients of flag changes
- **Bucketing**: Deterministic hashing ensures consistent assignment
- **Fallbacks**: Local config when Supabase unavailable
- **Management**: CLI tool with gatekeeper approval workflow