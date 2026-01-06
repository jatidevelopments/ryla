'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../../../ui/tooltip';
import { MODE_CONFIG, COLOR_CLASSES } from '../constants';
import type { StudioMode } from '../../types';

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
            // Variations mode is not yet available
          }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 relative',
            'text-orange-400/40 border-transparent cursor-not-allowed',
            'hover:text-orange-400/50'
          )}
          disabled
        >
          <span className="flex-shrink-0">{config.icon}</span>
          <span>{config.label}</span>
          <span className="absolute -top-0.5 -right-0.5 text-[7px] text-orange-400 font-bold bg-orange-400/20 px-1 py-0.5 rounded uppercase tracking-wider">
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
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border-2',
        isActive ? colors.active : colors.inactive
      )}
    >
      <span className="flex-shrink-0">{config.icon}</span>
      <span>{config.label}</span>
    </button>
  );
}

