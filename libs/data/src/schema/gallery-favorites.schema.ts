/**
 * Gallery Favorites Schema
 *
 * Stores user favorites for gallery items (poses, styles, scenes, lighting, outfits, objects, outfit-compositions).
 * These are static items defined in constants, not database entities.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

/**
 * Gallery item type enum
 */
export const galleryItemTypeEnum = pgEnum('gallery_item_type', [
  'pose',
  'style',
  'scene',
  'lighting',
  'outfit',
  'object',
  'outfit-composition',
]);

/**
 * Gallery favorites table
 * Users can favorite gallery items to see them first and filter by favorites
 */
export const galleryFavorites = pgTable(
  'gallery_favorites',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    itemType: galleryItemTypeEnum('item_type').notNull(),
    itemId: text('item_id').notNull(), // The ID from the constants (e.g., pose ID, style ID)

    // Timestamps
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    // Unique constraint: user can only favorite an item once
    userItemUnique: index('gallery_favorites_user_item_unique').on(
      table.userId,
      table.itemType,
      table.itemId
    ),
    userIdx: index('gallery_favorites_user_idx').on(table.userId),
    itemTypeIdx: index('gallery_favorites_item_type_idx').on(table.itemType),
    itemIdIdx: index('gallery_favorites_item_id_idx').on(table.itemId),
  })
);

/**
 * Relations
 */
export const galleryFavoritesRelations = relations(
  galleryFavorites,
  ({ one }) => ({
    user: one(users, {
      fields: [galleryFavorites.userId],
      references: [users.id],
    }),
  })
);

/**
 * Type exports
 */
export type GalleryFavorite = typeof galleryFavorites.$inferSelect;
export type NewGalleryFavorite = typeof galleryFavorites.$inferInsert;
export type GalleryItemType = (typeof galleryItemTypeEnum.enumValues)[number];

