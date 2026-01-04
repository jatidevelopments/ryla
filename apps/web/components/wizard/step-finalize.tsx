'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore, useInfluencerStore, getProfilePictureSet, useProfilePicturesStore } from '@ryla/business';
import { cn } from '@ryla/ui';
import type { AIInfluencer } from '@ryla/shared';
import { trpc } from '../../lib/trpc';
import { useCredits } from '../../lib/hooks/use-credits';
import { ZeroCreditsModal } from '../credits';
import { generateProfilePictureSetAndWait } from '../../lib/api/character';
import { ProfilePictureSetSelector } from './profile-picture-set-selector';

/**
 * Step: Finalize
 * Review selected base image and create character.
 *
 * Profile pictures are generated on the Character Profile page after creation,
 * in the background, so users aren't blocked.
 */
import { FEATURE_CREDITS } from '../../constants/pricing';

// Credit costs for options
const PROFILE_SET_CREDITS = FEATURE_CREDITS.profile_set_fast.credits; // 200 credits for profile set
const NSFW_EXTRA_CREDITS = 50; // Extra credits for 3 NSFW images in profile set

export function StepFinalize() {
  const router = useRouter();
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);
  const setStatus = useCharacterWizardStore((s) => s.setStatus);
  const setCharacterId = useCharacterWizardStore((s) => s.setCharacterId);
  const resetForm = useCharacterWizardStore((s) => s.resetForm);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);

  const utils = trpc.useUtils();
  const createCharacter = trpc.character.create.useMutation();

  const selectedBaseImageId = useCharacterWizardStore((s) => s.selectedBaseImageId);
  const baseImages = useCharacterWizardStore((s) => s.baseImages);
  // NOTE: Profile pictures are generated post-create on the profile page.

  const { balance, isLoading: isLoadingCredits, refetch: refetchCredits } = useCredits();
  const [showCreditModal, setShowCreditModal] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedBaseImage = baseImages.find((img) => img.id === selectedBaseImageId);

  // Calculate dynamic credit cost based on selections
  const profileSetSelected = form.selectedProfilePictureSetId !== null;
  const profileSetCost = profileSetSelected ? PROFILE_SET_CREDITS : 0;
  const nsfwExtraCost = profileSetSelected && form.nsfwEnabled ? NSFW_EXTRA_CREDITS : 0;
  const creditCost = profileSetCost + nsfwExtraCost;
  const hasEnoughCredits = balance >= creditCost;

  const handleCreate = async () => {
    if (!hasEnoughCredits) {
      setShowCreditModal(true);
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
      const handle = `@${(form.name || 'unnamed')
        .toLowerCase()
        .replace(/\s+/g, '.')}`;

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
          form.personalityTraits.length > 0
            ? form.personalityTraits
            : ['friendly'],
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

      refetchCredits();

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
        const { start, updateProgress, complete, fail, upsertImage } = useProfilePicturesStore.getState();
        
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
        ).then(({ jobIds }) => {
          // Start tracking with job IDs and total count
          start(character.id, {
            setId: form.selectedProfilePictureSetId,
            jobIds: jobIds,
            totalCount,
          });
        }).catch((error) => {
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
  };

  if (isCreating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Creating Your Character
        </h2>
        <p className="text-white/60 text-sm">This may take a moment...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-white/60 text-sm font-medium mb-2">Final Step</p>
        <h1 className="text-white text-2xl font-bold">
          Review & Create Your Character
        </h1>
      </div>

      {/* Base Image Preview */}
      {selectedBaseImage && (
        <div className="w-full mb-6">
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-3">Selected Base Image</p>
            <div className="relative aspect-square max-w-xs mx-auto rounded-xl overflow-hidden">
              <Image
                src={selectedBaseImage.url}
                alt="Selected base image"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      )}


      {/* Profile Picture Set Selection */}
      <div className="w-full mb-6">
        <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <ProfilePictureSetSelector
            selectedSetId={form.selectedProfilePictureSetId}
            onSelect={(setId) => setField('selectedProfilePictureSetId', setId as any)}
            creditCost={PROFILE_SET_CREDITS}
          />
        </div>
      </div>

      {/* Adult Content Toggle */}
      <div className="w-full mb-5">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-4 font-medium">Adult Content</p>
          <button
            onClick={() => setField('nsfwEnabled', !form.nsfwEnabled)}
            className={cn(
              'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
              form.nsfwEnabled
                ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            )}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-semibold text-white">
                    Enable Adult Content
                  </p>
                  {/* Credit cost badge - always show */}
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    form.nsfwEnabled 
                      ? "bg-pink-500/30 text-pink-300" 
                      : "bg-white/10 text-white/40"
                  )}>
                    +{NSFW_EXTRA_CREDITS} credits
                  </span>
                </div>
                <p className="text-sm text-white/60">
                  Allow generation of adult content
                  {form.nsfwEnabled && (
                    <span className="block mt-1 text-pink-300/70">
                      3 extra 18+ profile images will be generated automatically
                    </span>
                  )}
                </p>
              </div>
              <div
                className={cn(
                  'w-12 h-6 rounded-full transition-all duration-200 flex items-center flex-shrink-0',
                  form.nsfwEnabled
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-white/20'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-md',
                    form.nsfwEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  )}
                />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Credit Balance & Create Button */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Cost:</span>
              <span
                className={cn(
                  'font-semibold text-sm',
                  creditCost === 0 ? 'text-green-400' : hasEnoughCredits ? 'text-white' : 'text-red-400'
                )}
              >
                {creditCost === 0 ? 'Free' : `${creditCost} credits`}
              </span>
            </div>
            {/* Cost breakdown when multiple costs */}
            {creditCost > 0 && (profileSetCost > 0 || nsfwExtraCost > 0) && (
              <p className="text-white/40 text-xs mt-0.5">
                {profileSetCost > 0 && <span>Profile set: {profileSetCost}</span>}
                {nsfwExtraCost > 0 && <span> + NSFW: {nsfwExtraCost}</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Balance:</span>
            <span
              className={cn(
                'font-semibold text-sm',
                hasEnoughCredits ? 'text-green-400' : 'text-red-400'
              )}
            >
              {isLoadingCredits ? '...' : balance}
            </span>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={isLoadingCredits || !selectedBaseImage}
          className={cn(
            'w-full h-14 rounded-xl font-bold text-base shadow-lg transition-all relative overflow-hidden group',
            hasEnoughCredits && selectedBaseImage
              ? 'bg-gradient-to-r from-[#c4b5fd] to-[#7c3aed] text-white shadow-purple-500/30 hover:shadow-purple-500/50'
              : 'bg-gradient-to-r from-red-500/80 to-red-600/80 text-white shadow-red-500/30 hover:shadow-red-500/50'
          )}
        >
          <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {hasEnoughCredits && selectedBaseImage ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Create Character
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {!selectedBaseImage
                  ? 'Select Base Image First'
                  : 'Insufficient Credits'}
              </>
            )}
          </span>
        </button>

        {!hasEnoughCredits && (
          <p className="text-red-400/80 text-xs text-center mt-3">
            You need {creditCost - balance} more credits to create
          </p>
        )}
      </div>

      {error && (
        <div className="w-full mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Zero Credits Modal */}
      <ZeroCreditsModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        creditsNeeded={creditCost}
        currentBalance={balance}
      />
    </div>
  );
}

