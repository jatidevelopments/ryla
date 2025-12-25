/**
 * Profile Picture Sets
 *
 * Pre-defined sets of prompts for generating 7-10 profile pictures
 * with different positions, angles, and styles for AI influencers.
 *
 * Each set includes:
 * - 7-10 variations with different angles/positions
 * - Consistent character DNA
 * - Matching prompts for each position
 * - Style modifiers for realistic appearance
 */

import { CharacterDNA } from './types';
import { PromptBuilder } from './builder';
import { characterDNATemplates } from './character-dna';

/**
 * Profile picture position/angle definitions
 */
export interface ProfilePicturePosition {
  /** Position identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Angle description for prompt */
  angle: string;
  /** Pose description */
  pose: string;
  /** Expression for this position */
  expression: string;
  /** Lighting style */
  lighting: string;
  /** Camera distance/framing */
  framing: 'close-up' | 'medium' | 'full-body';
  /** Recommended aspect ratio */
  aspectRatio: '1:1' | '4:5' | '9:16';
}

/**
 * Complete profile picture set configuration
 */
export interface ProfilePictureSet {
  /** Unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of the set style */
  description: string;
  /** Character DNA to use */
  characterDNA: CharacterDNA;
  /** Base style/aesthetic */
  style: string;
  /** All positions in this set (7-10) */
  positions: ProfilePicturePosition[];
  /** Base prompt template */
  basePromptTemplate: string;
  /** Negative prompt */
  negativePrompt: string;
  /** Tags for filtering */
  tags: string[];
}

/**
 * Standard profile picture positions (7-10 variations)
 */
export const standardProfilePositions: ProfilePicturePosition[] = [
  {
    id: 'front-close-up',
    name: 'Front Close-up',
    angle: 'front view',
    pose: 'facing camera directly',
    expression: 'warm genuine smile',
    lighting: 'soft natural window light',
    framing: 'close-up',
    aspectRatio: '1:1',
  },
  {
    id: 'front-medium',
    name: 'Front Medium Shot',
    angle: 'front view',
    pose: 'standing confidently',
    expression: 'confident self-assured expression',
    lighting: 'professional softbox lighting',
    framing: 'medium',
    aspectRatio: '4:5',
  },
  {
    id: 'three-quarter-left',
    name: '3/4 Left',
    angle: 'three-quarter view from left',
    pose: 'slightly turned to the left',
    expression: 'natural relaxed expression',
    lighting: 'warm golden hour sunlight',
    framing: 'close-up',
    aspectRatio: '1:1',
  },
  {
    id: 'three-quarter-right',
    name: '3/4 Right',
    angle: 'three-quarter view from right',
    pose: 'slightly turned to the right',
    expression: 'subtle enigmatic smile',
    lighting: 'soft diffused natural daylight',
    framing: 'close-up',
    aspectRatio: '1:1',
  },
  {
    id: 'side-left',
    name: 'Side Profile Left',
    angle: 'side profile view from left',
    pose: 'looking to the left',
    expression: 'serene peaceful expression',
    lighting: 'dramatic single-source lighting with shadows',
    framing: 'close-up',
    aspectRatio: '1:1',
  },
  {
    id: 'side-right',
    name: 'Side Profile Right',
    angle: 'side profile view from right',
    pose: 'looking to the right',
    expression: 'thoughtful contemplative look',
    lighting: 'moody low-key lighting',
    framing: 'close-up',
    aspectRatio: '1:1',
  },
  {
    id: 'back-view',
    name: 'Back View',
    angle: 'back view',
    pose: 'standing with back to camera, looking over shoulder',
    expression: 'mysterious alluring expression',
    lighting: 'soft overcast sky lighting',
    framing: 'medium',
    aspectRatio: '4:5',
  },
  {
    id: 'sitting-front',
    name: 'Sitting Front',
    angle: 'front view',
    pose: 'sitting comfortably, relaxed position',
    expression: 'happy relaxed expression',
    lighting: 'natural light from large window',
    framing: 'medium',
    aspectRatio: '4:5',
  },
  {
    id: 'three-quarter-sitting',
    name: '3/4 Sitting',
    angle: 'three-quarter view',
    pose: 'sitting cross-legged elegantly',
    expression: 'natural relaxed expression',
    lighting: 'warm candlelight ambiance',
    framing: 'medium',
    aspectRatio: '4:5',
  },
  {
    id: 'dynamic-action',
    name: 'Dynamic Action',
    angle: 'front view',
    pose: 'dynamic movement, natural walking mid-stride',
    expression: 'excited enthusiastic expression',
    lighting: 'vibrant sunset colors',
    framing: 'full-body',
    aspectRatio: '9:16',
  },
];

/**
 * Starter Set 1: Classic Influencer
 * Versatile, Instagram-ready, lifestyle-focused
 */
export const classicInfluencerSet: ProfilePictureSet = {
  id: 'classic-influencer',
  name: 'Classic Influencer',
  description: 'Versatile Instagram-ready profile pictures, perfect for lifestyle content',
  characterDNA: characterDNATemplates.classicInfluencer,
  style: 'Instagram influencer aesthetic',
  positions: [
    standardProfilePositions[0], // front-close-up
    standardProfilePositions[1], // front-medium
    standardProfilePositions[2], // three-quarter-left
    standardProfilePositions[3], // three-quarter-right
    standardProfilePositions[4], // side-left
    standardProfilePositions[6], // back-view
    standardProfilePositions[7], // sitting-front
    standardProfilePositions[9], // dynamic-action
  ],
  basePromptTemplate:
    '{{character}}, {{angle}}, {{pose}}, {{expression}}, {{lighting}}, Instagram aesthetic, high quality, detailed, professional photography, {{framing}}',
  negativePrompt:
    'blurry, deformed, ugly, bad anatomy, bad hands, missing fingers, extra fingers, watermark, signature, low quality, pixelated',
  tags: ['influencer', 'instagram', 'lifestyle', 'versatile', 'starter'],
};

/**
 * Starter Set 2: Professional Model
 * High-fashion, editorial style, sophisticated
 */
export const professionalModelSet: ProfilePictureSet = {
  id: 'professional-model',
  name: 'Professional Model',
  description: 'High-fashion editorial style profile pictures, sophisticated and elegant',
  characterDNA: characterDNATemplates.highFashionModel,
  style: 'high fashion editorial',
  positions: [
    standardProfilePositions[0], // front-close-up
    standardProfilePositions[2], // three-quarter-left
    standardProfilePositions[3], // three-quarter-right
    standardProfilePositions[4], // side-left
    standardProfilePositions[5], // side-right
    standardProfilePositions[6], // back-view
    standardProfilePositions[1], // front-medium
    standardProfilePositions[7], // sitting-front
    standardProfilePositions[8], // three-quarter-sitting
  ],
  basePromptTemplate:
    '{{character}}, {{angle}}, {{pose}}, {{expression}}, {{lighting}}, editorial fashion photography, high-end magazine quality, sophisticated, elegant, {{framing}}, professional studio lighting',
  negativePrompt:
    'casual, amateur, blurry, deformed, bad anatomy, bad hands, missing fingers, extra fingers, watermark, low quality, unprofessional',
  tags: ['fashion', 'editorial', 'professional', 'sophisticated', 'starter'],
};

/**
 * Starter Set 3: Natural Beauty
 * Authentic, natural, K-beauty inspired
 */
export const naturalBeautySet: ProfilePictureSet = {
  id: 'natural-beauty',
  name: 'Natural Beauty',
  description: 'Authentic natural beauty profile pictures, K-beauty inspired, fresh and clean',
  characterDNA: characterDNATemplates.asianBeauty,
  style: 'K-beauty aesthetic',
  positions: [
    standardProfilePositions[0], // front-close-up
    standardProfilePositions[1], // front-medium
    standardProfilePositions[2], // three-quarter-left
    standardProfilePositions[3], // three-quarter-right
    standardProfilePositions[4], // side-left
    standardProfilePositions[7], // sitting-front
    standardProfilePositions[8], // three-quarter-sitting
  ],
  basePromptTemplate:
    '{{character}}, {{angle}}, {{pose}}, {{expression}}, {{lighting}}, natural beauty, fresh clean look, minimal makeup, porcelain smooth skin, K-beauty aesthetic, {{framing}}, soft natural lighting',
  negativePrompt:
    'heavy makeup, airbrushed, plastic skin, blurry, deformed, bad anatomy, bad hands, missing fingers, extra fingers, watermark, low quality',
  tags: ['beauty', 'natural', 'k-beauty', 'fresh', 'clean', 'starter'],
};

/**
 * All available profile picture sets
 */
export const profilePictureSets: ProfilePictureSet[] = [
  classicInfluencerSet,
  professionalModelSet,
  naturalBeautySet,
];

/**
 * Get a profile picture set by ID
 */
export function getProfilePictureSet(id: string): ProfilePictureSet | undefined {
  return profilePictureSets.find((set) => set.id === id);
}

/**
 * Build a complete prompt for a specific position in a set
 */
export function buildProfilePicturePrompt(
  set: ProfilePictureSet,
  position: ProfilePicturePosition
): { prompt: string; negativePrompt: string } {
  // Build character description from DNA
  const characterParts: string[] = [];
  if (set.characterDNA.ethnicity) {
    characterParts.push(`${set.characterDNA.age} ${set.characterDNA.ethnicity} woman`);
  } else {
    characterParts.push(`${set.characterDNA.age} woman`);
  }
  characterParts.push(set.characterDNA.hair);
  characterParts.push(set.characterDNA.eyes);
  characterParts.push(set.characterDNA.skin);
  if (set.characterDNA.facialFeatures) {
    characterParts.push(set.characterDNA.facialFeatures);
  }
  if (set.characterDNA.bodyType) {
    characterParts.push(set.characterDNA.bodyType);
  }
  const characterDescription = characterParts.join(', ');

  // Replace template placeholders
  let prompt = set.basePromptTemplate
    .replace('{{character}}', characterDescription)
    .replace('{{angle}}', position.angle)
    .replace('{{pose}}', position.pose)
    .replace('{{expression}}', position.expression)
    .replace('{{lighting}}', position.lighting)
    .replace('{{framing}}', position.framing);

  // Add style modifiers
  prompt += ', ultra-detailed, high resolution, 8k quality, professional photography, masterpiece, best quality';

  return {
    prompt,
    negativePrompt: set.negativePrompt,
  };
}

/**
 * Get all positions for a set
 */
export function getSetPositions(setId: string): ProfilePicturePosition[] {
  const set = getProfilePictureSet(setId);
  return set?.positions || [];
}

/**
 * List all available sets
 */
export function listProfilePictureSets(): ProfilePictureSet[] {
  return profilePictureSets;
}

