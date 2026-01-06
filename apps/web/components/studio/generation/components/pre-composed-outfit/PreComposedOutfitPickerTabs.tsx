'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { OUTFIT_CATEGORIES, type OutfitCategory } from '@ryla/shared';

const CATEGORY_LABELS: Record<OutfitCategory, string> = {
  casual: 'Casual',
  glamour: 'Glamour',
  intimate: 'Intimate',
  fantasy: 'Fantasy',
  kinky: 'Kinky',
  sexual: 'Sexual',
};

interface PreComposedOutfitPickerTabsProps {
  category: OutfitCategory | 'all';
  onCategoryChange: (category: OutfitCategory | 'all') => void;
  nsfwEnabled?: boolean;
}

export function PreComposedOutfitPickerTabs({
  category,
  onCategoryChange,
  nsfwEnabled = false,
}: PreComposedOutfitPickerTabsProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 overflow-x-auto scroll-hidden">
      <button
        onClick={() => onCategoryChange('all')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
          category === 'all'
            ? 'bg-white text-black'
            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
        )}
      >
        All
      </button>
      {OUTFIT_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            category === cat
              ? 'bg-white text-black'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          )}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}

      {/* Adult Content Badge - Show if Adult Content is enabled */}
      {nsfwEnabled && (
        <>
          <div className="h-6 w-px bg-white/10" />
          <div className="px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-orange-400"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium text-orange-400">
              Adult Content Enabled
            </span>
          </div>
        </>
      )}
    </div>
  );
}

