/**
 * Hook for managing gallery favorites
 *
 * Provides easy access to favorite functionality for gallery items
 * (poses, styles, scenes, lighting, outfits, objects, outfit-compositions).
 */

import { useCallback } from 'react';
import { trpc } from '../trpc';

export type GalleryItemType =
  | 'pose'
  | 'style'
  | 'scene'
  | 'lighting'
  | 'outfit'
  | 'object'
  | 'outfit-composition';

interface UseGalleryFavoritesOptions {
  itemType: GalleryItemType;
  enabled?: boolean;
}

export function useGalleryFavorites({ itemType, enabled = true }: UseGalleryFavoritesOptions) {
  const utils = trpc.useUtils();

  // Get all favorite IDs for this item type
  const { data: favoritesData, isLoading: isLoadingFavorites } =
    trpc.galleryFavorites.getFavoriteIds.useQuery(
      { itemType },
      { enabled }
    );

  const favoriteIds = new Set(favoritesData?.favoriteIds ?? []);

  // Toggle favorite mutation
  const toggleFavoriteMutation = trpc.galleryFavorites.toggleFavorite.useMutation({
    onSuccess: () => {
      // Invalidate favorites query to refresh the list
      utils.galleryFavorites.getFavoriteIds.invalidate({ itemType });
      utils.galleryFavorites.getFavorites.invalidate();
    },
  });

  // Check if an item is favorited
  const isFavorited = useCallback(
    (itemId: string) => {
      return favoriteIds.has(itemId);
    },
    [favoriteIds]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (itemId: string) => {
      await toggleFavoriteMutation.mutateAsync({
        itemType,
        itemId,
      });
    },
    [itemType, toggleFavoriteMutation]
  );

  return {
    favoriteIds,
    isFavorited,
    toggleFavorite,
    isLoading: isLoadingFavorites,
    isToggling: toggleFavoriteMutation.isPending,
  };
}

