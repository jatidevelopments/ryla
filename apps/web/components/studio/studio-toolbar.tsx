'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import {
  StatusFilter,
  AspectRatioFilter,
  LikedFilter,
  AdultFilter,
  SortDropdown,
  ViewModeToggle,
} from './toolbar';
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
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 px-4 lg:px-6 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border-default)]',
        className
      )}
    >
      {/* Left - Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusFilter status={status} onStatusChange={onStatusChange} />
        <AspectRatioFilter
          aspectRatios={aspectRatios}
          onAspectRatioChange={onAspectRatioChange}
        />
        <LikedFilter liked={liked} onLikedChange={onLikedChange} />
        <AdultFilter adult={adult} onAdultChange={onAdultChange} />

        {/* Selection info - Temporarily disabled */}
        {/* {selectedCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-[var(--purple-500)]/20 border border-[var(--purple-500)]/50 px-3 py-2">
            <span className="text-xs font-medium text-[var(--text-primary)]">
              {selectedCount} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Clear
            </button>
          </div>
        )} */}
      </div>

      {/* Right - View Mode & Sort */}
      <div className="flex items-center gap-3">
        <SortDropdown sortBy={sortBy} onSortByChange={onSortByChange} />

        {/* Divider */}
        <div className="h-5 w-px bg-[var(--border-default)]" />

        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </div>
    </div>
  );
}

