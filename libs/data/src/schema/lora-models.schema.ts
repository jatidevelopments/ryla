import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { characters } from './characters.schema';
import { users } from './users.schema';

// LoRA model training status
export const loraStatusEnum = pgEnum('lora_status', [
  'pending', // Waiting to start training
  'training', // Currently training
  'ready', // Training complete, model ready to use
  'failed', // Training failed
  'expired', // Model has expired/been deleted
]);

// LoRA model type (purpose)
export const loraTypeEnum = pgEnum('lora_type', [
  'face', // Face LoRA for character consistency
  'style', // Style LoRA (future)
  'pose', // Pose LoRA (future)
]);

// LoRA training model type (which AI model was used)
export const loraTrainingModelEnum = pgEnum('lora_training_model', [
  'flux', // Flux LoRA for image generation
  'wan', // Wan 2.6 LoRA for video generation (1.3B)
  'wan-14b', // Wan 2.6 LoRA for video generation (14B)
  'qwen', // Qwen-Image LoRA for image generation
]);

/**
 * LoRA training configuration type
 */
export interface LoraTrainingConfig {
  baseModel: string; // e.g., 'flux1-schnell', 'sdxl'
  triggerWord: string; // Word to trigger the LoRA
  steps: number; // Training steps (e.g., 700 for face)
  learningRate: number; // e.g., 0.0001
  resolution: number; // e.g., 1024
  trainingImages: string[]; // S3 keys of training images
}

/**
 * LoRA models table - tracks trained LoRA models per character
 * This enables Tier 2 HD generation with >95% face consistency
 */
export const loraModels = pgTable(
  'lora_models',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Model info
    type: loraTypeEnum('type').notNull().default('face'),
    status: loraStatusEnum('status').notNull().default('pending'),
    /** Which AI model was used for training (flux, wan, qwen, etc.) */
    trainingModel: loraTrainingModelEnum('training_model').default('flux'),

    // Training configuration
    config: jsonb('config').$type<LoraTrainingConfig>(),

    // Model location
    modelPath: text('model_path'), // S3/storage path to trained model
    modelUrl: text('model_url'), // URL to access the model

    // Training details
    triggerWord: text('trigger_word'), // Word to trigger the LoRA in prompts
    baseModel: text('base_model'), // Base model used (e.g., 'flux1-schnell')

    // External service tracking
    externalJobId: text('external_job_id'), // RunPod/Replicate job ID
    externalProvider: text('external_provider'), // 'runpod', 'replicate', etc.

    // Training metrics
    trainingSteps: integer('training_steps'),
    trainingDurationMs: integer('training_duration_ms'),
    trainingCost: integer('training_cost'), // Cost in cents

    // Credit tracking for refunds
    creditsCharged: integer('credits_charged'), // Credits charged for training
    creditsRefunded: integer('credits_refunded'), // Credits refunded if failed

    // Error handling
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').default(0),

    // Timestamps
    trainingStartedAt: timestamp('training_started_at'),
    trainingCompletedAt: timestamp('training_completed_at'),
    expiresAt: timestamp('expires_at'), // When the model expires (for cleanup)
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    characterIdx: index('lora_models_character_idx').on(table.characterId),
    userIdx: index('lora_models_user_idx').on(table.userId),
    statusIdx: index('lora_models_status_idx').on(table.status),
    trainingModelIdx: index('lora_models_training_model_idx').on(
      table.trainingModel
    ),
  })
);

export const loraModelsRelations = relations(loraModels, ({ one }) => ({
  character: one(characters, {
    fields: [loraModels.characterId],
    references: [characters.id],
  }),
  user: one(users, { fields: [loraModels.userId], references: [users.id] }),
}));

// Type exports
export type LoraModel = typeof loraModels.$inferSelect;
export type NewLoraModel = typeof loraModels.$inferInsert;
export type LoraStatus = (typeof loraStatusEnum.enumValues)[number];
export type LoraType = (typeof loraTypeEnum.enumValues)[number];
export type LoraTrainingModel = (typeof loraTrainingModelEnum.enumValues)[number];
