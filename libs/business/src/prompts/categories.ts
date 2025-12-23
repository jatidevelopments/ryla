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
 * Common pose options
 */
export const poseOptions = {
  standing: {
    casual: 'relaxed casual standing pose',
    confident: 'confident power stance',
    walking: 'natural walking mid-stride',
    leaning: 'casually leaning against wall',
  },
  sitting: {
    relaxed: 'relaxed sitting position',
    crossLegged: 'sitting cross-legged',
    perched: 'perched on edge elegantly',
    lounging: 'lounging comfortably',
  },
  action: {
    dancing: 'dynamic dancing movement',
    stretching: 'graceful stretching pose',
    exercising: 'active workout pose',
    playing: 'playful action pose',
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

