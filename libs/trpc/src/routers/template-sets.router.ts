/**
 * Template Sets Router
 *
 * Handles template set CRUD operations, member management, likes, and application.
 * Epic: EP-046 (Template Sets Data Model & API)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TemplateSetService } from '@ryla/business/services/template-set.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';

// Input schemas
const createTemplateSetSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  templateIds: z.array(z.string().uuid()).min(1).max(20),
  isPublic: z.boolean().default(false),
  previewImageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
});

const updateTemplateSetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  templateIds: z.array(z.string().uuid()).min(1).max(20).optional(),
  isPublic: z.boolean().optional(),
  previewImageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
});

const listTemplateSetsSchema = z.object({
  category: z.enum(['all', 'my_sets', 'curated', 'popular']).optional(),
  contentType: z.enum(['image', 'video', 'lip_sync', 'audio', 'mixed']).optional(),
  search: z.string().optional(),
  sort: z.enum(['popular', 'trending', 'new', 'recent']).default('popular'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

const addMemberSchema = z.object({
  setId: z.string().uuid(),
  templateId: z.string().uuid(),
});

const removeMemberSchema = z.object({
  setId: z.string().uuid(),
  templateId: z.string().uuid(),
});

const reorderMembersSchema = z.object({
  setId: z.string().uuid(),
  templateIds: z.array(z.string().uuid()),
});

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

export const templateSetsRouter = router({
  /**
   * List template sets with filters and pagination
   * Public for curated/public sets, protected for user sets
   */
  list: publicProcedure.input(listTemplateSetsSchema).query(async ({ ctx, input }) => {
    const db = getDb(ctx);
    const service = new TemplateSetService(db);
    const context = ctx as { user?: { id: string } };

    const filters = {
      category: input.category ?? 'all',
      contentType: input.contentType,
      search: input.search,
      userId: input.category === 'my_sets' ? context.user?.id : undefined,
    };

    const pagination = {
      page: input.page,
      limit: input.limit,
    };

    return service.findAll(filters, pagination, input.sort);
  }),

  /**
   * Get template set by ID
   * Public (anyone can view public sets)
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);
      const context = ctx as { user?: { id: string } };

      const set = await service.findById(input.id);
      if (!set) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template set not found',
        });
      }

      // Check visibility (public/curated or user's own set)
      if (!set.isPublic && !set.isCurated) {
        if (!context.user || set.userId !== context.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Template set is private',
          });
        }
      }

      return { set };
    }),

  /**
   * Get template set by ID with members
   * Public (anyone can view public sets)
   */
  getByIdWithMembers: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);
      const context = ctx as { user?: { id: string } };

      const set = await service.findByIdWithMembers(input.id);
      if (!set) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template set not found',
        });
      }

      // Check visibility
      if (!set.isPublic && !set.isCurated) {
        if (!context.user || set.userId !== context.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Template set is private',
          });
        }
      }

      return { set };
    }),

  /**
   * Create a new template set
   * Protected (requires authentication)
   */
  create: protectedProcedure
    .input(createTemplateSetSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);

      try {
        const set = await service.create(ctx.user.id, {
          name: input.name,
          description: input.description,
          templateIds: input.templateIds,
          isPublic: input.isPublic,
          previewImageUrl: input.previewImageUrl,
          thumbnailUrl: input.thumbnailUrl,
        });

        return { set };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        throw error;
      }
    }),

  /**
   * Update template set
   * Protected (requires authentication and ownership)
   */
  update: protectedProcedure
    .input(updateTemplateSetSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);

      try {
        const set = await service.update(ctx.user.id, input.id, {
          name: input.name,
          description: input.description,
          templateIds: input.templateIds,
          isPublic: input.isPublic,
          previewImageUrl: input.previewImageUrl,
          thumbnailUrl: input.thumbnailUrl,
        });

        return { set };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (error.message.includes('only update your own')) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: error.message,
            });
          }
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        throw error;
      }
    }),

  /**
   * Delete template set
   * Protected (requires authentication and ownership)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);

      try {
        const deleted = await service.delete(ctx.user.id, input.id);
        if (!deleted) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Template set not found',
          });
        }

        return { deleted: true };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (error.message.includes('only delete your own')) {
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
   * Apply template set (returns configs for generation)
   * Public (anyone can apply visible sets)
   * Note: Named 'applySet' because 'apply' is a reserved word in tRPC v11
   */
  applySet: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);
      const context = ctx as { user?: { id: string } };

      try {
        // First check visibility
        const set = await service.findById(input.id);
        if (!set) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Template set not found',
          });
        }

        if (!set.isPublic && !set.isCurated) {
          if (!context.user || set.userId !== context.user.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Template set is private',
            });
          }
        }

        // Apply and get configs
        const result = await service.apply(input.id);
        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: error.message,
          });
        }
        throw error;
      }
    }),

  // ==================== MEMBER MANAGEMENT ====================

  /**
   * Add member to set
   * Protected (requires authentication and ownership)
   */
  addMember: protectedProcedure
    .input(addMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);

      try {
        const set = await service.addMember(ctx.user.id, input.setId, input.templateId);
        return { set };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (error.message.includes('only modify your own')) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: error.message,
            });
          }
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        throw error;
      }
    }),

  /**
   * Remove member from set
   * Protected (requires authentication and ownership)
   */
  removeMember: protectedProcedure
    .input(removeMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);

      try {
        const set = await service.removeMember(ctx.user.id, input.setId, input.templateId);
        return { set };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (error.message.includes('only modify your own')) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: error.message,
            });
          }
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        throw error;
      }
    }),

  /**
   * Reorder members in set
   * Protected (requires authentication and ownership)
   */
  reorderMembers: protectedProcedure
    .input(reorderMembersSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);

      try {
        const set = await service.reorderMembers(ctx.user.id, input.setId, input.templateIds);
        return { set };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (error.message.includes('only modify your own')) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: error.message,
            });
          }
        }
        throw error;
      }
    }),

  // ==================== LIKES ====================

  /**
   * Like a template set
   * Protected (requires authentication)
   */
  like: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);

      try {
        const liked = await service.like(ctx.user.id, input.id);
        return { liked };
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
  unlike: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);

      const unliked = await service.unlike(ctx.user.id, input.id);
      return { unliked };
    }),

  /**
   * Check if user has liked a set
   * Protected (requires authentication)
   */
  hasLiked: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateSetService(db);

      const hasLiked = await service.hasLiked(ctx.user.id, input.id);
      return { hasLiked };
    }),

  /**
   * Get user's liked set IDs
   * Protected (requires authentication)
   */
  getLikedSetIds: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb(ctx);
    const service = new TemplateSetService(db);

    const setIds = await service.getUserLikedSetIds(ctx.user.id);
    return { setIds };
  }),
});
