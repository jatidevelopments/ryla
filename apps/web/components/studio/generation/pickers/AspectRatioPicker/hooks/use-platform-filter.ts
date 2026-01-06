'use client';

import * as React from 'react';
import type { PlatformId } from '@ryla/shared';
import type { AspectRatioOption } from '../../../types';

const STORAGE_KEY = 'ryla-aspect-ratio-platform-filter';

interface UsePlatformFilterOptions {
  ratios: AspectRatioOption[];
}

/**
 * Hook for managing platform filter state and filtering ratios
 */
export function usePlatformFilter({ ratios }: UsePlatformFilterOptions) {
  // Get all unique platforms from all ratios
  const allPlatforms = React.useMemo(() => {
    const platformSet = new Set<PlatformId>();
    ratios.forEach(ratio => {
      ratio.platforms?.forEach(platformId => platformSet.add(platformId));
    });
    return Array.from(platformSet);
  }, [ratios]);

  // Load from localStorage on mount
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<PlatformId[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PlatformId[];
        // Compute available platforms for validation
        const platformSet = new Set<PlatformId>();
        ratios.forEach(ratio => {
          ratio.platforms?.forEach(platformId => platformSet.add(platformId));
        });
        const availablePlatforms = Array.from(platformSet);
        // Validate that all stored platforms are still valid
        return parsed.filter(id => availablePlatforms.includes(id));
      }
    } catch (error) {
      console.warn('Failed to load platform filter from localStorage:', error);
    }
    return [];
  });

  // Save to localStorage whenever selection changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (selectedPlatforms.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPlatforms));
      }
    } catch (error) {
      console.warn('Failed to save platform filter to localStorage:', error);
    }
  }, [selectedPlatforms]);

  // Filter and sort ratios based on selected platforms
  const filteredRatios = React.useMemo(() => {
    if (selectedPlatforms.length === 0) {
      return ratios;
    }

    // Show ratios that support ANY of the selected platforms
    return ratios.filter(ratio => 
      ratio.platforms?.some(platformId => selectedPlatforms.includes(platformId))
    );
  }, [ratios, selectedPlatforms]);

  const togglePlatform = React.useCallback((platformId: PlatformId) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(id => id !== platformId);
      }
      return [...prev, platformId];
    });
  }, []);

  const clearFilter = React.useCallback(() => {
    setSelectedPlatforms([]);
  }, []);

  return {
    allPlatforms,
    selectedPlatforms,
    filteredRatios,
    togglePlatform,
    clearFilter,
  };
}

