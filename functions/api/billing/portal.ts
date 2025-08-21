// Cloudflare Pages Function: Create Stripe Billing Portal Session
export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Expected application/json' }), { status: 400 });
    }
    const { customerId, returnUrl } = await request.json();
    if (!customerId || !returnUrl) {
      return new Response(JSON.stringify({ error: 'Missing customerId/returnUrl' }), { status: 400 });
    }
    const secret = env.STRIPE_SECRET_KEY as string | undefined;
    if (!secret) {
      return new Response(JSON.stringify({ error: 'Stripe secret not configured' }), { status: 500 });
    }

    const body = new URLSearchParams();
    body.set('customer', customerId);
    body.set('return_url', returnUrl);

    const resp = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
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

