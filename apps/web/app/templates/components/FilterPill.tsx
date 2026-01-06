'use client';

import { cn } from '@ryla/ui';

interface FilterPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function FilterPill({ label, selected, onClick }: FilterPillProps) {
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

