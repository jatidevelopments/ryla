'use client';

import { cn } from '@/lib/utils';
import type { ReferralOption, ExperienceOption } from './constants';

interface OptionCardProps {
  option: ReferralOption | ExperienceOption;
  selected: boolean;
  onClick: () => void;
  showDescription?: boolean;
}

export function OptionCard({
  option,
  selected,
  onClick,
  showDescription,
}: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
        selected
          ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
      )}
    >
      {/* Shimmer on hover */}
      <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 pointer-events-none" />

      <div className="relative z-10 flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200 bg-gradient-to-br',
            option.gradient,
            selected && 'scale-110'
          )}
        >
          {option.icon}
        </div>
        <div className={cn('flex-1', showDescription ? '' : 'min-w-0')}>
          <h3
            className={cn(
              'text-sm font-bold text-white',
              !showDescription && 'truncate'
            )}
          >
            {option.label}
          </h3>
          {showDescription && 'description' in option && (
            <p className="text-xs text-white/60">{option.description}</p>
          )}
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path
                d="M11.6667 3.5L5.25 9.91667L2.33334 7"
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
