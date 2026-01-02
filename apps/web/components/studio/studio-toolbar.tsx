'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';

import { AspectRatioPicker } from './generation/aspect-ratio-picker';
import { ASPECT_RATIOS } from './generation/types';
import type { AspectRatio } from './generation/types';

export type ViewMode = 'grid' | 'large' | 'masonry';
export type AspectRatioFilter = AspectRatio | 'all';
export type StatusFilter = 'all' | 'completed' | 'generating' | 'failed';
export type LikedFilter = 'all' | 'liked' | 'not-liked';
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
  sortBy,
  onSortByChange,
  selectedCount,
  onClearSelection,
  className,
}: StudioToolbarProps) {
  const [showAspectRatioPicker, setShowAspectRatioPicker] = React.useState(false);
  const aspectRatioButtonRef = React.useRef<HTMLButtonElement>(null);

  // Get display label for aspect ratio filter
  const getAspectRatioLabel = () => {
    if (aspectRatios.length === 0) {
      return 'All';
    }
    if (aspectRatios.length === 1) {
      return aspectRatios[0];
    }
    return `${aspectRatios.length} selected`;
  };

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 px-4 lg:px-6 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border-default)]', className)}>
      {/* Left - Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-1">
          {(['all', 'completed', 'generating', 'failed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                status === s
                  ? 'bg-[var(--purple-500)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              )}
            >
              {s === 'all' ? 'All' : s === 'completed' ? '✓ Done' : s === 'generating' ? '⟳ Gen' : '✕ Failed'}
            </button>
          ))}
        </div>

        {/* Aspect Ratio Filter - Dropdown */}
        <div className="relative">
          <button
            ref={aspectRatioButtonRef}
            onClick={() => setShowAspectRatioPicker(!showAspectRatioPicker)}
            className={cn(
              'flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-all',
              aspectRatios.length > 0
                ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/30'
                : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 border border-[var(--border-default)]'
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--purple-400)]">
              <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
            <span>{getAspectRatioLabel()}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--text-muted)]">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          {showAspectRatioPicker && (
            <AspectRatioPicker
              ratios={ASPECT_RATIOS}
              selectedRatio={aspectRatios[0] || '9:16'}
              selectedRatios={aspectRatios}
              multiple={true}
              onSelect={() => {}} // Not used in multiple mode
              onSelectMultiple={(ratios) => {
                onAspectRatioChange(ratios);
              }}
              onClose={() => setShowAspectRatioPicker(false)}
              anchorRef={aspectRatioButtonRef}
            />
          )}
        </div>

        {/* Liked Filter */}
        <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-1">
          {(['all', 'liked', 'not-liked'] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLikedChange(l)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5',
                liked === l
                  ? 'bg-[var(--purple-500)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              )}
            >
              {l === 'all' ? (
                'All'
              ) : l === 'liked' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                  </svg>
                  Liked
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                  </svg>
                  Not Liked
                </>
              )}
            </button>
          ))}
        </div>

        {/* Selection info */}
        {selectedCount > 0 && (
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
        )}
      </div>

      {/* Right - View Mode & Sort */}
      <div className="flex items-center gap-3">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
            className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--purple-500)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-500)]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-[var(--border-default)]" />

        {/* View Mode Toggle */}
        <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'rounded-lg p-2 transition-all',
              viewMode === 'grid'
                ? 'bg-[var(--purple-500)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
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
              'rounded-lg p-2 transition-all',
              viewMode === 'masonry'
                ? 'bg-[var(--purple-500)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
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
              'rounded-lg p-2 transition-all',
              viewMode === 'large'
                ? 'bg-[var(--purple-500)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
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

