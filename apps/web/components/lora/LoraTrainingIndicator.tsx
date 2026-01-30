'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Clock,
} from 'lucide-react';
import { useCharacterLora } from '../../lib/hooks/use-lora-training';

interface LoraTrainingIndicatorProps {
  characterId: string;
  characterName?: string;
  className?: string;
}

/**
 * Displays the LoRA training status for a character
 */
export function LoraTrainingIndicator({
  characterId,
  characterName,
  className,
}: LoraTrainingIndicatorProps) {
  const { data, isLoading } = useCharacterLora(characterId);

  // Don't show anything if loading or no LoRA
  if (isLoading || !data?.lora) {
    return null;
  }

  const lora = data.lora;

  // Don't show if ready (it's working silently in background)
  // Only show pending, training, and failed states
  if (lora.status === 'ready') {
    return (
      <div
        className={cn(
          'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">LoRA Model Ready</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                <Zap className="w-3 h-3 mr-1" />
                Active
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              {lora.triggerWord && (
                <span>
                  Trigger:{' '}
                  <code className="text-green-300">{lora.triggerWord}</code>
                </span>
              )}
              {lora.trainingSteps && (
                <span className="ml-2">• {lora.trainingSteps} steps</span>
              )}
              {lora.trainingDurationMs && (
                <span className="ml-2">
                  • Trained in {Math.round(lora.trainingDurationMs / 1000 / 60)}{' '}
                  min
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (lora.status === 'pending' || lora.status === 'training') {
    const isPending = lora.status === 'pending';
    return (
      <div
        className={cn(
          'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            {isPending ? (
              <Clock className="h-5 w-5 text-amber-400" />
            ) : (
              <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">
                {isPending ? 'LoRA Training Queued' : 'Training LoRA Model'}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">
                <Sparkles className="w-3 h-3 mr-1" />
                {isPending ? 'Pending' : 'In Progress'}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              {isPending
                ? 'Training will start shortly...'
                : `Training ${
                    characterName || 'character'
                  }'s face model • ~5-10 minutes remaining`}
            </p>

            {/* Progress indicator */}
            {!isPending && (
              <div className="mt-2">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (lora.status === 'failed') {
    const wasRefunded =
      lora.creditsRefunded != null && lora.creditsRefunded > 0;

    return (
      <div
        className={cn(
          'bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-xl p-4',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">
                LoRA Training Failed
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                Error
              </span>
              {wasRefunded && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                  Refunded
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              {lora.errorMessage || 'Training failed.'}
              {wasRefunded && (
                <span className="text-green-300 ml-1">
                  ({lora.creditsRefunded?.toLocaleString()} credits refunded)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Expired or other states
  return null;
}
