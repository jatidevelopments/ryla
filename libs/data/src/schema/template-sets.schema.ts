import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { templates } from './templates.schema';

/**
 * Content type enum for template sets
 * - image: All members are image templates
 * - video: All members are video templates
 * - lip_sync: All members are lip sync templates
 * - audio: All members are audio templates
 * - mixed: Members have different content types
 */
export const templateSetContentTypeEnum = pgEnum('template_set_content_type', [
  'image',
  'video',
  'lip_sync',
  'audio',
  'mixed',
]);

/**
 * Template Sets table - collections of templates that can be applied together
 */
export const templateSets = pgTable(
  'template_sets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // userId is nullable for curated sets (system-created templates)
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),

    // Metadata
    name: text('name').notNull(),
    description: text('description'),
    previewImageUrl: text('preview_image_url'),
    thumbnailUrl: text('thumbnail_url'),

    // Visibility
    isPublic: boolean('is_public').default(false).notNull(),
    isCurated: boolean('is_curated').default(false).notNull(),

    // Content type (derived from members or set explicitly)
    contentType: templateSetContentTypeEnum('content_type')
      .default('image')
      .notNull(),

    // Stats
    likesCount: integer('likes_count').default(0).notNull(),
    usageCount: integer('usage_count').default(0).notNull(),
    memberCount: integer('member_count').default(0).notNull(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('template_sets_user_idx').on(table.userId),
    publicIdx: index('template_sets_public_idx').on(table.isPublic),
    contentTypeIdx: index('template_sets_content_type_idx').on(
      table.contentType
    ),
    createdAtIdx: index('template_sets_created_at_idx').on(table.createdAt),
    usageCountIdx: index('template_sets_usage_count_idx').on(table.usageCount),
    likesCountIdx: index('template_sets_likes_count_idx').on(table.likesCount),
  })
);

/**
 * Template Set Members - junction table linking sets to templates
 * Order is preserved via order_position column
 */
export const templateSetMembers = pgTable(
  'template_set_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    setId: uuid('set_id')
      .notNull()
      .references(() => templateSets.id, { onDelete: 'cascade' }),
    templateId: uuid('template_id')
      .notNull()
      .references(() => templates.id, { onDelete: 'cascade' }),
    orderPosition: integer('order_position').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    setIdx: index('template_set_members_set_idx').on(table.setId),
    templateIdx: index('template_set_members_template_idx').on(table.templateId),
    orderIdx: index('template_set_members_order_idx').on(
      table.setId,
      table.orderPosition
    ),
    // Each template can only be in a set once
    uniqueSetTemplate: unique('template_set_members_unique').on(
      table.setId,
      table.templateId
    ),
  })
);

/**
 * Template Set Likes - tracks user likes on sets
 */
export const templateSetLikes = pgTable(
  'template_set_likes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    setId: uuid('set_id')
      .notNull()
      .references(() => templateSets.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    setIdx: index('template_set_likes_set_idx').on(table.setId),
    userIdx: index('template_set_likes_user_idx').on(table.userId),
    // Each user can only like a set once
    uniqueSetUser: unique('template_set_likes_unique').on(
      table.setId,
      table.userId
    ),
  })
);

// Relations
export const templateSetsRelations = relations(templateSets, ({ one, many }) => ({
  user: one(users, {
    fields: [templateSets.userId],
    references: [users.id],
  }),
  members: many(templateSetMembers),
  likes: many(templateSetLikes),
}));

export const templateSetMembersRelations = relations(
  templateSetMembers,
  ({ one }) => ({
    set: one(templateSets, {
      fields: [templateSetMembers.setId],
      references: [templateSets.id],
    }),
    template: one(templates, {
      fields: [templateSetMembers.templateId],
      references: [templates.id],
    }),
  })
);

export const templateSetLikesRelations = relations(
  templateSetLikes,
  ({ one }) => ({
    set: one(templateSets, {
      fields: [templateSetLikes.setId],
      references: [templateSets.id],
    }),
    user: one(users, {
      fields: [templateSetLikes.userId],
      references: [users.id],
    }),
  })
);

// Type exports
export type TemplateSet = typeof templateSets.$inferSelect;
export type NewTemplateSet = typeof templateSets.$inferInsert;
export type TemplateSetMember = typeof templateSetMembers.$inferSelect;
export type NewTemplateSetMember = typeof templateSetMembers.$inferInsert;
export type TemplateSetLike = typeof templateSetLikes.$inferSelect;
export type NewTemplateSetLike = typeof templateSetLikes.$inferInsert;
export type TemplateSetContentType = (typeof templateSetContentTypeEnum.enumValues)[number];
