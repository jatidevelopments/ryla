'use client';

import * as React from 'react';
import { OutfitPieceCategory } from '@ryla/shared';

interface UseOutfitPickerStateReturn {
  activeCategory: OutfitPieceCategory | 'all' | 'presets';
  setActiveCategory: (category: OutfitPieceCategory | 'all' | 'presets') => void;
  search: string;
  setSearch: (value: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (value: boolean) => void;
  mounted: boolean;
}

/**
 * Hook for managing outfit picker UI state
 */
export function useOutfitPickerState(): UseOutfitPickerStateReturn {
  const [activeCategory, setActiveCategory] = React.useState<
    OutfitPieceCategory | 'all' | 'presets'
  >('all');
  const [search, setSearch] = React.useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return {
    activeCategory,
    setActiveCategory,
    search,
    setSearch,
    showFavoritesOnly,
    setShowFavoritesOnly,
    mounted,
  };
}

