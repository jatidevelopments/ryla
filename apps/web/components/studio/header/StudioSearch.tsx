'use client';

import * as React from 'react';
import { Input } from '@ryla/ui';
import { Tooltip } from '../../ui/tooltip';

interface StudioSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function StudioSearch({
  searchQuery,
  onSearchChange,
}: StudioSearchProps) {
  return (
    <Tooltip content="Search images by prompt, scene, or influencer name">
      <div className="relative w-64">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <Input
          type="text"
          placeholder="Search images..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 bg-[var(--bg-base)] border-[var(--border-default)] pl-10 text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--purple-500)] focus:ring-[var(--purple-500)]/20 rounded-xl"
        />
      </div>
    </Tooltip>
  );
}

