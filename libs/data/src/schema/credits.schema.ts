import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

// Credit transaction types
export const creditTransactionTypeEnum = pgEnum('credit_transaction_type', [
  'subscription_grant', // Monthly credits from subscription
  'purchase', // One-time credit purchase
  'generation', // Credits spent on generation
  'refund', // Credits refunded (failed generation, etc.)
  'bonus', // Promotional/bonus credits
  'admin_adjustment', // Manual adjustment by admin
]);

/**
 * User credit balance
 * Each user has one record tracking their current credit balance
 */
export const userCredits = pgTable(
  'user_credits',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Current balance
    balance: integer('balance').notNull().default(0),

    // Lifetime stats
    totalEarned: integer('total_earned').notNull().default(0), // Total credits ever received
    totalSpent: integer('total_spent').notNull().default(0), // Total credits ever spent

    // Low balance warning threshold
    lowBalanceWarningShown: timestamp('low_balance_warning_shown'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdx: index('user_credits_user_idx').on(table.userId),
  })
);

/**
 * Credit transactions - audit log of all credit changes
 */
export const creditTransactions = pgTable(
  'credit_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    type: creditTransactionTypeEnum('type').notNull(),
    amount: integer('amount').notNull(), // Positive for credits added, negative for spent

    // Balance after this transaction
    balanceAfter: integer('balance_after').notNull(),

    // Reference to what caused this transaction
    referenceType: text('reference_type'), // 'generation_job', 'subscription', 'purchase', etc.
    referenceId: uuid('reference_id'), // ID of the related record

    // Description for display
    description: text('description'),

    // For generation transactions, track the quality mode
    qualityMode: text('quality_mode'), // 'draft' (1 credit) or 'hq' (3 credits)

    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userIdx: index('credit_transactions_user_idx').on(table.userId),
    typeIdx: index('credit_transactions_type_idx').on(table.type),
    createdAtIdx: index('credit_transactions_created_at_idx').on(
      table.createdAt
    ),
  })
);

export const userCreditsRelations = relations(
  userCredits,
  ({ one, many }) => ({
    user: one(users, { fields: [userCredits.userId], references: [users.id] }),
    transactions: many(creditTransactions),
  })
);

export const creditTransactionsRelations = relations(
  creditTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [creditTransactions.userId],
      references: [users.id],
    }),
    userCredits: one(userCredits, {
      fields: [creditTransactions.userId],
      references: [userCredits.userId],
    }),
  })
);

// Type exports
export type UserCredits = typeof userCredits.$inferSelect;
export type NewUserCredits = typeof userCredits.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
export type CreditTransactionType =
  (typeof creditTransactionTypeEnum.enumValues)[number];

/**
 * Re-export credit costs and plan limits from @ryla/shared
 * This is the single source of truth for all credit pricing
 *
 * @see libs/shared/src/credits/pricing.ts
 * @see docs/technical/CREDIT-COST-MARGIN-ANALYSIS.md
 */
export {
  CREDIT_COSTS,
  PLAN_CREDIT_LIMITS,
  FEATURE_CREDITS,
  PLAN_CREDITS,
  getFeatureCost,
} from '@ryla/shared';
