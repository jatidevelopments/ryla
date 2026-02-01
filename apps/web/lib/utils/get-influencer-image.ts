/**
 * Get ethnicity-specific influencer asset image path
 * Similar to funnel's getInfluencerImage helper
 */

import { withCdn } from '@ryla/shared';

export type EthnicityValue =
  | 'caucasian'
  | 'latina'
  | 'black'
  | 'asian'
  | 'arab'
  | 'mixed'
  | 'indian'
  | 'arabian';

/**
 * Get ethnicity-specific influencer asset image path
 * @param category - The category of asset (skin-colors, eye-colors, hair-colors, hair-styles, face-shapes, age-ranges)
 * @param ethnicity - The ethnicity value
 * @param optionValue - The option value (e.g., "light", "blue", "bun")
 * @returns The image path or null if not found
 */
export function getInfluencerImage(
  category:
    | 'skin-colors'
    | 'eye-colors'
    | 'hair-colors'
    | 'hair-styles'
    | 'face-shapes'
    | 'age-ranges',
  ethnicity: EthnicityValue | string | null,
  optionValue: string
): string | null {
  // Validate inputs - check for null/undefined and whitespace-only strings
  if (!ethnicity?.trim() || !optionValue?.trim()) return null;

  // Normalize ethnicity value
  let normalizedEthnicity = ethnicity.toLowerCase();

  // Map some ethnicity values - NOTE: Folder structure uses 'arabian', not 'arab'
  if (normalizedEthnicity === 'arab') {
    normalizedEthnicity = 'arabian';
  }
  // Keep 'arabian' as is - folder structure uses 'arabian'
  if (normalizedEthnicity === 'indian') {
    // Indian might not have specific images, use mixed or caucasian as fallback
    normalizedEthnicity = 'mixed';
  }

  // Map option values to file names
  const fileName = optionValue.toLowerCase().replace(/_/g, '-');

  // New wizard structure: /images/wizard/{category}/{ethnicity}/{subfolder}/
  const categoryMap: Record<string, { folder: string; subfolder?: string }> = {
    'skin-colors': { folder: 'skin', subfolder: 'colors' },
    'eye-colors': { folder: 'eyes', subfolder: 'colors' },
    'hair-colors': { folder: 'hair', subfolder: 'colors' },
    'hair-styles': { folder: 'hair', subfolder: 'styles' },
    'face-shapes': { folder: 'appearance', subfolder: 'face-shapes' },
    'age-ranges': { folder: 'appearance', subfolder: 'age-ranges' },
  };

  const mapping = categoryMap[category];
  if (!mapping) return null;

  const subfolderPath = mapping.subfolder ? `${mapping.subfolder}/` : '';
  return `/images/wizard/${mapping.folder}/${normalizedEthnicity}/${subfolderPath}${fileName}-${normalizedEthnicity}.webp`;
}

/**
 * Get ethnicity-specific skin feature image path
 */
export function getSkinFeatureImage(
  featureType: 'freckles' | 'scars' | 'beauty-marks',
  value: string,
  ethnicity: EthnicityValue | string | null
): string | null {
  if (!value || !ethnicity) return null;

  let normalizedEthnicity = ethnicity.toLowerCase();
  if (normalizedEthnicity === 'arab') {
    normalizedEthnicity = 'arabian';
  }

  const fileName = `${featureType}-${value
    .toLowerCase()
    .replace(/_/g, '-')}-${normalizedEthnicity}.webp`;
  return `/images/wizard/skin/${normalizedEthnicity}/features/${featureType}/${fileName}`;
}

/**
 * Get ethnicity-specific body type image path
 */
export function getBodyTypeImage(
  bodyType: string,
  gender: 'female' | 'male',
  ethnicity: EthnicityValue | string | null
): string | null {
  if (!bodyType || !gender || !ethnicity) return null;

  let normalizedEthnicity = ethnicity.toLowerCase();
  if (normalizedEthnicity === 'arab') {
    normalizedEthnicity = 'arabian';
  }

  const fileName = `body-${bodyType}-${gender}-${normalizedEthnicity}.webp`;
  return `/images/wizard/body/${normalizedEthnicity}/body-types/${fileName}`;
}

/**
 * Get ethnicity-specific breast size image path
 */
export function getBreastSizeImage(
  size: string,
  ethnicity: EthnicityValue | string | null
): string | null {
  if (!size || !ethnicity) return null;

  let normalizedEthnicity = ethnicity.toLowerCase();
  if (normalizedEthnicity === 'arab') {
    normalizedEthnicity = 'arabian';
  }

  const fileName = `breast-${size}-${normalizedEthnicity}.webp`;
  return `/images/wizard/body/${normalizedEthnicity}/breast-sizes/${fileName}`;
}

/**
 * Get ethnicity-specific ass size image path
 */
export function getAssSizeImage(
  size: string,
  ethnicity: EthnicityValue | string | null
): string | null {
  if (!size || !ethnicity) return null;

  let normalizedEthnicity = ethnicity.toLowerCase();
  if (normalizedEthnicity === 'arab') {
    normalizedEthnicity = 'arabian';
  }

  const fileName = `ass-${size}-${normalizedEthnicity}.webp`;
  return `/images/wizard/body/${normalizedEthnicity}/ass-sizes/${fileName}`;
}

/**
 * Get ethnicity-specific breast type image path
 */
export function getBreastTypeImage(
  type: string,
  ethnicity: EthnicityValue | string | null
): string | null {
  if (!type || !ethnicity) return null;

  let normalizedEthnicity = ethnicity.toLowerCase();
  if (normalizedEthnicity === 'arab') {
    normalizedEthnicity = 'arabian';
  }

  const fileName = `breast-type-${type}-${normalizedEthnicity}.webp`;
  return `/images/wizard/body/${normalizedEthnicity}/breast-types/${fileName}`;
}

/**
 * Get ethnicity-specific tattoo image path
 */
export function getTattooImage(
  value: string,
  ethnicity: EthnicityValue | string | null
): string | null {
  if (!value || !ethnicity) return null;

  let normalizedEthnicity = ethnicity.toLowerCase();
  if (normalizedEthnicity === 'arab') {
    normalizedEthnicity = 'arabian';
  }

  const fileName = `${value
    .toLowerCase()
    .replace(/_/g, '-')}-${normalizedEthnicity}.webp`;
  return `/images/wizard/modifications/${normalizedEthnicity}/tattoos/${fileName}`;
}

/**
 * Get ethnicity-specific piercing image path
 */
export function getPiercingImage(
  value: string,
  ethnicity: EthnicityValue | string | null
): string | null {
  if (!value || !ethnicity) return null;

  let normalizedEthnicity = ethnicity.toLowerCase();
  if (normalizedEthnicity === 'arab') {
    normalizedEthnicity = 'arabian';
  }

  const fileName = `${value
    .toLowerCase()
    .replace(/_/g, '-')}-${normalizedEthnicity}.webp`;
  return `/images/wizard/modifications/${normalizedEthnicity}/piercings/${fileName}`;
}

/**
 * Get ethnicity-specific skin color image path
 */
export function getSkinColorImage(
  color: string,
  ethnicity: EthnicityValue | string | null
): string | null {
  if (!color || !ethnicity) return null;

  let normalizedEthnicity = ethnicity.toLowerCase();
  if (normalizedEthnicity === 'arab') {
    normalizedEthnicity = 'arabian';
  }

  const fileName = `${color
    .toLowerCase()
    .replace(/_/g, '-')}-${normalizedEthnicity}.webp`;
  return `/images/wizard/skin/${normalizedEthnicity}/colors/${fileName}`;
}

/**
 * Get ethnicity-specific portrait image path
 * Returns CDN-prefixed URL if CDN is configured
 */
export function getEthnicityImage(
  ethnicity: EthnicityValue | string | null,
  gender: 'female' | 'male' | null,
  type: 'portrait' | 'full-body' = 'portrait'
): string | null {
  if (!ethnicity || !gender) return null;

  let normalizedEthnicity = ethnicity.toLowerCase();
  if (normalizedEthnicity === 'arab') {
    normalizedEthnicity = 'arabian';
  }
  if (normalizedEthnicity === 'indian') {
    normalizedEthnicity = 'indian'; // Keep indian as is
  }

  const fileName = `${gender}-${
    type === 'portrait' ? 'portrait' : 'full-body'
  }.webp`;
  const path = `/images/wizard/appearance/${normalizedEthnicity}/ethnicity/${fileName}`;
  return withCdn(path);
}

/**
 * Get ethnicity-specific archetype image path
 * @param archetypeId - The archetype ID (e.g., "girl-next-door", "fitness-enthusiast")
 * @param ethnicity - The ethnicity value
 * @returns The image path or null if not found
 */
export function getArchetypeImage(
  archetypeId: string,
  ethnicity: EthnicityValue | string | null
): string | null {
  if (!archetypeId || !ethnicity) return null;

  let normalizedEthnicity = ethnicity.toLowerCase();
  if (normalizedEthnicity === 'arab') {
    normalizedEthnicity = 'arabian';
  }

  const fileName = `archetype-${archetypeId}-${normalizedEthnicity}.webp`;
  return `/images/wizard/personality/${normalizedEthnicity}/archetypes/${fileName}`;
}
