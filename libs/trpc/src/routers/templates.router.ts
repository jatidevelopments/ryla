/**
 * Templates Router
 *
 * Handles template CRUD operations, application, and usage tracking.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TemplateService } from '@ryla/business/services/template.service';
import type { TemplateConfig } from '@ryla/data/schema/templates.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';

// Template config schema (for validation)
const templateConfigSchema: z.ZodType<TemplateConfig> = z.object({
  scene: z.string().nullable(),
  environment: z.string().nullable(),
  outfit: z.union([z.string(), z.record(z.unknown())]).nullable(),
  aspectRatio: z.enum(['1:1', '9:16', '2:3', '3:4', '4:3', '16:9', '3:2']),
  qualityMode: z.enum(['draft', 'hq']),
  nsfw: z.boolean(),
  poseId: z.string().nullable(),
  styleId: z.string().nullable(),
  lightingId: z.string().nullable(),
  modelId: z.string(),
  objects: z
    .array(
      z.object({
        id: z.string(),
        imageUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        name: z.string().optional(),
      })
    )
    .nullable(),
  prompt: z.string().optional(),
  promptEnhance: z.boolean().optional(),
});

// Input schemas
const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  previewImageId: z.string().uuid(),
  config: templateConfigSchema,
  isPublic: z.boolean().default(false),
  tags: z.array(z.string().max(20)).max(10).optional(),
  influencerId: z.string().uuid().optional(),
  sourceJobId: z.string().uuid().optional(),
});

const updateTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string().max(20)).max(10).optional(),
});

const listTemplatesSchema = z.object({
  scene: z.string().optional(),
  environment: z.string().optional(),
  aspectRatio: z.string().optional(),
  qualityMode: z.enum(['draft', 'hq']).optional(),
  nsfw: z.boolean().optional(),
  search: z.string().optional(),
  sort: z.enum(['popular', 'recent', 'success_rate']).optional(),
  category: z.enum(['all', 'my_templates', 'curated', 'popular']).optional(),
  influencerId: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

const trackUsageSchema = z.object({
  templateId: z.string().uuid(),
  jobId: z.string().uuid(),
});

// Helper to get database from context
function getDb(ctx: any): NodePgDatabase<typeof schema> {
  if (!ctx.db) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database not available',
    });
  }
  return ctx.db;
}

export const templatesRouter = router({
  /**
   * List templates with filters and pagination
   * Public for curated/public templates, protected for user templates
   */
  list: publicProcedure.input(listTemplatesSchema).query(async ({ ctx, input }) => {
    const db = getDb(ctx);
    const service = new TemplateService(db);

    const filters = {
      scene: input.scene,
      environment: input.environment,
      aspectRatio: input.aspectRatio,
      qualityMode: input.qualityMode,
      nsfw: input.nsfw,
      search: input.search,
      category: input.category ?? 'all',
      influencerId: input.influencerId,
      userId: input.category === 'my_templates' ? ctx.user?.id : undefined,
    };

    const pagination = {
      page: input.page,
      limit: input.limit,
    };

    return service.findAll(filters, pagination);
  }),

  /**
   * Get template by ID
   * Public (anyone can view templates)
   */
  getById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const db = getDb(ctx);
    const service = new TemplateService(db);

    const template = await service.findById(input.id);
    if (!template) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Template not found',
      });
    }

    // Check visibility (public/curated or user's own template)
    if (!template.isPublic && !template.isCurated) {
      if (!ctx.user || template.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Template is private',
        });
      }
    }

    return { template };
  }),

  /**
   * Create a new template
   * Protected (requires authentication)
   */
  create: protectedProcedure.input(createTemplateSchema).mutation(async ({ ctx, input }) => {
    const db = getDb(ctx);
    const service = new TemplateService(db);

    // TODO: Resolve previewImageId to actual image URL
    // For now, we'll use the image service to get the URL
    // This requires access to ImagesRepository or ImageService
    // We'll handle this in the API layer or inject image service

    const template = await service.create(ctx.user.id, {
      name: input.name,
      description: input.description,
      previewImageId: input.previewImageId, // Will be resolved to URL
      config: input.config,
      isPublic: input.isPublic,
      tags: input.tags,
      influencerId: input.influencerId,
      sourceJobId: input.sourceJobId,
    });

    return { template };
  }),

  /**
   * Update template
   * Protected (requires authentication and ownership)
   */
  update: protectedProcedure.input(updateTemplateSchema).mutation(async ({ ctx, input }) => {
    const db = getDb(ctx);
    const service = new TemplateService(db);

    const template = await service.update(ctx.user.id, input.id, {
      name: input.name,
      description: input.description,
      isPublic: input.isPublic,
      tags: input.tags,
    });

    return { template };
  }),

  /**
   * Delete template
   * Protected (requires authentication and ownership)
   */
  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const db = getDb(ctx);
    const service = new TemplateService(db);

    const deleted = await service.delete(ctx.user.id, input.id);
    if (!deleted) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Template not found',
      });
    }

    return { deleted: true };
  }),

  /**
   * Apply template (returns config)
   * Public (anyone can apply visible templates)
   */
  applyTemplate: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const db = getDb(ctx);
    const service = new TemplateService(db);

    const config = await service.apply(input.id);
    return { config };
  }),

  /**
   * Track template usage
   * Protected (requires authentication)
   */
  trackUsage: protectedProcedure.input(trackUsageSchema).mutation(async ({ ctx, input }) => {
    const db = getDb(ctx);
    const service = new TemplateService(db);

    // TODO: Get generation success status from job
    // For now, we'll track without success status
    await service.trackUsage(input.templateId, ctx.user.id, input.jobId, null);

    return { tracked: true };
  }),

  /**
   * Get template statistics
   * Public (anyone can view stats)
   */
  getStats: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const db = getDb(ctx);
    const service = new TemplateService(db);

    const stats = await service.getStats(input.id);
    return stats;
  }),
});

