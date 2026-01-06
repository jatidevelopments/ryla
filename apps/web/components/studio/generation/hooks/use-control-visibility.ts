'use client';

import * as React from 'react';
import type { StudioMode } from '../types';

/**
 * Hook for determining which controls should be visible based on mode
 */
export function useControlVisibility(mode: StudioMode) {
  const showCreativeControls = mode === 'creating' || mode === 'editing';
  const showAspectRatio = mode === 'creating' || mode === 'editing';
  const showPromptEnhance = mode === 'creating' || mode === 'editing';

  return {
    showCreativeControls,
    showAspectRatio,
    showPromptEnhance,
  };
}

