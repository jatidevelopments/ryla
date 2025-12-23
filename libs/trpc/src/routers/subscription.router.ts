/**
 * Subscription Router
 *
 * Handles subscription and credit purchase operations.
 * TEST MODE: No actual payment required - updates DB directly.
 */

import { z } from 'zod';
import { eq } from 'drizzle-orm';

import {
  subscriptions,
  userCredits,
  creditTransactions,
  PLAN_CREDIT_LIMITS,
} from '@ryla/data';

// Simple helper to add months to a date
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

import { router, protectedProcedure } from '../trpc';

// Credit amounts for each plan
const PLAN_CREDITS: Record<string, number> = {
  free: 10,
  starter: 100,
  pro: 300,
  unlimited: 999999, // Effectively unlimited
};

// Credit package definitions (should match frontend constants)
const CREDIT_PACKAGES: Record<string, number> = {
  credits_50: 50,
  credits_150: 150,
  credits_350: 350,
  credits_750: 750,
  credits_1500: 1500,
};

export const subscriptionRouter = router({
  /**
   * Get current subscription status
   */
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await ctx.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, ctx.user.id),
    });

    return {
      tier: subscription?.tier ?? 'free',
      status: subscription?.status ?? 'active',
      currentPeriodStart: subscription?.currentPeriodStart,
      currentPeriodEnd: subscription?.currentPeriodEnd,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    };
  }),

  /**
   * Subscribe to a plan (TEST MODE - no payment required)
   * Creates or updates subscription and grants credits
   */
  subscribe: protectedProcedure
    .input(
      z.object({
        planId: z.enum(['starter', 'pro', 'unlimited']),
        isYearly: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { planId, isYearly } = input;
      const creditsToGrant = PLAN_CREDITS[planId] ?? 0;
      const now = new Date();
      const periodEnd = isYearly
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        : addMonths(now, 1);

      // Check for existing subscription
      const existingSubscription = await ctx.db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, ctx.user.id),
      });

      // Start transaction
      return await ctx.db.transaction(async (tx) => {
        // Upsert subscription
        if (existingSubscription) {
          await tx
            .update(subscriptions)
            .set({
              tier: planId,
              status: 'active',
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
              updatedAt: now,
            })
            .where(eq(subscriptions.id, existingSubscription.id));
        } else {
          await tx.insert(subscriptions).values({
            userId: ctx.user.id,
            tier: planId,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
          });
        }

        // Get or create user credits
        let credits = await tx.query.userCredits.findFirst({
          where: eq(userCredits.userId, ctx.user.id),
        });

        if (!credits) {
          const [newCredits] = await tx
            .insert(userCredits)
            .values({
              userId: ctx.user.id,
              balance: 0,
              totalEarned: 0,
              totalSpent: 0,
            })
            .returning();
          credits = newCredits;
        }

        // Grant subscription credits
        const newBalance = (credits?.balance ?? 0) + creditsToGrant;
        const newTotalEarned = (credits?.totalEarned ?? 0) + creditsToGrant;

        await tx
          .update(userCredits)
          .set({
            balance: newBalance,
            totalEarned: newTotalEarned,
            lowBalanceWarningShown: null, // Reset warning
            updatedAt: now,
          })
          .where(eq(userCredits.userId, ctx.user.id));

        // Record transaction
        await tx.insert(creditTransactions).values({
          userId: ctx.user.id,
          type: 'subscription_grant',
          amount: creditsToGrant,
          balanceAfter: newBalance,
          referenceType: 'subscription',
          description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} plan subscription (${isYearly ? 'yearly' : 'monthly'})`,
        });

        return {
          success: true,
          plan: planId,
          creditsGranted: creditsToGrant,
          newBalance,
          periodEnd: periodEnd.toISOString(),
        };
      });
    }),

  /**
   * Purchase credits (TEST MODE - no payment required)
   * Adds credits directly to user's balance
   */
  purchaseCredits: protectedProcedure
    .input(
      z.object({
        packageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const creditsToAdd = CREDIT_PACKAGES[input.packageId];

      if (!creditsToAdd) {
        throw new Error(`Invalid package: ${input.packageId}`);
      }

      const now = new Date();

      return await ctx.db.transaction(async (tx) => {
        // Get or create user credits
        let credits = await tx.query.userCredits.findFirst({
          where: eq(userCredits.userId, ctx.user.id),
        });

        if (!credits) {
          const [newCredits] = await tx
            .insert(userCredits)
            .values({
              userId: ctx.user.id,
              balance: 0,
              totalEarned: 0,
              totalSpent: 0,
            })
            .returning();
          credits = newCredits;
        }

        const newBalance = (credits?.balance ?? 0) + creditsToAdd;
        const newTotalEarned = (credits?.totalEarned ?? 0) + creditsToAdd;

        // Update balance
        await tx
          .update(userCredits)
          .set({
            balance: newBalance,
            totalEarned: newTotalEarned,
            lowBalanceWarningShown: null, // Reset warning
            updatedAt: now,
          })
          .where(eq(userCredits.userId, ctx.user.id));

        // Record transaction
        await tx.insert(creditTransactions).values({
          userId: ctx.user.id,
          type: 'purchase',
          amount: creditsToAdd,
          balanceAfter: newBalance,
          referenceType: 'credit_purchase',
          referenceId: undefined,
          description: `Purchased ${creditsToAdd} credits`,
        });

        return {
          success: true,
          packageId: input.packageId,
          creditsPurchased: creditsToAdd,
          newBalance,
        };
      });
    }),

  /**
   * Cancel subscription (at period end)
   */
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await ctx.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, ctx.user.id),
    });

    if (!subscription) {
      throw new Error('No subscription found');
    }

    await ctx.db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    return {
      success: true,
      cancelsAt: subscription.currentPeriodEnd?.toISOString(),
    };
  }),
});

