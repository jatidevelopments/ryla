'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@ryla/ui';

interface FilterDropdownOption {
  value: string;
  label: string;
  emoji?: string;
}

interface FilterDropdownProps {
  label: string;
  value: string | undefined;
  options: FilterDropdownOption[];
  onChange: (value: string | undefined) => void;
}

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: FilterDropdownProps) {
  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className={cn(
          'appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm font-medium',
          'bg-[var(--bg-surface)] border border-[var(--border-default)]',
          'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50',
          'cursor-pointer'
        )}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.emoji ? `${opt.emoji} ${opt.label}` : opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
    </div>
  );
}

