/**
 * Credits Router
 *
 * Handles user credit operations using Drizzle ORM.
 * NO SUPABASE - direct Postgres access.
 */

import { z } from 'zod';
import { eq, desc, sql } from 'drizzle-orm';

import {
  userCredits,
  creditTransactions,
  generationJobs,
  NotificationsRepository,
} from '@ryla/data';
import type { Notification } from '@ryla/data/schema';

import { router, protectedProcedure } from '../trpc';

// Low balance threshold (show warning when credits <= this value)
// Set to 500 credits ($0.50)
const LOW_BALANCE_THRESHOLD = 500;

export const creditsRouter = router({
  /**
   * Get current credit balance with low balance warning
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const credits = await ctx.db.query.userCredits.findFirst({
      where: eq(userCredits.userId, ctx.user.id),
    });

    const balance = credits?.balance ?? 0;
    const isLowBalance = balance > 0 && balance <= LOW_BALANCE_THRESHOLD;
    const isZeroBalance = balance === 0;

    // Create low balance notification if threshold reached and warning not shown
    if (isLowBalance && !credits?.lowBalanceWarningShown) {
      const notificationsRepo = new NotificationsRepository(ctx.db);
      await notificationsRepo.create({
        userId: ctx.user.id,
        type: 'credits.low_balance',
        title: 'Low credits warning',
        body: `You have ${balance} credits remaining. Consider purchasing more.`,
        href: '/buy-credits',
        metadata: { balance },
      });

      // Mark warning as shown
      await ctx.db
        .update(userCredits)
        .set({
          lowBalanceWarningShown: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, ctx.user.id));
    }

    return {
      balance,
      totalEarned: credits?.totalEarned ?? 0,
      totalSpent: credits?.totalSpent ?? 0,
      isLowBalance,
      isZeroBalance,
      lowBalanceThreshold: LOW_BALANCE_THRESHOLD,
      // Track if warning was already shown (to avoid spam)
      lowBalanceWarningShown: credits?.lowBalanceWarningShown ?? null,
    };
  }),

  /**
   * Mark low balance warning as shown (to avoid repeated warnings)
   */
  dismissLowBalanceWarning: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(userCredits)
      .set({
        lowBalanceWarningShown: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, ctx.user.id));

    return { success: true };
  }),

  /**
   * Refund credits for a failed generation job
   * This is called when a generation fails after credits were deducted
   */
  refundFailedJob: protectedProcedure
    .input(
      z.object({
        jobId: z.string().uuid(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find the job
      const job = await ctx.db.query.generationJobs.findFirst({
        where: eq(generationJobs.id, input.jobId),
      });

      if (!job) {
        return { success: false, message: 'Job not found' };
      }

      // Only refund if job belongs to user and failed
      if (job.userId !== ctx.user.id) {
        return { success: false, message: 'Unauthorized' };
      }

      if (job.status !== 'failed') {
        return { success: false, message: 'Job is not failed' };
      }

      const creditsToRefund = job.creditsUsed ?? 0;
      if (creditsToRefund === 0) {
        return { success: false, message: 'No credits to refund' };
      }

      // Get current balance
      const credits = await ctx.db.query.userCredits.findFirst({
        where: eq(userCredits.userId, ctx.user.id),
      });

      const newBalance = (credits?.balance ?? 0) + creditsToRefund;

      // Refund credits
      await ctx.db
        .update(userCredits)
        .set({
          balance: newBalance,
          totalSpent: Math.max(0, (credits?.totalSpent ?? 0) - creditsToRefund),
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, ctx.user.id));

      // Record refund transaction
      await ctx.db.insert(creditTransactions).values({
        userId: ctx.user.id,
        type: 'refund',
        amount: creditsToRefund,
        balanceAfter: newBalance,
        referenceType: 'generation_job',
        referenceId: job.id,
        description: input.reason || 'Failed generation refund',
      });

      // Create notification
      const notificationsRepo = new NotificationsRepository(ctx.db);
      await notificationsRepo.create({
        userId: ctx.user.id,
        type: 'credits.refunded',
        title: 'Credits refunded',
        body: `${creditsToRefund} credits refunded for failed generation`,
        href: '/activity',
        metadata: { jobId: job.id, refunded: creditsToRefund },
      });

      return {
        success: true,
        refunded: creditsToRefund,
        newBalance,
      };
    }),

  /**
   * Add credits (for subscription grants, purchases, bonuses)
   * Note: In production, this should be an internal/admin procedure
   */
  addCredits: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        type: z.enum(['subscription_grant', 'purchase', 'bonus', 'admin_adjustment']),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create user credits
      let credits = await ctx.db.query.userCredits.findFirst({
        where: eq(userCredits.userId, ctx.user.id),
      });

      if (!credits) {
        // Create credits record if it doesn't exist
        const [newCredits] = await ctx.db
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

      const newBalance = (credits?.balance ?? 0) + input.amount;
      const newTotalEarned = (credits?.totalEarned ?? 0) + input.amount;

      // Update balance
      await ctx.db
        .update(userCredits)
        .set({
          balance: newBalance,
          totalEarned: newTotalEarned,
          // Reset low balance warning when credits are added
          lowBalanceWarningShown: null,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, ctx.user.id));

      // Record transaction
      await ctx.db.insert(creditTransactions).values({
        userId: ctx.user.id,
        type: input.type,
        amount: input.amount,
        balanceAfter: newBalance,
        description:
          input.description ||
          `${input.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`,
      });

      return {
        success: true,
        added: input.amount,
        newBalance,
        totalEarned: newTotalEarned,
      };
    }),

  /**
   * Deduct credits for wizard character creation (atomic deferred billing)
   * 
   * This handles all credit deductions for the wizard flow:
   * - Base images (if generated)
   * - Profile picture set (if selected)
   * - NSFW extra (if enabled with profile set)
   * 
   * Returns new balance and breakdown of deductions.
   */
  deductForWizard: protectedProcedure
    .input(
      z.object({
        characterId: z.string().uuid(),
        characterName: z.string(),
        baseImagesCost: z.number().min(0),
        profileSetCost: z.number().min(0),
        nsfwExtraCost: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const totalCost = input.baseImagesCost + input.profileSetCost + input.nsfwExtraCost;
      
      if (totalCost === 0) {
        // Nothing to deduct
        const credits = await ctx.db.query.userCredits.findFirst({
          where: eq(userCredits.userId, ctx.user.id),
        });
        return {
          success: true,
          deducted: 0,
          newBalance: credits?.balance ?? 0,
          breakdown: input,
        };
      }

      // Get current balance
      const credits = await ctx.db.query.userCredits.findFirst({
        where: eq(userCredits.userId, ctx.user.id),
      });

      const currentBalance = credits?.balance ?? 0;

      if (currentBalance < totalCost) {
        return {
          success: false,
          error: 'Insufficient credits',
          required: totalCost,
          available: currentBalance,
          needed: totalCost - currentBalance,
        };
      }

      const newBalance = currentBalance - totalCost;
      const newTotalSpent = (credits?.totalSpent ?? 0) + totalCost;

      // Atomically deduct credits
      await ctx.db
        .update(userCredits)
        .set({
          balance: newBalance,
          totalSpent: newTotalSpent,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, ctx.user.id));

      // Build description for transaction
      const parts: string[] = [];
      if (input.baseImagesCost > 0) parts.push(`Base Images: ${input.baseImagesCost}`);
      if (input.profileSetCost > 0) parts.push(`Profile Set: ${input.profileSetCost}`);
      if (input.nsfwExtraCost > 0) parts.push(`NSFW: ${input.nsfwExtraCost}`);
      const description = `Character creation: ${input.characterName} (${parts.join(', ')})`;

      // Record single combined transaction
      await ctx.db.insert(creditTransactions).values({
        userId: ctx.user.id,
        type: 'generation',
        amount: -totalCost,
        balanceAfter: newBalance,
        referenceType: 'character',
        referenceId: input.characterId,
        description,
      });

      // Create notification for deduction
      const notificationsRepo = new NotificationsRepository(ctx.db);
      await notificationsRepo.create({
        userId: ctx.user.id,
        type: 'credits.used',
        title: 'Credits used',
        body: `${totalCost} credits used for ${input.characterName}`,
        href: `/influencer/${input.characterId}`,
        metadata: {
          characterId: input.characterId,
          characterName: input.characterName,
          creditsUsed: totalCost,
          breakdown: input,
        },
      });

      return {
        success: true,
        deducted: totalCost,
        newBalance,
        breakdown: input,
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
          // qualityMode removed - see EP-045
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
