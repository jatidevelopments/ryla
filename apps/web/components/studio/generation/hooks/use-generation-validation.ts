'use client';

import * as React from 'react';
import type { GenerationSettings, StudioMode } from '../types';
import type { StudioImage } from '../../studio-image-card';

interface UseGenerationValidationOptions {
  settings: GenerationSettings;
  mode: StudioMode;
  selectedImage: StudioImage | null;
  creditsAvailable: number;
  creditsCost: number;
}

/**
 * Hook for generation validation logic
 */
export function useGenerationValidation({
  settings,
  mode,
  selectedImage,
  creditsAvailable,
  creditsCost,
}: UseGenerationValidationOptions) {
  const canGenerate = React.useMemo(() => {
    // Require influencer for generation
    if (!settings.influencerId || creditsAvailable < creditsCost) return false;

    // Creating mode: no prompt required (backend builds it)
    if (mode === 'creating') {
      return true;
    }

    if (mode === 'editing' || mode === 'upscaling') {
      return selectedImage !== null;
    }

    return false;
  }, [settings.influencerId, mode, selectedImage, creditsAvailable, creditsCost]);

  return { canGenerate };
}

