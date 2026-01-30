'use client';

import { cn } from '@ryla/ui';
import { Sparkles, Zap } from 'lucide-react';

interface LoraTrainingToggleSectionProps {
  enabled: boolean;
  onToggle: () => void;
  creditCost: number;
  imageCount: number;
  hasEnoughCredits: boolean;
}

export function LoraTrainingToggleSection({
  enabled,
  onToggle,
  creditCost,
  imageCount,
  hasEnoughCredits,
}: LoraTrainingToggleSectionProps) {
  const isDisabled = !hasEnoughCredits && !enabled;

  return (
    <div className="w-full mb-5">
      <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <p className="text-white/70 text-sm font-medium">
            AI Consistency Training
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">
            Premium
          </span>
        </div>
        <button
          onClick={isDisabled ? undefined : onToggle}
          disabled={isDisabled}
          className={cn(
            'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
            isDisabled && 'opacity-50 cursor-not-allowed',
            enabled
              ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-lg shadow-amber-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
          )}
        >
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-base font-semibold text-white">
                  Train Character LoRA
                </p>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    enabled
                      ? 'bg-amber-500/30 text-amber-300'
                      : 'bg-white/10 text-white/40'
                  )}
                >
                  {creditCost.toLocaleString()} credits
                </span>
              </div>
              <p className="text-sm text-white/60">
                Train AI to perfectly replicate your character&apos;s face
                {enabled && (
                  <span className="block mt-1 text-amber-300/70">
                    <Zap className="w-3 h-3 inline mr-1" />
                    Training uses {imageCount} images • Takes ~5-10 minutes
                  </span>
                )}
              </p>
              {!enabled && (
                <p className="text-xs text-white/40 mt-2">
                  Recommended for 95%+ face consistency in all generated images
                </p>
              )}
            </div>
            <div
              className={cn(
                'w-12 h-6 rounded-full transition-all duration-200 flex items-center flex-shrink-0',
                enabled
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
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

        {/* Info about what LoRA training does */}
        {enabled && (
          <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-200/80">
              <strong>What this does:</strong> Creates a personalized AI model
              specifically trained on your character&apos;s face. All future
              generations will use this model for near-perfect consistency.
            </p>
          </div>
        )}

        {isDisabled && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-300/80">
              Insufficient credits for LoRA training. You need{' '}
              {creditCost.toLocaleString()} credits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
