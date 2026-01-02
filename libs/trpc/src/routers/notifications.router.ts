/**
 * Notifications Router
 *
 * Provides in-app notification inbox operations using Drizzle ORM.
 * NO SUPABASE - direct Postgres access.
 */

import { z } from 'zod';
import { and, desc, eq, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

import { notifications } from '@ryla/data';

import { router, protectedProcedure } from '../trpc';

export const notificationsRouter = router({
  /**
   * List notifications for the current user (paginated)
   */
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 20, offset = 0 } = input ?? {};

      const items = await ctx.db.query.notifications.findMany({
        where: eq(notifications.userId, ctx.user.id),
        orderBy: desc(notifications.createdAt),
        limit,
        offset,
      });

      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(eq(notifications.userId, ctx.user.id));

      const [unreadResult] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, ctx.user.id),
            eq(notifications.isRead, false)
          )
        );

      return {
        items,
        total: Number(countResult?.count ?? 0),
        unreadCount: Number(unreadResult?.count ?? 0),
        limit,
        offset,
      };
    }),

  /**
   * Mark a single notification as read
   */
  markRead: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, ctx.user.id)
          )
        );

      if ((result.rowCount ?? 0) === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification not found',
        });
      }

      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, false))
      );

    return { success: true, updated: result.rowCount ?? 0 };
  }),
});


