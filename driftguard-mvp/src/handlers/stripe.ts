/**
 * Stripe Payment Handler
 * Manages subscription billing and webhook processing
 */

import Stripe from 'stripe';
import type { Env } from '../index';
import { jsonResponse, errorResponse } from '../utils/response';
import { validateSignature } from '../utils/security';

export async function handleStripeWebhook(
  request: Request,
  env: Env,
  services: { stripe: Stripe; supabase: any; posthog: any }
): Promise<Response> {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    // Verify webhook signature
    if (!signature) {
      return errorResponse('Missing Stripe signature', 400);
    }

    let event: Stripe.Event;
    try {
      event = services.stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err);
      return errorResponse('Invalid webhook signature', 400);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        return await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, env, services);

      case 'customer.subscription.created':
        return await handleSubscriptionCreated(event.data.object as Stripe.Subscription, env, services);

      case 'customer.subscription.updated':
        return await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, env, services);

      case 'customer.subscription.deleted':
        return await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, env, services);

      case 'invoice.payment_succeeded':
        return await handlePaymentSucceeded(event.data.object as Stripe.Invoice, env, services);

      case 'invoice.payment_failed':
        return await handlePaymentFailed(event.data.object as Stripe.Invoice, env, services);

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
        return jsonResponse({ message: 'Event received but not processed', type: event.type });
    }

  } catch (error) {
    console.error('Stripe webhook error:', error);
    
    services.posthog.capture({
      distinctId: 'system',
      event: 'stripe_webhook_error',
      properties: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    });

    return errorResponse('Failed to process Stripe webhook', 500);
  }
}

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  env: Env,
  services: { stripe: Stripe; supabase: any; posthog: any }
): Promise<Response> {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Retrieve subscription details
  const subscription = await services.stripe.subscriptions.retrieve(subscriptionId);
  const customer = await services.stripe.customers.retrieve(customerId);

  // Extract metadata from checkout session
  const metadata = session.metadata || {};
  const githubInstallationId = metadata.github_installation_id;
  const accountLogin = metadata.account_login;

  if (!githubInstallationId || !accountLogin) {
    console.error('Missing required metadata in checkout session:', metadata);
    return errorResponse('Missing installation metadata', 400);
  }

  // Create or update subscription record
  await services.supabase
    .from('subscriptions')
    .upsert({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      github_installation_id: parseInt(githubInstallationId),
      account_login: accountLogin,
      status: subscription.status,
      plan_name: subscription.items.data[0].price.nickname || 'Unknown',
      price_id: subscription.items.data[0].price.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  // Track successful subscription creation
  services.posthog.capture({
    distinctId: accountLogin,
    event: 'subscription_created',
    properties: {
      customer_id: customerId,
      subscription_id: subscriptionId,
      plan_name: subscription.items.data[0].price.nickname,
      amount: subscription.items.data[0].price.unit_amount,
      currency: subscription.currency,
      github_installation_id: githubInstallationId,
    },
  });

  return jsonResponse({ message: 'Checkout completed successfully' });
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  env: Env,
  services: { stripe: Stripe; supabase: any; posthog: any }
): Promise<Response> {
  const customerId = subscription.customer as string;
  
  // Update subscription status
  await services.supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  return jsonResponse({ message: 'Subscription created' });
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  env: Env,
  services: { stripe: Stripe; supabase: any; posthog: any }
): Promise<Response> {
  const customerId = subscription.customer as string;
  
  // Update subscription status and period
  await services.supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      plan_name: subscription.items.data[0].price.nickname || 'Unknown',
      price_id: subscription.items.data[0].price.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Track subscription changes
  services.posthog.capture({
    distinctId: customerId,
    event: 'subscription_updated',
    properties: {
      subscription_id: subscription.id,
      status: subscription.status,
      plan_name: subscription.items.data[0].price.nickname,
    },
  });

  return jsonResponse({ message: 'Subscription updated' });
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  env: Env,
  services: { stripe: Stripe; supabase: any; posthog: any }
): Promise<Response> {
  const customerId = subscription.customer as string;
  
  // Mark subscription as cancelled
  await services.supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Track cancellation
  services.posthog.capture({
    distinctId: customerId,
    event: 'subscription_cancelled',
    properties: {
      subscription_id: subscription.id,
      reason: subscription.cancellation_details?.reason || 'unknown',
    },
  });

  return jsonResponse({ message: 'Subscription cancelled' });
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  env: Env,
  services: { stripe: Stripe; supabase: any; posthog: any }
): Promise<Response> {
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  // Update last payment date
  await services.supabase
    .from('subscriptions')
    .update({
      last_payment_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  // Track successful payment
  services.posthog.capture({
    distinctId: customerId,
    event: 'payment_succeeded',
    properties: {
      invoice_id: invoice.id,
      subscription_id: subscriptionId,
      amount: invoice.amount_paid,
      currency: invoice.currency,
    },
  });

  return jsonResponse({ message: 'Payment processed successfully' });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  env: Env,
  services: { stripe: Stripe; supabase: any; posthog: any }
): Promise<Response> {
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  // Track failed payment
  services.posthog.capture({
    distinctId: customerId,
    event: 'payment_failed',
    properties: {
      invoice_id: invoice.id,
      subscription_id: subscriptionId,
      amount: invoice.amount_due,
      currency: invoice.currency,
      attempt_count: invoice.attempt_count,
    },
  });

  // TODO: Send notification email to customer
  // TODO: Update subscription status if multiple failures

  return jsonResponse({ message: 'Payment failure recorded' });
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  env: Env,
  stripe: Stripe,
  options: {
    priceId: string;
    customerId?: string;
    customerEmail?: string;
    metadata: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
  }
): Promise<Stripe.Checkout.Session> {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: options.priceId,
        quantity: 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    metadata: options.metadata,
    subscription_data: {
      metadata: options.metadata,
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer_update: {
      address: 'auto',
      name: 'auto',
    },
  };

  if (options.customerId) {
    sessionParams.customer = options.customerId;
  } else if (options.customerEmail) {
    sessionParams.customer_email = options.customerEmail;
  }

  return await stripe.checkout.sessions.create(sessionParams);
}

/**
 * Pricing configuration
 */
export const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    price: 5,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 5 repositories',
      'Basic check runs',
      'Email support',
      'Standard analytics',
    ],
  },
  professional: {
    name: 'Professional',
    price: 15,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited repositories',
      'Advanced analytics',
      'Team management',
      'Priority support',
      'Custom integrations',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 25,
    currency: 'usd',
    interval: 'month',
    features: [
      'Everything in Professional',
      'SOC 2 compliance',
      'SSO integration',
      '99.9% SLA',
      'Dedicated support',
      'Custom onboarding',
    ],
  },
} as const;