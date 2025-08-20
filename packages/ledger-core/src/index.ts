/**
 * Ledger Core - Double-Entry Bookkeeping System
 * 
 * Revenue Loop MVP component implementing hledger-inspired validation
 * Core principle: debits must equal credits for every transaction
 */

// Types
export * from './types/posting.js';

// Validation Engine
export { PostingValidationEngine, postingValidator } from './validation/engine.js';

// Revenue Loop Rules
export { 
  createRevenueLoopRules, 
  registerRevenueLoopRules,
  createPaymentProcessingRule,
  createFulfillmentObligationRule,
  createDropoffEventRule,
  createCrossBorderRule,
  createRevenueTimingRule
} from './validation/revenue-rules.js';

/**
 * Quick-start validation function for Revenue Loop scenarios
 * 
 * @param entries - Array of posting entries to validate
 * @returns Promise<ValidationResult> with detailed validation outcome
 * 
 * @example
 * ```typescript
 * import { validateRevenueTransaction, AccountType } from '@mmtu/ledger-core';
 * 
 * const paymentEntries = [
 *   {
 *     accountCode: '1100', // Cash
 *     accountType: AccountType.ASSET,
 *     amount: 100.00,
 *     description: 'Customer payment received',
 *     currency: 'USD'
 *   },
 *   {
 *     accountCode: '4000', // Revenue
 *     accountType: AccountType.REVENUE,
 *     amount: 100.00,
 *     description: 'Product sale revenue',
 *     currency: 'USD'
 *   }
 * ];
 * 
 * const result = await validateRevenueTransaction(paymentEntries);
 * if (!result.isValid) {
 *   console.error('Validation failed:', result.errors);
 * }
 * ```
 */
export async function validateRevenueTransaction(entries: import('./types/posting.js').PostingEntry[]) {
  const { postingValidator } = await import('./validation/engine.js');
  const { registerRevenueLoopRules } = await import('./validation/revenue-rules.js');
  
  // Ensure Revenue Loop rules are registered
  registerRevenueLoopRules(postingValidator);
  
  return postingValidator.validatePostings(entries);
}

/**
 * Create a preconfigured validation engine with Revenue Loop rules
 * 
 * @returns PostingValidationEngine configured for Revenue Loop MVP
 */
export function createRevenueLoopValidator() {
  const { PostingValidationEngine } = require('./validation/engine.js');
  const { registerRevenueLoopRules } = require('./validation/revenue-rules.js');
  
  const validator = new PostingValidationEngine();
  registerRevenueLoopRules(validator);
  
  return validator;
}