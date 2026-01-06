'use client';

import * as React from 'react';
import { useCharacterWizardStore, getProfilePictureSet, type ProfilePictureImage } from '@ryla/business';

interface UseProfilePictureInitializationOptions {
  selectedBaseImageId: string | null;
  isGenerating: boolean;
  safeProfileImages: ProfilePictureImage[];
  handleGenerateProfilePictures: () => Promise<void>;
}

/**
 * Hook to handle initialization logic for profile picture generation
 * Creates skeleton slots and auto-generates when base image is selected
 */
export function useProfilePictureInitialization({
  selectedBaseImageId,
  isGenerating,
  safeProfileImages,
  handleGenerateProfilePictures,
}: UseProfilePictureInitializationOptions) {
  const baseImages = useCharacterWizardStore((s) => s.baseImages);
  const profilePictureSet = useCharacterWizardStore((s) => s.profilePictureSet);
  const form = useCharacterWizardStore((s) => s.form);
  const setProfilePictureSetImages = useCharacterWizardStore(
    (s) => s.setProfilePictureSetImages
  );

  const safeBaseImages = Array.isArray(baseImages) ? baseImages : [];
  const selectedBaseImage = safeBaseImages.find((img) => img.id === selectedBaseImageId);

  const set = React.useMemo(() => getProfilePictureSet('classic-influencer'), []);
  const expectedRegularCount = set?.positions.length || 7;
  const expectedNSFWCount = form.nsfwEnabled ? 3 : 0;
  const totalExpected = expectedRegularCount + expectedNSFWCount;

  // Auto-generate on mount if base image selected and not already generating
  React.useEffect(() => {
    if (
      selectedBaseImageId &&
      selectedBaseImage &&
      !profilePictureSet.generating &&
      safeProfileImages.length === 0
    ) {
      handleGenerateProfilePictures();
    }
  }, [
    selectedBaseImageId,
    selectedBaseImage,
    profilePictureSet.generating,
    safeProfileImages.length,
    handleGenerateProfilePictures,
  ]);

  // Initialize skeleton slots when generation starts
  React.useEffect(() => {
    if (profilePictureSet.generating && safeProfileImages.length === 0) {
      const skeletonImages: ProfilePictureImage[] = [];

      // Regular positions
      set?.positions.forEach((position) => {
        skeletonImages.push({
          id: `skeleton-${position.id}`,
          url: 'skeleton',
          positionId: position.id,
          positionName: position.name,
          isNSFW: false,
        });
      });

      // NSFW positions if enabled
      if (form.nsfwEnabled) {
        for (let i = 0; i < 3; i++) {
          skeletonImages.push({
            id: `skeleton-nsfw-${i}`,
            url: 'skeleton',
            positionId: `nsfw-${i + 1}`,
            positionName: `NSFW ${i + 1}`,
            isNSFW: true,
          });
        }
      }

      setProfilePictureSetImages(skeletonImages);
    }
  }, [
    profilePictureSet.generating,
    totalExpected,
    set,
    form.nsfwEnabled,
    safeProfileImages.length,
    setProfilePictureSetImages,
  ]);
}

