'use client';

import * as React from 'react';
import type { StudioImage } from '../../../components/studio/studio-image-card';
import type { GenerationSettings } from '../../../components/studio/generation';
import type { OutfitComposition } from '@ryla/shared';
import { generateStudioImages } from '../../../lib/api/studio';
import { DEFAULT_ASPECT_RATIO, SUPPORTED_ASPECT_RATIOS } from '../constants';
import { useGenerationPolling } from './useGenerationPolling';
import { createPlaceholderImages } from '../utils/placeholder-images';

interface Influencer {
  id: string;
  name: string;
  avatar?: string | null;
  outfit?: string | OutfitComposition;
}

interface UseGenerationActionsOptions {
  influencers: Influencer[];
  addPlaceholders: (placeholders: StudioImage[]) => void;
  removeImage: (imageId: string) => void;
  updateImage: (imageId: string, updates: Partial<StudioImage>) => void;
  replaceImage: (oldImageId: string, newImage: StudioImage) => void;
  setActiveGenerations: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectedImage: React.Dispatch<React.SetStateAction<StudioImage | null>>;
  refreshImages: (characterId: string) => Promise<void>;
  utils: ReturnType<typeof import('../../../lib/trpc').trpc.useUtils>;
  refetchCredits: () => void;
}

/**
 * Hook for generation-related actions (generate, retry)
 */
export function useGenerationActions({
  influencers,
  addPlaceholders,
  removeImage,
  updateImage,
  replaceImage,
  setActiveGenerations,
  setSelectedImage,
  refreshImages: _refreshImages,
  utils,
  refetchCredits,
}: UseGenerationActionsOptions) {
  const { pollGenerationResults } = useGenerationPolling({
    setActiveGenerations,
    updateImage,
    replaceImage,
    utils,
  });

  // Handle generate - non-blocking with optimistic updates
  const handleGenerate = React.useCallback(
    async (settings: GenerationSettings) => {
      if (!settings.influencerId) return;
      const influencer = influencers.find(
        (i) => i.id === settings.influencerId
      );
      if (!influencer) return;

      const aspectRatio = SUPPORTED_ASPECT_RATIOS.has(settings.aspectRatio)
        ? (settings.aspectRatio as '1:1' | '9:16' | '2:3')
        : DEFAULT_ASPECT_RATIO;

      const qualityMode = settings.quality === '1.5k' ? 'draft' : 'hq';

      try {
        // If NSFW is enabled and no outfit is selected, pass empty string so backend can handle it as "naked"
        // Otherwise, use default fallback to 'casual' for SFW content
        const outfitForGeneration =
          (settings.nsfw ?? false) && !settings.outfit && !influencer.outfit
            ? ''
            : settings.outfit || influencer.outfit || 'casual';

        const started = await generateStudioImages({
          characterId: settings.influencerId,
          additionalDetails: settings.prompt?.trim() || undefined,
          scene: settings.sceneId || 'candid-lifestyle',
          environment: 'studio',
          outfit: outfitForGeneration,
          poseId: settings.poseId || undefined,
          lighting: settings.lightingId || undefined,
          aspectRatio,
          qualityMode,
          count: Math.max(1, Math.min(10, settings.batchSize)),
          nsfw: settings.nsfw ?? false,
          promptEnhance: settings.promptEnhance ?? true,
        });

        // 1. Add placeholders to state immediately
        const outfitString =
          typeof outfitForGeneration === 'string'
            ? outfitForGeneration
            : JSON.stringify(outfitForGeneration);
        const placeholderImages = createPlaceholderImages({
          jobs: started.jobs,
          influencerId: settings.influencerId!,
          influencerName: influencer.name || 'Unknown',
          influencerAvatar: influencer.avatar,
          aspectRatio,
          prompt: settings.prompt,
          scene: settings.sceneId || 'candid-lifestyle',
          environment: 'studio',
          outfit: outfitString,
          poseId: settings.poseId || undefined,
          nsfw: settings.nsfw ?? false,
          promptEnhance: settings.promptEnhance ?? true,
        });
        addPlaceholders(placeholderImages);

        // 2. Track active generations immediately
        const promptIds = started.jobs.map((j) => j.promptId);
        setActiveGenerations((prev) => {
          const next = new Set(prev);
          promptIds.forEach((pid) => next.add(pid));
          return next;
        });

        // 3. Create metadata map for polling to use when replacing placeholders
        const placeholderMeta = new Map<string, Partial<StudioImage>>();
        started.jobs.forEach((job) => {
          placeholderMeta.set(job.promptId, {
            influencerName: influencer.name || 'Unknown',
            influencerAvatar: influencer.avatar || undefined,
            prompt: settings.prompt,
            scene: settings.sceneId || 'candid-lifestyle',
            environment: 'studio',
            outfit: outfitString,
            poseId: settings.poseId || undefined,
            aspectRatio,
            nsfw: settings.nsfw ?? false,
            promptEnhance: settings.promptEnhance ?? true,
          });
        });

        // 4. Start background polling (non-blocking)
        void pollGenerationResults(
          promptIds,
          settings.influencerId,
          placeholderMeta
        );

        // 5. Invalidate and refresh (lower priority)
        utils.activity.list.invalidate();
        utils.activity.summary.invalidate();
        refetchCredits();
      } catch (err) {
        console.error('Generation failed:', err);
      }
    },
    [
      influencers,
      addPlaceholders,
      setActiveGenerations,
      pollGenerationResults,
      utils,
      refetchCredits,
    ]
  );

  // Handle retry - regenerate failed image without charging credits
  const handleRetry = React.useCallback(
    async (image: StudioImage) => {
      if (image.status !== 'failed') return;

      const influencer = influencers.find((i) => i.id === image.influencerId);
      if (!influencer) return;

      // Extract prompt from enhanced or original prompt
      const additionalDetails = image.enhancedPrompt
        ? image.enhancedPrompt.replace(image.originalPrompt || '', '').trim()
        : image.prompt || undefined;

      const qualityMode = 'hq'; // Default

      try {
        // Parse outfit - could be string or JSON
        let outfit: string | OutfitComposition =
          image.outfit || influencer.outfit || 'casual';
        try {
          if (
            typeof image.outfit === 'string' &&
            image.outfit.startsWith('{')
          ) {
            outfit = JSON.parse(image.outfit);
          }
        } catch {
          // Keep as string if parsing fails
        }

        const started = await generateStudioImages({
          characterId: image.influencerId,
          additionalDetails,
          scene: image.scene || 'candid-lifestyle',
          environment: image.environment || 'studio',
          outfit,
          poseId: image.poseId,
          aspectRatio: image.aspectRatio,
          qualityMode,
          count: 1,
          nsfw: image.nsfw ?? false,
          promptEnhance: image.promptEnhance ?? true,
          isRetry: true,
          retryImageId: image.id,
        });

        // Remove the failed image and add placeholder for new generation
        removeImage(image.id);
        const placeholderImages = createPlaceholderImages({
          jobs: started.jobs,
          influencerId: image.influencerId,
          influencerName: influencer.name || 'Unknown',
          influencerAvatar: influencer.avatar,
          aspectRatio: image.aspectRatio,
          prompt: image.prompt || additionalDetails,
          scene: image.scene,
          environment: image.environment,
          outfit: image.outfit,
          poseId: image.poseId,
          nsfw: image.nsfw ?? false,
          promptEnhance: image.promptEnhance,
          originalPrompt: image.originalPrompt,
          enhancedPrompt: image.enhancedPrompt,
        });
        addPlaceholders(placeholderImages);

        // Track active generations
        const promptIds = started.jobs.map((j) => j.promptId);
        setActiveGenerations((prev) => {
          const next = new Set(prev);
          promptIds.forEach((pid) => next.add(pid));
          return next;
        });

        // Create metadata map for polling
        const placeholderMeta = new Map<string, Partial<StudioImage>>();
        started.jobs.forEach((job) => {
          placeholderMeta.set(job.promptId, {
            influencerName: influencer.name || 'Unknown',
            influencerAvatar: influencer.avatar || undefined,
            prompt: image.prompt || additionalDetails,
            scene: image.scene,
            environment: image.environment,
            outfit: image.outfit,
            poseId: image.poseId,
            aspectRatio: image.aspectRatio,
            nsfw: image.nsfw ?? false,
            promptEnhance: image.promptEnhance,
            originalPrompt: image.originalPrompt,
            enhancedPrompt: image.enhancedPrompt,
          });
        });

        // Start background polling
        void pollGenerationResults(
          promptIds,
          image.influencerId,
          placeholderMeta
        );

        // Clear selected image to show new generation
        setSelectedImage(null);

        // Invalidate activity feed and refresh credits
        utils.activity.list.invalidate();
        utils.activity.summary.invalidate();
        refetchCredits();
      } catch (err) {
        console.error('Retry failed:', err);
      }
    },
    [
      influencers,
      removeImage,
      addPlaceholders,
      setActiveGenerations,
      setSelectedImage,
      utils,
      refetchCredits,
      pollGenerationResults,
    ]
  );

  return {
    handleGenerate,
    handleRetry,
  };
}
