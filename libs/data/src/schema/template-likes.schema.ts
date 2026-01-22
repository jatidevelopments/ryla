/**
 * Template Likes Schema
 *
 * Tracks user likes on individual templates.
 * Epic: EP-049 (Likes & Popularity System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import {
  pgTable,
  uuid,
  timestamp,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { templates } from './templates.schema';

/**
 * Template Likes table - tracks user likes on templates
 */
export const templateLikes = pgTable(
  'template_likes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    templateId: uuid('template_id')
      .notNull()
      .references(() => templates.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    templateIdx: index('template_likes_template_idx').on(table.templateId),
    userIdx: index('template_likes_user_idx').on(table.userId),
    createdAtIdx: index('template_likes_created_at_idx').on(table.createdAt),
    uniqueUserTemplate: unique('template_likes_unique').on(
      table.userId,
      table.templateId
    ),
  })
);

/**
 * Relations for template likes
 */
export const templateLikesRelations = relations(templateLikes, ({ one }) => ({
  template: one(templates, {
    fields: [templateLikes.templateId],
    references: [templates.id],
  }),
  user: one(users, {
    fields: [templateLikes.userId],
    references: [users.id],
  }),
}));

// Type exports
export type TemplateLike = typeof templateLikes.$inferSelect;
export type NewTemplateLike = typeof templateLikes.$inferInsert;
