'use client';

import * as React from 'react';
import type { StudioMode } from '../types';
import type { StudioImage } from '../../studio-image-card';

interface UseModeChangeHandlerOptions {
  selectedImage: StudioImage | null;
  mode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  onClearSelectedImage?: () => void;
}

/**
 * Hook for handling mode changes and auto-switching logic
 */
export function useModeChangeHandler({
  selectedImage,
  mode,
  onModeChange,
  onClearSelectedImage,
}: UseModeChangeHandlerOptions) {
  // Auto-switch to editing mode when image is selected (but allow manual mode changes)
  React.useEffect(() => {
    if (selectedImage && mode === 'creating') {
      onModeChange('editing');
    }
  }, [selectedImage, mode, onModeChange]);

  // Handle mode changes - clear image when switching to creating mode
  const handleModeChange = React.useCallback(
    (newMode: StudioMode) => {
      if (newMode === 'creating' && selectedImage) {
        if (onClearSelectedImage) {
          onClearSelectedImage();
        }
      }
      onModeChange(newMode);
    },
    [selectedImage, onClearSelectedImage, onModeChange]
  );

  return { handleModeChange };
}

