import { PostingRule, PostingEntry, AccountType } from '../types/posting.js';

/**
 * Revenue Loop Specific Posting Rules
 * 
 * Implements validation rules specific to Revenue Loop MVP scenarios:
 * - Payment processing validation
 * - Fulfillment obligation tracking
 * - Drop-off event handling
 */

/**
 * Payment Processing Rule: Ensures payment transactions are properly balanced
 * Cash received must equal revenue recognized or deferred revenue liability
 */
export const createPaymentProcessingRule = (): PostingRule => ({
  id: 'revloop-payment-processing',
  name: 'Revenue Loop Payment Processing',
  description: 'Validates payment transactions follow revenue recognition principles',
  severity: 'error',
  isActive: true,
  validator: async (entries: PostingEntry[]) => {
    // Identify payment transactions by presence of cash and revenue accounts
    const cashEntries = entries.filter(e => 
      e.accountType === AccountType.ASSET && 
      e.accountCode.startsWith('1100') // Cash/bank accounts
    );
    
    const revenueEntries = entries.filter(e => 
      e.accountType === AccountType.REVENUE || // Recognized revenue
      (e.accountType === AccountType.LIABILITY && e.accountCode.startsWith('2400')) // Deferred revenue
    );

    // If this is a payment transaction
    if (cashEntries.length > 0 && revenueEntries.length > 0) {
      const totalCashReceived = cashEntries
        .filter(e => e.amount > 0)
        .reduce((sum, e) => sum + e.amount, 0);
        
      const totalRevenueRecognized = revenueEntries
        .filter(e => e.amount > 0)
        .reduce((sum, e) => sum + e.amount, 0);

      if (Math.abs(totalCashReceived - totalRevenueRecognized) > 0.01) {
        return {
          isValid: false,
          message: `Payment amount (${totalCashReceived}) must equal revenue recognized/deferred (${totalRevenueRecognized})`
        };
      }
    }

    return { isValid: true, message: '' };
  }
});

/**
 * Fulfillment Obligation Rule: Tracks fulfillment obligations for revenue recognition
 * Ensures proper liability is recorded when payment is received before delivery
 */
export const createFulfillmentObligationRule = (): PostingRule => ({
  id: 'revloop-fulfillment-obligation',
  name: 'Revenue Loop Fulfillment Obligation',
  description: 'Validates fulfillment obligations are properly recorded',
  severity: 'error',
  isActive: true,
  validator: async (entries: PostingEntry[]) => {
    // Look for entries that involve deferred revenue (fulfillment obligations)
    const deferredRevenueEntries = entries.filter(e => 
      e.accountType === AccountType.LIABILITY && 
      e.accountCode.startsWith('2400') // Deferred revenue accounts
    );

    if (deferredRevenueEntries.length === 0) {
      return { isValid: true, message: '' }; // Not a fulfillment transaction
    }

    // Ensure there's a corresponding asset (cash) or revenue recognition entry
    const hasCorrespondingEntry = entries.some(e => 
      (e.accountType === AccountType.ASSET && e.accountCode.startsWith('1100')) || // Cash received
      (e.accountType === AccountType.REVENUE) // Revenue recognized
    );

    if (!hasCorrespondingEntry) {
      return {
        isValid: false,
        message: 'Fulfillment obligation entries must have corresponding cash or revenue entries'
      };
    }

    return { isValid: true, message: '' };
  }
});

/**
 * Drop-off Event Rule: Validates accounting for checkout drop-offs
 * Ensures proper tracking of abandoned checkout events for revenue analysis
 */
export const createDropoffEventRule = (): PostingRule => ({
  id: 'revloop-dropoff-event',
  name: 'Revenue Loop Dropoff Event',
  description: 'Validates accounting treatment of checkout drop-off events',
  severity: 'warning',
  isActive: true,
  validator: async (entries: PostingEntry[]) => {
    // Look for entries that might indicate drop-off events
    // These would typically be expense entries for tracking purposes
    const dropoffExpenses = entries.filter(e => 
      e.accountType === AccountType.EXPENSE && 
      (e.accountCode.startsWith('6100') || // Marketing/customer acquisition costs
       e.description?.toLowerCase().includes('dropoff') ||
       e.description?.toLowerCase().includes('abandon'))
    );

    if (dropoffExpenses.length === 0) {
      return { isValid: true, message: '' }; // Not a drop-off related transaction
    }

    // For drop-off events, ensure there's proper classification
    const hasProperClassification = dropoffExpenses.every(e => 
      e.description && 
      e.description.length > 10 && // Meaningful description
      (e.metadata?.stage || e.metadata?.dropoff_type) // Proper metadata
    );

    if (!hasProperClassification) {
      return {
        isValid: false,
        message: 'Drop-off event entries should include detailed descriptions and metadata for analysis'
      };
    }

    return { isValid: true, message: '' };
  }
});

/**
 * Cross-Border Transaction Rule: Validates multi-currency transactions
 * Ensures proper handling of currency conversion and related fees
 */
export const createCrossBorderRule = (): PostingRule => ({
  id: 'revloop-cross-border',
  name: 'Revenue Loop Cross-Border Transaction',
  description: 'Validates multi-currency payment processing',
  severity: 'error',
  isActive: true,
  validator: async (entries: PostingEntry[]) => {
    const currencies = new Set(entries.map(e => e.currency || 'USD'));
    
    // If multiple currencies in single transaction
    if (currencies.size > 1) {
      // Ensure there are corresponding fee entries for currency conversion
      const hasFeeEntries = entries.some(e => 
        e.accountType === AccountType.EXPENSE && 
        (e.description?.toLowerCase().includes('forex') ||
         e.description?.toLowerCase().includes('conversion') ||
         e.description?.toLowerCase().includes('exchange'))
      );

      if (!hasFeeEntries) {
        return {
          isValid: false,
          message: 'Multi-currency transactions should include foreign exchange fee entries'
        };
      }
    }

    return { isValid: true, message: '' };
  }
});

/**
 * Revenue Recognition Timing Rule: Validates proper timing of revenue recognition
 * Ensures revenue is recognized when performance obligations are satisfied
 */
export const createRevenueTimingRule = (): PostingRule => ({
  id: 'revloop-revenue-timing',
  name: 'Revenue Loop Revenue Timing',
  description: 'Validates proper timing of revenue recognition vs. fulfillment',
  severity: 'warning',
  isActive: true,
  validator: async (entries: PostingEntry[]) => {
    const revenueEntries = entries.filter(e => e.accountType === AccountType.REVENUE);
    
    if (revenueEntries.length === 0) {
      return { isValid: true, message: '' }; // No revenue in this transaction
    }

    // Check if revenue is being recognized
    const revenueRecognized = revenueEntries.some(e => e.amount > 0);
    
    if (revenueRecognized) {
      // Ensure there's evidence of fulfillment (reduction in deferred revenue or fulfillment expense)
      const hasFulfillmentEvidence = entries.some(e => 
        (e.accountType === AccountType.LIABILITY && 
         e.accountCode.startsWith('2400') && 
         e.amount < 0) || // Reducing deferred revenue
        (e.accountType === AccountType.EXPENSE && 
         e.description?.toLowerCase().includes('fulfillment'))
      );

      if (!hasFulfillmentEvidence && revenueEntries.length > 0) {
        return {
          isValid: false,
          message: 'Revenue recognition should be accompanied by evidence of performance obligation satisfaction'
        };
      }
    }

    return { isValid: true, message: '' };
  }
});

/**
 * Factory function to create all Revenue Loop posting rules
 */
export const createRevenueLoopRules = (): PostingRule[] => [
  createPaymentProcessingRule(),
  createFulfillmentObligationRule(),
  createDropoffEventRule(),
  createCrossBorderRule(),
  createRevenueTimingRule()
];

/**
 * Utility function to register all Revenue Loop rules with a validation engine
 */
export const registerRevenueLoopRules = (engine: { registerRule: (rule: PostingRule) => void }): void => {
  const rules = createRevenueLoopRules();
  rules.forEach(rule => engine.registerRule(rule));
};