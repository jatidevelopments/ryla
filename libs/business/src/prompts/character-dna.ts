/**
 * Character DNA Templates
 *
 * Pre-built character DNA profiles based on AI influencer course.
 * These serve as starting points for creating consistent characters.
 *
 * Source: docs/research/ai-influencer-course/Creating_an_AI_Influencer_Character_Guide.md
 */

import { CharacterDNA } from './types';

/**
 * Example character DNA profiles for different personas
 */
export const characterDNATemplates: Record<string, CharacterDNA> = {
  /** Classic influencer look - versatile for lifestyle/fashion */
  classicInfluencer: {
    name: 'influencer',
    age: '24-year-old',
    ethnicity: 'Caucasian',
    hair: 'long flowing blonde hair',
    eyes: 'bright blue eyes',
    skin: 'fair skin with subtle makeup',
    bodyType: 'slim and toned',
    facialFeatures: 'soft features, full lips, defined cheekbones',
    style: 'Instagram influencer aesthetic',
  },

  /** Latina model - popular for lifestyle/beauty content */
  latinaModel: {
    name: 'emma',
    age: '22-year-old',
    ethnicity: 'Latina',
    hair: 'dark brown wavy hair',
    eyes: 'almond-shaped brown eyes',
    skin: 'warm tanned skin',
    bodyType: 'curvy figure',
    facialFeatures: 'full lips, round jawline',
    style: 'NYC lifestyle blogger',
  },

  /** Asian beauty - popular for K-beauty/skincare content */
  asianBeauty: {
    name: 'sakura',
    age: '23-year-old',
    ethnicity: 'East Asian',
    hair: 'straight black hair with subtle highlights',
    eyes: 'dark brown almond eyes',
    skin: 'porcelain smooth skin',
    bodyType: 'petite and elegant',
    facialFeatures: 'delicate features, small nose, soft lips',
    style: 'K-beauty aesthetic',
  },

  /** Fitness model - for workout/health content */
  fitnessModel: {
    name: 'alexis',
    age: '26-year-old',
    ethnicity: 'Mixed ethnicity',
    hair: 'long dark ponytail',
    eyes: 'green eyes',
    skin: 'athletic tanned skin',
    bodyType: 'athletic and muscular',
    facialFeatures: 'strong jawline, determined expression',
    style: 'fitness influencer',
  },

  /** Bohemian artist - for creative/artistic content */
  bohemianArtist: {
    name: 'luna',
    age: '25-year-old',
    ethnicity: 'Mediterranean',
    hair: 'curly auburn hair',
    eyes: 'hazel eyes',
    skin: 'olive skin with freckles',
    bodyType: 'natural and relaxed',
    facialFeatures: 'expressive eyes, artistic features',
    style: 'bohemian artist aesthetic',
  },

  /** Professional model - for high-fashion content */
  highFashionModel: {
    name: 'victoria',
    age: '27-year-old',
    ethnicity: 'Eastern European',
    hair: 'sleek platinum blonde hair',
    eyes: 'piercing grey eyes',
    skin: 'flawless pale skin',
    bodyType: 'tall and slender',
    facialFeatures: 'sharp cheekbones, defined jawline, pouty lips',
    style: 'high fashion editorial',
  },
};

/**
 * Convert character DNA to a prompt segment
 * 
 * Token ordering optimized for AI models (most important first):
 * 1. Age + ethnicity (core identity)
 * 2. Distinctive features (hair, eyes - most recognizable)
 * 3. Skin/complexion
 * 4. Facial features (secondary identity)
 * 5. Body type (environmental)
 */
export function dnaToPromptSegment(dna: CharacterDNA): string {
  const parts: string[] = [];

  // Age and ethnicity - core identity first
  if (dna.ethnicity) {
    parts.push(`${dna.age} ${dna.ethnicity} woman`);
  } else {
    parts.push(`${dna.age} woman`);
  }

  // Most distinctive/recognizable features next
  parts.push(dna.hair);
  parts.push(dna.eyes);
  parts.push(dna.skin);

  // Secondary features
  if (dna.facialFeatures) {
    parts.push(dna.facialFeatures);
  }

  if (dna.bodyType) {
    parts.push(dna.bodyType);
  }

  return parts.join(', ');
}

/**
 * Convert character DNA to an enhanced prompt segment for realism
 * Adds natural skin texture and authentic appearance modifiers
 */
export function dnaToRealisticPromptSegment(dna: CharacterDNA): string {
  const baseParts: string[] = [];

  // Age and ethnicity - core identity first
  if (dna.ethnicity) {
    baseParts.push(`${dna.age} ${dna.ethnicity} woman`);
  } else {
    baseParts.push(`${dna.age} woman`);
  }

  // Most distinctive/recognizable features
  baseParts.push(dna.hair);
  baseParts.push(dna.eyes);
  
  // Enhanced skin description for realism
  const skinWithTexture = dna.skin.includes('skin') 
    ? dna.skin.replace('skin', 'skin with natural texture')
    : `${dna.skin}, natural skin texture`;
  baseParts.push(skinWithTexture);

  // Secondary features
  if (dna.facialFeatures) {
    baseParts.push(dna.facialFeatures);
  }

  if (dna.bodyType) {
    baseParts.push(dna.bodyType);
  }

  return baseParts.join(', ');
}

/**
 * Create a minimal character DNA from required fields
 */
export function createCharacterDNA(
  name: string,
  overrides: Partial<CharacterDNA>
): CharacterDNA {
  return {
    name,
    age: overrides.age || '24-year-old',
    hair: overrides.hair || 'long flowing hair',
    eyes: overrides.eyes || 'expressive eyes',
    skin: overrides.skin || 'natural skin',
    ...overrides,
  };
}

/**
 * Merge character DNA with partial overrides
 */
export function mergeCharacterDNA(
  base: CharacterDNA,
  overrides: Partial<CharacterDNA>
): CharacterDNA {
  return { ...base, ...overrides };
}

