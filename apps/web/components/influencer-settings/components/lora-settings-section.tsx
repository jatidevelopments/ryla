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
  Images,
  Video,
  ChevronDown,
} from 'lucide-react';
import {
  useCharacterLora,
  useStartLoraTraining,
  useToggleLoraEnabled,
  useLoraModelTypes,
  useNewLikedImagesCheck,
  type LoraModelType,
} from '../../../lib/hooks/use-lora-training';
import { calculateLoraTrainingCost } from '@ryla/shared';
import { trpc } from '../../../lib/trpc';
import { ImageSelectorModal, TrainingHistorySection } from '../../lora';
import { Switch } from '@ryla/ui';

interface LoraSettingsSectionProps {
  influencerId: string;
  influencerName: string;
  baseImageUrl: string | null;
}

export function LoraSettingsSection({
  influencerId,
  influencerName,
  baseImageUrl: _baseImageUrl,
}: LoraSettingsSectionProps) {
  const {
    data: loraData,
    isLoading: isLoadingLora,
    refetch,
  } = useCharacterLora(influencerId);
  const startTraining = useStartLoraTraining();
  const toggleLora = useToggleLoraEnabled();
  const { data: credits } = trpc.credits.getBalance.useQuery();
  const { data: modelTypesData } = useLoraModelTypes();
  const { data: newImagesData } = useNewLikedImagesCheck(influencerId);

  const [isStarting, setIsStarting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedModelType, setSelectedModelType] =
    React.useState<LoraModelType>('flux');
  const [showModelSelector, setShowModelSelector] = React.useState(false);

  const lora = loraData?.lora;
  const hasLora = !!lora;
  const isTraining = lora?.status === 'training' || lora?.status === 'pending';
  const isReady = lora?.status === 'ready';
  const isFailed = lora?.status === 'failed';
  const loraEnabled = loraData?.loraEnabled ?? true;

  // Get model type info
  const modelTypes = modelTypesData?.modelTypes ?? [];
  const selectedModelInfo = modelTypes.find((m) => m.id === selectedModelType);
  const isVideoModel = selectedModelType === 'wan' || selectedModelType === 'wan-14b';

  // Estimate cost for training based on selected model type
  const estimatedMediaCount = isVideoModel ? 5 : 8;
  const trainingCost = calculateLoraTrainingCost(
    selectedModelType,
    estimatedMediaCount
  );
  const creditBalance = credits?.balance ?? 0;

  const handleOpenSelector = () => {
    setError(null);
    setIsModalOpen(true);
  };

  const handleToggleLora = async (enabled: boolean) => {
    try {
      await toggleLora.mutateAsync({
        characterId: influencerId,
        enabled,
      });
      await refetch();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to toggle LoRA setting'
      );
    }
  };

  const handleStartTraining = async (selectedMediaUrls: string[]) => {
    setIsStarting(true);
    setError(null);

    try {
      await startTraining.mutateAsync({
        characterId: influencerId,
        triggerWord: influencerName.toLowerCase().replace(/\s+/g, ''),
        modelType: selectedModelType,
        mediaUrls: selectedMediaUrls,
        imageUrls: selectedMediaUrls, // backward compatibility
      });

      // Refetch to update status
      await refetch();
      setIsModalOpen(false);
      setShowModelSelector(false);
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
            <div className="shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
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

        {/* Enable/Disable Toggle (only show when LoRA is ready) */}
        {isReady && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                Use LoRA for Generation
              </p>
              <p className="text-xs text-white/60 mt-0.5">
                {loraEnabled
                  ? 'LoRA will be applied to all image generations'
                  : 'LoRA is disabled, using base model only'}
              </p>
            </div>
            <Switch
              checked={loraEnabled}
              onCheckedChange={handleToggleLora}
              disabled={toggleLora.isPending}
              className="data-[state=checked]:bg-purple-500"
            />
          </div>
        )}

        {isTraining && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
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
            <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
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
            <div className="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
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

        {/* New Liked Images Banner */}
        {newImagesData?.hasNewLikedImages && isReady && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Images className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {newImagesData.newLikedImageCount} New Liked Image
                {newImagesData.newLikedImageCount > 1 ? 's' : ''} Available
              </p>
              <p className="text-xs text-white/60 mt-0.5">
                Retrain your LoRA with new images for improved face consistency.
              </p>
            </div>
          </div>
        )}

        {/* Free Retry Banner */}
        {newImagesData?.freeRetry && isFailed && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                Free Retry Available
              </p>
              <p className="text-xs text-white/60 mt-0.5">
                Your previous training failed. Retry for free with your current images.
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-start gap-3">
            <Zap className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-white/60">
              <p className="font-medium text-white/80 mb-1">What is LoRA?</p>
              <p>
                LoRA (Low-Rank Adaptation) trains a custom AI model specifically
                on your character&apos;s face. This ensures near-perfect
                consistency across all generated images and videos, maintaining
                identity even in different poses and lighting.
              </p>
            </div>
          </div>
        </div>

        {/* Model Type Selector */}
        {(!hasLora || isFailed || isReady) && modelTypes.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center justify-between w-full p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isVideoModel ? (
                  <Video className="h-4 w-4 text-purple-400" />
                ) : (
                  <Images className="h-4 w-4 text-blue-400" />
                )}
                <span className="text-sm font-medium text-white">
                  {selectedModelInfo?.name || 'Flux'}
                </span>
                <span className="text-xs text-white/50">
                  ({selectedModelInfo?.mediaType || 'images'})
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-white/50 transition-transform',
                  showModelSelector && 'rotate-180'
                )}
              />
            </button>

            {showModelSelector && (
              <div className="grid gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                {modelTypes.map((modelType) => (
                  <button
                    key={modelType.id}
                    onClick={() => {
                      setSelectedModelType(modelType.id);
                      setShowModelSelector(false);
                    }}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                      selectedModelType === modelType.id
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    )}
                  >
                    <div className="shrink-0 mt-0.5">
                      {modelType.mediaType === 'videos' ? (
                        <Video className="h-4 w-4 text-purple-400" />
                      ) : (
                        <Images className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {modelType.name}
                      </p>
                      <p className="text-xs text-white/60 mt-0.5">
                        {modelType.description}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {modelType.minMedia}-{modelType.maxMedia}{' '}
                        {modelType.mediaType} • ~{modelType.estimatedMinutes}{' '}
                        min
                      </p>
                    </div>
                    {selectedModelType === modelType.id && (
                      <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {(!hasLora || isFailed) && (
          <div className="pt-2">
            <button
              onClick={handleOpenSelector}
              disabled={isStarting}
              className={cn(
                'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden',
                isStarting
                  ? 'opacity-50 cursor-not-allowed border-white/10 bg-white/5'
                  : isVideoModel
                    ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:shadow-lg hover:shadow-purple-500/20'
                    : 'border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-orange-500/20 hover:shadow-lg hover:shadow-amber-500/20'
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isStarting ? (
                      <Loader2
                        className={cn(
                          'h-4 w-4 animate-spin',
                          isVideoModel ? 'text-purple-400' : 'text-amber-400'
                        )}
                      />
                    ) : isFailed ? (
                      <RefreshCw
                        className={cn(
                          'h-4 w-4',
                          isVideoModel ? 'text-purple-400' : 'text-amber-400'
                        )}
                      />
                    ) : isVideoModel ? (
                      <Video className="h-4 w-4 text-purple-400" />
                    ) : (
                      <Images className="h-4 w-4 text-amber-400" />
                    )}
                    <p className="text-base font-semibold text-white">
                      {isStarting
                        ? 'Starting Training...'
                        : isFailed
                          ? 'Retry Training'
                          : isVideoModel
                            ? 'Select Videos & Train'
                            : 'Select Images & Train'}
                    </p>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        isVideoModel
                          ? 'bg-purple-500/30 text-purple-300'
                          : 'bg-amber-500/30 text-amber-300'
                      )}
                    >
                      ~{trainingCost.toLocaleString()} credits
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    {selectedModelInfo
                      ? `Choose ${selectedModelInfo.minMedia}-${selectedModelInfo.maxMedia} ${selectedModelInfo.mediaType} • ~${selectedModelInfo.estimatedMinutes} min`
                      : 'Choose 5-10 images • Training takes 5-10 minutes'}
                  </p>
                </div>
              </div>
            </button>

            {error && <p className="mt-2 text-xs text-red-300/80">{error}</p>}
          </div>
        )}

        {isReady && (
          <div className="pt-2">
            <button
              onClick={handleOpenSelector}
              disabled={isStarting}
              className={cn(
                'w-full p-3 rounded-lg border transition-all duration-200 text-center',
                isStarting
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
                  {isStarting ? 'Starting...' : 'Retrain with New Images'}
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Training History */}
        <TrainingHistorySection characterId={influencerId} />
      </div>

      {/* Image Selector Modal */}
      <ImageSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleStartTraining}
        characterId={influencerId}
        characterName={influencerName}
        isSubmitting={isStarting}
        creditBalance={creditBalance}
      />
    </section>
  );
}
