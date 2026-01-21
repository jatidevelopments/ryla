/**
 * Admin Jobs Router
 *
 * Provides generation job monitoring operations for admin panel.
 * Part of EP-055: Analytics & Monitoring
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import {
  generationJobs,
  users,
  characters,
  adminAuditLog,
} from '@ryla/data';
import { eq, and, or, ilike, desc, asc, sql } from 'drizzle-orm';

/**
 * Job list query schema
 */
const listJobsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  status: z
    .enum(['queued', 'processing', 'completed', 'failed', 'cancelled'])
    .optional(),
  type: z
    .enum([
      'base_image_generation',
      'character_sheet_generation',
      'image_generation',
      'character_generation',
      'image_upscale',
      'lora_training',
      'hd_generation',
      'caption_generation',
    ])
    .optional(),
  userId: z.string().uuid().optional(),
  characterId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'startedAt', 'completedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Get job detail schema
 */
const getJobSchema = z.object({
  jobId: z.string().uuid(),
});

/**
 * Retry job schema
 */
const retryJobSchema = z.object({
  jobId: z.string().uuid(),
});

/**
 * Cancel job schema
 */
const cancelJobSchema = z.object({
  jobId: z.string().uuid(),
  reason: z.string().min(1).max(500).optional(),
});

/**
 * Get job statistics schema
 */
const getJobStatsSchema = z.object({
  timeRange: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
});

export const jobsRouter = router({
  /**
   * List all generation jobs with pagination, search, and filters
   */
  list: protectedProcedure
    .input(listJobsSchema)
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

      // Build where conditions
      const conditions = [];

      // Status filter
      if (status) {
        conditions.push(eq(generationJobs.status, status));
      }

      // Type filter
      if (type) {
        conditions.push(eq(generationJobs.type, type));
      }

      // User filter
      if (userId) {
        conditions.push(eq(generationJobs.userId, userId));
      }

      // Character filter
      if (characterId) {
        conditions.push(eq(generationJobs.characterId, characterId));
      }

      // Search filter (external job ID, error message)
      if (search) {
        conditions.push(
          or(
            ilike(generationJobs.externalJobId ?? '', `%${search}%`),
            ilike(generationJobs.error ?? '', `%${search}%`)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(generationJobs)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get jobs with related data
      const jobList = await db.query.generationJobs.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy:
          sortOrder === 'desc'
            ? [desc(generationJobs[sortBy])]
            : [asc(generationJobs[sortBy])],
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

      // Format response
      const formattedJobs = jobList.map((job) => ({
        id: job.id,
        type: job.type,
        status: job.status,
        userId: job.userId,
        userEmail: job.user?.email || 'Unknown',
        userName: job.user?.name || 'Unknown',
        characterId: job.characterId,
        characterName: job.character?.name || null,
        characterHandle: job.character?.handle || null,
        imageCount: job.imageCount,
        completedCount: job.completedCount,
        creditsUsed: job.creditsUsed,
        error: job.error,
        retryCount: job.retryCount,
        externalJobId: job.externalJobId,
        externalProvider: job.externalProvider,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      }));

      return {
        jobs: formattedJobs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get job detail by ID
   */
  get: protectedProcedure
    .input(getJobSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { jobId } = input;

      const job = await db.query.generationJobs.findFirst({
        where: eq(generationJobs.id, jobId),
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

      if (!job) {
        throw new Error('Job not found');
      }

      return {
        id: job.id,
        type: job.type,
        status: job.status,
        userId: job.userId,
        userEmail: job.user?.email || 'Unknown',
        userName: job.user?.name || 'Unknown',
        characterId: job.characterId,
        characterName: job.character?.name || null,
        characterHandle: job.character?.handle || null,
        input: job.input,
        output: job.output,
        imageCount: job.imageCount,
        completedCount: job.completedCount,
        creditsUsed: job.creditsUsed,
        error: job.error,
        retryCount: job.retryCount,
        externalJobId: job.externalJobId,
        externalProvider: job.externalProvider,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      };
    }),

  /**
   * Get job statistics
   */
  getStats: protectedProcedure
    .input(getJobStatsSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { timeRange } = input;

      // Calculate time threshold
      const now = new Date();
      let threshold: Date;
      switch (timeRange) {
        case '1h':
          threshold = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Get counts by status
      const statusCounts = await db
        .select({
          status: generationJobs.status,
          count: sql<number>`count(*)`,
        })
        .from(generationJobs)
        .where(sql`${generationJobs.createdAt} >= ${threshold}`)
        .groupBy(generationJobs.status);

      // Get total jobs
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(generationJobs)
        .where(sql`${generationJobs.createdAt} >= ${threshold}`);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get failed jobs count
      const failedResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(generationJobs)
        .where(
          and(
            eq(generationJobs.status, 'failed'),
            sql`${generationJobs.createdAt} >= ${threshold}`
          )
        );
      const failed = Number(failedResult[0]?.count ?? 0);

      // Get active jobs (queued + processing)
      const activeResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(generationJobs)
        .where(
          and(
            sql`${generationJobs.status} IN ('queued', 'processing')`,
            sql`${generationJobs.createdAt} >= ${threshold}`
          )
        );
      const active = Number(activeResult[0]?.count ?? 0);

      // Get completed jobs
      const completedResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(generationJobs)
        .where(
          and(
            eq(generationJobs.status, 'completed'),
            sql`${generationJobs.createdAt} >= ${threshold}`
          )
        );
      const completed = Number(completedResult[0]?.count ?? 0);

      // Get total credits used
      const creditsResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${generationJobs.creditsUsed}), 0)`,
        })
        .from(generationJobs)
        .where(
          and(
            sql`${generationJobs.createdAt} >= ${threshold}`,
            sql`${generationJobs.creditsUsed} IS NOT NULL`
          )
        );
      const totalCreditsUsed = Number(creditsResult[0]?.total ?? 0);

      return {
        total,
        active,
        completed,
        failed,
        totalCreditsUsed,
        statusCounts: statusCounts.map((s) => ({
          status: s.status,
          count: Number(s.count),
        })),
      };
    }),

  /**
   * Retry a failed job
   */
  retry: protectedProcedure
    .input(retryJobSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { jobId } = input;

      // Check if job exists and is failed
      const job = await db.query.generationJobs.findFirst({
        where: eq(generationJobs.id, jobId),
      });

      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status !== 'failed') {
        throw new Error('Only failed jobs can be retried');
      }

      // Reset job to queued
      await db
        .update(generationJobs)
        .set({
          status: 'queued',
          error: null,
          retryCount: (job.retryCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(generationJobs.id, jobId));

      // Log audit
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'generation_job',
        entityId: jobId,
        details: {
          oldValue: { status: job.status },
          newValue: { status: 'queued', retryCount: (job.retryCount || 0) + 1 },
          action: 'retry',
        },
      });

      return { success: true };
    }),

  /**
   * Cancel a job
   */
  cancel: protectedProcedure
    .input(cancelJobSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { jobId, reason } = input;

      // Check if job exists and can be cancelled
      const job = await db.query.generationJobs.findFirst({
        where: eq(generationJobs.id, jobId),
      });

      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status === 'completed' || job.status === 'cancelled') {
        throw new Error('Job cannot be cancelled');
      }

      // Cancel job
      await db
        .update(generationJobs)
        .set({
          status: 'cancelled',
          error: reason || 'Cancelled by admin',
          updatedAt: new Date(),
        })
        .where(eq(generationJobs.id, jobId));

      // Log audit
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'generation_job',
        entityId: jobId,
        details: {
          oldValue: { status: job.status },
          newValue: { status: 'cancelled', reason },
          action: 'cancel',
        },
      });

      return { success: true };
    }),
});
