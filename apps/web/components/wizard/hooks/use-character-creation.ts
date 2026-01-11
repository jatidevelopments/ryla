'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  useCharacterWizardStore,
  useInfluencerStore,
  getProfilePictureSet,
  useProfilePicturesStore,
} from '@ryla/business';
import type { AIInfluencer } from '@ryla/shared';
import { trpc } from '../../../lib/trpc';
import { generateProfilePictureSetAndWait } from '../../../lib/api/character';

export function useCharacterCreation() {
  const router = useRouter();
  const form = useCharacterWizardStore((s) => s.form);

  const setStatus = useCharacterWizardStore((s) => s.setStatus);
  const setCharacterId = useCharacterWizardStore((s) => s.setCharacterId);
  const resetForm = useCharacterWizardStore((s) => s.resetForm);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);
  const selectedBaseImageId = useCharacterWizardStore((s) => s.selectedBaseImageId);
  const baseImages = useCharacterWizardStore((s) => s.baseImages);

  const utils = trpc.useUtils();
  const createCharacter = trpc.character.create.useMutation();

  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedBaseImage = baseImages.find((img) => img.id === selectedBaseImageId);

  const create = React.useCallback(
    async (hasEnoughCredits: boolean, onShowCreditModal: () => void, onRefetchCredits: () => void) => {
      if (!hasEnoughCredits) {
        onShowCreditModal();
        return;
      }

      if (!selectedBaseImage) {
        setError('Please select a base image');
        return;
      }

      setIsCreating(true);
      setStatus('generating');
      setError(null);

      try {
        // Create real DB-backed character (UUID) so Studio + image gallery work
        const handle = `@${(form.name || 'unnamed').toLowerCase().replace(/\s+/g, '.')}`;

        const character = await createCharacter.mutateAsync({
          name: form.name || 'Unnamed',
          baseImageUrl: selectedBaseImage.url,
          config: {
            // Step 1: Style
            gender: form.gender || 'female',
            style: form.style || 'realistic',
            // Step 2: Basic Appearance
            ethnicity: form.ethnicity || 'caucasian',
            age: form.age,
            ageRange: form.ageRange || undefined,
            skinColor: form.skinColor || undefined,
            // Step 3: Facial Features
            eyeColor: form.eyeColor || 'brown',
            faceShape: form.faceShape || undefined,
            // Step 4: Hair
            hairStyle: form.hairStyle || 'long-straight',
            hairColor: form.hairColor || 'brown',
            // Step 5: Body
            bodyType: form.bodyType || 'slim',
            assSize: form.assSize || undefined,
            breastSize: form.breastSize || undefined,
            breastType: form.breastType || undefined,
            // Step 6: Skin Features
            freckles: form.freckles || undefined,
            scars: form.scars || undefined,
            beautyMarks: form.beautyMarks || undefined,
            // Step 7: Body Modifications
            piercings: form.piercings || undefined,
            tattoos: form.tattoos || undefined,
            // Step 8: Identity
            defaultOutfit: form.outfit || 'casual',
            archetype: form.archetype || 'girl-next-door',
            personalityTraits:
              form.personalityTraits.length > 0 ? form.personalityTraits : ['friendly'],
            bio: form.bio,
            handle,
            // Settings
            nsfwEnabled: form.nsfwEnabled,
            // Store selected profile picture set ID (null = skip)
            profilePictureSetId: form.selectedProfilePictureSetId || undefined,
          },
        });

        const newInfluencer: AIInfluencer = {
          id: character.id,
          name: form.name || 'Unnamed',
          handle,
          bio: form.bio || 'New AI influencer ✨',
          avatar: selectedBaseImage.url,
          gender: form.gender || 'female',
          style: form.style || 'realistic',
          ethnicity: form.ethnicity || 'caucasian',
          age: form.age,
          hairStyle: form.hairStyle || 'long-straight',
          hairColor: form.hairColor || 'brown',
          eyeColor: form.eyeColor || 'brown',
          bodyType: form.bodyType || 'slim',
          breastSize: form.breastSize || undefined,
          archetype: form.archetype || 'girl-next-door',
          personalityTraits:
            form.personalityTraits.length > 0 ? form.personalityTraits : ['friendly'],
          outfit: form.outfit || 'casual',
          nsfwEnabled: form.nsfwEnabled,
          profilePictureSetId: form.selectedProfilePictureSetId || undefined,
          postCount: 0,
          imageCount: 0, // Profile pictures generated separately
          likedCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addInfluencer(newInfluencer);
        setCharacterId(character.id);
        setStatus('completed');
        resetForm();

        onRefetchCredits();

        // Invalidate activity feed to show new credit usage
        utils.activity.list.invalidate();
        utils.activity.summary.invalidate();
        // Invalidate notifications (character created notification)
        utils.notifications.list.invalidate();

        // Automatically generate profile pictures if a set was selected
        // They will appear in the gallery automatically via database
        if (form.selectedProfilePictureSetId && selectedBaseImage) {
          // Get the profile picture set to calculate total count
          const set = getProfilePictureSet(form.selectedProfilePictureSetId);
          const regularCount = set?.positions.length || 7;
          const nsfwCount = form.nsfwEnabled ? 3 : 0;
          const totalCount = regularCount + nsfwCount;

          // Start tracking generation in store
          const { start, complete, fail, upsertImage } = useProfilePicturesStore.getState();

          // Generate in background - track progress via store
          generateProfilePictureSetAndWait(
            {
              baseImageUrl: selectedBaseImage.url,
              characterId: character.id,
              setId: form.selectedProfilePictureSetId,
              nsfwEnabled: form.nsfwEnabled,
              generationMode: 'fast', // Use fast mode (no PuLID) for now
            },
            (status, error) => {
              // Progress callback - update store status
              if (status === 'completed') {
                complete(character.id);
              } else if (status === 'failed') {
                fail(character.id, error || 'Generation failed');
              }
              // Progress count is updated automatically via onImageComplete -> upsertImage
            },
            (image, positionId, positionName) => {
              // Image complete callback - update store
              upsertImage(character.id, {
                id: image.id,
                url: image.url,
                thumbnailUrl: image.thumbnailUrl,
                positionId,
                positionName,
                prompt: image.prompt,
                negativePrompt: image.negativePrompt,
                isNSFW: image.isNSFW,
              });
            }
          )
            .then(({ jobIds }) => {
              // Start tracking with job IDs and total count
              start(character.id, {
                setId: form.selectedProfilePictureSetId!,
                jobIds: jobIds,
                totalCount,
              });
            })
            .catch((error) => {
              console.error('Failed to start profile picture generation:', error);
              fail(character.id, error instanceof Error ? error.message : 'Failed to start generation');
              // Don't block navigation - generation happens in background
            });
        }

        router.push(`/influencer/${character.id}`);
      } catch (err) {
        console.error('Character creation failed:', err);
        setError(err instanceof Error ? err.message : 'Character creation failed');
        setIsCreating(false);
        setStatus('error');
      }
    },
    [
      selectedBaseImage,
      form,
      createCharacter,
      setStatus,
      setCharacterId,
      resetForm,
      addInfluencer,
      router,
      utils,
    ]
  );

  return {
    create,
    isCreating,
    error,
    selectedBaseImage,
  };
}

