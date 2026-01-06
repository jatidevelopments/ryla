'use client';

import * as React from 'react';
import { PageContainer, FadeInUp } from '@ryla/ui';
import { ProtectedRoute } from '@/components/auth';
import { TemplateSearch } from '../../components/studio/templates/template-search';
import { TemplateGrid } from '../../components/studio/templates/template-grid';
import { TemplateDetailModal } from '../../components/studio/templates/template-detail-modal';
import { trpc } from '../../lib/trpc';
import { useRouter } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@ryla/ui';
import { SCENE_OPTIONS, ENVIRONMENT_OPTIONS } from '@ryla/shared';
import { FilterPill, FilterDropdown, ViewModeToggle, SortDropdown } from './components';
import { useTemplateFilters } from './hooks/useTemplateFilters';

// Feature flag: Set to true when ready to launch template gallery
const TEMPLATES_ENABLED = false;

function TemplatesContentFull() {
  const router = useRouter();
  const {
    filters,
    searchQuery,
    viewMode,
    sortBy,
    updateFilter,
    setSearchQuery,
    setViewMode,
    setSortBy,
  } = useTemplateFilters();
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);

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

  const handleTemplateClick = React.useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
  }, []);

  const handleTemplateApply = React.useCallback(
    (templateId: string) => {
      router.push(`/studio?template=${templateId}`);
    },
    [router]
  );

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
          <SortDropdown value={sortBy} onChange={setSortBy} />

          {/* View Mode Toggles */}
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
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

function TemplatesContentComingSoon() {
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

      {/* Coming Soon Content */}
      <FadeInUp>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
            <LayoutGrid className="h-10 w-10 text-[var(--purple-400)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            Template Gallery
          </h1>
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 text-[var(--purple-400)] border border-[var(--purple-500)]/20">
              Coming Soon
            </span>
          </div>
          <p className="text-[var(--text-secondary)] max-w-md">
            We're building a gallery where you can discover and reuse successful generation configurations. 
            Save your favorite studio presets and share them with the community.
          </p>
        </div>
      </FadeInUp>
    </PageContainer>
  );
}

function TemplatesContent() {
  // Show full page when feature flag is enabled, otherwise show coming soon
  return TEMPLATES_ENABLED ? <TemplatesContentFull /> : <TemplatesContentComingSoon />;
}

export default function TemplatesPage() {
  return (
    <ProtectedRoute>
      <TemplatesContent />
    </ProtectedRoute>
  );
}

