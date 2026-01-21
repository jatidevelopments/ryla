/**
 * Admin Library Router
 *
 * Provides content library management operations for admin panel.
 * Part of EP-056: Content Library Management
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import {
  prompts,
  templates,
  outfitPresets,
  promptSets,
  adminAuditLog,
  users,
  characters,
} from '@ryla/data';
import { eq, and, or, ilike, desc, asc, isNull, sql, count } from 'drizzle-orm';

/**
 * List prompts schema
 */
const listPromptsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
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
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'usageCount', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Get prompt schema
 */
const getPromptSchema = z.object({
  promptId: z.string().uuid(),
});

/**
 * Create prompt schema
 */
const createPromptSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum([
    'portrait',
    'fullbody',
    'lifestyle',
    'fashion',
    'fitness',
    'social_media',
    'artistic',
    'video_reference',
  ]),
  subcategory: z.string().max(100).optional(),
  template: z.string().min(1),
  negativePrompt: z.string().optional(),
  requiredDNA: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  rating: z.enum(['sfw', 'suggestive', 'nsfw']).default('sfw'),
  recommendedWorkflow: z.string().optional(),
  aspectRatio: z.enum(['1:1', '9:16', '16:9', '4:5', '3:4']).optional(),
  isSystemPrompt: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

/**
 * Update prompt schema
 */
const updatePromptSchema = z.object({
  promptId: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
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
  subcategory: z.string().max(100).optional(),
  template: z.string().min(1).optional(),
  negativePrompt: z.string().optional(),
  requiredDNA: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  rating: z.enum(['sfw', 'suggestive', 'nsfw']).optional(),
  recommendedWorkflow: z.string().optional(),
  aspectRatio: z.enum(['1:1', '9:16', '16:9', '4:5', '3:4']).optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Delete prompt schema
 */
const deletePromptSchema = z.object({
  promptId: z.string().uuid(),
  reason: z.string().min(1).max(500).optional(),
});

/**
 * Publish/unpublish prompt schema
 */
const togglePromptStatusSchema = z.object({
  promptId: z.string().uuid(),
  isActive: z.boolean(),
});

export const libraryRouter = router({
  /**
   * List prompts with pagination, search, and filters
   */
  listPrompts: protectedProcedure
    .input(listPromptsSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const {
        limit,
        offset,
        search,
        category,
        rating,
        isActive,
        isPublic,
        sortBy,
        sortOrder,
      } = input;

      // Build where conditions
      const conditions = [isNull(prompts.deletedAt)];

      if (category) {
        conditions.push(eq(prompts.category, category));
      }

      if (rating) {
        conditions.push(eq(prompts.rating, rating));
      }

      if (isActive !== undefined) {
        conditions.push(eq(prompts.isActive, isActive));
      }

      if (isPublic !== undefined) {
        conditions.push(eq(prompts.isPublic, isPublic));
      }

      if (search) {
        conditions.push(
          or(
            ilike(prompts.name, `%${search}%`),
            ilike(prompts.description ?? '', `%${search}%`),
            sql`${prompts.tags}::text ILIKE ${'%' + search + '%'}`
          )!
        );
      }

      const whereClause = and(...conditions);

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(prompts)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get prompts
      const promptList = await db.query.prompts.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy:
          sortOrder === 'desc'
            ? [desc(prompts[sortBy])]
            : [prompts[sortBy]],
      });

      return {
        prompts: promptList,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get prompt by ID
   */
  getPrompt: protectedProcedure
    .input(getPromptSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { promptId } = input;

      const prompt = await db.query.prompts.findFirst({
        where: and(eq(prompts.id, promptId), isNull(prompts.deletedAt)),
      });

      if (!prompt) {
        throw new Error('Prompt not found');
      }

      return prompt;
    }),

  /**
   * Create a new prompt
   */
  createPrompt: protectedProcedure
    .input(createPromptSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;

      const newPrompt = await db
        .insert(prompts)
        .values({
          ...input,
          createdBy: admin.id,
          usageCount: 0,
          successCount: 0,
          favoriteCount: 0,
        })
        .returning();

      // Log audit
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'create',
        entityType: 'prompt',
        entityId: newPrompt[0].id,
        details: { name: input.name, category: input.category, createdBy: admin.id },
      });

      return newPrompt[0];
    }),

  /**
   * Update a prompt
   */
  updatePrompt: protectedProcedure
    .input(updatePromptSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { promptId, ...updates } = input;

      // Check if prompt exists
      const existing = await db.query.prompts.findFirst({
        where: eq(prompts.id, promptId),
      });

      if (!existing) {
        throw new Error('Prompt not found');
      }

      // Update prompt
      const updated = await db
        .update(prompts)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(prompts.id, promptId))
        .returning();

      // Log audit
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'prompt',
        entityId: promptId,
        details: { oldValue: existing, newValue: updated[0], updatedBy: admin.id },
      });

      return updated[0];
    }),

  /**
   * Delete a prompt (soft delete)
   */
  deletePrompt: protectedProcedure
    .input(deletePromptSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { promptId, reason } = input;

      // Check if prompt exists
      const existing = await db.query.prompts.findFirst({
        where: eq(prompts.id, promptId),
      });

      if (!existing) {
        throw new Error('Prompt not found');
      }

      // Soft delete
      await db
        .update(prompts)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(prompts.id, promptId));

      // Log audit
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'delete',
        entityType: 'prompt',
        entityId: promptId,
        details: { oldValue: existing, deletedAt: new Date(), reason, deletedBy: admin.id },
      });

      return { success: true };
    }),

  /**
   * Toggle prompt active status (publish/unpublish)
   */
  togglePromptStatus: protectedProcedure
    .input(togglePromptStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { promptId, isActive } = input;

      // Check if prompt exists
      const existing = await db.query.prompts.findFirst({
        where: eq(prompts.id, promptId),
      });

      if (!existing) {
        throw new Error('Prompt not found');
      }

      // Update status
      await db
        .update(prompts)
        .set({
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(prompts.id, promptId));

      // Log audit
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'prompt',
        entityId: promptId,
        details: {
          oldValue: { isActive: existing.isActive },
          newValue: { isActive },
          action: isActive ? 'published' : 'unpublished',
        },
      });

      return { success: true, isActive };
    }),

  /**
   * List templates with pagination, search, and filters
   */
  listTemplates: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        category: z.enum(['all', 'curated', 'popular']).optional(),
        isPublic: z.boolean().optional(),
        isCurated: z.boolean().optional(),
        sortBy: z.enum(['createdAt', 'usageCount', 'likesCount', 'name']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const {
        limit,
        offset,
        search,
        category,
        isPublic,
        isCurated,
        sortBy,
        sortOrder,
      } = input;

      // Build where conditions
      const conditions = [];

      if (category === 'curated') {
        conditions.push(eq(templates.isCurated, true));
      } else if (category === 'popular') {
        conditions.push(sql`${templates.usageCount} >= 10`);
      }

      if (isPublic !== undefined) {
        conditions.push(eq(templates.isPublic, isPublic));
      }

      if (isCurated !== undefined) {
        conditions.push(eq(templates.isCurated, isCurated));
      }

      if (search) {
        conditions.push(
          or(
            ilike(templates.name, `%${search}%`),
            ilike(templates.description ?? '', `%${search}%`),
            sql`${templates.tags}::text ILIKE ${'%' + search + '%'}`
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(templates)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get templates
      const templateList = await db.query.templates.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy:
          sortOrder === 'desc'
            ? [desc(templates[sortBy])]
            : [templates[sortBy]],
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
          influencer: {
            columns: {
              id: true,
              name: true,
              handle: true,
            },
          },
        },
      });

      return {
        templates: templateList,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get template by ID
   */
  getTemplate: protectedProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { templateId } = input;

      const template = await db.query.templates.findFirst({
        where: eq(templates.id, templateId),
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
          influencer: {
            columns: {
              id: true,
              name: true,
              handle: true,
            },
          },
        },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      return template;
    }),

  /**
   * Curate a template (mark as curated)
   */
  curateTemplate: protectedProcedure
    .input(z.object({ templateId: z.string().uuid(), curated: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { templateId, curated } = input;

      const existing = await db.query.templates.findFirst({
        where: eq(templates.id, templateId),
      });

      if (!existing) {
        throw new Error('Template not found');
      }

      await db
        .update(templates)
        .set({
          isCurated: curated,
          updatedAt: new Date(),
        })
        .where(eq(templates.id, templateId));

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'template',
        entityId: templateId,
        details: {
          oldValue: { isCurated: existing.isCurated },
          newValue: { isCurated: curated },
          action: curated ? 'curated' : 'uncurated',
        },
      });

      return { success: true, isCurated: curated };
    }),

  /**
   * Delete a template
   */
  deleteTemplate: protectedProcedure
    .input(z.object({ templateId: z.string().uuid(), reason: z.string().min(1).max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { templateId, reason } = input;

      const existing = await db.query.templates.findFirst({
        where: eq(templates.id, templateId),
      });

      if (!existing) {
        throw new Error('Template not found');
      }

      // Hard delete templates (they can be recreated)
      await db.delete(templates).where(eq(templates.id, templateId));

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'delete',
        entityType: 'template',
        entityId: templateId,
        details: { oldValue: existing, reason, deletedBy: admin.id },
      });

      return { success: true };
    }),

  /**
   * List outfit presets with pagination and filters
   */
  listOutfitPresets: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        influencerId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit, offset, search, influencerId, userId, sortBy, sortOrder } = input;

      const conditions = [];

      if (influencerId) {
        conditions.push(eq(outfitPresets.influencerId, influencerId));
      }

      if (userId) {
        conditions.push(eq(outfitPresets.userId, userId));
      }

      if (search) {
        conditions.push(
          or(
            ilike(outfitPresets.name, `%${search}%`),
            ilike(outfitPresets.description ?? '', `%${search}%`)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(outfitPresets)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Outfit presets don't have relations defined, so we'll query directly
      // Use sql template for orderBy to avoid PGlite syntax issues
      const orderByColumn = sortBy === 'createdAt' ? outfitPresets.createdAt : outfitPresets.name;
      const orderBySql = sortOrder === 'desc'
        ? sql`${orderByColumn} DESC`
        : sql`${orderByColumn} ASC`;
      
      const presetList = await db
        .select()
        .from(outfitPresets)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(orderBySql);

      // Get user and influencer data separately if needed
      const presetWithUsers = await Promise.all(
        presetList.map(async (preset) => {
          const user = await db.query.users.findFirst({
            where: eq(users.id, preset.userId),
            columns: { id: true, email: true, name: true },
          });
          const influencer = await db.query.characters.findFirst({
            where: eq(characters.id, preset.influencerId),
            columns: { id: true, name: true, handle: true },
          });
          return {
            ...preset,
            user: user || null,
            influencer: influencer || null,
          };
        })
      );

      return {
        presets: presetWithUsers,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Delete outfit preset
   */
  deleteOutfitPreset: protectedProcedure
    .input(z.object({ presetId: z.string().uuid(), reason: z.string().min(1).max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { presetId, reason } = input;

      const existing = await db.query.outfitPresets.findFirst({
        where: eq(outfitPresets.id, presetId),
      });

      if (!existing) {
        throw new Error('Outfit preset not found');
      }

      await db.delete(outfitPresets).where(eq(outfitPresets.id, presetId));

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'delete',
        entityType: 'outfit_preset',
        entityId: presetId,
        details: { oldValue: existing, reason, deletedBy: admin.id },
      });

      return { success: true };
    }),

  /**
   * List prompt sets (profile picture sets) with pagination and filters
   */
  listPromptSets: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        isSystemSet: z.boolean().optional(),
        isPublic: z.boolean().optional(),
        userId: z.string().uuid().optional(),
        sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const {
        limit,
        offset,
        search,
        isSystemSet,
        isPublic,
        userId,
        sortBy,
        sortOrder,
      } = input;

      const conditions = [isNull(promptSets.deletedAt)];

      if (isSystemSet !== undefined) {
        conditions.push(eq(promptSets.isSystemSet, isSystemSet));
      }

      if (isPublic !== undefined) {
        conditions.push(eq(promptSets.isPublic, isPublic));
      }

      if (userId) {
        conditions.push(eq(promptSets.userId, userId));
      }

      if (search) {
        conditions.push(
          or(
            ilike(promptSets.name, `%${search}%`),
            ilike(promptSets.description ?? '', `%${search}%`)
          )!
        );
      }

      const whereClause = and(...conditions);

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(promptSets)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      const setList = await db.query.promptSets.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy:
          sortOrder === 'desc'
            ? [desc(promptSets[sortBy])]
            : [promptSets[sortBy]],
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return {
        sets: setList,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get prompt set by ID
   */
  getPromptSet: protectedProcedure
    .input(z.object({ setId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { setId } = input;

      const set = await db.query.promptSets.findFirst({
        where: and(eq(promptSets.id, setId), isNull(promptSets.deletedAt)),
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!set) {
        throw new Error('Prompt set not found');
      }

      return set;
    }),

  /**
   * Delete prompt set (soft delete)
   */
  deletePromptSet: protectedProcedure
    .input(z.object({ setId: z.string().uuid(), reason: z.string().min(1).max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { setId, reason } = input;

      const existing = await db.query.promptSets.findFirst({
        where: eq(promptSets.id, setId),
      });

      if (!existing) {
        throw new Error('Prompt set not found');
      }

      await db
        .update(promptSets)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(promptSets.id, setId));

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'delete',
        entityType: 'prompt_set',
        entityId: setId,
        details: { oldValue: existing, deletedAt: new Date(), reason, deletedBy: admin.id },
      });

      return { success: true };
    }),

  /**
   * Toggle prompt set public status
   */
  togglePromptSetPublic: protectedProcedure
    .input(z.object({ setId: z.string().uuid(), isPublic: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { setId, isPublic } = input;

      const existing = await db.query.promptSets.findFirst({
        where: eq(promptSets.id, setId),
      });

      if (!existing) {
        throw new Error('Prompt set not found');
      }

      await db
        .update(promptSets)
        .set({
          isPublic,
        })
        .where(eq(promptSets.id, setId));

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'prompt_set',
        entityId: setId,
        details: {
          oldValue: { isPublic: existing.isPublic },
          newValue: { isPublic },
          action: isPublic ? 'made_public' : 'made_private',
        },
      });

      return { success: true, isPublic };
    }),
});
