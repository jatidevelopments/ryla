/**
 * Prompts Schema
 *
 * Stores individual prompt templates in the database.
 * Allows building a pool of prompts with tracking and favorites.
 */

import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  integer,
  pgEnum,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

/**
 * Prompt rating enum
 */
export const promptRatingEnum = pgEnum('prompt_rating', [
  'sfw',
  'suggestive',
  'nsfw',
]);

/**
 * Prompt category enum
 */
export const promptCategoryEnum = pgEnum('prompt_category', [
  'portrait',
  'fullbody',
  'lifestyle',
  'fashion',
  'fitness',
  'social_media',
  'artistic',
  'video_reference',
]);

/**
 * Aspect ratio enum
 */
export const promptAspectRatioEnum = pgEnum('prompt_aspect_ratio', [
  '1:1',
  '9:16',
  '16:9',
  '4:5',
  '3:4',
]);

/**
 * Prompts table - stores individual prompt templates
 */
export const prompts = pgTable(
  'prompts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    createdBy: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }), // null = system prompt

    // Prompt identity
    name: text('name').notNull(), // Human-readable name
    description: text('description'), // What this prompt generates
    category: promptCategoryEnum('category').notNull(),
    subcategory: text('subcategory'), // e.g., 'selfie', 'beauty', 'professional'

    // Prompt content
    template: text('template').notNull(), // The actual prompt template with {{placeholders}}
    negativePrompt: text('negative_prompt'), // Suggested negative prompt
    requiredDNA: jsonb('required_dna').$type<string[]>(), // Required character DNA fields
    tags: jsonb('tags').$type<string[]>(), // Tags for filtering/searching

    // Prompt metadata
    rating: promptRatingEnum('rating').notNull().default('sfw'),
    recommendedWorkflow: text('recommended_workflow'), // e.g., 'z-image-danrisi'
    aspectRatio: promptAspectRatioEnum('aspect_ratio'), // Recommended aspect ratio

    // Visibility & sharing
    isSystemPrompt: boolean('is_system_prompt').default(false), // System-defined prompts
    isPublic: boolean('is_public').default(true), // Can be shared with other users
    isActive: boolean('is_active').default(true), // Can be used for generation

    // Usage stats (aggregated from prompt_usage table)
    usageCount: integer('usage_count').default(0), // Total times used
    successCount: integer('success_count').default(0), // Successful generations
    favoriteCount: integer('favorite_count').default(0), // Number of users who favorited

    // Soft delete
    deletedAt: timestamp('deleted_at'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    categoryIdx: index('prompts_category_idx').on(table.category),
    ratingIdx: index('prompts_rating_idx').on(table.rating),
    systemPromptIdx: index('prompts_system_idx').on(table.isSystemPrompt),
    publicIdx: index('prompts_public_idx').on(table.isPublic),
    activeIdx: index('prompts_active_idx').on(table.isActive),
    usageCountIdx: index('prompts_usage_count_idx').on(table.usageCount),
    favoriteCountIdx: index('prompts_favorite_count_idx').on(
      table.favoriteCount
    ),
    createdByIdx: index('prompts_created_by_idx').on(table.createdBy),
  })
);

/**
 * Prompt usage tracking table
 * Tracks every time a prompt is used for analytics
 */
export const promptUsage = pgTable(
  'prompt_usage',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    promptId: uuid('prompt_id')
      .notNull()
      .references(() => prompts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id'), // Which character was used
    postId: uuid('post_id'), // Resulting post (if successful)
    jobId: uuid('job_id'), // Generation job ID

    // Usage context
    scene: text('scene'), // Scene preset used
    environment: text('environment'), // Environment preset used
    outfit: text('outfit'), // Outfit used

    // Result tracking
    success: boolean('success').default(false), // Did generation succeed?
    generationTimeMs: integer('generation_time_ms'), // How long did it take?
    errorMessage: text('error_message'), // Error if failed

    // Timestamps
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    promptIdx: index('prompt_usage_prompt_idx').on(table.promptId),
    userIdx: index('prompt_usage_user_idx').on(table.userId),
    characterIdx: index('prompt_usage_character_idx').on(table.characterId),
    successIdx: index('prompt_usage_success_idx').on(table.success),
    createdAtIdx: index('prompt_usage_created_at_idx').on(table.createdAt),
    // Composite index for analytics queries
    promptSuccessIdx: index('prompt_usage_prompt_success_idx').on(
      table.promptId,
      table.success
    ),
  })
);

/**
 * Prompt favorites table
 * Users can favorite prompts to see them first
 */
export const promptFavorites = pgTable(
  'prompt_favorites',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    promptId: uuid('prompt_id')
      .notNull()
      .references(() => prompts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Order for custom sorting (lower = appears first)
    sortOrder: integer('sort_order').default(0),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    // Unique constraint: user can only favorite a prompt once
    userPromptUnique: index('prompt_favorites_user_prompt_unique').on(
      table.userId,
      table.promptId
    ),
    promptIdx: index('prompt_favorites_prompt_idx').on(table.promptId),
    userIdx: index('prompt_favorites_user_idx').on(table.userId),
    sortOrderIdx: index('prompt_favorites_sort_order_idx').on(
      table.userId,
      table.sortOrder
    ),
  })
);

/**
 * Relations
 */
export const promptsRelations = relations(prompts, ({ one, many }) => ({
  creator: one(users, {
    fields: [prompts.createdBy],
    references: [users.id],
  }),
  usage: many(promptUsage),
  favorites: many(promptFavorites),
}));

export const promptUsageRelations = relations(promptUsage, ({ one }) => ({
  prompt: one(prompts, {
    fields: [promptUsage.promptId],
    references: [prompts.id],
  }),
  user: one(users, {
    fields: [promptUsage.userId],
    references: [users.id],
  }),
}));

export const promptFavoritesRelations = relations(
  promptFavorites,
  ({ one }) => ({
    prompt: one(prompts, {
      fields: [promptFavorites.promptId],
      references: [prompts.id],
    }),
    user: one(users, {
      fields: [promptFavorites.userId],
      references: [users.id],
    }),
  })
);

/**
 * Type exports
 */
export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;
export type PromptUsage = typeof promptUsage.$inferSelect;
export type NewPromptUsage = typeof promptUsage.$inferInsert;
export type PromptFavorite = typeof promptFavorites.$inferSelect;
export type NewPromptFavorite = typeof promptFavorites.$inferInsert;
export type PromptRating = (typeof promptRatingEnum.enumValues)[number];
export type PromptCategory = (typeof promptCategoryEnum.enumValues)[number];
export type PromptAspectRatio =
  (typeof promptAspectRatioEnum.enumValues)[number];

