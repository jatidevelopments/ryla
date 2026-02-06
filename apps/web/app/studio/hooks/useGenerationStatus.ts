'use client';

import * as React from 'react';
import { useSocket } from '../../../lib/socket-context';
import { useGenerationSocket } from '../../../lib/hooks/use-generation-socket';
import { getComfyUIResults } from '../../../lib/api/studio';
import { POLLING_TIMEOUT_MS, POLLING_INTERVAL_MS } from '../constants';
import type { StudioImage } from '../../../components/studio/studio-image-card';
import type { GenerationCompletePayload, GenerationErrorPayload, GenerationProgressPayload } from '@ryla/shared';

// Estimated generation time in ms (used for progress calculation)
const ESTIMATED_GENERATION_TIME_MS = 45 * 1000; // 45 seconds typical
const QUEUE_TIME_ESTIMATE_MS = 5 * 1000; // 5 seconds in queue

interface UseGenerationStatusOptions {
  setActiveGenerations: React.Dispatch<React.SetStateAction<Set<string>>>;
  updateImage: (imageId: string, updates: Partial<StudioImage>) => void;
  replaceImage: (oldImageId: string, newImage: StudioImage) => void;
  utils: ReturnType<typeof import('../../../lib/trpc').trpc.useUtils>;
}

interface JobProgress {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  startedAt?: number;
  progress: number;
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
    if (!jobCreatedAt) return 5;
    const timeInQueue = now - jobCreatedAt;
    const queueProgress = Math.min(15, (timeInQueue / QUEUE_TIME_ESTIMATE_MS) * 15);
    return Math.max(1, queueProgress);
  }

  if (status === 'processing') {
    const processingStartTime = startedAt || now;
    const elapsedProcessing = now - processingStartTime;
    const rawProgress = elapsedProcessing / ESTIMATED_GENERATION_TIME_MS;
    const easedProgress = 1 - Math.exp(-rawProgress * 2);
    return Math.min(95, 15 + easedProgress * 80);
  }

  return 0;
}

/**
 * Hook for tracking generation status via WebSocket with polling fallback
 * 
 * Uses WebSocket for real-time updates when connected.
 * Falls back to polling when WebSocket is not available.
 */
export function useGenerationStatus({
  setActiveGenerations,
  updateImage,
  replaceImage,
  utils,
}: UseGenerationStatusOptions) {
  const { isConnected: socketConnected } = useSocket();
  
  // Track job progress states
  const jobProgressRef = React.useRef<Map<string, JobProgress>>(new Map());
  const jobCreatedAtRef = React.useRef<Map<string, number>>(new Map());
  const placeholderMetaRef = React.useRef<Map<string, Partial<StudioImage>>>(new Map());
  
  // Track which jobs are using socket vs polling
  const socketJobsRef = React.useRef<Set<string>>(new Set());

  // Handle WebSocket progress updates
  const handleSocketProgress = React.useCallback((payload: GenerationProgressPayload) => {
    const placeholderId = `placeholder-${payload.promptId}`;
    updateImage(placeholderId, { progress: payload.progress });
  }, [updateImage]);

  // Handle WebSocket completion
  const handleSocketComplete = React.useCallback((payload: GenerationCompletePayload) => {
    const placeholderId = `placeholder-${payload.promptId}`;
    const meta = placeholderMetaRef.current.get(payload.promptId) || {};
    
    if (payload.images && payload.images.length > 0) {
      const completedImage = payload.images[0];
      const newImage: StudioImage = {
        id: completedImage.id,
        imageUrl: completedImage.url,
        thumbnailUrl: completedImage.thumbnailUrl,
        influencerId: payload.characterId,
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
      
      replaceImage(placeholderId, newImage);
    }
    
    // Clean up tracking
    setActiveGenerations((prev) => {
      const next = new Set(prev);
      next.delete(payload.promptId);
      return next;
    });
    
    socketJobsRef.current.delete(payload.promptId);
    jobProgressRef.current.delete(payload.promptId);
    jobCreatedAtRef.current.delete(payload.promptId);
    placeholderMetaRef.current.delete(payload.promptId);
    
    utils.notifications.list.invalidate();
  }, [replaceImage, setActiveGenerations, utils]);

  // Handle WebSocket error
  const handleSocketError = React.useCallback((payload: GenerationErrorPayload) => {
    const placeholderId = `placeholder-${payload.promptId}`;
    updateImage(placeholderId, { status: 'failed', progress: 0 });
    
    setActiveGenerations((prev) => {
      const next = new Set(prev);
      next.delete(payload.promptId);
      return next;
    });
    
    socketJobsRef.current.delete(payload.promptId);
    jobProgressRef.current.delete(payload.promptId);
    jobCreatedAtRef.current.delete(payload.promptId);
    placeholderMetaRef.current.delete(payload.promptId);
  }, [updateImage, setActiveGenerations]);

  // Set up socket listeners
  const { subscribe: socketSubscribe } = useGenerationSocket({
    onProgress: handleSocketProgress,
    onComplete: handleSocketComplete,
    onError: handleSocketError,
  });

  // Polling fallback for when WebSocket is not connected
  const pollGenerationResults = React.useCallback(
    async (
      promptIds: string[],
      characterId: string,
      placeholderMeta?: Map<string, Partial<StudioImage>>
    ) => {
      // Store metadata
      if (placeholderMeta) {
        placeholderMeta.forEach((meta, pid) => {
          placeholderMetaRef.current.set(pid, meta);
        });
      }

      // Initialize timestamps
      promptIds.forEach((pid) => {
        if (!jobCreatedAtRef.current.has(pid)) {
          jobCreatedAtRef.current.set(pid, Date.now());
        }
      });

      // If socket is connected, use WebSocket for updates
      if (socketConnected) {
        console.log('[Generation] Using WebSocket for status updates');
        promptIds.forEach((pid) => socketJobsRef.current.add(pid));
        socketSubscribe(promptIds);
        return;
      }

      // Fall back to polling
      console.log('[Generation] WebSocket not connected, using polling fallback');
      await pollWithFallback(promptIds, characterId);
    },
    [socketConnected, socketSubscribe]
  );

  // Actual polling implementation (fallback)
  const pollWithFallback = React.useCallback(
    async (promptIds: string[], characterId: string) => {
      const timeoutMs = POLLING_TIMEOUT_MS;
      const start = Date.now();
      const completedPromptIds = new Set<string>();

      while (
        Date.now() - start < timeoutMs &&
        completedPromptIds.size < promptIds.length
      ) {
        try {
          const remainingPromptIds = promptIds.filter(
            (pid) => !completedPromptIds.has(pid)
          );
          const results = await Promise.all(
            remainingPromptIds.map((pid) => getComfyUIResults(pid))
          );

          results.forEach((result, index) => {
            const promptId = remainingPromptIds[index];
            const placeholderId = `placeholder-${promptId}`;

            let jobProgress = jobProgressRef.current.get(promptId);
            const prevStatus = jobProgress?.status;

            if (result.status === 'processing' && prevStatus !== 'processing') {
              jobProgress = {
                status: 'processing',
                startedAt: Date.now(),
                progress: 15,
              };
              jobProgressRef.current.set(promptId, jobProgress);
            }

            const progress = calculateProgress(
              result.status,
              jobProgress?.startedAt,
              jobCreatedAtRef.current.get(promptId)
            );

            if (
              result.status === 'completed' &&
              result.images &&
              result.images.length > 0
            ) {
              if (!completedPromptIds.has(promptId)) {
                completedPromptIds.add(promptId);

                const completedImage = result.images[0];
                const meta = placeholderMetaRef.current.get(promptId) || {};

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

                replaceImage(placeholderId, newImage);
                jobProgressRef.current.delete(promptId);
                jobCreatedAtRef.current.delete(promptId);
                placeholderMetaRef.current.delete(promptId);
              }
            } else if (result.status === 'failed') {
              if (!completedPromptIds.has(promptId)) {
                completedPromptIds.add(promptId);
                updateImage(placeholderId, { status: 'failed', progress: 0 });
                jobProgressRef.current.delete(promptId);
                jobCreatedAtRef.current.delete(promptId);
                placeholderMetaRef.current.delete(promptId);
              }
            } else {
              updateImage(placeholderId, { progress });
            }
          });

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
      promptIds.forEach((pid) => {
        jobProgressRef.current.delete(pid);
        jobCreatedAtRef.current.delete(pid);
        placeholderMetaRef.current.delete(pid);
      });
    },
    [setActiveGenerations, updateImage, replaceImage, utils]
  );

  return { 
    pollGenerationResults,
    isUsingWebSocket: socketConnected,
  };
}
