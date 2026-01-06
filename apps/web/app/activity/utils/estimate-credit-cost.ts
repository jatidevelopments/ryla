import { FEATURE_CREDITS } from '../../../constants/pricing';

/**
 * Estimate credit cost from quality mode
 * This is an approximation based on the shared pricing
 */
export function estimateCreditCost(
  qualityMode: string | null | undefined,
  imageCount: number | null | undefined
): number | null {
  if (!qualityMode) return null;

  const count = imageCount ?? 1;

  // Map quality modes to feature costs
  switch (qualityMode.toLowerCase()) {
    case 'fast':
    case 'draft':
    case 'studio_fast':
      return FEATURE_CREDITS.studio_fast.credits * count;
    case 'standard':
    case 'hq':
    case 'studio_standard':
      return FEATURE_CREDITS.studio_standard.credits * count;
    case 'profile_set_fast':
      return FEATURE_CREDITS.profile_set_fast.credits;
    case 'profile_set_quality':
      return FEATURE_CREDITS.profile_set_quality.credits;
    case 'base_images':
      return FEATURE_CREDITS.base_images.credits;
    default:
      return null;
  }
}

