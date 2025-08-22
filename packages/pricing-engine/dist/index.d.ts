export interface PricingCatalog {
    driftguard: {
        plans: {
            [key: string]: {
                name: string;
                price: number;
                currency: string;
                billing: string;
                features: string[];
                limits: Record<string, number>;
            };
        };
        overages: Record<string, number>;
    };
    comparison_matrix: {
        price: number;
        currency: string;
        billing: string;
    };
    web_toys: {
        [key: string]: {
            premium_pack: {
                price: number;
                currency: string;
                billing: string;
            };
        };
    };
}
export declare class PricingEngine {
    private catalog;
    constructor();
    private loadCatalog;
    private getEmptyCatalog;
    getDriftGuardPlan(planId: string): {
        name: string;
        price: number;
        currency: string;
        billing: string;
        features: string[];
        limits: Record<string, number>;
    } | null;
    getDriftGuardOverage(type: string): number;
    getComparisonMatrixPrice(): {
        price: number;
        currency: string;
        billing: string;
    } | null;
    getWebToyPremiumPack(toyId: string): {
        price: number;
        currency: string;
        billing: string;
    } | null;
    getAllPlans(): {
        [key: string]: {
            name: string;
            price: number;
            currency: string;
            billing: string;
            features: string[];
            limits: Record<string, number>;
        };
    };
}
export default PricingEngine;
