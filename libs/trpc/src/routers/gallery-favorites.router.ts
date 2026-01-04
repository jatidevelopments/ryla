/**
 * Gallery Favorites Router
 *
 * Handles gallery item favorites (poses, styles, scenes, lighting, outfits, objects, outfit-compositions).
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { GalleryFavoritesRepository } from '@ryla/data';

const galleryItemTypeSchema = z.enum([
  'pose',
  'style',
  'scene',
  'lighting',
  'outfit',
  'object',
  'outfit-composition',
]);

export const galleryFavoritesRouter = router({
  /**
   * Toggle favorite status for a gallery item
   */
  toggleFavorite: protectedProcedure
    .input(
      z.object({
        itemType: galleryItemTypeSchema,
        itemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = new GalleryFavoritesRepository(ctx.db);
      const favorited = await repo.toggleFavorite(
        ctx.user.id,
        input.itemType,
        input.itemId
      );

      return { favorited };
    }),

  /**
   * Add gallery item to favorites
   */
  addFavorite: protectedProcedure
    .input(
      z.object({
        itemType: galleryItemTypeSchema,
        itemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = new GalleryFavoritesRepository(ctx.db);
      await repo.addFavorite(ctx.user.id, input.itemType, input.itemId);

      return { favorited: true };
    }),

  /**
   * Remove gallery item from favorites
   */
  removeFavorite: protectedProcedure
    .input(
      z.object({
        itemType: galleryItemTypeSchema,
        itemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = new GalleryFavoritesRepository(ctx.db);
      await repo.removeFavorite(ctx.user.id, input.itemType, input.itemId);

      return { favorited: false };
    }),

  /**
   * Check if gallery item is favorited
   */
  isFavorited: protectedProcedure
    .input(
      z.object({
        itemType: galleryItemTypeSchema,
        itemId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const repo = new GalleryFavoritesRepository(ctx.db);
      const favorited = await repo.isFavorited(
        ctx.user.id,
        input.itemType,
        input.itemId
      );

      return { favorited };
    }),

  /**
   * Get all favorites for a user, optionally filtered by item type
   */
  getFavorites: protectedProcedure
    .input(
      z
        .object({
          itemType: galleryItemTypeSchema.optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const repo = new GalleryFavoritesRepository(ctx.db);
      const favorites = await repo.getFavorites(
        ctx.user.id,
        input?.itemType
      );

      return { favorites };
    }),

  /**
   * Get favorite IDs for a specific item type (for quick lookup)
   */
  getFavoriteIds: protectedProcedure
    .input(
      z.object({
        itemType: galleryItemTypeSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const repo = new GalleryFavoritesRepository(ctx.db);
      const favoriteIds = await repo.getFavoriteIds(
        ctx.user.id,
        input.itemType
      );

      return { favoriteIds: Array.from(favoriteIds) };
    }),

  /**
   * Check which items from a list are favorited
   */
  getFavoritedItems: protectedProcedure
    .input(
      z.object({
        itemType: galleryItemTypeSchema,
        itemIds: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      const repo = new GalleryFavoritesRepository(ctx.db);
      const favoritedIds = await repo.getFavoritedItems(
        ctx.user.id,
        input.itemType,
        input.itemIds
      );

      return { favoritedIds: Array.from(favoritedIds) };
    }),
});

