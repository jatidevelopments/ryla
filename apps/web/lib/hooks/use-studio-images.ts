'use client';

import * as React from 'react';
import type { StudioImage } from '../../components/studio/studio-image-card';
import { getCharacterImages, getComfyUIResults } from '../api/studio';

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
  removeImage: (imageId: string) => void;
  activeGenerations: Set<string>;
  setActiveGenerations: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useStudioImages({
  selectedInfluencerId,
  influencers,
  pollInterval = 2000,
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
      setIsLoading(true);
      try {
        const rows = await getCharacterImages(characterId);
        const influencer = influencersRef.current.find((i) => i.id === characterId);
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
          aspectRatio: (row.aspectRatio || '9:16') as StudioImage['aspectRatio'],
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

        // Replace placeholders with real images
        setAllImages((prev) => {
          const placeholdersForOtherChars = prev.filter(
            (img) =>
              img.id.startsWith('placeholder-') &&
              img.influencerId !== characterId
          );

          const newImages = [...mapped, ...placeholdersForOtherChars];

          // Cleanup stale generating images
          const now = Date.now();
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

  // Update a specific image
  const updateImage = React.useCallback(
    (imageId: string, updates: Partial<StudioImage>) => {
      setAllImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, ...updates } : img
        )
      );
    },
    []
  );

  // Remove an image
  const removeImage = React.useCallback((imageId: string) => {
    setAllImages((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  // Auto-refresh on influencer change (only when selectedInfluencerId changes)
  React.useEffect(() => {
    if (!selectedInfluencerId) return;
    refreshImages(selectedInfluencerId).catch((err) =>
      console.error('Failed to load images:', err)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInfluencerId]); // Only depend on selectedInfluencerId, not refreshImages

  // Cleanup stale images periodically (less frequently than polling)
  React.useEffect(() => {
    cleanupStaleGeneratingImages();
    // Run cleanup every 30 seconds instead of pollInterval (which is 2s)
    const cleanupInterval = 30 * 1000;
    const interval = setInterval(cleanupStaleGeneratingImages, cleanupInterval);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Use ref to track activeGenerations for polling
  const activeGenerationsRef = React.useRef(activeGenerations);
  React.useEffect(() => {
    activeGenerationsRef.current = activeGenerations;
  }, [activeGenerations]);

  // Poll for updates when there are active generations
  React.useEffect(() => {
    if (activeGenerations.size === 0 || !selectedInfluencerId) return;

    const pollForUpdates = async () => {
      try {
        // Get results for all active jobs - use ref to get latest value
        const currentActive = activeGenerationsRef.current;
        if (currentActive.size === 0) return; // Stop if no active generations
        
        const jobIds = Array.from(currentActive);
        for (const jobId of jobIds) {
          const results = await getComfyUIResults(jobId);
          
          if (results && results.length > 0) {
            // Job completed - update images and remove from active
            await refreshImages(selectedInfluencerId);
            setActiveGenerations((prev) => {
              const next = new Set(prev);
              next.delete(jobId);
              return next;
            });
          }
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    };

    const interval = setInterval(pollForUpdates, pollInterval);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGenerations.size, selectedInfluencerId, pollInterval]); // Only depend on size, not the Set object

  return {
    images: allImages,
    isLoading,
    refreshImages,
    addPlaceholders,
    updateImage,
    removeImage,
    activeGenerations,
    setActiveGenerations,
  };
}

