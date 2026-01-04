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
 * Uses actual studio components (poses, scenes, outfits, lighting) for consistency
 */
export interface ProfilePicturePosition {
  /** Position identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Angle description for prompt */
  angle: string;
  /** Pose description (for prompt building) */
  pose: string;
  /** Expression for this position */
  expression: string;
  /** Camera distance/framing */
  framing: 'close-up' | 'medium' | 'full-body';
  /** Recommended aspect ratio */
  aspectRatio: '1:1' | '4:5' | '9:16';
  /** Actual pose ID from studio (e.g., 'standing-casual', 'sitting-relaxed') */
  poseId?: string;
  /** Scene ID from studio (e.g., 'cozy-cafe', 'beach-sunset') */
  scene?: string;
  /** Environment ID from studio (e.g., 'indoor', 'outdoor') */
  environment?: string;
  /** Outfit selection (string or OutfitComposition) */
  outfit?: string;
  /** Lighting ID from studio (e.g., 'natural-daylight', 'golden-hour') */
  lighting?: string;
  /** Activity or personality element (e.g., 'with golden retriever', 'drinking coffee', 'working out') */
  activity?: string;
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
 * Classic Influencer positions with lifestyle scenes and activities
 * Diverse angles, full-body shots, and authentic lifestyle moments
 */
const classicInfluencerPositions: ProfilePicturePosition[] = [
  {
    id: 'beach-full-body',
    name: 'Beach Sunset Walk',
    angle: 'front view, low angle',
    pose: 'walking on beach barefoot, arms relaxed, hair blowing in wind, full body visible',
    expression: 'happy carefree smile',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'standing-walking',
    scene: 'beach-sunset',
    environment: 'outdoor',
    outfit: 'casual',
    lighting: 'golden-hour',
    activity: 'walking along shoreline, ocean waves crashing, golden sunset light',
  },
  {
    id: 'cafe-cross-legged',
    name: 'Café Moment',
    angle: 'three-quarter view',
    pose: 'sitting cross-legged in cozy chair, holding coffee cup with both hands, leaning slightly forward',
    expression: 'warm genuine smile, eyes to camera',
    framing: 'medium',
    aspectRatio: '4:5',
    poseId: 'sitting-cross',
    scene: 'cozy-cafe',
    environment: 'indoor',
    outfit: 'casual',
    lighting: 'natural-daylight',
    activity: 'cozy café vibes, warm drinks, relaxed atmosphere',
  },
  {
    id: 'gym-stretching',
    name: 'Gym Stretch',
    angle: 'side profile',
    pose: 'standing stretching pose, one arm reaching up, athletic and graceful, full body visible',
    expression: 'focused determined expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'action-stretching',
    scene: 'gym',
    environment: 'indoor',
    outfit: 'sportswear',
    lighting: 'studio-softbox',
    activity: 'pre-workout stretch, athletic wear, gym equipment visible',
  },
  {
    id: 'rooftop-back-view',
    name: 'City Sunset',
    angle: 'back view, looking over shoulder',
    pose: 'standing with back to camera, head turned looking over shoulder, city skyline visible',
    expression: 'peaceful mysterious smile',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'standing-casual',
    scene: 'city-rooftop',
    environment: 'outdoor',
    outfit: 'casual',
    lighting: 'sunset-glow',
    activity: 'golden hour on rooftop, urban skyline panorama',
  },
  {
    id: 'park-dancing',
    name: 'Park Dance',
    angle: 'front view',
    pose: 'mid-dance twirl, arms gracefully extended, hair in motion, joyful movement',
    expression: 'laughing joyful expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'action-dancing',
    scene: 'urban-park',
    environment: 'outdoor',
    outfit: 'casual',
    lighting: 'natural-daylight',
    activity: 'spontaneous dancing in park, carefree moment',
  },
  {
    id: 'street-leaning',
    name: 'Street Style',
    angle: 'three-quarter view',
    pose: 'casually leaning against wall, one foot up, hands in jacket pockets, relaxed cool pose',
    expression: 'confident subtle smile',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'standing-leaning',
    scene: 'paris-street',
    environment: 'urban',
    outfit: 'casual',
    lighting: 'natural-daylight',
    activity: 'urban street style, architecture backdrop, effortlessly cool',
  },
  {
    id: 'home-lounging',
    name: 'Cozy Home',
    angle: 'front view, slightly above',
    pose: 'lounging on couch, legs tucked under, holding phone or book, comfortable relaxed pose',
    expression: 'soft natural smile',
    framing: 'medium',
    aspectRatio: '4:5',
    poseId: 'sitting-lounging',
    scene: 'luxury-bedroom',
    environment: 'indoor',
    outfit: 'casual',
    lighting: 'soft-diffused',
    activity: 'cozy home vibes, relaxing at home, comfortable setting',
  },
  {
    id: 'pool-sitting-edge',
    name: 'Pool Day',
    angle: 'front view',
    pose: 'sitting on pool edge, legs in water, leaning back on hands, sun-kissed relaxed pose',
    expression: 'happy relaxed smile',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'sitting-edge',
    scene: 'pool-party',
    environment: 'outdoor',
    outfit: 'swimwear',
    lighting: 'natural-daylight',
    activity: 'summer pool day, water splashing, vacation vibes',
  },
];

/**
 * Professional Model positions with fashion/editorial scenes
 * High-fashion, full-body editorial shots with dramatic angles
 */
const professionalModelPositions: ProfilePicturePosition[] = [
  {
    id: 'runway-walk',
    name: 'Runway Walk',
    angle: 'front view, low angle',
    pose: 'confident runway walk, one foot forward, arms at sides, elongated posture, full body visible',
    expression: 'fierce confident expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'standing-walking',
    scene: 'dark-studio',
    environment: 'studio',
    outfit: 'elegant',
    lighting: 'studio-softbox',
    activity: 'fashion runway walk, dramatic studio lighting, model strut',
  },
  {
    id: 'studio-pose',
    name: 'Studio Editorial',
    angle: 'three-quarter view',
    pose: 'standing with weight on one hip, hand on waist, other arm relaxed, elegant S-curve pose',
    expression: 'sophisticated alluring expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'standing-confident',
    scene: 'white-studio',
    environment: 'studio',
    outfit: 'elegant',
    lighting: 'studio-softbox',
    activity: 'editorial fashion photography, clean minimalist backdrop',
  },
  {
    id: 'gallery-side',
    name: 'Gallery Profile',
    angle: 'side profile',
    pose: 'standing in profile, gazing at artwork, one arm gracefully raised, elegant silhouette',
    expression: 'thoughtful contemplative look',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'standing-elegant',
    scene: 'art-gallery',
    environment: 'indoor',
    outfit: 'elegant',
    lighting: 'dramatic-shadows',
    activity: 'art gallery setting, contemporary art, sophisticated ambiance',
  },
  {
    id: 'rooftop-dramatic',
    name: 'Urban Editorial',
    angle: 'back view, head turned',
    pose: 'standing on rooftop, back to camera, head turned over shoulder, wind in hair, dramatic pose',
    expression: 'mysterious alluring expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'standing-casual',
    scene: 'city-rooftop',
    environment: 'outdoor',
    outfit: 'elegant',
    lighting: 'dramatic-shadows',
    activity: 'high-fashion editorial, city skyline, dramatic urban backdrop',
  },
  {
    id: 'sitting-elegant',
    name: 'Magazine Cover',
    angle: 'front view, slightly low',
    pose: 'sitting elegantly on chair, legs crossed, leaning slightly forward, hands on knee',
    expression: 'confident sophisticated expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'sitting-perched',
    scene: 'white-studio',
    environment: 'studio',
    outfit: 'elegant',
    lighting: 'studio-softbox',
    activity: 'magazine cover shoot, editorial styling, professional fashion',
  },
  {
    id: 'street-strut',
    name: 'Fashion Week',
    angle: 'front view',
    pose: 'walking confidently on city street, coat flowing, mid-stride, arms swinging naturally',
    expression: 'editorial fierce expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'standing-walking',
    scene: 'paris-street',
    environment: 'urban',
    outfit: 'elegant',
    lighting: 'natural-daylight',
    activity: 'fashion week street style, paparazzi moment, designer outfit',
  },
  {
    id: 'boutique-leaning',
    name: 'Boutique Chic',
    angle: 'three-quarter view',
    pose: 'leaning against boutique mirror, one leg crossed over other, holding designer bag, relaxed elegant',
    expression: 'sophisticated subtle smile',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'standing-leaning',
    scene: 'boutique-shop',
    environment: 'indoor',
    outfit: 'elegant',
    lighting: 'soft-diffused',
    activity: 'luxury shopping, designer boutique, high-end fashion',
  },
  {
    id: 'studio-dynamic',
    name: 'Dynamic Editorial',
    angle: 'front view, action',
    pose: 'mid-movement pose, fabric flowing, hair in motion, dynamic editorial pose, arms extended',
    expression: 'intense powerful expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'action-dancing',
    scene: 'dark-studio',
    environment: 'studio',
    outfit: 'elegant',
    lighting: 'dramatic-shadows',
    activity: 'dynamic fashion editorial, movement shot, flowing garments',
  },
  {
    id: 'close-up-beauty',
    name: 'Beauty Editorial',
    angle: 'front view, close',
    pose: 'head slightly tilted, hand near face, editorial beauty pose',
    expression: 'sultry captivating expression',
    framing: 'close-up',
    aspectRatio: '1:1',
    poseId: 'standing-confident',
    scene: 'dark-studio',
    environment: 'studio',
    outfit: 'elegant',
    lighting: 'dramatic-shadows',
    activity: 'high-fashion beauty shot, flawless makeup, editorial styling',
  },
];

/**
 * Natural Beauty positions with natural/outdoor scenes
 * Yoga, stretching, lying poses, and authentic outdoor moments
 */
const naturalBeautyPositions: ProfilePicturePosition[] = [
  {
    id: 'yoga-pose',
    name: 'Morning Yoga',
    angle: 'side profile',
    pose: 'standing yoga tree pose, one leg raised, arms above head, balanced graceful pose, full body visible',
    expression: 'peaceful centered expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'action-yoga',
    scene: 'japanese-garden',
    environment: 'outdoor',
    outfit: 'sportswear',
    lighting: 'natural-daylight',
    activity: 'morning yoga in garden, zen atmosphere, mindful practice',
  },
  {
    id: 'forest-stretching',
    name: 'Forest Stretch',
    angle: 'front view',
    pose: 'standing with arms stretched wide, head tilted back, embracing nature, full body visible',
    expression: 'joyful liberated expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'action-stretching',
    scene: 'forest-path',
    environment: 'outdoor',
    outfit: 'casual',
    lighting: 'natural-daylight',
    activity: 'connecting with nature, forest bathing, morning stretch',
  },
  {
    id: 'lake-lying',
    name: 'Lakeside Rest',
    angle: 'overhead view',
    pose: 'lying on blanket by lake, propped on elbows, legs extended, relaxed natural pose',
    expression: 'serene peaceful smile',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'sitting-lounging',
    scene: 'lake-side',
    environment: 'outdoor',
    outfit: 'casual',
    lighting: 'golden-hour',
    activity: 'picnic by the lake, peaceful afternoon, nature immersion',
  },
  {
    id: 'mountain-arms-up',
    name: 'Mountain Peak',
    angle: 'back view',
    pose: 'standing on mountain, arms raised in victory pose, looking at vista, triumphant pose',
    expression: 'joyful accomplished expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'standing-casual',
    scene: 'mountain-view',
    environment: 'outdoor',
    outfit: 'casual',
    lighting: 'natural-daylight',
    activity: 'reached summit, mountain hiking achievement, breathtaking view',
  },
  {
    id: 'beach-walking-water',
    name: 'Beach Wade',
    angle: 'three-quarter view',
    pose: 'walking in shallow water, holding dress hem up, splashing, full body visible',
    expression: 'playful happy expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'standing-walking',
    scene: 'beach-day',
    environment: 'outdoor',
    outfit: 'casual',
    lighting: 'golden-hour',
    activity: 'wading in ocean, waves around ankles, carefree beach day',
  },
  {
    id: 'garden-sitting-floor',
    name: 'Garden Moment',
    angle: 'front view',
    pose: 'sitting cross-legged on grass, surrounded by flowers, hands resting on knees',
    expression: 'natural genuine smile',
    framing: 'medium',
    aspectRatio: '4:5',
    poseId: 'sitting-cross',
    scene: 'japanese-garden',
    environment: 'outdoor',
    outfit: 'casual',
    lighting: 'natural-daylight',
    activity: 'meditation in garden, cherry blossoms, peaceful moment',
  },
  {
    id: 'reading-lying',
    name: 'Cozy Reading',
    angle: 'three-quarter view',
    pose: 'lying on stomach on blanket, propped up on elbows, reading book, legs bent up behind',
    expression: 'relaxed content expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'sitting-lounging',
    scene: 'urban-park',
    environment: 'outdoor',
    outfit: 'casual',
    lighting: 'natural-daylight',
    activity: 'reading in park, cozy blanket, peaceful afternoon',
  },
  {
    id: 'sunrise-stretch',
    name: 'Sunrise Yoga',
    angle: 'side profile',
    pose: 'standing forward bend, touching toes, flexible yoga stretch, full body silhouette',
    expression: 'peaceful focused expression',
    framing: 'full-body',
    aspectRatio: '9:16',
    poseId: 'action-stretching',
    scene: 'beach-sunset',
    environment: 'outdoor',
    outfit: 'sportswear',
    lighting: 'golden-hour',
    activity: 'sunrise yoga on beach, morning ritual, silhouette against sun',
  },
];

/**
 * Starter Set 1: Classic Influencer
 * Versatile, Instagram-ready, lifestyle-focused with activities and personality
 */
export const classicInfluencerSet: ProfilePictureSet = {
  id: 'classic-influencer',
  name: 'Classic Influencer',
  description: 'Lifestyle profile pictures with activities - café, beach, park with dog, gym, and more',
  characterDNA: characterDNATemplates.classicInfluencer,
  style: 'Instagram influencer aesthetic',
  positions: classicInfluencerPositions,
  basePromptTemplate:
    '{{character}}, {{angle}}, {{pose}}, {{expression}}, {{lighting}}, {{activity}}, Instagram aesthetic, high quality, detailed, professional photography, {{framing}}',
  negativePrompt:
    'blurry, deformed, ugly, bad anatomy, bad hands, missing fingers, extra fingers, watermark, signature, low quality, pixelated',
  tags: ['influencer', 'instagram', 'lifestyle', 'activities', 'personality', 'starter'],
};

/**
 * Starter Set 2: Professional Model
 * High-fashion, editorial style, sophisticated with fashion scenes
 */
export const professionalModelSet: ProfilePictureSet = {
  id: 'professional-model',
  name: 'Professional Model',
  description: 'High-fashion editorial profile pictures - studio, gallery, boutique, runway, and more',
  characterDNA: characterDNATemplates.highFashionModel,
  style: 'high fashion editorial',
  positions: professionalModelPositions,
  basePromptTemplate:
    '{{character}}, {{angle}}, {{pose}}, {{expression}}, {{lighting}}, {{activity}}, editorial fashion photography, high-end magazine quality, sophisticated, elegant, {{framing}}, professional studio lighting',
  negativePrompt:
    'casual, amateur, blurry, deformed, bad anatomy, bad hands, missing fingers, extra fingers, watermark, low quality, unprofessional',
  tags: ['fashion', 'editorial', 'professional', 'sophisticated', 'fashion-scenes', 'starter'],
};

/**
 * Starter Set 3: Natural Beauty
 * Authentic, natural, K-beauty inspired with outdoor/nature scenes
 */
export const naturalBeautySet: ProfilePictureSet = {
  id: 'natural-beauty',
  name: 'Natural Beauty',
  description: 'Natural beauty profile pictures - garden, lake, forest, mountain, and nature scenes',
  characterDNA: characterDNATemplates.asianBeauty,
  style: 'K-beauty aesthetic',
  positions: naturalBeautyPositions,
  basePromptTemplate:
    '{{character}}, {{angle}}, {{pose}}, {{expression}}, {{lighting}}, {{activity}}, natural beauty, fresh clean look, minimal makeup, porcelain smooth skin, K-beauty aesthetic, {{framing}}, soft natural lighting',
  negativePrompt:
    'heavy makeup, airbrushed, plastic skin, blurry, deformed, bad anatomy, bad hands, missing fingers, extra fingers, watermark, low quality',
  tags: ['beauty', 'natural', 'k-beauty', 'fresh', 'clean', 'nature-scenes', 'starter'],
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
    .replace('{{framing}}', position.framing)
    .replace('{{activity}}', position.activity || '');

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

