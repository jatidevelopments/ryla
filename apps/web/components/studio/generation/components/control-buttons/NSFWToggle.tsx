'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../../../ui/tooltip';

interface NSFWToggleProps {
  studioNsfwEnabled: boolean;
  canEnableNSFW: boolean;
  onToggle: () => void;
}

export function NSFWToggle({
  studioNsfwEnabled,
  canEnableNSFW,
  onToggle,
}: NSFWToggleProps) {
  const handleClick = () => {
    if (!canEnableNSFW) {
      alert('Adult content generation requires enabling 18+ Adult Content in influencer settings.');
      return;
    }
    onToggle();
  };

  return (
    <Tooltip
      content={
        !canEnableNSFW
          ? 'Adult content generation requires enabling 18+ Adult Content in influencer settings.'
          : studioNsfwEnabled
          ? 'Adult Content: Enabled. Only ComfyUI models (RYLA Soul, RYLA Character) are available. Click to disable.'
          : 'Adult Content: Disabled. All models available. Click to enable adult content generation (18+).'
      }
    >
      <button
        onClick={handleClick}
        disabled={!canEnableNSFW}
        className={cn(
          'flex items-center gap-1.5 h-8 px-2 rounded-lg text-xs font-medium transition-all',
          !canEnableNSFW
            ? 'bg-white/5 text-[var(--text-muted)] border border-white/10 opacity-60 cursor-not-allowed'
            : studioNsfwEnabled
            ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
            : 'bg-white/5 text-[var(--text-secondary)] border border-white/10 hover:text-[var(--text-primary)] hover:bg-white/10'
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        </svg>
        <span className="truncate max-w-[120px]">Adult Content {studioNsfwEnabled ? 'On' : 'Off'}</span>
      </button>
    </Tooltip>
  );
}

