'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../../../ui/tooltip';
import { useSubscription } from '../../../../../lib/hooks/use-subscription';

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
  const { isPro } = useSubscription();

  // Hide for non-Pro users
  if (!isPro) {
    return null;
  }
  const handleClick = () => {
    if (!canEnableNSFW) {
      alert(
        'NSFW generation requires enabling 18+ Content in influencer settings.'
      );
      return;
    }
    onToggle();
  };

  return (
    <Tooltip
      content={
        !canEnableNSFW
          ? 'NSFW generation requires enabling 18+ Content in influencer settings.'
          : studioNsfwEnabled
          ? 'NSFW: Enabled. Only ComfyUI models (RYLA Soul, RYLA Character) are available. Click to disable.'
          : 'NSFW: Disabled. All models available. Click to enable NSFW generation (18+).'
      }
    >
      <button
        onClick={handleClick}
        disabled={!canEnableNSFW}
        className={cn(
          'flex items-center gap-1.5 md:gap-1.5 min-h-[44px] px-3 md:px-4 py-2 md:py-2.5 rounded-2xl text-sm font-medium transition-all',
          !canEnableNSFW
            ? 'bg-white/5 text-[var(--text-muted)] border border-white/10 opacity-60 cursor-not-allowed'
            : studioNsfwEnabled
            ? 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30'
            : 'bg-white/5 text-[var(--text-secondary)] border border-white/10 hover:text-[var(--text-primary)] hover:bg-white/10'
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 md:h-3.5 md:w-3.5 flex-shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        </svg>
        <span className="hidden md:inline truncate max-w-[120px]">
          NSFW {studioNsfwEnabled ? 'On' : 'Off'}
        </span>
        <span className="md:hidden font-bold">
          {studioNsfwEnabled ? '18+' : 'SFW'}
        </span>
      </button>
    </Tooltip>
  );
}
