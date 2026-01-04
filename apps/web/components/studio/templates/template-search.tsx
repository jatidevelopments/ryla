'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@ryla/ui';

export interface TemplateSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
}

export function TemplateSearch({
  query,
  onQueryChange,
  placeholder = 'Search templates...',
}: TemplateSearchProps) {
  const [localQuery, setLocalQuery] = React.useState(query);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onQueryChange(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, onQueryChange]);

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-10 pr-10 py-2 rounded-lg border border-[var(--border-default)]',
          'bg-[var(--bg-surface)] text-[var(--text-primary)]',
          'placeholder:text-[var(--text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)]',
          'text-sm'
        )}
      />
      {localQuery && (
        <button
          onClick={() => setLocalQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--bg-subtle)] transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-[var(--text-muted)]" />
        </button>
      )}
    </div>
  );
}

