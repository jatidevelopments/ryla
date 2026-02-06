'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { ChevronDown, ChevronUp, Tags } from 'lucide-react';

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  count?: number;
}

interface CategoryPillsProps {
  categories: Category[];
  selectedSlug: string | null;
  onChange: (slug: string | null) => void;
  isLoading?: boolean;
}

/**
 * CategoryPills - Expandable grid of category pills for filtering
 * Epic: EP-047 (Template Gallery UX Redesign)
 */
export function CategoryPills({
  categories,
  selectedSlug,
  onChange,
  isLoading = false,
}: CategoryPillsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Show first row (roughly 8 items) when collapsed
  const visibleCategories = isExpanded ? categories : categories.slice(0, 8);

  const handleCategoryClick = (slug: string | null) => {
    onChange(slug);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-9 w-20 rounded-xl bg-[var(--bg-subtle)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Mobile: Scrollable horizontal */}
      <div className="md:hidden overflow-x-auto scroll-hidden -mx-1 px-1">
        <div className="flex items-center gap-2 flex-nowrap min-w-max">
          {/* All pill */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-sm font-medium rounded-xl transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]',
              'flex-shrink-0 whitespace-nowrap',
              selectedSlug === null
                ? 'text-white bg-[var(--purple-500)] shadow-lg shadow-purple-500/25'
                : 'text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
            )}
          >
            All
          </button>

          {/* Category pills */}
          {visibleCategories.map((category) => {
            const isActive = selectedSlug === category.slug;

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-sm font-medium rounded-xl transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]',
                  'flex-shrink-0 whitespace-nowrap',
                  isActive
                    ? 'text-white bg-[var(--purple-500)] shadow-lg shadow-purple-500/25'
                    : 'text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                )}
              >
                {category.icon && <span className="text-base">{category.icon}</span>}
                <span>{category.name}</span>
                {category.count !== undefined && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'
                    )}
                  >
                    {category.count > 999 ? '999+' : category.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Show more / Show less button */}
          {categories.length > 8 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-sm font-medium rounded-xl transition-all duration-200',
                'text-[var(--purple-400)] bg-[var(--purple-500)]/10 border border-[var(--purple-500)]/30',
                'hover:bg-[var(--purple-500)]/20',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]',
                'flex-shrink-0 whitespace-nowrap'
              )}
            >
              <Tags className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isExpanded ? 'Show Less' : `All Tags (${categories.length})`}
              </span>
              <span className="sm:hidden">
                {isExpanded ? 'Less' : `All (${categories.length})`}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Desktop: Clean wrapped layout - no container (parent wraps) */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* All pill */}
        <button
          onClick={() => handleCategoryClick(null)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]',
            selectedSlug === null
              ? 'text-white bg-[var(--purple-500)] shadow-lg shadow-purple-500/25'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
          )}
        >
          All
        </button>

        {/* Category pills */}
        {visibleCategories.map((category) => {
          const isActive = selectedSlug === category.slug;

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]',
                isActive
                  ? 'text-white bg-[var(--purple-500)] shadow-lg shadow-purple-500/25'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              )}
            >
              {category.icon && <span className="text-base">{category.icon}</span>}
              <span>{category.name}</span>
              {category.count !== undefined && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'
                  )}
                >
                  {category.count > 999 ? '999+' : category.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Show more / Show less button */}
        {categories.length > 8 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200',
              'text-[var(--purple-400)] bg-[var(--purple-500)]/10 border border-[var(--purple-500)]/30',
              'hover:bg-[var(--purple-500)]/20',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]'
            )}
          >
            <Tags className="h-4 w-4" />
            {isExpanded ? 'Show Less' : `All Tags (${categories.length})`}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
