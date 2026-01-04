/**
 * Context Enhancer
 * 
 * Automatically adds scene-appropriate details to prompts.
 * Makes generated images feel more authentic and contextually appropriate.
 * 
 * Usage:
 *   import { getSceneContext, applyContextEnhancements } from '@ryla/business/prompts';
 *   
 *   const context = getSceneContext('indoor.cafe');
 *   // Returns additions and things to avoid for café scenes
 */

/**
 * Scene context configuration
 */
export interface SceneContext {
  /** Scene identifier (matches sceneOptions keys) */
  sceneId: string;
  /** Human-readable name */
  name: string;
  /** Automatic additions to the prompt */
  additions: string[];
  /** Terms to avoid or add to negative prompt */
  avoid: string[];
  /** Suggested lighting for this scene */
  suggestedLighting?: string;
  /** Suggested time of day */
  suggestedTime?: 'morning' | 'afternoon' | 'evening' | 'night' | 'golden_hour';
  /** Activity suggestions for authenticity */
  activitySuggestions?: string[];
}

/**
 * Scene contexts for indoor locations
 */
export const indoorSceneContexts: Record<string, SceneContext> = {
  bedroom: {
    sceneId: 'indoor.bedroom',
    name: 'Bedroom',
    additions: [
      'soft ambient lighting',
      'cozy intimate atmosphere',
      'comfortable relaxed setting',
    ],
    avoid: ['harsh lighting', 'clinical look', 'empty sterile room'],
    suggestedLighting: 'soft diffused window light',
    suggestedTime: 'morning',
    activitySuggestions: ['morning routine', 'relaxing', 'reading'],
  },
  livingRoom: {
    sceneId: 'indoor.livingRoom',
    name: 'Living Room',
    additions: [
      'warm home atmosphere',
      'comfortable domestic setting',
      'natural daylight from windows',
    ],
    avoid: ['empty room', 'harsh shadows', 'cold atmosphere'],
    suggestedLighting: 'natural window light',
    suggestedTime: 'afternoon',
    activitySuggestions: ['lounging', 'relaxing with coffee', 'casual moment'],
  },
  kitchen: {
    sceneId: 'indoor.kitchen',
    name: 'Kitchen',
    additions: [
      'bright modern interior',
      'clean countertops visible',
      'warm domestic atmosphere',
    ],
    avoid: ['messy kitchen', 'dark shadows', 'cluttered space'],
    suggestedLighting: 'bright overhead and window light',
    suggestedTime: 'morning',
    activitySuggestions: ['cooking', 'having breakfast', 'drinking coffee'],
  },
  bathroom: {
    sceneId: 'indoor.bathroom',
    name: 'Bathroom',
    additions: [
      'clean minimalist interior',
      'soft diffused lighting',
      'fresh clean atmosphere',
    ],
    avoid: ['dirty bathroom', 'harsh fluorescent lighting', 'cluttered'],
    suggestedLighting: 'soft diffused lighting',
    suggestedTime: 'morning',
    activitySuggestions: ['skincare routine', 'getting ready', 'mirror selfie'],
  },
  office: {
    sceneId: 'indoor.office',
    name: 'Home Office',
    additions: [
      'professional workspace',
      'modern desk setup',
      'productive atmosphere',
    ],
    avoid: ['messy desk', 'dark cramped space', 'unprofessional background'],
    suggestedLighting: 'natural daylight with desk lamp',
    suggestedTime: 'afternoon',
    activitySuggestions: ['working', 'video call', 'focused concentration'],
  },
  studio: {
    sceneId: 'indoor.studio',
    name: 'Photography Studio',
    additions: [
      'professional photography setup',
      'clean backdrop',
      'controlled studio lighting',
    ],
    avoid: ['amateur setup', 'distracting background', 'harsh shadows'],
    suggestedLighting: 'professional softbox lighting',
    activitySuggestions: ['posing', 'modeling', 'professional shoot'],
  },
  gym: {
    sceneId: 'indoor.gym',
    name: 'Gym',
    additions: [
      'modern fitness equipment visible',
      'energetic workout atmosphere',
      'motivational environment',
    ],
    avoid: ['empty gym', 'dirty equipment', 'crowded distracting background'],
    suggestedLighting: 'bright overhead lighting',
    activitySuggestions: ['working out', 'stretching', 'post-workout'],
  },
  cafe: {
    sceneId: 'indoor.cafe',
    name: 'Coffee Shop',
    additions: [
      'cozy café ambiance',
      'warm interior lighting',
      'trendy coffee shop aesthetic',
      'ambient coffee shop atmosphere',
    ],
    avoid: ['empty café', 'harsh lighting', 'sterile environment'],
    suggestedLighting: 'warm ambient with natural window light',
    suggestedTime: 'morning',
    activitySuggestions: ['drinking coffee', 'reading', 'casual conversation'],
  },
  restaurant: {
    sceneId: 'indoor.restaurant',
    name: 'Restaurant',
    additions: [
      'elegant dining atmosphere',
      'sophisticated ambiance',
      'mood lighting',
    ],
    avoid: ['empty restaurant', 'fast food setting', 'harsh fluorescent'],
    suggestedLighting: 'moody atmospheric lighting',
    suggestedTime: 'evening',
    activitySuggestions: ['dining', 'date night', 'elegant moment'],
  },
};

/**
 * Scene contexts for outdoor locations
 */
export const outdoorSceneContexts: Record<string, SceneContext> = {
  beach: {
    sceneId: 'outdoor.beach',
    name: 'Beach',
    additions: [
      'ocean waves in background',
      'sandy beach texture',
      'natural sea breeze effect on hair',
      'tropical paradise atmosphere',
    ],
    avoid: ['crowded beach', 'harsh midday shadows', 'overcast gloomy'],
    suggestedLighting: 'golden hour sunlight',
    suggestedTime: 'golden_hour',
    activitySuggestions: ['walking on beach', 'relaxing by ocean', 'beach day'],
  },
  city: {
    sceneId: 'outdoor.city',
    name: 'City Street',
    additions: [
      'urban street atmosphere',
      'city architecture in background',
      'street style aesthetic',
      'metropolitan energy',
    ],
    avoid: ['empty street', 'dangerous looking area', 'construction'],
    suggestedLighting: 'natural daylight',
    suggestedTime: 'afternoon',
    activitySuggestions: ['walking', 'street photography', 'urban exploration'],
  },
  park: {
    sceneId: 'outdoor.park',
    name: 'Park',
    additions: [
      'lush green nature',
      'trees and foliage visible',
      'peaceful outdoor atmosphere',
      'natural sunlight filtering through trees',
    ],
    avoid: ['dead grass', 'crowded picnic area', 'construction'],
    suggestedLighting: 'dappled sunlight through leaves',
    suggestedTime: 'afternoon',
    activitySuggestions: ['walking', 'picnic', 'relaxing outdoors', 'with dog'],
  },
  garden: {
    sceneId: 'outdoor.garden',
    name: 'Garden',
    additions: [
      'beautiful flowers blooming',
      'colorful garden backdrop',
      'fresh natural atmosphere',
      'botanical beauty',
    ],
    avoid: ['dead plants', 'overgrown weeds', 'unkempt garden'],
    suggestedLighting: 'soft natural daylight',
    suggestedTime: 'morning',
    activitySuggestions: ['among flowers', 'garden stroll', 'spring vibes'],
  },
  rooftop: {
    sceneId: 'outdoor.rooftop',
    name: 'Rooftop',
    additions: [
      'city skyline visible',
      'urban rooftop atmosphere',
      'panoramic view',
      'sophisticated urban setting',
    ],
    avoid: ['industrial roof', 'dangerous edge', 'construction'],
    suggestedLighting: 'golden hour or blue hour',
    suggestedTime: 'golden_hour',
    activitySuggestions: ['enjoying view', 'rooftop party', 'sunset watching'],
  },
  pool: {
    sceneId: 'outdoor.pool',
    name: 'Pool',
    additions: [
      'crystal clear pool water',
      'luxury pool setting',
      'summer vacation vibes',
      'sun-drenched atmosphere',
    ],
    avoid: ['dirty pool', 'crowded', 'indoor pool'],
    suggestedLighting: 'bright sunny day',
    suggestedTime: 'afternoon',
    activitySuggestions: ['poolside lounging', 'summer relaxation', 'vacation'],
  },
  forest: {
    sceneId: 'outdoor.forest',
    name: 'Forest',
    additions: [
      'natural forest environment',
      'trees and foliage',
      'serene woodland atmosphere',
      'dappled sunlight through canopy',
    ],
    avoid: ['dead forest', 'scary dark woods', 'dense fog'],
    suggestedLighting: 'filtered forest light',
    suggestedTime: 'morning',
    activitySuggestions: ['hiking', 'nature walk', 'forest exploration'],
  },
  desert: {
    sceneId: 'outdoor.desert',
    name: 'Desert',
    additions: [
      'dramatic desert landscape',
      'warm sandy tones',
      'vast open space',
      'striking natural beauty',
    ],
    avoid: ['harsh midday sun', 'barren empty', 'sandstorm'],
    suggestedLighting: 'golden hour sunset colors',
    suggestedTime: 'golden_hour',
    activitySuggestions: ['desert adventure', 'sunset photography', 'boho vibes'],
  },
  mountains: {
    sceneId: 'outdoor.mountains',
    name: 'Mountains',
    additions: [
      'scenic mountain backdrop',
      'majestic peaks visible',
      'fresh mountain air atmosphere',
      'adventure travel vibes',
    ],
    avoid: ['foggy no visibility', 'dangerous cliff', 'avalanche'],
    suggestedLighting: 'clear day with soft sunlight',
    suggestedTime: 'morning',
    activitySuggestions: ['hiking', 'mountain view', 'adventure travel'],
  },
};

/**
 * All scene contexts combined
 */
export const allSceneContexts: Record<string, SceneContext> = {
  ...Object.fromEntries(
    Object.entries(indoorSceneContexts).map(([key, value]) => [`indoor.${key}`, value])
  ),
  ...Object.fromEntries(
    Object.entries(outdoorSceneContexts).map(([key, value]) => [`outdoor.${key}`, value])
  ),
};

/**
 * Get scene context by scene path (e.g., 'indoor.cafe')
 */
export function getSceneContext(scenePath: string): SceneContext | undefined {
  // Try direct match
  if (allSceneContexts[scenePath]) {
    return allSceneContexts[scenePath];
  }
  
  // Try partial match (just the scene name)
  const sceneName = scenePath.split('.').pop();
  if (sceneName) {
    const indoor = indoorSceneContexts[sceneName];
    if (indoor) return indoor;
    
    const outdoor = outdoorSceneContexts[sceneName];
    if (outdoor) return outdoor;
  }
  
  return undefined;
}

/**
 * Apply context enhancements to a prompt
 * Returns additional prompt segments and negative prompt additions
 */
export function applyContextEnhancements(
  scenePath: string,
  options: {
    includeAtmosphere?: boolean;
    includeLighting?: boolean;
    includeActivity?: boolean;
    maxAdditions?: number;
  } = {}
): {
  promptAdditions: string[];
  negativeAdditions: string[];
  suggestedLighting?: string;
} {
  const {
    includeAtmosphere = true,
    includeLighting = true,
    includeActivity = false,
    maxAdditions = 3,
  } = options;

  const context = getSceneContext(scenePath);
  
  if (!context) {
    return {
      promptAdditions: [],
      negativeAdditions: [],
    };
  }

  const promptAdditions: string[] = [];
  const negativeAdditions: string[] = [...context.avoid];

  // Add atmosphere enhancements (limited to maxAdditions)
  if (includeAtmosphere) {
    promptAdditions.push(...context.additions.slice(0, maxAdditions));
  }

  // Add activity suggestion if enabled
  if (includeActivity && context.activitySuggestions?.length) {
    const randomActivity = context.activitySuggestions[
      Math.floor(Math.random() * context.activitySuggestions.length)
    ];
    promptAdditions.push(randomActivity);
  }

  return {
    promptAdditions,
    negativeAdditions,
    suggestedLighting: includeLighting ? context.suggestedLighting : undefined,
  };
}

/**
 * Get all available scene contexts for UI display
 */
export function listSceneContexts(): Array<{
  id: string;
  name: string;
  category: 'indoor' | 'outdoor';
  suggestedTime?: string;
}> {
  const results: Array<{
    id: string;
    name: string;
    category: 'indoor' | 'outdoor';
    suggestedTime?: string;
  }> = [];

  for (const [key, context] of Object.entries(indoorSceneContexts)) {
    results.push({
      id: `indoor.${key}`,
      name: context.name,
      category: 'indoor',
      suggestedTime: context.suggestedTime,
    });
  }

  for (const [key, context] of Object.entries(outdoorSceneContexts)) {
    results.push({
      id: `outdoor.${key}`,
      name: context.name,
      category: 'outdoor',
      suggestedTime: context.suggestedTime,
    });
  }

  return results;
}

