'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';

export type TabType = 'templates' | 'sets' | 'all';

interface TypeTabsProps {
  value: TabType;
  onChange: (value: TabType) => void;
  counts?: {
    templates?: number;
    sets?: number;
    all?: number;
  };
}

const tabs: { value: TabType; label: string }[] = [
  { value: 'templates', label: 'Templates' },
  { value: 'sets', label: 'Sets' },
  { value: 'all', label: 'All' },
];

/**
 * TypeTabs - Top-level tabs for switching between Templates, Sets, and All
 * Epic: EP-047 (Template Gallery UX Redesign)
 * Mobile: Scrollable horizontal tabs with proper touch targets
 */
export function TypeTabs({ value, onChange, counts }: TypeTabsProps) {
  return (
    <>
      {/* Mobile: Scrollable */}
      <div className="md:hidden w-full overflow-x-auto scroll-hidden -mx-1 px-1">
        <div className="flex items-center gap-1 p-1 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl min-w-max">
          {tabs.map((tab) => {
            const isActive = value === tab.value;
            const count = counts?.[tab.value];

            return (
              <button
                key={tab.value}
                onClick={() => onChange(tab.value)}
                className={cn(
                  'relative px-4 py-2.5 min-h-[44px] text-sm font-medium rounded-lg transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
                  'flex-shrink-0',
                  isActive
                    ? 'text-white bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)] shadow-lg shadow-purple-500/25'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                )}
              >
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  {tab.label}
                  {count !== undefined && (
                    <span
                      className={cn(
                        'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'
                      )}
                    >
                      {count > 999 ? '999+' : count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Clean horizontal layout - no wrapper */}
      <div className="hidden md:flex items-center gap-1 p-1 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl">
        {tabs.map((tab) => {
          const isActive = value === tab.value;
          const count = counts?.[tab.value];

          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={cn(
                'relative px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
                isActive
                  ? 'text-white bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)] shadow-lg shadow-purple-500/25'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              )}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {count !== undefined && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'
                    )}
                  >
                    {count > 999 ? '999+' : count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
