/**
 * Double-Entry Posting Types - Accounting Integrity Framework
 * 
 * Implements traditional double-entry bookkeeping principles:
 * - Every transaction must have equal debits and credits
 * - All entries must be validated before posting
 * - Immutable audit trail for compliance
 * - Real-time balance verification
 */

import { z } from 'zod';
import Decimal from 'decimal.js';

// Configure Decimal for financial precision (2 decimal places, banker's rounding)
Decimal.set({ 
  precision: 28, 
  rounding: Decimal.ROUND_HALF_EVEN,
  toExpNeg: -7,
  toExpPos: 21 
});

// Account Types following standard chart of accounts
export enum AccountType {
  ASSET = 'asset',           // Debit increases, Credit decreases
  LIABILITY = 'liability',   // Credit increases, Debit decreases  
  EQUITY = 'equity',         // Credit increases, Debit decreases
  REVENUE = 'revenue',       // Credit increases, Debit decreases
  EXPENSE = 'expense'        // Debit increases, Credit decreases
}

// Entry Type (Debit or Credit)
export enum EntryType {
  DEBIT = 'debit',
  CREDIT = 'credit'
}

// Transaction Status for state management
export enum TransactionStatus {
  DRAFT = 'draft',           // Being constructed, not yet validated
  VALIDATED = 'validated',   // Passed validation, ready to post
  POSTED = 'posted',         // Successfully posted to ledger
  FAILED = 'failed',         // Failed posting due to rule violation
  REVERSED = 'reversed'      // Reversed by subsequent transaction
}

// Account Schema
export const AccountSchema = z.object({
  code: z.string().min(3).max(20),        // Account code (e.g., "1001", "AR001")
  name: z.string().min(1).max(100),       // Account name (e.g., "Cash", "Accounts Receivable")
  type: z.nativeEnum(AccountType),        // Account classification
  parentCode: z.string().optional(),       // For account hierarchy
  active: z.boolean().default(true),      // Whether account accepts new entries
  requiresProject: z.boolean().default(false), // Whether entries need project tracking
  metadata: z.record(z.any()).optional()  // Additional properties
});

export type Account = z.infer<typeof AccountSchema>;

// Ledger Entry Schema - Individual debit or credit
export const LedgerEntrySchema = z.object({
  accountCode: z.string(),
  type: z.nativeEnum(EntryType),
  amount: z.string().transform(val => new Decimal(val)), // Always use Decimal for money
  description: z.string().min(1).max(500),
  projectId: z.string().optional(),        // For project accounting
  reference: z.string().optional(),        // External reference (invoice #, etc.)
  metadata: z.record(z.any()).optional()
});

export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

// Transaction Schema - Collection of balanced entries
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  date: z.date(),
  description: z.string().min(1).max(500),
  reference: z.string().optional(),        // External reference
  entries: z.array(LedgerEntrySchema).min(2), // Must have at least 2 entries
  status: z.nativeEnum(TransactionStatus).default(TransactionStatus.DRAFT),
  createdBy: z.string(),
  createdAt: z.date(),
  postedAt: z.date().optional(),
  reversedBy: z.string().uuid().optional(), // ID of reversing transaction
  reversedAt: z.date().optional(),
  tags: z.array(z.string()).optional(),    // For categorization/reporting
  metadata: z.record(z.any()).optional()
});

export type Transaction = z.infer<typeof TransactionSchema>;

// Posting Rule Schema - Validation rules for transactions
export const PostingRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean().default(true),
  priority: z.number().default(100),       // Lower numbers = higher priority
  conditions: z.object({
    accountCodes: z.array(z.string()).optional(),     // Apply to specific accounts
    accountTypes: z.array(z.nativeEnum(AccountType)).optional(), // Apply to account types
    amountRange: z.object({                            // Apply to specific amount ranges
      min: z.string().transform(val => new Decimal(val)).optional(),
      max: z.string().transform(val => new Decimal(val)).optional()
    }).optional(),
    tags: z.array(z.string()).optional(),             // Apply to tagged transactions
    dateRange: z.object({                             // Apply to date ranges
      start: z.date().optional(),
      end: z.date().optional()
    }).optional()
  }),
  validations: z.object({
    requireBalanced: z.boolean().default(true),       // Debits must equal credits
    requirePositiveAmounts: z.boolean().default(true), // All amounts must be > 0
    maxEntries: z.number().optional(),                 // Maximum entries per transaction
    requiredAccounts: z.array(z.string()).optional(), // Required account codes
    forbiddenAccounts: z.array(z.string()).optional(), // Forbidden account codes
    requireReference: z.boolean().default(false),     // Must have external reference
    customValidationFn: z.string().optional()         // Custom validation function name
  }),
  actions: z.object({
    onSuccess: z.array(z.string()).optional(),         // Actions to execute on success
    onFailure: z.array(z.string()).optional()          // Actions to execute on failure
  }).optional()
});

export type PostingRule = z.infer<typeof PostingRuleSchema>;

// Validation Result Schema
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  ruleId: z.string().uuid(),
  ruleName: z.string(),
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
    entryIndex: z.number().optional()
  })),
  warnings: z.array(z.object({
    code: z.string(),
    message: z.string(),
    field: z.string().optional()
  })),
  metadata: z.record(z.any()).optional()
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// Posting Result Schema
export const PostingResultSchema = z.object({
  success: z.boolean(),
  transactionId: z.string().uuid(),
  postedAt: z.date().optional(),
  validationResults: z.array(ValidationResultSchema),
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  })),
  balanceChecks: z.object({
    totalDebits: z.string().transform(val => new Decimal(val)),
    totalCredits: z.string().transform(val => new Decimal(val)),
    balanced: z.boolean(),
    difference: z.string().transform(val => new Decimal(val))
  }),
  affectedAccounts: z.array(z.object({
    accountCode: z.string(),
    balanceChange: z.string().transform(val => new Decimal(val)),
    newBalance: z.string().transform(val => new Decimal(val))
  }))
});

export type PostingResult = z.infer<typeof PostingResultSchema>;

// Account Balance Schema
export const AccountBalanceSchema = z.object({
  accountCode: z.string(),
  accountName: z.string(),
  accountType: z.nativeEnum(AccountType),
  balance: z.string().transform(val => new Decimal(val)),
  debitBalance: z.string().transform(val => new Decimal(val)),  // Total debits
  creditBalance: z.string().transform(val => new Decimal(val)), // Total credits
  lastActivity: z.date(),
  entryCount: z.number(),
  isReconciled: z.boolean().default(false),
  reconciledAt: z.date().optional(),
  reconciledBy: z.string().optional()
});

export type AccountBalance = z.infer<typeof AccountBalanceSchema>;

// Standard Error Codes
export const ErrorCodes = {
  // Balance validation
  DEBITS_NOT_EQUAL_CREDITS: 'debits_not_equal_credits',
  NEGATIVE_AMOUNT: 'negative_amount',
  ZERO_AMOUNT: 'zero_amount',
  
  // Account validation  
  ACCOUNT_NOT_FOUND: 'account_not_found',
  ACCOUNT_INACTIVE: 'account_inactive',
  INVALID_ACCOUNT_TYPE: 'invalid_account_type',
  
  // Transaction validation
  INSUFFICIENT_ENTRIES: 'insufficient_entries',
  MISSING_REFERENCE: 'missing_reference',
  INVALID_DATE: 'invalid_date',
  DUPLICATE_TRANSACTION: 'duplicate_transaction',
  
  // Business rules
  EXCEEDS_DAILY_LIMIT: 'exceeds_daily_limit',
  FORBIDDEN_ACCOUNT: 'forbidden_account',
  REQUIRED_ACCOUNT_MISSING: 'required_account_missing',
  
  // System errors
  CONCURRENCY_CONFLICT: 'concurrency_conflict',
  SYSTEM_ERROR: 'system_error'
} as const;

// Standard Revenue Transaction Templates
export const RevenueTransactionTemplates = {
  PAYMENT_RECEIVED: {
    description: 'Payment received for services',
    entries: [
      { accountCode: '1001', type: EntryType.DEBIT, description: 'Cash received' },   // Cash
      { accountCode: '4001', type: EntryType.CREDIT, description: 'Service revenue' } // Revenue
    ]
  },
  PAYMENT_PROCESSING_FEE: {
    description: 'Payment processing fee',
    entries: [
      { accountCode: '6001', type: EntryType.DEBIT, description: 'Processing fee expense' }, // Expense
      { accountCode: '1001', type: EntryType.CREDIT, description: 'Cash for fees' }          // Cash
    ]
  },
  REFUND_ISSUED: {
    description: 'Refund issued to customer',
    entries: [
      { accountCode: '4001', type: EntryType.DEBIT, description: 'Revenue reversal' },  // Revenue
      { accountCode: '1001', type: EntryType.CREDIT, description: 'Cash refunded' }     // Cash
    ]
  }
} as const;