import { pgTable, uuid, text, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { characters } from './characters.schema';
import { users } from './users.schema';

export const outfitPresets = pgTable(
  'outfit_presets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    influencerId: uuid('influencer_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    composition: jsonb('composition').notNull().$type<{
      top?: string;
      bottom?: string;
      shoes?: string;
      headwear?: string;
      outerwear?: string;
      accessories?: string[];
    }>(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    influencerIdx: index('idx_outfit_presets_influencer').on(table.influencerId),
    userIdx: index('idx_outfit_presets_user').on(table.userId),
    defaultIdx: index('idx_outfit_presets_default').on(table.influencerId, table.isDefault),
  })
);

