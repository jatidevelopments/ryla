import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  boolean,
  integer,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { characters } from './characters.schema';
import { images } from './images.schema';
import { generationJobs } from './generation-jobs.schema';
import { templateCategories } from './template-categories.schema';

/**
 * Template configuration type (stored as JSONB)
 * Complete snapshot of all generation settings
 */
export interface TemplateConfig {
  // Core settings
  scene: string | null;
  environment: string | null;
  outfit: string | Record<string, unknown> | null;
  aspectRatio: '1:1' | '9:16' | '2:3' | '3:4' | '4:3' | '16:9' | '3:2';
  nsfw: boolean;

  // Style and composition settings
  poseId: string | null;
  styleId: string | null;
  lightingId: string | null;
  modelId: string;
  objects: Array<{
    id: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    name?: string;
  }> | null;

  // Prompt settings
  prompt?: string;
  promptEnhance?: boolean;
}

/**
 * Templates table - saved generation configurations
 */
export const templates = pgTable(
  'templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    influencerId: uuid('influencer_id').references(() => characters.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    description: text('description'),
    previewImageUrl: text('preview_image_url').notNull(),
    thumbnailUrl: text('thumbnail_url').notNull(),

    // Complete template configuration (JSONB for flexibility)
    config: jsonb('config').notNull().$type<TemplateConfig>(),

    // Metadata
    sourceImageId: uuid('source_image_id').references(() => images.id, {
      onDelete: 'set null',
    }),
    sourceJobId: uuid('source_job_id').references(() => generationJobs.id, {
      onDelete: 'set null',
    }),
    isPublic: boolean('is_public').default(false),
    isCurated: boolean('is_curated').default(false),
    tags: text('tags').array(),

    // Category reference (EP-048)
    categoryId: uuid('category_id').references(() => templateCategories.id, {
      onDelete: 'set null',
    }),

    usageCount: integer('usage_count').default(0),
    likesCount: integer('likes_count').default(0),
    successRate: decimal('success_rate', { precision: 5, scale: 2 }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdx: index('templates_user_idx').on(table.userId),
    influencerIdx: index('templates_influencer_idx').on(table.influencerId),
    publicIdx: index('templates_public_idx').on(table.isPublic, table.isCurated),
    categoryIdx: index('templates_category_idx').on(table.categoryId),
    configIdx: index('templates_config_idx').using('gin', table.config),
    usageCountIdx: index('templates_usage_count_idx').on(table.usageCount),
    likesCountIdx: index('templates_likes_count_idx').on(table.likesCount),
    createdAtIdx: index('templates_created_at_idx').on(table.createdAt),
  })
);

/**
 * Template usage tracking table
 */
export const templateUsage = pgTable(
  'template_usage',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    templateId: uuid('template_id')
      .notNull()
      .references(() => templates.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    jobId: uuid('job_id').references(() => generationJobs.id, {
      onDelete: 'set null',
    }),
    generationSuccessful: boolean('generation_successful'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    templateIdx: index('template_usage_template_idx').on(table.templateId),
    userIdx: index('template_usage_user_idx').on(table.userId),
    jobIdx: index('template_usage_job_idx').on(table.jobId),
  })
);

export const templatesRelations = relations(templates, ({ one, many }) => ({
  user: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
  influencer: one(characters, {
    fields: [templates.influencerId],
    references: [characters.id],
  }),
  sourceImage: one(images, {
    fields: [templates.sourceImageId],
    references: [images.id],
  }),
  sourceJob: one(generationJobs, {
    fields: [templates.sourceJobId],
    references: [generationJobs.id],
  }),
  category: one(templateCategories, {
    fields: [templates.categoryId],
    references: [templateCategories.id],
  }),
  usage: many(templateUsage),
}));

export const templateUsageRelations = relations(templateUsage, ({ one }) => ({
  template: one(templates, {
    fields: [templateUsage.templateId],
    references: [templates.id],
  }),
  user: one(users, {
    fields: [templateUsage.userId],
    references: [users.id],
  }),
  job: one(generationJobs, {
    fields: [templateUsage.jobId],
    references: [generationJobs.id],
  }),
}));

// Type exports
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type TemplateUsage = typeof templateUsage.$inferSelect;
export type NewTemplateUsage = typeof templateUsage.$inferInsert;

