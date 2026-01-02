import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

/**
 * In-app notifications for a user.
 *
 * Notes:
 * - `type` is a free-form string for MVP (future: enum).
 * - `metadata` can store structured payload for routing/rendering.
 */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    href: text('href'),

    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at'),

    metadata: jsonb('metadata').$type<Record<string, unknown>>(),

    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userIdx: index('notifications_user_idx').on(table.userId),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
    isReadIdx: index('notifications_is_read_idx').on(table.isRead),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;


