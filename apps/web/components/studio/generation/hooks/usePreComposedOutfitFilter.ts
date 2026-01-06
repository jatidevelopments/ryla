import * as React from 'react';
import { OUTFIT_OPTIONS, OUTFIT_CATEGORIES, type OutfitOption } from '@ryla/shared';
import { useGalleryFavorites } from '../../../../lib/hooks/use-gallery-favorites';

type OutfitCategory = (typeof OUTFIT_CATEGORIES)[number];

interface UsePreComposedOutfitFilterOptions {
  nsfwEnabled?: boolean;
}

interface UsePreComposedOutfitFilterReturn {
  search: string;
  category: OutfitCategory | 'all';
  showFavoritesOnly: boolean;
  setSearch: (value: string) => void;
  setCategory: (value: OutfitCategory | 'all') => void;
  setShowFavoritesOnly: (value: boolean) => void;
  availableOutfits: OutfitOption[];
  isFavorited: (outfitId: string) => boolean;
  toggleFavorite: (outfitId: string) => void;
}

export function usePreComposedOutfitFilter({
  nsfwEnabled = false,
}: UsePreComposedOutfitFilterOptions = {}): UsePreComposedOutfitFilterReturn {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<OutfitCategory | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);

  // Favorites hook
  const { isFavorited, toggleFavorite } = useGalleryFavorites({
    itemType: 'outfit',
  });

  // Filter outfits based on search, category, NSFW setting, and favorites
  const availableOutfits = React.useMemo(() => {
    let baseOutfits = OUTFIT_OPTIONS;

    // Filter out Adult Content outfits if Adult Content is not enabled
    if (!nsfwEnabled) {
      baseOutfits = baseOutfits.filter((outfit) => !outfit.isAdult);
    }

    return baseOutfits.filter((outfit) => {
      const matchesSearch = outfit.label.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || outfit.category === category;
      const outfitId = outfit.label.toLowerCase().replace(/\s+/g, '-');
      const matchesFavorites = !showFavoritesOnly || isFavorited(outfitId);
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [search, category, nsfwEnabled, showFavoritesOnly, isFavorited]);

  return {
    search,
    category,
    showFavoritesOnly,
    setSearch,
    setCategory,
    setShowFavoritesOnly,
    availableOutfits,
    isFavorited,
    toggleFavorite,
  };
}

