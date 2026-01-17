'use client';

import { useCharacterWizardStore } from '@ryla/business';
import { FEATURE_CREDITS } from '@ryla/shared';

// Credit costs from shared pricing
const BASE_IMAGES_CREDITS = FEATURE_CREDITS.base_images.credits; // 80 credits for base images (3 images)
const PROFILE_SET_CREDITS = FEATURE_CREDITS.profile_set_fast.credits; // 120 credits for profile set (8 images)
const NSFW_EXTRA_CREDITS = 50; // Extra credits for 3 NSFW images in profile set

export interface CreditCostBreakdown {
  /** Cost for base images (80 credits if generated) */
  baseImagesCost: number;
  /** Cost for profile picture set (120 credits if selected) */
  profileSetCost: number;
  /** Extra cost for NSFW content (50 credits if enabled with profile set) */
  nsfwExtraCost: number;
  /** Total cost for entire wizard */
  totalCost: number;
  /** Whether user has enough credits for total cost */
  hasEnoughCredits: boolean;
  /** Credits needed to complete (total - balance, or 0 if enough) */
  creditsNeeded: number;
  /** Constants for UI display */
  BASE_IMAGES_CREDITS: number;
  PROFILE_SET_CREDITS: number;
  NSFW_EXTRA_CREDITS: number;
}

/**
 * Hook to calculate total wizard credit cost including base images.
 * 
 * With deferred billing, base images are NOT charged at generation time.
 * All credits are charged atomically when character is created.
 * 
 * Total cost = base_images (80) + profile_set (120 if selected) + nsfw_extra (50 if enabled)
 */
export function useFinalizeCredits(balance: number): CreditCostBreakdown {
  const form = useCharacterWizardStore((s) => s.form);
  const baseImages = useCharacterWizardStore((s) => s.baseImages);

  // Base images cost (if images were generated in wizard)
  // Check for valid images (not skeletons/loading states)
  const hasGeneratedBaseImages = Array.isArray(baseImages) && baseImages.some(
    (img) => img.url && img.url !== 'skeleton' && img.url !== 'loading' && 
    (img.url.startsWith('http') || img.url.startsWith('data:'))
  );
  const baseImagesCost = hasGeneratedBaseImages ? BASE_IMAGES_CREDITS : 0;

  // Profile set cost (if set selected)
  const profileSetSelected = form.selectedProfilePictureSetId !== null;
  const profileSetCost = profileSetSelected ? PROFILE_SET_CREDITS : 0;

  // NSFW extra cost (only if profile set selected AND NSFW enabled)
  const nsfwExtraCost = profileSetSelected && form.nsfwEnabled ? NSFW_EXTRA_CREDITS : 0;

  // Total cost for wizard
  const totalCost = baseImagesCost + profileSetCost + nsfwExtraCost;
  
  // Check if user has enough credits
  const hasEnoughCredits = balance >= totalCost;
  
  // Calculate how many more credits are needed
  const creditsNeeded = hasEnoughCredits ? 0 : totalCost - balance;

  return {
    baseImagesCost,
    profileSetCost,
    nsfwExtraCost,
    totalCost,
    hasEnoughCredits,
    creditsNeeded,
    BASE_IMAGES_CREDITS,
    PROFILE_SET_CREDITS,
    NSFW_EXTRA_CREDITS,
  };
}
