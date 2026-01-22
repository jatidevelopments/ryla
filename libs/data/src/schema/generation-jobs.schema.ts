import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { characters } from './characters.schema';
import { users } from './users.schema';

export const jobStatusEnum = pgEnum('job_status', [
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled',
]);

export const jobTypeEnum = pgEnum('job_type', [
  'base_image_generation', // Generate 3 base image options from wizard
  'character_sheet_generation', // Generate character sheet (7-10 images) from base image
  'image_generation', // Standard image generation (Face Swap or LoRA)
  'character_generation', // Initial character preview generation (legacy)
  'image_upscale', // Image upscaling
  'lora_training', // LoRA model training
  'hd_generation', // HD generation using trained LoRA (legacy)
  'caption_generation', // AI caption generation
]);

/**
 * Content Studio generation input config
 */
export interface GenerationInput {
  scene?: string; // Scene preset
  environment?: string; // Environment preset
  outfit?: string; // Outfit selection
  aspectRatio?: '1:1' | '9:16' | '2:3';
  // qualityMode removed - see EP-045
  imageCount?: number;
  nsfw?: boolean;
  prompt?: string; // Full prompt (built from config)
  negativePrompt?: string;
  seed?: string;
  width?: number;
  height?: number;
  steps?: number;
  // For image edits (e.g., inpaint)
  sourceImageId?: string;
  editType?: 'inpaint';
  // Optional: store mask key for debugging/replay
  editMaskS3Key?: string;
  // For LoRA training
  trainingImages?: string[];
  triggerWord?: string;
  // For HD generation
  loraModelId?: string;
  // Metadata for studio/profile pictures
  promptEnhance?: boolean;
  originalPrompt?: string;
  enhancedPrompt?: string;
  poseId?: string;
  lightingId?: string;
  imageId?: string;
}

/**
 * Generation job output
 */
export interface GenerationOutput {
  imageUrls?: string[];
  thumbnailUrls?: string[];
  s3Keys?: string[];
  postIds?: string[];
  loraModelPath?: string;
  captions?: string[];
}

export const generationJobs = pgTable(
  'generation_jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id').references(() => characters.id, {
      onDelete: 'set null',
    }),
    type: jobTypeEnum('type').notNull(),
    status: jobStatusEnum('status').default('queued'),

    // Typed input/output
    input: jsonb('input').notNull().$type<GenerationInput>(),
    // Output shape depends on the RunPod handler. We persist raw JSON and normalize later.
    output: jsonb('output').$type<Record<string, unknown>>(),

    // Progress tracking
    imageCount: integer('image_count'), // Total images to generate
    completedCount: integer('completed_count').default(0), // Images completed

    // Credits
    creditsUsed: integer('credits_used'), // Credits consumed by this job

    // Error handling
    error: text('error'),
    retryCount: integer('retry_count').default(0),

    // External service tracking
    externalJobId: text('external_job_id'), // ID from Replicate/Fal/RunPod
    externalProvider: text('external_provider'), // 'replicate', 'fal', 'runpod'

    // Timestamps
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdx: index('generation_jobs_user_idx').on(table.userId),
    characterIdx: index('generation_jobs_character_idx').on(table.characterId),
    statusIdx: index('generation_jobs_status_idx').on(table.status),
    typeIdx: index('generation_jobs_type_idx').on(table.type),
  })
);

export const generationJobsRelations = relations(generationJobs, ({ one }) => ({
  user: one(users, {
    fields: [generationJobs.userId],
    references: [users.id],
  }),
  character: one(characters, {
    fields: [generationJobs.characterId],
    references: [characters.id],
  }),
}));

// Type exports
export type GenerationJob = typeof generationJobs.$inferSelect;
export type NewGenerationJob = typeof generationJobs.$inferInsert;
export type JobStatus = (typeof jobStatusEnum.enumValues)[number];
export type JobType = (typeof jobTypeEnum.enumValues)[number];
