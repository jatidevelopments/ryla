/**
 * Template Tags Router
 *
 * Handles tag browsing, search, and template-tag operations.
 * Epic: EP-048 (Category & Tag System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TemplateTagService } from '@ryla/business/services/template-tag.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';

// Input schemas
const listTagsSchema = z.object({
  search: z.string().optional(),
  isSystem: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});

const addTagSchema = z.object({
  templateId: z.string().uuid(),
  tagName: z.string().min(2).max(50),
});

const removeTagSchema = z.object({
  templateId: z.string().uuid(),
  tagId: z.string().uuid(),
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

export const templateTagsRouter = router({
  /**
   * List tags with optional search and pagination
   * Public
   */
  list: publicProcedure.input(listTagsSchema).query(async ({ ctx, input }) => {
    const db = getDb(ctx);
    const service = new TemplateTagService(db);

    return service.getAll(
      { search: input.search, isSystem: input.isSystem },
      { page: input.page, limit: input.limit }
    );
  }),

  /**
   * Get popular tags
   * Public
   */
  getPopular: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateTagService(db);

      const tags = await service.getPopular(input?.limit ?? 20);
      return { tags };
    }),

  /**
   * Search tags by name
   * Public
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateTagService(db);

      const tags = await service.search(input.query, input.limit);
      return { tags };
    }),

  /**
   * Get tag by ID
   * Public
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateTagService(db);

      const tag = await service.getById(input.id);
      if (!tag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag not found',
        });
      }

      return { tag };
    }),

  /**
   * Get tags for a template
   * Public
   */
  getByTemplate: publicProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateTagService(db);

      const tags = await service.getByTemplateId(input.templateId);
      return { tags };
    }),

  /**
   * Add tag to template
   * Protected (requires authentication and ownership)
   */
  addToTemplate: protectedProcedure
    .input(addTagSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateTagService(db);

      try {
        const result = await service.addToTemplate(
          ctx.user.id,
          input.templateId,
          input.tagName
        );
        return result;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (error.message.includes('only add tags to your own')) {
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
   * Remove tag from template
   * Protected (requires authentication and ownership)
   */
  removeFromTemplate: protectedProcedure
    .input(removeTagSchema)
    .mutation(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateTagService(db);

      try {
        const removed = await service.removeFromTemplate(
          ctx.user.id,
          input.templateId,
          input.tagId
        );
        return { removed };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: error.message,
            });
          }
          if (error.message.includes('only remove tags from your own')) {
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
   * Get template IDs by tag
   * Public (for filtering)
   */
  getTemplateIdsByTag: publicProcedure
    .input(z.object({ tagId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateTagService(db);

      const templateIds = await service.getTemplateIdsByTag(input.tagId);
      return { templateIds };
    }),

  /**
   * Get template IDs by multiple tags
   * Public (for filtering)
   */
  getTemplateIdsByTags: publicProcedure
    .input(z.object({ tagIds: z.array(z.string().uuid()) }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateTagService(db);

      const templateIds = await service.getTemplateIdsByTags(input.tagIds);
      return { templateIds };
    }),
});
