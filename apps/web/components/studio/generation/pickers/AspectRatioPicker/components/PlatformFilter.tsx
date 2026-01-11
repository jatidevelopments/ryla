'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { PlatformBadge } from '@ryla/ui';
import { PLATFORMS } from '@ryla/shared';
import type { PlatformId } from '@ryla/shared';

interface PlatformFilterProps {
  allPlatforms: PlatformId[];
  selectedPlatforms: PlatformId[];
  onTogglePlatform: (platformId: PlatformId) => void;
  onClearFilter: () => void;
}

export function PlatformFilter({
  allPlatforms,
  selectedPlatforms,
  onTogglePlatform,
  onClearFilter,
}: PlatformFilterProps) {
  if (allPlatforms.length === 0) return null;

  return (
    <div className="mb-3">
      <div className="text-xs text-white/50 mb-2 font-medium">
        Filter by platform
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={onClearFilter}
          className={cn(
            'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5',
            selectedPlatforms.length === 0
              ? 'bg-[var(--purple-500)]/30 text-white border border-[var(--purple-500)]/50 shadow-sm'
              : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
          )}
        >
          <span>All</span>
        </button>
        {allPlatforms.map((platformId) => {
          const platform = PLATFORMS[platformId];
          const isSelected = selectedPlatforms.includes(platformId);
          return (
            <button
              key={platformId}
              onClick={() => onTogglePlatform(platformId)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 relative',
                isSelected
                  ? 'bg-[var(--purple-500)]/30 text-white border border-[var(--purple-500)]/50 shadow-sm'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              )}
            >
              <PlatformBadge
                platformId={platformId}
                size="sm"
                variant="compact"
                showLabel={false}
              />
              <span className="truncate">{platform.name}</span>
              {isSelected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="absolute top-0.5 right-0.5 h-3 w-3 text-[var(--purple-400)]"
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
    </div>
  );
}
