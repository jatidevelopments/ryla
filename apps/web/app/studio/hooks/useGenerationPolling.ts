'use client';

import * as React from 'react';
import { getComfyUIResults } from '../../../lib/api/studio';
import { POLLING_TIMEOUT_MS, POLLING_INTERVAL_MS } from '../constants';
import type { StudioImage } from '../../../components/studio/studio-image-card';

// Estimated generation time in ms (used for progress calculation)
const ESTIMATED_GENERATION_TIME_MS = 45 * 1000; // 45 seconds typical
const QUEUE_TIME_ESTIMATE_MS = 5 * 1000; // 5 seconds in queue

interface UseGenerationPollingOptions {
  setActiveGenerations: React.Dispatch<React.SetStateAction<Set<string>>>;
  updateImage: (imageId: string, updates: Partial<StudioImage>) => void;
  replaceImage: (oldImageId: string, newImage: StudioImage) => void;
  utils: ReturnType<typeof import('../../../lib/trpc').trpc.useUtils>;
}

interface JobProgress {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  startedAt?: number; // Timestamp when processing started
  progress: number; // 0-100
}

/**
 * Calculate progress percentage based on job status and elapsed time
 */
function calculateProgress(
  status: 'queued' | 'processing' | 'completed' | 'failed',
  startedAt?: number,
  jobCreatedAt?: number
): number {
  if (status === 'completed') return 100;
  if (status === 'failed') return 0;

  const now = Date.now();

  if (status === 'queued') {
    // In queue: show 0-15% based on time in queue
    if (!jobCreatedAt) return 5;
    const timeInQueue = now - jobCreatedAt;
    const queueProgress = Math.min(
      15,
      (timeInQueue / QUEUE_TIME_ESTIMATE_MS) * 15
    );
    return Math.max(1, queueProgress);
  }

  if (status === 'processing') {
    // Processing: show 15-95% based on estimated time
    const processingStartTime = startedAt || now;
    const elapsedProcessing = now - processingStartTime;
    // Use easing function for more natural progress feel
    const rawProgress = elapsedProcessing / ESTIMATED_GENERATION_TIME_MS;
    // Asymptotic progress: approaches 95% but never reaches it until complete
    const easedProgress = 1 - Math.exp(-rawProgress * 2);
    return Math.min(95, 15 + easedProgress * 80);
  }

  return 0;
}

/**
 * Hook for polling generation results in the background
 * Updates images as they complete and manages active generation tracking
 *
 * Key optimization: When a job completes, we directly update the placeholder
 * with the real image data instead of refetching ALL images from the server.
 */
export function useGenerationPolling({
  setActiveGenerations,
  updateImage,
  replaceImage,
  utils,
}: UseGenerationPollingOptions) {
  // Track job progress states
  const jobProgressRef = React.useRef<Map<string, JobProgress>>(new Map());
  const jobCreatedAtRef = React.useRef<Map<string, number>>(new Map());
  // Track placeholder metadata so we can create proper StudioImage when complete
  const placeholderMetaRef = React.useRef<Map<string, Partial<StudioImage>>>(
    new Map()
  );

  const pollGenerationResults = React.useCallback(
    async (
      promptIds: string[],
      characterId: string,
      placeholderMeta?: Map<string, Partial<StudioImage>>
    ) => {
      const timeoutMs = POLLING_TIMEOUT_MS;
      const start = Date.now();
      const completedPromptIds = new Set<string>();

      // Initialize created timestamps for new jobs
      promptIds.forEach((pid) => {
        if (!jobCreatedAtRef.current.has(pid)) {
          jobCreatedAtRef.current.set(pid, Date.now());
        }
      });

      // Store placeholder metadata if provided
      if (placeholderMeta) {
        placeholderMeta.forEach((meta, pid) => {
          placeholderMetaRef.current.set(pid, meta);
        });
      }

      while (
        Date.now() - start < timeoutMs &&
        completedPromptIds.size < promptIds.length
      ) {
        try {
          // Poll all remaining promptIds
          const remainingPromptIds = promptIds.filter(
            (pid) => !completedPromptIds.has(pid)
          );
          const results = await Promise.all(
            remainingPromptIds.map((pid) => getComfyUIResults(pid))
          );

          // Update progress for each job
          results.forEach((result, index) => {
            const promptId = remainingPromptIds[index];
            const placeholderId = `placeholder-${promptId}`;

            // Get or initialize job progress
            let jobProgress = jobProgressRef.current.get(promptId);
            const prevStatus = jobProgress?.status;

            // Track when processing starts
            if (result.status === 'processing' && prevStatus !== 'processing') {
              jobProgress = {
                status: 'processing',
                startedAt: Date.now(),
                progress: 15,
              };
              jobProgressRef.current.set(promptId, jobProgress);
            }

            // Calculate current progress
            const progress = calculateProgress(
              result.status,
              jobProgress?.startedAt,
              jobCreatedAtRef.current.get(promptId)
            );

            // Handle completed jobs - directly update the image in local state
            if (
              result.status === 'completed' &&
              result.images &&
              result.images.length > 0
            ) {
              if (!completedPromptIds.has(promptId)) {
                completedPromptIds.add(promptId);

                // Get the first completed image
                const completedImage = result.images[0];
                const meta = placeholderMetaRef.current.get(promptId) || {};

                // Create the new StudioImage from the result
                const newImage: StudioImage = {
                  id: completedImage.id,
                  imageUrl: completedImage.url,
                  thumbnailUrl: completedImage.thumbnailUrl,
                  influencerId: characterId,
                  influencerName: meta.influencerName || 'Unknown',
                  influencerAvatar: meta.influencerAvatar,
                  prompt: meta.prompt,
                  scene: meta.scene,
                  environment: meta.environment,
                  outfit: meta.outfit,
                  poseId: meta.poseId,
                  aspectRatio: meta.aspectRatio || '9:16',
                  status: 'completed',
                  createdAt: new Date().toISOString(),
                  isLiked: false,
                  nsfw: meta.nsfw,
                  promptEnhance: meta.promptEnhance,
                  originalPrompt: meta.originalPrompt,
                  enhancedPrompt: meta.enhancedPrompt,
                  progress: 100,
                };

                // Replace the placeholder with the real image
                replaceImage(placeholderId, newImage);

                // Clean up tracking
                jobProgressRef.current.delete(promptId);
                jobCreatedAtRef.current.delete(promptId);
                placeholderMetaRef.current.delete(promptId);
              }
            } else if (result.status === 'failed') {
              if (!completedPromptIds.has(promptId)) {
                completedPromptIds.add(promptId);
                // Update placeholder to show failed state
                updateImage(placeholderId, {
                  status: 'failed',
                  progress: 0,
                });
                // Clean up tracking
                jobProgressRef.current.delete(promptId);
                jobCreatedAtRef.current.delete(promptId);
                placeholderMetaRef.current.delete(promptId);
              }
            } else {
              // Still in progress - just update progress
              updateImage(placeholderId, { progress });
            }
          });

          // If all done, clean up
          if (completedPromptIds.size === promptIds.length) {
            setActiveGenerations((prev) => {
              const next = new Set(prev);
              promptIds.forEach((pid) => next.delete(pid));
              return next;
            });
            utils.notifications.list.invalidate();
            break;
          }

          await new Promise((r) => setTimeout(r, POLLING_INTERVAL_MS));
        } catch (err) {
          console.error('Polling error:', err);
          await new Promise((r) => setTimeout(r, POLLING_INTERVAL_MS));
        }
      }

      // Clean up on timeout
      setActiveGenerations((prev) => {
        const next = new Set(prev);
        promptIds.forEach((pid) => next.delete(pid));
        return next;
      });
      // Clean up any remaining tracking
      promptIds.forEach((pid) => {
        jobProgressRef.current.delete(pid);
        jobCreatedAtRef.current.delete(pid);
        placeholderMetaRef.current.delete(pid);
      });
    },
    [setActiveGenerations, updateImage, replaceImage, utils]
  );

  return { pollGenerationResults };
}
