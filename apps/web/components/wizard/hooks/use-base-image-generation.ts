'use client';

import * as React from 'react';
import { useCharacterWizardStore, type GeneratedImage } from '@ryla/business';
import {
  generateBaseImagesAndWait,
  getBaseImageJobResult,
  type JobStatus,
  type GeneratedImage as APIGeneratedImage,
} from '../../../lib/api/character';
import { buildGenerationInput } from '../utils/build-generation-input';

const EXPECTED_IMAGE_COUNT = 6;

interface UseBaseImageGenerationOptions {
  expectedImageCount?: number;
}

export function useBaseImageGeneration({
  expectedImageCount = EXPECTED_IMAGE_COUNT,
}: UseBaseImageGenerationOptions = {}) {
  const form = useCharacterWizardStore((s) => s.form);
  const baseImages = useCharacterWizardStore((s) => s.baseImages);
  const _baseImageAllJobIds = useCharacterWizardStore((s) => s.baseImageAllJobIds);
  const setBaseImages = useCharacterWizardStore((s) => s.setBaseImages);
  const clearBaseImageJobIds = useCharacterWizardStore((s) => s.clearBaseImageJobIds);
  const selectBaseImage = useCharacterWizardStore((s) => s.selectBaseImage);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isPolling, setIsPolling] = React.useState(false);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [isRegeneratingAll, setIsRegeneratingAll] = React.useState(false);

  const safeBaseImages = React.useMemo(
    () => (Array.isArray(baseImages) ? baseImages : []),
    [baseImages]
  );

  const hasValidImages = React.useMemo(() => {
    if (!Array.isArray(safeBaseImages) || safeBaseImages.length === 0) {
      return false;
    }
    return safeBaseImages.some(
      (img) =>
        img.url &&
        img.url !== 'skeleton' &&
        img.url !== 'loading' &&
        (img.url.startsWith('http') || img.url.startsWith('data:'))
    );
  }, [safeBaseImages]);

  const createSkeletonImages = React.useCallback((): GeneratedImage[] => {
    const skeletons: GeneratedImage[] = [];
    for (let i = 0; i < expectedImageCount; i++) {
      skeletons.push({
        id: `skeleton-base-${i}`,
        url: 'skeleton',
        thumbnailUrl: 'skeleton',
      });
    }
    return skeletons;
  }, [expectedImageCount]);

  const pollExistingJobs = React.useCallback(
    async (jobIds: string[]) => {
      if (isPolling || hasValidImages) return;

      setIsPolling(true);
      setIsGenerating(true);
      setError(null);
      setCompletedCount(0);

      setBaseImages(createSkeletonImages());

      const completedImages: GeneratedImage[] = [];
      const pendingJobs = new Set(jobIds);
      const maxWaitTime = 10 * 60 * 1000; // 10 minutes
      const pollInterval = 2000; // 2 seconds
      const startTime = Date.now();

      try {
        while (pendingJobs.size > 0 && Date.now() - startTime < maxWaitTime) {
          const pollPromises = Array.from(pendingJobs).map(async (jobId) => {
            try {
              const result = await getBaseImageJobResult(jobId);
              return { jobId, result };
            } catch (err) {
              console.error(`Failed to poll job ${jobId}:`, err);
              return { jobId, result: null };
            }
          });

          const results = await Promise.all(pollPromises);

          for (const { jobId, result } of results) {
            if (!result) continue;

            if (result.status === 'completed' && result.images && result.images.length > 0) {
              result.images.forEach((img: APIGeneratedImage) => {
                completedImages.push(img);

                const currentImages = useCharacterWizardStore.getState().baseImages;
                const safeCurrentImages = Array.isArray(currentImages) ? currentImages : [];
                const skeletonIndex = safeCurrentImages.findIndex((i) => i.url === 'skeleton');
                if (skeletonIndex !== -1) {
                  const updatedImages = [...safeCurrentImages];
                  updatedImages[skeletonIndex] = img;
                  setBaseImages(updatedImages);
                }
              });
              pendingJobs.delete(jobId);
              setCompletedCount((prev) => prev + 1);
            } else if (result.status === 'failed') {
              pendingJobs.delete(jobId);
            }
          }

          if (pendingJobs.size > 0) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
          }
        }

        if (pendingJobs.size > 0) {
          console.warn(`Some base image jobs timed out: ${Array.from(pendingJobs).join(', ')}`);
        }
      } catch (err) {
        console.error('Polling failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to get generation results');
      } finally {
        setIsPolling(false);
        setIsGenerating(false);
      }
    },
    [isPolling, hasValidImages, setBaseImages, createSkeletonImages]
  );

  const handleGenerateAll = React.useCallback(
    async (isRegenerate = false) => {
      setIsGenerating(true);
      setError(null);
      setCompletedCount(0);

      // Always clear existing images and start with skeletons
      selectBaseImage(null);
      clearBaseImageJobIds();
      setBaseImages(createSkeletonImages());

      if (isRegenerate) {
        setIsRegeneratingAll(true);
      }

      try {
        // Use skipCreditDeduction: true for wizard flow (deferred billing)
        // Credits will be deducted at character creation time instead
        const input = buildGenerationInput(form, { skipCreditDeduction: true });

        generateBaseImagesAndWait(
          input,
          (status: JobStatus) => {
            if (status === 'completed') {
              setIsGenerating(false);
              setIsRegeneratingAll(false);
            } else if (status === 'failed') {
              setIsGenerating(false);
              setIsRegeneratingAll(false);
            }
          },
          (image: GeneratedImage) => {
            const currentImages = useCharacterWizardStore.getState().baseImages;
            const safeCurrentImages = Array.isArray(currentImages) ? currentImages : [];
            const skeletonIndex = safeCurrentImages.findIndex((img) => img.url === 'skeleton');

            if (skeletonIndex !== -1) {
              // Replace skeleton with actual image
              const updatedImages = [...safeCurrentImages];
              updatedImages[skeletonIndex] = image;
              setBaseImages(updatedImages);
            } else if (safeCurrentImages.length < expectedImageCount) {
              // Only add if we haven't reached the expected count
              setBaseImages([...safeCurrentImages, image]);
            }
            // Ignore images beyond expectedImageCount

            setCompletedCount((prev) => {
              const newCount = prev + 1;
              if (newCount >= expectedImageCount) {
                setIsGenerating(false);
                setIsRegeneratingAll(false);
              }
              return newCount;
            });
          }
        ).catch((err) => {
          console.error('Generation failed:', err);
          setError(err instanceof Error ? err.message : 'Generation failed');
          setIsGenerating(false);
          setIsRegeneratingAll(false);
        });
      } catch (err) {
        console.error('Generation failed:', err);
        setError(err instanceof Error ? err.message : 'Generation failed');
        setIsGenerating(false);
        setIsRegeneratingAll(false);
      }
    },
    [
      form,
      selectBaseImage,
      clearBaseImageJobIds,
      setBaseImages,
      createSkeletonImages,
      expectedImageCount,
    ]
  );

  const handleRegenerateImage = React.useCallback(
    async (
      imageId: string,
      replaceBaseImage: (id: string, image: GeneratedImage) => void,
      selectBaseImage: (id: string) => void,
      selectedBaseImageId: string | null,
      fineTuneAdjustment?: string
    ) => {
      const image = safeBaseImages.find((img) => img.id === imageId);
      if (!image) return;

      setError(null);
      replaceBaseImage(imageId, { ...image, url: 'loading', thumbnailUrl: 'loading' });

      try {
        // Use skipCreditDeduction: true for wizard flow (deferred billing)
        const input = buildGenerationInput(form, { 
          fineTuneAdjustment, 
          skipCreditDeduction: true 
        });
        const images = await generateBaseImagesAndWait(input, () => {});

        if (images.length > 0) {
          replaceBaseImage(imageId, images[0]);
          if (selectedBaseImageId === imageId) {
            selectBaseImage(images[0].id);
          }
        }
      } catch (err) {
        console.error('Regeneration failed:', err);
        setError(err instanceof Error ? err.message : 'Regeneration failed');
        replaceBaseImage(imageId, image);
      }
    },
    [form, safeBaseImages]
  );

  return {
    isGenerating,
    isPolling,
    completedCount,
    error,
    setError,
    isRegeneratingAll,
    hasValidImages,
    safeBaseImages,
    expectedImageCount,
    pollExistingJobs,
    handleGenerateAll,
    handleRegenerateImage,
  };
}

