import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  integer,
  index,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { characters } from './characters.schema';
import { users } from './users.schema';
import {
  aspectRatioEnum,
  environmentPresetEnum,
  qualityModeEnum,
  scenePresetEnum,
} from './posts.schema';

export const imageStatusEnum = pgEnum('image_status', [
  'pending',
  'generating',
  'completed',
  'failed',
]);

/**
 * Images table - raw generated images (before becoming posts)
 * Used for character preview images and intermediate states
 */
export const images = pgTable(
  'images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    characterId: uuid('character_id').references(() => characters.id, {
      onDelete: 'cascade',
    }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Lineage for edits (e.g., inpaint)
    sourceImageId: uuid('source_image_id').references((): any => images.id, {
      onDelete: 'set null',
    }),
    editType: text('edit_type'), // e.g. 'inpaint'
    // Optional (nice-to-have): store edit mask asset key for debugging/replay
    editMaskS3Key: text('edit_mask_s3_key'),

    s3Key: text('s3_key').notNull(), // S3/Supabase storage key
    s3Url: text('s3_url'), // Full URL (or pre-signed URL)
    thumbnailKey: text('thumbnail_key'), // Thumbnail storage key
    thumbnailUrl: text('thumbnail_url'), // Thumbnail URL
    prompt: text('prompt'), // Generation prompt used
    negativePrompt: text('negative_prompt'),
    seed: text('seed'), // Generation seed for reproducibility

    // Required structured Studio metadata (EP-005)
    scene: scenePresetEnum('scene'),
    environment: environmentPresetEnum('environment'),
    outfit: text('outfit'),
    aspectRatio: aspectRatioEnum('aspect_ratio'),
    qualityMode: qualityModeEnum('quality_mode'),
    nsfw: boolean('nsfw').default(false),

    // User actions (MVP)
    liked: boolean('liked').default(false),

    // Soft delete
    deletedAt: timestamp('deleted_at'),

    status: imageStatusEnum('status').default('pending'),
    width: integer('width'),
    height: integer('height'),
    generationError: text('generation_error'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    characterIdx: index('images_character_idx').on(table.characterId),
    userIdx: index('images_user_idx').on(table.userId),
    statusIdx: index('images_status_idx').on(table.status),
    sourceImageIdx: index('images_source_image_idx').on(table.sourceImageId),
    likedIdx: index('images_liked_idx').on(table.characterId, table.liked),
  })
);

export const imagesRelations = relations(images, ({ one }) => ({
  character: one(characters, {
    fields: [images.characterId],
    references: [characters.id],
  }),
  user: one(users, { fields: [images.userId], references: [users.id] }),
}));

// Type exports
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type ImageStatus = (typeof imageStatusEnum.enumValues)[number];
