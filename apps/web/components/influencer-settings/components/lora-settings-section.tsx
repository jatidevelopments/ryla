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
  RefreshCw,
} from 'lucide-react';
import {
  useCharacterLora,
  useStartLoraTraining,
} from '../../../lib/hooks/use-lora-training';
import { calculateLoraTrainingCost } from '@ryla/shared';
import { trpc } from '../../../lib/trpc';

interface LoraSettingsSectionProps {
  influencerId: string;
  influencerName: string;
  baseImageUrl: string | null;
}

export function LoraSettingsSection({
  influencerId,
  influencerName,
  baseImageUrl,
}: LoraSettingsSectionProps) {
  const {
    data: loraData,
    isLoading: isLoadingLora,
    refetch,
  } = useCharacterLora(influencerId);
  const startTraining = useStartLoraTraining();
  const { data: credits } = trpc.credits.getBalance.useQuery();

  const [isStarting, setIsStarting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const lora = loraData?.lora;
  const hasLora = !!lora;
  const isTraining = lora?.status === 'training' || lora?.status === 'pending';
  const isReady = lora?.status === 'ready';
  const isFailed = lora?.status === 'failed';

  // Estimate cost for training
  const estimatedImageCount = 8; // Profile set generates 8 images
  const trainingCost = calculateLoraTrainingCost('flux', estimatedImageCount);
  const hasEnoughCredits = (credits?.balance ?? 0) >= trainingCost;

  const handleStartTraining = async () => {
    if (!baseImageUrl) {
      setError('No base image available for training');
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      await startTraining.mutateAsync({
        characterId: influencerId,
        triggerWord: influencerName.toLowerCase().replace(/\s+/g, ''),
        imageUrls: [baseImageUrl], // Will need more images in practice
      });

      // Refetch to update status
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start training');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoadingLora) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          AI Consistency (LoRA)
        </h2>
        <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-white/50" />
            <span className="text-white/60">Loading LoRA status...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">
        AI Consistency (LoRA)
      </h2>
      <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-6 space-y-4">
        {/* Status Display */}
        {isReady && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                LoRA Model Active
              </p>
              <p className="text-xs text-white/60 mt-0.5">
                Trigger word:{' '}
                <code className="px-1 py-0.5 rounded bg-white/10">
                  {lora.triggerWord}
                </code>
                {lora.trainingSteps &&
                  ` • ${lora.trainingSteps} training steps`}
              </p>
            </div>
          </div>
        )}

        {isTraining && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              {lora?.status === 'pending' ? (
                <Clock className="h-5 w-5 text-amber-400" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {lora?.status === 'pending'
                  ? 'Training Queued'
                  : 'Training in Progress'}
              </p>
              <p className="text-xs text-white/60 mt-0.5">
                Estimated time: 5-10 minutes
              </p>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Training Failed</p>
              <p className="text-xs text-white/60 mt-0.5">
                {lora.errorMessage || 'An error occurred during training.'}
                {lora.creditsRefunded && lora.creditsRefunded > 0 && (
                  <span className="text-green-300 ml-1">
                    ({lora.creditsRefunded.toLocaleString()} credits refunded)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {!hasLora && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">No LoRA Model</p>
              <p className="text-xs text-white/60 mt-0.5">
                Train a custom AI model for 95%+ face consistency in all
                generated images.
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-start gap-3">
            <Zap className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-white/60">
              <p className="font-medium text-white/80 mb-1">What is LoRA?</p>
              <p>
                LoRA (Low-Rank Adaptation) trains a custom AI model specifically
                on your character&apos;s face. This ensures near-perfect
                consistency across all generated images, maintaining identity
                even in different poses and lighting.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {(!hasLora || isFailed) && (
          <div className="pt-2">
            <button
              onClick={handleStartTraining}
              disabled={isStarting || !hasEnoughCredits || !baseImageUrl}
              className={cn(
                'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden',
                isStarting || !hasEnoughCredits || !baseImageUrl
                  ? 'opacity-50 cursor-not-allowed border-white/10 bg-white/5'
                  : 'border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-orange-500/20 hover:shadow-lg hover:shadow-amber-500/20'
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isStarting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                    ) : isFailed ? (
                      <RefreshCw className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-amber-400" />
                    )}
                    <p className="text-base font-semibold text-white">
                      {isStarting
                        ? 'Starting Training...'
                        : isFailed
                        ? 'Retry Training'
                        : 'Train LoRA Model'}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/30 text-amber-300">
                      {trainingCost.toLocaleString()} credits
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    Takes 5-10 minutes • Uses profile pictures for training
                  </p>
                </div>
              </div>
            </button>

            {!hasEnoughCredits && (
              <p className="mt-2 text-xs text-red-300/80">
                Insufficient credits. You need {trainingCost.toLocaleString()}{' '}
                credits.
              </p>
            )}

            {!baseImageUrl && (
              <p className="mt-2 text-xs text-amber-300/80">
                Generate a base image first before training LoRA.
              </p>
            )}

            {error && <p className="mt-2 text-xs text-red-300/80">{error}</p>}
          </div>
        )}

        {isReady && (
          <div className="pt-2">
            <button
              onClick={handleStartTraining}
              disabled={isStarting || !hasEnoughCredits}
              className={cn(
                'w-full p-3 rounded-lg border transition-all duration-200 text-center',
                isStarting || !hasEnoughCredits
                  ? 'opacity-50 cursor-not-allowed border-white/10 bg-white/5 text-white/40'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
              )}
            >
              <div className="flex items-center justify-center gap-2">
                {isStarting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {isStarting ? 'Starting...' : 'Retrain LoRA Model'}
                </span>
                <span className="text-xs text-white/50">
                  ({trainingCost.toLocaleString()} credits)
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
