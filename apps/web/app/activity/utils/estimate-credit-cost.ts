import { FEATURE_CREDITS } from '@ryla/shared';

/**
 * Estimate credit cost from feature type
 * This is an approximation based on the shared pricing
 */
export function estimateCreditCost(
  featureType: string | null | undefined,
  imageCount: number | null | undefined
): number | null {
  if (!featureType) {
    // Default to studio_standard if no feature type provided
    const count = imageCount ?? 1;
    return FEATURE_CREDITS.studio_standard.credits * count;
  }

  const count = imageCount ?? 1;

  // Map feature types to costs
  switch (featureType.toLowerCase()) {
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
      // Default to studio_standard for unknown types
      return FEATURE_CREDITS.studio_standard.credits * count;
  }
}

