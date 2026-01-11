import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

/**
 * Cards table for storing user payment cards
 * Normalized from subscriptions table per feedback
 */
export const cards = pgTable(
  'cards',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    cardHash: text('card_hash').notNull(), // Finby card token/hash
    last4: text('last4'), // Last 4 digits of card
    cardType: text('card_type'), // Visa, Mastercard, etc.
    expiryDate: text('expiry_date'), // Card expiry date from Finby
    isDefault: boolean('is_default').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdIdx: index('cards_user_id_idx').on(table.userId),
    isDefaultIdx: index('cards_is_default_idx').on(table.isDefault),
  })
);

export const cardsRelations = relations(cards, ({ one }) => ({
  user: one(users, {
    fields: [cards.userId],
    references: [users.id],
  }),
}));

// Type exports
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;

