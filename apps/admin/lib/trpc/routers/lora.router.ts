/**
 * Admin LoRA Router
 *
 * Provides LoRA model management operations for the admin panel.
 * Part of EP-057: Advanced Admin Operations
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import { loraModels, adminAuditLog } from '@ryla/data';
import { eq, and, or, ilike, desc, sql, count } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * List LoRA models schema
 */
const listLoraModelsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  status: z.enum(['pending', 'training', 'ready', 'failed', 'expired']).optional(),
  type: z.enum(['face', 'style', 'pose']).optional(),
  userId: z.string().uuid().optional(),
  characterId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'trainingCompletedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const loraRouter = router({
  /**
   * List LoRA models with pagination, search, and filters
   */
  list: protectedProcedure
    .input(listLoraModelsSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const {
        limit,
        offset,
        search,
        status,
        type,
        userId,
        characterId,
        sortBy,
        sortOrder,
      } = input;

      const conditions = [];

      if (status) {
        conditions.push(eq(loraModels.status, status));
      }

      if (type) {
        conditions.push(eq(loraModels.type, type));
      }

      if (userId) {
        conditions.push(eq(loraModels.userId, userId));
      }

      if (characterId) {
        conditions.push(eq(loraModels.characterId, characterId));
      }

      if (search) {
        conditions.push(
          or(
            ilike(loraModels.triggerWord ?? '', `%${search}%`),
            ilike(loraModels.baseModel ?? '', `%${search}%`),
            ilike(loraModels.externalJobId ?? '', `%${search}%`),
            ilike(loraModels.errorMessage ?? '', `%${search}%`)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(loraModels)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get LoRA models with related data
      const models = await db.query.loraModels.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy:
          sortBy === 'createdAt'
            ? sortOrder === 'desc'
              ? [desc(loraModels.createdAt)]
              : [loraModels.createdAt]
            : sortBy === 'trainingCompletedAt'
              ? sortOrder === 'desc'
                ? [desc(loraModels.trainingCompletedAt)]
                : [loraModels.trainingCompletedAt]
              : sortOrder === 'desc'
                ? [desc(loraModels.status)]
                : [loraModels.status],
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
          character: {
            columns: {
              id: true,
              name: true,
              handle: true,
            },
          },
        },
      });

      return {
        models,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get LoRA model by ID
   */
  get: protectedProcedure
    .input(z.object({ modelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { modelId } = input;

      const model = await db.query.loraModels.findFirst({
        where: eq(loraModels.id, modelId),
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
            },
          },
          character: {
            columns: {
              id: true,
              name: true,
              handle: true,
            },
          },
        },
      });

      if (!model) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'LoRA model not found' });
      }

      return model;
    }),

  /**
   * Get LoRA model statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    // Use conditional aggregation with SQL for status counts
    const stats = await db
      .select({
        total: count(loraModels.id),
        pending: sql<number>`COUNT(CASE WHEN ${loraModels.status} = 'pending' THEN 1 END)`.mapWith(Number).as('pending'),
        training: sql<number>`COUNT(CASE WHEN ${loraModels.status} = 'training' THEN 1 END)`.mapWith(Number).as('training'),
        ready: sql<number>`COUNT(CASE WHEN ${loraModels.status} = 'ready' THEN 1 END)`.mapWith(Number).as('ready'),
        failed: sql<number>`COUNT(CASE WHEN ${loraModels.status} = 'failed' THEN 1 END)`.mapWith(Number).as('failed'),
        expired: sql<number>`COUNT(CASE WHEN ${loraModels.status} = 'expired' THEN 1 END)`.mapWith(Number).as('expired'),
        totalCost: sql<number>`COALESCE(SUM(${loraModels.trainingCost}), 0)`.mapWith(Number).as('totalCost'),
      })
      .from(loraModels);

    const result = stats[0];

    return {
      total: result.total || 0,
      pending: result.pending || 0,
      training: result.training || 0,
      ready: result.ready || 0,
      failed: result.failed || 0,
      expired: result.expired || 0,
      totalCost: result.totalCost || 0,
    };
  }),

  /**
   * Retry a failed LoRA training
   */
  retry: protectedProcedure
    .input(z.object({ modelId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { modelId } = input;

      const model = await db.query.loraModels.findFirst({
        where: eq(loraModels.id, modelId),
      });

      if (!model) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'LoRA model not found' });
      }

      if (model.status !== 'failed') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only failed models can be retried',
        });
      }

      const updated = await db
        .update(loraModels)
        .set({
          status: 'pending',
          errorMessage: null,
          retryCount: (model.retryCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(loraModels.id, modelId))
        .returning();

      if (!updated[0]) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retry LoRA training',
        });
      }

      // Audit log
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'lora_model',
        entityId: modelId,
        details: {
          action: 'retry',
          oldStatus: model.status,
          newStatus: 'pending',
          retryCount: updated[0].retryCount,
        },
      });

      return { success: true, model: updated[0] };
    }),

  /**
   * Delete a LoRA model
   */
  delete: protectedProcedure
    .input(
      z.object({
        modelId: z.string().uuid(),
        reason: z.string().min(1).max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { modelId, reason } = input;

      const model = await db.query.loraModels.findFirst({
        where: eq(loraModels.id, modelId),
      });

      if (!model) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'LoRA model not found' });
      }

      // Mark as expired instead of hard delete
      await db
        .update(loraModels)
        .set({
          status: 'expired',
          updatedAt: new Date(),
        })
        .where(eq(loraModels.id, modelId));

      // Audit log
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'delete',
        entityType: 'lora_model',
        entityId: modelId,
        details: {
          reason,
          oldStatus: model.status,
          newStatus: 'expired',
        },
      });

      return { success: true };
    }),
});
