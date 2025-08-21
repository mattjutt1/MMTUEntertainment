/**
 * Property Tests for FX Invariants - hledger Compliance
 * 
 * Tests the fundamental properties that must hold for all valid
 * double-entry transactions following hledger principles.
 * 
 * Ref: https://hledger.org/MANUAL.html - "Amounts must sum to zero"
 */

import { describe, test, expect } from '@jest/globals';
import { PostingValidationEngine } from '../../src/validation/engine.js';
import { AccountType, PostingEntry } from '../../src/types/posting.js';

describe('FX Invariants Property Tests', () => {
  let validator: PostingValidationEngine;

  beforeEach(() => {
    validator = new PostingValidationEngine();
  });

  describe('Property: Amounts sum to zero per commodity', () => {
    test('property: balanced single-currency transactions always pass', async () => {
      // Property: For any balanced single-currency transaction, validation should pass
      const currencies = ['USD', 'EUR', 'GBP', 'JPY'];
      const amounts = [100, 50.25, 999.99, 0.01];
      
      for (const currency of currencies) {
        for (const amount of amounts) {
          const entries: PostingEntry[] = [
            {
              accountCode: '1100',
              accountType: AccountType.ASSET,
              amount: amount,
              description: `Asset increase ${currency}`,
              currency: currency
            },
            {
              accountCode: '4000',
              accountType: AccountType.REVENUE,
              amount: amount,
              description: `Revenue recognition ${currency}`,
              currency: currency
            }
          ];

          const result = await validator.validatePostings(entries);
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      }
    });

    test('property: unbalanced transactions always fail per commodity', async () => {
      // Property: Any transaction where amounts don't sum to zero should fail
      const testCases = [
        { amount1: 100, amount2: 99.99, currency: 'USD' },
        { amount1: 50, amount2: 51, currency: 'EUR' },
        { amount1: 1000, amount2: 1000.01, currency: 'GBP' }
      ];

      for (const testCase of testCases) {
        const entries: PostingEntry[] = [
          {
            accountCode: '1100',
            accountType: AccountType.ASSET,
            amount: testCase.amount1,
            description: 'Asset',
            currency: testCase.currency
          },
          {
            accountCode: '4000',
            accountType: AccountType.REVENUE,
            amount: testCase.amount2,
            description: 'Revenue',
            currency: testCase.currency
          }
        ];

        const result = await validator.validatePostings(entries);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => 
          error.includes('FX Invariant violation') || 
          error.includes('debits and credits do not balance')
        )).toBe(true);
      }
    });

    test('property: multi-currency balanced per commodity should pass', async () => {
      // Property: Multi-currency where each currency balances should pass
      const entries: PostingEntry[] = [
        // USD balanced
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 100,
          description: 'USD cash',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 100,
          description: 'USD revenue',
          currency: 'USD'
        },
        // EUR balanced
        {
          accountCode: '1101',
          accountType: AccountType.ASSET,
          amount: 85,
          description: 'EUR cash',
          currency: 'EUR'
        },
        {
          accountCode: '4001',
          accountType: AccountType.REVENUE,
          amount: 85,
          description: 'EUR revenue',
          currency: 'EUR'
        }
      ];

      const result = await validator.validatePostings(entries);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(warning => 
        warning.includes('equity conversion entry')
      )).toBe(true); // Should warn about missing equity conversion
    });

    test('property: FX conversion with equity should not warn', async () => {
      // Property: Multi-currency with equity conversion should not generate warnings
      const entries: PostingEntry[] = [
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 100,
          description: 'USD received',
          currency: 'USD'
        },
        {
          accountCode: '3200',
          accountType: AccountType.EQUITY,
          amount: 85,
          description: 'FX conversion equity',
          currency: 'EUR'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 85,
          description: 'EUR revenue',
          currency: 'EUR'
        }
      ];

      const result = await validator.validatePostings(entries);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(warning => 
        warning.includes('equity conversion')
      )).toBe(false); // Should NOT warn when equity conversion present
    });
  });

  describe('Edge Cases and Stress Tests', () => {
    test('property: very small amounts within tolerance pass', async () => {
      // Property: Amounts within floating-point tolerance should pass
      const entries: PostingEntry[] = [
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 100.000001, // Within 0.001 tolerance
          description: 'Asset',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 100.000001,
          description: 'Revenue',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      expect(result.isValid).toBe(true);
    });

    test('property: amounts outside tolerance fail', async () => {
      // Property: Amounts outside strict FX tolerance should fail
      const entries: PostingEntry[] = [
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 100.002, // Outside 0.001 tolerance
          description: 'Asset',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 100.000,
          description: 'Revenue',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.includes('FX Invariant violation')
      )).toBe(true);
    });

    test('property: multiple currencies with mixed balance states', async () => {
      // Property: Each currency must independently balance
      const entries: PostingEntry[] = [
        // USD: balanced
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 100,
          description: 'USD cash',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 100,
          description: 'USD revenue',
          currency: 'USD'
        },
        // EUR: unbalanced
        {
          accountCode: '1101',
          accountType: AccountType.ASSET,
          amount: 85,
          description: 'EUR cash',
          currency: 'EUR'
        },
        {
          accountCode: '4001',
          accountType: AccountType.REVENUE,
          amount: 84, // Unbalanced!
          description: 'EUR revenue',
          currency: 'EUR'
        }
      ];

      const result = await validator.validatePostings(entries);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => 
        error.includes('EUR') && error.includes('FX Invariant violation')
      )).toBe(true);
    });
  });

  describe('Randomized Property Tests', () => {
    test('property: random balanced amounts always pass', async () => {
      // Property: Any randomly generated balanced transaction should pass
      for (let i = 0; i < 50; i++) {
        const amount = Math.random() * 10000; // 0 to 10,000
        const currency = ['USD', 'EUR', 'GBP', 'JPY'][Math.floor(Math.random() * 4)];
        
        const entries: PostingEntry[] = [
          {
            accountCode: '1100',
            accountType: AccountType.ASSET,
            amount: amount,
            description: `Random asset ${i}`,
            currency: currency
          },
          {
            accountCode: '4000',
            accountType: AccountType.REVENUE,
            amount: amount,
            description: `Random revenue ${i}`,
            currency: currency
          }
        ];

        const result = await validator.validatePostings(entries);
        expect(result.isValid).toBe(true);
      }
    });

    test('property: random unbalanced amounts always fail', async () => {
      // Property: Any randomly generated unbalanced transaction should fail
      for (let i = 0; i < 50; i++) {
        const amount1 = Math.random() * 10000;
        const amount2 = amount1 + (Math.random() * 100) + 0.1; // Ensure difference > tolerance
        const currency = ['USD', 'EUR', 'GBP', 'JPY'][Math.floor(Math.random() * 4)];
        
        const entries: PostingEntry[] = [
          {
            accountCode: '1100',
            accountType: AccountType.ASSET,
            amount: amount1,
            description: `Random asset ${i}`,
            currency: currency
          },
          {
            accountCode: '4000',
            accountType: AccountType.REVENUE,
            amount: amount2,
            description: `Random revenue ${i}`,
            currency: currency
          }
        ];

        const result = await validator.validatePostings(entries);
        expect(result.isValid).toBe(false);
      }
    });
  });
});