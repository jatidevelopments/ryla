'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../../../ui/tooltip';

interface LoraToggleProps {
  isEnabled: boolean;
  isAvailable: boolean;
  loraName?: string | null;
  onToggle: () => void;
}

/**
 * LoRA toggle button for the studio toolbar
 * Shows availability status and allows enabling/disabling LoRA for generation
 */
export function LoraToggle({
  isEnabled,
  isAvailable,
  loraName,
  onToggle,
}: LoraToggleProps) {
  if (!isAvailable) {
    return (
      <Tooltip content="No trained LoRA available for this character. Train a LoRA in character settings for 95%+ face consistency.">
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
            'bg-white/5 text-[var(--text-tertiary)] cursor-not-allowed'
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span>No LoRA</span>
        </div>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      content={
        isEnabled
          ? `LoRA "${loraName || 'trained'}" active - 95%+ face consistency`
          : 'Click to enable LoRA for better face consistency'
      }
    >
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
          isEnabled
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span>LoRA {isEnabled ? 'On' : 'Off'}</span>
        {isEnabled && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </button>
    </Tooltip>
  );
}
