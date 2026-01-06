'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import type { GeneratedImage } from '@ryla/business';

interface UseBaseImageHandlersOptions {
  handleRegenerateImage: (
    imageId: string,
    replaceBaseImage: (id: string, image: GeneratedImage) => void,
    selectBaseImage: (id: string) => void,
    selectedBaseImageId: string | null,
    fineTuneAdjustment?: string
  ) => Promise<void>;
}

/**
 * Hook for base image action handlers and computed values
 */
export function useBaseImageHandlers({
  handleRegenerateImage,
}: UseBaseImageHandlersOptions) {
  const selectedBaseImageId = useCharacterWizardStore((s) => s.selectedBaseImageId);
  const baseImageFineTunePrompt = useCharacterWizardStore((s) => s.baseImageFineTunePrompt);
  const selectBaseImage = useCharacterWizardStore((s) => s.selectBaseImage);
  const setBaseImageFineTunePrompt = useCharacterWizardStore(
    (s) => s.setBaseImageFineTunePrompt
  );
  const replaceBaseImage = useCharacterWizardStore((s) => s.replaceBaseImage);
  const baseImages = useCharacterWizardStore((s) => s.baseImages);

  const [fineTuningImageId, setFineTuningImageId] = React.useState<string | null>(null);

  const safeBaseImages = React.useMemo(
    () => (Array.isArray(baseImages) ? baseImages : []),
    [baseImages]
  );

  const handleRegenerateSingleImage = React.useCallback(
    async (imageId: string) => {
      setFineTuningImageId(imageId);
      try {
        await handleRegenerateImage(
          imageId,
          replaceBaseImage,
          selectBaseImage,
          selectedBaseImageId
        );
      } finally {
        setFineTuningImageId(null);
      }
    },
    [handleRegenerateImage, replaceBaseImage, selectBaseImage, selectedBaseImageId]
  );

  const handleFineTuneAndRegenerate = React.useCallback(async () => {
    if (!selectedBaseImageId) return;
    await handleRegenerateImage(
      selectedBaseImageId,
      replaceBaseImage,
      selectBaseImage,
      selectedBaseImageId,
      baseImageFineTunePrompt
    );
    setBaseImageFineTunePrompt('');
  }, [
    selectedBaseImageId,
    baseImageFineTunePrompt,
    handleRegenerateImage,
    replaceBaseImage,
    selectBaseImage,
    setBaseImageFineTunePrompt,
  ]);

  // Computed values
  const skeletonImages = React.useMemo(
    () => safeBaseImages.filter((img) => img.url === 'skeleton'),
    [safeBaseImages]
  );

  const hasImages = React.useMemo(
    () =>
      safeBaseImages.some(
        (img) =>
          img.url &&
          img.url !== 'skeleton' &&
          img.url !== 'loading' &&
          (img.url.startsWith('http') || img.url.startsWith('data:'))
      ),
    [safeBaseImages]
  );

  return {
    fineTuningImageId,
    safeBaseImages,
    skeletonImages,
    hasImages,
    selectedBaseImageId,
    baseImageFineTunePrompt,
    setBaseImageFineTunePrompt,
    selectBaseImage,
    handleRegenerateSingleImage,
    handleFineTuneAndRegenerate,
  };
}

