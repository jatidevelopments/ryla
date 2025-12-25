/**
 * Prompts Router
 *
 * Handles prompt library operations using Drizzle ORM.
 * Provides access to prompts, favorites, and statistics.
 */

import { z } from 'zod';
import { eq, and, desc, sql, or, ilike } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

import { prompts, promptFavorites, promptUsage } from '@ryla/data';

import { router, protectedProcedure } from '../trpc';

export const promptsRouter = router({
  /**
   * List all prompts (favorites appear first for authenticated users)
   */
  list: protectedProcedure
    .input(
      z
        .object({
          category: z
            .enum([
              'portrait',
              'fullbody',
              'lifestyle',
              'fashion',
              'fitness',
              'social_media',
              'artistic',
              'video_reference',
            ])
            .optional(),
          rating: z.enum(['sfw', 'suggestive', 'nsfw']).optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 50, offset = 0, category, rating, search } = input ?? {};

      // Build conditions
      const conditions = [
        eq(prompts.isActive, true),
        eq(prompts.isPublic, true),
      ];

      if (category) {
        conditions.push(eq(prompts.category, category));
      }

      if (rating) {
        conditions.push(eq(prompts.rating, rating));
      }

      if (search) {
        conditions.push(
          or(
            ilike(prompts.name, `%${search}%`),
            ilike(prompts.description, `%${search}%`)
          )!
        );
      }

      // Get user's favorites first
      const userFavorites = await ctx.db.query.promptFavorites.findMany({
        where: eq(promptFavorites.userId, ctx.user.id),
        columns: { promptId: true, sortOrder: true },
        orderBy: [promptFavorites.sortOrder, desc(promptFavorites.createdAt)],
      });

      const favoriteIds = userFavorites.map((f) => f.promptId);

      // Get all prompts
      const allPrompts = await ctx.db.query.prompts.findMany({
        where: and(...conditions),
        limit: limit + favoriteIds.length, // Get enough to fill after favorites
        offset: 0,
        orderBy: [desc(prompts.usageCount), desc(prompts.createdAt)],
      });

      // Separate favorites and others
      const favorites = allPrompts.filter((p) => favoriteIds.includes(p.id));
      const others = allPrompts.filter((p) => !favoriteIds.includes(p.id));

      // Sort favorites by user's sortOrder
      favorites.sort((a, b) => {
        const aOrder =
          userFavorites.find((f) => f.promptId === a.id)?.sortOrder ?? 0;
        const bOrder =
          userFavorites.find((f) => f.promptId === b.id)?.sortOrder ?? 0;
        return aOrder - bOrder;
      });

      // Combine: favorites first, then others
      const sorted = [...favorites, ...others].slice(offset, offset + limit);

      // Get total count
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(prompts)
        .where(and(...conditions));

      return {
        items: sorted,
        total: Number(countResult?.count ?? 0),
        limit,
        offset,
      };
    }),

  /**
   * Get a single prompt by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const prompt = await ctx.db.query.prompts.findFirst({
        where: and(
          eq(prompts.id, input.id),
          eq(prompts.isActive, true)
        ),
      });

      if (!prompt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prompt not found',
        });
      }

      return prompt;
    }),

  /**
   * Get user's favorite prompts
   */
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const favorites = await ctx.db.query.promptFavorites.findMany({
      where: eq(promptFavorites.userId, ctx.user.id),
      with: {
        prompt: true,
      },
      orderBy: [promptFavorites.sortOrder, desc(promptFavorites.createdAt)],
    });

    return favorites.map((f) => f.prompt).filter(Boolean);
  }),

  /**
   * Add prompt to favorites
   */
  addFavorite: protectedProcedure
    .input(z.object({ promptId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify prompt exists
      const prompt = await ctx.db.query.prompts.findFirst({
        where: eq(prompts.id, input.promptId),
        columns: { id: true },
      });

      if (!prompt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prompt not found',
        });
      }

      // Check if already favorited
      const existing = await ctx.db.query.promptFavorites.findFirst({
        where: and(
          eq(promptFavorites.promptId, input.promptId),
          eq(promptFavorites.userId, ctx.user.id)
        ),
      });

      if (existing) {
        return { favorited: true };
      }

      // Get max sortOrder for this user
      const [maxOrder] = await ctx.db
        .select({ max: sql<number>`max(${promptFavorites.sortOrder})` })
        .from(promptFavorites)
        .where(eq(promptFavorites.userId, ctx.user.id));

      const nextOrder = (maxOrder?.max ?? -1) + 1;

      // Add favorite
      await ctx.db.insert(promptFavorites).values({
        promptId: input.promptId,
        userId: ctx.user.id,
        sortOrder: nextOrder,
      });

      // Update favorite count
      await ctx.db
        .update(prompts)
        .set({
          favoriteCount: sql`${prompts.favoriteCount} + 1`,
        })
        .where(eq(prompts.id, input.promptId));

      return { favorited: true };
    }),

  /**
   * Remove prompt from favorites
   */
  removeFavorite: protectedProcedure
    .input(z.object({ promptId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db
        .delete(promptFavorites)
        .where(
          and(
            eq(promptFavorites.promptId, input.promptId),
            eq(promptFavorites.userId, ctx.user.id)
          )
        )
        .returning();

      if (deleted.length > 0) {
        // Update favorite count
        await ctx.db
          .update(prompts)
          .set({
            favoriteCount: sql`GREATEST(${prompts.favoriteCount} - 1, 0)`,
          })
          .where(eq(prompts.id, input.promptId));
      }

      return { favorited: false };
    }),

  /**
   * Check if prompt is favorited
   */
  isFavorited: protectedProcedure
    .input(z.object({ promptId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const favorite = await ctx.db.query.promptFavorites.findFirst({
        where: and(
          eq(promptFavorites.promptId, input.promptId),
          eq(promptFavorites.userId, ctx.user.id)
        ),
      });

      return { favorited: !!favorite };
    }),

  /**
   * Get usage statistics for a prompt
   */
  getStats: protectedProcedure
    .input(z.object({ promptId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify prompt exists
      const prompt = await ctx.db.query.prompts.findFirst({
        where: eq(prompts.id, input.promptId),
        columns: { id: true },
      });

      if (!prompt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prompt not found',
        });
      }

      // Get usage stats
      const [stats] = await ctx.db
        .select({
          totalUsage: sql<number>`count(*)`,
          successCount: sql<number>`sum(case when ${promptUsage.success} then 1 else 0 end)`,
          failureCount: sql<number>`sum(case when not ${promptUsage.success} then 1 else 0 end)`,
          avgGenerationTimeMs: sql<number | null>`avg(${promptUsage.generationTimeMs})`,
          lastUsedAt: sql<Date | null>`max(${promptUsage.createdAt})`,
        })
        .from(promptUsage)
        .where(eq(promptUsage.promptId, input.promptId));

      const total = Number(stats?.totalUsage ?? 0);
      const success = Number(stats?.successCount ?? 0);
      const failure = Number(stats?.failureCount ?? 0);
      const successRate = total > 0 ? (success / total) * 100 : 0;

      return {
        promptId: input.promptId,
        totalUsage: total,
        successCount: success,
        failureCount: failure,
        successRate: Math.round(successRate * 100) / 100, // Round to 2 decimals
        avgGenerationTimeMs: stats?.avgGenerationTimeMs
          ? Math.round(Number(stats.avgGenerationTimeMs))
          : null,
        lastUsedAt: stats?.lastUsedAt ? new Date(stats.lastUsedAt) : null,
      };
    }),

  /**
   * Get top used prompts
   */
  getTopUsed: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(10),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;

      const topPrompts = await ctx.db.query.prompts.findMany({
        where: and(eq(prompts.isActive, true), eq(prompts.isPublic, true)),
        orderBy: [desc(prompts.usageCount), desc(prompts.createdAt)],
        limit,
      });

      return topPrompts;
    }),
});

