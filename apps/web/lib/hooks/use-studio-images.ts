'use client';

import * as React from 'react';
import type { StudioImage } from '../../components/studio/studio-image-card';
import { getCharacterImages } from '../api/studio';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

interface Influencer {
  id: string;
  name: string;
  avatar?: string | null;
}

interface UseStudioImagesOptions {
  selectedInfluencerId: string | null;
  influencers: Influencer[];
  /** Polling interval in ms (default: 2000) */
  pollInterval?: number;
  /** Stale threshold in ms (default: 60000) */
  staleThreshold?: number;
}

interface UseStudioImagesReturn {
  images: StudioImage[];
  isLoading: boolean;
  refreshImages: (characterId: string) => Promise<void>;
  addPlaceholders: (placeholders: StudioImage[]) => void;
  updateImage: (imageId: string, updates: Partial<StudioImage>) => void;
  replaceImage: (oldImageId: string, newImage: StudioImage) => void;
  removeImage: (imageId: string) => void;
  activeGenerations: Set<string>;
  setActiveGenerations: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useStudioImages({
  selectedInfluencerId,
  influencers,
  pollInterval: _pollInterval = 2000,
  staleThreshold = 60 * 1000,
}: UseStudioImagesOptions): UseStudioImagesReturn {
  const [allImages, setAllImages] = React.useState<StudioImage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeGenerations, setActiveGenerations] = React.useState<Set<string>>(
    new Set()
  );

  // Track current loading request to prevent race conditions
  const loadingRef = React.useRef<string | null>(null);

  const validInfluencers = React.useMemo(
    () => influencers.filter((i) => isUuid(i.id)),
    [influencers]
  );

  // Cleanup stale generating images - mark as failed if stuck for too long
  const cleanupStaleGeneratingImages = React.useCallback(() => {
    const now = Date.now();

    setAllImages((prev) => {
      let hasChanges = false;
      const updated = prev.map((img) => {
        if (img.status !== 'generating') return img;

        const createdAt = new Date(img.createdAt).getTime();
        const age = now - createdAt;

        if (age > staleThreshold) {
          hasChanges = true;
          return { ...img, status: 'failed' as const };
        }

        return img;
      });

      return hasChanges ? updated : prev;
    });
  }, [staleThreshold]);

  // Use ref to store latest influencers to avoid dependency issues
  const influencersRef = React.useRef(validInfluencers);
  React.useEffect(() => {
    influencersRef.current = validInfluencers;
  }, [validInfluencers]);

  const refreshImages = React.useCallback(
    async (characterId: string) => {
      if (!isUuid(characterId)) {
        setAllImages([]);
        setIsLoading(false);
        loadingRef.current = null;
        return;
      }

      // Prevent multiple simultaneous calls for the same character
      if (loadingRef.current === characterId) {
        return;
      }

      loadingRef.current = characterId;
      // Only show full loading state if we have no images yet
      if (allImages.length === 0) {
        setIsLoading(true);
      }
      try {
        const rows = await getCharacterImages(characterId);
        const influencer = influencersRef.current.find(
          (i) => i.id === characterId
        );
        const mapped: StudioImage[] = rows.map((row) => ({
          id: row.id,
          imageUrl: row.s3Url || '',
          thumbnailUrl: row.thumbnailUrl || undefined,
          influencerId: characterId,
          influencerName: influencer?.name || 'Unknown',
          influencerAvatar: influencer?.avatar || undefined,
          prompt: row.prompt || undefined,
          scene: row.scene || undefined,
          environment: row.environment || undefined,
          outfit: row.outfit || undefined,
          poseId: row.poseId || undefined,
          aspectRatio: (row.aspectRatio ||
            '9:16') as StudioImage['aspectRatio'],
          status:
            row.status === 'completed'
              ? 'completed'
              : row.status === 'failed'
              ? 'failed'
              : 'generating',
          createdAt: row.createdAt || new Date().toISOString(),
          isLiked: Boolean(row.liked),
          nsfw: row.nsfw ?? false,
          promptEnhance: row.promptEnhance ?? undefined,
          originalPrompt: row.originalPrompt || undefined,
          enhancedPrompt: row.enhancedPrompt || undefined,
        }));

        // Merge new images with existing to preserve object references for unchanged items
        setAllImages((prev) => {
          const currentActive = activeGenerationsRef.current;
          const now = Date.now();

          // Create a map of existing images for quick lookup
          const existingById = new Map(prev.map((img) => [img.id, img]));

          // Keep placeholders that:
          // 1. Are still being actively polled, OR
          // 2. Belong to other characters, OR
          // 3. Don't have a corresponding real image in the server response yet
          const activePlaceholders = prev.filter((img) => {
            if (!img.id.startsWith('placeholder-')) return false;
            const promptId = img.id.replace('placeholder-', '');

            // Keep if it's for another character
            if (img.influencerId !== characterId) return true;

            // Keep if we're still actively polling for it
            if (currentActive.has(promptId)) return true;

            // Keep if no real image with this prompt has appeared yet
            const hasRealImage = mapped.some(
              (real) =>
                real.id === promptId ||
                real.status === 'generating' ||
                real.status === 'completed'
            );

            return !hasRealImage;
          });

          // Merge server images with existing, preserving references where possible
          const mergedMapped = mapped.map((serverImg) => {
            const existing = existingById.get(serverImg.id);

            // If no existing image, use server data
            if (!existing) return serverImg;

            // Check if anything actually changed
            const hasChanged =
              existing.status !== serverImg.status ||
              existing.imageUrl !== serverImg.imageUrl ||
              existing.thumbnailUrl !== serverImg.thumbnailUrl ||
              existing.isLiked !== serverImg.isLiked ||
              existing.nsfw !== serverImg.nsfw;

            // If nothing changed, return existing reference to prevent re-render
            if (!hasChanged) return existing;

            // If changed, return new object (this will trigger re-render only for this item)
            return serverImg;
          });

          const newImages = [...mergedMapped, ...activePlaceholders];

          // Cleanup stale generating images
          const cleanedImages = newImages.map((img) => {
            if (img.status !== 'generating') return img;
            const createdAt = new Date(img.createdAt).getTime();
            const age = now - createdAt;
            if (age > staleThreshold) {
              return { ...img, status: 'failed' as const };
            }
            return img;
          });

          return cleanedImages;
        });
      } finally {
        // Only reset loading if this is still the current request
        if (loadingRef.current === characterId) {
          setIsLoading(false);
          loadingRef.current = null;
        }
      }
    },
    [staleThreshold] // Removed validInfluencers from dependencies
  );

  // Add placeholder images (for pending generations)
  const addPlaceholders = React.useCallback((placeholders: StudioImage[]) => {
    setAllImages((prev) => [...placeholders, ...prev]);
  }, []);

  // Update a specific image - only update if values actually changed
  const updateImage = React.useCallback(
    (imageId: string, updates: Partial<StudioImage>) => {
      setAllImages((prev) => {
        let hasChanges = false;
        const updated = prev.map((img) => {
          if (img.id !== imageId) return img;

          // Check if any values actually changed
          const keys = Object.keys(updates) as (keyof StudioImage)[];
          const actuallyChanged = keys.some((key) => img[key] !== updates[key]);

          if (!actuallyChanged) return img;

          hasChanges = true;
          return { ...img, ...updates };
        });

        // Only return new array if something changed
        return hasChanges ? updated : prev;
      });
    },
    []
  );

  // Remove an image
  const removeImage = React.useCallback((imageId: string) => {
    setAllImages((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  // Replace a placeholder image with a real completed image
  const replaceImage = React.useCallback(
    (oldImageId: string, newImage: StudioImage) => {
      setAllImages((prev) => {
        // Find the index of the old image to maintain position
        const oldIndex = prev.findIndex((img) => img.id === oldImageId);

        if (oldIndex === -1) {
          // Old image not found, just add the new one at the beginning
          return [newImage, ...prev];
        }

        // Replace the old image with the new one at the same position
        const updated = [...prev];
        updated[oldIndex] = newImage;
        return updated;
      });
    },
    []
  );

  // Auto-refresh on influencer change (only when selectedInfluencerId changes)
  React.useEffect(() => {
    if (!selectedInfluencerId) return;
    refreshImages(selectedInfluencerId).catch((err) =>
      console.error('Failed to load images:', err)
    );
  }, [selectedInfluencerId, refreshImages]);

  // Cleanup stale images periodically (less frequently than polling)
  React.useEffect(() => {
    cleanupStaleGeneratingImages();
    // Run cleanup every 30 seconds instead of pollInterval (which is 2s)
    const cleanupInterval = 30 * 1000;
    const interval = setInterval(cleanupStaleGeneratingImages, cleanupInterval);
    return () => clearInterval(interval);
  }, [cleanupStaleGeneratingImages]);

  // Use ref to track activeGenerations for polling
  const activeGenerationsRef = React.useRef(activeGenerations);
  React.useEffect(() => {
    activeGenerationsRef.current = activeGenerations;
  }, [activeGenerations]);

  const hasGeneratingRealImages = React.useMemo(
    () =>
      allImages.some(
        (img) =>
          img.status === 'generating' && !img.id.startsWith('placeholder-')
      ),
    [allImages]
  );

  // Fallback polling: Only for cases where we have generating images in DB
  // but no active job IDs (e.g., after page refresh with in-progress images)
  // This is NOT the primary polling mechanism - useGenerationPolling handles active jobs
  React.useEffect(() => {
    // Only run if we have generating images but NO active generations being tracked
    // (active generations are handled by useGenerationPolling with direct updates)
    if (activeGenerations.size > 0) return; // Let useGenerationPolling handle it
    if (!hasGeneratingRealImages) return;
    if (!selectedInfluencerId) return;

    const fallbackPoll = async () => {
      try {
        // Refresh to check if any generating images have completed in DB
        await refreshImages(selectedInfluencerId);
      } catch (error) {
        console.error('Fallback polling error:', error);
      }
    };

    // Use a longer interval since this is just a fallback (10 seconds)
    const fallbackPollInterval = 10 * 1000;
    const interval = setInterval(fallbackPoll, fallbackPollInterval);
    return () => clearInterval(interval);
  }, [
    hasGeneratingRealImages,
    selectedInfluencerId,
    activeGenerations.size,
    refreshImages,
  ]);

  return {
    images: allImages,
    isLoading,
    refreshImages,
    addPlaceholders,
    updateImage,
    replaceImage,
    removeImage,
    activeGenerations,
    setActiveGenerations,
  };
}
