/**
 * Model Registry - Single Source of Truth
 * 
 * This file defines all supported image generation models, their pricing,
 * and how they map between frontend UI and backend API.
 * 
 * @module @ryla/shared/models
 */

/**
 * Fal-ai model ID type (matches backend FalFluxModelId)
 */
export type FalModelId = string; // Will be properly typed when we move pricing to shared

/**
 * Model provider type
 */
export type ModelProvider = 'comfyui' | 'fal';

/**
 * Self-hosted model IDs (ComfyUI)
 */
export type SelfHostedModelId =
  | 'z-image-turbo'
  | 'z-image-danrisi'
  | 'z-image-pulid'
  | 'flux-dev';

/**
 * Model capability - what the model can do
 */
export type ModelCapability =
  | 'text-to-image' // Generate image from text prompt
  | 'image-to-image' // Transform existing image
  | 'editing' // Edit/inpaint parts of image
  | 'upscaling' // Increase image resolution
  | 'image-to-video' // Generate video from image
  | 'text-to-video' // Generate video from text
  | 'video-to-video' // Transform video
  | 'face-swap' // Swap faces in images
  | 'background-removal' // Remove backgrounds
  | 'style-transfer'; // Transfer artistic style

/**
 * Input type - what the model requires as input
 */
export type InputType =
  | 'text' // Text prompt only
  | 'text+image' // Text prompt + reference image
  | 'text+image+mask' // Text prompt + image + mask for editing
  | 'image' // Image only (for upscaling, style transfer)
  | 'image+mask' // Image + mask (for inpainting)
  | 'video' // Video input
  | 'text+video'; // Text + video (for video editing)

/**
 * Output type - what the model produces
 */
export type OutputType =
  | 'image' // Single or multiple images
  | 'video' // Video output
  | 'image+layers'; // Image with RGBA layers

/**
 * Frontend UI model ID (what users see in the Studio)
 */
export type UIModelId =
  | 'ryla-soul'
  | 'ryla-face-swap'
  | 'ryla-character'
  | 'comfyui-default'
  | 'flux-schnell'
  | 'flux-dev'
  | 'flux-2'
  | 'flux-2-pro'
  | 'flux-2-max'
  | 'flux-2-flex'
  | 'flux-2-turbo'
  | 'flux-2-flash'
  | 'z-image-turbo'
  | 'seedream-45'
  | 'seedream-40'
  | 'gpt-image'
  | 'imagen4'
  | 'imagen4-fast'
  | 'nano-banana-pro'
  | 'gemini-3-pro'
  | 'ideogram-v2'
  | 'stable-diffusion-35'
  | 'recraft-v3'
  | 'bria-32'
  | 'qwen-image-2512'
  | 'hidream-i1-fast'
  | 'hidream-i1-dev'
  | 'hidream-i1-full'
  | 'ovis-image'
  | 'longcat-image'
  | 'kling-image'
  | 'vidu-q2'
  | 'reve'
  // Editing Models
  | 'flux-2-edit'
  | 'flux-2-pro-edit'
  | 'flux-2-max-edit'
  | 'flux-2-flex-edit'
  | 'flux-2-turbo-edit'
  | 'flux-2-flash-edit'
  | 'qwen-edit-2509'
  | 'qwen-edit-2511'
  | 'longcat-edit'
  | 'gpt-image-edit'
  | 'nano-banana-edit'
  | 'gemini-3-pro-edit'
  // Upscaling Models
  | 'clarity-upscaler'
  | 'aura-sr'
  | 'crystal-upscaler'
  | 'seedvr2'
  | 'topaz-upscale'
  // Image-to-Video Models
  | 'wan-i2v'
  | 'kling-i2v'
  | 'veo2-i2v'
  | 'wan-pro-i2v'
  // Image-to-Image Models
  | 'flux-dev-i2i'
  | 'z-image-i2i';

/**
 * Model definition with pricing and metadata
 */
export interface ModelDefinition {
  /** Frontend UI ID (what users see) */
  uiId: UIModelId;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Icon identifier for UI */
  icon: 'soul' | 'face-swap' | 'character' | 'google' | 'bytedance' | 'openai' | 'flux' | 'reve' | 'zimage';
  /** Provider (comfyui or fal) */
  provider: ModelProvider;
  /** Backend model ID (for fal-ai models, this is the FalModelId) */
  backendId?: FalModelId | SelfHostedModelId;
  /** Model capabilities - what this model can do */
  capabilities: ModelCapability[];
  /** Required input type */
  inputType: InputType;
  /** Output type */
  outputType: OutputType;
  /** Whether this model has unlimited credits (for display) */
  isUnlimited?: boolean;
  /** Whether this is a new model */
  isNew?: boolean;
  /** Whether this is a pro/premium model */
  isPro?: boolean;
  /** Whether this model supports NSFW content (only ComfyUI models) */
  supportsNSFW?: boolean;
  /** Whether this model should be shown in MVP Studio (1-2 per capability) */
  isMVP?: boolean;
  /** Estimated credits for 1024x1024 image (for display) */
  estimatedCredits1MP?: number;
  /** Pricing info (for fal models) */
  pricingInfo?: {
    costPerMegapixel?: number;
    costPerImage?: number;
    costPerProcessedMegapixel?: number;
  };
}

/**
 * Model Registry - Single Source of Truth
 * 
 * Maps UI model IDs to backend model IDs and includes pricing information.
 */
export const MODEL_REGISTRY: Record<UIModelId, ModelDefinition> = {
  // RYLA Custom Models (ComfyUI)
  'ryla-soul': {
    uiId: 'ryla-soul',
    name: 'RYLA Soul',
    description: 'Ultra-Realistic Fashion Visuals',
    icon: 'soul',
    provider: 'comfyui',
    backendId: 'z-image-danrisi',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    isUnlimited: true,
    supportsNSFW: true, // ComfyUI models support NSFW
    isMVP: true, // MVP model for creating/upscaling
    estimatedCredits1MP: 20, // studio_fast
  },
  'ryla-face-swap': {
    uiId: 'ryla-face-swap',
    name: 'RYLA Face Swap',
    description: 'Seamless Face Swapping',
    icon: 'face-swap',
    provider: 'comfyui',
    backendId: 'z-image-danrisi',
    capabilities: ['face-swap', 'image-to-image'],
    inputType: 'text+image',
    outputType: 'image',
    isUnlimited: true,
    estimatedCredits1MP: 20,
  },
  'ryla-character': {
    uiId: 'ryla-character',
    name: 'RYLA Character',
    description: 'Seamless Character Swapping',
    icon: 'character',
    provider: 'comfyui',
    backendId: 'z-image-pulid',
    capabilities: ['text-to-image', 'image-to-image'],
    inputType: 'text+image',
    outputType: 'image',
    isUnlimited: true,
    supportsNSFW: true, // ComfyUI models support NSFW
    isMVP: true, // MVP model for editing/variations
    estimatedCredits1MP: 50, // studio_standard
  },
  'comfyui-default': {
    uiId: 'comfyui-default',
    name: 'On-server (ComfyUI)',
    description: 'Self-hosted generation',
    icon: 'zimage',
    provider: 'comfyui',
    backendId: 'z-image-danrisi',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    isUnlimited: true,
    estimatedCredits1MP: 20,
  },

  // FLUX Models (Fal.ai)
  'flux-schnell': {
    uiId: 'flux-schnell',
    name: 'FLUX Schnell',
    description: 'Fast text-to-image generation',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux/schnell',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    supportsNSFW: false, // Fal.ai models don't support NSFW
    isMVP: true, // MVP model for creating (SFW only)
    estimatedCredits1MP: 0.3,
    pricingInfo: {
      costPerMegapixel: 0.003,
    },
  },
  'flux-dev': {
    uiId: 'flux-dev',
    name: 'FLUX.2 Pro',
    description: 'Speed-Optimized Detail',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux/dev',
    capabilities: ['text-to-image', 'image-to-image'],
    inputType: 'text',
    outputType: 'image',
    isUnlimited: true,
    supportsNSFW: false, // Fal.ai models don't support NSFW
    isMVP: true, // MVP model for editing/variations (SFW only)
    estimatedCredits1MP: 2.5,
    pricingInfo: {
      costPerMegapixel: 0.025,
    },
  },
  'flux-2': {
    uiId: 'flux-2',
    name: 'FLUX.2',
    description: 'Enhanced realism and text rendering',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 1.2,
    pricingInfo: {
      costPerMegapixel: 0.012,
    },
  },
  'flux-2-pro': {
    uiId: 'flux-2-pro',
    name: 'FLUX.2 Pro',
    description: 'Premium quality image generation',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2-pro',
    capabilities: ['text-to-image', 'editing'],
    inputType: 'text+image',
    outputType: 'image',
    isPro: true,
    estimatedCredits1MP: 3,
    pricingInfo: {
      costPerProcessedMegapixel: 0.03,
    },
  },
  'flux-2-max': {
    uiId: 'flux-2-max',
    name: 'FLUX.2 Max',
    description: 'Ultimate Precision And Speed',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2-max',
    capabilities: ['text-to-image', 'editing'],
    inputType: 'text',
    outputType: 'image',
    isPro: true,
    estimatedCredits1MP: 7,
    pricingInfo: {
      costPerMegapixel: 0.07,
    },
  },
  'flux-2-flex': {
    uiId: 'flux-2-flex',
    name: 'FLUX.2 Flex',
    description: 'Next-Gen Image Generation',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2-flex',
    capabilities: ['text-to-image', 'editing'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 6,
    pricingInfo: {
      costPerProcessedMegapixel: 0.06,
    },
  },
  'flux-2-turbo': {
    uiId: 'flux-2-turbo',
    name: 'FLUX.2 Turbo',
    description: 'Fast FLUX 2 generation',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2/turbo',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 0.8,
    pricingInfo: {
      costPerMegapixel: 0.008,
    },
  },
  'flux-2-flash': {
    uiId: 'flux-2-flash',
    name: 'FLUX.2 Flash',
    description: 'Ultra-fast generation',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2/flash',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 0.5,
    pricingInfo: {
      costPerMegapixel: 0.005,
    },
  },

  // Z-Image Models
  'z-image-turbo': {
    uiId: 'z-image-turbo',
    name: 'Z-Image',
    description: 'Instant Lifelike Portraits',
    icon: 'zimage',
    provider: 'fal',
    backendId: 'fal-ai/z-image/turbo',
    capabilities: ['text-to-image', 'image-to-image'],
    inputType: 'text',
    outputType: 'image',
    isUnlimited: true,
    estimatedCredits1MP: 0.5,
    pricingInfo: {
      costPerMegapixel: 0.005,
    },
  },

  // ByteDance Models
  'seedream-45': {
    uiId: 'seedream-45',
    name: 'Seedream 4.5',
    description: "ByteDance's Next-Gen 4K Model",
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/bytedance/seedream/v4.5/text-to-image',
    capabilities: ['text-to-image', 'editing'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 4,
    pricingInfo: {
      costPerImage: 0.04,
    },
  },
  'seedream-40': {
    uiId: 'seedream-40',
    name: 'Seedream 4.0',
    description: "ByteDance's Advanced Editing",
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/bytedance/seedream/v4.5/edit',
    capabilities: ['editing', 'image-to-image'],
    inputType: 'text+image',
    outputType: 'image',
    isUnlimited: true,
    estimatedCredits1MP: 4,
    pricingInfo: {
      costPerImage: 0.04,
    },
  },

  // Google Models
  'gpt-image': {
    uiId: 'gpt-image',
    name: 'GPT Image',
    description: 'Versatile Text-To-Image AI',
    icon: 'openai',
    provider: 'fal',
    backendId: 'fal-ai/gpt-image-1.5',
    capabilities: ['text-to-image', 'editing'],
    inputType: 'text',
    outputType: 'image',
    isUnlimited: true,
    estimatedCredits1MP: 0.1,
    pricingInfo: {
      costPerImage: 0.001,
    },
  },
  'imagen4': {
    uiId: 'imagen4',
    name: 'Imagen 4',
    description: "Google's highest quality model",
    icon: 'google',
    provider: 'fal',
    backendId: 'fal-ai/imagen4/preview',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 4,
    pricingInfo: {
      costPerImage: 0.04,
    },
  },
  'imagen4-fast': {
    uiId: 'imagen4-fast',
    name: 'Imagen 4 Fast',
    description: 'Fast Imagen 4 generation',
    icon: 'google',
    provider: 'fal',
    backendId: 'fal-ai/imagen4/preview/fast',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 2,
    pricingInfo: {
      costPerImage: 0.02,
    },
  },
  'nano-banana-pro': {
    uiId: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    description: "Google's state-of-the-art model",
    icon: 'google',
    provider: 'fal',
    backendId: 'fal-ai/nano-banana-pro',
    capabilities: ['text-to-image', 'editing'],
    inputType: 'text',
    outputType: 'image',
    isPro: true,
    estimatedCredits1MP: 4,
    pricingInfo: {
      costPerImage: 0.04,
    },
  },
  'gemini-3-pro': {
    uiId: 'gemini-3-pro',
    name: 'Gemini 3 Pro Image',
    description: 'Google Gemini image generation',
    icon: 'google',
    provider: 'fal',
    backendId: 'fal-ai/gemini-3-pro-image-preview',
    capabilities: ['text-to-image', 'editing'],
    inputType: 'text',
    outputType: 'image',
    isPro: true,
    estimatedCredits1MP: 4,
    pricingInfo: {
      costPerImage: 0.04,
    },
  },

  // Other Models
  'ideogram-v2': {
    uiId: 'ideogram-v2',
    name: 'Ideogram V2',
    description: 'Exceptional typography handling',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/ideogram/v2',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 8,
    pricingInfo: {
      costPerImage: 0.08,
    },
  },
  'stable-diffusion-35': {
    uiId: 'stable-diffusion-35',
    name: 'Stable Diffusion 3.5 Large',
    description: 'MMDiT text-to-image model',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/stable-diffusion-v35-large',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 6.5,
    pricingInfo: {
      costPerMegapixel: 0.065,
    },
  },
  'recraft-v3': {
    uiId: 'recraft-v3',
    name: 'Recraft V3',
    description: 'Long texts, vector art, brand style',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/recraft/v3/text-to-image',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 4,
    pricingInfo: {
      costPerImage: 0.04,
    },
  },
  'bria-32': {
    uiId: 'bria-32',
    name: 'Bria 3.2',
    description: 'Licensed data, safe commercial use',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'bria/text-to-image/3.2',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 4,
    pricingInfo: {
      costPerImage: 0.04,
    },
  },
  'qwen-image-2512': {
    uiId: 'qwen-image-2512',
    name: 'Qwen Image 2512',
    description: 'Improved text rendering and realism',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/qwen-image-2512',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 2,
    pricingInfo: {
      costPerMegapixel: 0.02,
    },
  },
  'hidream-i1-fast': {
    uiId: 'hidream-i1-fast',
    name: 'HiDream I1 Fast',
    description: 'Fast 17B parameter model',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/hidream-i1-fast',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 1,
    pricingInfo: {
      costPerMegapixel: 0.01,
    },
  },
  'hidream-i1-dev': {
    uiId: 'hidream-i1-dev',
    name: 'HiDream I1 Dev',
    description: '17B parameter model',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/hidream-i1-dev',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 3,
    pricingInfo: {
      costPerMegapixel: 0.03,
    },
  },
  'hidream-i1-full': {
    uiId: 'hidream-i1-full',
    name: 'HiDream I1 Full',
    description: 'Full quality 17B model',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/hidream-i1-full',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 5,
    pricingInfo: {
      costPerMegapixel: 0.05,
    },
  },
  'ovis-image': {
    uiId: 'ovis-image',
    name: 'Ovis Image',
    description: '7B model optimized for text rendering',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/ovis-image',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 2,
    pricingInfo: {
      costPerImage: 0.02,
    },
  },
  'longcat-image': {
    uiId: 'longcat-image',
    name: 'Longcat Image',
    description: '6B multilingual text rendering',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/longcat-image',
    capabilities: ['text-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 2,
    pricingInfo: {
      costPerImage: 0.02,
    },
  },
  'kling-image': {
    uiId: 'kling-image',
    name: 'Kling O1 Image',
    description: 'Precise edits with reference control',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/kling-image/o1',
    capabilities: ['editing', 'image-to-image'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 3,
    pricingInfo: {
      costPerImage: 0.03,
    },
  },
  'vidu-q2': {
    uiId: 'vidu-q2',
    name: 'Vidu Q2',
    description: 'Text-to-image generation',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/vidu/q2/text-to-image',
    capabilities: ['text-to-image', 'image-to-image'],
    inputType: 'text',
    outputType: 'image',
    estimatedCredits1MP: 3,
    pricingInfo: {
      costPerImage: 0.03,
    },
  },
  'reve': {
    uiId: 'reve',
    name: 'Reve',
    description: 'Advanced Image Editing Model',
    icon: 'reve',
    provider: 'fal',
    backendId: 'fal-ai/reve',
    capabilities: ['editing', 'image-to-image'],
    inputType: 'text+image',
    outputType: 'image',
    isUnlimited: true,
    estimatedCredits1MP: 3,
    pricingInfo: {
      costPerImage: 0.03,
    },
  },

  // Editing Models
  'flux-2-edit': {
    uiId: 'flux-2-edit',
    name: 'FLUX.2 Edit',
    description: 'Image editing with natural language',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2/edit',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 1.2,
    pricingInfo: {
      costPerProcessedMegapixel: 0.012,
    },
  },
  'flux-2-pro-edit': {
    uiId: 'flux-2-pro-edit',
    name: 'FLUX.2 Pro Edit',
    description: 'High-quality image editing',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2-pro/edit',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    isPro: true,
    estimatedCredits1MP: 3,
    pricingInfo: {
      costPerProcessedMegapixel: 0.03,
    },
  },
  'flux-2-max-edit': {
    uiId: 'flux-2-max-edit',
    name: 'FLUX.2 Max Edit',
    description: 'Advanced image editing',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2-max/edit',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    isPro: true,
    estimatedCredits1MP: 7,
    pricingInfo: {
      costPerMegapixel: 0.07,
    },
  },
  'flux-2-flex-edit': {
    uiId: 'flux-2-flex-edit',
    name: 'FLUX.2 Flex Edit',
    description: 'Multi-reference editing',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2-flex/edit',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 6,
    pricingInfo: {
      costPerProcessedMegapixel: 0.06,
    },
  },
  'flux-2-turbo-edit': {
    uiId: 'flux-2-turbo-edit',
    name: 'FLUX.2 Turbo Edit',
    description: 'Fast image editing',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2/turbo/edit',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 0.8,
    pricingInfo: {
      costPerMegapixel: 0.008,
    },
  },
  'flux-2-flash-edit': {
    uiId: 'flux-2-flash-edit',
    name: 'FLUX.2 Flash Edit',
    description: 'Ultra-fast editing',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux-2/flash/edit',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 0.5,
    pricingInfo: {
      costPerMegapixel: 0.005,
    },
  },
  'qwen-edit-2509': {
    uiId: 'qwen-edit-2509',
    name: 'Qwen Image Edit 2509',
    description: 'Superior text editing capabilities',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/qwen-image-edit-2509',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 2,
    pricingInfo: {
      costPerImage: 0.02,
    },
  },
  'qwen-edit-2511': {
    uiId: 'qwen-edit-2511',
    name: 'Qwen Image Edit 2511',
    description: 'Qwen image editing model',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/qwen-image-edit-2511',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 2,
    pricingInfo: {
      costPerImage: 0.02,
    },
  },
  'longcat-edit': {
    uiId: 'longcat-edit',
    name: 'Longcat Image Edit',
    description: 'Image editing with Longcat',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/longcat-image/edit',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 2,
    pricingInfo: {
      costPerImage: 0.02,
    },
  },
  'gpt-image-edit': {
    uiId: 'gpt-image-edit',
    name: 'GPT Image 1.5 Edit',
    description: 'Image editing with GPT Image',
    icon: 'openai',
    provider: 'fal',
    backendId: 'fal-ai/gpt-image-1.5/edit',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 0.1,
    pricingInfo: {
      costPerImage: 0.001,
    },
  },
  'nano-banana-edit': {
    uiId: 'nano-banana-edit',
    name: 'Nano Banana Pro Edit',
    description: 'Advanced editing with Nano Banana',
    icon: 'google',
    provider: 'fal',
    backendId: 'fal-ai/nano-banana-pro/edit',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    isPro: true,
    estimatedCredits1MP: 4,
    pricingInfo: {
      costPerImage: 0.04,
    },
  },
  'gemini-3-pro-edit': {
    uiId: 'gemini-3-pro-edit',
    name: 'Gemini 3 Pro Image Edit',
    description: 'Image editing with Gemini',
    icon: 'google',
    provider: 'fal',
    backendId: 'fal-ai/gemini-3-pro-image-preview/edit',
    capabilities: ['editing'],
    inputType: 'text+image',
    outputType: 'image',
    isPro: true,
    estimatedCredits1MP: 4,
    pricingInfo: {
      costPerImage: 0.04,
    },
  },

  // Upscaling Models
  'clarity-upscaler': {
    uiId: 'clarity-upscaler',
    name: 'Clarity Upscaler',
    description: 'High fidelity upscaling',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/clarity-upscaler',
    capabilities: ['upscaling'],
    inputType: 'image',
    outputType: 'image',
    estimatedCredits1MP: 2, // Estimated
    isMVP: true, // MVP model for upscaling
    pricingInfo: {
      costPerImage: 0.02, // Estimated
    },
  },
  'aura-sr': {
    uiId: 'aura-sr',
    name: 'AuraSR',
    description: 'Upscale your images with AuraSR',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/aura-sr',
    capabilities: ['upscaling'],
    inputType: 'image',
    outputType: 'image',
    estimatedCredits1MP: 1, // Estimated
    isMVP: true, // MVP model for upscaling (fast/cheap option)
    pricingInfo: {
      costPerImage: 0.01, // Estimated
    },
  },
  'crystal-upscaler': {
    uiId: 'crystal-upscaler',
    name: 'Crystal Upscaler',
    description: 'Advanced facial detail upscaling',
    icon: 'flux',
    provider: 'fal',
    backendId: 'clarityai/crystal-upscaler',
    capabilities: ['upscaling'],
    inputType: 'image',
    outputType: 'image',
    estimatedCredits1MP: 2, // Estimated
    pricingInfo: {
      costPerImage: 0.02, // Estimated
    },
  },
  'seedvr2': {
    uiId: 'seedvr2',
    name: 'SeedVR2',
    description: 'Use SeedVR2 to upscale your images',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/seedvr/upscale/image',
    capabilities: ['upscaling'],
    inputType: 'image',
    outputType: 'image',
    estimatedCredits1MP: 3, // Estimated
    pricingInfo: {
      costPerImage: 0.03, // Estimated
    },
  },
  'topaz-upscale': {
    uiId: 'topaz-upscale',
    name: 'Topaz',
    description: 'Powerful and accurate image enhancer',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/topaz/upscale/image',
    capabilities: ['upscaling'],
    inputType: 'image',
    outputType: 'image',
    estimatedCredits1MP: 2, // Estimated
    pricingInfo: {
      costPerImage: 0.02, // Estimated
    },
  },

  // Image-to-Video Models
  'wan-i2v': {
    uiId: 'wan-i2v',
    name: 'Wan 2.1 Image-to-Video',
    description: 'Generate videos from images',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/wan-i2v',
    capabilities: ['image-to-video'],
    inputType: 'text+image',
    outputType: 'video',
    estimatedCredits1MP: 5, // Estimated per second
    pricingInfo: {
      costPerImage: 0.05, // Estimated
    },
  },
  'kling-i2v': {
    uiId: 'kling-i2v',
    name: 'Kling 1.6 Image-to-Video',
    description: 'Generate video clips from images',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/kling-video/v1.6/pro/image-to-video',
    capabilities: ['image-to-video'],
    inputType: 'text+image',
    outputType: 'video',
    isPro: true,
    estimatedCredits1MP: 8, // Estimated per second
    pricingInfo: {
      costPerImage: 0.08, // Estimated
    },
  },
  'veo2-i2v': {
    uiId: 'veo2-i2v',
    name: 'Veo 2 Image-to-Video',
    description: 'Creates videos from images with realistic motion',
    icon: 'google',
    provider: 'fal',
    backendId: 'fal-ai/veo2/image-to-video',
    capabilities: ['image-to-video'],
    inputType: 'text+image',
    outputType: 'video',
    estimatedCredits1MP: 10, // Estimated per second
    pricingInfo: {
      costPerImage: 0.10, // Estimated
    },
  },
  'wan-pro-i2v': {
    uiId: 'wan-pro-i2v',
    name: 'Wan-2.1 Pro Image-to-Video',
    description: 'Premium 1080p video generation from images',
    icon: 'bytedance',
    provider: 'fal',
    backendId: 'fal-ai/wan-pro/image-to-video',
    capabilities: ['image-to-video'],
    inputType: 'text+image',
    outputType: 'video',
    isPro: true,
    estimatedCredits1MP: 12, // Estimated per second
    pricingInfo: {
      costPerImage: 0.12, // Estimated
    },
  },

  // Image-to-Image Models
  'flux-dev-i2i': {
    uiId: 'flux-dev-i2i',
    name: 'FLUX Dev Image-to-Image',
    description: 'Transform existing images',
    icon: 'flux',
    provider: 'fal',
    backendId: 'fal-ai/flux/dev/image-to-image',
    capabilities: ['image-to-image'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 2.5,
    pricingInfo: {
      costPerMegapixel: 0.025,
    },
  },
  'z-image-i2i': {
    uiId: 'z-image-i2i',
    name: 'Z-Image Turbo Image-to-Image',
    description: 'Image-to-image transformation',
    icon: 'zimage',
    provider: 'fal',
    backendId: 'fal-ai/z-image/turbo/image-to-image',
    capabilities: ['image-to-image'],
    inputType: 'text+image',
    outputType: 'image',
    estimatedCredits1MP: 0.5,
    pricingInfo: {
      costPerMegapixel: 0.005,
    },
  },
} as const;

/**
 * Get model definition by UI ID
 */
export function getModelDefinition(uiId: UIModelId): ModelDefinition | undefined {
  return MODEL_REGISTRY[uiId];
}

/**
 * Get all available models
 */
export function getAllModels(): ModelDefinition[] {
  return Object.values(MODEL_REGISTRY);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: ModelProvider): ModelDefinition[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.provider === provider);
}

/**
 * Calculate credits for a model based on image dimensions
 * 
 * Note: For Fal models, this uses estimated pricing. Actual pricing
 * is calculated in the backend using FAL_MODEL_PRICING.
 */
export function calculateModelCredits(
  uiId: UIModelId,
  width: number,
  height: number
): number {
  const model = MODEL_REGISTRY[uiId];
  if (!model) {
    throw new Error(`Unknown model: ${uiId}`);
  }

  // ComfyUI models use fixed feature pricing
  if (model.provider === 'comfyui') {
    // Use studio_fast or studio_standard based on model
    const featureId = model.estimatedCredits1MP && model.estimatedCredits1MP >= 50
      ? 'studio_standard'
      : 'studio_fast';
    const { getFeatureCost } = require('../credits/pricing');
    return getFeatureCost(featureId, 1);
  }

  // Fal models: use estimated credits scaled by megapixels
  // Actual pricing is calculated in backend using FAL_MODEL_PRICING
  const megapixels = (width * height) / 1_000_000;
  return Math.ceil((model.estimatedCredits1MP ?? 20) * megapixels);
}

/**
 * Get backend model ID from UI model ID
 */
export function getBackendModelId(uiId: UIModelId): FalModelId | SelfHostedModelId | undefined {
  return MODEL_REGISTRY[uiId]?.backendId;
}

/**
 * Get models by capability
 */
export function getModelsByCapability(capability: ModelCapability): ModelDefinition[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.capabilities.includes(capability));
}

/**
 * Get models that support a specific input type
 */
export function getModelsByInputType(inputType: InputType): ModelDefinition[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.inputType === inputType);
}

/**
 * Get models that produce a specific output type
 */
export function getModelsByOutputType(outputType: OutputType): ModelDefinition[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.outputType === outputType);
}

/**
 * Check if a model supports a specific capability
 */
export function modelSupportsCapability(uiId: UIModelId, capability: ModelCapability): boolean {
  const model = MODEL_REGISTRY[uiId];
  return model?.capabilities.includes(capability) ?? false;
}

/**
 * Map Studio mode to model capabilities
 * Used to filter models in the Studio UI based on selected mode
 */
export function getCapabilitiesForStudioMode(mode: 'creating' | 'editing' | 'upscaling' | 'variations'): ModelCapability[] {
  switch (mode) {
    case 'creating':
      return ['text-to-image'];
    case 'editing':
      return ['editing', 'image-to-image'];
    case 'upscaling':
      return ['upscaling'];
    case 'variations':
      return ['image-to-image'];
    default:
      return ['text-to-image'];
  }
}

/**
 * Get models that support a Studio mode
 */
export function getModelsForStudioMode(
  mode: 'creating' | 'editing' | 'upscaling' | 'variations',
  options?: {
    nsfwEnabled?: boolean;
    mvpOnly?: boolean;
  }
): ModelDefinition[] {
  const capabilities = getCapabilitiesForStudioMode(mode);
  return Object.values(MODEL_REGISTRY).filter((m) => {
    // Filter by capability
    const hasCapability = capabilities.some((cap) => m.capabilities.includes(cap));
    if (!hasCapability) return false;

    // Filter by MVP flag if requested
    if (options?.mvpOnly && !m.isMVP) return false;

    // Filter by NSFW support
    if (options?.nsfwEnabled !== undefined) {
      if (options.nsfwEnabled) {
        // NSFW enabled: only show models that support NSFW
        return m.supportsNSFW === true;
      } else {
        // NSFW disabled: show all models (both NSFW and non-NSFW)
        return true;
      }
    }

    return true;
  });
}

/**
 * Get all Fal backend model IDs (for backend validation)
 */
export function getAllFalBackendModelIds(): string[] {
  return Object.values(MODEL_REGISTRY)
    .filter((m) => m.provider === 'fal' && m.backendId)
    .map((m) => m.backendId as string);
}

