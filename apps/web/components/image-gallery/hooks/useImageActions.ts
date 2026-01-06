import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useInfluencerStore } from '@ryla/business';
import type { Post } from '@ryla/shared';

interface UseImageActionsOptions {
  influencerId: string;
  onLike?: (imageId: string) => void | Promise<void>;
}

interface UseImageActionsReturn {
  handleLike: (e: React.MouseEvent, imageId: string) => Promise<void>;
  handleDownload: (e: React.MouseEvent, image: Post) => Promise<void>;
  handleEditInStudio: (e: React.MouseEvent, imageId: string) => void;
}

export function useImageActions({
  influencerId,
  onLike: onLikeProp,
}: UseImageActionsOptions): UseImageActionsReturn {
  const router = useRouter();
  const toggleLike = useInfluencerStore((state) => state.toggleLike);

  const handleLike = useCallback(
    async (e: React.MouseEvent, imageId: string) => {
      e.stopPropagation();
      if (onLikeProp) {
        await onLikeProp(imageId);
      } else {
        toggleLike(imageId);
      }
    },
    [onLikeProp, toggleLike]
  );

  const handleDownload = useCallback(async (e: React.MouseEvent, image: Post) => {
    e.stopPropagation();
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ryla-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  const handleEditInStudio = useCallback(
    (e: React.MouseEvent, imageId: string) => {
      e.stopPropagation();
      router.push(`/studio?influencer=${influencerId}&imageId=${imageId}&edit=true`);
    },
    [router, influencerId]
  );

  return {
    handleLike,
    handleDownload,
    handleEditInStudio,
  };
}

