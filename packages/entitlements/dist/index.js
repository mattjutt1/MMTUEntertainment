"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitlementsStore = void 0;
class EntitlementsStore {
    constructor() {
        this.entitlements = new Map();
        console.log("🔐 EntitlementsStore initialized");
    }
    async createEntitlement(entitlement) {
        const now = new Date();
        const fullEntitlement = {
            ...entitlement,
            createdAt: now,
            updatedAt: now
        };
        this.entitlements.set(entitlement.installationId, fullEntitlement);
        console.log(`✅ Created entitlement for installation ${entitlement.installationId}`);
    }
    async getEntitlement(installationId) {
        return this.entitlements.get(installationId) || null;
    }
    async updateEntitlement(installationId, updates) {
        const existing = this.entitlements.get(installationId);
        if (existing) {
            const updated = { ...existing, ...updates, updatedAt: new Date() };
            this.entitlements.set(installationId, updated);
            console.log(`📝 Updated entitlement for installation ${installationId}`);
        }
    }
    async hasActiveEntitlement(installationId) {
        const entitlement = await this.getEntitlement(installationId);
        return entitlement?.status === 'active' || false;
    }
}
exports.EntitlementsStore = EntitlementsStore;
exports.default = EntitlementsStore;
