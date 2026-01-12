'use client';

import { useCharacterWizardStore } from '@ryla/business';
import { FEATURE_CREDITS } from '@ryla/shared';

const PROFILE_SET_CREDITS = FEATURE_CREDITS.profile_set_fast.credits; // 120 credits for profile set (8 images)
const NSFW_EXTRA_CREDITS = 50; // Extra credits for 3 NSFW images in profile set

export function useFinalizeCredits(balance: number) {
  const form = useCharacterWizardStore((s) => s.form);

  const profileSetSelected = form.selectedProfilePictureSetId !== null;
  const profileSetCost = profileSetSelected ? PROFILE_SET_CREDITS : 0;
  const nsfwExtraCost = profileSetSelected && form.nsfwEnabled ? NSFW_EXTRA_CREDITS : 0;
  const creditCost = profileSetCost + nsfwExtraCost;
  const hasEnoughCredits = balance >= creditCost;

  return {
    creditCost,
    profileSetCost,
    nsfwExtraCost,
    hasEnoughCredits,
    PROFILE_SET_CREDITS,
    NSFW_EXTRA_CREDITS,
  };
}

