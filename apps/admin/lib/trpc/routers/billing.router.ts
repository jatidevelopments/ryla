/**
 * Admin Billing Router
 *
 * Provides billing and credit operations for admin panel.
 * Part of EP-052: Credits & Billing Operations
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import {
  users,
  userCredits,
  creditTransactions,
  subscriptions,
  adminAuditLog,
} from '@ryla/data';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';

/**
 * Add credits schema
 */
const addCreditsSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive().max(10000),
  reason: z.string().min(1).max(500),
  category: z.enum(['promotional', 'compensation', 'partner', 'testing', 'other']).optional(),
});

/**
 * Refund credits schema
 */
const refundCreditsSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive().max(10000),
  reason: z.string().min(1).max(500),
  jobId: z.string().uuid().optional(),
});

/**
 * Adjust credits schema (can be positive or negative)
 */
const adjustCreditsSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().min(-10000).max(10000),
  reason: z.string().min(1).max(500),
});

/**
 * Get transactions schema
 */
const getTransactionsSchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  type: z.enum(['subscription_grant', 'purchase', 'generation', 'refund', 'bonus', 'admin_adjustment']).optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
});

export const billingRouter = router({
  /**
   * Get user credits with balance and stats
   */
  getUserCredits: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { userId } = input;

      const credits = await db.query.userCredits.findFirst({
        where: eq(userCredits.userId, userId),
      });

      // If no credits record exists, create one with zero balance
      if (!credits) {
        const [newCredits] = await db
          .insert(userCredits)
          .values({
            userId,
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
          })
          .returning();

        return newCredits;
      }

      return credits;
    }),

  /**
   * Get credit transactions with filters
   */
  getTransactions: protectedProcedure
    .input(getTransactionsSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { userId, limit, offset, type, startDate, endDate } = input;

      const conditions = [eq(creditTransactions.userId, userId)];

      if (type) {
        conditions.push(eq(creditTransactions.type, type));
      }

      if (startDate) {
        conditions.push(gte(creditTransactions.createdAt, new Date(startDate)));
      }

      if (endDate) {
        conditions.push(lte(creditTransactions.createdAt, new Date(endDate)));
      }

      const transactions = await db.query.creditTransactions.findMany({
        where: and(...conditions),
        limit,
        offset,
        orderBy: [desc(creditTransactions.createdAt)],
      });

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(creditTransactions)
        .where(and(...conditions));
      const total = Number(totalResult[0]?.count ?? 0);

      return {
        transactions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Add credits to user account
   */
  addCredits: protectedProcedure
    .input(addCreditsSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin, headers } = ctx;
      const { userId, amount, reason, category } = input;

      // Verify user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Use transaction to ensure atomicity
      const result = await db.transaction(async (tx) => {
        // Get or create credits record
        let credits = await tx.query.userCredits.findFirst({
          where: eq(userCredits.userId, userId),
        });

        if (!credits) {
          const [newCredits] = await tx
            .insert(userCredits)
            .values({
              userId,
              balance: 0,
              totalEarned: 0,
              totalSpent: 0,
            })
            .returning();
          credits = newCredits;
        }

        // Calculate new balance
        const newBalance = credits.balance + amount;
        const newTotalEarned = credits.totalEarned + amount;

        // Update credits
        await tx
          .update(userCredits)
          .set({
            balance: newBalance,
            totalEarned: newTotalEarned,
            updatedAt: new Date(),
          })
          .where(eq(userCredits.userId, userId));

        // Create transaction record
        const [transaction] = await tx
          .insert(creditTransactions)
          .values({
            userId,
            type: 'admin_adjustment',
            amount,
            balanceAfter: newBalance,
            description: `Admin credit: ${reason}${category ? ` (${category})` : ''}`,
            referenceType: 'admin_action',
          })
          .returning();

        return { newBalance, transaction };
      });

      // Log audit event
      const ipAddress = headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown';
      const userAgent = headers.get('user-agent') || 'unknown';

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'credits_added',
        entityType: 'user_credits',
        entityId: userId,
        details: {
          amount,
          reason,
          category: category || 'other',
          newBalance: result.newBalance,
        },
        ipAddress,
        userAgent,
      });

      return {
        success: true,
        newBalance: result.newBalance,
        transaction: result.transaction,
      };
    }),

  /**
   * Refund credits to user account
   */
  refundCredits: protectedProcedure
    .input(refundCreditsSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin, headers } = ctx;
      const { userId, amount, reason, jobId } = input;

      // Verify user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Use transaction to ensure atomicity
      const result = await db.transaction(async (tx) => {
        // Get credits record
        let credits = await tx.query.userCredits.findFirst({
          where: eq(userCredits.userId, userId),
        });

        if (!credits) {
          const [newCredits] = await tx
            .insert(userCredits)
            .values({
              userId,
              balance: 0,
              totalEarned: 0,
              totalSpent: 0,
            })
            .returning();
          credits = newCredits;
        }

        // Calculate new balance
        const newBalance = credits.balance + amount;
        const newTotalEarned = credits.totalEarned + amount;

        // Update credits
        await tx
          .update(userCredits)
          .set({
            balance: newBalance,
            totalEarned: newTotalEarned,
            updatedAt: new Date(),
          })
          .where(eq(userCredits.userId, userId));

        // Create transaction record
        const [transaction] = await tx
          .insert(creditTransactions)
          .values({
            userId,
            type: 'refund',
            amount,
            balanceAfter: newBalance,
            description: `Refund: ${reason}${jobId ? ` (Job: ${jobId})` : ''}`,
            referenceType: jobId ? 'generation_job' : 'admin_action',
            referenceId: jobId || undefined,
          })
          .returning();

        return { newBalance, transaction };
      });

      // Log audit event
      const ipAddress = headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown';
      const userAgent = headers.get('user-agent') || 'unknown';

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'credits_refunded',
        entityType: 'user_credits',
        entityId: userId,
        details: {
          amount,
          reason,
          jobId: jobId || null,
          newBalance: result.newBalance,
        },
        ipAddress,
        userAgent,
      });

      return {
        success: true,
        newBalance: result.newBalance,
        transaction: result.transaction,
      };
    }),

  /**
   * Adjust credits (can be positive or negative)
   * Negative adjustments require super_admin role
   */
  adjustCredits: protectedProcedure
    .input(adjustCreditsSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin, headers } = ctx;
      const { userId, amount, reason } = input;

      // Check permission for negative adjustments
      if (amount < 0 && admin.role !== 'super_admin') {
        throw new Error('Only super_admin can make negative credit adjustments');
      }

      // Verify user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Use transaction to ensure atomicity
      const result = await db.transaction(async (tx) => {
        // Get or create credits record
        let credits = await tx.query.userCredits.findFirst({
          where: eq(userCredits.userId, userId),
        });

        if (!credits) {
          const [newCredits] = await tx
            .insert(userCredits)
            .values({
              userId,
              balance: 0,
              totalEarned: 0,
              totalSpent: 0,
            })
            .returning();
          credits = newCredits;
        }

        // Calculate new balance
        const newBalance = Math.max(0, credits.balance + amount); // Prevent negative balance
        const balanceChange = newBalance - credits.balance;

        // Update credits
        if (amount > 0) {
          await tx
            .update(userCredits)
            .set({
              balance: newBalance,
              totalEarned: credits.totalEarned + balanceChange,
              updatedAt: new Date(),
            })
            .where(eq(userCredits.userId, userId));
        } else {
          await tx
            .update(userCredits)
            .set({
              balance: newBalance,
              totalSpent: credits.totalSpent + Math.abs(balanceChange),
              updatedAt: new Date(),
            })
            .where(eq(userCredits.userId, userId));
        }

        // Create transaction record
        const [transaction] = await tx
          .insert(creditTransactions)
          .values({
            userId,
            type: 'admin_adjustment',
            amount: balanceChange,
            balanceAfter: newBalance,
            description: `Admin adjustment: ${reason}`,
            referenceType: 'admin_action',
          })
          .returning();

        return { newBalance, transaction, actualAmount: balanceChange };
      });

      // Log audit event
      const ipAddress = headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown';
      const userAgent = headers.get('user-agent') || 'unknown';

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'credits_adjusted',
        entityType: 'user_credits',
        entityId: userId,
        details: {
          requestedAmount: amount,
          actualAmount: result.actualAmount,
          reason,
          newBalance: result.newBalance,
          isNegative: amount < 0,
        },
        ipAddress,
        userAgent,
      });

      return {
        success: true,
        newBalance: result.newBalance,
        transaction: result.transaction,
        actualAmount: result.actualAmount,
      };
    }),

  /**
   * Get user subscription
   */
  getUserSubscription: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { userId } = input;

      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId),
        orderBy: [desc(subscriptions.createdAt)],
      });

      return subscription;
    }),

  /**
   * Get subscription history
   */
  getSubscriptionHistory: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { userId } = input;

      const history = await db.query.subscriptions.findMany({
        where: eq(subscriptions.userId, userId),
        orderBy: [desc(subscriptions.createdAt)],
      });

      return history;
    }),

  /**
   * Get billing statistics
   */
  getStats: protectedProcedure
    .input(
      z.object({
        period: z.enum(['day', 'week', 'month']).default('day'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { period } = input;

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      if (period === 'day') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === 'week') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
      }

      // Get credits added (admin_adjustment with positive amount)
      const creditsAddedResult = await db
        .select({ total: sql<number>`sum(${creditTransactions.amount})` })
        .from(creditTransactions)
        .where(
          and(
            eq(creditTransactions.type, 'admin_adjustment'),
            gte(creditTransactions.createdAt, startDate),
            sql`${creditTransactions.amount} > 0`
          )
        );
      const creditsAdded = Number(creditsAddedResult[0]?.total ?? 0);

      // Get refunds
      const refundsResult = await db
        .select({ total: sql<number>`sum(${creditTransactions.amount})` })
        .from(creditTransactions)
        .where(
          and(
            eq(creditTransactions.type, 'refund'),
            gte(creditTransactions.createdAt, startDate)
          )
        );
      const refunds = Number(refundsResult[0]?.total ?? 0);

      // Get credits spent (generation)
      const creditsSpentResult = await db
        .select({ total: sql<number>`sum(abs(${creditTransactions.amount}))` })
        .from(creditTransactions)
        .where(
          and(
            eq(creditTransactions.type, 'generation'),
            gte(creditTransactions.createdAt, startDate)
          )
        );
      const creditsSpent = Number(creditsSpentResult[0]?.total ?? 0);

      // Get subscription distribution
      const subscriptionDistribution = await db
        .select({
          tier: subscriptions.tier,
          count: sql<number>`count(*)`,
        })
        .from(subscriptions)
        .where(eq(subscriptions.status, 'active'))
        .groupBy(subscriptions.tier);

      return {
        period,
        creditsAdded,
        refunds,
        creditsSpent,
        subscriptionDistribution: subscriptionDistribution.map((s) => ({
          tier: s.tier,
          count: Number(s.count),
        })),
      };
    }),
});
