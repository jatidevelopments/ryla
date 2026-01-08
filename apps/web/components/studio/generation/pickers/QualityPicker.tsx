'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import type { Quality, QualityOption } from '../types';
import { PickerDrawer } from './PickerDrawer';

interface QualityPickerProps {
  options: QualityOption[];
  selectedQuality: Quality;
  onSelect: (quality: Quality) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export function QualityPicker({
  options,
  selectedQuality,
  onSelect,
  onClose,
  anchorRef,
}: QualityPickerProps) {
  return (
    <PickerDrawer
      isOpen={true}
      onClose={onClose}
      anchorRef={anchorRef}
      title="Generation Quality"
      className="md:w-64"
    >
      <div className="p-2 space-y-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              onSelect(option.value);
              onClose();
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-4 py-4 md:py-3 text-left transition-colors',
              selectedQuality === option.value
                ? 'bg-[var(--purple-500)] text-white font-medium'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            )}
          >
            <div className="flex-1">
              <div className="text-sm md:text-sm font-semibold">
                {option.label}
              </div>
              <div
                className={cn(
                  'text-xs',
                  selectedQuality === option.value
                    ? 'text-white/80'
                    : 'text-white/40'
                )}
              >
                {option.description}
              </div>
            </div>
            {selectedQuality === option.value && (
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
        ))}
      </div>
    </PickerDrawer>
  );
}
