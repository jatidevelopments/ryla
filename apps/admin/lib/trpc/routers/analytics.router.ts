/**
 * Admin Analytics Router
 *
 * Provides user analytics and platform metrics for the admin panel.
 * Part of EP-055: Analytics & Monitoring
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import {
  users,
  images,
  creditTransactions,
  subscriptions,
} from '@ryla/data';
import { eq, and, gte, sql, count } from 'drizzle-orm';

/**
 * Get analytics metrics schema
 */
const getAnalyticsSchema = z.object({
  timeRange: z.enum(['1d', '7d', '30d', '90d']).default('7d'),
});

export const analyticsRouter = router({
  /**
   * Get analytics metrics
   */
  getMetrics: protectedProcedure
    .input(getAnalyticsSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { timeRange } = input;

      // Calculate time threshold
      const now = new Date();
      let threshold: Date;
      switch (timeRange) {
        case '1d':
          threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          threshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      // Daily Active Users (users who created images in last 24h)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const dauResult = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${images.userId})` })
        .from(images)
        .where(gte(images.createdAt, oneDayAgo));
      const dau = Number(dauResult[0]?.count ?? 0);

      // Total users
      const totalUsersResult = await db
        .select({ count: count() })
        .from(users);
      const totalUsers = totalUsersResult[0]?.count ?? 0;

      // New users in time range
      const newUsersResult = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, threshold));
      const newUsers = newUsersResult[0]?.count ?? 0;

      // Images generated in time range
      const imagesResult = await db
        .select({ count: count() })
        .from(images)
        .where(
          and(gte(images.createdAt, threshold), sql`${images.deletedAt} IS NULL`)
        );
      const imagesGenerated = imagesResult[0]?.count ?? 0;

      // Total images (all time)
      const totalImagesResult = await db
        .select({ count: count() })
        .from(images)
        .where(sql`${images.deletedAt} IS NULL`);
      const totalImages = totalImagesResult[0]?.count ?? 0;

      // Revenue from subscriptions (active subscriptions * monthly price)
      // Note: This is a simplified calculation. Real revenue would come from payment transactions
      const revenueResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(
            CASE 
              WHEN ${subscriptions.tier} = 'starter' THEN 29
              WHEN ${subscriptions.tier} = 'pro' THEN 79
              WHEN ${subscriptions.tier} = 'unlimited' THEN 199
              ELSE 0
            END
          ), 0)`,
        })
        .from(subscriptions)
        .where(eq(subscriptions.status, 'active'));
      const monthlyRevenue = Number(revenueResult[0]?.total ?? 0);

      // Credits spent in time range
      const creditsSpentResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(ABS(${creditTransactions.amount})), 0)`,
        })
        .from(creditTransactions)
        .where(
          and(
            gte(creditTransactions.createdAt, threshold),
            sql`${creditTransactions.amount} < 0`
          )
        );
      const creditsSpent = Number(creditsSpentResult[0]?.total ?? 0);

      // Calculate changes (compare with previous period)
      const previousThreshold = new Date(
        threshold.getTime() - (now.getTime() - threshold.getTime())
      );

      // Previous period new users
      const prevNewUsersResult = await db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            gte(users.createdAt, previousThreshold),
            sql`${users.createdAt} < ${threshold}`
          )
        );
      const prevNewUsers = prevNewUsersResult[0]?.count ?? 0;
      const usersChange =
        prevNewUsers > 0
          ? ((newUsers - prevNewUsers) / prevNewUsers) * 100
          : newUsers > 0
            ? 100
            : 0;

      // Previous period images
      const prevImagesResult = await db
        .select({ count: count() })
        .from(images)
        .where(
          and(
            gte(images.createdAt, previousThreshold),
            sql`${images.createdAt} < ${threshold}`,
            sql`${images.deletedAt} IS NULL`
          )
        );
      const prevImages = prevImagesResult[0]?.count ?? 0;
      const imagesChange =
        prevImages > 0
          ? ((imagesGenerated - prevImages) / prevImages) * 100
          : imagesGenerated > 0
            ? 100
            : 0;

      return {
        dau,
        totalUsers,
        newUsers,
        usersChange,
        imagesGenerated,
        totalImages,
        imagesChange,
        monthlyRevenue,
        creditsSpent,
      };
    }),

  /**
   * Get time-series data for charts
   */
  getTimeSeries: protectedProcedure
    .input(getAnalyticsSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { timeRange } = input;

      // Calculate time threshold and interval
      const now = new Date();
      let threshold: Date;
      let interval: string;
      let dateFormat: string;

      switch (timeRange) {
        case '1d':
          threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          interval = '1 hour';
          dateFormat = 'HH24:00';
          break;
        case '7d':
          threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          interval = '1 day';
          dateFormat = 'Mon DD';
          break;
        case '30d':
          threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          interval = '1 day';
          dateFormat = 'Mon DD';
          break;
        case '90d':
          threshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          // interval = '1 week'; // Reserved for future use
          dateFormat = 'Mon DD';
          break;
      }

      // Get images generated by time period
      const imagesData = await db.execute(sql`
        SELECT 
          TO_CHAR(${images.createdAt}, ${dateFormat}) as period,
          COUNT(*)::int as count
        FROM ${images}
        WHERE ${images.createdAt} >= ${threshold}
          AND ${images.deletedAt} IS NULL
        GROUP BY period
        ORDER BY period ASC
      `);

      // Get users created by time period
      const usersData = await db.execute(sql`
        SELECT 
          TO_CHAR(${users.createdAt}, ${dateFormat}) as period,
          COUNT(*)::int as count
        FROM ${users}
        WHERE ${users.createdAt} >= ${threshold}
        GROUP BY period
        ORDER BY period ASC
      `);

      // Get revenue by time period (from subscriptions created)
      const revenueData = await db.execute(sql`
        SELECT 
          TO_CHAR(${subscriptions.createdAt}, ${dateFormat}) as period,
          SUM(
            CASE 
              WHEN ${subscriptions.tier} = 'starter' THEN 29
              WHEN ${subscriptions.tier} = 'pro' THEN 79
              WHEN ${subscriptions.tier} = 'unlimited' THEN 199
              ELSE 0
            END
          )::int as revenue
        FROM ${subscriptions}
        WHERE ${subscriptions.createdAt} >= ${threshold}
          AND ${subscriptions.status} = 'active'
        GROUP BY period
        ORDER BY period ASC
      `);

      return {
        images: (imagesData.rows as Array<{ period: string; count: number }>).map(
          (r) => ({
            period: r.period,
            count: Number(r.count),
          })
        ),
        users: (usersData.rows as Array<{ period: string; count: number }>).map(
          (r) => ({
            period: r.period,
            count: Number(r.count),
          })
        ),
        revenue: (revenueData.rows as Array<{ period: string; revenue: number }>).map(
          (r) => ({
            period: r.period,
            revenue: Number(r.revenue) || 0,
          })
        ),
      };
    }),

  /**
   * Get top users by activity
   */
  getTopUsers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        timeRange: z.enum(['1d', '7d', '30d', 'all']).default('7d'),
        metric: z.enum(['images', 'credits', 'revenue']).default('images'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit, timeRange, metric } = input;

      // Calculate time threshold
      const now = new Date();
      let threshold: Date | null = null;
      if (timeRange !== 'all') {
        switch (timeRange) {
          case '1d':
            threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }
      }

      if (metric === 'images') {
        // Top users by images generated
        const topUsersResult = await db.execute(
          threshold
            ? sql`
              SELECT 
                ${users.id},
                ${users.email},
                ${users.name},
                COUNT(${images.id})::int as count
              FROM ${users}
              LEFT JOIN ${images} ON ${images.userId} = ${users.id}
                AND ${images.createdAt} >= ${threshold}
                AND ${images.deletedAt} IS NULL
              GROUP BY ${users.id}, ${users.email}, ${users.name}
              ORDER BY count DESC
              LIMIT ${limit}
            `
            : sql`
              SELECT 
                ${users.id},
                ${users.email},
                ${users.name},
                COUNT(${images.id})::int as count
              FROM ${users}
              LEFT JOIN ${images} ON ${images.userId} = ${users.id}
                AND ${images.deletedAt} IS NULL
              GROUP BY ${users.id}, ${users.email}, ${users.name}
              ORDER BY count DESC
              LIMIT ${limit}
            `
        );

        return (topUsersResult.rows as Array<{
          id: string;
          email: string;
          name: string | null;
          count: number;
        }>).map((r) => ({
          userId: r.id,
          email: r.email,
          name: r.name || 'Unknown',
          images: Number(r.count) || 0,
          credits: 0,
          revenue: 0,
        }));
      } else if (metric === 'credits') {
        // Top users by credits spent
        const topUsersResult = await db.execute(
          threshold
            ? sql`
              SELECT 
                ${users.id},
                ${users.email},
                ${users.name},
                COALESCE(SUM(ABS(${creditTransactions.amount})), 0)::int as total
              FROM ${users}
              LEFT JOIN ${creditTransactions} ON ${creditTransactions.userId} = ${users.id}
                AND ${creditTransactions.createdAt} >= ${threshold}
                AND ${creditTransactions.amount} < 0
              GROUP BY ${users.id}, ${users.email}, ${users.name}
              ORDER BY total DESC
              LIMIT ${limit}
            `
            : sql`
              SELECT 
                ${users.id},
                ${users.email},
                ${users.name},
                COALESCE(SUM(ABS(${creditTransactions.amount})), 0)::int as total
              FROM ${users}
              LEFT JOIN ${creditTransactions} ON ${creditTransactions.userId} = ${users.id}
                AND ${creditTransactions.amount} < 0
              GROUP BY ${users.id}, ${users.email}, ${users.name}
              ORDER BY total DESC
              LIMIT ${limit}
            `
        );

        return (topUsersResult.rows as Array<{
          id: string;
          email: string;
          name: string | null;
          total: number;
        }>).map((r) => ({
          userId: r.id,
          email: r.email,
          name: r.name || 'Unknown',
          images: 0,
          credits: Number(r.total) || 0,
          revenue: 0,
        }));
      } else {
        // Top users by revenue (subscriptions)
        const topUsersResult = await db.execute(
          threshold
            ? sql`
              SELECT 
                ${users.id},
                ${users.email},
                ${users.name},
                SUM(
                  CASE 
                    WHEN ${subscriptions.tier} = 'starter' THEN 29
                    WHEN ${subscriptions.tier} = 'pro' THEN 79
                    WHEN ${subscriptions.tier} = 'unlimited' THEN 199
                    ELSE 0
                  END
                )::int as revenue
              FROM ${users}
              LEFT JOIN ${subscriptions} ON ${subscriptions.userId} = ${users.id}
                AND ${subscriptions.createdAt} >= ${threshold}
                AND ${subscriptions.status} = 'active'
              GROUP BY ${users.id}, ${users.email}, ${users.name}
              ORDER BY revenue DESC
              LIMIT ${limit}
            `
            : sql`
              SELECT 
                ${users.id},
                ${users.email},
                ${users.name},
                SUM(
                  CASE 
                    WHEN ${subscriptions.tier} = 'starter' THEN 29
                    WHEN ${subscriptions.tier} = 'pro' THEN 79
                    WHEN ${subscriptions.tier} = 'unlimited' THEN 199
                    ELSE 0
                  END
                )::int as revenue
              FROM ${users}
              LEFT JOIN ${subscriptions} ON ${subscriptions.userId} = ${users.id}
                AND ${subscriptions.status} = 'active'
              GROUP BY ${users.id}, ${users.email}, ${users.name}
              ORDER BY revenue DESC
              LIMIT ${limit}
            `
        );

        return (topUsersResult.rows as Array<{
          id: string;
          email: string;
          name: string | null;
          revenue: number;
        }>).map((r) => ({
          userId: r.id,
          email: r.email,
          name: r.name || 'Unknown',
          images: 0,
          credits: 0,
          revenue: Number(r.revenue) || 0,
        }));
      }
    }),
});
