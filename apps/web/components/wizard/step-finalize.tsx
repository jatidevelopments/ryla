'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore, useInfluencerStore, profilePictureSets } from '@ryla/business';
import { Input, cn } from '@ryla/ui';
import type { AIInfluencer } from '@ryla/shared';
import { trpc } from '../../lib/trpc';
import { useCredits } from '../../lib/hooks/use-credits';
import { ZeroCreditsModal } from '../credits';

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
            form.personalityTraits.length > 0 ? form.personalityTraits : ['friendly'],
          bio: form.bio,
          handle,
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

      {/* Character Name */}
      <div className="w-full mb-6">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-3">Character Name</p>
          <Input
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Enter character name"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Profile Picture Set Selection */}
      <div className="w-full mb-6">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <div className="mb-4">
            <p className="text-white text-base font-semibold mb-1">Profile Picture Set</p>
            <p className="text-white/50 text-xs">
              Choose a preset style. Generated in the background after creation.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Skip option */}
            <label
              className={cn(
                'relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer group',
                form.selectedProfilePictureSetId === null
                  ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-purple-600/10 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              )}
            >
              <input
                type="radio"
                name="profilePictureSet"
                value=""
                checked={form.selectedProfilePictureSetId === null}
                onChange={() => setField('selectedProfilePictureSetId', null)}
                className="sr-only"
              />
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform',
                    form.selectedProfilePictureSetId === null
                      ? 'bg-purple-500/20 scale-110'
                      : 'bg-white/5 group-hover:bg-white/10'
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className={cn(
                      'w-5 h-5 transition-colors',
                      form.selectedProfilePictureSetId === null
                        ? 'text-purple-400'
                        : 'text-white/40 group-hover:text-white/60'
                    )}
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  className={cn(
                    'text-sm font-medium mb-1',
                    form.selectedProfilePictureSetId === null ? 'text-white' : 'text-white/70'
                  )}
                >
                  Skip
                </p>
                <p className="text-white/40 text-xs">Generate later</p>
                {/* Free badge */}
                <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  Free
                </span>
              </div>
              {form.selectedProfilePictureSetId === null && (
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-purple-400 ring-2 ring-purple-400/30" />
              )}
            </label>

            {/* Set options */}
            {profilePictureSets.map((set) => {
              const isSelected = form.selectedProfilePictureSetId === set.id;
              const iconColors = {
                'classic-influencer': 'from-pink-500/20 to-orange-500/20',
                'professional-model': 'from-blue-500/20 to-indigo-500/20',
                'natural-beauty': 'from-green-500/20 to-emerald-500/20',
              };
              const iconBg = iconColors[set.id as keyof typeof iconColors] || 'from-purple-500/20 to-pink-500/20';

              return (
                <label
                  key={set.id}
                  className={cn(
                    'relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer group',
                    isSelected
                      ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-purple-600/10 shadow-lg shadow-purple-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  )}
                >
                  <input
                    type="radio"
                    name="profilePictureSet"
                    value={set.id}
                    checked={isSelected}
                    onChange={() => setField('selectedProfilePictureSetId', set.id as any)}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform bg-gradient-to-br',
                        isSelected ? `${iconBg} scale-110` : `${iconBg} opacity-50 group-hover:opacity-75`
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className={cn(
                          'w-5 h-5 transition-colors',
                          isSelected ? 'text-purple-400' : 'text-white/40 group-hover:text-white/60'
                        )}
                      >
                        <path
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p
                      className={cn(
                        'text-sm font-medium mb-1',
                        isSelected ? 'text-white' : 'text-white/70'
                      )}
                    >
                      {set.name.split(' ')[0]}
                    </p>
                    <p className="text-white/40 text-xs text-center leading-tight">
                      {set.description.split(',')[0]}
                    </p>
                    {/* Credit cost badge */}
                    <span className={cn(
                      "mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      isSelected 
                        ? "bg-purple-500/30 text-purple-300" 
                        : "bg-white/10 text-white/50"
                    )}>
                      +{PROFILE_SET_CREDITS} credits
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-purple-400 ring-2 ring-purple-400/30" />
                  )}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="w-full mb-5">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-4">
          <p className="text-white/70 text-sm">Settings</p>

          {/* NSFW */}
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white text-sm font-medium">18+ Content</p>
                {/* Extra credit cost badge - only show when profile set is selected */}
                {form.selectedProfilePictureSetId !== null && (
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    form.nsfwEnabled 
                      ? "bg-pink-500/30 text-pink-300" 
                      : "bg-white/10 text-white/40"
                  )}>
                    +{NSFW_EXTRA_CREDITS} credits
                  </span>
                )}
              </div>
              <p className="text-white/40 text-xs">
                Enable adult content
                {form.selectedProfilePictureSetId !== null && form.nsfwEnabled && (
                  <span className="block mt-1 text-pink-300/70">
                    3 extra 18+ profile images will be generated
                  </span>
                )}
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center">
              <button
                type="button"
                role="switch"
                aria-checked={form.nsfwEnabled || false}
                onClick={() => setField('nsfwEnabled', !form.nsfwEnabled)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent",
                  form.nsfwEnabled 
                    ? "bg-purple-500" 
                    : "bg-white/20 border border-white/30"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    form.nsfwEnabled ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
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

