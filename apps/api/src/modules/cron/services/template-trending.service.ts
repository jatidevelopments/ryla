/**
 * Template Trending Service
 *
 * Refreshes the template_trending materialized view.
 * Epic: EP-049 (Likes & Popularity System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { RedisService } from '../../redis/services/redis.service';

export interface TrendingRefreshResult {
  success: boolean;
  durationMs: number;
  rowsUpdated?: number;
  error?: string;
}

@Injectable()
export class TemplateTrendingService {
  private readonly logger = new Logger(TemplateTrendingService.name);
  private readonly LOCK_KEY = 'cron:refreshTemplateTrending:lock';
  private readonly LOCK_TTL_SECONDS = 600; // 10 minutes

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<any>,
    private readonly redisService: RedisService
  ) {}

  /**
   * Refresh the template_trending materialized view.
   *
   * This should be called daily by a cron job (recommended: 2 AM low traffic).
   * Uses Redis lock to prevent duplicate runs.
   */
  async refreshTrendingView(): Promise<TrendingRefreshResult> {
    const startTime = Date.now();

    // Check if Redis is available for locking
    if (!this.redisService.isReady()) {
      this.logger.warn('Redis not available, proceeding without lock');
    } else {
      // Try to acquire lock
      const lockAcquired = await this.tryAcquireLock();
      if (!lockAcquired) {
        this.logger.warn('Trending refresh skipped - lock already active');
        return {
          success: false,
          durationMs: Date.now() - startTime,
          error: 'Lock already active - another refresh may be in progress',
        };
      }
    }

    try {
      this.logger.log('Starting template trending view refresh...');

      // Check if materialized view exists
      const viewExists = await this.checkViewExists();
      if (!viewExists) {
        this.logger.warn('template_trending materialized view does not exist');
        return {
          success: false,
          durationMs: Date.now() - startTime,
          error: 'Materialized view does not exist',
        };
      }

      // Refresh the materialized view concurrently (non-blocking)
      await this.db.execute(
        sql`REFRESH MATERIALIZED VIEW CONCURRENTLY template_trending`
      );

      // Get row count for logging
      const countResult = await this.db.execute(
        sql`SELECT COUNT(*) as count FROM template_trending`
      );
      const rowCount = Number((countResult.rows[0] as any)?.count ?? 0);

      const durationMs = Date.now() - startTime;

      this.logger.log(
        `Template trending view refreshed successfully in ${durationMs}ms (${rowCount} templates)`
      );

      return {
        success: true,
        durationMs,
        rowsUpdated: rowCount,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Failed to refresh trending view: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      );

      return {
        success: false,
        durationMs,
        error: errorMessage,
      };
    } finally {
      // Release lock
      if (this.redisService.isReady()) {
        await this.releaseLock();
      }
    }
  }

  /**
   * Check if the materialized view exists
   */
  private async checkViewExists(): Promise<boolean> {
    try {
      const result = await this.db.execute(
        sql`SELECT COUNT(*) as count FROM pg_matviews WHERE matviewname = 'template_trending'`
      );
      return Number((result.rows[0] as any)?.count ?? 0) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Try to acquire a Redis lock using SET NX EX pattern
   * Using the existing RedisService methods
   */
  private async tryAcquireLock(): Promise<boolean> {
    try {
      // Check if lock already exists
      const exists = await this.redisService.exists(this.LOCK_KEY);
      if (exists) {
        return false; // Lock already held
      }

      // Set lock with TTL
      await this.redisService.setString(this.LOCK_KEY, '1', {
        ttl: this.LOCK_TTL_SECONDS,
      });

      return true;
    } catch (error) {
      this.logger.warn(`Failed to acquire Redis lock: ${error}`);
      return true; // On error, proceed without lock
    }
  }

  /**
   * Release the Redis lock
   */
  private async releaseLock(): Promise<void> {
    try {
      await this.redisService.deleteByKey(this.LOCK_KEY);
    } catch (error) {
      this.logger.warn(`Failed to release Redis lock: ${error}`);
    }
  }

  /**
   * Get current trending scores (for debugging/admin)
   */
  async getTrendingStats(): Promise<{
    totalTemplates: number;
    topTemplates: Array<{
      id: string;
      trendingScore: number;
      usageRate: number;
    }>;
  }> {
    try {
      const result = await this.db.execute(
        sql`SELECT id, trending_score, usage_rate 
            FROM template_trending 
            ORDER BY trending_score DESC 
            LIMIT 10`
      );

      const countResult = await this.db.execute(
        sql`SELECT COUNT(*) as count FROM template_trending`
      );

      return {
        totalTemplates: Number((countResult.rows[0] as any)?.count ?? 0),
        topTemplates: (result.rows as any[]).map((row) => ({
          id: row.id,
          trendingScore: Number(row.trending_score ?? 0),
          usageRate: Number(row.usage_rate ?? 0),
        })),
      };
    } catch {
      return { totalTemplates: 0, topTemplates: [] };
    }
  }
}
