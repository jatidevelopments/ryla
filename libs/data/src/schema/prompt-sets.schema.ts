/**
 * Prompt Sets Schema
 *
 * Stores user-defined and system prompt sets for profile picture generation.
 * Allows users to save custom sets and select from predefined starter sets.
 */

import { pgTable, text, jsonb, uuid, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { characters } from './characters.schema';

/**
 * Prompt Sets table - stores profile picture prompt sets
 */
export const promptSets = pgTable(
  'prompt_sets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id'), // Circular dependency fix: FK constraint removed from ORM definition

    // Set metadata
    name: text('name').notNull(),
    description: text('description'),
    style: text('style'), // e.g., 'Instagram influencer', 'high fashion', 'K-beauty'
    isSystemSet: boolean('is_system_set').default(false), // System-defined starter sets
    isPublic: boolean('is_public').default(false), // Can be shared with other users

    // Set configuration (JSONB for flexibility)
    config: jsonb('config').notNull().$type<{
      characterDNA: {
        name?: string;
        age?: string;
        ethnicity?: string;
        hair?: string;
        eyes?: string;
        skin?: string;
        bodyType?: string;
        facialFeatures?: string;
        style?: string;
      };
      positions: Array<{
        id: string;
        name: string;
        angle: string;
        pose: string;
        expression: string;
        lighting: string;
        framing: 'close-up' | 'medium' | 'full-body';
        aspectRatio: '1:1' | '4:5' | '9:16';
      }>;
      basePromptTemplate: string;
      negativePrompt: string;
      tags: string[];
    }>(),

    // Usage stats
    usageCount: text('usage_count').default('0'), // How many times this set was used

    // Soft delete
    deletedAt: timestamp('deleted_at'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdx: index('prompt_sets_user_idx').on(table.userId),
    characterIdx: index('prompt_sets_character_idx').on(table.characterId),
    systemSetIdx: index('prompt_sets_system_idx').on(table.isSystemSet),
    publicIdx: index('prompt_sets_public_idx').on(table.isPublic),
  })
);

export const promptSetsRelations = relations(promptSets, ({ one }) => ({
  user: one(users, {
    fields: [promptSets.userId],
    references: [users.id],
  }),
  character: one(characters, {
    fields: [promptSets.characterId],
    references: [characters.id],
  }),
}));

