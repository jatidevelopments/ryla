/**
 * Admin Stats Router
 *
 * Provides statistics and metrics for the admin dashboard.
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import { users, images, bugReports, subscriptions } from '@ryla/data';
import { count, eq, and, gte, sql } from 'drizzle-orm';

export const statsRouter = router({
  /**
   * Get dashboard statistics
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    // Get total users count
    const totalUsersResult = await db
      .select({ count: count() })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count ?? 0;

    // Get total images count
    const totalImagesResult = await db
      .select({ count: count() })
      .from(images);
    const totalImages = totalImagesResult[0]?.count ?? 0;

    // Get open bugs count
    const openBugsResult = await db
      .select({ count: count() })
      .from(bugReports)
      .where(eq(bugReports.status, 'open'));
    const openBugs = openBugsResult[0]?.count ?? 0;

    // Get active subscriptions count
    const activeSubscriptionsResult = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));
    const activeSubscriptions = activeSubscriptionsResult[0]?.count ?? 0;

    // Get users created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));
    const recentUsers = recentUsersResult[0]?.count ?? 0;

    // Calculate changes (mock for now - can be improved with historical data)
    const usersChange = totalUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(1) : '0';
    const bugsChange = '-15'; // Mock - would need historical data
    const imagesChange = '25.3'; // Mock - would need historical data

    return {
      totalUsers,
      usersChange: parseFloat(usersChange),
      totalRevenue: '$0', // TODO: Calculate from subscriptions
      revenueChange: 0, // TODO: Calculate from historical data
      openBugs,
      bugsChange: parseFloat(bugsChange),
      imagesGenerated: totalImages,
      imagesChange: parseFloat(imagesChange),
    };
  }),
});
