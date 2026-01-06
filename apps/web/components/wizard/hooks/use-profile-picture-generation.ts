'use client';

import * as React from 'react';
import { useCharacterWizardStore, getProfilePictureSet, type ProfilePictureImage } from '@ryla/business';
import {
  generateProfilePictureSetAndWait,
  regenerateProfilePictureAndWait,
  type JobStatus,
  type GeneratedImage,
} from '../../../lib/api/character';

interface UseProfilePictureGenerationReturn {
  isGenerating: boolean;
  completedCount: number;
  error: string | null;
  setError: (error: string | null) => void;
  totalExpected: number;
  handleGenerateProfilePictures: () => Promise<void>;
  handleRegenerateImage: (imageId: string) => Promise<void>;
  handleRegenerateWithPrompt: (imageId: string, prompt: string) => Promise<void>;
}

/**
 * Hook for profile picture generation logic
 */
export function useProfilePictureGeneration(): UseProfilePictureGenerationReturn {
  const selectedBaseImageId = useCharacterWizardStore((s) => s.selectedBaseImageId);
  const baseImages = useCharacterWizardStore((s) => s.baseImages);
  const profilePictureSet = useCharacterWizardStore((s) => s.profilePictureSet);
  const form = useCharacterWizardStore((s) => s.form);
  const setProfilePictureSetGenerating = useCharacterWizardStore(
    (s) => s.setProfilePictureSetGenerating
  );
  const setProfilePictureSetImages = useCharacterWizardStore(
    (s) => s.setProfilePictureSetImages
  );
  const addProfilePicture = useCharacterWizardStore((s) => s.addProfilePicture);
  const updateProfilePicture = useCharacterWizardStore((s) => s.updateProfilePicture);

  const [completedCount, setCompletedCount] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);

  const safeBaseImages = Array.isArray(baseImages) ? baseImages : [];
  const selectedBaseImage = safeBaseImages.find((img) => img.id === selectedBaseImageId);

  // Get profile picture set to determine expected count
  const set = React.useMemo(() => getProfilePictureSet('classic-influencer'), []);
  const expectedRegularCount = set?.positions.length || 7;
  const expectedNSFWCount = form.nsfwEnabled ? 3 : 0;
  const totalExpected = expectedRegularCount + expectedNSFWCount;

  const safeProfileImages = Array.isArray(profilePictureSet.images) ? profilePictureSet.images : [];

  const handleGenerateProfilePictures = React.useCallback(async () => {
    if (!selectedBaseImage) return;

    setProfilePictureSetGenerating(true);
    setCompletedCount(0);
    setError(null);

    try {
      await generateProfilePictureSetAndWait(
        {
          baseImageUrl: selectedBaseImage.url,
          setId: 'classic-influencer',
          nsfwEnabled: form.nsfwEnabled,
          generationMode: 'fast',
        },
        (status: JobStatus, err?: string) => {
          if (status === 'completed') {
            setProfilePictureSetGenerating(false);
          } else if (status === 'failed') {
            setProfilePictureSetGenerating(false);
            if (err) setError(err);
          }
        },
        (image: GeneratedImage, positionId: string, positionName: string) => {
          const profileImage: ProfilePictureImage = {
            ...image,
            positionId,
            positionName,
            isNSFW: positionId.startsWith('nsfw-'),
          };

          const currentImages = profilePictureSet.images;
          const skeletonIndex = currentImages.findIndex(
            (img) => img.positionId === positionId && img.url === 'skeleton'
          );

          if (skeletonIndex !== -1) {
            const updatedImages = [...currentImages];
            updatedImages[skeletonIndex] = profileImage;
            setProfilePictureSetImages(updatedImages);
          } else {
            addProfilePicture(profileImage);
          }

          setCompletedCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= totalExpected) {
              setProfilePictureSetGenerating(false);
            }
            return newCount;
          });
        }
      );
    } catch (error) {
      console.error('Profile picture generation failed:', error);
      setProfilePictureSetGenerating(false);
      setError(error instanceof Error ? error.message : 'Profile picture generation failed');
    }
  }, [
    selectedBaseImage,
    form.nsfwEnabled,
    totalExpected,
    setProfilePictureSetGenerating,
    setProfilePictureSetImages,
    addProfilePicture,
    profilePictureSet.images,
  ]);

  const handleRegenerateImage = React.useCallback(
    async (imageId: string) => {
      const image = safeProfileImages.find((img) => img.id === imageId);
      if (!image || !selectedBaseImage) return;

      updateProfilePicture(imageId, { url: 'loading' });

      try {
        const regeneratedImage = await regenerateProfilePictureAndWait(
          {
            baseImageUrl: selectedBaseImage.url,
            positionId: image.positionId,
            nsfwEnabled: form.nsfwEnabled,
            setId: 'classic-influencer',
          },
          () => {}
        );

        updateProfilePicture(imageId, {
          url: regeneratedImage.url,
          thumbnailUrl: regeneratedImage.thumbnailUrl,
        });
      } catch (error) {
        console.error('Regeneration failed:', error);
        updateProfilePicture(imageId, { url: image.url });
      }
    },
    [safeProfileImages, selectedBaseImage, form.nsfwEnabled, updateProfilePicture]
  );

  const handleRegenerateWithPrompt = React.useCallback(
    async (imageId: string, prompt: string) => {
      const image = safeProfileImages.find((img) => img.id === imageId);
      if (!image || !selectedBaseImage) return;

      updateProfilePicture(imageId, { prompt, url: 'loading' });

      try {
        const regeneratedImage = await regenerateProfilePictureAndWait(
          {
            baseImageUrl: selectedBaseImage.url,
            positionId: image.positionId,
            prompt,
            nsfwEnabled: form.nsfwEnabled,
            setId: 'classic-influencer',
          },
          () => {}
        );

        updateProfilePicture(imageId, {
          url: regeneratedImage.url,
          thumbnailUrl: regeneratedImage.thumbnailUrl,
          prompt,
        });
      } catch (error) {
        console.error('Regeneration with new prompt failed:', error);
        updateProfilePicture(imageId, { url: image.url });
      }
    },
    [safeProfileImages, selectedBaseImage, form.nsfwEnabled, updateProfilePicture]
  );

  return {
    isGenerating: profilePictureSet.generating,
    completedCount,
    error,
    setError,
    totalExpected,
    handleGenerateProfilePictures,
    handleRegenerateImage,
    handleRegenerateWithPrompt,
  };
}

