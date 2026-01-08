'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../ui/tooltip';
import type { LikedFilter } from '../studio-toolbar';

interface LikedFilterProps {
  liked: LikedFilter;
  onLikedChange: (liked: LikedFilter) => void;
}

const LIKED_OPTIONS = ['all', 'liked', 'not-liked'] as const;

const TOOLTIPS: Record<LikedFilter, string> = {
  all: 'Show all images',
  liked: 'Show only liked images',
  'not-liked': "Show images you haven't liked",
};

export function LikedFilter({ liked, onLikedChange }: LikedFilterProps) {
  return (
    <div className="flex rounded-lg md:rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] p-0.5">
      {LIKED_OPTIONS.map((l) => (
        <Tooltip key={l} content={TOOLTIPS[l]}>
          <button
            onClick={() => onLikedChange(l)}
            className={cn(
              'rounded-md md:rounded-md px-2 md:px-3 min-h-[44px] md:min-h-0 min-w-[44px] md:min-w-0 py-2 md:py-1.5 text-xs font-medium transition-all flex items-center gap-1',
              liked === l
                ? 'bg-[var(--purple-500)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            )}
          >
            {l === 'all' ? (
              'All'
            ) : l === 'liked' ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                </svg>
                Liked
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-3 w-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"
                  />
                </svg>
                Not Liked
              </>
            )}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
