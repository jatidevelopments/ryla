/**
 * System Configuration Router
 *
 * Manages system-wide configuration settings.
 * Part of EP-057: Advanced Admin Operations
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../base';
import {
  systemConfig,
  systemConfigHistory,
  adminAuditLog,
  DEFAULT_SYSTEM_CONFIGS,
} from '@ryla/data';
import { eq, and, or, ilike, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * List system config schema
 */
const listConfigSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});

/**
 * Set system config schema
 */
const setConfigSchema = z.object({
  key: z.string().min(1),
  value: z.any(), // Can be any JSON-serializable value
  description: z.string().optional(),
  validationType: z.enum(['number', 'string', 'boolean', 'json']).optional(),
});

/**
 * Get config history schema
 */
const getConfigHistorySchema = z.object({
  key: z.string(),
  limit: z.number().min(1).max(100).default(20),
});

export const configRouter = router({
  /**
   * List system configurations
   */
  list: protectedProcedure
    .input(listConfigSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { category, search } = input;

      const conditions = [];

      if (category) {
        conditions.push(eq(systemConfig.category, category));
      }

      if (search) {
        conditions.push(
          or(
            ilike(systemConfig.key, `%${search}%`),
            ilike(systemConfig.description, `%${search}%`)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get all configs
      const configs = await db.query.systemConfig.findMany({
        where: whereClause,
        orderBy: [systemConfig.category, systemConfig.key],
        with: {
          updatedByAdmin: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Group by category
      const grouped = configs.reduce(
        (acc, config) => {
          if (!acc[config.category]) {
            acc[config.category] = [];
          }
          acc[config.category].push(config);
          return acc;
        },
        {} as Record<string, typeof configs>
      );

      return {
        configs,
        grouped,
        categories: Object.keys(grouped).sort(),
      };
    }),

  /**
   * Get a specific configuration by key
   */
  get: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { key } = input;

      const config = await db.query.systemConfig.findFirst({
        where: eq(systemConfig.key, key),
        with: {
          updatedByAdmin: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!config) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Configuration not found' });
      }

      return config;
    }),

  /**
   * Set or update a configuration value
   */
  set: protectedProcedure
    .input(setConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, admin } = ctx;
      const { key, value, description, validationType } = input;

      // Validate value based on validation type
      if (validationType) {
        if (validationType === 'number' && typeof value !== 'number') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Value must be a number for key ${key}`,
          });
        }
        if (validationType === 'boolean' && typeof value !== 'boolean') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Value must be a boolean for key ${key}`,
          });
        }
        if (validationType === 'string' && typeof value !== 'string') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Value must be a string for key ${key}`,
          });
        }
      }

      // Get existing config
      const existing = await db.query.systemConfig.findFirst({
        where: eq(systemConfig.key, key),
      });

      // Determine category from key (e.g., 'generation.max_concurrent' -> 'generation')
      const category = key.split('.')[0] || 'general';

      if (existing) {
        // Update existing config
        const updated = await db
          .update(systemConfig)
          .set({
            value,
            description: description ?? existing.description,
            validationType: validationType ?? existing.validationType,
            updatedBy: admin.id,
            updatedAt: new Date(),
          })
          .where(eq(systemConfig.key, key))
          .returning();

        if (!updated[0]) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update configuration',
          });
        }

        // Save history
        await db.insert(systemConfigHistory).values({
          configKey: key,
          oldValue: existing.value,
          newValue: value,
          adminUserId: admin.id,
        });

        // Audit log
        await db.insert(adminAuditLog).values({
          adminId: admin.id,
          action: 'update',
          entityType: 'system_config',
          entityId: existing.id,
          details: {
            key,
            oldValue: existing.value,
            newValue: value,
          },
        });

        return updated[0];
      } else {
        // Create new config
        const newConfig = await db
          .insert(systemConfig)
          .values({
            key,
            value,
            category,
            description,
            validationType: validationType || 'json',
            updatedBy: admin.id,
          })
          .returning();

        // Audit log
        await db.insert(adminAuditLog).values({
          adminId: admin.id,
          action: 'create',
          entityType: 'system_config',
          entityId: newConfig[0].id,
          details: {
            key,
            value,
            category,
          },
        });

        return newConfig[0];
      }
    }),

  /**
   * Get configuration change history
   */
  getHistory: protectedProcedure
    .input(getConfigHistorySchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { key, limit } = input;

      // Verify config exists
      const config = await db.query.systemConfig.findFirst({
        where: eq(systemConfig.key, key),
      });

      if (!config) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Configuration not found' });
      }

      // Get history
      const history = await db.query.systemConfigHistory.findMany({
        where: eq(systemConfigHistory.configKey, key),
        limit,
        orderBy: [desc(systemConfigHistory.createdAt)],
        with: {
          adminUser: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return history;
    }),

  /**
   * Initialize default configurations
   * Only super_admin can run this
   */
  initializeDefaults: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, admin } = ctx;

    // Only super_admin can initialize defaults
    if (admin.role !== 'super_admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only super_admin can initialize default configurations',
      });
    }

    const results = [];

    for (const defaultConfig of DEFAULT_SYSTEM_CONFIGS) {
      // Check if config already exists
      const existing = await db.query.systemConfig.findFirst({
        where: eq(systemConfig.key, defaultConfig.key),
      });

      if (!existing) {
        const newConfig = await db
          .insert(systemConfig)
          .values({
            key: defaultConfig.key,
            value: defaultConfig.value,
            category: defaultConfig.category,
            description: defaultConfig.description,
            validationType: defaultConfig.validationType,
            updatedBy: admin.id,
          })
          .returning();

        results.push({ key: defaultConfig.key, action: 'created', config: newConfig[0] });
      } else {
        results.push({ key: defaultConfig.key, action: 'skipped', config: existing });
      }
    }

    // Audit log - entityId is nullable UUID, use null for bulk operations
    await db.insert(adminAuditLog).values({
      adminId: admin.id,
      action: 'create',
      entityType: 'system_config',
      entityId: null, // Nullable, use null for bulk initialization
      details: {
        action: 'initialize_defaults',
        results,
      },
    });

    return {
      initialized: results.filter((r) => r.action === 'created').length,
      skipped: results.filter((r) => r.action === 'skipped').length,
      results,
    };
  }),
});
