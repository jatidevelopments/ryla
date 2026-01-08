'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import type { AspectRatio } from '../generation/types';
import type {
  StatusFilter,
  LikedFilter,
  AdultFilter,
  SortBy,
} from '../studio-toolbar';
import { PickerDrawer } from '../generation/pickers/PickerDrawer';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // Filter state
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  liked: LikedFilter;
  onLikedChange: (liked: LikedFilter) => void;
  adult: AdultFilter;
  onAdultChange: (adult: AdultFilter) => void;
  aspectRatios: AspectRatio[];
  onAspectRatioChange: (ratios: AspectRatio[]) => void;
  sortBy: SortBy;
  onSortByChange: (sort: SortBy) => void;
}

const STATUS_OPTIONS: StatusFilter[] = [
  'all',
  'completed',
  'generating',
  'failed',
];
const LIKED_OPTIONS: LikedFilter[] = ['all', 'liked', 'not-liked'];
const ADULT_OPTIONS: AdultFilter[] = ['all', 'adult', 'not-adult'];

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'All',
  completed: 'Done',
  generating: 'Generating',
  failed: 'Failed',
};

const LIKED_LABELS: Record<LikedFilter, string> = {
  all: 'All',
  liked: 'Liked',
  'not-liked': 'Not Liked',
};

const ADULT_LABELS: Record<AdultFilter, string> = {
  all: 'All',
  adult: 'Adult',
  'not-adult': 'Safe',
};

export function MobileFilterSheet({
  isOpen,
  onClose,
  status,
  onStatusChange,
  liked,
  onLikedChange,
  adult,
  onAdultChange,
  aspectRatios,
  onAspectRatioChange,
  sortBy,
  onSortByChange,
}: MobileFilterSheetProps) {
  // Count active filters
  const activeFilters = [
    status !== 'all',
    liked !== 'all',
    adult !== 'all',
    aspectRatios.length > 0,
  ].filter(Boolean).length;

  const handleReset = () => {
    onStatusChange('all');
    onLikedChange('all');
    onAdultChange('all');
    onAspectRatioChange([]);
    onSortByChange('newest');
  };

  return (
    <PickerDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      className="flex flex-col h-full"
    >
      {/* Header Action - Reset Button (Absolute positioned or in header if we had access) */}
      <div className="absolute right-14 top-[15px] z-10">
        {activeFilters > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-[var(--purple-400)] font-medium px-2 py-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="p-4 space-y-6 pb-24">
        {/* Sort */}
        <div>
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 block opacity-60">
            Sort By
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['newest', 'oldest'] as SortBy[]).map((option) => (
              <button
                key={option}
                onClick={() => onSortByChange(option)}
                className={cn(
                  'py-3 px-4 rounded-xl text-sm font-medium transition-all border',
                  sortBy === option
                    ? 'border-[var(--purple-500)] bg-[var(--purple-500)]/10 text-white'
                    : 'border-white/5 bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                )}
              >
                {option === 'newest' ? 'Newest First' : 'Oldest First'}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 block opacity-60">
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => onStatusChange(option)}
                className={cn(
                  'py-3 px-4 rounded-xl text-sm font-medium transition-all border',
                  status === option
                    ? 'border-[var(--purple-500)] bg-[var(--purple-500)]/10 text-white'
                    : 'border-white/5 bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                )}
              >
                {STATUS_LABELS[option]}
              </button>
            ))}
          </div>
        </div>

        {/* Liked */}
        <div>
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 block opacity-60">
            Liked
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LIKED_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => onLikedChange(option)}
                className={cn(
                  'py-3 px-2 rounded-xl text-sm font-medium transition-all border',
                  liked === option
                    ? 'border-[var(--purple-500)] bg-[var(--purple-500)]/10 text-white'
                    : 'border-white/5 bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                )}
              >
                {LIKED_LABELS[option]}
              </button>
            ))}
          </div>
        </div>

        {/* Adult Content */}
        <div>
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 block opacity-60">
            Content Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ADULT_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => onAdultChange(option)}
                className={cn(
                  'py-3 px-2 rounded-xl text-sm font-medium transition-all border',
                  adult === option
                    ? 'border-[var(--purple-500)] bg-[var(--purple-500)]/10 text-white'
                    : 'border-white/5 bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                )}
              >
                {ADULT_LABELS[option]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Button - Sticky Footer */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg-elevated)] via-[var(--bg-elevated)] to-[var(--bg-elevated)]/0 pt-8 mt-auto border-t border-white/5">
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-[var(--purple-500)] text-white font-bold text-base shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
        >
          Apply Filters
          {activeFilters > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {activeFilters}
            </span>
          )}
        </button>
      </div>
    </PickerDrawer>
  );
}
