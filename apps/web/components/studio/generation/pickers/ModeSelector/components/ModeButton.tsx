'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../../../../ui/tooltip';
import { MODE_CONFIG, COLOR_CLASSES } from '../constants';
import type { StudioMode } from '../../../types';

interface ModeButtonProps {
  mode: StudioMode;
  isActive: boolean;
  onSelect: (mode: StudioMode) => void;
}

export function ModeButton({ mode, isActive, onSelect }: ModeButtonProps) {
  const config = MODE_CONFIG[mode];
  const colors = COLOR_CLASSES[config.color];
  const isComingSoon = mode === 'variations';

  if (isComingSoon) {
    return (
      <Tooltip content="Variations mode is coming soon!">
        <button
          onClick={(e) => {
            e.preventDefault();
          }}
          className={cn(
            'flex items-center gap-1 md:gap-2 px-3 md:px-4 min-h-[44px] py-2 md:py-2.5 rounded-2xl text-sm font-medium transition-all border md:border-2 relative',
            'text-orange-400/40 border-transparent cursor-not-allowed',
            'hover:text-orange-400/50'
          )}
          disabled
        >
          <span className="flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">
            {config.icon}
          </span>
          <span className="hidden md:inline">{config.label}</span>
          <span className="absolute -top-0.5 -right-0.5 text-[6px] md:text-[7px] text-orange-400 font-bold bg-orange-400/20 px-0.5 md:px-1 py-0.5 rounded uppercase tracking-wider">
            Soon
          </span>
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      onClick={() => onSelect(mode)}
      className={cn(
        'flex items-center gap-1 md:gap-2 px-3 md:px-4 min-h-[44px] py-2 md:py-2.5 rounded-2xl text-sm font-medium transition-all border md:border-2',
        isActive ? colors.active : colors.inactive
      )}
    >
      <span className="flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">
        {config.icon}
      </span>
      <span className={cn('md:inline', isActive ? 'inline' : 'hidden')}>
        {config.label}
      </span>
    </button>
  );
}
