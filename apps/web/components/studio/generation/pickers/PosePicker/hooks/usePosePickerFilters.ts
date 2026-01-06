'use client';

import * as React from 'react';
import { SFW_POSES, ADULT_POSES, POSE_CATEGORIES, type Pose } from '../../types';
import { useGalleryFavorites } from '../../../../../lib/hooks/use-gallery-favorites';

type PoseCategory = typeof POSE_CATEGORIES[number]['id'];

interface UsePosePickerFiltersOptions {
  nsfwEnabled: boolean;
}

export function usePosePickerFilters({ nsfwEnabled }: UsePosePickerFiltersOptions) {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<PoseCategory>('all');
  const [adultOnly, setAdultOnly] = React.useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);

  const { isFavorited } = useGalleryFavorites({
    itemType: 'pose',
  });

  // Filter poses based on Adult Content, category, adult filter, and favorites
  const availablePoses = React.useMemo(() => {
    let basePoses = nsfwEnabled ? [...SFW_POSES, ...ADULT_POSES] : SFW_POSES;

    // Filter for adult-only if enabled
    if (adultOnly && nsfwEnabled) {
      basePoses = ADULT_POSES;
    }

    return basePoses.filter((pose) => {
      const matchesSearch =
        pose.name.toLowerCase().includes(search.toLowerCase()) ||
        pose.prompt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || pose.category === category;
      const matchesFavorites = !showFavoritesOnly || isFavorited(pose.id);
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [nsfwEnabled, search, category, adultOnly, showFavoritesOnly, isFavorited]);

  // Count filtered adult poses for disclaimer
  const filteredAdultPoseCount = React.useMemo(() => {
    if (nsfwEnabled) return 0;

    const allAdultPoses = ADULT_POSES.filter((pose) => {
      const matchesSearch =
        pose.name.toLowerCase().includes(search.toLowerCase()) ||
        pose.prompt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || pose.category === category;
      return matchesSearch && matchesCategory;
    });

    return allAdultPoses.length;
  }, [nsfwEnabled, search, category]);

  return {
    search,
    setSearch,
    category,
    setCategory,
    adultOnly,
    setAdultOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,
    availablePoses,
    filteredAdultPoseCount,
  };
}

