'use client';

import * as React from 'react';
import {
  VISUAL_STYLES,
  SCENES,
  LIGHTING_SETTINGS,
  type StyleCategory,
  type SceneCategory,
} from '../types';
import { useGalleryFavorites } from '../../../../lib/hooks/use-gallery-favorites';

export type TabType = 'styles' | 'scenes' | 'lighting' | 'effects';

interface UseStylePickerOptions {
  search: string;
  styleCategory: StyleCategory;
  sceneCategory: SceneCategory | 'all';
  showFavoritesOnly: boolean;
  activeTab: TabType;
}

/**
 * Hook for managing style picker state and filtering logic
 */
export function useStylePicker({
  search,
  styleCategory,
  sceneCategory,
  showFavoritesOnly,
  activeTab,
}: UseStylePickerOptions) {
  // Favorites hooks for different item types
  const stylesFavorites = useGalleryFavorites({ itemType: 'style' });
  const scenesFavorites = useGalleryFavorites({ itemType: 'scene' });
  const lightingFavorites = useGalleryFavorites({ itemType: 'lighting' });

  // Get the appropriate favorites hook based on active tab
  const currentFavorites = React.useMemo(() => {
    if (activeTab === 'styles') return stylesFavorites;
    if (activeTab === 'scenes') return scenesFavorites;
    if (activeTab === 'lighting') return lightingFavorites;
    return null;
  }, [activeTab, stylesFavorites, scenesFavorites, lightingFavorites]);

  // Filter styles
  const filteredStyles = React.useMemo(
    () =>
      VISUAL_STYLES.filter((style) => {
        const matchesSearch = style.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = styleCategory === 'all' || style.category === styleCategory;
        const matchesFavorites = !showFavoritesOnly || stylesFavorites.isFavorited(style.id);
        return matchesSearch && matchesCategory && matchesFavorites;
      }),
    [search, styleCategory, showFavoritesOnly, stylesFavorites]
  );

  // Filter scenes
  const filteredScenes = React.useMemo(
    () =>
      SCENES.filter((scene) => {
        const matchesSearch = scene.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = sceneCategory === 'all' || scene.category === sceneCategory;
        const matchesFavorites = !showFavoritesOnly || scenesFavorites.isFavorited(scene.id);
        return matchesSearch && matchesCategory && matchesFavorites;
      }),
    [search, sceneCategory, showFavoritesOnly, scenesFavorites]
  );

  // Filter lighting
  const filteredLighting = React.useMemo(
    () =>
      LIGHTING_SETTINGS.filter((light) => {
        const matchesSearch = light.name.toLowerCase().includes(search.toLowerCase());
        const matchesFavorites = !showFavoritesOnly || lightingFavorites.isFavorited(light.id);
        return matchesSearch && matchesFavorites;
      }),
    [search, showFavoritesOnly, lightingFavorites]
  );

  return {
    stylesFavorites,
    scenesFavorites,
    lightingFavorites,
    currentFavorites,
    filteredStyles,
    filteredScenes,
    filteredLighting,
  };
}

