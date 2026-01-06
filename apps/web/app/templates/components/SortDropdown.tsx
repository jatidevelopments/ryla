'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@ryla/ui';

type SortBy = 'newest' | 'popular' | 'name';

interface SortDropdownProps {
  value: SortBy;
  onChange: (value: SortBy) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2 border-l border-[var(--border-default)] pl-3">
      <span className="text-sm text-[var(--text-muted)]">Sort:</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortBy)}
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
  );
}

