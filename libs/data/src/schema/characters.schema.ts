import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { promptSets } from './prompt-sets.schema';

export const characterStatusEnum = pgEnum('character_status', [
  'draft', // Initial state, not yet generated
  'generating', // Currently generating preview images
  'ready', // Ready to use, preview images generated
  'failed', // Generation failed
  'training', // LoRA training in progress
  'hd_ready', // LoRA trained, HD mode available
]);

/**
 * Character configuration type (stored as JSONB)
 * Represents the 6-step wizard selections
 */
export interface CharacterConfig {
  // Step 1: Style
  gender?: 'female' | 'male';
  style?: 'realistic' | 'anime';

  // Step 2: General (Basic Appearance)
  ethnicity?: string;
  age?: number;
  ageRange?: string; // e.g., "18-25", "26-33"
  skinColor?: string; // e.g., "light", "medium", "tan", "dark"

  // Step 3: Face (Facial Features)
  eyeColor?: string;
  faceShape?: string; // e.g., "oval", "round", "square", "heart", "diamond"

  // Step 4: Hair
  hairStyle?: string;
  hairColor?: string;

  // Step 5: Body
  bodyType?: string;
  assSize?: string; // e.g., "small", "medium", "large", "huge"
  breastSize?: string; // Female only
  breastType?: string; // e.g., "regular", "perky", "saggy", "torpedo"

  // Step 6: Skin Features
  freckles?: string; // e.g., "none", "light", "medium", "heavy"
  scars?: string; // e.g., "none", "small", "medium", "large"
  beautyMarks?: string; // e.g., "none", "single", "multiple"

  // Step 7: Body Modifications
  piercings?: string; // e.g., "none", "ear", "nose", "lip", "eyebrow", "multiple"
  tattoos?: string; // e.g., "none", "small", "medium", "large", "full-body"

  // Step 5: Identity
  defaultOutfit?: string;
  archetype?: string;
  personalityTraits?: string[];
  bio?: string;
  handle?: string; // e.g., @luna.dreams

  // NSFW settings
  nsfwEnabled?: boolean;

  // Profile picture set selection (string ID, not UUID)
  profilePictureSetId?: 'classic-influencer' | 'professional-model' | 'natural-beauty' | null;

  // Step 9: Advanced (removed from wizard but kept for backward compatibility)
  voice?: string; // e.g., "sultry", "sweet", "confident"
  videoContentOptions?: string[]; // e.g., ["selfie-posing", "dance-video", "driving-car", "custom"]

  // Legacy/compatibility
  outfitStyle?: string;
}

export const characters = pgTable(
  'characters',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    handle: text('handle'), // @username style handle
    config: jsonb('config').notNull().$type<CharacterConfig>(),
    seed: text('seed'), // For consistent generation (face lock)
    status: characterStatusEnum('status').default('draft'),
    generationError: text('generation_error'),

    // Base image (from wizard)
    baseImageId: uuid('base_image_id'), // Reference to selected base image
    baseImageUrl: text('base_image_url'), // URL to selected base image

    // Profile picture set
    profilePictureSetId: uuid('profile_picture_set_id').references(
      () => promptSets.id,
      { onDelete: 'set null' }
    ), // Reference to prompt_sets table
    profilePictureImages: jsonb('profile_picture_images').$type<Array<{
      id: string;
      url: string;
      thumbnailUrl?: string;
      positionId: string;
      positionName: string;
      prompt?: string;
      negativePrompt?: string;
      isNSFW?: boolean;
    }>>(), // Array of profile picture image data

    // LoRA training status
    loraStatus: text('lora_status'), // 'pending', 'generating_sheets', 'training', 'ready', 'failed'
    loraModelId: uuid('lora_model_id'), // Reference to active LoRA model

    // Stats (denormalized for performance)
    postCount: text('post_count').default('0'),
    likedCount: text('liked_count').default('0'),

    // Soft delete
    deletedAt: timestamp('deleted_at'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdx: index('characters_user_idx').on(table.userId),
    statusIdx: index('characters_status_idx').on(table.status),
  })
);

// Forward declaration for relations
export const charactersRelations = relations(characters, ({ one }) => ({
  user: one(users, { fields: [characters.userId], references: [users.id] }),
}));

// Type exports
export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
export type CharacterStatus = (typeof characterStatusEnum.enumValues)[number];
