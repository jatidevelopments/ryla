'use client';

import * as React from 'react';
import { trpc } from '../../../lib/trpc';
import { TemplateSearch } from './template-search';
import { TemplateFilters, type TemplateFiltersData } from './template-filters';
import { TemplateGrid } from './template-grid';
import { TemplateDetailModal } from './template-detail-modal';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface TemplateLibraryTabProps {
  influencerId?: string;
  onTemplateApply: (templateId: string) => void;
}

export function TemplateLibraryTab({
  influencerId,
  onTemplateApply,
}: TemplateLibraryTabProps) {
  const [filters, setFilters] = React.useState<TemplateFiltersData>({
    category: 'all',
    scene: undefined,
    environment: undefined,
    aspectRatio: undefined,
    qualityMode: undefined,
    nsfw: undefined,
  });
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data, isLoading, error } = trpc.templates.list.useQuery({
    category: filters.category,
    scene: filters.scene,
    environment: filters.environment,
    aspectRatio: filters.aspectRatio,
    qualityMode: filters.qualityMode,
    nsfw: filters.nsfw,
    search: searchQuery || undefined,
    influencerId: influencerId,
    page: 1,
    limit: 20,
  });

  const [selectedTemplateId, setSelectedTemplateId] = React.useState<
    string | null
  >(null);

  const handleTemplateClick = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header with search and browse link */}
      <div className="flex items-center justify-between gap-4">
        <TemplateSearch
          query={searchQuery}
          onQueryChange={setSearchQuery}
          placeholder="Search templates..."
        />
        <Link
          href="/templates"
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span>Browse All Templates</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* Main content: Filters + Grid */}
      <div className="flex gap-4">
        {/* Filters sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <TemplateFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Template grid */}
        <div className="flex-1">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              Failed to load templates. Please try again.
            </div>
          )}

          <TemplateGrid
            templates={data?.templates ?? []}
            isLoading={isLoading}
            onTemplateClick={handleTemplateClick}
            onTemplateApply={onTemplateApply}
          />
        </div>
      </div>

      {/* Mobile filters (collapsible) */}
      <div className="lg:hidden">
        <TemplateFilters
          filters={filters}
          onFiltersChange={setFilters}
          collapsible
        />
      </div>

      {/* Template Detail Modal */}
      <TemplateDetailModal
        templateId={selectedTemplateId}
        isOpen={!!selectedTemplateId}
        onClose={() => setSelectedTemplateId(null)}
        onApply={(templateId) => {
          onTemplateApply(templateId);
          setSelectedTemplateId(null);
        }}
      />
    </div>
  );
}
