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
          ? 'bg-[var(--purple-500)] text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
          : 'bg-[var(--bg-surface)]/50 backdrop-blur-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] border border-[var(--border-default)]'
      )}
    >
      {label}
    </button>
  );
}
