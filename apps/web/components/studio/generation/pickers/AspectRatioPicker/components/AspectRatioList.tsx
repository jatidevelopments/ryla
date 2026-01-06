'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { PlatformBadge } from '@ryla/ui';
import type { AspectRatio, AspectRatioOption } from '../types';

interface AspectRatioListProps {
  ratios: AspectRatioOption[];
  selectedRatio: AspectRatio;
  selectedRatios?: AspectRatio[];
  multiple?: boolean;
  onSelect: (ratio: AspectRatio) => void;
  onSelectMultiple?: (ratios: AspectRatio[]) => void;
}

export function AspectRatioList({
  ratios,
  selectedRatio,
  selectedRatios = [],
  multiple = false,
  onSelect,
  onSelectMultiple,
}: AspectRatioListProps) {
  if (ratios.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-sm text-white/40">
        No aspect ratios available
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {ratios.map((ratio) => {
        const isSelected = multiple 
          ? selectedRatios.includes(ratio.value)
          : selectedRatio === ratio.value;
        
        const handleClick = () => {
          if (multiple && onSelectMultiple) {
            // Toggle selection
            const newRatios = isSelected
              ? selectedRatios.filter(r => r !== ratio.value)
              : [...selectedRatios, ratio.value];
            onSelectMultiple(newRatios);
          } else {
            onSelect(ratio.value);
          }
        };

        return (
          <button
            key={ratio.value}
            onClick={handleClick}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              isSelected
                ? 'bg-[var(--purple-500)]/20 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            )}
          >
            <div className="flex h-5 w-5 items-center justify-center flex-shrink-0">
              {ratio.icon === 'portrait' && (
                <div className="h-5 w-3 border border-current rounded-sm" />
              )}
              {ratio.icon === 'landscape' && (
                <div className="h-3 w-5 border border-current rounded-sm" />
              )}
              {ratio.icon === 'square' && (
                <div className="h-4 w-4 border border-current rounded-sm" />
              )}
            </div>
            <span className="flex-1 text-left font-medium">{ratio.label}</span>
            {/* Platform badges - icons on the same line */}
            {ratio.platforms && ratio.platforms.length > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {ratio.platforms.map((pid) => (
                  <PlatformBadge
                    key={pid}
                    platformId={pid}
                    size="sm"
                    variant="compact"
                    showLabel={false}
                  />
                ))}
              </div>
            )}
            {isSelected && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--purple-400)] flex-shrink-0">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

