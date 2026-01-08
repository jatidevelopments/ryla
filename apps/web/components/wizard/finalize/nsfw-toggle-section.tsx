'use client';

import { cn } from '@ryla/ui';

interface NSFWToggleSectionProps {
  enabled: boolean;
  onToggle: () => void;
  extraCredits: number;
}

export function NSFWToggleSection({
  enabled,
  onToggle,
  extraCredits,
}: NSFWToggleSectionProps) {
  return (
    <div className="w-full mb-5">
      <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        <p className="text-white/70 text-sm mb-4 font-medium">Adult Content</p>
        <button
          onClick={onToggle}
          className={cn(
            'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
            enabled
              ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
          )}
        >
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-base font-semibold text-white">
                  Enable Adult Content
                </p>
                {/* Credit cost badge - always show */}
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    enabled
                      ? 'bg-pink-500/30 text-pink-300'
                      : 'bg-white/10 text-white/40'
                  )}
                >
                  +{extraCredits} credits
                </span>
              </div>
              <p className="text-sm text-white/60">
                Allow generation of adult content
                {enabled && (
                  <span className="block mt-1 text-pink-300/70">
                    3 extra 18+ profile images will be generated automatically
                  </span>
                )}
              </p>
            </div>
            <div
              className={cn(
                'w-12 h-6 rounded-full transition-all duration-200 flex items-center flex-shrink-0',
                enabled
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-white/20'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-md',
                  enabled ? 'translate-x-6' : 'translate-x-0.5'
                )}
              />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
