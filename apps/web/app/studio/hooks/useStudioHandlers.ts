'use client';

import * as React from 'react';
import type { StudioImage } from '../../../components/studio/studio-image-card';
import type { OutfitComposition } from '@ryla/shared';
import { useImageActions } from './useImageActions';
import { useGenerationActions } from './useGenerationActions';
import { useUploadActions } from './useUploadActions';

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
  replaceImage: (oldImageId: string, newImage: StudioImage) => void;
  removeImage: (imageId: string) => void;
  addPlaceholders: (placeholders: StudioImage[]) => void;
  setActiveGenerations: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectedImage: React.Dispatch<React.SetStateAction<StudioImage | null>>;
  setShowPanel: (show: boolean) => void;
  setSelectedInfluencerId: (id: string | null) => void;
  setMode: (
    mode: import('../../../components/studio/generation').StudioMode
  ) => void;
  utils: ReturnType<typeof import('../../../lib/trpc').trpc.useUtils>;
  refetchCredits: () => void;
  uploadImageMutation: ReturnType<
    typeof import('../../../lib/trpc').trpc.user.uploadObjectImage.useMutation
  >;
}

/**
 * Hook for all studio action handlers
 * Orchestrates image actions, generation actions, and upload actions
 */
export function useStudioHandlers({
  influencers,
  selectedInfluencerId,
  refreshImages,
  updateImage,
  replaceImage,
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
  // Extract image actions (like, delete, download)
  const imageActions = useImageActions({
    updateImage,
    removeImage,
    setSelectedImage,
    refreshImages,
    selectedInfluencerId,
  });

  // Extract generation actions (generate, retry)
  const generationActions = useGenerationActions({
    influencers,
    addPlaceholders,
    removeImage,
    updateImage,
    replaceImage,
    setActiveGenerations,
    setSelectedImage,
    refreshImages,
    utils,
    refetchCredits,
  });

  // Extract upload actions
  const uploadActions = useUploadActions({
    uploadImageMutation,
  });

  // Handle image selection (select only)
  const handleSelectImage = React.useCallback(
    (image: StudioImage | null) => {
      imageActions.handleSelectImage(
        image,
        setSelectedInfluencerId,
        selectedInfluencerId
      );
    },
    [imageActions, setSelectedInfluencerId, selectedInfluencerId]
  );

  // Handle opening details (select + show panel)
  const handleOpenDetails = React.useCallback(
    (image: StudioImage) => {
      imageActions.handleSelectImage(
        image,
        setSelectedInfluencerId,
        selectedInfluencerId
      );
      setShowPanel(true);
    },
    [imageActions, setSelectedInfluencerId, selectedInfluencerId, setShowPanel]
  );

  // Handle close panel
  const handleClosePanel = React.useCallback(() => {
    setSelectedImage(null);
    setShowPanel(false);
  }, [setSelectedImage, setShowPanel]);

  // Handle clear selected image
  const handleClearSelectedImage = React.useCallback(
    (
      currentMode: import('../../../components/studio/generation').StudioMode
    ) => {
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
    // Image actions
    handleLike: imageActions.handleLike,
    handleDelete: imageActions.handleDelete,
    handleDownload: imageActions.handleDownload,
    handleSelectImage,
    handleOpenDetails,
    // Generation actions

    handleGenerate: generationActions.handleGenerate,
    handleRetry: generationActions.handleRetry,
    // Upload actions
    handleUploadImage: uploadActions.handleUploadImage,
    // Panel management
    handleClosePanel,
    handleClearSelectedImage,
  };
}
