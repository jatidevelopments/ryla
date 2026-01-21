/**
 * Admin System Router
 *
 * Provides system health monitoring for the admin panel.
 * Part of EP-055: Analytics & Monitoring
 */

import { router, protectedProcedure } from '../base';
import { generationJobs, images } from '@ryla/data';
import { eq, and, sql, count, gte } from 'drizzle-orm';

export const systemRouter = router({
  /**
   * Get system health status
   */
  getHealth: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    // Check database connection
    const dbStartTime = Date.now();
    let dbHealthy = false;
    let dbResponseTime = 0;
    let dbMessage = '';

    try {
      await db.execute(sql`SELECT 1`);
      dbResponseTime = Date.now() - dbStartTime;
      dbHealthy = true;
      dbMessage = 'Database connection is healthy';
    } catch (error: any) {
      dbResponseTime = Date.now() - dbStartTime;
      dbHealthy = false;
      dbMessage = `Database check failed: ${error.message}`;
    }

    // Get generation queue stats
    const queueStats = await db
      .select({
        status: generationJobs.status,
        count: sql<number>`count(*)`,
      })
      .from(generationJobs)
      .groupBy(generationJobs.status);

    const queued = queueStats.find((s) => s.status === 'queued')?.count ?? 0;
    const processing = queueStats.find((s) => s.status === 'processing')?.count ?? 0;
    const failed = queueStats.find((s) => s.status === 'failed')?.count ?? 0;
    const totalActive = Number(queued) + Number(processing);

    // Get recent failed jobs (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentFailedResult = await db
      .select({ count: count() })
      .from(generationJobs)
      .where(
        and(
          eq(generationJobs.status, 'failed'),
          gte(generationJobs.updatedAt, oneHourAgo)
        )
      );
    const recentFailed = recentFailedResult[0]?.count ?? 0;

    // Get database size (approximate)
    let dbSize = 'Unknown';
    try {
      const sizeResult = await db.execute(sql`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      dbSize = (sizeResult.rows[0] as any)?.size || 'Unknown';
    } catch {
      // Ignore if query fails
    }

    // Get total images count (for storage estimation)
    const imagesResult = await db
      .select({ count: count() })
      .from(images)
      .where(sql`${images.deletedAt} IS NULL`);
    const totalImages = imagesResult[0]?.count ?? 0;

    // Calculate storage percentage (rough estimate: ~500KB per image)
    // This is a simplified calculation
    const estimatedStorageMB = (totalImages * 0.5) / 1024; // Convert to GB
    const storagePercentage = estimatedStorageMB > 100 ? 85 : Math.min(estimatedStorageMB / 100 * 100, 100);

    // Determine overall health status
    const generationHealthy = recentFailed < 10; // Less than 10 failures in last hour
    const overallHealthy = dbHealthy && generationHealthy;

    return {
      overall: {
        healthy: overallHealthy,
        status: overallHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
      },
      database: {
        healthy: dbHealthy,
        responseTime: dbResponseTime,
        message: dbMessage,
        size: dbSize,
      },
      generation: {
        healthy: generationHealthy,
        queued: Number(queued),
        processing: Number(processing),
        failed: Number(failed),
        totalActive: Number(totalActive),
        recentFailed: Number(recentFailed),
      },
      storage: {
        totalImages,
        estimatedStorageGB: estimatedStorageMB.toFixed(2),
        usagePercentage: Math.round(storagePercentage),
        status: storagePercentage > 90 ? 'warning' : storagePercentage > 75 ? 'caution' : 'healthy',
      },
    };
  }),
});
