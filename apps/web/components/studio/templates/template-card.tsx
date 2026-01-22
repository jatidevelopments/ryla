'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { RylaButton } from '@ryla/ui';
import type { Template } from '@ryla/data/schema/templates.schema';

export interface TemplateCardProps {
  template: Template;
  onApply: (templateId: string) => void;
  onViewDetails: (templateId: string) => void;
  showStats?: boolean;
}

export function TemplateCard({
  template,
  onApply,
  onViewDetails,
  showStats = false,
}: TemplateCardProps) {
  const config = template.config;

  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border-default)] overflow-hidden',
        'bg-[var(--bg-surface)] hover:border-[var(--purple-500)]/50',
        'transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]'
      )}
      onClick={() => onViewDetails(template.id)}
    >
      {/* Preview Image */}
      <div className="relative aspect-[9/16] bg-[var(--bg-subtle)]">
        <Image
          src={template.thumbnailUrl}
          alt={template.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="space-y-1">
          {config.scene && (
            <div className="text-sm font-medium text-[var(--text-primary)]">
              Scene: {config.scene}
            </div>
          )}
          {config.environment && (
            <div className="text-sm text-[var(--text-secondary)]">
              Environment: {config.environment}
            </div>
          )}
          {config.outfit && (
            <div className="text-sm text-[var(--text-secondary)]">
              Outfit:{' '}
              {typeof config.outfit === 'string' ? config.outfit : 'Custom'}
            </div>
          )}
        </div>

        {/* Metadata badges - qualityMode removed (EP-045) */}
        <div className="flex gap-2 flex-wrap">
          <span className="px-2 py-1 rounded text-xs bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
            {config.aspectRatio}
          </span>
          {config.modelId && (
            <span className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-[var(--purple-500)]/10 text-[var(--purple-400)] border border-[var(--purple-500)]/20">
              {config.modelId}
            </span>
          )}
        </div>

        {/* Stats (optional) */}
        {showStats && (template.usageCount ?? 0) > 0 && (
          <div className="text-xs text-[var(--text-muted)]">
            Used {template.usageCount} times
          </div>
        )}

        {/* Apply button */}
        <RylaButton
          onClick={(e) => {
            e.stopPropagation();
            onApply(template.id);
          }}
          className="w-full gap-2"
          size="sm"
          variant="glassy-outline"
        >
          Try Template
        </RylaButton>
      </div>
    </div>
  );
}
