'use client';

import { useState, useCallback } from 'react';

export type TemplateCategory = 'all' | 'my_templates' | 'curated' | 'popular';
export type ViewMode = 'grid' | 'compact' | 'list';
export type SortBy = 'newest' | 'popular' | 'name';

export interface TemplateFilters {
  category: TemplateCategory;
  scene: string | undefined;
  environment: string | undefined;
  aspectRatio: string | undefined;
  qualityMode: 'draft' | 'hq' | undefined;
  nsfw: boolean | undefined;
}

export function useTemplateFilters() {
  const [filters, setFilters] = useState<TemplateFilters>({
    category: 'all',
    scene: undefined,
    environment: undefined,
    aspectRatio: undefined,
    qualityMode: undefined,
    nsfw: undefined,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  const updateFilter = useCallback(
    <K extends keyof TemplateFilters>(key: K, value: TemplateFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      category: 'all',
      scene: undefined,
      environment: undefined,
      aspectRatio: undefined,
      qualityMode: undefined,
      nsfw: undefined,
    });
    setSearchQuery('');
  }, []);

  return {
    filters,
    searchQuery,
    viewMode,
    sortBy,
    updateFilter,
    setSearchQuery,
    setViewMode,
    setSortBy,
    resetFilters,
  };
}

