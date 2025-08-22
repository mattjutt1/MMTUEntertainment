"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class PricingEngine {
    constructor() {
        this.catalog = null;
        this.loadCatalog();
    }
    loadCatalog() {
        try {
            const catalogPath = path.join(process.cwd(), 'docs', 'pricing-catalog.v2.json');
            if (fs.existsSync(catalogPath)) {
                const catalogData = fs.readFileSync(catalogPath, 'utf-8');
                this.catalog = JSON.parse(catalogData);
                console.log('✅ Pricing catalog loaded successfully');
            }
            else {
                console.warn('⚠️ pricing-catalog.v2.json not found, using empty catalog');
                this.catalog = this.getEmptyCatalog();
            }
        }
        catch (error) {
            console.error('❌ Failed to load pricing catalog:', error);
            this.catalog = this.getEmptyCatalog();
        }
    }
    getEmptyCatalog() {
        return {
            driftguard: {
                plans: {},
                overages: {}
            },
            comparison_matrix: {
                price: 0,
                currency: 'usd',
                billing: 'one_time'
            },
            web_toys: {}
        };
    }
    getDriftGuardPlan(planId) {
        return this.catalog?.driftguard.plans[planId] || null;
    }
    getDriftGuardOverage(type) {
        return this.catalog?.driftguard.overages[type] || 0;
    }
    getComparisonMatrixPrice() {
        return this.catalog?.comparison_matrix || null;
    }
    getWebToyPremiumPack(toyId) {
        return this.catalog?.web_toys[toyId]?.premium_pack || null;
    }
    getAllPlans() {
        return this.catalog?.driftguard.plans || {};
    }
}
exports.PricingEngine = PricingEngine;
exports.default = PricingEngine;
