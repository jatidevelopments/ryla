'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Flame, TrendingUp, Clock, History, ChevronDown } from 'lucide-react';
import { PickerDrawer } from '../../../components/studio/generation/pickers/PickerDrawer';

export type SortOption = 'popular' | 'trending' | 'new' | 'recent';

interface SortButtonsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'popular', label: 'Popular', icon: <Flame className="h-4 w-4" /> },
  { value: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'new', label: 'New', icon: <Clock className="h-4 w-4" /> },
  { value: 'recent', label: 'Recent', icon: <History className="h-4 w-4" /> },
];

/**
 * SortButtons - Horizontal sort button bar (desktop) / PickerDrawer bottom sheet (mobile)
 * Epic: EP-047 (Template Gallery UX Redesign)
 */
export function SortButtons({ value, onChange }: SortButtonsProps) {
  const [isMobilePickerOpen, setIsMobilePickerOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const selectedOption = sortOptions.find((opt) => opt.value === value);

  return (
    <>
      {/* Desktop: Horizontal buttons - no background wrapper */}
      <div className="hidden md:flex items-center gap-1">
        {sortOptions.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]',
                isActive
                  ? 'text-[var(--purple-400)] bg-[var(--purple-500)]/10 border border-[var(--purple-500)]/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              )}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Mobile: Button that opens PickerDrawer */}
      <div className="md:hidden w-full">
        <button
          ref={buttonRef}
          onClick={() => setIsMobilePickerOpen(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 min-h-[44px] w-full text-sm font-medium rounded-xl transition-all',
            'bg-[var(--bg-subtle)] border border-[var(--border-default)]',
            'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]'
          )}
        >
          {selectedOption?.icon}
          <span className="flex-1 text-left">{selectedOption?.label}</span>
          <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)]" />
        </button>

        <PickerDrawer
          isOpen={isMobilePickerOpen}
          onClose={() => setIsMobilePickerOpen(false)}
          anchorRef={buttonRef}
          title="Sort By"
          className="md:w-64"
        >
          <div className="p-2 space-y-1">
            {sortOptions.map((option) => {
              const isActive = value === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsMobilePickerOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-4 md:py-3 text-left transition-colors',
                    isActive
                      ? 'bg-[var(--purple-500)] text-white font-medium'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {option.icon}
                  <span className="flex-1 text-sm font-semibold">{option.label}</span>
                  {isActive && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </PickerDrawer>
      </div>
    </>
  );
}
