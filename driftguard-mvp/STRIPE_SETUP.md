# DriftGuard Stripe Setup Guide

## Step 1: Stripe Account Setup

1. Go to: https://dashboard.stripe.com
2. Create account or sign in
3. Switch to Test mode for development (toggle in top left)

## Step 2: Create Products and Pricing

### Product 1: DriftGuard Starter
1. Go to Products > Create product
2. **Name**: `DriftGuard Starter`
3. **Description**: `Essential GitHub check run aggregation for small teams`
4. **Pricing**: 
   - **Price**: `$5.00`
   - **Billing period**: `Monthly`
   - **Currency**: `USD`

### Product 2: DriftGuard Pro
1. Create another product
2. **Name**: `DriftGuard Pro`
3. **Description**: `Advanced GitHub check run aggregation with enhanced analytics`
4. **Pricing**:
   - **Price**: `$15.00`
   - **Billing period**: `Monthly`
   - **Currency**: `USD`

### Product 3: DriftGuard Enterprise
1. Create another product
2. **Name**: `DriftGuard Enterprise`
3. **Description**: `Enterprise-grade GitHub check run aggregation with premium support`
4. **Pricing**:
   - **Price**: `$25.00`
   - **Billing period**: `Monthly`
   - **Currency**: `USD`

## Step 3: Get API Keys

Go to Developers > API keys:

**Test Keys** (for development):
- **Publishable key**: `pk_test_...` (safe for client-side)
- **Secret key**: `sk_test_...` (keep secure, server-side only)

**Live Keys** (for production):
- **Publishable key**: `pk_live_...`
- **Secret key**: `sk_live_...`

## Step 4: Configure Webhooks

1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://driftguard-checks.mmtu.workers.dev/api/stripe/webhook`
4. **Events to send**:
   - [x] `checkout.session.completed`
   - [x] `customer.subscription.created`
   - [x] `customer.subscription.updated`
   - [x] `customer.subscription.deleted`
   - [x] `invoice.payment_succeeded`
   - [x] `invoice.payment_failed`

5. **Webhook signing secret**: Copy the `whsec_...` value

## Step 5: Test Webhook Endpoint

You can test webhooks using Stripe CLI:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward events to local endpoint (for testing)
stripe listen --forward-to https://driftguard-checks.mmtu.workers.dev/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

## Step 6: Create Test Checkout Session

Test the integration with a sample checkout session:

```javascript
// Test checkout session creation
const stripe = new Stripe('sk_test_...');

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: 'price_...', // Price ID from product creation
      quantity: 1,
    },
  ],
  mode: 'subscription',
  success_url: 'https://driftguard.dev/success',
  cancel_url: 'https://driftguard.dev/cancel',
  metadata: {
    github_user: 'testuser',
    repositories: '["owner/repo1", "owner/repo2"]'
  }
});

console.log('Checkout URL:', session.url);
```

## Required Environment Variables

After setup, you'll have:

**Public (can be in wrangler.toml [vars]):**
- `STRIPE_PUBLISHABLE_KEY`: `pk_test_...` or `pk_live_...`

**Secret (must use wrangler secret put):**
- `STRIPE_SECRET_KEY`: `sk_test_...` or `sk_live_...`
- `STRIPE_WEBHOOK_SECRET`: `whsec_...`

## Price IDs

After creating products, note the Price IDs:
- Starter: `price_...`
- Pro: `price_...`
- Enterprise: `price_...`

These will be used in the dashboard for checkout session creation.

## Test Cards

For testing payments, use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`

Any future expiry date, any 3-digit CVC, any 5-digit postal code.