/**
 * Feature Flags Router
 *
 * Manages feature flags for gradual rollouts and A/B testing.
 * Part of EP-057: Advanced Admin Operations
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import {
  featureFlags,
  featureFlagHistory,
  adminAuditLog,
} from '@ryla/data';
import { eq, and, or, ilike, desc, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * List feature flags schema
 */
const listFlagsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  type: z.enum(['boolean', 'percentage', 'tier']).optional(),
  enabled: z.boolean().optional(),
});

/**
 * Create feature flag schema
 */
const createFlagSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['boolean', 'percentage', 'tier']),
  enabled: z.boolean().default(false),
  config: z
    .object({
      percentage: z.number().min(0).max(100).optional(),
      tiers: z.array(z.string()).optional(),
      userOverrides: z.record(z.boolean()).optional(),
    })
    .optional(),
});

/**
 * Update feature flag schema
 */
const updateFlagSchema = z.object({
  flagName: z.string(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  config: z
    .object({
      percentage: z.number().min(0).max(100).optional(),
      tiers: z.array(z.string()).optional(),
      userOverrides: z.record(z.boolean()).optional(),
    })
    .optional(),
});

/**
 * Check flag for user schema
 */
const checkFlagForUserSchema = z.object({
  flagName: z.string(),
  userId: z.string().uuid().optional(),
  userTier: z.string().optional(),
});

export const flagsRouter = router({
  /**
   * List feature flags with pagination, search, and filters
   */
  list: protectedProcedure
    .input(listFlagsSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit, offset, search, type, enabled } = input;

      const conditions = [];

      if (type) {
        conditions.push(eq(featureFlags.type, type));
      }

      if (enabled !== undefined) {
        conditions.push(eq(featureFlags.enabled, enabled));
      }

      if (search) {
        conditions.push(
          or(
            ilike(featureFlags.name, `%${search}%`),
            ilike(featureFlags.description, `%${search}%`)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(featureFlags)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get flags
      const flags = await db.query.featureFlags.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(featureFlags.createdAt)],
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
        flags,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  /**
   * Get feature flag by name
   */
  get: protectedProcedure
    .input(z.object({ flagName: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { flagName } = input;

      const flag = await db.query.featureFlags.findFirst({
        where: eq(featureFlags.name, flagName),
        with: {
          createdByAdmin: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
          history: {
            limit: 10,
            orderBy: [desc(featureFlagHistory.createdAt)],
            with: {
              adminUser: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!flag) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Feature flag not found' });
      }

      return flag;
    }),

  /**
   * Create a new feature flag
   */
  create: protectedProcedure
    .input(createFlagSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;

      // Check if flag already exists
      const existing = await db.query.featureFlags.findFirst({
        where: eq(featureFlags.name, input.name),
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Feature flag with this name already exists',
        });
      }

      // Create flag
      const newFlag = await db
        .insert(featureFlags)
        .values({
          name: input.name,
          description: input.description,
          type: input.type,
          enabled: input.enabled,
          config: input.config || {},
          createdBy: admin.id,
        })
        .returning();

      // Audit log
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'create',
        entityType: 'feature_flag',
        entityId: newFlag[0].id,
        details: {
          name: input.name,
          type: input.type,
          enabled: input.enabled,
          config: input.config,
        },
      });

      return newFlag[0];
    }),

  /**
   * Update a feature flag
   */
  update: protectedProcedure
    .input(updateFlagSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { flagName, ...updates } = input;

      // Get existing flag
      const existing = await db.query.featureFlags.findFirst({
        where: eq(featureFlags.name, flagName),
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Feature flag not found' });
      }

      // Prepare new config (merge with existing)
      const newConfig = updates.config
        ? { ...(existing.config || {}), ...updates.config }
        : existing.config;

      // Update flag
      const updated = await db
        .update(featureFlags)
        .set({
          ...updates,
          config: newConfig,
          updatedAt: new Date(),
        })
        .where(eq(featureFlags.name, flagName))
        .returning();

      if (!updated[0]) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update feature flag',
        });
      }

      // Save history
      await db.insert(featureFlagHistory).values({
        flagId: existing.id,
        adminUserId: admin.id,
        oldConfig: {
          enabled: existing.enabled,
          config: existing.config,
        },
        newConfig: {
          enabled: updated[0].enabled,
          config: updated[0].config,
        },
      });

      // Audit log
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'update',
        entityType: 'feature_flag',
        entityId: existing.id,
        details: {
          name: flagName,
          oldValue: existing,
          newValue: updated[0],
        },
      });

      return updated[0];
    }),

  /**
   * Delete a feature flag
   */
  delete: protectedProcedure
    .input(z.object({ flagName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { flagName } = input;

      // Get existing flag
      const existing = await db.query.featureFlags.findFirst({
        where: eq(featureFlags.name, flagName),
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Feature flag not found' });
      }

      // Delete flag (cascade will delete history)
      await db.delete(featureFlags).where(eq(featureFlags.name, flagName));

      // Audit log
      await db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'delete',
        entityType: 'feature_flag',
        entityId: existing.id,
        details: {
          name: flagName,
          deletedBy: admin.id,
        },
      });

      return { success: true };
    }),

  /**
   * Check if a feature flag is enabled for a user
   * Used by the main app to check feature availability
   */
  checkForUser: protectedProcedure
    .input(checkFlagForUserSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { flagName, userId, userTier } = input;

      const flag = await db.query.featureFlags.findFirst({
        where: eq(featureFlags.name, flagName),
      });

      if (!flag) {
        return { enabled: false, reason: 'Flag not found' };
      }

      // If flag is disabled globally, return false
      if (!flag.enabled) {
        return { enabled: false, reason: 'Flag disabled globally' };
      }

      // Check user-specific override
      if (userId && flag.config?.userOverrides?.[userId] !== undefined) {
        return {
          enabled: flag.config.userOverrides[userId],
          reason: flag.config.userOverrides[userId] ? 'User override enabled' : 'User override disabled',
        };
      }

      // Check tier-based flag
      if (flag.type === 'tier' && userTier) {
        const enabled = flag.config?.tiers?.includes(userTier) ?? false;
        return {
          enabled,
          reason: enabled ? `Tier ${userTier} enabled` : `Tier ${userTier} not in enabled tiers`,
        };
      }

      // Check percentage rollout
      if (flag.type === 'percentage' && flag.config?.percentage !== undefined) {
        // For percentage rollouts, we'd typically use a consistent hash of userId
        // For now, we'll just return based on the percentage
        // In production, you'd want to use a consistent hash function
        const enabled = Math.random() * 100 < flag.config.percentage;
        return {
          enabled,
          reason: enabled
            ? `User in ${flag.config.percentage}% rollout`
            : `User not in ${flag.config.percentage}% rollout`,
        };
      }

      // Boolean flag - return enabled state
      return { enabled: true, reason: 'Flag enabled' };
    }),
});
