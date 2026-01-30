/**
 * Generation Router
 *
 * Handles AI image generation operations using Drizzle ORM.
 * NO SUPABASE - direct Postgres access.
 */

import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

import {
  generationJobs,
  userCredits,
  creditTransactions,
  characters,
  NotificationsRepository,
  type GenerationInput,
} from '@ryla/data';
import { CREDIT_COSTS } from '@ryla/shared';


import { router, protectedProcedure } from '../trpc';

// Generation input schema
const generationInputSchema = z.object({
  characterId: z.string().uuid(),
  scene: z.string(),
  environment: z.string(),
  outfit: z.string(),
  aspectRatio: z.enum(['1:1', '9:16', '2:3']).default('9:16'),
  // qualityMode removed - see EP-045
  imageCount: z.number().min(1).max(4).default(1),
  nsfw: z.boolean().default(false),
});

export const generationRouter = router({
  /**
   * Create a new image generation job
   */
  create: protectedProcedure
    .input(generationInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify character ownership
      const character = await ctx.db.query.characters.findFirst({
        where: and(
          eq(characters.id, input.characterId),
          eq(characters.userId, ctx.user.id)
        ),
        columns: { id: true, status: true },
      });

      if (!character) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Character not found',
        });
      }

      // Check user credits
      const credits = await ctx.db.query.userCredits.findFirst({
        where: eq(userCredits.userId, ctx.user.id),
      });

      // Use standard credit cost (qualityMode removed - EP-045)
      const cost = (CREDIT_COSTS['draft'] ?? 1) * input.imageCount;
      const currentBalance = credits?.balance ?? 0;

      if (currentBalance < cost) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Insufficient credits. Need ${cost}, have ${currentBalance}`,
        });
      }

      // Create generation job
      const [job] = await ctx.db
        .insert(generationJobs)
        .values({
          userId: ctx.user.id,
          characterId: input.characterId,
          type: 'image_generation',
          status: 'queued',
          input: input as GenerationInput,
          imageCount: input.imageCount,
          creditsUsed: cost,
        })
        .returning();

      // Deduct credits
      const newBalance = currentBalance - cost;

      if (credits) {
        await ctx.db
          .update(userCredits)
          .set({
            balance: newBalance,
            totalSpent: (credits.totalSpent ?? 0) + cost,
            updatedAt: new Date(),
          })
          .where(eq(userCredits.userId, ctx.user.id));
      }

      // Record transaction (qualityMode removed - EP-045)
      await ctx.db.insert(creditTransactions).values({
        userId: ctx.user.id,
        type: 'generation',
        amount: -cost,
        balanceAfter: newBalance,
        referenceType: 'generation_job',
        referenceId: job.id,
        description: `Image generation (${input.imageCount} image${input.imageCount > 1 ? 's' : ''})`,
      });

      // Check for low balance notification after deduction
      if (newBalance > 0 && newBalance <= 10 && !credits?.lowBalanceWarningShown) {
        const notificationsRepo = new NotificationsRepository(ctx.db);
        await notificationsRepo.create({
          userId: ctx.user.id,
          type: 'credits.low_balance',
          title: 'Low credits warning',
          body: `You have ${newBalance} credits remaining. Consider purchasing more.`,
          href: '/buy-credits',
          metadata: { balance: newBalance },
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

      // TODO: Queue job to Bull/Redis for processing

      return {
        jobId: job.id,
        status: job.status,
        creditsUsed: cost,
        estimatedTime: 30, // seconds (qualityMode removed - EP-045)
      };
    }),

  /**
   * Get job status
   */
  getStatus: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.query.generationJobs.findFirst({
        where: and(
          eq(generationJobs.id, input.jobId),
          eq(generationJobs.userId, ctx.user.id)
        ),
      });

      if (!job) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job not found',
        });
      }

      return {
        id: job.id,
        status: job.status,
        type: job.type,
        imageCount: job.imageCount,
        completedCount: job.completedCount,
        output: job.output,
        error: job.error,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
      };
    }),

  /**
   * List generation jobs for current user
   */
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
          characterId: z.string().uuid().optional(),
          status: z
            .enum(['queued', 'processing', 'completed', 'failed', 'cancelled'])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 20, offset = 0, characterId, status } = input ?? {};

      // Build conditions
      const conditions = [eq(generationJobs.userId, ctx.user.id)];

      if (characterId) {
        conditions.push(eq(generationJobs.characterId, characterId));
      }

      if (status) {
        conditions.push(eq(generationJobs.status, status));
      }

      const items = await ctx.db.query.generationJobs.findMany({
        where: and(...conditions),
        limit,
        offset,
        orderBy: desc(generationJobs.createdAt),
        columns: {
          id: true,
          characterId: true,
          type: true,
          status: true,
          imageCount: true,
          completedCount: true,
          creditsUsed: true,
          createdAt: true,
          completedAt: true,
        },
      });

      // Get total count
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(generationJobs)
        .where(and(...conditions));

      return {
        items,
        total: Number(countResult?.count ?? 0),
        limit,
        offset,
      };
    }),

  /**
   * Cancel a queued job
   */
  cancel: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Find job and verify ownership
      const job = await ctx.db.query.generationJobs.findFirst({
        where: and(
          eq(generationJobs.id, input.jobId),
          eq(generationJobs.userId, ctx.user.id)
        ),
      });

      if (!job) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job not found',
        });
      }

      // Can only cancel queued jobs
      if (job.status !== 'queued') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot cancel job with status: ${job.status}`,
        });
      }

      // Cancel job
      await ctx.db
        .update(generationJobs)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(generationJobs.id, input.jobId));

      // Refund credits
      const creditsUsed = job.creditsUsed ?? 0;
      if (creditsUsed > 0) {
        const credits = await ctx.db.query.userCredits.findFirst({
          where: eq(userCredits.userId, ctx.user.id),
        });

        const newBalance = (credits?.balance ?? 0) + creditsUsed;

        await ctx.db
          .update(userCredits)
          .set({
            balance: newBalance,
            totalSpent: Math.max(0, (credits?.totalSpent ?? 0) - creditsUsed),
            updatedAt: new Date(),
          })
          .where(eq(userCredits.userId, ctx.user.id));

        // Record refund transaction
        await ctx.db.insert(creditTransactions).values({
          userId: ctx.user.id,
          type: 'refund',
          amount: creditsUsed,
          balanceAfter: newBalance,
          referenceType: 'generation_job',
          referenceId: job.id,
          description: 'Cancelled job refund',
        });
      }

      return {
        success: true,
        jobId: input.jobId,
        refunded: creditsUsed,
      };
    }),
});
