'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../ui/tooltip';
import type { StudioMode } from '../generation/types';
import { MODE_CONFIG } from '../generation/pickers/ModeSelector/constants';

interface ModeIndicatorProps {
  mode: StudioMode;
  className?: string;
}

// Short labels for header indicator
const SHORT_LABELS: Record<StudioMode, string> = {
  creating: 'Create',
  editing: 'Edit',
  upscaling: 'Upscale',
  variations: 'Variations',
};

export function ModeIndicator({ mode, className }: ModeIndicatorProps) {
  const config = MODE_CONFIG[mode];
  if (!config) return null;

  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  const colorClass = colorClasses[config.color as keyof typeof colorClasses] || colorClasses.blue;
  const shortLabel = SHORT_LABELS[mode] || config.label;

  return (
    <Tooltip content={`Mode: ${config.label}`}>
      <div
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all',
          colorClass,
          className
        )}
      >
        <div className="flex-shrink-0">{config.icon}</div>
        <span className="hidden sm:inline">{shortLabel}</span>
      </div>
    </Tooltip>
  );
}
