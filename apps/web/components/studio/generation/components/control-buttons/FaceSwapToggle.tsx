'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../../../ui/tooltip';

interface FaceSwapToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

/**
 * Face swap toggle button for editing mode
 * Allows applying character face to selected image/video
 */
export function FaceSwapToggle({
  isEnabled,
  onToggle,
  disabled = false,
  disabledReason,
}: FaceSwapToggleProps) {
  const button = (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
        isEnabled
          ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/30'
          : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span>Face Swap</span>
      {isEnabled && (
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--purple-500)] animate-pulse" />
      )}
    </button>
  );

  if (disabled && disabledReason) {
    return <Tooltip content={disabledReason}>{button}</Tooltip>;
  }

  return (
    <Tooltip
      content={
        isEnabled
          ? "Character's face will be swapped onto the selected media"
          : 'Enable to swap character face onto selected image/video'
      }
    >
      {button}
    </Tooltip>
  );
}
