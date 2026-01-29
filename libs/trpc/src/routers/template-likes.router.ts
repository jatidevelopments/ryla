/**
 * Template Likes Router
 *
 * Handles like/unlike operations and liked templates retrieval.
 * Epic: EP-049 (Likes & Popularity System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { TemplateLikesService } from '@ryla/business/services/template-likes.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';

// Helper to get database from context
function getDb(ctx: unknown): NodePgDatabase<typeof schema> {
  const context = ctx as { db?: NodePgDatabase<typeof schema> };
  if (!context.db) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database not available',
    });
  }
  return context.db;
}

export const templateLikesRouter = router({
  /**
   * Like a template
   * Protected (requires authentication)
   */
  like: protectedProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      try {
        const result = await service.like(ctx.user.id, input.templateId);
        return result;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (error.message.includes('Cannot like private')) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: error.message,
            });
          }
        }
        throw error;
      }
    }),

  /**
   * Unlike a template
   * Protected (requires authentication)
   */
  unlike: protectedProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      return service.unlike(ctx.user.id, input.templateId);
    }),

  /**
   * Toggle like status
   * Protected (requires authentication)
   */
  toggle: protectedProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      try {
        const result = await service.toggle(ctx.user.id, input.templateId);
        return result;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (error.message.includes('Cannot like private')) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: error.message,
            });
          }
        }
        throw error;
      }
    }),

  /**
   * Check if user has liked a template
   * Protected (requires authentication)
   */
  isLiked: protectedProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      const isLiked = await service.isLiked(ctx.user.id, input.templateId);
      return { isLiked };
    }),

  /**
   * Get like statuses for multiple templates
   * Protected (requires authentication)
   */
  getLikeStatuses: protectedProcedure
    .input(z.object({ templateIds: z.array(z.string().uuid()) }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      const statusMap = await service.getLikeStatuses(
        ctx.user.id,
        input.templateIds
      );

      // Convert Map to object for serialization
      const statuses: Record<string, boolean> = {};
      statusMap.forEach((value: boolean, key: string) => {
        statuses[key] = value;
      });

      return { statuses };
    }),

  /**
   * Get likes count for a template
   * Protected (requires authentication)
   */
  getLikesCount: protectedProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      const count = await service.getLikesCount(input.templateId);
      return { count };
    }),

  /**
   * Get user's liked template IDs
   * Protected (requires authentication)
   */
  getLikedTemplateIds: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb(ctx);
    const service = new TemplateLikesService(db);

    const templateIds = await service.getLikedTemplateIds(ctx.user.id);
    return { templateIds };
  }),

  /**
   * Get user's liked templates
   * Protected (requires authentication)
   */
  getLikedTemplates: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(50).default(20),
          offset: z.number().int().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      const templates = await service.getLikedTemplates(
        ctx.user.id,
        input?.limit ?? 20,
        input?.offset ?? 0
      );
      return { templates };
    }),

  /**
   * Get count of templates liked by user
   * Protected (requires authentication)
   */
  countUserLikes: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb(ctx);
    const service = new TemplateLikesService(db);

    const count = await service.countUserLikes(ctx.user.id);
    return { count };
  }),

  // ==================== TEMPLATE SET LIKES ====================

  /**
   * Like a template set
   * Protected (requires authentication)
   */
  likeSet: protectedProcedure
    .input(z.object({ setId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      try {
        const result = await service.likeSet(ctx.user.id, input.setId);
        return result;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (error.message.includes('Cannot like private')) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: error.message,
            });
          }
        }
        throw error;
      }
    }),

  /**
   * Unlike a template set
   * Protected (requires authentication)
   */
  unlikeSet: protectedProcedure
    .input(z.object({ setId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      return service.unlikeSet(ctx.user.id, input.setId);
    }),

  /**
   * Toggle like status for a template set
   * Protected (requires authentication)
   */
  toggleSet: protectedProcedure
    .input(z.object({ setId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      try {
        const result = await service.toggleSetLike(ctx.user.id, input.setId);
        return result;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (error.message.includes('Cannot like private')) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: error.message,
            });
          }
        }
        throw error;
      }
    }),

  /**
   * Check if user has liked a template set
   * Protected (requires authentication)
   */
  isSetLiked: protectedProcedure
    .input(z.object({ setId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      const isLiked = await service.isSetLiked(ctx.user.id, input.setId);
      return { isLiked };
    }),

  /**
   * Get like statuses for multiple template sets
   * Protected (requires authentication)
   */
  getSetLikeStatuses: protectedProcedure
    .input(z.object({ setIds: z.array(z.string().uuid()) }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateLikesService(db);

      const statusMap = await service.getSetLikeStatuses(
        ctx.user.id,
        input.setIds
      );

      // Convert Map to object for serialization
      const statuses: Record<string, boolean> = {};
      statusMap.forEach((value: boolean, key: string) => {
        statuses[key] = value;
      });

      return { statuses };
    }),

  /**
   * Get user's liked set IDs
   * Protected (requires authentication)
   */
  getLikedSetIds: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb(ctx);
    const service = new TemplateLikesService(db);

    const setIds = await service.getLikedSetIds(ctx.user.id);
    return { setIds };
  }),
});
