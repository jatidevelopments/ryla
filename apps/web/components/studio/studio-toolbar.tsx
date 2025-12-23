'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';

export type ViewMode = 'grid' | 'large' | 'masonry';
export type AspectRatioFilter = 'all' | '1:1' | '9:16' | '2:3';
export type StatusFilter = 'all' | 'completed' | 'generating' | 'failed';
export type SortBy = 'newest' | 'oldest';

interface StudioToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  aspectRatio: AspectRatioFilter;
  onAspectRatioChange: (ratio: AspectRatioFilter) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sortBy: SortBy;
  onSortByChange: (sort: SortBy) => void;
  selectedCount: number;
  onClearSelection?: () => void;
  className?: string;
}

export function StudioToolbar({
  viewMode,
  onViewModeChange,
  aspectRatio,
  onAspectRatioChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  selectedCount,
  onClearSelection,
  className,
}: StudioToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#111113] border-b border-white/10', className)}>
      {/* Left - Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
          {(['all', 'completed', 'generating', 'failed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                status === s
                  ? 'bg-[var(--purple-500)] text-white'
                  : 'text-white/50 hover:text-white'
              )}
            >
              {s === 'all' ? 'All' : s === 'completed' ? '✓ Done' : s === 'generating' ? '⟳ Gen' : '✕ Failed'}
            </button>
          ))}
        </div>

        {/* Aspect Ratio Filter */}
        <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
          {(['all', '1:1', '9:16', '2:3'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => onAspectRatioChange(ratio)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1',
                aspectRatio === ratio
                  ? 'bg-[var(--purple-500)] text-white'
                  : 'text-white/50 hover:text-white'
              )}
            >
              {ratio === 'all' ? (
                'All'
              ) : ratio === '1:1' ? (
                <>
                  <div className="h-3 w-3 border border-current rounded-sm" />
                  1:1
                </>
              ) : ratio === '9:16' ? (
                <>
                  <div className="h-4 w-2.5 border border-current rounded-sm" />
                  9:16
                </>
              ) : (
                <>
                  <div className="h-4 w-3 border border-current rounded-sm" />
                  2:3
                </>
              )}
            </button>
          ))}
        </div>

        {/* Selection info */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-[var(--purple-500)]/20 border border-[var(--purple-500)]/50 px-3 py-1.5">
            <span className="text-xs font-medium text-white">
              {selectedCount} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-xs text-white/50 hover:text-white"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Right - View Mode & Sort */}
      <div className="flex items-center gap-3">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:border-[var(--purple-500)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-500)]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-white/10" />

        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'rounded-md p-1.5 transition-all',
              viewMode === 'grid'
                ? 'bg-[var(--purple-500)] text-white'
                : 'text-white/50 hover:text-white'
            )}
            title="Grid View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('masonry')}
            className={cn(
              'rounded-md p-1.5 transition-all',
              viewMode === 'masonry'
                ? 'bg-[var(--purple-500)] text-white'
                : 'text-white/50 hover:text-white'
            )}
            title="Masonry View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M2 4.25A2.25 2.25 0 014.25 2h2.5A2.25 2.25 0 019 4.25v1.5A2.25 2.25 0 016.75 8h-2.5A2.25 2.25 0 012 5.75v-1.5z" />
              <path d="M2 13.25A2.25 2.25 0 014.25 11h2.5A2.25 2.25 0 019 13.25v2.5A2.25 2.25 0 016.75 18h-2.5A2.25 2.25 0 012 15.75v-2.5z" />
              <path d="M11 4.25A2.25 2.25 0 0113.25 2h2.5A2.25 2.25 0 0118 4.25v4.5A2.25 2.25 0 0115.75 11h-2.5A2.25 2.25 0 0111 8.75v-4.5z" />
              <path d="M11 13.25A2.25 2.25 0 0113.25 11h2.5A2.25 2.25 0 0118 13.25v2.5A2.25 2.25 0 0115.75 18h-2.5A2.25 2.25 0 0111 15.75v-2.5z" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('large')}
            className={cn(
              'rounded-md p-1.5 transition-all',
              viewMode === 'large'
                ? 'bg-[var(--purple-500)] text-white'
                : 'text-white/50 hover:text-white'
            )}
            title="Large View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M1 4.75A2.75 2.75 0 013.75 2h12.5A2.75 2.75 0 0119 4.75v10.5A2.75 2.75 0 0116.25 18H3.75A2.75 2.75 0 011 15.25V4.75zm2.75-1.25a1.25 1.25 0 00-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25V4.75c0-.69-.56-1.25-1.25-1.25H3.75z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

