/**
 * Shared entitlements store for GitHub Marketplace and Stripe integration
 * Handles billing enforcement across all MMTU products
 */

export interface Entitlement {
  installationId: string;
  accountId: string;
  plan: string;
  status: 'active' | 'cancelled' | 'suspended';
  billingSource: 'github_marketplace' | 'stripe';
  externalId: string; // GitHub marketplace_purchase_id or Stripe subscription_id
  createdAt: Date;
  updatedAt: Date;
}

export class EntitlementsStore {
  private entitlements: Map<string, Entitlement> = new Map();

  constructor() {
    console.log("🔐 EntitlementsStore initialized");
  }

  async createEntitlement(entitlement: Omit<Entitlement, 'createdAt' | 'updatedAt'>): Promise<void> {
    const now = new Date();
    const fullEntitlement: Entitlement = {
      ...entitlement,
      createdAt: now,
      updatedAt: now
    };
    
    this.entitlements.set(entitlement.installationId, fullEntitlement);
    console.log(`✅ Created entitlement for installation ${entitlement.installationId}`);
  }

  async getEntitlement(installationId: string): Promise<Entitlement | null> {
    return this.entitlements.get(installationId) || null;
  }

  async updateEntitlement(installationId: string, updates: Partial<Entitlement>): Promise<void> {
    const existing = this.entitlements.get(installationId);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date() };
      this.entitlements.set(installationId, updated);
      console.log(`📝 Updated entitlement for installation ${installationId}`);
    }
  }

  async hasActiveEntitlement(installationId: string): Promise<boolean> {
    const entitlement = await this.getEntitlement(installationId);
    return entitlement?.status === 'active' || false;
  }
}

export default EntitlementsStore;