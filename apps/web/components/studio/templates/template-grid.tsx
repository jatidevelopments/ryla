'use client';

import * as React from 'react';
import { TemplateCard } from './template-card';
import { cn } from '@ryla/ui';
import type { Template } from '@ryla/data/schema/templates.schema';

export interface TemplateGridProps {
  templates: Template[];
  isLoading: boolean;
  onTemplateClick: (templateId: string) => void;
  onTemplateApply: (templateId: string) => void;
}

export function TemplateGrid({
  templates,
  isLoading,
  onTemplateClick,
  onTemplateApply,
}: TemplateGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] animate-pulse"
          >
            <div className="aspect-[9/16] bg-[var(--bg-subtle)]" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-[var(--bg-subtle)] rounded w-3/4" />
              <div className="h-4 bg-[var(--bg-subtle)] rounded w-1/2" />
              <div className="h-8 bg-[var(--bg-subtle)] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 text-[var(--text-muted)]"
          >
            <path
              fillRule="evenodd"
              d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
          No templates found
        </h3>
        <p className="text-[var(--text-secondary)] max-w-sm">
          Try adjusting your filters or search query to find templates.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onApply={onTemplateApply}
          onViewDetails={onTemplateClick}
          showStats={true}
        />
      ))}
    </div>
  );
}

