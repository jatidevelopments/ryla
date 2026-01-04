/**
 * Prompt Categories and Common Elements
 *
 * Pre-built options for scenes, outfits, poses, and lighting.
 * Use these with the prompt builder for quick customization.
 */

/**
 * Common scene/location options
 */
export const sceneOptions = {
  indoor: {
    bedroom: 'modern bedroom with soft lighting',
    livingRoom: 'cozy living room with natural light',
    kitchen: 'bright modern kitchen',
    bathroom: 'clean minimalist bathroom',
    office: 'stylish home office',
    studio: 'professional photography studio with white backdrop',
    gym: 'modern fitness gym with equipment',
    cafe: 'trendy coffee shop with warm ambiance',
    restaurant: 'upscale restaurant with mood lighting',
  },
  outdoor: {
    beach: 'tropical sandy beach with turquoise water',
    city: 'busy urban city street',
    park: 'lush green park with trees',
    garden: 'beautiful flower garden',
    rooftop: 'city rooftop with skyline view',
    pool: 'luxury pool area with lounge chairs',
    forest: 'serene forest with natural light filtering through trees',
    desert: 'dramatic desert landscape at sunset',
    mountains: 'scenic mountain backdrop',
  },
} as const;

/**
 * Common outfit options
 */
export const outfitOptions = {
  casual: {
    jeans: 'casual jeans and t-shirt',
    sundress: 'flowy summer sundress',
    sweater: 'cozy oversized sweater',
    loungewear: 'comfortable loungewear set',
    streetwear: 'trendy streetwear outfit',
  },
  formal: {
    cocktailDress: 'elegant cocktail dress',
    eveningGown: 'stunning evening gown',
    businessSuit: 'professional business suit',
    blazer: 'chic blazer and trousers',
  },
  athletic: {
    yogaOutfit: 'yoga pants and sports bra',
    gymWear: 'athletic leggings and tank top',
    runningGear: 'running shorts and fitted top',
    swimwear: 'stylish one-piece swimsuit',
  },
  fashion: {
    designer: 'high-end designer outfit',
    bohemian: 'bohemian flowy dress with accessories',
    minimalist: 'minimalist monochrome outfit',
    vintage: 'retro vintage inspired outfit',
  },
} as const;

/**
 * Common lighting options
 */
export const lightingOptions = {
  natural: {
    goldenHour: 'warm golden hour sunlight',
    blueHour: 'soft blue hour twilight',
    softDaylight: 'soft diffused natural daylight',
    windowLight: 'natural light from large window',
    overcast: 'soft overcast sky lighting',
  },
  studio: {
    softbox: 'professional softbox lighting',
    ringLight: 'ring light illumination',
    dramatic: 'dramatic single-source lighting with shadows',
    highKey: 'bright high-key studio lighting',
    lowKey: 'moody low-key lighting',
  },
  creative: {
    neon: 'colorful neon lighting',
    candle: 'warm candlelight ambiance',
    fairy: 'magical fairy lights',
    sunset: 'vibrant sunset colors',
    moonlight: 'soft moonlight glow',
  },
} as const;

/**
 * Common expression options
 */
export const expressionOptions = {
  positive: {
    smile: 'warm genuine smile',
    laugh: 'natural joyful laugh',
    happy: 'happy relaxed expression',
    excited: 'excited enthusiastic expression',
    confident: 'confident self-assured expression',
  },
  neutral: {
    serene: 'serene peaceful expression',
    thoughtful: 'thoughtful contemplative look',
    natural: 'natural relaxed expression',
    subtle: 'subtle enigmatic smile',
  },
  dramatic: {
    intense: 'intense focused gaze',
    mysterious: 'mysterious alluring expression',
    fierce: 'fierce powerful expression',
    sultry: 'sultry captivating look',
  },
} as const;

/**
 * Common pose options - comprehensive library for profile pictures
 */
export const poseOptions = {
  standing: {
    casual: 'relaxed casual standing pose',
    confident: 'confident power stance',
    walking: 'natural walking mid-stride, full body visible',
    leaning: 'casually leaning against wall',
    armsCrossed: 'standing with arms crossed, confident',
    handsPocket: 'standing with hands in pockets, relaxed cool',
    waving: 'standing and waving, friendly greeting',
    pointing: 'standing and pointing, engaging gesture',
    thinking: 'standing in thoughtful pose, hand on chin',
    elegant: 'standing elegantly, model pose, graceful posture',
    backView: 'standing with back to camera, looking over shoulder',
    sideProfile: 'standing in side profile, elegant silhouette',
  },
  sitting: {
    relaxed: 'relaxed sitting position',
    crossLegged: 'sitting cross-legged on floor, casual',
    perched: 'perched on edge elegantly, legs crossed',
    lounging: 'lounging comfortably on couch or bed',
    edge: 'sitting on edge of surface, legs dangling',
    backward: 'sitting backward on chair, arms resting on back',
    reading: 'sitting and reading, relaxed focus',
    working: 'sitting at desk working, productive pose',
    elegant: 'sitting elegantly, legs to side, sophisticated',
    floor: 'sitting on floor, casual relaxed pose',
  },
  lying: {
    relaxed: 'lying down relaxed, peaceful pose',
    propped: 'lying propped up on elbow, casual',
    stomach: 'lying on stomach, looking up at camera',
    elegant: 'lying elegantly, artistic pose',
    stretching: 'lying and stretching, elongated pose',
  },
  action: {
    dancing: 'dynamic dancing movement, expressive',
    stretching: 'graceful stretching pose, flexible',
    exercising: 'active workout pose, athletic',
    playing: 'playful action pose, joyful',
    yoga: 'yoga pose, balanced and centered',
    running: 'running or jogging, dynamic motion',
    jumping: 'mid-jump, energetic and playful',
    sports: 'athletic sports pose, dynamic',
  },
  expressive: {
    laughing: 'laughing genuinely, candid joy',
    surprised: 'surprised expression, playful reaction',
    thinking: 'deep in thought, contemplative',
  },
} as const;

/**
 * Style modifiers that can be appended to any prompt
 */
export const styleModifiers = {
  quality: [
    'ultra-detailed',
    'high resolution',
    '8k quality',
    'professional photography',
    'masterpiece',
    'best quality',
  ],
  photography: [
    'DSLR photo',
    'bokeh background',
    'shallow depth of field',
    'cinematic composition',
    'rule of thirds',
    'perfect framing',
  ],
  realism: [
    'photorealistic',
    'hyperrealistic',
    'lifelike',
    'natural textures',
    'realistic skin details',
    'anatomically correct',
  ],
  aesthetic: [
    'Instagram aesthetic',
    'editorial style',
    'fashion magazine quality',
    'Pinterest aesthetic',
    'influencer style',
  ],
  /**
   * Ultra-realistic modifiers for authentic smartphone-quality images
   * Source: AI Influencer Course research - "amateur photo camera style" prevents adding phones in image
   */
  ultraRealistic: [
    'amateur photo camera style',
    'candid moment captured',
    'authentic natural lighting',
    'raw unedited aesthetic',
  ],
  /**
   * Skin texture modifiers for natural-looking skin
   * Prevents the "plastic/waxy" AI look
   */
  naturalSkin: [
    'natural skin texture with visible pores',
    'subtle skin imperfections',
    'realistic skin lighting',
    'authentic complexion',
  ],
  /**
   * Smartphone/selfie aesthetic for casual content
   */
  smartphone: [
    'smartphone selfie aesthetic',
    'casual phone photo quality',
    'authentic moment',
    'natural imperfections',
  ],
  /**
   * Editorial/magazine quality for professional content
   */
  editorial: [
    'editorial fashion photography',
    'magazine cover quality',
    'professional retouching',
    'high-end production value',
  ],
} as const;

/**
 * Common negative prompt elements
 */
export const negativePromptElements = {
  anatomy: [
    'deformed',
    'bad anatomy',
    'disfigured',
    'mutated',
    'extra limbs',
    'missing limbs',
    'bad hands',
    'bad fingers',
    'extra fingers',
    'missing fingers',
    'fused fingers',
  ],
  quality: [
    'blurry',
    'low quality',
    'pixelated',
    'jpeg artifacts',
    'watermark',
    'signature',
    'text',
    'logo',
    'worst quality',
  ],
  face: [
    'ugly',
    'bad face',
    'asymmetric eyes',
    'cross-eyed',
    'bad teeth',
    'weird expression',
  ],
  skin: [
    'plastic skin',
    'waxy skin',
    'unnatural skin',
    'airbrushed',
    'mannequin',
  ],
  /**
   * AI artifacts - prevents common AI-generated image problems
   * Source: "Why AI Images Look Fake/Plastic" research
   */
  aiArtifacts: [
    'airbrushed perfection',
    'plastic texture',
    'waxy appearance',
    'perfect symmetry',
    'uncanny valley',
    'oversaturated colors',
    'artificial lighting',
    'stock photo look',
    'unnaturally smooth skin',
    'porcelain doll',
  ],
  /**
   * Flux model specific negatives
   */
  flux: [
    'cartoon',
    'illustration',
    'CGI',
    'render',
    '3D',
    'anime',
    'painted',
    'digital art',
    'drawing',
    'sketch',
  ],
  /**
   * Face-specific issues for better facial quality
   */
  faceAdvanced: [
    'misaligned pupils',
    'unnatural smile',
    'wrong proportions',
    'smooth mannequin face',
    'dead eyes',
    'uncanny expression',
    'distorted features',
  ],
  /**
   * Body proportions
   */
  bodyProportions: [
    'wrong proportions',
    'elongated limbs',
    'tiny head',
    'giant hands',
    'misshapen body',
    'floating limbs',
  ],
} as const;

/**
 * Build a comprehensive negative prompt
 */
export function buildNegativePrompt(
  categories: (keyof typeof negativePromptElements)[] = ['anatomy', 'quality', 'face']
): string {
  const elements: string[] = [];
  for (const category of categories) {
    elements.push(...negativePromptElements[category]);
  }
  return elements.join(', ');
}

/**
 * Model types for optimized negative prompts
 */
export type ModelType = 'flux-dev' | 'z-image-turbo' | 'sdxl' | 'default';

/**
 * Build an enhanced negative prompt optimized for realism
 * Includes AI artifact prevention and model-specific terms
 */
export function buildEnhancedNegativePrompt(
  options: {
    model?: ModelType;
    includeAiArtifacts?: boolean;
    includeSkin?: boolean;
    includeBody?: boolean;
  } = {}
): string {
  const {
    model = 'default',
    includeAiArtifacts = true,
    includeSkin = true,
    includeBody = true,
  } = options;

  const categories: (keyof typeof negativePromptElements)[] = [
    'anatomy',
    'quality',
    'face',
    'faceAdvanced',
  ];

  if (includeSkin) {
    categories.push('skin');
  }

  if (includeAiArtifacts) {
    categories.push('aiArtifacts');
  }

  if (includeBody) {
    categories.push('bodyProportions');
  }

  // Add model-specific negatives
  if (model === 'flux-dev' || model === 'z-image-turbo') {
    categories.push('flux');
  }

  return buildNegativePrompt(categories);
}

/**
 * Style preset types for quick application
 */
export type StylePresetType =
  | 'quality'
  | 'ultraRealistic'
  | 'instagramReady'
  | 'editorialFashion'
  | 'casualSelfie'
  | 'professionalPortrait';

/**
 * Pre-configured style presets combining multiple modifiers
 * Use with PromptBuilder.withStylePreset()
 */
export const stylePresets: Record<StylePresetType, {
  modifiers: string[];
  description: string;
  negativeCategories: (keyof typeof negativePromptElements)[];
}> = {
  quality: {
    modifiers: [...styleModifiers.quality],
    description: 'Standard quality enhancement',
    negativeCategories: ['anatomy', 'quality', 'face'],
  },
  ultraRealistic: {
    modifiers: [
      ...styleModifiers.ultraRealistic,
      ...styleModifiers.naturalSkin,
      'authentic moment',
      'natural imperfections',
      'candid photo',
    ],
    description: 'Maximum realism, smartphone aesthetic, natural look',
    negativeCategories: ['anatomy', 'quality', 'face', 'faceAdvanced', 'skin', 'aiArtifacts', 'flux'],
  },
  instagramReady: {
    modifiers: [
      'Instagram aesthetic',
      'lifestyle photography',
      'natural lighting',
      'authentic moment',
      'social media quality',
      'trendy composition',
    ],
    description: 'Polished but authentic Instagram look',
    negativeCategories: ['anatomy', 'quality', 'face', 'skin', 'aiArtifacts'],
  },
  editorialFashion: {
    modifiers: [
      ...styleModifiers.editorial,
      'dramatic lighting',
      'high fashion',
      'Vogue quality',
      'artistic composition',
    ],
    description: 'Magazine-quality editorial fashion',
    negativeCategories: ['anatomy', 'quality', 'face', 'faceAdvanced'],
  },
  casualSelfie: {
    modifiers: [
      ...styleModifiers.smartphone,
      'selfie aesthetic',
      'casual moment',
      'relaxed expression',
      'natural setting',
    ],
    description: 'Everyday casual selfie vibe',
    negativeCategories: ['anatomy', 'quality', 'face', 'skin', 'aiArtifacts', 'flux'],
  },
  professionalPortrait: {
    modifiers: [
      'professional headshot',
      'studio lighting',
      'confident pose',
      'corporate style',
      'clean background',
      'polished appearance',
    ],
    description: 'Professional headshot quality',
    negativeCategories: ['anatomy', 'quality', 'face', 'faceAdvanced', 'skin'],
  },
};

