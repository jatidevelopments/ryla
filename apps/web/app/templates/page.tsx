'use client';

import * as React from 'react';
import { PageContainer, FadeInUp } from '@ryla/ui';
import { ProtectedRoute } from '../../components/protected-route';
import { TemplateSearch } from '../../components/studio/templates/template-search';
import { TemplateGrid } from '../../components/studio/templates/template-grid';
import { TemplateDetailModal } from '../../components/studio/templates/template-detail-modal';
import { trpc } from '../../lib/trpc';
import { useRouter } from 'next/navigation';
import { ChevronDown, Grid3X3, LayoutGrid, Rows } from 'lucide-react';
import { cn } from '@ryla/ui';
import { SCENE_OPTIONS, ENVIRONMENT_OPTIONS } from '@ryla/shared';

// Filter Pill Button Component
function FilterPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
        selected
          ? 'bg-[var(--purple-500)] text-white'
          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)]'
      )}
    >
      {label}
    </button>
  );
}

// Dropdown Select Component
function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: { value: string; label: string; emoji?: string }[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className={cn(
          'appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm font-medium',
          'bg-[var(--bg-surface)] border border-[var(--border-default)]',
          'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50',
          'cursor-pointer'
        )}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.emoji ? `${opt.emoji} ${opt.label}` : opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
    </div>
  );
}

function TemplatesContent() {
  const router = useRouter();
  const [filters, setFilters] = React.useState({
    category: 'all' as 'all' | 'my_templates' | 'curated' | 'popular',
    scene: undefined as string | undefined,
    environment: undefined as string | undefined,
    aspectRatio: undefined as string | undefined,
    qualityMode: undefined as 'draft' | 'hq' | undefined,
    nsfw: undefined as boolean | undefined,
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'compact' | 'list'>('grid');
  const [sortBy, setSortBy] = React.useState<'newest' | 'popular' | 'name'>('newest');

  const { data, isLoading, error } = trpc.templates.list.useQuery({
    category: filters.category,
    scene: filters.scene,
    environment: filters.environment,
    aspectRatio: filters.aspectRatio,
    qualityMode: filters.qualityMode,
    nsfw: filters.nsfw,
    search: searchQuery || undefined,
    page: 1,
    limit: 24,
  });

  const handleTemplateClick = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleTemplateApply = (templateId: string) => {
    router.push(`/studio?template=${templateId}`);
  };

  const updateFilter = <K extends keyof typeof filters>(
    key: K,
    value: typeof filters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <PageContainer maxWidth="full" className="relative">
      {/* Background gradient effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 right-0 h-[500px] w-[500px] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Header */}
      <FadeInUp>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Template Gallery
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Discover and reuse successful generation configurations
          </p>
        </div>
      </FadeInUp>

      {/* Filter Bar - Row 1: Category tabs + Search */}
      <FadeInUp delay={100}>
        <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-[var(--border-default)]">
          {/* Category Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <FilterPill
              label="All"
              selected={filters.category === 'all'}
              onClick={() => updateFilter('category', 'all')}
            />
            <FilterPill
              label="My Templates"
              selected={filters.category === 'my_templates'}
              onClick={() => updateFilter('category', 'my_templates')}
            />
            <FilterPill
              label="⭐ Curated"
              selected={filters.category === 'curated'}
              onClick={() => updateFilter('category', 'curated')}
            />
            <FilterPill
              label="🔥 Popular"
              selected={filters.category === 'popular'}
              onClick={() => updateFilter('category', 'popular')}
            />
          </div>

          {/* Search - pushed to right */}
          <div className="ml-auto w-full sm:w-auto sm:min-w-[250px]">
            <TemplateSearch
              query={searchQuery}
              onQueryChange={setSearchQuery}
              placeholder="Search templates..."
            />
          </div>
        </div>
      </FadeInUp>

      {/* Filter Bar - Row 2: Filters + Sort + View */}
      <FadeInUp delay={150}>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Scene Filter Dropdown */}
          <FilterDropdown
            label="🎬 Scene"
            value={filters.scene}
            options={SCENE_OPTIONS.map((s) => ({ value: s.value, label: s.label, emoji: s.emoji }))}
            onChange={(v) => updateFilter('scene', v)}
          />

          {/* Environment Filter Dropdown */}
          <FilterDropdown
            label="📍 Environment"
            value={filters.environment}
            options={ENVIRONMENT_OPTIONS.map((e) => ({ value: e.value, label: e.label, emoji: e.emoji }))}
            onChange={(v) => updateFilter('environment', v)}
          />

          {/* Aspect Ratio Pills */}
          <div className="flex items-center gap-1 border-l border-[var(--border-default)] pl-3">
            <FilterPill
              label="All"
              selected={!filters.aspectRatio}
              onClick={() => updateFilter('aspectRatio', undefined)}
            />
            <FilterPill
              label="1:1"
              selected={filters.aspectRatio === '1:1'}
              onClick={() => updateFilter('aspectRatio', '1:1')}
            />
            <FilterPill
              label="9:16"
              selected={filters.aspectRatio === '9:16'}
              onClick={() => updateFilter('aspectRatio', '9:16')}
            />
            <FilterPill
              label="2:3"
              selected={filters.aspectRatio === '2:3'}
              onClick={() => updateFilter('aspectRatio', '2:3')}
            />
          </div>

          {/* Quality Pills */}
          <div className="flex items-center gap-1 border-l border-[var(--border-default)] pl-3">
            <FilterPill
              label="All"
              selected={!filters.qualityMode}
              onClick={() => updateFilter('qualityMode', undefined)}
            />
            <FilterPill
              label="⚡ Draft"
              selected={filters.qualityMode === 'draft'}
              onClick={() => updateFilter('qualityMode', 'draft')}
            />
            <FilterPill
              label="✨ HQ"
              selected={filters.qualityMode === 'hq'}
              onClick={() => updateFilter('qualityMode', 'hq')}
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 border-l border-[var(--border-default)] pl-3">
            <span className="text-sm text-[var(--text-muted)]">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className={cn(
                  'appearance-none pl-3 pr-8 py-1.5 rounded-md text-sm font-medium',
                  'bg-[var(--bg-surface)] border border-[var(--border-default)]',
                  'text-[var(--text-primary)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50',
                  'cursor-pointer'
                )}
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Used</option>
                <option value="name">Name</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          {/* View Mode Toggles */}
          <div className="flex items-center gap-1 border-l border-[var(--border-default)] pl-3">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-[var(--purple-500)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
              )}
              title="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'compact'
                  ? 'bg-[var(--purple-500)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
              )}
              title="Compact view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-[var(--purple-500)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
              )}
              title="List view"
            >
              <Rows className="h-4 w-4" />
            </button>
          </div>
        </div>
      </FadeInUp>

      {/* Template Grid */}
      <FadeInUp delay={200}>
        {error && (
          <div className={cn(
            'rounded-lg border border-red-500/20 bg-red-500/10',
            'p-4 text-sm text-red-400 mb-4'
          )}>
            Failed to load templates. Please try again.
          </div>
        )}

        <TemplateGrid
          templates={data?.templates ?? []}
          isLoading={isLoading}
          onTemplateClick={handleTemplateClick}
          onTemplateApply={handleTemplateApply}
        />
      </FadeInUp>

      {/* Template Detail Modal */}
      <TemplateDetailModal
        templateId={selectedTemplateId}
        isOpen={!!selectedTemplateId}
        onClose={() => setSelectedTemplateId(null)}
        onApply={handleTemplateApply}
      />
    </PageContainer>
  );
}

export default function TemplatesPage() {
  return (
    <ProtectedRoute>
      <TemplatesContent />
    </ProtectedRoute>
  );
}

