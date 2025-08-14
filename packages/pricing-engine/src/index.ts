/**
 * Centralized pricing engine - loads pricing from docs/pricing-catalog.v2.json
 * No hardcoded prices - all pricing data comes from the catalog
 */

import * as fs from 'fs';
import * as path from 'path';

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
      }
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
      }
    }
  };
}

export class PricingEngine {
  private catalog: PricingCatalog | null = null;

  constructor() {
    this.loadCatalog();
  }

  private loadCatalog(): void {
    try {
      // Look for pricing catalog in docs directory
      const catalogPath = path.join(process.cwd(), 'docs', 'pricing-catalog.v2.json');
      if (fs.existsSync(catalogPath)) {
        const catalogData = fs.readFileSync(catalogPath, 'utf-8');
        this.catalog = JSON.parse(catalogData);
        console.log('✅ Pricing catalog loaded successfully');
      } else {
        console.warn('⚠️ pricing-catalog.v2.json not found, using empty catalog');
        this.catalog = this.getEmptyCatalog();
      }
    } catch (error) {
      console.error('❌ Failed to load pricing catalog:', error);
      this.catalog = this.getEmptyCatalog();
    }
  }

  private getEmptyCatalog(): PricingCatalog {
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

  getDriftGuardPlan(planId: string) {
    return this.catalog?.driftguard.plans[planId] || null;
  }

  getDriftGuardOverage(type: string): number {
    return this.catalog?.driftguard.overages[type] || 0;
  }

  getComparisonMatrixPrice() {
    return this.catalog?.comparison_matrix || null;
  }

  getWebToyPremiumPack(toyId: string) {
    return this.catalog?.web_toys[toyId]?.premium_pack || null;
  }

  getAllPlans() {
    return this.catalog?.driftguard.plans || {};
  }
}

export default PricingEngine;