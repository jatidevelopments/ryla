'use client';

import { cn } from '@ryla/ui';

interface SkipOptionProps {
  isSelected: boolean;
  onSelect: () => void;
}

export function SkipOption({ isSelected, onSelect }: SkipOptionProps) {
  return (
    <label
      className={cn(
        'relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer mb-4 group',
        isSelected
          ? 'border-purple-400 bg-gradient-to-r from-purple-500/15 to-pink-500/10 shadow-lg shadow-purple-500/10'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
      )}
    >
      <input
        type="radio"
        name="profilePictureSet"
        value=""
        checked={isSelected}
        onChange={onSelect}
        className="sr-only"
      />
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all',
          isSelected ? 'bg-purple-500/20' : 'bg-white/5 group-hover:bg-white/10'
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={cn(
            'w-6 h-6 transition-colors',
            isSelected ? 'text-purple-400' : 'text-white/40 group-hover:text-white/60'
          )}
        >
          <path
            d="M12 6v6l4 2M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'font-semibold',
              isSelected ? 'text-white' : 'text-white/80'
            )}
          >
            Generate Later
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            Free
          </span>
        </div>
        <p className="text-white/40 text-sm mt-0.5">
          Skip for now and generate profile pictures anytime from your character page
        </p>
      </div>
      {isSelected && (
        <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-purple-400 ring-4 ring-purple-400/20" />
      )}
    </label>
  );
}

