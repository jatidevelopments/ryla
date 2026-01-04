/**
 * Get ethnicity-specific influencer asset image path
 * Similar to funnel's getInfluencerImage helper
 */

export type EthnicityValue = 'caucasian' | 'latina' | 'black' | 'asian' | 'arab' | 'mixed' | 'indian' | 'arabian';

/**
 * Get ethnicity-specific influencer asset image path
 * @param category - The category of asset (skin-colors, eye-colors, hair-colors, hair-styles, face-shapes, age-ranges)
 * @param ethnicity - The ethnicity value
 * @param optionValue - The option value (e.g., "light", "blue", "bun")
 * @returns The image path or null if not found
 */
export function getInfluencerImage(
  category: 'skin-colors' | 'eye-colors' | 'hair-colors' | 'hair-styles' | 'face-shapes' | 'age-ranges',
  ethnicity: EthnicityValue | string | null,
  optionValue: string
): string | null {
  if (!ethnicity || !optionValue) return null;

  // Normalize ethnicity value
  let normalizedEthnicity = ethnicity.toLowerCase();
  
  // Map some ethnicity values
  if (normalizedEthnicity === 'arabian') {
    normalizedEthnicity = 'arab';
  }
  if (normalizedEthnicity === 'indian') {
    // Indian might not have specific images, use mixed or caucasian as fallback
    normalizedEthnicity = 'mixed';
  }

  // Map option values to file names
  const fileName = optionValue.toLowerCase().replace(/_/g, '-');

  return `/images/${category}/${normalizedEthnicity}/${fileName}.webp`;
}

/**
 * Get skin feature image path
 */
export function getSkinFeatureImage(
  featureType: 'freckles' | 'scars' | 'beauty-marks',
  value: string
): string | null {
  if (!value) return null;
  const fileName = value.toLowerCase().replace(/_/g, '-');
  return `/images/skin-features/${featureType}/${fileName}.webp`;
}

/**
 * Get tattoo image path
 */
export function getTattooImage(value: string): string | null {
  if (!value) return null;
  const fileName = value.toLowerCase().replace(/_/g, '-');
  return `/images/tattoos/${fileName}.webp`;
}

/**
 * Get piercing image path
 */
export function getPiercingImage(value: string): string | null {
  if (!value) return null;
  const fileName = value.toLowerCase().replace(/_/g, '-');
  return `/images/piercings/${fileName}.webp`;
}

