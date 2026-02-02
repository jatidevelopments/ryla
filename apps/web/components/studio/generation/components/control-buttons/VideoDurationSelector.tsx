'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { VIDEO_DURATION_OPTIONS, type VideoDuration } from '../../types';

interface VideoDurationSelectorProps {
  duration: VideoDuration;
  onDurationChange: (duration: VideoDuration) => void;
  disabled?: boolean;
}

export function VideoDurationSelector({
  duration,
  onDurationChange,
  disabled = false,
}: VideoDurationSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {VIDEO_DURATION_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onDurationChange(option.value)}
          disabled={disabled}
          className={cn(
            'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
            duration === option.value
              ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/30'
              : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title={`${option.value}s video - ${option.credits} credits`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
