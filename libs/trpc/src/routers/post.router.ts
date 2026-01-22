/**
 * Post Router
 *
 * Handles generated content (posts) operations using Drizzle ORM.
 * NO SUPABASE - direct Postgres access.
 */

import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

import { posts, characters } from '@ryla/data';
import { PostPromptTrackingService } from '@ryla/business/services/post-prompt-tracking.service';

import { router, protectedProcedure } from '../trpc';

export const postRouter = router({
  /**
   * List posts for a character or all characters
   */
  list: protectedProcedure
    .input(
      z
        .object({
          characterId: z.string().uuid().optional(),
          liked: z.boolean().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 20, offset = 0, characterId, liked } = input ?? {};

      // Build conditions
      const conditions = [eq(posts.userId, ctx.user.id)];

      if (characterId) {
        conditions.push(eq(posts.characterId, characterId));
      }

      if (liked !== undefined) {
        conditions.push(eq(posts.liked, liked));
      }

      const items = await ctx.db.query.posts.findMany({
        where: and(...conditions),
        limit,
        offset,
        orderBy: desc(posts.createdAt),
        columns: {
          id: true,
          characterId: true,
          imageUrl: true,
          thumbnailUrl: true,
          width: true,
          height: true,
          caption: true,
          scene: true,
          environment: true,
          liked: true,
          exported: true,
          createdAt: true,
        },
      });

      // Get total count
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(and(...conditions));

      return {
        items,
        total: Number(countResult?.count ?? 0),
        limit,
        offset,
      };
    }),

  /**
   * Create a new post from generated image
   * Includes prompt tracking for analytics
   */
  create: protectedProcedure
    .input(
      z.object({
        characterId: z.string().uuid(),
        jobId: z.string().uuid().optional(),
        promptId: z.string().uuid().optional(), // Prompt template ID
        imageUrl: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        s3Key: z.string(),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        scene: z.enum([
          'professional_portrait',
          'candid_lifestyle',
          'fashion_editorial',
          'fitness_motivation',
          'morning_vibes',
          'night_out',
          'cozy_home',
          'beach_day',
        ]),
        environment: z.enum([
          'beach',
          'home_bedroom',
          'home_living_room',
          'office',
          'cafe',
          'urban_street',
          'studio',
        ]),
        outfit: z.string(),
        aspectRatio: z.enum(['1:1', '9:16', '2:3']).default('9:16'),
        // qualityMode removed - see EP-045
        nsfw: z.boolean().default(false),
        prompt: z.string().optional(), // Full prompt text
        negativePrompt: z.string().optional(),
        seed: z.string().optional(),
        caption: z.string().optional(),
        // Tracking data
        generationTimeMs: z.number().int().optional(),
        success: z.boolean().default(true),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify character ownership
      const character = await ctx.db.query.characters.findFirst({
        where: and(
          eq(characters.id, input.characterId),
          eq(characters.userId, ctx.user.id)
        ),
        columns: { id: true },
      });

      if (!character) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Character not found',
        });
      }

      // Create post
      const [post] = await ctx.db
        .insert(posts)
        .values({
          characterId: input.characterId,
          userId: ctx.user.id,
          jobId: input.jobId,
          promptId: input.promptId,
          imageUrl: input.imageUrl,
          thumbnailUrl: input.thumbnailUrl,
          s3Key: input.s3Key,
          width: input.width,
          height: input.height,
          caption: input.caption,
          scene: input.scene,
          environment: input.environment,
          outfit: input.outfit,
          aspectRatio: input.aspectRatio,
          // qualityMode removed - see EP-045
          nsfw: input.nsfw,
          prompt: input.prompt,
          negativePrompt: input.negativePrompt,
          seed: input.seed,
        })
        .returning();

      // Track prompt usage if promptId provided
      if (input.promptId) {
        try {
          const trackingService = new PostPromptTrackingService(ctx.db);
          await trackingService.trackPostCreation({
            postId: post.id,
            userId: post.userId,
            characterId: post.characterId,
            jobId: post.jobId || undefined,
            promptId: input.promptId,
            scene: post.scene,
            environment: post.environment,
            outfit: post.outfit,
            prompt: post.prompt || undefined,
            negativePrompt: post.negativePrompt || undefined,
            success: input.success,
            generationTimeMs: input.generationTimeMs,
            errorMessage: input.errorMessage,
          });
        } catch (error) {
          // Log error but don't fail post creation
          console.error('Failed to track prompt usage:', error);
        }
      }

      // Update character post count
      await ctx.db
        .update(characters)
        .set({
          postCount: sql`CAST(COALESCE(${characters.postCount}, '0') AS INTEGER) + 1`,
          updatedAt: new Date(),
        })
        .where(eq(characters.id, input.characterId));

      return {
        success: true,
        post,
      };
    }),

  /**
   * Get a single post by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: and(eq(posts.id, input.id), eq(posts.userId, ctx.user.id)),
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }

      return post;
    }),

  /**
   * Toggle like status on a post
   */
  toggleLike: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: and(eq(posts.id, input.id), eq(posts.userId, ctx.user.id)),
        columns: { id: true, liked: true, characterId: true },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }

      const newLiked = !post.liked;

      await ctx.db
        .update(posts)
        .set({ liked: newLiked, updatedAt: new Date() })
        .where(eq(posts.id, input.id));

      // Update character liked count
      const likedDelta = newLiked ? 1 : -1;
      await ctx.db
        .update(characters)
        .set({
          likedCount: sql`CAST(COALESCE(${characters.likedCount}, '0') AS INTEGER) + ${likedDelta}`,
        })
        .where(eq(characters.id, post.characterId));

      return {
        success: true,
        id: input.id,
        liked: newLiked,
      };
    }),

  /**
   * Update post caption
   */
  updateCaption: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        caption: z.string().max(2200), // Instagram limit
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: and(eq(posts.id, input.id), eq(posts.userId, ctx.user.id)),
        columns: { id: true },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }

      await ctx.db
        .update(posts)
        .set({
          caption: input.caption,
          captionEdited: true,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, input.id));

      return {
        success: true,
        id: input.id,
      };
    }),

  /**
   * Mark post as exported
   */
  markExported: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: and(eq(posts.id, input.id), eq(posts.userId, ctx.user.id)),
        columns: { id: true },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }

      await ctx.db
        .update(posts)
        .set({
          exported: true,
          exportedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(posts.id, input.id));

      return {
        success: true,
        id: input.id,
      };
    }),

  /**
   * Delete a post
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: and(eq(posts.id, input.id), eq(posts.userId, ctx.user.id)),
        columns: { id: true, characterId: true },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }

      // Delete post
      await ctx.db.delete(posts).where(eq(posts.id, input.id));

      // Decrement character post count
      await ctx.db
        .update(characters)
        .set({
          postCount: sql`CAST(COALESCE(${characters.postCount}, '0') AS INTEGER) - 1`,
        })
        .where(eq(characters.id, post.characterId));

      // TODO: Delete from S3 storage

      return {
        success: true,
        id: input.id,
      };
    }),

  /**
   * Bulk delete posts
   */
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()).min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      // Verify all posts belong to user
      const userPosts = await ctx.db.query.posts.findMany({
        where: and(eq(posts.userId, ctx.user.id)),
        columns: { id: true },
      });

      const userPostIds = new Set(userPosts.map((p) => p.id));
      const validIds = input.ids.filter((id) => userPostIds.has(id));

      if (validIds.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No valid posts found',
        });
      }

      // Delete posts
      for (const id of validIds) {
        await ctx.db.delete(posts).where(eq(posts.id, id));
      }

      // TODO: Delete from S3 storage
      // TODO: Update character post counts

      return {
        success: true,
        deleted: validIds.length,
      };
    }),
});
