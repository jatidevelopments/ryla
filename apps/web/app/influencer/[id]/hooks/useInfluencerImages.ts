'use client';

import * as React from 'react';
import { getCharacterImages, likeImage } from '../../../../lib/api/studio';
import type { Post } from '@ryla/shared';

interface UseInfluencerImagesOptions {
  influencerId: string;
  onImageCountUpdate?: (count: number) => void;
  profilePicturesState?: {
    completedCount?: number;
    status?: string;
    totalCount?: number;
  } | null;
}

/**
 * Hook for managing influencer images (loading, liking, state)
 */
export function useInfluencerImages({
  influencerId,
  onImageCountUpdate,
  profilePicturesState,
}: UseInfluencerImagesOptions) {
  const previousCompletedCount = React.useRef<number>(0);
  const [dbImages, setDbImages] = React.useState<Post[]>([]);
  const [isLoadingImages, setIsLoadingImages] = React.useState(true);
  const loadingRef = React.useRef(false);
  const onImageCountUpdateRef = React.useRef(onImageCountUpdate);
  const influencerIdRef = React.useRef(influencerId);

  // Keep refs up to date
  React.useEffect(() => {
    onImageCountUpdateRef.current = onImageCountUpdate;
  }, [onImageCountUpdate]);

  React.useEffect(() => {
    influencerIdRef.current = influencerId;
  }, [influencerId]);

  const loadImages = React.useCallback(async () => {
    const currentInfluencerId = influencerIdRef.current;
    if (!currentInfluencerId) {
      setIsLoadingImages(false);
      return;
    }

    // Prevent multiple simultaneous loads using ref
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setIsLoadingImages(true);
      const rows = await getCharacterImages(currentInfluencerId);
      // Convert ApiImageRow[] to Post[]
      const converted: Post[] = rows.map((row) => ({
        id: row.id,
        influencerId: row.characterId || currentInfluencerId,
        imageUrl: row.s3Url || '',
        caption: row.prompt || '',
        isLiked: Boolean(row.liked),
        scene: row.scene || undefined,
        environment: row.environment || undefined,
        outfit: row.outfit || undefined,
        aspectRatio: (row.aspectRatio || '9:16') as '1:1' | '9:16' | '2:3',
        createdAt: row.createdAt || new Date().toISOString(),
      }));
      
      // Only update if still loading for the same influencer
      if (influencerIdRef.current === currentInfluencerId) {
        setDbImages(converted);
        onImageCountUpdateRef.current?.(converted.length);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
      // Only update if still loading for the same influencer
      if (influencerIdRef.current === currentInfluencerId) {
        setDbImages([]);
      }
    } finally {
      // Only reset loading if still loading for the same influencer
      if (influencerIdRef.current === currentInfluencerId) {
        setIsLoadingImages(false);
      }
      loadingRef.current = false;
    }
  }, []); // No dependencies - uses refs instead

  // Reset and load images when influencerId changes
  React.useEffect(() => {
    setDbImages([]);
    setIsLoadingImages(true);
    loadingRef.current = false;
    previousCompletedCount.current = 0;
    
    if (influencerId) {
      loadImages();
    } else {
      setIsLoadingImages(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [influencerId]); // Only depend on influencerId, not loadImages

  // Push-based refresh: Watch for new images being added to the store
  // When completedCount increases, trigger a gallery refresh
  React.useEffect(() => {
    if (!profilePicturesState || !influencerId) return;

    const currentCompletedCount = profilePicturesState.completedCount || 0;

    // If a new image was completed (count increased), refresh the gallery
    if (
      currentCompletedCount > previousCompletedCount.current &&
      !loadingRef.current
    ) {
      previousCompletedCount.current = currentCompletedCount;
      loadImages();
    }

    // Also refresh when generation completes to ensure all images are loaded
    if (
      profilePicturesState.status === 'completed' &&
      previousCompletedCount.current < (profilePicturesState.totalCount || 0) &&
      !loadingRef.current
    ) {
      previousCompletedCount.current = profilePicturesState.totalCount || 0;
      loadImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    profilePicturesState?.completedCount,
    profilePicturesState?.status,
    profilePicturesState?.totalCount,
    influencerId,
    // Removed loadImages from deps - uses ref instead
  ]);

  // Handle like toggle - sync with database
  const handleImageLike = React.useCallback(
    async (imageId: string) => {
      try {
        const result = await likeImage(imageId);
        // Update local state
        setDbImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, isLiked: result.liked } : img
          )
        );
      } catch (error) {
        console.error('Failed to toggle like:', error);
      }
    },
    []
  );

  // Memoize filtered images
  const allImages = React.useMemo(() => dbImages, [dbImages]);
  const likedImages = React.useMemo(
    () => allImages.filter((img) => img.isLiked),
    [allImages]
  );

  return {
    allImages,
    likedImages,
    isLoadingImages,
    handleImageLike,
    refreshImages: loadImages,
  };
}

