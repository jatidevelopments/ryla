/**
 * Gallery Favorites Repository
 *
 * Manages user favorites for gallery items (poses, styles, scenes, lighting, outfits, objects, outfit-compositions).
 */

import { and, eq, inArray } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';
import type {
  GalleryFavorite,
  NewGalleryFavorite,
  GalleryItemType,
} from '../schema';

export class GalleryFavoritesRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  // ==========================================
  // FAVORITES
  // ==========================================

  /**
   * Add gallery item to favorites
   */
  async addFavorite(
    userId: string,
    itemType: GalleryItemType,
    itemId: string
  ): Promise<GalleryFavorite> {
    // Check if already favorited
    const existing = await this.db.query.galleryFavorites.findFirst({
      where: and(
        eq(schema.galleryFavorites.userId, userId),
        eq(schema.galleryFavorites.itemType, itemType),
        eq(schema.galleryFavorites.itemId, itemId)
      ),
    });

    if (existing) {
      return existing;
    }

    // Insert new favorite
    const [row] = await this.db
      .insert(schema.galleryFavorites)
      .values({
        userId,
        itemType,
        itemId,
      })
      .returning();

    return row;
  }

  /**
   * Remove gallery item from favorites
   */
  async removeFavorite(
    userId: string,
    itemType: GalleryItemType,
    itemId: string
  ): Promise<boolean> {
    const result = await this.db
      .delete(schema.galleryFavorites)
      .where(
        and(
          eq(schema.galleryFavorites.userId, userId),
          eq(schema.galleryFavorites.itemType, itemType),
          eq(schema.galleryFavorites.itemId, itemId)
        )
      );

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Check if gallery item is favorited by user
   */
  async isFavorited(
    userId: string,
    itemType: GalleryItemType,
    itemId: string
  ): Promise<boolean> {
    const favorite = await this.db.query.galleryFavorites.findFirst({
      where: and(
        eq(schema.galleryFavorites.userId, userId),
        eq(schema.galleryFavorites.itemType, itemType),
        eq(schema.galleryFavorites.itemId, itemId)
      ),
    });

    return !!favorite;
  }

  /**
   * Get all favorites for a user, optionally filtered by item type
   */
  async getFavorites(
    userId: string,
    itemType?: GalleryItemType
  ): Promise<GalleryFavorite[]> {
    const conditions = [eq(schema.galleryFavorites.userId, userId)];

    if (itemType) {
      conditions.push(eq(schema.galleryFavorites.itemType, itemType));
    }

    return this.db.query.galleryFavorites.findMany({
      where: and(...conditions),
      orderBy: (favorites, { desc }) => [desc(favorites.createdAt)],
    });
  }

  /**
   * Get favorite item IDs for a user and item type (for quick lookup)
   */
  async getFavoriteIds(
    userId: string,
    itemType: GalleryItemType
  ): Promise<Set<string>> {
    const favorites = await this.getFavorites(userId, itemType);
    return new Set(favorites.map((f) => f.itemId));
  }

  /**
   * Check which items from a list are favorited
   */
  async getFavoritedItems(
    userId: string,
    itemType: GalleryItemType,
    itemIds: string[]
  ): Promise<Set<string>> {
    if (itemIds.length === 0) {
      return new Set();
    }

    const favorites = await this.db.query.galleryFavorites.findMany({
      where: and(
        eq(schema.galleryFavorites.userId, userId),
        eq(schema.galleryFavorites.itemType, itemType),
        inArray(schema.galleryFavorites.itemId, itemIds)
      ),
    });

    return new Set(favorites.map((f) => f.itemId));
  }

  /**
   * Toggle favorite status (add if not favorited, remove if favorited)
   */
  async toggleFavorite(
    userId: string,
    itemType: GalleryItemType,
    itemId: string
  ): Promise<boolean> {
    const isFavorited = await this.isFavorited(userId, itemType, itemId);

    if (isFavorited) {
      await this.removeFavorite(userId, itemType, itemId);
      return false;
    } else {
      await this.addFavorite(userId, itemType, itemId);
      return true;
    }
  }
}

