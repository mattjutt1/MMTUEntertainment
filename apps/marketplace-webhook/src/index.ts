/**
 * DriftGuard Marketplace Webhook Handler
 * Processes GitHub Marketplace purchase events for revenue tracking
 */

export interface Env {
  GITHUB_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  POSTHOG_PROJECT_ID: string;
  POSTHOG_API_KEY: string;
}

interface MarketplacePurchaseEvent {
  action: 'purchased' | 'cancelled' | 'changed' | 'pending_change_cancelled';
  effective_date: string;
  sender: {
    login: string;
    id: number;
    type: 'Organization' | 'User';
  };
  marketplace_purchase: {
    account: {
      type: 'Organization' | 'User';
      id: number;
      login: string;
    };
    billing_cycle: 'monthly' | 'yearly';
    unit_count: number;
    on_free_trial: boolean;
    free_trial_ends_on: string | null;
    next_billing_date: string;
    plan: {
      id: number;
      name: string;
      description: string;
      monthly_price_in_cents: number;
      yearly_price_in_cents: number;
      price_model: 'flat-rate' | 'per-unit';
      has_free_trial: boolean;
      unit_name: string | null;
      bullets: string[];
    };
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, X-Hub-Signature-256, X-GitHub-Event',
        },
      });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Verify GitHub webhook signature
      const signature = request.headers.get('X-Hub-Signature-256');
      const githubEvent = request.headers.get('X-GitHub-Event');
      
      if (!signature || githubEvent !== 'marketplace_purchase') {
        return new Response('Invalid webhook', { status: 400 });
      }

      const body = await request.text();
      
      // Verify signature
      const isValid = await verifyGitHubSignature(body, signature, env.GITHUB_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('Invalid GitHub signature');
        return new Response('Unauthorized', { status: 401 });
      }

      // Parse webhook payload
      const event: MarketplacePurchaseEvent = JSON.parse(body);
      
      console.log(`Processing ${event.action} event for ${event.marketplace_purchase.account.login}`);

      // Track revenue event in PostHog
      await trackMarketplaceEvent(event, env);

      // Store subscription data in Supabase
      await updateSubscriptionRecord(event, env);

      return new Response('Webhook processed successfully', { status: 200 });

    } catch (error) {
      console.error('Webhook processing error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  },
};

async function verifyGitHubSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const payloadData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, payloadData);
  const expectedSignature = 'sha256=' + Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedSignature;
}

async function trackMarketplaceEvent(event: MarketplacePurchaseEvent, env: Env): Promise<void> {
  const baseEvent = {
    timestamp: new Date().toISOString(),
    distinct_id: `github_${event.marketplace_purchase.account.type.toLowerCase()}_${event.marketplace_purchase.account.id}`,
    properties: {
      $lib: 'driftguard-marketplace-webhook',
      $lib_version: '1.0.0',
      account_type: event.marketplace_purchase.account.type.toLowerCase(),
      account_login: event.marketplace_purchase.account.login,
      account_id: event.marketplace_purchase.account.id,
      plan_name: event.marketplace_purchase.plan.name,
      plan_id: event.marketplace_purchase.plan.id,
      billing_cycle: event.marketplace_purchase.billing_cycle,
      unit_count: event.marketplace_purchase.unit_count,
      on_free_trial: event.marketplace_purchase.on_free_trial,
      price_model: event.marketplace_purchase.plan.price_model,
      app_id: 'driftguard_checks'
    }
  };

  let eventName: string;
  let additionalProps = {};

  switch (event.action) {
    case 'purchased':
      eventName = 'marketplace_purchase_completed';
      additionalProps = {
        monthly_price_cents: event.marketplace_purchase.plan.monthly_price_in_cents,
        yearly_price_cents: event.marketplace_purchase.plan.yearly_price_in_cents,
        next_billing_date: event.marketplace_purchase.next_billing_date,
        revenue_cents: event.marketplace_purchase.billing_cycle === 'monthly' 
          ? event.marketplace_purchase.plan.monthly_price_in_cents 
          : event.marketplace_purchase.plan.yearly_price_in_cents,
        revenue_usd: (event.marketplace_purchase.billing_cycle === 'monthly' 
          ? event.marketplace_purchase.plan.monthly_price_in_cents 
          : event.marketplace_purchase.plan.yearly_price_in_cents) / 100
      };
      break;

    case 'cancelled':
      eventName = 'marketplace_subscription_cancelled';
      additionalProps = {
        cancellation_date: event.effective_date
      };
      break;

    case 'changed':
      eventName = 'marketplace_subscription_changed';
      additionalProps = {
        change_date: event.effective_date,
        new_monthly_price_cents: event.marketplace_purchase.plan.monthly_price_in_cents,
        new_yearly_price_cents: event.marketplace_purchase.plan.yearly_price_in_cents
      };
      break;

    case 'pending_change_cancelled':
      eventName = 'marketplace_pending_change_cancelled';
      additionalProps = {
        cancelled_date: event.effective_date
      };
      break;

    default:
      console.warn(`Unknown marketplace action: ${event.action}`);
      return;
  }

  const postHogEvent = {
    ...baseEvent,
    event: eventName,
    properties: {
      ...baseEvent.properties,
      ...additionalProps
    }
  };

  // Send to PostHog
  const response = await fetch('https://app.posthog.com/capture/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: env.POSTHOG_API_KEY,
      event: postHogEvent.event,
      properties: postHogEvent.properties,
      distinct_id: postHogEvent.distinct_id,
      timestamp: postHogEvent.timestamp
    })
  });

  if (!response.ok) {
    throw new Error(`PostHog tracking failed: ${response.status}`);
  }

  console.log(`Tracked ${eventName} for ${event.marketplace_purchase.account.login}`);
}

async function updateSubscriptionRecord(event: MarketplacePurchaseEvent, env: Env): Promise<void> {
  const subscriptionData = {
    account_type: event.marketplace_purchase.account.type.toLowerCase(),
    account_login: event.marketplace_purchase.account.login,
    account_id: event.marketplace_purchase.account.id,
    plan_id: event.marketplace_purchase.plan.id,
    plan_name: event.marketplace_purchase.plan.name,
    billing_cycle: event.marketplace_purchase.billing_cycle,
    unit_count: event.marketplace_purchase.unit_count,
    on_free_trial: event.marketplace_purchase.on_free_trial,
    free_trial_ends_on: event.marketplace_purchase.free_trial_ends_on,
    next_billing_date: event.marketplace_purchase.next_billing_date,
    monthly_price_cents: event.marketplace_purchase.plan.monthly_price_in_cents,
    yearly_price_cents: event.marketplace_purchase.plan.yearly_price_in_cents,
    price_model: event.marketplace_purchase.plan.price_model,
    status: event.action === 'cancelled' ? 'cancelled' : 'active',
    last_event_action: event.action,
    last_updated: new Date().toISOString(),
    effective_date: event.effective_date
  };

  // Upsert subscription record in Supabase
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/marketplace_subscriptions`, {
    method: 'POST',
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(subscriptionData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase update failed: ${response.status} - ${errorText}`);
  }

  console.log(`Updated subscription record for ${event.marketplace_purchase.account.login}`);
}