'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../ui/tooltip';
import type { ViewMode } from '../studio-toolbar';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const VIEW_MODES: Array<{ mode: ViewMode; tooltip: string; icon: JSX.Element }> = [
  {
    mode: 'grid',
    tooltip: 'Grid view: Compact layout',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path
          fillRule="evenodd"
          d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    mode: 'masonry',
    tooltip: 'Masonry view: Pinterest-style layout',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M2 4.25A2.25 2.25 0 014.25 2h2.5A2.25 2.25 0 019 4.25v1.5A2.25 2.25 0 016.75 8h-2.5A2.25 2.25 0 012 5.75v-1.5z" />
        <path d="M2 13.25A2.25 2.25 0 014.25 11h2.5A2.25 2.25 0 019 13.25v2.5A2.25 2.25 0 016.75 18h-2.5A2.25 2.25 0 012 15.75v-2.5z" />
        <path d="M11 4.25A2.25 2.25 0 0113.25 2h2.5A2.25 2.25 0 0118 4.25v4.5A2.25 2.25 0 0115.75 11h-2.5A2.25 2.25 0 0111 8.75v-4.5z" />
        <path d="M11 13.25A2.25 2.25 0 0113.25 11h2.5A2.25 2.25 0 0118 13.25v2.5A2.25 2.25 0 0115.75 18h-2.5A2.25 2.25 0 0111 15.75v-2.5z" />
      </svg>
    ),
  },
  {
    mode: 'large',
    tooltip: 'Large view: Bigger thumbnails',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path
          fillRule="evenodd"
          d="M1 4.75A2.75 2.75 0 013.75 2h12.5A2.75 2.75 0 0119 4.75v10.5A2.75 2.75 0 0116.25 18H3.75A2.75 2.75 0 011 15.25V4.75zm2.75-1.25a1.25 1.25 0 00-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25V4.75c0-.69-.56-1.25-1.25-1.25H3.75z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  return (
    <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-1">
      {VIEW_MODES.map(({ mode, tooltip, icon }) => (
        <Tooltip key={mode} content={tooltip}>
          <button
            onClick={() => onViewModeChange(mode)}
            className={cn(
              'rounded-lg p-2 transition-all',
              viewMode === mode
                ? 'bg-[var(--purple-500)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            )}
          >
            {icon}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}

