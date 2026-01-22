/**
 * Broadcast Notifications Schema
 *
 * Manages admin-created broadcast notifications sent to multiple users.
 * Part of EP-057: Advanced Admin Operations
 */

import { pgTable, uuid, text, timestamp, boolean, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { adminUsers } from './admin-users.schema';

/**
 * Broadcast notifications table
 * Tracks admin-created notifications sent to multiple users
 */
export const broadcastNotifications = pgTable(
  'broadcast_notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: text('type').notNull(), // e.g., 'announcement', 'maintenance', 'promotion'
    title: text('title').notNull(),
    message: text('message').notNull(),
    href: text('href'), // Optional deep link
    
    // Targeting
    targeting: jsonb('targeting').$type<{
      allUsers?: boolean;
      userIds?: string[];
      tiers?: string[]; // e.g., ['free', 'creator', 'pro']
      hasActiveSubscription?: boolean;
      minCredits?: number;
      maxCredits?: number;
      createdAfter?: string; // ISO date string
      createdBefore?: string; // ISO date string
    }>(),
    
    // Scheduling
    scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    
    // Status
    status: text('status').notNull().default('draft'), // 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
    
    // Stats
    targetCount: integer('target_count'), // Number of users who will receive this
    sentCount: integer('sent_count').default(0), // Number of notifications actually sent
    readCount: integer('read_count').default(0), // Number of notifications read
    
    // Metadata
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    
    // Admin tracking
    createdBy: uuid('created_by')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'restrict' }),
    
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('broadcast_notifications_status_idx').on(table.status),
    index('broadcast_notifications_scheduled_for_idx').on(table.scheduledFor),
    index('broadcast_notifications_created_by_idx').on(table.createdBy),
    index('broadcast_notifications_created_at_idx').on(table.createdAt),
  ]
);

/**
 * Relations
 */
export const broadcastNotificationsRelations = relations(broadcastNotifications, ({ one }) => ({
  createdByAdmin: one(adminUsers, {
    fields: [broadcastNotifications.createdBy],
    references: [adminUsers.id],
  }),
}));

/**
 * Broadcast notification status enum
 */
export type BroadcastNotificationStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';

/**
 * Targeting configuration type
 */
export interface BroadcastTargeting {
  allUsers?: boolean;
  userIds?: string[];
  tiers?: string[];
  hasActiveSubscription?: boolean;
  minCredits?: number;
  maxCredits?: number;
  createdAfter?: string;
  createdBefore?: string;
}
