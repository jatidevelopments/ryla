'use client';

import { cn } from '@ryla/ui';
import { POSE_CATEGORIES } from '../../types';

type PoseCategory = typeof POSE_CATEGORIES[number]['id'];

interface PosePickerFiltersProps {
  category: PoseCategory;
  onCategoryChange: (category: PoseCategory) => void;
  nsfwEnabled: boolean;
  adultOnly: boolean;
  onAdultOnlyToggle: () => void;
  filteredAdultPoseCount: number;
}

export function PosePickerFilters({
  category,
  onCategoryChange,
  nsfwEnabled,
  adultOnly,
  onAdultOnlyToggle,
  filteredAdultPoseCount,
}: PosePickerFiltersProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/5">
      <div className="flex items-center gap-3 px-6 py-5 overflow-x-auto scroll-hidden">
        {POSE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id as PoseCategory)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              category === cat.id
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            )}
          >
            {cat.label}
          </button>
        ))}

        {/* 18+ Filter - Only show if Adult Content is enabled */}
        {nsfwEnabled && (
          <>
            <div className="h-6 w-px bg-white/10" />
            <button
              onClick={onAdultOnlyToggle}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2',
                adultOnly
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <span>18+ Only</span>
            </button>
          </>
        )}
      </div>

      {/* Disclaimer when NSFW poses are filtered */}
      {!nsfwEnabled && filteredAdultPoseCount > 0 && (
        <div className="px-6 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-orange-400 flex-shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-orange-300">
              {filteredAdultPoseCount} adult pose{filteredAdultPoseCount !== 1 ? 's' : ''} filtered
              because adult content is disabled
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

