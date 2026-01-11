'use client';

import * as React from 'react';
import type { StudioImage } from '../../../components/studio/studio-image-card';
import { fileToBase64, uploadResultToStudioImage } from '../utils/image-upload';

interface UseUploadActionsOptions {
  uploadImageMutation: ReturnType<
    typeof import('../../../lib/trpc').trpc.user.uploadObjectImage.useMutation
  >;
}

/**
 * Hook for upload-related actions
 */
export function useUploadActions({
  uploadImageMutation,
}: UseUploadActionsOptions) {
  // Handle upload image
  const handleUploadImage = React.useCallback(
    async (file: File): Promise<StudioImage | null> => {
      try {
        const base64 = await fileToBase64(file);
        const result = await uploadImageMutation.mutateAsync({
          imageBase64: base64,
          name: file.name,
        });
        return uploadResultToStudioImage(result);
      } catch (err) {
        console.error('Upload failed:', err);
        return null;
      }
    },
    [uploadImageMutation]
  );

  return {
    handleUploadImage,
  };
}


