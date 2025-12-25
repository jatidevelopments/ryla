import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { characters } from './characters.schema';
import { users } from './users.schema';
import { generationJobs } from './generation-jobs.schema';
import { prompts } from './prompts.schema';

// Scene presets for Content Studio (EP-005)
export const scenePresetEnum = pgEnum('scene_preset', [
  'professional_portrait',
  'candid_lifestyle',
  'fashion_editorial',
  'fitness_motivation',
  'morning_vibes',
  'night_out',
  'cozy_home',
  'beach_day',
]);

// Environment presets for Content Studio (EP-005)
export const environmentPresetEnum = pgEnum('environment_preset', [
  'beach',
  'home_bedroom',
  'home_living_room',
  'office',
  'cafe',
  'urban_street',
  'studio',
]);

// Aspect ratio options
export const aspectRatioEnum = pgEnum('aspect_ratio', ['1:1', '9:16', '2:3']);

// Quality mode options
export const qualityModeEnum = pgEnum('quality_mode', ['draft', 'hq']);

/**
 * Posts table - represents generated content with captions
 * A post = image + caption, ready for export to platforms
 */
export const posts = pgTable(
  'posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    jobId: uuid('job_id').references(() => generationJobs.id, {
      onDelete: 'set null',
    }),
    promptId: uuid('prompt_id').references(() => prompts.id, {
      onDelete: 'set null',
    }), // Reference to prompt template used

    // Image data
    imageUrl: text('image_url').notNull(), // Full-size image URL
    thumbnailUrl: text('thumbnail_url'), // 300px thumbnail URL
    s3Key: text('s3_key').notNull(), // S3/Supabase storage key
    width: integer('width').notNull(),
    height: integer('height').notNull(),

    // Caption
    caption: text('caption'), // AI-generated or user-edited caption
    captionEdited: boolean('caption_edited').default(false), // Was caption manually edited?

    // Generation config (for reference/regeneration)
    scene: scenePresetEnum('scene').notNull(),
    environment: environmentPresetEnum('environment').notNull(),
    outfit: text('outfit').notNull(),
    aspectRatio: aspectRatioEnum('aspect_ratio').notNull().default('9:16'),
    qualityMode: qualityModeEnum('quality_mode').notNull().default('draft'),
    nsfw: boolean('nsfw').default(false),

    // Prompt used for generation (for debugging/improvement)
    prompt: text('prompt'),
    negativePrompt: text('negative_prompt'),
    seed: text('seed'), // Generation seed for reproducibility

    // User actions
    liked: boolean('liked').default(false), // Favorited by user
    exported: boolean('exported').default(false), // Has been downloaded/exported
    exportedAt: timestamp('exported_at'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    // Indexes for common queries
    characterIdx: index('posts_character_idx').on(table.characterId),
    userIdx: index('posts_user_idx').on(table.userId),
    likedIdx: index('posts_liked_idx').on(table.characterId, table.liked),
    createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
  })
);

export const postsRelations = relations(posts, ({ one }) => ({
  character: one(characters, {
    fields: [posts.characterId],
    references: [characters.id],
  }),
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  job: one(generationJobs, {
    fields: [posts.jobId],
    references: [generationJobs.id],
  }),
  prompt: one(prompts, {
    fields: [posts.promptId],
    references: [prompts.id],
  }),
}));

// Type exports for use in services
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type ScenePreset = (typeof scenePresetEnum.enumValues)[number];
export type EnvironmentPreset =
  (typeof environmentPresetEnum.enumValues)[number];
export type AspectRatio = (typeof aspectRatioEnum.enumValues)[number];
export type QualityMode = (typeof qualityModeEnum.enumValues)[number];
