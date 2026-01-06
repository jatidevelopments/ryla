'use client';

import { Grid3X3, LayoutGrid, Rows } from 'lucide-react';
import { cn } from '@ryla/ui';

type ViewMode = 'grid' | 'compact' | 'list';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  const modes: { mode: ViewMode; icon: typeof Grid3X3; title: string }[] = [
    { mode: 'grid', icon: Grid3X3, title: 'Grid view' },
    { mode: 'compact', icon: LayoutGrid, title: 'Compact view' },
    { mode: 'list', icon: Rows, title: 'List view' },
  ];

  return (
    <div className="flex items-center gap-1 border-l border-[var(--border-default)] pl-3">
      {modes.map(({ mode, icon: Icon, title }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={cn(
            'p-2 rounded-md transition-colors',
            value === mode
              ? 'bg-[var(--purple-500)] text-white'
              : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
          )}
          title={title}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

