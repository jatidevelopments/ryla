'use client';

import * as React from 'react';
import { Tooltip } from '../../ui/tooltip';
import type { SortBy } from '../studio-toolbar';

interface SortDropdownProps {
  sortBy: SortBy;
  onSortByChange: (sort: SortBy) => void;
}

export function SortDropdown({ sortBy, onSortByChange }: SortDropdownProps) {
  return (
    <Tooltip content="Sort images by date">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-muted)]">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as SortBy)}
          className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--purple-500)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-500)]"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </Tooltip>
  );
}

