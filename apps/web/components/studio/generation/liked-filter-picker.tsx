'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@ryla/ui';

export type LikedFilterOption = 'all' | 'liked' | 'not-liked';

interface LikedFilterPickerProps {
  selectedFilters: LikedFilterOption[];
  onSelect: (filters: LikedFilterOption[]) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

const LIKED_FILTER_OPTIONS: Array<{ value: LikedFilterOption; label: string; icon: React.ReactNode }> = [
  {
    value: 'all',
    label: 'All',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h13A1.5 1.5 0 0118 3.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 012 16.5v-13zM3.5 4a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h13a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5h-13z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    value: 'liked',
    label: 'Liked',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
      </svg>
    ),
  },
  {
    value: 'not-liked',
    label: 'Not Liked',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
      </svg>
    ),
  },
];

export function LikedFilterPicker({
  selectedFilters,
  onSelect,
  onClose,
  anchorRef,
}: LikedFilterPickerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [mounted, setMounted] = React.useState(false);

  const toggleFilter = (filter: LikedFilterOption) => {
    if (filter === 'all') {
      // If "all" is clicked, clear all other selections
      onSelect(['all']);
    } else {
      // Toggle the filter
      const newFilters = selectedFilters.includes(filter)
        ? selectedFilters.filter(f => f !== filter)
        : [...selectedFilters.filter(f => f !== 'all'), filter];
      
      // If no filters selected, default to 'all'
      if (newFilters.length === 0) {
        onSelect(['all']);
      } else {
        onSelect(newFilters);
      }
    }
  };

  // Calculate position based on anchor element
  React.useEffect(() => {
    setMounted(true);
    
    const updatePosition = () => {
      if (anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8, // Position below with margin
          left: rect.left,
        });
      }
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!mounted) return null;

  const content = (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
      }}
      className="w-64 rounded-xl border border-white/10 bg-[#1a1a1d] p-2 shadow-xl z-[9999]"
    >
      <div className="mb-2 px-2">
        <div className="mb-3 text-xs font-medium text-white/50 uppercase tracking-wider">
          Liked Status
        </div>
      </div>

      <div className="space-y-0.5">
        {LIKED_FILTER_OPTIONS.map((option) => {
          const isSelected = selectedFilters.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleFilter(option.value)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isSelected
                  ? 'bg-[var(--purple-500)]/20 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              )}
            >
              <div className="flex h-5 w-5 items-center justify-center flex-shrink-0 text-[var(--purple-400)]">
                {option.icon}
              </div>
              <span className="flex-1 text-left font-medium">{option.label}</span>
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--purple-400)] flex-shrink-0">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

