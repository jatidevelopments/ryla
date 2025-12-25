'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore, useInfluencerStore } from '@ryla/business';
import { Switch, Input, cn } from '@ryla/ui';
import type { AIInfluencer } from '@ryla/shared';
import { useCredits } from '../../lib/hooks/use-credits';
import { ZeroCreditsModal } from '../credits';

/**
 * Step: Finalize
 * Review selected base image, profile picture set, and create character
 */
const BASE_IMAGE_CREDITS = 5;
const PROFILE_PICTURE_SET_CREDITS = 10;

export function StepFinalize() {
  const router = useRouter();
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);
  const setStatus = useCharacterWizardStore((s) => s.setStatus);
  const setCharacterId = useCharacterWizardStore((s) => s.setCharacterId);
  const resetForm = useCharacterWizardStore((s) => s.resetForm);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);

  const selectedBaseImageId = useCharacterWizardStore((s) => s.selectedBaseImageId);
  const baseImages = useCharacterWizardStore((s) => s.baseImages);
  const profilePictureSet = useCharacterWizardStore((s) => s.profilePictureSet);

  const { balance, isLoading: isLoadingCredits, refetch: refetchCredits } = useCredits();
  const [showCreditModal, setShowCreditModal] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedBaseImage = baseImages.find((img) => img.id === selectedBaseImageId);
  const regularProfilePictures = profilePictureSet.images.filter((img) => !img.isNSFW);
  const nsfwProfilePictures = profilePictureSet.images.filter((img) => img.isNSFW);

  const creditCost =
    BASE_IMAGE_CREDITS +
    PROFILE_PICTURE_SET_CREDITS +
    (form.nsfwEnabled && nsfwProfilePictures.length > 0 ? 5 : 0);
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
      // TODO: Call API to create character with base image and profile picture set
      // For now, create local influencer object
      const newId = `influencer-${Date.now()}`;
      const handle = `@${(form.name || 'unnamed')
        .toLowerCase()
        .replace(/\s+/g, '.')}`;

      const newInfluencer: AIInfluencer = {
        id: newId,
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
        postCount: 0,
        imageCount: profilePictureSet.images.length,
        likedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addInfluencer(newInfluencer);
      setCharacterId(newId);
      setStatus('completed');
      resetForm();

      refetchCredits();

      router.push(`/influencer/${newId}/studio`);
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

      {/* Profile Picture Set Preview */}
      {regularProfilePictures.length > 0 && (
        <div className="w-full mb-6">
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-3">
              Profile Picture Set ({regularProfilePictures.length} images)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {regularProfilePictures.slice(0, 8).map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-white/5"
                >
                  <Image
                    src={image.url}
                    alt={image.positionName}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            {regularProfilePictures.length > 8 && (
              <p className="text-white/40 text-xs mt-2 text-center">
                +{regularProfilePictures.length - 8} more images
              </p>
            )}
          </div>
        </div>
      )}

      {/* Character Name */}
      <div className="w-full mb-5">
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

      {/* Settings */}
      <div className="w-full mb-5">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-4">
          <p className="text-white/70 text-sm">Settings</p>

          {/* Quality Mode */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white text-sm font-medium">HQ Mode</p>
              <p className="text-white/40 text-xs">Higher quality output</p>
            </div>
            <Switch
              checked={form.qualityMode === 'hq'}
              onCheckedChange={(checked) =>
                setField('qualityMode', checked ? 'hq' : 'draft')
              }
            />
          </div>

          {/* NSFW */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white text-sm font-medium">18+ Content</p>
              <p className="text-white/40 text-xs">Enable adult content</p>
            </div>
            <Switch
              checked={form.nsfwEnabled}
              onCheckedChange={(checked) => setField('nsfwEnabled', checked)}
            />
          </div>
        </div>
      </div>

      {/* Credit Balance & Create Button */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Cost:</span>
            <span
              className={cn(
                'font-semibold text-sm',
                hasEnoughCredits ? 'text-white' : 'text-red-400'
              )}
            >
              {creditCost} credits
            </span>
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

