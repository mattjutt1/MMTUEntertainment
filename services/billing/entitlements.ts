export type Role = 'free' | 'pro' | 'team';

// Placeholder mapping. In production, look up price/product metadata.
export function mapPriceToRole(priceId: string): Role {
  if (/team/i.test(priceId)) return 'team';
  if (/pro/i.test(priceId)) return 'pro';
  return 'free';
}

export async function grantEntitlements(customerId: string, subscriptionId: string): Promise<void> {
  // TODO: Fetch subscription via Stripe if needed (REST) and map price/quantity -> role/seats
  // TODO: Persist entitlements in your user store (KV/DB). Ensure idempotency by subscriptionId.
  // NOTE (Migration): Never mutate old Prices; add new ones. For bulk moves, use billing_cycle_anchor and proration_behavior.
  console.log('grantEntitlements', { customerId, subscriptionId });
}

export async function revokeEntitlements(customerId: string): Promise<void> {
  // TODO: Downgrade to free role, set seats=1, revoke premium features
  console.log('revokeEntitlements', { customerId });
}

export async function setDunningState(customerId: string, inDunning: boolean): Promise<void> {
  // TODO: Flag account to show "Update payment method" banner linking to Portal
  console.log('setDunningState', { customerId, inDunning });
}

