/**
 * Broadcast Notifications Router
 *
 * Manages admin-created broadcast notifications sent to multiple users.
 * Part of EP-057: Advanced Admin Operations
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import {
  broadcastNotifications,
  notifications,
  users,
  subscriptions,
  userCredits,
  adminAuditLog,
} from '@ryla/data';
import { eq, and, or, inArray, gte, lte, sql, desc, count } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * List broadcast notifications schema
 */
const listNotificationsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'cancelled']).optional(),
});

/**
 * Create broadcast notification schema
 */
const createNotificationSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  href: z.string().optional(),
  targeting: z.object({
    allUsers: z.boolean().optional(),
    userIds: z.array(z.string().uuid()).optional(),
    tiers: z.array(z.string()).optional(),
    hasActiveSubscription: z.boolean().optional(),
    minCredits: z.number().optional(),
    maxCredits: z.number().optional(),
    createdAfter: z.string().optional(),
    createdBefore: z.string().optional(),
  }),
  scheduledFor: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Preview targeting schema
 */
const previewTargetingSchema = z.object({
  targeting: z.object({
    allUsers: z.boolean().optional(),
    userIds: z.array(z.string().uuid()).optional(),
    tiers: z.array(z.string()).optional(),
    hasActiveSubscription: z.boolean().optional(),
    minCredits: z.number().optional(),
    maxCredits: z.number().optional(),
    createdAfter: z.string().optional(),
    createdBefore: z.string().optional(),
  }),
});

export const notificationsRouter = router({
  /**
   * List broadcast notifications
   */
  list: protectedProcedure
    .input(listNotificationsSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit, offset, status } = input;

      const conditions = [];
      if (status) {
        conditions.push(eq(broadcastNotifications.status, status));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(broadcastNotifications)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get notifications
      const broadcastList = await db.query.broadcastNotifications.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(broadcastNotifications.createdAt)],
        with: {
          createdByAdmin: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        notifications: broadcastList,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get broadcast notification by ID
   */
  get: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { notificationId } = input;

      const notification = await db.query.broadcastNotifications.findFirst({
        where: eq(broadcastNotifications.id, notificationId),
        with: {
          createdByAdmin: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!notification) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Notification not found' });
      }

      return notification;
    }),

  /**
   * Preview targeting - count how many users match the targeting criteria
   */
  preview: protectedProcedure
    .input(previewTargetingSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { targeting } = input;

      const conditions = [];

      // All users
      if (targeting.allUsers) {
        // No additional conditions needed
      } else {
        // Specific user IDs
        if (targeting.userIds && targeting.userIds.length > 0) {
          conditions.push(inArray(users.id, targeting.userIds));
        }

        // Tiers (subscription tiers)
        if (targeting.tiers && targeting.tiers.length > 0) {
          const tierConditions = [];
          for (const tier of targeting.tiers) {
            tierConditions.push(eq(subscriptions.tier, tier));
          }
          if (tierConditions.length > 0) {
            // Users with subscriptions matching these tiers
            const subQuery = db
              .select({ userId: subscriptions.userId })
              .from(subscriptions)
              .where(
                and(
                  eq(subscriptions.status, 'active'),
                  or(...tierConditions)!
                )
              );
            // This is a simplified approach - in production, you'd use a proper join
            conditions.push(sql`${users.id} IN (SELECT user_id FROM subscriptions WHERE tier IN (${sql.join(targeting.tiers.map(t => sql`${t}`), sql`, `)}) AND status = 'active')`);
          }
        }

        // Active subscription filter
        if (targeting.hasActiveSubscription !== undefined) {
          if (targeting.hasActiveSubscription) {
            conditions.push(
              sql`${users.id} IN (SELECT user_id FROM subscriptions WHERE status = 'active')`
            );
          } else {
            conditions.push(
              sql`${users.id} NOT IN (SELECT user_id FROM subscriptions WHERE status = 'active')`
            );
          }
        }

        // Credits range
        if (targeting.minCredits !== undefined || targeting.maxCredits !== undefined) {
          const creditConditions = [];
          if (targeting.minCredits !== undefined) {
            creditConditions.push(gte(userCredits.balance, targeting.minCredits));
          }
          if (targeting.maxCredits !== undefined) {
            creditConditions.push(lte(userCredits.balance, targeting.maxCredits));
          }
          if (creditConditions.length > 0) {
            conditions.push(
              sql`${users.id} IN (SELECT user_id FROM user_credits WHERE ${and(...creditConditions)})`
            );
          }
        }

        // Created date range
        if (targeting.createdAfter) {
          conditions.push(gte(users.createdAt, new Date(targeting.createdAfter)));
        }
        if (targeting.createdBefore) {
          conditions.push(lte(users.createdAt, new Date(targeting.createdBefore)));
        }
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Count matching users
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause);
      const userCount = Number(countResult[0]?.count ?? 0);

      return {
        targetCount: userCount,
        targeting,
      };
    }),

  /**
   * Create a new broadcast notification
   */
  create: protectedProcedure
    .input(createNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { targeting, scheduledFor, ...notificationData } = input;

      // Preview targeting to get count
      const preview = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(
          targeting.allUsers
            ? undefined
            : and(
                targeting.userIds && targeting.userIds.length > 0
                  ? inArray(users.id, targeting.userIds)
                  : undefined,
                // Simplified targeting - in production, implement full targeting logic
                ...(targeting.tiers && targeting.tiers.length > 0
                  ? [
                      sql`${users.id} IN (
                        SELECT user_id FROM subscriptions 
                        WHERE tier IN (${sql.join(targeting.tiers.map(t => sql`${t}`), sql`, `)})
                        AND status = 'active'
                      )`,
                    ]
                  : []),
                targeting.hasActiveSubscription !== undefined
                  ? targeting.hasActiveSubscription
                    ? sql`${users.id} IN (SELECT user_id FROM subscriptions WHERE status = 'active')`
                    : sql`${users.id} NOT IN (SELECT user_id FROM subscriptions WHERE status = 'active')`
                  : undefined
              )
        );
      const targetCount = Number(preview[0]?.count ?? 0);

      // Determine status
      const status = scheduledFor && new Date(scheduledFor) > new Date() ? 'scheduled' : 'draft';

      // Create broadcast notification
      const newNotification = await db
        .insert(broadcastNotifications)
        .values({
          ...notificationData,
          targeting,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
          status,
          targetCount,
          createdBy: admin.id,
        })
        .returning();

      // If not scheduled, send immediately
      if (status === 'draft') {
        // In production, this would trigger an async job to send notifications
        // For now, we'll just mark it as sent
        await db
          .update(broadcastNotifications)
          .set({
            status: 'sent',
            sentAt: new Date(),
            sentCount: targetCount,
          })
          .where(eq(broadcastNotifications.id, newNotification[0].id));
      }

      // Audit log
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'create',
        entityType: 'broadcast_notification',
        entityId: newNotification[0].id,
        details: {
          type: input.type,
          title: input.title,
          targetCount,
          status,
        },
      });

      return newNotification[0];
    }),

  /**
   * Cancel a scheduled notification
   */
  cancel: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { notificationId } = input;

      // Get existing notification
      const existing = await db.query.broadcastNotifications.findFirst({
        where: eq(broadcastNotifications.id, notificationId),
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Notification not found' });
      }

      if (existing.status !== 'scheduled' && existing.status !== 'draft') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only cancel scheduled or draft notifications',
        });
      }

      // Cancel notification
      await db
        .update(broadcastNotifications)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(broadcastNotifications.id, notificationId));

      // Audit log
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'broadcast_notification',
        entityId: notificationId,
        details: {
          action: 'cancel',
          oldStatus: existing.status,
          newStatus: 'cancelled',
        },
      });

      return { success: true };
    }),

  /**
   * Get notification statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const stats = await db
      .select({
        status: broadcastNotifications.status,
        count: sql<number>`count(*)`,
      })
      .from(broadcastNotifications)
      .groupBy(broadcastNotifications.status);

    const totalSent = await db
      .select({
        total: sql<number>`COALESCE(SUM(${broadcastNotifications.sentCount}), 0)`,
        read: sql<number>`COALESCE(SUM(${broadcastNotifications.readCount}), 0)`,
      })
      .from(broadcastNotifications)
      .where(eq(broadcastNotifications.status, 'sent'));

    return {
      byStatus: stats.reduce(
        (acc, stat) => {
          acc[stat.status] = Number(stat.count);
          return acc;
        },
        {} as Record<string, number>
      ),
      totalSent: Number(totalSent[0]?.total ?? 0),
      totalRead: Number(totalSent[0]?.read ?? 0),
    };
  }),
});
