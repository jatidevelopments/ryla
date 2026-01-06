'use client';

import * as React from 'react';
import type { StudioMode } from '../types';
import type { StudioImage } from '../../studio-image-card';
import type { OutfitComposition } from '@ryla/shared';
import type { GenerationSettings } from '../types';

// Helper to convert snake_case to kebab-case (for scene/environment mapping)
function snakeToKebab(str: string | null | undefined): string | null {
  if (!str) return null;
  return str.replace(/_/g, '-');
}

interface UseImageSettingsLoaderOptions {
  selectedImage: StudioImage | null;
  mode: StudioMode;
  currentSettings: GenerationSettings;
}

interface UseImageSettingsLoaderReturn {
  imageSettings: Partial<GenerationSettings> | null;
  imageNsfw: boolean | null;
}

/**
 * Hook for loading generation settings from a selected image.
 * Used when entering editing/upscaling/variations mode.
 */
export function useImageSettingsLoader({
  selectedImage,
  mode,
  currentSettings,
}: UseImageSettingsLoaderOptions): UseImageSettingsLoaderReturn {
  // Track the last image ID we loaded settings from to avoid overwriting user edits
  const lastLoadedImageIdRef = React.useRef<string | null>(null);
  const [result, setResult] = React.useState<UseImageSettingsLoaderReturn>({
    imageSettings: null,
    imageNsfw: null,
  });

  React.useEffect(() => {
    if (
      selectedImage &&
      (mode === 'editing' || mode === 'upscaling' || mode === 'variations')
    ) {
      // Only load if this is a different image
      if (selectedImage.id !== lastLoadedImageIdRef.current) {
        // Parse outfit - can be string or JSON stringified OutfitComposition
        let outfitValue: string | null | OutfitComposition = null;
        if (selectedImage.outfit) {
          try {
            outfitValue = JSON.parse(selectedImage.outfit);
          } catch {
            outfitValue = selectedImage.outfit;
          }
        }

        const imageSettings: Partial<GenerationSettings> = {
          prompt: '', // User can re-enter custom details
          sceneId: snakeToKebab(selectedImage.scene) || null,
          poseId: selectedImage.poseId || null,
          outfit: outfitValue,
          aspectRatio: selectedImage.aspectRatio || currentSettings.aspectRatio,
        };

        const imageNsfw =
          selectedImage.nsfw !== undefined ? selectedImage.nsfw : null;

        lastLoadedImageIdRef.current = selectedImage.id;

        setResult({
          imageSettings,
          imageNsfw,
        });
      }
    } else if (!selectedImage || mode === 'creating') {
      lastLoadedImageIdRef.current = null;
      setResult({
        imageSettings: null,
        imageNsfw: null,
      });
    }
  }, [selectedImage, mode, currentSettings.aspectRatio]);

  return result;
}

