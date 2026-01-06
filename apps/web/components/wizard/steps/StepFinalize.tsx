'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { useCredits } from '../../lib/hooks/use-credits';
import { ZeroCreditsModal } from '../credits';
import { ProfilePictureSetSelector } from './profile-picture-set-selector';
import { useFinalizeCredits } from './hooks/use-finalize-credits';
import { useCharacterCreation } from './hooks/use-character-creation';
import { BaseImagePreview } from './finalize/base-image-preview';
import { NSFWToggleSection } from './finalize/nsfw-toggle-section';
import { CreditSummary } from './finalize/credit-summary';
import { CreateButton } from './finalize/create-button';
import { CreatingLoading } from './finalize/creating-loading';

/**
 * Step: Finalize
 * Review selected base image and create character.
 *
 * Profile pictures are generated on the Character Profile page after creation,
 * in the background, so users aren't blocked.
 */
export function StepFinalize() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  const { balance, isLoading: isLoadingCredits, refetch: refetchCredits } = useCredits();
  const [showCreditModal, setShowCreditModal] = React.useState(false);

  const { creditCost, profileSetCost, nsfwExtraCost, hasEnoughCredits, PROFILE_SET_CREDITS, NSFW_EXTRA_CREDITS } =
    useFinalizeCredits(balance);
  const { create, isCreating, error, selectedBaseImage } = useCharacterCreation();

  const handleCreate = () => {
    create(hasEnoughCredits, () => setShowCreditModal(true), refetchCredits);
  };

  if (isCreating) {
    return <CreatingLoading />;
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
      {selectedBaseImage && <BaseImagePreview imageUrl={selectedBaseImage.url} />}

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
      <NSFWToggleSection
        enabled={form.nsfwEnabled}
        onToggle={() => setField('nsfwEnabled', !form.nsfwEnabled)}
        extraCredits={NSFW_EXTRA_CREDITS}
      />

      {/* Credit Balance & Create Button */}
      <div className="w-full">
        <CreditSummary
          creditCost={creditCost}
          profileSetCost={profileSetCost}
          nsfwExtraCost={nsfwExtraCost}
          balance={balance}
          isLoadingCredits={isLoadingCredits}
          hasEnoughCredits={hasEnoughCredits}
        />

        <CreateButton
          onClick={handleCreate}
          disabled={isLoadingCredits || !selectedBaseImage}
          hasEnoughCredits={hasEnoughCredits}
          hasSelectedBaseImage={!!selectedBaseImage}
          creditCost={creditCost}
          balance={balance}
        />
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

