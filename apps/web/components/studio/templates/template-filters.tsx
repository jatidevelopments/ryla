'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SCENE_OPTIONS, ENVIRONMENT_OPTIONS } from '@ryla/shared';

export interface TemplateFilters {
  category?: 'all' | 'my_templates' | 'curated' | 'popular';
  scene?: string;
  environment?: string;
  aspectRatio?: string;
  qualityMode?: 'draft' | 'hq';
  nsfw?: boolean;
}

export interface TemplateFiltersProps {
  filters: TemplateFilters;
  onFiltersChange: (filters: TemplateFilters) => void;
  influencerId?: string;
  collapsible?: boolean;
}

export function TemplateFilters({
  filters,
  onFiltersChange,
  influencerId,
  collapsible = false,
}: TemplateFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(!collapsible);

  const updateFilter = <K extends keyof TemplateFilters>(
    key: K,
    value: TemplateFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const content = (
    <div className="space-y-4">
      {/* Category Filter */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block">
          Category
        </label>
        <div className="space-y-1">
          {(['all', 'my_templates', 'curated', 'popular'] as const).map((category) => (
            <button
              key={category}
              onClick={() => updateFilter('category', category)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                filters.category === category
                  ? 'bg-[var(--purple-500)]/20 text-[var(--purple-400)] border border-[var(--purple-500)]/30'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] border border-transparent'
              )}
            >
              {category === 'all' && 'All Templates'}
              {category === 'my_templates' && 'My Templates'}
              {category === 'curated' && 'Curated'}
              {category === 'popular' && 'Popular'}
            </button>
          ))}
        </div>
      </div>

      {/* Scene Filter */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block">
          Scene
        </label>
        <select
          value={filters.scene || ''}
          onChange={(e) => updateFilter('scene', e.target.value || undefined)}
          className={cn(
            'w-full px-3 py-2 rounded-md text-sm',
            'bg-[var(--bg-surface)] border border-[var(--border-default)]',
            'text-[var(--text-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50'
          )}
        >
          <option value="">All Scenes</option>
          {SCENE_OPTIONS.map((scene) => (
            <option key={scene.value} value={scene.value}>
              {scene.label}
            </option>
          ))}
        </select>
      </div>

      {/* Environment Filter */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block">
          Environment
        </label>
        <select
          value={filters.environment || ''}
          onChange={(e) => updateFilter('environment', e.target.value || undefined)}
          className={cn(
            'w-full px-3 py-2 rounded-md text-sm',
            'bg-[var(--bg-surface)] border border-[var(--border-default)]',
            'text-[var(--text-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50'
          )}
        >
          <option value="">All Environments</option>
          {ENVIRONMENT_OPTIONS.map((env) => (
            <option key={env.value} value={env.value}>
              {env.label}
            </option>
          ))}
        </select>
      </div>

      {/* Aspect Ratio Filter */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block">
          Aspect Ratio
        </label>
        <select
          value={filters.aspectRatio || ''}
          onChange={(e) => updateFilter('aspectRatio', e.target.value || undefined)}
          className={cn(
            'w-full px-3 py-2 rounded-md text-sm',
            'bg-[var(--bg-surface)] border border-[var(--border-default)]',
            'text-[var(--text-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50'
          )}
        >
          <option value="">All Ratios</option>
          <option value="1:1">1:1 (Square)</option>
          <option value="9:16">9:16 (Portrait)</option>
          <option value="2:3">2:3 (Tall)</option>
        </select>
      </div>

      {/* Quality Filter */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block">
          Quality
        </label>
        <div className="space-y-1">
          {(['draft', 'hq'] as const).map((quality) => (
            <button
              key={quality}
              onClick={() => updateFilter('qualityMode', quality)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                filters.qualityMode === quality
                  ? 'bg-[var(--purple-500)]/20 text-[var(--purple-400)] border border-[var(--purple-500)]/30'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] border border-transparent'
              )}
            >
              {quality === 'draft' ? 'Draft' : 'High Quality'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <div className="border border-[var(--border-default)] rounded-lg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[var(--text-primary)]"
        >
          <span>Filters</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {isExpanded && <div className="px-4 pb-4">{content}</div>}
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-default)] rounded-lg p-4 bg-[var(--bg-surface)]">
      {content}
    </div>
  );
}

