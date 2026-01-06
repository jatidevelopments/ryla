'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { STYLE_CATEGORIES, SCENE_CATEGORIES, type StyleCategory, type SceneCategory } from '../../types';

interface StyleCategoryFiltersProps {
  activeCategory: StyleCategory;
  onCategoryChange: (category: StyleCategory) => void;
}

export function StyleCategoryFilters({ activeCategory, onCategoryChange }: StyleCategoryFiltersProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 overflow-x-auto scroll-hidden">
      {STYLE_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            activeCategory === cat.id
              ? 'bg-white text-black'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

interface SceneCategoryFiltersProps {
  activeCategory: SceneCategory | 'all';
  onCategoryChange: (category: SceneCategory | 'all') => void;
}

export function SceneCategoryFilters({ activeCategory, onCategoryChange }: SceneCategoryFiltersProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 overflow-x-auto scroll-hidden">
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
      {SCENE_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            activeCategory === cat.id
              ? 'bg-white text-black'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

