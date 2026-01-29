'use client';

import * as React from 'react';
import { useLocalStorage } from './use-local-storage';
import type { StudioImage } from '../../components/studio/studio-image-card';
import type {
  ViewMode,
  AspectRatioFilter,
  StatusFilter,
  LikedFilter,
  AdultFilter,
  SortBy,
} from '../../components/studio';
import type { AspectRatio } from '../../components/studio/generation';

interface UseStudioFiltersReturn {
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Aspect ratio filter (multi-select)
  aspectRatios: AspectRatio[];
  setAspectRatios: (ratios: AspectRatio[] | ((prev: AspectRatio[]) => AspectRatio[])) => void;

  // Status filter
  status: StatusFilter;
  setStatus: (status: StatusFilter) => void;

  // Liked filter
  liked: LikedFilter;
  setLiked: (liked: LikedFilter) => void;

  // Adult content filter
  adult: AdultFilter;
  setAdult: (adult: AdultFilter) => void;

  // Sort order
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Panel visibility
  showPanel: boolean;
  setShowPanel: (show: boolean) => void;

  // Filter images
  filterImages: (images: StudioImage[]) => StudioImage[];

  // Reset all filters
  resetFilters: () => void;
}

export function useStudioFilters(): UseStudioFiltersReturn {
  // Search query - not persisted, always start fresh
  const [searchQuery, setSearchQuery] = React.useState('');

  // View mode
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    'ryla-gallery-view-mode',
    'grid'
  );

  // Handle migration from old single value format to array format for aspect ratios
  const [aspectRatioRaw, setAspectRatioRaw] = useLocalStorage<
    AspectRatioFilter | AspectRatio[]
  >('ryla-gallery-aspect-ratio', 'all');

  // Migrate old format to new format
  const aspectRatios = React.useMemo(() => {
    if (typeof aspectRatioRaw === 'string') {
      // Old format - migrate to array
      const migrated =
        aspectRatioRaw === 'all' ? [] : [aspectRatioRaw as AspectRatio];
      return migrated;
    }
    if (Array.isArray(aspectRatioRaw)) {
      return aspectRatioRaw;
    }
    return [];
  }, [aspectRatioRaw]);

  // Migrate old format to new format (moved from useMemo to useEffect to avoid side effects)
  React.useEffect(() => {
    if (typeof aspectRatioRaw === 'string') {
      // Old format - migrate to array
      const migrated =
        aspectRatioRaw === 'all' ? [] : [aspectRatioRaw as AspectRatio];
      setAspectRatioRaw(migrated);
    }
  }, [aspectRatioRaw, setAspectRatioRaw]);

  const setAspectRatios = React.useCallback(
    (value: AspectRatio[] | ((val: AspectRatio[]) => AspectRatio[])) => {
      setAspectRatioRaw(value as AspectRatioFilter | AspectRatio[]);
    },
    [setAspectRatioRaw]
  );

  // Other filters
  const [status, setStatus] = useLocalStorage<StatusFilter>(
    'ryla-gallery-status',
    'all'
  );
  const [liked, setLiked] = useLocalStorage<LikedFilter>(
    'ryla-gallery-liked',
    'all'
  );
  const [adult, setAdult] = useLocalStorage<AdultFilter>(
    'ryla-gallery-adult',
    'all'
  );
  const [sortBy, setSortBy] = useLocalStorage<SortBy>(
    'ryla-gallery-sort-by',
    'newest'
  );

  // Panel visibility
  const [showPanel, setShowPanel] = useLocalStorage(
    'ryla-gallery-show-panel',
    true
  );

  // Filter images
  const filterImages = React.useCallback(
    (images: StudioImage[]): StudioImage[] => {
      let filtered = [...images];

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (img) =>
            img.prompt?.toLowerCase().includes(query) ||
            img.influencerName?.toLowerCase().includes(query) ||
            img.scene?.toLowerCase().includes(query) ||
            img.environment?.toLowerCase().includes(query)
        );
      }

      // Aspect ratio filter
      if (aspectRatios.length > 0) {
        filtered = filtered.filter((img) =>
          aspectRatios.includes(img.aspectRatio as AspectRatio)
        );
      }

      // Status filter
      if (status !== 'all') {
        filtered = filtered.filter((img) => img.status === status);
      }

      // Liked filter
      if (liked === 'liked') {
        filtered = filtered.filter((img) => img.isLiked);
      } else if (liked === 'not-liked') {
        filtered = filtered.filter((img) => !img.isLiked);
      }

      // Adult content filter
      if (adult === 'not-adult') {
        filtered = filtered.filter((img) => !img.nsfw);
      } else if (adult === 'adult') {
        filtered = filtered.filter((img) => img.nsfw);
      }

      // Sorting
      filtered.sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });

      return filtered;
    },
    [searchQuery, aspectRatios, status, liked, adult, sortBy]
  );

  // Reset all filters
  const resetFilters = React.useCallback(() => {
    setSearchQuery('');
    setAspectRatios([]);
    setStatus('all');
    setLiked('all');
    setAdult('all');
    setSortBy('newest');
  }, [setAspectRatios, setStatus, setLiked, setAdult, setSortBy]);

  return {
    viewMode,
    setViewMode,
    aspectRatios,
    setAspectRatios,
    status,
    setStatus,
    liked,
    setLiked,
    adult,
    setAdult,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    showPanel,
    setShowPanel,
    filterImages,
    resetFilters,
  };
}

