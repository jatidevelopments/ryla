/**
 * Credits Router
 *
 * Handles user credit operations using Drizzle ORM.
 * NO SUPABASE - direct Postgres access.
 */

import { z } from 'zod';
import { eq, desc, sql } from 'drizzle-orm';

import { userCredits, creditTransactions } from '@ryla/data';

import { router, protectedProcedure } from '../trpc';

export const creditsRouter = router({
  /**
   * Get current credit balance
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const credits = await ctx.db.query.userCredits.findFirst({
      where: eq(userCredits.userId, ctx.user.id),
    });

    return {
      balance: credits?.balance ?? 0,
      totalEarned: credits?.totalEarned ?? 0,
      totalSpent: credits?.totalSpent ?? 0,
    };
  }),

  /**
   * Get credit transaction history
   */
  getTransactions: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
          type: z
            .enum([
              'subscription_grant',
              'purchase',
              'generation',
              'refund',
              'bonus',
              'admin_adjustment',
            ])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 20, offset = 0, type } = input ?? {};

      // Build conditions
      const conditions = [eq(creditTransactions.userId, ctx.user.id)];

      if (type) {
        conditions.push(eq(creditTransactions.type, type));
      }

      const items = await ctx.db.query.creditTransactions.findMany({
        where:
          conditions.length === 1
            ? conditions[0]
            : sql`${conditions[0]} AND ${conditions[1]}`,
        limit,
        offset,
        orderBy: desc(creditTransactions.createdAt),
        columns: {
          id: true,
          type: true,
          amount: true,
          balanceAfter: true,
          description: true,
          qualityMode: true,
          createdAt: true,
        },
      });

      // Get total count
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, ctx.user.id));

      return {
        items,
        total: Number(countResult?.count ?? 0),
        limit,
        offset,
      };
    }),
});
