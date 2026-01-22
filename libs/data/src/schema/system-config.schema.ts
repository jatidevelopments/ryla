/**
 * System Configuration Schema
 *
 * Manages system-wide configuration settings.
 * Part of EP-057: Advanced Admin Operations
 */

import { pgTable, uuid, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { adminUsers } from './admin-users.schema';

/**
 * System configuration table
 */
export const systemConfig = pgTable(
  'system_config',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    key: text('key').notNull().unique(),
    value: jsonb('value').notNull(),
    category: text('category').notNull(),
    description: text('description'),
    validationType: text('validation_type'), // 'number', 'string', 'boolean', 'json'
    updatedBy: uuid('updated_by').references(() => adminUsers.id, {
      onDelete: 'set null',
    }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('system_config_key_idx').on(table.key),
    index('system_config_category_idx').on(table.category),
  ]
);

/**
 * System config history table for audit trail
 */
export const systemConfigHistory = pgTable(
  'system_config_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    configKey: text('config_key').notNull(),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    adminUserId: uuid('admin_user_id').references(() => adminUsers.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('system_config_history_key_idx').on(table.configKey),
    index('system_config_history_created_at_idx').on(table.createdAt),
  ]
);

/**
 * Relations
 */
export const systemConfigRelations = relations(systemConfig, ({ one }) => ({
  updatedByAdmin: one(adminUsers, {
    fields: [systemConfig.updatedBy],
    references: [adminUsers.id],
  }),
}));

export const systemConfigHistoryRelations = relations(systemConfigHistory, ({ one }) => ({
  adminUser: one(adminUsers, {
    fields: [systemConfigHistory.adminUserId],
    references: [adminUsers.id],
  }),
}));

/**
 * System config validation types
 */
export type SystemConfigValidationType = 'number' | 'string' | 'boolean' | 'json';

/**
 * Default system configurations
 */
export const DEFAULT_SYSTEM_CONFIGS = [
  {
    key: 'generation.max_concurrent',
    value: 5,
    category: 'generation',
    description: 'Maximum concurrent generation jobs per user',
    validationType: 'number' as SystemConfigValidationType,
  },
  {
    key: 'generation.default_quality',
    value: 'draft',
    category: 'generation',
    description: 'Default generation quality',
    validationType: 'string' as SystemConfigValidationType,
  },
  {
    key: 'credits.draft_cost',
    value: 1,
    category: 'credits',
    description: 'Credit cost for draft quality generations',
    validationType: 'number' as SystemConfigValidationType,
  },
  {
    key: 'credits.hq_cost',
    value: 3,
    category: 'credits',
    description: 'Credit cost for high quality generations',
    validationType: 'number' as SystemConfigValidationType,
  },
  {
    key: 'rate_limit.generations_per_minute',
    value: 10,
    category: 'rate_limits',
    description: 'Maximum generations per minute per user',
    validationType: 'number' as SystemConfigValidationType,
  },
  {
    key: 'maintenance.enabled',
    value: false,
    category: 'maintenance',
    description: 'Enable maintenance mode',
    validationType: 'boolean' as SystemConfigValidationType,
  },
  {
    key: 'maintenance.message',
    value: '',
    category: 'maintenance',
    description: 'Maintenance mode message',
    validationType: 'string' as SystemConfigValidationType,
  },
] as const;
