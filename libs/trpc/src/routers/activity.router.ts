/**
 * Activity Router
 *
 * Provides a unified activity feed by merging generation_jobs and credit_transactions.
 * This is a derived read model—no new activity_log table (Phase 2+).
 */

import { z } from 'zod';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';

import { generationJobs, creditTransactions } from '@ryla/data';

import { router, protectedProcedure } from '../trpc';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActivityType =
  | 'generation_completed'
  | 'generation_failed'
  | 'generation_started'
  | 'credits_added'
  | 'credits_spent'
  | 'credits_refunded';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  occurredAt: string; // ISO string
  sourceType: 'generation_job' | 'credit_transaction';
  sourceId: string;

  // Generation-specific
  characterId?: string | null;
  imageId?: string | null; // First image ID for direct navigation
  imageCount?: number | null;
  thumbnailUrl?: string | null;
  // qualityMode removed - see EP-045
  status?: string | null;

  // Credit-specific
  creditAmount?: number | null;
  balanceAfter?: number | null;
  description?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapJobToActivity(
  job: typeof generationJobs.$inferSelect,
  balanceAfter?: number | null
): ActivityItem {
  let type: ActivityType = 'generation_started';
  if (job.status === 'completed') type = 'generation_completed';
  else if (job.status === 'failed') type = 'generation_failed';

  const occurredAt =
    job.completedAt ?? job.startedAt ?? job.createdAt ?? new Date();

  // Extract thumbnail and imageId from output if available
  // Check multiple possible output structures
  let thumbnailUrl: string | null = null;
  let imageId: string | null = null;
  if (job.output && typeof job.output === 'object') {
    const out = job.output as Record<string, unknown>;

    // Try thumbnailUrls array first (most common)
    if (
      Array.isArray(out['thumbnailUrls']) &&
      out['thumbnailUrls'].length > 0
    ) {
      thumbnailUrl = out['thumbnailUrls'][0] as string;
    }
    // Try images array with thumbnailUrl property
    else if (Array.isArray(out['images']) && out['images'].length > 0) {
      const first = out['images'][0];
      if (typeof first === 'object' && first !== null) {
        const img = first as Record<string, unknown>;
        thumbnailUrl =
          (img['thumbnailUrl'] as string) ?? (img['url'] as string) ?? null;
      } else if (typeof first === 'string') {
        thumbnailUrl = first;
      }
    }
    // Try imageUrls array
    else if (Array.isArray(out['imageUrls']) && out['imageUrls'].length > 0) {
      thumbnailUrl = out['imageUrls'][0] as string;
    }

    // Extract first imageId for direct navigation
    if (Array.isArray(out['imageIds']) && out['imageIds'].length > 0) {
      imageId = out['imageIds'][0] as string;
    }
  }

  return {
    id: `gen_${job.id}`,
    type,
    occurredAt: occurredAt.toISOString(),
    sourceType: 'generation_job',
    sourceId: job.id,
    characterId: job.characterId,
    imageId,
    imageCount: job.imageCount,
    thumbnailUrl,
    // qualityMode removed - see EP-045
    status: job.status,
    balanceAfter: balanceAfter ?? null,
  };
}

function mapTxToActivity(
  tx: typeof creditTransactions.$inferSelect
): ActivityItem {
  let type: ActivityType = 'credits_spent';
  if (tx.type === 'refund') type = 'credits_refunded';
  else if (tx.amount > 0) type = 'credits_added';

  return {
    id: `tx_${tx.id}`,
    type,
    occurredAt: (tx.createdAt ?? new Date()).toISOString(),
    sourceType: 'credit_transaction',
    sourceId: tx.id,
    creditAmount: tx.amount,
    balanceAfter: tx.balanceAfter,
    description: tx.description,
    // qualityMode removed - see EP-045
  };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

// Shared schema for filtering
const activityFilterSchema = z.object({
  filter: z.enum(['all', 'generations', 'credits']).default('all'),
  timeRange: z.enum(['all', 'today', 'week', 'month', 'custom']).default('all'),
  startDate: z.string().datetime().nullish(),
  endDate: z.string().datetime().nullish(),
});

/**
 * Calculates time range boundaries based on input
 */
function getTimeBoundaries(
  timeRange: string,
  startDate?: string | null,
  endDate?: string | null
): { timeStart: Date | null; timeEnd: Date | null } {
  let timeStart: Date | null = null;
  let timeEnd: Date | null = null;
  const now = new Date();

  switch (timeRange) {
    case 'today':
      timeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      timeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case 'week': {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      timeStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + mondayOffset
      );
      timeEnd = new Date(timeStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    }
    case 'month':
      timeStart = new Date(now.getFullYear(), now.getMonth(), 1);
      timeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case 'custom':
      if (startDate) timeStart = new Date(startDate);
      if (endDate) timeEnd = new Date(endDate);
      break;
  }

  return { timeStart, timeEnd };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const activityRouter = router({
  /**
   * List unified activity feed (paginated via cursor or page)
   */
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().nullish(), // base64-encoded cursor (for backward compatibility)
          page: z.number().min(1).nullish(), // page number (1-indexed)
        })
        .merge(activityFilterSchema)
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        limit = 20,
        cursor,
        page,
        filter = 'all',
        timeRange = 'all',
        startDate,
        endDate,
      } = input ?? {};
      const userId = ctx.user.id;

      // Calculate time range boundaries
      const { timeStart, timeEnd } = getTimeBoundaries(
        timeRange,
        startDate,
        endDate
      );

      // Calculate offset if page is provided
      const offset = page ? (page - 1) * limit : undefined;

      // Decode cursor if present (for backward compatibility)
      let cursorData: {
        occurredAt: string;
        sourceType: string;
        sourceId: string;
      } | null = null;
      if (cursor && !page) {
        try {
          cursorData = JSON.parse(
            Buffer.from(cursor, 'base64').toString('utf-8')
          );
        } catch {
          // ignore invalid cursor
        }
      }

      const items: ActivityItem[] = [];

      // For page-based pagination, fetch a larger batch to account for merging
      // We fetch up to 500 items from each source, then merge and paginate
      // For cursor-based, use the existing limit logic
      const maxFetchLimit = page !== undefined ? 500 : limit + 1;

      // Fetch generation jobs if filter allows
      if (filter === 'all' || filter === 'generations') {
        const occurredAtExpr = sql<Date>`coalesce(${generationJobs.completedAt}, ${generationJobs.startedAt}, ${generationJobs.createdAt})`;

        const jobConditions: ReturnType<typeof eq>[] = [
          eq(generationJobs.userId, userId),
        ];

        // Apply time range filter
        if (timeStart) {
          jobConditions.push(gte(generationJobs.createdAt, timeStart));
        }
        if (timeEnd) {
          jobConditions.push(lte(generationJobs.createdAt, timeEnd));
        }

        if (cursorData) {
          const cursorDate = new Date(cursorData.occurredAt);
          if (cursorData.sourceType === 'generation_job') {
            jobConditions.push(
              sql`(${occurredAtExpr} < ${cursorDate} OR (${occurredAtExpr} = ${cursorDate} AND ${generationJobs.id} < ${cursorData.sourceId}))` as any
            );
          } else {
            jobConditions.push(sql`${occurredAtExpr} < ${cursorDate}` as any);
          }
        }

        const jobs = await ctx.db
          .select()
          .from(generationJobs)
          .where(and(...jobConditions))
          .orderBy(desc(occurredAtExpr), desc(generationJobs.id))
          .limit(maxFetchLimit);

        // For each job, find the associated credit transaction to get balance
        const jobsWithBalance = await Promise.all(
          jobs.map(async (job: (typeof jobs)[number]) => {
            // Find credit transaction for this generation
            // Credits are usually deducted when job is created/started, so look around that time
            const jobTime = job.createdAt ?? job.startedAt ?? new Date();
            const timeBefore = new Date(jobTime.getTime() - 60000); // 60 seconds before (credits deducted before generation)
            const timeAfter = new Date(jobTime.getTime() + 30000); // 30 seconds after

            // Try to find transaction by:
            // 1. characterId match (most reliable)
            // 2. Time proximity
            const conditions = [
              eq(creditTransactions.userId, userId),
              eq(creditTransactions.type, 'generation'),
              gte(creditTransactions.createdAt, timeBefore),
              lte(creditTransactions.createdAt, timeAfter),
            ];

            // Add characterId match if available
            if (job.characterId) {
              conditions.push(
                eq(creditTransactions.referenceId, job.characterId)
              );
            }

            const txRows = await ctx.db
              .select({ balanceAfter: creditTransactions.balanceAfter })
              .from(creditTransactions)
              .where(and(...conditions))
              .orderBy(desc(creditTransactions.createdAt))
              .limit(1);

            let tx = txRows[0] ?? null;

            // Fallback: if no transaction found by time, try to get the most recent one for this character
            if (!tx && job.characterId) {
              const fallbackRows = await ctx.db
                .select({ balanceAfter: creditTransactions.balanceAfter })
                .from(creditTransactions)
                .where(
                  and(
                    eq(creditTransactions.userId, userId),
                    eq(creditTransactions.type, 'generation'),
                    eq(creditTransactions.referenceId, job.characterId),
                    lte(creditTransactions.createdAt, jobTime)
                  )
                )
                .orderBy(desc(creditTransactions.createdAt))
                .limit(1);

              tx = fallbackRows[0] ?? null;
            }

            return { job, balance: tx?.balanceAfter ?? null };
          })
        );

        items.push(
          ...jobsWithBalance.map(
            ({
              job,
              balance,
            }: {
              job: (typeof jobs)[number];
              balance: number | null;
            }) => mapJobToActivity(job, balance)
          )
        );
      }

      // Fetch credit transactions if filter allows
      if (filter === 'all' || filter === 'credits') {
        const txConditions: ReturnType<typeof eq>[] = [
          eq(creditTransactions.userId, userId),
        ];

        // Apply time range filter
        if (timeStart) {
          txConditions.push(gte(creditTransactions.createdAt, timeStart));
        }
        if (timeEnd) {
          txConditions.push(lte(creditTransactions.createdAt, timeEnd));
        }

        if (cursorData) {
          const cursorDate = new Date(cursorData.occurredAt);
          if (cursorData.sourceType === 'credit_transaction') {
            txConditions.push(
              sql`(${creditTransactions.createdAt} < ${cursorDate} OR (${creditTransactions.createdAt} = ${cursorDate} AND ${creditTransactions.id} < ${cursorData.sourceId}))` as any
            );
          } else {
            txConditions.push(
              sql`${creditTransactions.createdAt} < ${cursorDate}` as any
            );
          }
        }

        const txs = await ctx.db
          .select()
          .from(creditTransactions)
          .where(and(...txConditions))
          .orderBy(
            desc(creditTransactions.createdAt),
            desc(creditTransactions.id)
          )
          .limit(maxFetchLimit);

        items.push(...txs.map(mapTxToActivity));
      }

      // Merge and sort by occurredAt desc
      items.sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      );

      // For page-based pagination, get total count and apply offset
      let totalCount: number | undefined = undefined;
      if (page !== undefined) {
        // Build conditions for count queries (include time range)
        const jobCountConditions = [eq(generationJobs.userId, userId)];
        const txCountConditions = [eq(creditTransactions.userId, userId)];

        if (timeStart) {
          jobCountConditions.push(gte(generationJobs.createdAt, timeStart));
          txCountConditions.push(gte(creditTransactions.createdAt, timeStart));
        }
        if (timeEnd) {
          jobCountConditions.push(lte(generationJobs.createdAt, timeEnd));
          txCountConditions.push(lte(creditTransactions.createdAt, timeEnd));
        }

        // Get total count for both sources with time range filter
        const [jobCount, txCount] = await Promise.all([
          filter === 'all' || filter === 'generations'
            ? ctx.db
                .select({ count: sql<number>`count(*)::int` })
                .from(generationJobs)
                .where(and(...jobCountConditions))
            : Promise.resolve([{ count: 0 }]),
          filter === 'all' || filter === 'credits'
            ? ctx.db
                .select({ count: sql<number>`count(*)::int` })
                .from(creditTransactions)
                .where(and(...txCountConditions))
            : Promise.resolve([{ count: 0 }]),
        ]);

        // For merged results, we approximate total as sum (may be slightly off due to merging)
        totalCount = (jobCount[0]?.count ?? 0) + (txCount[0]?.count ?? 0);
      }

      // Apply pagination
      let hasMore = false;
      let pageItems: ActivityItem[] = [];

      if (page !== undefined) {
        // For page-based, apply offset and take limit
        const startIndex = offset!;
        const endIndex = startIndex + limit;
        pageItems = items.slice(startIndex, endIndex);
        hasMore =
          items.length > endIndex ||
          (totalCount !== undefined && totalCount > endIndex);
      } else {
        // For cursor-based, take limit + 1 to check for next page
        hasMore = items.length > limit;
        pageItems = items.slice(0, limit);
      }

      // Build next cursor from last item (for backward compatibility)
      let nextCursor: string | null = null;
      if (hasMore && pageItems.length > 0 && !page) {
        const last = pageItems[pageItems.length - 1];
        nextCursor = Buffer.from(
          JSON.stringify({
            occurredAt: last.occurredAt,
            sourceType: last.sourceType,
            sourceId: last.sourceId,
          })
        ).toString('base64');
      }

      return {
        items: pageItems,
        nextCursor,
        totalCount,
        hasNextPage: hasMore,
        hasPreviousPage: !!page && page > 1,
      };
    }),

  /**
   * Get activity summary (counts) for the current user
   */
  summary: protectedProcedure
    .input(activityFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const {
        filter = 'all',
        timeRange = 'all',
        startDate,
        endDate,
      } = input ?? {};
      const userId = ctx.user.id;

      const { timeStart, timeEnd } = getTimeBoundaries(
        timeRange,
        startDate,
        endDate
      );

      // Build conditions for count/sum queries
      const jobConditions = [eq(generationJobs.userId, userId)];
      const txConditions = [eq(creditTransactions.userId, userId)];

      if (timeStart) {
        jobConditions.push(gte(generationJobs.createdAt, timeStart));
        txConditions.push(gte(creditTransactions.createdAt, timeStart));
      }
      if (timeEnd) {
        jobConditions.push(lte(generationJobs.createdAt, timeEnd));
        txConditions.push(lte(creditTransactions.createdAt, timeEnd));
      }

      // Count generation jobs by status
      const jobCounts =
        filter === 'all' || filter === 'generations'
          ? await ctx.db
              .select({
                status: generationJobs.status,
                count: sql<number>`count(*)::int`,
              })
              .from(generationJobs)
              .where(and(...jobConditions))
              .groupBy(generationJobs.status)
          : [];

      // Sum credit amounts by type
      const txSums =
        filter === 'all' || filter === 'credits'
          ? await ctx.db
              .select({
                type: creditTransactions.type,
                total: sql<number>`COALESCE(SUM(${creditTransactions.amount}), 0)::int`,
              })
              .from(creditTransactions)
              .where(and(...txConditions))
              .groupBy(creditTransactions.type)
          : [];

      const generations = {
        completed:
          jobCounts.find(
            (j: (typeof jobCounts)[number]) => j.status === 'completed'
          )?.count ?? 0,
        failed:
          jobCounts.find(
            (j: (typeof jobCounts)[number]) => j.status === 'failed'
          )?.count ?? 0,
        processing:
          jobCounts.find(
            (j: (typeof jobCounts)[number]) => j.status === 'processing'
          )?.count ?? 0,
        queued:
          jobCounts.find(
            (j: (typeof jobCounts)[number]) => j.status === 'queued'
          )?.count ?? 0,
      };

      const credits = {
        added:
          (txSums.find(
            (t: (typeof txSums)[number]) =>
              (t.type as string) === 'subscription_grant'
          )?.total ?? 0) +
          (txSums.find(
            (t: (typeof txSums)[number]) => (t.type as string) === 'purchase'
          )?.total ?? 0) +
          (txSums.find(
            (t: (typeof txSums)[number]) =>
              (t.type as string) === 'admin_adjustment'
          )?.total ?? 0) +
          (txSums.find(
            (t: (typeof txSums)[number]) => (t.type as string) === 'bonus'
          )?.total ?? 0),
        spent: Math.abs(
          txSums.find((t: (typeof txSums)[number]) => t.type === 'generation')
            ?.total ?? 0
        ),
        refunded:
          txSums.find((t: (typeof txSums)[number]) => t.type === 'refund')
            ?.total ?? 0,
      };

      return {
        generations,
        credits,
        totalEvents:
          Object.values(generations).reduce((a, b) => a + b, 0) +
          Object.values(credits).reduce((a, b) => a + b, 0),
      };
    }),
});
