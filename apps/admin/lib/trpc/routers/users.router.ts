/**
 * Admin Users Router
 *
 * Provides user management operations for admin panel.
 * Part of EP-051: User Management Dashboard
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import {
  users,
  userCredits,
  creditTransactions,
  subscriptions,
  characters,
  images,
  adminAuditLog,
} from '@ryla/data';
import { eq, and, or, ilike, desc, asc, sql } from 'drizzle-orm';

/**
 * User list query schema
 */
const listUsersSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  status: z.enum(['active', 'banned']).optional(),
  subscriptionTier: z.enum(['free', 'starter', 'pro', 'unlimited']).optional(),
  sortBy: z.enum(['createdAt', 'email', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Ban user schema
 */
const banUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

/**
 * Unban user schema
 */
const unbanUserSchema = z.object({
  userId: z.string().uuid(),
});

export const usersRouter = router({
  /**
   * List users with pagination, search, and filters
   */
  list: protectedProcedure
    .input(listUsersSchema)
    .query(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { limit, offset, search, status, subscriptionTier, sortBy, sortOrder } = input;

      // Build where conditions
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            ilike(users.email, `%${search}%`),
            ilike(users.name, `%${search}%`),
            ilike(users.publicName, `%${search}%`)
          )!
        );
      }

      if (status === 'banned') {
        conditions.push(eq(users.banned, true));
      } else if (status === 'active') {
        conditions.push(eq(users.banned, false));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Build order by
      const orderBy =
        sortOrder === 'desc'
          ? desc(users[sortBy])
          : asc(users[sortBy]);

      // Get users with counts
      const usersList = await db.query.users.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [orderBy],
        columns: {
          id: true,
          email: true,
          name: true,
          publicName: true,
          banned: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get additional data for each user (credits, subscription, counts)
      const enrichedUsers = await Promise.all(
        usersList.map(async (user) => {
          // Get credits
          const credits = await db.query.userCredits.findFirst({
            where: eq(userCredits.userId, user.id),
            columns: {
              balance: true,
              totalEarned: true,
              totalSpent: true,
            },
          });

          // Get subscription
          const subscription = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.userId, user.id),
            columns: {
              tier: true,
              status: true,
            },
            orderBy: [desc(subscriptions.createdAt)],
          });

      // Get character count
      const characterCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(characters)
        .where(eq(characters.userId, user.id));
      const characterCount = Number(characterCountResult[0]?.count ?? 0);

      // Get image count
      const imageCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(images)
        .where(eq(images.userId, user.id));
      const imageCount = Number(imageCountResult[0]?.count ?? 0);

          return {
            ...user,
            credits: credits?.balance ?? 0,
            totalEarned: credits?.totalEarned ?? 0,
            totalSpent: credits?.totalSpent ?? 0,
            subscriptionTier: subscription?.tier ?? 'free',
            subscriptionStatus: subscription?.status ?? 'expired',
            characterCount,
            imageCount,
          };
        })
      );

      return {
        users: enrichedUsers,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get single user by ID with full details
   */
  get: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { userId } = input;

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get credits
      const credits = await db.query.userCredits.findFirst({
        where: eq(userCredits.userId, userId),
      });

      // Get subscription
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId),
        orderBy: [desc(subscriptions.createdAt)],
      });

      // Get character count
      const characterCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(characters)
        .where(eq(characters.userId, userId));
      const characterCount = Number(characterCountResult[0]?.count ?? 0);

      // Get image count
      const imageCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(images)
        .where(eq(images.userId, userId));
      const imageCount = Number(imageCountResult[0]?.count ?? 0);

      return {
        ...user,
        credits: credits ?? null,
        subscription: subscription ?? null,
        characterCount,
        imageCount,
      };
    }),

  /**
   * Search users by query (email, name, or ID)
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { query, limit } = input;

      // Try to match UUID first (exact match)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        query
      );

      const conditions = isUuid
        ? [eq(users.id, query)]
        : [
            ilike(users.email, `%${query}%`),
            ilike(users.name, `%${query}%`),
            ilike(users.publicName, `%${query}%`),
          ];

      const results = await db.query.users.findMany({
        where: or(...conditions)!,
        limit,
        columns: {
          id: true,
          email: true,
          name: true,
          publicName: true,
          banned: true,
          createdAt: true,
        },
        orderBy: [desc(users.createdAt)],
      });

      return results;
    }),

  /**
   * Ban a user
   */
  ban: protectedProcedure
    .input(banUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin, headers } = ctx;
      const { userId, reason } = input;

      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.banned) {
        throw new Error('User is already banned');
      }

      // Ban the user
      await db
        .update(users)
        .set({
          banned: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Log audit event
      const ipAddress = headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown';
      const userAgent = headers.get('user-agent') || 'unknown';

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'user_banned',
        entityType: 'user',
        entityId: userId,
        details: {
          reason,
          userEmail: user.email,
        },
        ipAddress,
        userAgent,
      });

      return { success: true };
    }),

  /**
   * Unban a user
   */
  unban: protectedProcedure
    .input(unbanUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin, headers } = ctx;
      const { userId } = input;

      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.banned) {
        throw new Error('User is not banned');
      }

      // Unban the user
      await db
        .update(users)
        .set({
          banned: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Log audit event
      const ipAddress = headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown';
      const userAgent = headers.get('user-agent') || 'unknown';

      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'user_unbanned',
        entityType: 'user',
        entityId: userId,
        details: {
          userEmail: user.email,
        },
        ipAddress,
        userAgent,
      });

      return { success: true };
    }),

  /**
   * Get user credit transactions
   */
  getCredits: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { userId, limit, offset } = input;

      const transactions = await db.query.creditTransactions.findMany({
        where: eq(creditTransactions.userId, userId),
        limit,
        offset,
        orderBy: [desc(creditTransactions.createdAt)],
      });

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId));
      const total = Number(totalResult[0]?.count ?? 0);

      return {
        transactions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get user subscription
   */
  getSubscription: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { userId } = input;

      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId),
        orderBy: [desc(subscriptions.createdAt)],
      });

      return subscription;
    }),

  /**
   * Get user characters
   */
  getCharacters: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { userId } = input;

      const userCharacters = await db.query.characters.findMany({
        where: eq(characters.userId, userId),
        orderBy: [desc(characters.createdAt)],
        columns: {
          id: true,
          name: true,
          handle: true,
          status: true,
          baseImageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return userCharacters;
    }),

  /**
   * Get user images
   */
  getImages: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        characterId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { userId, limit, offset, characterId } = input;

      const conditions = [eq(images.userId, userId)];
      if (characterId) {
        conditions.push(eq(images.characterId, characterId));
      }

      const userImages = await db.query.images.findMany({
        where: and(...conditions),
        limit,
        offset,
        orderBy: [desc(images.createdAt)],
        columns: {
          id: true,
          characterId: true,
          s3Key: true,
          status: true,
          createdAt: true,
        },
      });

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(images)
        .where(and(...conditions));
      const total = Number(totalResult[0]?.count ?? 0);

      return {
        images: userImages,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),
});
