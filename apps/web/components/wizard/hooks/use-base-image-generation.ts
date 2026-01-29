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
  const [connectionError, setConnectionError] = React.useState(false);
  const retryCountRef = React.useRef(0);

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

      // Initialize with skeletons matching job count
      const initialSkeletons = Array.from({ length: jobIds.length }, (_, i) => ({
        id: `skeleton-base-${i}`,
        url: 'skeleton' as const,
        thumbnailUrl: 'skeleton' as const,
      }));
      setBaseImages(initialSkeletons);

      const completedImages: GeneratedImage[] = [];
      const pendingJobs = new Map(jobIds.map((id, idx) => [id, idx])); // Track jobId -> skeleton index
      const maxWaitTime = 10 * 60 * 1000; // 10 minutes
      const pollInterval = 2000; // 2 seconds
      const startTime = Date.now();

      try {
        while (pendingJobs.size > 0 && Date.now() - startTime < maxWaitTime) {
          const pollPromises = Array.from(pendingJobs.keys()).map(async (jobId) => {
            try {
              const result = await getBaseImageJobResult(jobId);
              return { jobId, result };
            } catch (err) {
              console.error(`Failed to poll job ${jobId}:`, err);
              return { jobId, result: null, error: err };
            }
          });

          const results = await Promise.all(pollPromises);

          for (const { jobId, result, error } of results) {
            const skeletonIndex = pendingJobs.get(jobId);
            if (skeletonIndex === undefined) continue;

            const currentImages = useCharacterWizardStore.getState().baseImages;
            const safeCurrentImages = Array.isArray(currentImages) ? currentImages : [];

            if (error || !result) {
              // Mark as failed
              const updatedImages = [...safeCurrentImages];
              if (updatedImages[skeletonIndex]) {
                updatedImages[skeletonIndex] = {
                  id: `failed-${jobId}`,
                  url: 'failed',
                  thumbnailUrl: 'failed',
                };
                setBaseImages(updatedImages);
              }
              pendingJobs.delete(jobId);
              continue;
            }

            if (result.status === 'completed' && result.images && result.images.length > 0) {
              result.images.forEach((img: APIGeneratedImage) => {
                completedImages.push(img);

                // Replace skeleton at the correct index
                const updatedImages = [...safeCurrentImages];
                if (updatedImages[skeletonIndex]) {
                  updatedImages[skeletonIndex] = img;
                  setBaseImages(updatedImages);
                } else {
                  // Fallback: find any skeleton
                  const fallbackIndex = updatedImages.findIndex((i) => i.url === 'skeleton');
                  if (fallbackIndex !== -1) {
                    updatedImages[fallbackIndex] = img;
                    setBaseImages(updatedImages);
                  }
                }
              });
              pendingJobs.delete(jobId);
              setCompletedCount((prev) => prev + 1);
            } else if (result.status === 'failed') {
              // Mark as failed
              const updatedImages = [...safeCurrentImages];
              if (updatedImages[skeletonIndex]) {
                updatedImages[skeletonIndex] = {
                  id: `failed-${jobId}`,
                  url: 'failed',
                  thumbnailUrl: 'failed',
                  error: result.error || 'Generation failed',
                };
                setBaseImages(updatedImages);
              }
              pendingJobs.delete(jobId);
            } else if (result.status === 'in_progress' || result.status === 'queued') {
              // Still in progress, keep polling
              continue;
            }
          }

          if (pendingJobs.size > 0) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
          }
        }

        if (pendingJobs.size > 0) {
          console.warn(`Some base image jobs timed out: ${Array.from(pendingJobs.keys()).join(', ')}`);
          // Mark timed out jobs as failed
          const currentImages = useCharacterWizardStore.getState().baseImages;
          const safeCurrentImages = Array.isArray(currentImages) ? currentImages : [];
          const updatedImages = [...safeCurrentImages];
          
          for (const [jobId, skeletonIndex] of pendingJobs.entries()) {
            if (updatedImages[skeletonIndex]) {
              updatedImages[skeletonIndex] = {
                id: `timeout-${jobId}`,
                url: 'failed',
                thumbnailUrl: 'failed',
                error: 'Job timed out',
              };
            }
          }
          setBaseImages(updatedImages);
        }
      } catch (err) {
        console.error('Polling failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to get generation results');
      } finally {
        setIsPolling(false);
        setIsGenerating(false);
      }
    },
    [isPolling, hasValidImages, setBaseImages]
  );

  const handleGenerateAll = React.useCallback(
    async (isRegenerate = false, isManualRetry = false) => {
      // Prevent multiple simultaneous generation requests
      if (isGenerating || isPolling) {
        console.warn('Generation already in progress, skipping duplicate request');
        return;
      }

      // Reset retry count and error state on manual retry
      if (isManualRetry) {
        retryCountRef.current = 0;
        setConnectionError(false);
        setError(null);
        // Reset permanent failure flag in initialization hook
        // This is handled by the component calling with isManualRetry=true
      }

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

      const MAX_RETRIES = 3;
      const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

      try {
        // Use skipCreditDeduction: true for wizard flow (deferred billing)
        // Credits will be deducted at character creation time instead
        const input = buildGenerationInput(form, { skipCreditDeduction: true });

        await generateBaseImagesAndWait(
          input,
          (status: JobStatus) => {
            if (status === 'completed') {
              setIsGenerating(false);
              setIsRegeneratingAll(false);
              retryCountRef.current = 0; // Reset on success
              setConnectionError(false);
            } else if (status === 'failed') {
              setIsGenerating(false);
              setIsRegeneratingAll(false);
            }
          },
          (image: GeneratedImage, index: number) => {
            const currentImages = useCharacterWizardStore.getState().baseImages;
            const safeCurrentImages = Array.isArray(currentImages) ? currentImages : [];
            
            // Try to replace skeleton at the expected index first
            if (index >= 0 && index < safeCurrentImages.length && safeCurrentImages[index]?.url === 'skeleton') {
              const updatedImages = [...safeCurrentImages];
              updatedImages[index] = image;
              setBaseImages(updatedImages);
            } else {
              // Fallback: find first skeleton
              const skeletonIndex = safeCurrentImages.findIndex((img) => img.url === 'skeleton');
              if (skeletonIndex !== -1) {
                const updatedImages = [...safeCurrentImages];
                updatedImages[skeletonIndex] = image;
                setBaseImages(updatedImages);
              } else if (safeCurrentImages.length < expectedImageCount) {
                // Only add if we haven't reached the expected count
                setBaseImages([...safeCurrentImages, image]);
              }
            }

            setCompletedCount((prev) => {
              const newCount = prev + 1;
              // Don't auto-stop generation - let it complete naturally
              // Some jobs may fail, so we check completion in the progress callback
              return newCount;
            });
          }
        );
        // Success - reset retry count
        retryCountRef.current = 0;
        setConnectionError(false);
      } catch (err) {
        console.error('Generation failed:', err);
        
        const errorMessage = err instanceof Error ? err.message : 'Generation failed';
        const isConnectionError = 
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('connection');

        if (isConnectionError && retryCountRef.current < MAX_RETRIES) {
          // Retry with exponential backoff
          retryCountRef.current += 1;
          const delay = RETRY_DELAYS[retryCountRef.current - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
          
          console.log(`Connection error, retrying (${retryCountRef.current}/${MAX_RETRIES}) after ${delay}ms...`);
          
          setTimeout(() => {
            handleGenerateAll(isRegenerate, false);
          }, delay);
          
          setError(`Connection failed. Retrying... (${retryCountRef.current}/${MAX_RETRIES})`);
          return; // Don't set generating to false yet - we're retrying
        }

        // Max retries reached or non-connection error
        if (isConnectionError) {
          setConnectionError(true);
          setError('Unable to connect to server. Please check your connection and try again.');
        } else {
          setError(errorMessage);
        }
        
        setIsGenerating(false);
        setIsRegeneratingAll(false);
        retryCountRef.current = 0; // Reset for next manual attempt
      }
    },
    [
      form,
      selectBaseImage,
      clearBaseImageJobIds,
      setBaseImages,
      createSkeletonImages,
      expectedImageCount,
      isGenerating,
      isPolling,
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
    connectionError,
    isRegeneratingAll,
    hasValidImages,
    safeBaseImages,
    expectedImageCount,
    pollExistingJobs,
    handleGenerateAll,
    handleRegenerateImage,
  };
}

