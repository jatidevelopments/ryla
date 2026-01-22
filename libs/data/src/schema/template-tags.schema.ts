/**
 * Template Tags Schema
 *
 * Flat tags for searchable template labels.
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
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { templates } from './templates.schema';

/**
 * Template Tags table - flat tags for templates
 */
export const templateTags = pgTable(
  'template_tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Tag info
    name: text('name').notNull(),
    slug: text('slug').notNull(),

    // Stats
    usageCount: integer('usage_count').default(0),

    // Flags
    isSystem: boolean('is_system').default(false), // true = AI-generated

    // Timestamps
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    nameUnique: uniqueIndex('template_tags_name_unique').on(table.name),
    slugUnique: uniqueIndex('template_tags_slug_unique').on(table.slug),
    usageIdx: index('template_tags_usage_idx').on(table.usageCount),
    systemIdx: index('template_tags_system_idx').on(table.isSystem),
  })
);

/**
 * Template Tag Assignments - junction table
 */
export const templateTagAssignments = pgTable(
  'template_tag_assignments',
  {
    templateId: uuid('template_id')
      .notNull()
      .references(() => templates.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => templateTags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.templateId, table.tagId] }),
    templateIdx: index('template_tag_assignments_template_idx').on(table.templateId),
    tagIdx: index('template_tag_assignments_tag_idx').on(table.tagId),
  })
);

/**
 * Relations for tags
 */
export const templateTagsRelations = relations(templateTags, ({ many }) => ({
  assignments: many(templateTagAssignments),
}));

export const templateTagAssignmentsRelations = relations(
  templateTagAssignments,
  ({ one }) => ({
    tag: one(templateTags, {
      fields: [templateTagAssignments.tagId],
      references: [templateTags.id],
    }),
    template: one(templates, {
      fields: [templateTagAssignments.templateId],
      references: [templates.id],
    }),
  })
);

// Type exports
export type TemplateTag = typeof templateTags.$inferSelect;
export type NewTemplateTag = typeof templateTags.$inferInsert;
export type TemplateTagAssignment = typeof templateTagAssignments.$inferSelect;
export type NewTemplateTagAssignment = typeof templateTagAssignments.$inferInsert;
