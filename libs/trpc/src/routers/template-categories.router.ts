/**
 * Template Categories Router
 *
 * Handles category browsing and tree operations.
 * Epic: EP-048 (Category & Tag System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { TemplateCategoryService } from '@ryla/business/services/template-category.service';
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

export const templateCategoriesRouter = router({
  /**
   * Get category tree
   * Public (anyone can browse categories)
   */
  getTree: publicProcedure
    .input(z.object({ activeOnly: z.boolean().default(true) }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateCategoryService(db);

      const tree = await service.getTree(input?.activeOnly ?? true);
      return { tree };
    }),

  /**
   * Get all categories (flat list)
   * Public
   */
  getAll: publicProcedure
    .input(z.object({ activeOnly: z.boolean().default(true) }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateCategoryService(db);

      const categories = await service.getAll(input?.activeOnly ?? true);
      return { categories };
    }),

  /**
   * Get root categories
   * Public
   */
  getRoots: publicProcedure
    .input(z.object({ activeOnly: z.boolean().default(true) }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateCategoryService(db);

      const categories = await service.getRoots(input?.activeOnly ?? true);
      return { categories };
    }),

  /**
   * Get category by ID
   * Public
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateCategoryService(db);

      const category = await service.getById(input.id);
      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      return { category };
    }),

  /**
   * Get category by slug
   * Public
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateCategoryService(db);

      const category = await service.getBySlug(input.slug);
      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      return { category };
    }),

  /**
   * Get children of a category
   * Public
   */
  getChildren: publicProcedure
    .input(
      z.object({
        parentId: z.string().uuid(),
        activeOnly: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateCategoryService(db);

      const children = await service.getChildren(input.parentId, input.activeOnly);
      return { children };
    }),

  /**
   * Get breadcrumb path for a category
   * Public
   */
  getBreadcrumb: publicProcedure
    .input(z.object({ categoryId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateCategoryService(db);

      const breadcrumb = await service.getBreadcrumb(input.categoryId);
      return { breadcrumb };
    }),

  /**
   * Get all descendant IDs (for filtering)
   * Public
   */
  getDescendantIds: publicProcedure
    .input(z.object({ categoryId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateCategoryService(db);

      const ids = await service.getDescendantIds(input.categoryId);
      return { ids };
    }),

  /**
   * Count templates in category
   * Public
   */
  countTemplates: publicProcedure
    .input(z.object({ categoryId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb(ctx);
      const service = new TemplateCategoryService(db);

      const count = await service.countTemplates(input.categoryId);
      return { count };
    }),
});
