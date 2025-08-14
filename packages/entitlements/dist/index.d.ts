export interface Entitlement {
    installationId: string;
    accountId: string;
    plan: string;
    status: 'active' | 'cancelled' | 'suspended';
    billingSource: 'github_marketplace' | 'stripe';
    externalId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class EntitlementsStore {
    private entitlements;
    constructor();
    createEntitlement(entitlement: Omit<Entitlement, 'createdAt' | 'updatedAt'>): Promise<void>;
    getEntitlement(installationId: string): Promise<Entitlement | null>;
    updateEntitlement(installationId: string, updates: Partial<Entitlement>): Promise<void>;
    hasActiveEntitlement(installationId: string): Promise<boolean>;
}
export default EntitlementsStore;
