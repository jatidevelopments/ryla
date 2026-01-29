'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import type { GeneratedImage } from '@ryla/business';

interface UseBaseImageInitializationOptions {
  isPromptBasedFlow: boolean;
  hasValidImages: boolean;
  isGenerating: boolean;
  isPolling: boolean;
  safeBaseImages: GeneratedImage[];
  pollExistingJobs: (jobIds: string[]) => Promise<void>;
  handleGenerateAll: (isRegenerate?: boolean, isManualRetry?: boolean) => Promise<void>;
}

/**
 * Hook to handle initialization logic for base image generation
 * Determines when to poll existing jobs or start fresh generation
 */
export function useBaseImageInitialization({
  isPromptBasedFlow,
  hasValidImages,
  isGenerating,
  isPolling,
  safeBaseImages,
  pollExistingJobs,
  handleGenerateAll,
}: UseBaseImageInitializationOptions) {
  const form = useCharacterWizardStore((s) => s.form);
  const baseImageAllJobIds = useCharacterWizardStore((s) => s.baseImageAllJobIds);

  // Track if we've already initiated generation/polling to prevent retry loops
  const hasInitiatedRef = React.useRef(false);
  const hasFailedPermanentlyRef = React.useRef(false);

  // Generate/poll base images on mount
  React.useEffect(() => {
    // Don't retry if we've permanently failed (connection error after max retries)
    // User must manually retry via button
    if (hasFailedPermanentlyRef.current) {
      return;
    }

    // Prevent retry loops - only run once per mount or when explicitly needed
    if (hasInitiatedRef.current && (isGenerating || isPolling)) {
      return;
    }

    const hasOnlySkeletons =
      safeBaseImages.length > 0 &&
      safeBaseImages.every((img) => img.url === 'skeleton' || img.url === 'loading');

    const hasFailedImages = safeBaseImages.some(
      (img) => img.url === 'failed' || img.url === 'error'
    );

    const shouldAct =
      !hasValidImages &&
      !isGenerating &&
      !isPolling &&
      !hasInitiatedRef.current &&
      (safeBaseImages.length === 0 || hasOnlySkeletons);

    if (!shouldAct) return;

    // Mark as initiated to prevent retry loops
    hasInitiatedRef.current = true;

    // For prompt-based flow with existing jobIds: poll those jobs
    if (isPromptBasedFlow && baseImageAllJobIds && baseImageAllJobIds.length > 0) {
      pollExistingJobs(baseImageAllJobIds).catch((err) => {
        // Check if it's a connection error
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isConnectionError = 
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('Unable to connect');
        
        if (isConnectionError) {
          // Mark as permanently failed to prevent retry loops
          hasFailedPermanentlyRef.current = true;
          // Don't reset hasInitiatedRef - we want to stay in failed state
        } else {
          // Reset flag for other errors so user can manually retry
          if (!hasValidImages) {
            hasInitiatedRef.current = false;
          }
        }
      });
      return;
    }

    // For prompt-based flow without jobIds: start fresh generation if we have a prompt
    // For presets flow: start fresh generation using form presets
    const handleGeneration = async () => {
      try {
        await handleGenerateAll();
      } catch (err) {
        // Check if it's a connection error that failed after max retries
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isConnectionError = 
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('Unable to connect');
        
        if (isConnectionError && errorMessage.includes('Unable to connect')) {
          // Max retries reached - mark as permanently failed
          hasFailedPermanentlyRef.current = true;
          // Don't reset hasInitiatedRef - we want to stay in failed state
        } else if (!isConnectionError) {
          // Reset flag for other errors so user can manually retry
          if (!hasValidImages) {
            hasInitiatedRef.current = false;
          }
        }
        // For connection errors that are still retrying, don't reset the flag
        // The retry logic in handleGenerateAll will handle it
      }
    };

    if (isPromptBasedFlow) {
      if (form.promptInput?.trim()) {
        handleGeneration();
      }
    } else {
      handleGeneration();
    }
     
  }, [
    hasValidImages,
    isGenerating,
    isPolling,
    safeBaseImages,
    isPromptBasedFlow,
    baseImageAllJobIds,
    form.promptInput,
    pollExistingJobs,
    handleGenerateAll,
  ]);

  // Track previous generating state to detect manual retries
  const prevIsGeneratingRef = React.useRef(isGenerating);

  // Reset initiation flag when we get valid images
  React.useEffect(() => {
    if (hasValidImages) {
      hasInitiatedRef.current = false;
      hasFailedPermanentlyRef.current = false;
    }
  }, [hasValidImages]);

  // Reset permanent failure when generation starts after being stopped (user clicked retry)
  React.useEffect(() => {
    const wasGenerating = prevIsGeneratingRef.current;
    prevIsGeneratingRef.current = isGenerating;

    // If generation just started (false -> true) and we have permanent failure, reset it
    if (!wasGenerating && isGenerating && hasFailedPermanentlyRef.current) {
      // User manually triggered generation - reset permanent failure
      hasFailedPermanentlyRef.current = false;
      hasInitiatedRef.current = false;
    }
  }, [isGenerating]);

  // For prompt-based flow: check if we have jobIds to poll
  const missingJobIds =
    isPromptBasedFlow &&
    (!baseImageAllJobIds || baseImageAllJobIds.length === 0) &&
    !hasValidImages &&
    !isGenerating &&
    !isPolling;

  return { missingJobIds };
}

