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
  handleGenerateAll: () => Promise<void>;
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

  // Generate/poll base images on mount
  React.useEffect(() => {
    const hasOnlySkeletons =
      safeBaseImages.length > 0 &&
      safeBaseImages.every((img) => img.url === 'skeleton' || img.url === 'loading');

    const shouldAct =
      !hasValidImages &&
      !isGenerating &&
      !isPolling &&
      (safeBaseImages.length === 0 || hasOnlySkeletons);

    if (!shouldAct) return;

    // For prompt-based flow with existing jobIds: poll those jobs
    if (isPromptBasedFlow && baseImageAllJobIds && baseImageAllJobIds.length > 0) {
      pollExistingJobs(baseImageAllJobIds);
      return;
    }

    // For prompt-based flow without jobIds: start fresh generation if we have a prompt
    // For presets flow: start fresh generation using form presets
    if (isPromptBasedFlow) {
      if (form.promptInput?.trim()) {
        handleGenerateAll();
      }
    } else {
      handleGenerateAll();
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

  // For prompt-based flow: check if we have jobIds to poll
  const missingJobIds =
    isPromptBasedFlow &&
    (!baseImageAllJobIds || baseImageAllJobIds.length === 0) &&
    !hasValidImages &&
    !isGenerating &&
    !isPolling;

  return { missingJobIds };
}

