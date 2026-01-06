'use client';

import * as React from 'react';
import type { StudioImage } from '../../../components/studio/studio-image-card';
import { deleteImage, likeImage } from '../../../lib/api/studio';
import { createSafeImageCopy } from '../utils/image-selection';

interface UseImageActionsOptions {
  updateImage: (imageId: string, updates: Partial<StudioImage>) => void;
  removeImage: (imageId: string) => void;
  setSelectedImage: React.Dispatch<React.SetStateAction<StudioImage | null>>;
  refreshImages: (characterId: string) => Promise<void>;
  selectedInfluencerId: string | null;
}

/**
 * Hook for image-related actions (like, delete, download)
 */
export function useImageActions({
  updateImage,
  removeImage,
  setSelectedImage,
  refreshImages,
  selectedInfluencerId,
}: UseImageActionsOptions) {
  // Handle like
  const handleLike = React.useCallback(
    async (imageId: string) => {
      try {
        const res = await likeImage(imageId);
        updateImage(imageId, { isLiked: res.liked });
        // Update selectedImage if it's the one being liked
        setSelectedImage((prev) => {
          if (prev?.id === imageId) {
            return { ...prev, isLiked: res.liked };
          }
          return prev;
        });
      } catch (err) {
        console.error('Like failed:', err);
      }
    },
    [updateImage, setSelectedImage]
  );

  // Handle delete
  const handleDelete = React.useCallback(
    async (imageId: string) => {
      try {
        await deleteImage(imageId);
        // Clear selectedImage if it's the one being deleted
        setSelectedImage((prev) => (prev?.id === imageId ? null : prev));
        if (selectedInfluencerId) {
          await refreshImages(selectedInfluencerId);
        } else {
          removeImage(imageId);
        }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    },
    [selectedInfluencerId, refreshImages, removeImage, setSelectedImage]
  );

  // Handle download
  const handleDownload = React.useCallback(async (image: StudioImage) => {
    if (!image.imageUrl) return;

    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ryla-${image.influencerName
        .toLowerCase()
        .replace(/\s+/g, '-')}-${image.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, []);

  // Handle image selection (internal - used by useStudioHandlers)
  const handleSelectImageInternal = React.useCallback(
    (image: StudioImage | null, setSelectedInfluencerId: (id: string | null) => void, currentSelectedInfluencerId: string | null) => {
      if (image) {
        // Create a safe copy without circular references
        const safeImage = createSafeImageCopy(image);
        setSelectedImage(safeImage);
        // Auto-select the influencer associated with the image
        if (
          safeImage.influencerId &&
          safeImage.influencerId !== currentSelectedInfluencerId
        ) {
          setSelectedInfluencerId(safeImage.influencerId);
        }
      } else {
        setSelectedImage(null);
      }
    },
    [setSelectedImage]
  );

  return {
    handleLike,
    handleDelete,
    handleDownload,
    handleSelectImage: handleSelectImageInternal,
  };
}

