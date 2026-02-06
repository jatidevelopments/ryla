'use client';

import * as React from 'react';
import { getCharacterImages, likeImage } from '../../../../lib/api/studio';
import type { Post } from '@ryla/shared';

interface ProfilePictureJob {
  images?: Array<unknown>;
  status?: string;
}

interface UseInfluencerImagesOptions {
  influencerId: string;
  onImageCountUpdate?: (count: number) => void;
  profilePicturesState?: {
    completedCount?: number;
    status?: string;
    totalCount?: number;
    jobs?: ProfilePictureJob[];
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
      // Filter out failed images before converting
      const converted: Post[] = rows
        .filter((row) => row.status !== 'failed')
        .map((row) => ({
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
  // Also track the actual image count from all jobs to detect changes
  const currentImageCount = React.useMemo(() => {
    if (!profilePicturesState) return 0;
    // Count images across all jobs (new structure) or use completedCount (legacy)
    if (profilePicturesState.jobs && profilePicturesState.jobs.length > 0) {
      return profilePicturesState.jobs.reduce((sum, job) => sum + (job.images?.length || 0), 0);
    }
    return profilePicturesState.completedCount || 0;
  }, [profilePicturesState]);

  React.useEffect(() => {
    if (!profilePicturesState || !influencerId) return;

    // If image count increased, refresh the gallery
    if (
      currentImageCount > previousCompletedCount.current &&
      !loadingRef.current
    ) {
      console.log('[useInfluencerImages] New images detected, refreshing gallery:', {
        previous: previousCompletedCount.current,
        current: currentImageCount,
      });
      previousCompletedCount.current = currentImageCount;
      loadImages();
    }

    // Also refresh when any job completes to ensure all images are loaded
    const hasCompletedJob = profilePicturesState.jobs?.some(
      (job) => job.status === 'completed'
    );
    if (hasCompletedJob && !loadingRef.current) {
      // Small delay to ensure backend has saved all images
      const timer = setTimeout(() => {
        if (!loadingRef.current) {
          loadImages();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentImageCount,
    profilePicturesState?.status,
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

