'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// EP-047: Updated types for new gallery UX
export type TabType = 'templates' | 'sets' | 'all';
export type SortOption = 'popular' | 'trending' | 'new' | 'recent';
export type ContentType = 'all' | 'image' | 'video' | 'lip_sync' | 'audio' | 'mixed';
export type ViewMode = 'grid' | 'compact' | 'list';

// Legacy types for backwards compatibility
export type TemplateCategory = 'all' | 'my_templates' | 'curated' | 'popular';
export type SortBy = 'newest' | 'popular' | 'name';

export interface TemplateFilters {
  // New EP-047 filters
  tabType: TabType;
  sortOption: SortOption;
  contentType: ContentType;
  categorySlug: string | null;
  
  // Legacy filters (kept for backwards compatibility)
  category: TemplateCategory;
  scene: string | undefined;
  environment: string | undefined;
  aspectRatio: string | undefined;
  nsfw: boolean | undefined;
}

/**
 * useTemplateFilters - Hook for managing template gallery filters
 * Epic: EP-047 (Template Gallery UX Redesign)
 * 
 * Supports both new and legacy filter patterns for backwards compatibility.
 */
export function useTemplateFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [filters, setFilters] = useState<TemplateFilters>(() => ({
    // New EP-047 filters
    tabType: (searchParams.get('type') as TabType) || 'all',
    sortOption: (searchParams.get('sort') as SortOption) || 'popular',
    contentType: (searchParams.get('contentType') as ContentType) || 'all',
    categorySlug: searchParams.get('category') || null,
    
    // Legacy filters
    category: 'all',
    scene: undefined,
    environment: undefined,
    aspectRatio: undefined,
    nsfw: undefined,
  }));

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('newest'); // Legacy

  // Sync URL with filter state
  const updateURL = useCallback((newFilters: Partial<TemplateFilters>, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update EP-047 params
    if (newFilters.tabType !== undefined) {
      if (newFilters.tabType === 'all') {
        params.delete('type');
      } else {
        params.set('type', newFilters.tabType);
      }
    }
    
    if (newFilters.sortOption !== undefined) {
      if (newFilters.sortOption === 'popular') {
        params.delete('sort');
      } else {
        params.set('sort', newFilters.sortOption);
      }
    }
    
    if (newFilters.contentType !== undefined) {
      if (newFilters.contentType === 'all') {
        params.delete('contentType');
      } else {
        params.set('contentType', newFilters.contentType);
      }
    }
    
    if (newFilters.categorySlug !== undefined) {
      if (newFilters.categorySlug === null) {
        params.delete('category');
      } else {
        params.set('category', newFilters.categorySlug);
      }
    }
    
    // Update search
    if (newSearch !== undefined) {
      if (newSearch === '') {
        params.delete('q');
      } else {
        params.set('q', newSearch);
      }
    }
    
    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router, pathname, searchParams]);

  // EP-047: New filter setters
  const setTabType = useCallback((value: TabType) => {
    setFilters(prev => ({ ...prev, tabType: value }));
    updateURL({ tabType: value });
  }, [updateURL]);

  const setSortOption = useCallback((value: SortOption) => {
    setFilters(prev => ({ ...prev, sortOption: value }));
    updateURL({ sortOption: value });
  }, [updateURL]);

  const setContentType = useCallback((value: ContentType) => {
    setFilters(prev => ({ ...prev, contentType: value }));
    updateURL({ contentType: value });
  }, [updateURL]);

  const setCategorySlug = useCallback((value: string | null) => {
    setFilters(prev => ({ ...prev, categorySlug: value }));
    updateURL({ categorySlug: value });
  }, [updateURL]);

  // Legacy: Update a single filter
  const updateFilter = useCallback(
    <K extends keyof TemplateFilters>(key: K, value: TemplateFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // Reset all filters to defaults
  const resetFilters = useCallback(() => {
    setFilters({
      tabType: 'all',
      sortOption: 'popular',
      contentType: 'all',
      categorySlug: null,
      category: 'all',
      scene: undefined,
      environment: undefined,
      aspectRatio: undefined,
      nsfw: undefined,
    });
    setSearchQuery('');
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Update search with debounce consideration
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    // Note: Could add debounce here for URL update
    updateURL({}, value);
  }, [updateURL]);

  return {
    // EP-047: New filter state and setters
    filters,
    tabType: filters.tabType,
    sortOption: filters.sortOption,
    contentType: filters.contentType,
    categorySlug: filters.categorySlug,
    setTabType,
    setSortOption,
    setContentType,
    setCategorySlug,
    
    // Legacy exports for backwards compatibility
    searchQuery,
    viewMode,
    sortBy,
    updateFilter,
    setSearchQuery: handleSearchChange,
    setViewMode,
    setSortBy,
    resetFilters,
  };
}
