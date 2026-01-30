'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore, useInfluencerStore } from '@ryla/business';
import type { AIInfluencer } from '@ryla/shared';
import { trpc } from '../../../lib/trpc';
import {
  generateBaseImagesAndWait,
  type JobStatus,
} from '../../../lib/api/character';

interface UseWizardGenerationOptions {
  balance: number;
  creditCost: number;
  hasEnoughCredits: boolean;
  onShowCreditModal: () => void;
  onRefetchCredits: () => void;
}

interface UseWizardGenerationReturn {
  isGenerating: boolean;
  generationStatus: string;
  error: string | null;
  handleGenerate: () => Promise<void>;
  handleRetry: () => void;
}

/**
 * Hook for wizard character generation logic
 */
export function useWizardGeneration({
  hasEnoughCredits,
  onShowCreditModal,
  onRefetchCredits,
}: UseWizardGenerationOptions): UseWizardGenerationReturn {
  const router = useRouter();
  const form = useCharacterWizardStore((s) => s.form);
  const setStatus = useCharacterWizardStore((s) => s.setStatus);
  const setCharacterId = useCharacterWizardStore((s) => s.setCharacterId);
  const resetForm = useCharacterWizardStore((s) => s.resetForm);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);

  const utils = trpc.useUtils();
  const createCharacter = trpc.character.create.useMutation();

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStatus, setGenerationStatus] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerate = React.useCallback(async () => {
    // Check credits before starting
    if (!hasEnoughCredits) {
      onShowCreditModal();
      return;
    }

    setIsGenerating(true);
    setStatus('generating');
    setError(null);
    setGenerationStatus('Starting generation...');

    try {
      // Build the input for the API from wizard form data
      const input = {
        appearance: {
          gender: form.gender || 'female',
          style: form.style || 'realistic',
          ethnicity: form.ethnicity || 'caucasian',
          age: form.age,
          ageRange: form.ageRange || undefined,
          skinColor: form.skinColor || undefined,
          eyeColor: form.eyeColor || 'brown',
          faceShape: form.faceShape || undefined,
          hairStyle: form.hairStyle || 'long-straight',
          hairColor: form.hairColor || 'brown',
          bodyType: form.bodyType || 'slim',
          assSize: form.assSize || undefined,
          breastSize: form.breastSize || undefined,
          breastType: form.breastType || undefined,
          freckles: form.freckles || undefined,
          scars: form.scars || undefined,
          beautyMarks: form.beautyMarks || undefined,
          piercings: form.piercings || undefined,
          tattoos: form.tattoos || undefined,
        },
        identity: {
          defaultOutfit: form.outfit || 'casual',
          archetype: form.archetype || 'girl-next-door',
          personalityTraits:
            form.personalityTraits.length > 0
              ? form.personalityTraits
              : ['friendly'],
          bio: form.bio,
        },
        nsfwEnabled: form.nsfwEnabled,
      };

      // Call the backend API and wait for completion
      const images = await generateBaseImagesAndWait(
        input,
        (status: JobStatus) => {
          switch (status) {
            case 'queued':
              setGenerationStatus('Queued for processing...');
              break;
            case 'in_progress':
              setGenerationStatus('Generating your influencer...');
              break;
            case 'completed':
              setGenerationStatus('Complete!');
              break;
            default:
              setGenerationStatus('Processing...');
          }
        }
      );

      const handle = `@${(form.name || 'unnamed')
        .toLowerCase()
        .replace(/\s+/g, '.')}`;

      // Extract the URL from the first generated image for avatar / base identity
      const avatarUrl = images[0]?.url || '';

      if (!avatarUrl) {
        throw new Error(
          'Base image generation returned no images; cannot create character'
        );
      }

      const character = await createCharacter.mutateAsync({
        name: form.name || 'Unnamed',
        baseImageUrl: avatarUrl,
        config: {
          gender: form.gender || 'female',
          style: form.style || 'realistic',
          ethnicity: form.ethnicity || 'caucasian',
          age: form.age,
          hairStyle: form.hairStyle || 'long-straight',
          hairColor: form.hairColor || 'brown',
          eyeColor: form.eyeColor || 'brown',
          bodyType: form.bodyType || 'slim',
          breastSize: form.breastSize || undefined,
          defaultOutfit: form.outfit || 'casual',
          archetype: form.archetype || 'girl-next-door',
          personalityTraits:
            form.personalityTraits.length > 0
              ? form.personalityTraits
              : ['friendly'],
          bio: form.bio,
          handle,
          nsfwEnabled: form.nsfwEnabled,
        },
        loraEnabled: form.loraTrainingEnabled,
      });

      const newInfluencer: AIInfluencer = {
        id: character.id,
        name: form.name || 'Unnamed',
        handle,
        bio: form.bio || 'New AI influencer ✨',
        avatar: avatarUrl, // Use first generated image as avatar
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
          form.personalityTraits.length > 0
            ? form.personalityTraits
            : ['friendly'],
        outfit: form.outfit || 'casual',
        nsfwEnabled: form.nsfwEnabled,
        postCount: 0,
        imageCount: images.length,
        likedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addInfluencer(newInfluencer);
      setCharacterId(character.id);
      setStatus('completed');
      resetForm();

      // Refetch credits to update balance after generation
      onRefetchCredits();

      // Invalidate activity feed to show new generation + credit usage
      utils.activity.list.invalidate();
      utils.activity.summary.invalidate();
      // Invalidate notifications (character created + generation complete)
      utils.notifications.list.invalidate();

      router.push(`/studio?influencer=${character.id}`);
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
      setStatus('error');
    }
  }, [
    form,
    hasEnoughCredits,
    onShowCreditModal,
    onRefetchCredits,
    setStatus,
    setCharacterId,
    resetForm,
    addInfluencer,
    createCharacter,
    utils,
    router,
  ]);

  const handleRetry = React.useCallback(() => {
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    isGenerating,
    generationStatus,
    error,
    handleGenerate,
    handleRetry,
  };
}
