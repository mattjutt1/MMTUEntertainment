// Cloudflare Pages Function: Create Stripe Checkout Session (subscription)
export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Expected application/json' }), { status: 400 });
    }
    const { priceId, quantity = 1, successUrl, cancelUrl } = await request.json();
    if (!priceId || !successUrl || !cancelUrl) {
      return new Response(JSON.stringify({ error: 'Missing priceId/successUrl/cancelUrl' }), { status: 400 });
    }
    const secret = env.STRIPE_SECRET_KEY as string | undefined;
    if (!secret) {
      return new Response(JSON.stringify({ error: 'Stripe secret not configured' }), { status: 500 });
    }

    // Stripe Checkout via REST (edge-safe)
    const body = new URLSearchParams();
    body.set('mode', 'subscription');
    body.set('billing_mode[type]', 'flexible');
    body.set('success_url', successUrl);
    body.set('cancel_url', cancelUrl);
    body.append('line_items[0][price]', priceId);
    body.append('line_items[0][quantity]', String(quantity));

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });
    const data = await resp.json<any>();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Stripe error' }), { status: 502 });
    }
    return new Response(JSON.stringify({ id: data.id, url: data.url }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), { status: 500 });
  }
};

