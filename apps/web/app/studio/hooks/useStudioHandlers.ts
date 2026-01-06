'use client';

import * as React from 'react';
import type { StudioImage } from '../../../components/studio/studio-image-card';
import type { GenerationSettings } from '../../../components/studio/generation';
import type { OutfitComposition } from '@ryla/shared';
import {
  deleteImage,
  generateStudioImages,
  likeImage,
} from '../../../lib/api/studio';
import {
  DEFAULT_ASPECT_RATIO,
  SUPPORTED_ASPECT_RATIOS,
} from '../constants';
import { useGenerationPolling } from './useGenerationPolling';
import { fileToBase64, uploadResultToStudioImage } from '../utils/image-upload';
import { createSafeImageCopy } from '../utils/image-selection';
import { createPlaceholderImages } from '../utils/placeholder-images';

interface Influencer {
  id: string;
  name: string;
  avatar?: string | null;
  outfit?: string | OutfitComposition;
}

interface UseStudioHandlersOptions {
  influencers: Influencer[];
  selectedInfluencerId: string | null;
  refreshImages: (characterId: string) => Promise<void>;
  updateImage: (imageId: string, updates: Partial<StudioImage>) => void;
  removeImage: (imageId: string) => void;
  addPlaceholders: (placeholders: StudioImage[]) => void;
  setActiveGenerations: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectedImage: React.Dispatch<React.SetStateAction<StudioImage | null>>;
  setShowPanel: (show: boolean) => void;
  setSelectedInfluencerId: (id: string | null) => void;
  setMode: (mode: import('../../../components/studio/generation').StudioMode) => void;
  utils: ReturnType<typeof import('../../../lib/trpc').trpc.useUtils>;
  refetchCredits: () => void;
  uploadImageMutation: ReturnType<
    typeof import('../../../lib/trpc').trpc.user.uploadObjectImage.useMutation
  >;
}

/**
 * Hook for all studio action handlers
 */
export function useStudioHandlers({
  influencers,
  selectedInfluencerId,
  refreshImages,
  updateImage,
  removeImage,
  addPlaceholders,
  setActiveGenerations,
  setSelectedImage,
  setShowPanel,
  setSelectedInfluencerId,
  setMode,
  utils,
  refetchCredits,
  uploadImageMutation,
}: UseStudioHandlersOptions) {
  // Extract polling logic to separate hook
  const { pollGenerationResults } = useGenerationPolling({
    refreshImages,
    setActiveGenerations,
    utils,
  });
  // Handle image selection
  const handleSelectImage = React.useCallback(
    (image: StudioImage | null) => {
      if (image) {
        // Create a safe copy without circular references
        const safeImage = createSafeImageCopy(image);
        setSelectedImage(safeImage);
        setShowPanel(true);
        // Auto-select the influencer associated with the image
        if (
          safeImage.influencerId &&
          safeImage.influencerId !== selectedInfluencerId
        ) {
          setSelectedInfluencerId(safeImage.influencerId);
        }
      } else {
        setSelectedImage(null);
      }
    },
    [selectedInfluencerId, setSelectedImage, setShowPanel, setSelectedInfluencerId]
  );
  // Handle like
  const handleLike = React.useCallback(
    async (imageId: string) => {
      try {
        const res = await likeImage(imageId);
        updateImage(imageId, { isLiked: res.liked });
        // Update selectedImage if it's the one being liked
        setSelectedImage((prev) => {
          if (prev?.id === imageId) {
            return { ...prev, isLiked: res.liked };
          }
          return prev;
        });
      } catch (err) {
        console.error('Like failed:', err);
      }
    },
    [updateImage, setSelectedImage]
  );

  // Handle delete
  const handleDelete = React.useCallback(
    async (imageId: string) => {
      try {
        await deleteImage(imageId);
        // Clear selectedImage if it's the one being deleted
        setSelectedImage((prev) => (prev?.id === imageId ? null : prev));
        if (selectedInfluencerId) {
          await refreshImages(selectedInfluencerId);
        } else {
          removeImage(imageId);
        }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    },
    [selectedInfluencerId, refreshImages, removeImage, setSelectedImage]
  );

  // Handle download
  const handleDownload = React.useCallback(async (image: StudioImage) => {
    if (!image.imageUrl) return;

    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ryla-${image.influencerName
        .toLowerCase()
        .replace(/\s+/g, '-')}-${image.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, []);

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
          if (typeof image.outfit === 'string' && image.outfit.startsWith('{')) {
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

        // Start background polling
        void pollGenerationResults(promptIds, image.influencerId);

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


  // Handle generate - non-blocking with optimistic updates
  const handleGenerate = React.useCallback(
    async (settings: GenerationSettings) => {
      if (!settings.influencerId) return;
      const influencer = influencers.find((i) => i.id === settings.influencerId);
      if (!influencer) return;

      const aspectRatio = SUPPORTED_ASPECT_RATIOS.has(settings.aspectRatio)
        ? (settings.aspectRatio as '1:1' | '9:16' | '2:3')
        : DEFAULT_ASPECT_RATIO;

      const qualityMode = settings.quality === '1.5k' ? 'draft' : 'hq';

      try {
        const started = await generateStudioImages({
          characterId: settings.influencerId,
          additionalDetails: settings.prompt?.trim() || undefined,
          scene: settings.sceneId || 'candid-lifestyle',
          environment: 'studio',
          outfit: settings.outfit || influencer.outfit || 'casual',
          poseId: settings.poseId || undefined,
          lighting: settings.lightingId || undefined,
          aspectRatio,
          qualityMode,
          count: Math.max(1, Math.min(10, settings.batchSize)),
          nsfw: settings.nsfw ?? false,
          promptEnhance: settings.promptEnhance ?? true,
        });

        // Create placeholder images immediately
        const placeholderImages = createPlaceholderImages({
          jobs: started.jobs,
          influencerId: settings.influencerId!,
          influencerName: influencer.name || 'Unknown',
          influencerAvatar: influencer.avatar,
          aspectRatio,
          prompt: settings.prompt,
          scene: settings.sceneId || 'candid-lifestyle',
          environment: 'studio',
          nsfw: settings.nsfw ?? false,
          promptEnhance: settings.promptEnhance ?? true,
        });

        // Add placeholders to state immediately
        addPlaceholders(placeholderImages);

        // Track active generations
        const promptIds = started.jobs.map((j) => j.promptId);
        setActiveGenerations((prev) => {
          const next = new Set(prev);
          promptIds.forEach((pid) => next.add(pid));
          return next;
        });

        // Start background polling (non-blocking)
        void pollGenerationResults(promptIds, settings.influencerId);

        // Invalidate activity feed and refresh credits immediately
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

  // Handle upload image
  const handleUploadImage = React.useCallback(
    async (file: File): Promise<StudioImage | null> => {
      try {
        const base64 = await fileToBase64(file);
        const result = await uploadImageMutation.mutateAsync({
          imageBase64: base64,
          name: file.name,
        });
        return uploadResultToStudioImage(result);
      } catch (err) {
        console.error('Upload failed:', err);
        return null;
      }
    },
    [uploadImageMutation]
  );

  // Handle close panel
  const handleClosePanel = React.useCallback(() => {
    setSelectedImage(null);
    setShowPanel(false);
  }, [setSelectedImage, setShowPanel]);

  // Handle clear selected image
  const handleClearSelectedImage = React.useCallback(
    (currentMode: import('../../../components/studio/generation').StudioMode) => {
      setSelectedImage(null);
      setShowPanel(false);
      // Switch back to creating mode when clearing selection
      if (currentMode !== 'creating') {
        setMode('creating');
      }
    },
    [setSelectedImage, setShowPanel, setMode]
  );

  return {
    handleLike,
    handleDelete,
    handleDownload,
    handleRetry,
    handleGenerate,
    handleUploadImage,
    handleClosePanel,
    handleClearSelectedImage,
    handleSelectImage,
  };
}

