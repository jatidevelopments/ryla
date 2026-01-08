'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import {
  StatusFilter as StatusFilterComponent,
  AspectRatioFilter as AspectRatioFilterComponent,
  LikedFilter as LikedFilterComponent,
  AdultFilter as AdultFilterComponent,
  SortDropdown,
  ViewModeToggle,
} from './toolbar';
import { MobileFilterSheet } from './toolbar/MobileFilterSheet';
import type { AspectRatio } from './generation/types';

export type ViewMode = 'grid' | 'large' | 'masonry';
export type AspectRatioFilter = AspectRatio | 'all';
export type StatusFilter = 'all' | 'completed' | 'generating' | 'failed';
export type LikedFilter = 'all' | 'liked' | 'not-liked';
export type AdultFilter = 'all' | 'adult' | 'not-adult';
export type SortBy = 'newest' | 'oldest';

interface StudioToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  aspectRatios: AspectRatio[];
  onAspectRatioChange: (ratios: AspectRatio[]) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  liked: LikedFilter;
  onLikedChange: (liked: LikedFilter) => void;
  adult: AdultFilter;
  onAdultChange: (adult: AdultFilter) => void;
  sortBy: SortBy;
  onSortByChange: (sort: SortBy) => void;
  selectedCount: number;
  onClearSelection?: () => void;
  className?: string;
}

export function StudioToolbar({
  viewMode,
  onViewModeChange,
  aspectRatios,
  onAspectRatioChange,
  status,
  onStatusChange,
  liked,
  onLikedChange,
  adult,
  onAdultChange,
  sortBy,
  onSortByChange,
  selectedCount,
  onClearSelection,
  className,
}: StudioToolbarProps) {
  const [showFilterSheet, setShowFilterSheet] = React.useState(false);

  // Count active filters for badge
  const activeFilters = [
    status !== 'all',
    liked !== 'all',
    adult !== 'all',
    aspectRatios.length > 0,
  ].filter(Boolean).length;

  return (
    <>
      {/* Mobile Toolbar - Compact single row */}
      <div
        className={cn(
          'flex md:hidden items-center justify-between gap-2 px-3 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border-default)]',
          className
        )}
      >
        {/* Sort dropdown - compact */}
        <div className="flex items-center gap-1.5 h-11 px-2 rounded-lg bg-white/5">
          <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
            className="bg-transparent text-sm text-white font-medium focus:outline-none pr-1"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Right side - Filter button + View toggle */}
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilterSheet(true)}
            className={cn(
              'flex items-center gap-1.5 px-4 min-h-[44px] rounded-lg text-sm font-medium transition-all',
              activeFilters > 0
                ? 'bg-[var(--purple-500)] text-white'
                : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
            )}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="hidden min-[380px]:inline">Filters</span>
            {activeFilters > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                {activeFilters}
              </span>
            )}
          </button>

          {/* View Mode - Compact */}
          <div className="flex rounded-lg bg-white/5 p-1">
            {(['grid', 'large'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={cn(
                  'p-2.5 rounded-md transition-all',
                  viewMode === mode
                    ? 'bg-[var(--purple-500)] text-white'
                    : 'text-[var(--text-secondary)]'
                )}
              >
                {mode === 'grid' ? (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Toolbar - Full filters */}
      <div
        className={cn(
          'hidden md:flex items-center justify-between gap-3 px-4 lg:px-6 py-2 bg-[var(--bg-elevated)] border-b border-[var(--border-default)]',
          className
        )}
      >
        {/* Left - Filter Pills */}
        <div className="flex items-center gap-3 overflow-x-auto scroll-hidden flex-shrink-0">
          <StatusFilterComponent
            status={status}
            onStatusChange={onStatusChange}
          />
          <AspectRatioFilterComponent
            aspectRatios={aspectRatios}
            onAspectRatioChange={onAspectRatioChange}
          />
          <LikedFilterComponent liked={liked} onLikedChange={onLikedChange} />
          <AdultFilterComponent adult={adult} onAdultChange={onAdultChange} />
        </div>

        {/* Right - View Mode & Sort */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <SortDropdown sortBy={sortBy} onSortByChange={onSortByChange} />
          <div className="h-5 w-px bg-[var(--border-default)]" />
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        status={status}
        onStatusChange={onStatusChange}
        liked={liked}
        onLikedChange={onLikedChange}
        adult={adult}
        onAdultChange={onAdultChange}
        aspectRatios={aspectRatios}
        onAspectRatioChange={onAspectRatioChange}
        sortBy={sortBy}
        onSortByChange={onSortByChange}
      />
    </>
  );
}
