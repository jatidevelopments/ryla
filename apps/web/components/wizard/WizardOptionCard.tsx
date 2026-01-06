'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';

interface WizardOptionCardProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onSelect: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'square' | 'horizontal';
  description?: string;
  className?: string;
}

/**
 * Modern option card for wizard steps
 * Matches the funnel app design with gradients and animations
 */
export function WizardOptionCard({
  label,
  emoji,
  selected = false,
  onSelect,
  size = 'md',
  variant = 'square',
  description,
  className,
}: WizardOptionCardProps) {
  if (variant === 'horizontal') {
    return (
      <button
        onClick={onSelect}
        className={cn(
          'w-full p-3 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
          selected
            ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
          className
        )}
      >
        <div className="relative z-10 flex items-center gap-3">
          {emoji && <span className="text-xl flex-shrink-0">{emoji}</span>}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-medium',
                selected ? 'text-white' : 'text-white/90'
              )}
            >
              {label}
            </p>
            {description && (
              <p className="text-xs text-white/50 mt-0.5">{description}</p>
            )}
          </div>
          {selected && (
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      </button>
    );
  }

  const sizeClasses = {
    sm: 'p-2.5 min-h-[72px]',
    md: 'p-3 min-h-[88px]',
    lg: 'p-4 min-h-[100px]',
  };

  const emojiSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative rounded-xl border-2 transition-all duration-200 overflow-hidden flex flex-col items-center justify-center gap-1.5',
        sizeClasses[size],
        selected
          ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
        className
      )}
    >
      {/* Shimmer effect when selected */}
      {selected && (
        <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-20" />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-1.5">
        {emoji && <span className={emojiSizes[size]}>{emoji}</span>}
        <p
          className={cn(
            'font-medium text-center',
            labelSizes[size],
            selected ? 'text-white' : 'text-white/80'
          )}
        >
          {label}
        </p>
      </div>

      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center z-20 shadow-md">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path
              d="M10 3L4.5 8.5L2 6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
