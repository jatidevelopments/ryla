'use client';

import * as React from 'react';
import { getComfyUIResults } from '../../../lib/api/studio';
import { POLLING_TIMEOUT_MS, POLLING_INTERVAL_MS } from '../constants';

interface UseGenerationPollingOptions {
  refreshImages: (characterId: string) => Promise<void>;
  setActiveGenerations: React.Dispatch<React.SetStateAction<Set<string>>>;
  utils: ReturnType<typeof import('../../../lib/trpc').trpc.useUtils>;
}

/**
 * Hook for polling generation results in the background
 * Updates images as they complete and manages active generation tracking
 */
export function useGenerationPolling({
  refreshImages,
  setActiveGenerations,
  utils,
}: UseGenerationPollingOptions) {
  const pollGenerationResults = React.useCallback(
    async (promptIds: string[], characterId: string) => {
      const timeoutMs = POLLING_TIMEOUT_MS;
      const start = Date.now();
      const completedPromptIds = new Set<string>();

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

          // Check which jobs completed
          const newlyCompleted: string[] = [];
          results.forEach((result, index) => {
            const promptId = remainingPromptIds[index];
            if (result.status === 'completed' || result.status === 'failed') {
              if (!completedPromptIds.has(promptId)) {
                completedPromptIds.add(promptId);
                newlyCompleted.push(promptId);
              }
            }
          });

          // If any jobs just completed, refresh from server immediately
          if (newlyCompleted.length > 0) {
            await refreshImages(characterId);
          }

          // If all done, clean up tracking
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

      // Final refresh to ensure we have all images
      try {
        await refreshImages(characterId);
        setActiveGenerations((prev) => {
          const next = new Set(prev);
          promptIds.forEach((pid) => next.delete(pid));
          return next;
        });
      } catch (err) {
        console.error('Final refresh failed:', err);
      }
    },
    [refreshImages, setActiveGenerations, utils]
  );

  return { pollGenerationResults };
}

