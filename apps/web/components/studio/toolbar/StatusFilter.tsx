'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../ui/tooltip';
import type { StatusFilter } from '../studio-toolbar';

interface StatusFilterProps {
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}

const STATUS_OPTIONS = ['all', 'completed', 'generating', 'failed'] as const;

const TOOLTIPS: Record<StatusFilter, string> = {
  all: 'Show all images',
  completed: 'Show only completed images',
  generating: 'Show images currently generating',
  failed: 'Show failed generations',
};

const LABELS: Record<StatusFilter, string> = {
  all: 'All',
  completed: '✓ Done',
  generating: '⟳ Gen',
  failed: '✕ Failed',
};

export function StatusFilterGroup({
  status,
  onStatusChange,
}: StatusFilterProps) {
  return (
    <div className="flex rounded-lg md:rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] p-0.5">
      {STATUS_OPTIONS.map((s) => (
        <Tooltip key={s} content={TOOLTIPS[s]}>
          <button
            onClick={() => onStatusChange(s)}
            className={cn(
              'rounded-md md:rounded-md px-2 md:px-3 min-h-[44px] md:min-h-0 min-w-[44px] md:min-w-0 py-2 md:py-1.5 text-xs font-medium transition-all',
              status === s
                ? 'bg-[var(--purple-500)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            )}
          >
            {LABELS[s]}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
