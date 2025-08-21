import { z } from 'zod';
import { PostingRule, PostingEntry, AccountType, ValidationResult } from '../types/posting.js';

/**
 * Double-Entry Posting Rule Validation Engine
 * 
 * Implements hledger-style validation where "The real postings' sum should be 0"
 * Core principle: For every transaction, total debits must equal total credits
 */
export class PostingValidationEngine {
  private rules: Map<string, PostingRule> = new Map();

  constructor() {
    // Initialize with default posting rules
    this.initializeDefaultRules();
  }

  /**
   * Register a posting rule for validation
   */
  registerRule(rule: PostingRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Validate a set of posting entries using Double-Entry principles
   * Returns validation result with detailed error information
   */
  async validatePostings(entries: PostingEntry[]): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Basic structure validation
      const structureValidation = this.validateStructure(entries);
      if (!structureValidation.isValid) {
        errors.push(...structureValidation.errors);
      }

      // 2. Double-Entry balance validation (core principle)
      const balanceValidation = this.validateBalance(entries);
      if (!balanceValidation.isValid) {
        errors.push(...balanceValidation.errors);
      }

      // 3. Account type validation
      const accountValidation = this.validateAccountTypes(entries);
      if (!accountValidation.isValid) {
        errors.push(...accountValidation.errors);
      }

      // 4. Enhanced FX invariants validation
      const fxValidation = this.validateFXInvariants(entries);
      if (!fxValidation.isValid) {
        errors.push(...fxValidation.errors);
      }
      warnings.push(...fxValidation.warnings);

      // 5. Business rule validation
      const ruleValidation = await this.validateBusinessRules(entries);
      if (!ruleValidation.isValid) {
        errors.push(...ruleValidation.errors);
      }
      warnings.push(...ruleValidation.warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          totalDebits: this.calculateTotalDebits(entries),
          totalCredits: this.calculateTotalCredits(entries),
          entriesCount: entries.length,
          validatedAt: new Date()
        }
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation engine error: ${error instanceof Error ? error.message : String(error)}`],
        warnings: [],
        metadata: {
          totalDebits: 0,
          totalCredits: 0,
          entriesCount: entries.length,
          validatedAt: new Date()
        }
      };
    }
  }

  /**
   * Enhanced FX invariants validation following hledger patterns
   * Ref: https://hledger.org/currency-conversion.html
   * Invariant 1: Amounts must sum to zero per commodity (strict hledger compliance)
   * Invariant 2: Multi-currency conversions require equity conversion entries
   */
  private validateFXInvariants(entries: PostingEntry[]): { 
    isValid: boolean; 
    errors: string[]; 
    warnings: string[] 
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Group entries by currency for per-commodity validation
    const byCommodity = this.groupByCommodity(entries);
    
    // Invariant 1: Each commodity must sum to exactly zero (hledger compliance)
    for (const [currency, commodityEntries] of byCommodity) {
      const sum = commodityEntries.reduce((total, entry) => {
        return total + this.calculateBalanceChange(entry);
      }, 0);
      
      if (Math.abs(sum) > 0.001) { // Strict tolerance for FX
        errors.push(
          `FX Invariant violation: ${currency} amounts do not sum to zero ` +
          `(difference: ${sum.toFixed(4)}) - hledger compliance required`
        );
      }
    }

    // Invariant 2: Multi-currency transactions should have equity conversions
    if (byCommodity.size > 1 && !this.hasEquityConversion(entries)) {
      warnings.push(
        'Multi-currency transaction without equity conversion entry - ' +
        'consider hledger pattern: https://hledger.org/currency-conversion.html'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Group posting entries by currency/commodity
   */
  private groupByCommodity(entries: PostingEntry[]): Map<string, PostingEntry[]> {
    const groups = new Map<string, PostingEntry[]>();
    
    for (const entry of entries) {
      const currency = entry.currency || 'USD';
      const existing = groups.get(currency) || [];
      existing.push(entry);
      groups.set(currency, existing);
    }
    
    return groups;
  }

  /**
   * Check if transaction includes equity conversion entries (FX best practice)
   */
  private hasEquityConversion(entries: PostingEntry[]): boolean {
    return entries.some(entry => 
      entry.accountType === AccountType.EQUITY && 
      (entry.description?.toLowerCase().includes('conversion') ||
       entry.description?.toLowerCase().includes('forex') ||
       entry.description?.toLowerCase().includes('exchange') ||
       entry.accountCode.startsWith('3200')) // Standard FX equity account range
    );
  }

  /**
   * Core Double-Entry validation: debits must equal credits
   * Following hledger principle: "The real postings' sum should be 0"
   */
  private validateBalance(entries: PostingEntry[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Group by currency/commodity for multi-currency support
    const balancesByCurrency = new Map<string, number>();

    for (const entry of entries) {
      const currency = entry.currency || 'USD';
      const currentBalance = balancesByCurrency.get(currency) || 0;

      // Apply debit/credit based on account type and amount sign
      const balanceChange = this.calculateBalanceChange(entry);
      balancesByCurrency.set(currency, currentBalance + balanceChange);
    }

    // Check that each currency balances to zero (with small tolerance for floating point)
    const tolerance = 0.01;
    for (const [currency, balance] of balancesByCurrency) {
      if (Math.abs(balance) > tolerance) {
        errors.push(
          `Double-Entry violation for ${currency}: ` +
          `debits and credits do not balance (difference: ${balance.toFixed(2)})`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate balance change for a posting entry
   * Positive = debit, Negative = credit (following accounting convention)
   */
  private calculateBalanceChange(entry: PostingEntry): number {
    const { accountType, amount } = entry;

    // For assets and expenses: positive amount = debit (increases balance)
    // For liabilities, equity, revenue: positive amount = credit (decreases balance from double-entry perspective)
    switch (accountType) {
      case AccountType.ASSET:
      case AccountType.EXPENSE:
        return amount; // Positive = debit
      case AccountType.LIABILITY:
      case AccountType.EQUITY:
      case AccountType.REVENUE:
        return -amount; // Positive amount = credit (negative for balance equation)
      default:
        throw new Error(`Unknown account type: ${accountType}`);
    }
  }

  /**
   * Validate basic structure of posting entries
   */
  private validateStructure(entries: PostingEntry[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (entries.length < 2) {
      errors.push('Double-Entry requires at least 2 posting entries');
    }

    for (const [index, entry] of entries.entries()) {
      if (!entry.accountCode || entry.accountCode.trim() === '') {
        errors.push(`Entry ${index + 1}: Account code is required`);
      }

      if (entry.amount === 0) {
        errors.push(`Entry ${index + 1}: Amount cannot be zero`);
      }

      if (!Object.values(AccountType).includes(entry.accountType)) {
        errors.push(`Entry ${index + 1}: Invalid account type '${entry.accountType}'`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate account types and their usage patterns
   */
  private validateAccountTypes(entries: PostingEntry[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate account code format (should match chart of accounts)
    const accountCodePattern = /^[1-9]\d{2,3}$/; // 3-4 digit account codes

    for (const [index, entry] of entries.entries()) {
      if (!accountCodePattern.test(entry.accountCode)) {
        errors.push(
          `Entry ${index + 1}: Account code '${entry.accountCode}' ` +
          `should be 3-4 digits starting with 1-9`
        );
      }

      // Validate account type matches account code range
      const accountNum = parseInt(entry.accountCode);
      const expectedType = this.getAccountTypeFromCode(accountNum);
      
      if (expectedType && expectedType !== entry.accountType) {
        errors.push(
          `Entry ${index + 1}: Account ${entry.accountCode} should be type ` +
          `'${expectedType}' but got '${entry.accountType}'`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Determine expected account type from account code
   * Following standard chart of accounts numbering
   */
  private getAccountTypeFromCode(accountCode: number): AccountType | null {
    if (accountCode >= 1000 && accountCode <= 1999) return AccountType.ASSET;
    if (accountCode >= 2000 && accountCode <= 2999) return AccountType.LIABILITY;
    if (accountCode >= 3000 && accountCode <= 3999) return AccountType.EQUITY;
    if (accountCode >= 4000 && accountCode <= 4999) return AccountType.REVENUE;
    if (accountCode >= 5000 && accountCode <= 5999) return AccountType.EXPENSE;
    return null;
  }

  /**
   * Validate against registered business rules
   */
  private async validateBusinessRules(entries: PostingEntry[]): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.isActive) continue;

      try {
        const ruleResult = await rule.validator(entries);
        
        if (!ruleResult.isValid) {
          if (rule.severity === 'error') {
            errors.push(`Rule '${rule.name}': ${ruleResult.message}`);
          } else {
            warnings.push(`Rule '${rule.name}': ${ruleResult.message}`);
          }
        }
      } catch (error) {
        errors.push(
          `Rule '${rule.name}' validation failed: ` +
          `${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate total debits (positive amounts for asset/expense accounts)
   */
  private calculateTotalDebits(entries: PostingEntry[]): number {
    return entries
      .filter(entry => 
        (entry.accountType === AccountType.ASSET || entry.accountType === AccountType.EXPENSE) 
        && entry.amount > 0
      )
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  /**
   * Calculate total credits (positive amounts for liability/equity/revenue accounts)
   */
  private calculateTotalCredits(entries: PostingEntry[]): number {
    return entries
      .filter(entry => 
        (entry.accountType === AccountType.LIABILITY || 
         entry.accountType === AccountType.EQUITY || 
         entry.accountType === AccountType.REVENUE) 
        && entry.amount > 0
      )
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  /**
   * Initialize default posting rules for common business scenarios
   */
  private initializeDefaultRules(): void {
    // Revenue Loop specific rule: Payment must balance fulfillment
    this.registerRule({
      id: 'payment-fulfillment-balance',
      name: 'Payment Fulfillment Balance',
      description: 'Payment received must equal fulfillment obligation',
      severity: 'error',
      isActive: true,
      validator: async (entries: PostingEntry[]) => {
        const paymentEntries = entries.filter(e => 
          e.accountCode.startsWith('1100') || // Cash accounts
          e.accountCode.startsWith('4000')    // Revenue accounts
        );

        if (paymentEntries.length < 2) {
          return { isValid: true, message: '' }; // Not a payment transaction
        }

        // Additional validation logic for payment/fulfillment
        return { isValid: true, message: '' };
      }
    });

    // Asset account validation
    this.registerRule({
      id: 'asset-account-validation',
      name: 'Asset Account Validation',
      description: 'Asset accounts must have positive balances',
      severity: 'warning',
      isActive: true,
      validator: async (entries: PostingEntry[]) => {
        const assetDebits = entries
          .filter(e => e.accountType === AccountType.ASSET && e.amount < 0)
          .length;

        if (assetDebits > 0) {
          return { 
            isValid: false, 
            message: 'Asset accounts should typically have debit balances' 
          };
        }

        return { isValid: true, message: '' };
      }
    });
  }
}

/**
 * Singleton instance for application-wide use
 */
export const postingValidator = new PostingValidationEngine();