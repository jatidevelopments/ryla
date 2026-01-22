/**
 * Template Categories Schema
 *
 * Hierarchical categories for organizing templates.
 * Epic: EP-048 (Category & Tag System)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Template Categories table - hierarchical organization
 */
export const templateCategories = pgTable(
  'template_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Self-referencing parent for hierarchy
    parentId: uuid('parent_id'),

    // Metadata
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    icon: text('icon'), // emoji or icon name

    // Display
    sortOrder: integer('sort_order').default(0),
    isActive: boolean('is_active').default(true),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    parentIdx: index('template_categories_parent_idx').on(table.parentId),
    slugUnique: uniqueIndex('template_categories_slug_unique').on(table.slug),
    activeIdx: index('template_categories_active_idx').on(table.isActive),
    sortIdx: index('template_categories_sort_idx').on(table.parentId, table.sortOrder),
  })
);

/**
 * Self-referencing relations for parent-child hierarchy
 */
export const templateCategoriesRelations = relations(templateCategories, ({ one, many }) => ({
  parent: one(templateCategories, {
    fields: [templateCategories.parentId],
    references: [templateCategories.id],
    relationName: 'parent_child',
  }),
  children: many(templateCategories, {
    relationName: 'parent_child',
  }),
}));

// Type exports
export type TemplateCategory = typeof templateCategories.$inferSelect;
export type NewTemplateCategory = typeof templateCategories.$inferInsert;
