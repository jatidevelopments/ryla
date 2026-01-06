'use client';

import { Star } from 'lucide-react';
import { cn } from '@ryla/ui';
import { OutfitPieceCategory, OUTFIT_PIECE_CATEGORIES } from '@ryla/shared';

const CATEGORY_LABELS: Record<OutfitPieceCategory, string> = {
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
  headwear: 'Headwear',
  outerwear: 'Outerwear',
  accessory: 'Accessories',
};

interface OutfitPickerCategoriesProps {
  activeCategory: OutfitPieceCategory | 'all' | 'presets';
  onCategoryChange: (category: OutfitPieceCategory | 'all' | 'presets') => void;
  presetsCount: number;
  influencerId?: string;
  nsfwEnabled?: boolean;
}

export function OutfitPickerCategories({
  activeCategory,
  onCategoryChange,
  presetsCount,
  influencerId,
  nsfwEnabled = false,
}: OutfitPickerCategoriesProps) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b border-white/10 overflow-x-auto scroll-hidden">
      <button
        onClick={() => onCategoryChange('all')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
          activeCategory === 'all'
            ? 'bg-white text-black'
            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
        )}
      >
        All
      </button>
      {OUTFIT_PIECE_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            activeCategory === cat
              ? 'bg-white text-black'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          )}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
      {influencerId && (
        <>
          <div className="h-6 w-px bg-white/10" />
          <button
            onClick={() => onCategoryChange('presets')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2',
              activeCategory === 'presets'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            )}
          >
            <Star className="h-3.5 w-3.5" />
            Saved ({presetsCount})
          </button>
        </>
      )}

      {/* Adult Content Badge */}
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
            <span className="text-xs font-medium text-orange-400">Adult Content Enabled</span>
          </div>
        </>
      )}
    </div>
  );
}

