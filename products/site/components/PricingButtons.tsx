// Minimal TSX component (not wired by a bundler here) that documents intent.
// The live site scripts are added inline in pages to keep changes minimal.
export type Plan = 'free' | 'pro' | 'team';

export interface CheckoutRequest {
  priceId: string;
  quantity?: number;
  successUrl: string;
  cancelUrl: string;
}

export async function startCheckout(req: CheckoutRequest): Promise<string | undefined> {
  const res = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'checkout failed');
  return data.url as string | undefined;
}

export async function openPortal(customerId: string, returnUrl: string): Promise<string | undefined> {
  const res = await fetch('/api/billing/portal', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ customerId, returnUrl }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'portal failed');
  return data.url as string | undefined;
}

