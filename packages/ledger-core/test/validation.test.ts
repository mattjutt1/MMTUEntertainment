/**
 * Unit Tests - Double-Entry Posting Rule Validation
 * 
 * Tests for hledger-inspired validation engine ensuring
 * core principle: debits must equal credits
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { PostingValidationEngine } from '../src/validation/engine.js';
import { AccountType, PostingEntry } from '../src/types/posting.js';
import { createRevenueLoopRules } from '../src/validation/revenue-rules.js';

describe('PostingValidationEngine', () => {
  let validator: PostingValidationEngine;

  beforeEach(() => {
    validator = new PostingValidationEngine();
  });

  describe('Double-Entry Balance Validation', () => {
    test('valid payment transaction should pass', async () => {
      const entries: PostingEntry[] = [
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 100.00,
          description: 'Cash received',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 100.00,
          description: 'Revenue recognized',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.totalDebits).toBe(100.00);
      expect(result.metadata.totalCredits).toBe(100.00);
    });

    test('unbalanced transaction should fail', async () => {
      const entries: PostingEntry[] = [
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 100.00,
          description: 'Cash received',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 150.00, // Unbalanced!
          description: 'Revenue recognized',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('debits and credits do not balance')
      );
    });

    test('multi-currency transaction should validate per currency', async () => {
      const entries: PostingEntry[] = [
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 100.00,
          description: 'USD cash',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 100.00,
          description: 'USD revenue',
          currency: 'USD'
        },
        {
          accountCode: '1101',
          accountType: AccountType.ASSET,
          amount: 85.00,
          description: 'EUR cash',
          currency: 'EUR'
        },
        {
          accountCode: '4001',
          accountType: AccountType.REVENUE,
          amount: 85.00,
          description: 'EUR revenue',
          currency: 'EUR'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('insufficient entries should fail', async () => {
      const entries: PostingEntry[] = [
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 100.00,
          description: 'Cash received',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Double-Entry requires at least 2 posting entries');
    });

    test('zero amounts should fail', async () => {
      const entries: PostingEntry[] = [
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 0,
          description: 'Zero amount',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 100.00,
          description: 'Revenue',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Amount cannot be zero')
      );
    });
  });

  describe('Account Type Validation', () => {
    test('invalid account code format should fail', async () => {
      const entries: PostingEntry[] = [
        {
          accountCode: 'INVALID',
          accountType: AccountType.ASSET,
          amount: 100.00,
          description: 'Invalid account code',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 100.00,
          description: 'Valid revenue',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('should be 3-4 digits starting with 1-9')
      );
    });

    test('mismatched account type and code should fail', async () => {
      const entries: PostingEntry[] = [
        {
          accountCode: '1100', // Asset account code
          accountType: AccountType.REVENUE, // Wrong type!
          amount: 100.00,
          description: 'Mismatched type',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 100.00,
          description: 'Correct revenue',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('should be type \'asset\' but got \'revenue\'')
      );
    });
  });

  describe('Revenue Loop Business Rules', () => {
    beforeEach(() => {
      const rules = createRevenueLoopRules();
      rules.forEach(rule => validator.registerRule(rule));
    });

    test('payment processing rule should validate cash-revenue pairing', async () => {
      const entries: PostingEntry[] = [
        {
          accountCode: '1100', // Cash
          accountType: AccountType.ASSET,
          amount: 299.99,
          description: 'Payment received',
          currency: 'USD'
        },
        {
          accountCode: '4000', // Revenue
          accountType: AccountType.REVENUE,
          amount: 299.99,
          description: 'Product revenue',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    test('fulfillment obligation should allow deferred revenue', async () => {
      const entries: PostingEntry[] = [
        {
          accountCode: '1100', // Cash
          accountType: AccountType.ASSET,
          amount: 599.88,
          description: 'Annual subscription payment',
          currency: 'USD'
        },
        {
          accountCode: '2400', // Deferred Revenue
          accountType: AccountType.LIABILITY,
          amount: 599.88,
          description: 'Deferred revenue liability',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('cross-border transaction should require fee entries', async () => {
      const entries: PostingEntry[] = [
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 100.00,
          description: 'USD cash',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 85.00,
          description: 'EUR revenue converted',
          currency: 'EUR'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Multi-currency transactions should include foreign exchange fee entries')
      );
    });
  });

  describe('Error Handling', () => {
    test('validation engine should handle invalid rule gracefully', async () => {
      validator.registerRule({
        id: 'broken-rule',
        name: 'Broken Rule',
        description: 'A rule that throws an error',
        severity: 'error',
        isActive: true,
        validator: async () => {
          throw new Error('Rule validation failed');
        }
      });

      const entries: PostingEntry[] = [
        {
          accountCode: '1100',
          accountType: AccountType.ASSET,
          amount: 100.00,
          description: 'Test entry',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 100.00,
          description: 'Test revenue',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Rule \'Broken Rule\' validation failed')
      );
    });

    test('empty account code should fail', async () => {
      const entries: PostingEntry[] = [
        {
          accountCode: '',
          accountType: AccountType.ASSET,
          amount: 100.00,
          description: 'Empty account code',
          currency: 'USD'
        },
        {
          accountCode: '4000',
          accountType: AccountType.REVENUE,
          amount: 100.00,
          description: 'Valid revenue',
          currency: 'USD'
        }
      ];

      const result = await validator.validatePostings(entries);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Account code is required')
      );
    });
  });
});