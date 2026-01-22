/**
 * Feature Flags Schema
 *
 * Manages feature flags for gradual rollouts and A/B testing.
 * Part of EP-057: Advanced Admin Operations
 */

import { pgTable, uuid, text, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { adminUsers } from './admin-users.schema';

/**
 * Feature flags table
 */
export const featureFlags = pgTable(
  'feature_flags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description'),
    type: text('type').notNull(), // 'boolean', 'percentage', 'tier'
    enabled: boolean('enabled').notNull().default(false),
    config: jsonb('config').$type<{
      percentage?: number; // For percentage rollout (0-100)
      tiers?: string[]; // For tier-based flags (e.g., ['free', 'creator'])
      userOverrides?: Record<string, boolean>; // User-specific overrides
    }>(),
    createdBy: uuid('created_by').references(() => adminUsers.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('feature_flags_name_idx').on(table.name),
    index('feature_flags_enabled_idx').on(table.enabled),
    index('feature_flags_type_idx').on(table.type),
  ]
);

/**
 * Feature flag history table for audit trail
 */
export const featureFlagHistory = pgTable(
  'feature_flag_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    flagId: uuid('flag_id')
      .notNull()
      .references(() => featureFlags.id, { onDelete: 'cascade' }),
    adminUserId: uuid('admin_user_id').references(() => adminUsers.id, {
      onDelete: 'set null',
    }),
    oldConfig: jsonb('old_config'),
    newConfig: jsonb('new_config'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('feature_flag_history_flag_id_idx').on(table.flagId),
    index('feature_flag_history_created_at_idx').on(table.createdAt),
  ]
);

/**
 * Relations
 */
export const featureFlagsRelations = relations(featureFlags, ({ one, many }) => ({
  createdByAdmin: one(adminUsers, {
    fields: [featureFlags.createdBy],
    references: [adminUsers.id],
  }),
  history: many(featureFlagHistory),
}));

export const featureFlagHistoryRelations = relations(featureFlagHistory, ({ one }) => ({
  flag: one(featureFlags, {
    fields: [featureFlagHistory.flagId],
    references: [featureFlags.id],
  }),
  adminUser: one(adminUsers, {
    fields: [featureFlagHistory.adminUserId],
    references: [adminUsers.id],
  }),
}));

/**
 * Feature flag types
 */
export type FeatureFlagType = 'boolean' | 'percentage' | 'tier';

/**
 * Feature flag config type
 */
export interface FeatureFlagConfig {
  percentage?: number;
  tiers?: string[];
  userOverrides?: Record<string, boolean>;
}
