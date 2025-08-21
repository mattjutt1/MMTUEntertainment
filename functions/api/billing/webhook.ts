// Cloudflare Pages Function: Stripe Webhook handler with signature verification
// Handles: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted,
// invoice.payment_succeeded, invoice.payment_failed

import { grantEntitlements, revokeEntitlements, setDunningState } from '../../../services/billing/entitlements';

// Utility: constant-time compare
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let res = 0;
  for (let i = 0; i < a.length; i++) {
    res |= a[i] ^ b[i];
  }
  return res === 0;
}

async function hmacSHA256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  const bytes = new Uint8Array(sig);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function parseStripeSignature(sigHeader: string | null): { t: string; v1: string } | null {
  if (!sigHeader) return null;
  const parts = sigHeader.split(',').map(s => s.trim());
  const t = parts.find(p => p.startsWith('t='))?.split('=')[1];
  const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1];
  if (!t || !v1) return null;
  return { t, v1 };
}

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const secret = env.STRIPE_WEBHOOK_SECRET as string | undefined;
  if (!secret) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const sigHeader = request.headers.get('stripe-signature');
  const parsed = parseStripeSignature(sigHeader);
  const rawBody = await request.text();
  if (!parsed) return new Response('Bad signature header', { status: 400 });

  const expected = await hmacSHA256Hex(secret, `${parsed.t}.${rawBody}`);
  const expectedBytes = new TextEncoder().encode(expected);
  const providedBytes = new TextEncoder().encode(parsed.v1);
  if (!timingSafeEqual(expectedBytes, providedBytes)) {
    return new Response('Signature verification failed', { status: 400 });
  }

  // Process event
  let evt: any;
  try { evt = JSON.parse(rawBody); } catch { return new Response('Invalid JSON', { status: 400 }); }
  const type = evt?.type as string;
  try {
    switch (type) {
      case 'checkout.session.completed': {
        const customerId = evt.data?.object?.customer as string | undefined;
        const subscriptionId = evt.data?.object?.subscription as string | undefined;
        if (customerId && subscriptionId) await grantEntitlements(customerId, subscriptionId);
        break;
      }
      case 'invoice.payment_succeeded': {
        const customerId = evt.data?.object?.customer as string | undefined;
        if (customerId) await setDunningState(customerId, false);
        break;
      }
      case 'invoice.payment_failed': {
        const customerId = evt.data?.object?.customer as string | undefined;
        if (customerId) await setDunningState(customerId, true);
        break;
      }
      case 'customer.subscription.updated': {
        const customerId = evt.data?.object?.customer as string | undefined;
        const subscriptionId = evt.data?.object?.id as string | undefined;
        if (customerId && subscriptionId) await grantEntitlements(customerId, subscriptionId);
        break;
      }
      case 'customer.subscription.deleted': {
        const customerId = evt.data?.object?.customer as string | undefined;
        if (customerId) await revokeEntitlements(customerId);
        break;
      }
      default:
        // ignore other events
        break;
    }
    return new Response('ok', { status: 200 });
  } catch (err: any) {
    return new Response(`handler error: ${err?.message || 'unknown'}`, { status: 500 });
  }
};

