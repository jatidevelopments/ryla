import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * All available fal-ai image generation models
 * Pricing is calculated per model based on fal.ai pricing structure
 */
export type FalFluxModelId =
  // FLUX Models
  | 'fal-ai/flux/schnell'
  | 'fal-ai/flux/dev'
  | 'fal-ai/flux-pro/v1.1-ultra'
  | 'fal-ai/flux/dev/image-to-image'
  | 'fal-ai/flux-general'
  | 'fal-ai/flux-lora'
  // FLUX 2 Models
  | 'fal-ai/flux-2'
  | 'fal-ai/flux-2-pro'
  | 'fal-ai/flux-2-pro/edit'
  | 'fal-ai/flux-2/edit'
  | 'fal-ai/flux-2-max'
  | 'fal-ai/flux-2-max/edit'
  | 'fal-ai/flux-2-flex'
  | 'fal-ai/flux-2-flex/edit'
  | 'fal-ai/flux-2/turbo'
  | 'fal-ai/flux-2/turbo/edit'
  | 'fal-ai/flux-2/flash'
  | 'fal-ai/flux-2/flash/edit'
  | 'fal-ai/flux-2/lora'
  | 'fal-ai/flux-2/lora/edit'
  // GPT Image Models
  | 'fal-ai/gpt-image-1.5'
  | 'fal-ai/gpt-image-1.5/edit'
  // Google Models
  | 'fal-ai/imagen4/preview'
  | 'fal-ai/imagen4/preview/fast'
  | 'fal-ai/nano-banana-pro'
  | 'fal-ai/nano-banana-pro/edit'
  | 'fal-ai/gemini-3-pro-image-preview'
  | 'fal-ai/gemini-3-pro-image-preview/edit'
  // ByteDance Models
  | 'fal-ai/bytedance/seedream/v4.5/text-to-image'
  | 'fal-ai/bytedance/seedream/v4.5/edit'
  // Z-Image Models
  | 'fal-ai/z-image/turbo'
  | 'fal-ai/z-image/turbo/image-to-image'
  | 'fal-ai/z-image/turbo/image-to-image/lora'
  | 'fal-ai/z-image/turbo/inpaint'
  | 'fal-ai/z-image/turbo/inpaint/lora'
  | 'fal-ai/z-image/turbo/controlnet'
  | 'fal-ai/z-image/turbo/controlnet/lora'
  | 'fal-ai/z-image/turbo/lora'
  // Qwen Models
  | 'fal-ai/qwen-image-2512'
  | 'fal-ai/qwen-image-edit-2509'
  | 'fal-ai/qwen-image-edit-2509-lora'
  | 'fal-ai/qwen-image-edit-2511'
  | 'fal-ai/qwen-image-edit-2511/lora'
  | 'fal-ai/qwen-image-layered'
  | 'fal-ai/qwen-image-layered/lora'
  // HiDream Models
  | 'fal-ai/hidream-i1-fast'
  | 'fal-ai/hidream-i1-dev'
  | 'fal-ai/hidream-i1-full'
  // Other Models
  | 'fal-ai/ideogram/v2'
  | 'fal-ai/stable-diffusion-v35-large'
  | 'fal-ai/recraft/v3/text-to-image'
  | 'bria/text-to-image/3.2'
  | 'fal-ai/ovis-image'
  | 'fal-ai/longcat-image'
  | 'fal-ai/longcat-image/edit'
  | 'fal-ai/kling-image/o1'
  | 'fal-ai/vidu/q2/text-to-image'
  | 'fal-ai/vidu/q2/reference-to-image'
  | 'imagineart/imagineart-1.5-preview/text-to-image'
  // Upscaling Models
  | 'fal-ai/clarity-upscaler'
  | 'fal-ai/aura-sr'
  | 'clarityai/crystal-upscaler'
  | 'fal-ai/seedvr/upscale/image'
  | 'fal-ai/topaz/upscale/image'
  // Reference Image Models (Face Consistency)
  | 'fal-ai/flux-pulid'
  | 'fal-ai/pulid';

export interface FalRunInput {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  seed?: number;
  numImages: number;
}

export interface FalUpscaleInput {
  imageUrl: string;
  scale?: number; // Optional scale factor (2x, 4x, etc.)
}

export interface FalReferenceImageInput {
  prompt: string;
  negativePrompt?: string;
  referenceImageUrl: string; // Face/reference image URL
  width: number;
  height: number;
  seed?: number;
  numImages: number;
  /** Reference image strength (0.0-1.0), default 0.8 */
  idWeight?: number;
}

export interface FalRunOutput {
  requestId: string;
  imageUrls: string[];
}

/**
 * Pricing information for fal-ai models
 * Based on fal.ai pricing as of 2025-01-17
 * 
 * Pricing structure:
 * - Per megapixel: cost scales with image size (width * height / 1,000,000)
 * - Per image: fixed cost regardless of size
 * - Per processed megapixel: similar to per megapixel but for processed images
 * 
 * Credit calculation uses 10x margin model:
 * - USD cost × 10 = credits (for psychological impact, values are ×10)
 * - Example: $0.003/MP × 10 = 0.03 credits per MP, but we multiply by 10 again = 0.3 credits per MP
 * - For 1MP (1024x1024): 0.3 credits
 * 
 * Standard image sizes:
 * - 1:1 (1024x1024) = 1.05 MP ≈ 1 MP
 * - 9:16 (832x1472) = 1.22 MP
 * - 2:3 (896x1344) = 1.20 MP
 */
export interface FalModelPricing {
  /** USD cost per megapixel (if pricing is per MP) */
  costPerMegapixel?: number;
  /** USD cost per image (if pricing is per image) */
  costPerImage?: number;
  /** USD cost per processed megapixel (for editing models) */
  costPerProcessedMegapixel?: number;
  /** Model display name */
  name: string;
  /** Model description */
  description?: string;
}

/**
 * Pricing map for all fal-ai models
 * Prices from fal.ai pricing API (2025-01-17)
 */
export const FAL_MODEL_PRICING: Record<FalFluxModelId, FalModelPricing> = {
  // FLUX Models
  'fal-ai/flux/schnell': {
    costPerMegapixel: 0.003,
    name: 'FLUX Schnell',
    description: 'Fast text-to-image generation',
  },
  'fal-ai/flux/dev': {
    costPerMegapixel: 0.025,
    name: 'FLUX Dev',
    description: 'High quality text-to-image',
  },
  'fal-ai/flux-pro/v1.1-ultra': {
    costPerImage: 0.06,
    name: 'FLUX Pro Ultra',
    description: 'Premium quality, up to 2K resolution',
  },
  'fal-ai/flux/dev/image-to-image': {
    costPerMegapixel: 0.025, // Estimated, same as flux/dev
    name: 'FLUX Dev Image-to-Image',
    description: 'Transform existing images',
  },
  'fal-ai/flux-general': {
    costPerMegapixel: 0.025, // Estimated, same as flux/dev
    name: 'FLUX General',
    description: 'FLUX with ControlNets and LoRAs',
  },
  'fal-ai/flux-lora': {
    costPerMegapixel: 0.025, // Estimated, same as flux/dev
    name: 'FLUX LoRA',
    description: 'FLUX with LoRA support',
  },
  // FLUX 2 Models
  'fal-ai/flux-2': {
    costPerMegapixel: 0.012,
    name: 'FLUX 2',
    description: 'Enhanced realism and text rendering',
  },
  'fal-ai/flux-2-pro': {
    costPerProcessedMegapixel: 0.03,
    name: 'FLUX 2 Pro',
    description: 'Premium quality image generation',
  },
  'fal-ai/flux-2-pro/edit': {
    costPerProcessedMegapixel: 0.03,
    name: 'FLUX 2 Pro Edit',
    description: 'High-quality image editing',
  },
  'fal-ai/flux-2/edit': {
    costPerProcessedMegapixel: 0.012,
    name: 'FLUX 2 Edit',
    description: 'Image editing with natural language',
  },
  'fal-ai/flux-2-max': {
    costPerMegapixel: 0.07,
    name: 'FLUX 2 Max',
    description: 'State-of-the-art generation',
  },
  'fal-ai/flux-2-max/edit': {
    costPerMegapixel: 0.07, // Estimated
    name: 'FLUX 2 Max Edit',
    description: 'Advanced image editing',
  },
  'fal-ai/flux-2-flex': {
    costPerProcessedMegapixel: 0.06,
    name: 'FLUX 2 Flex',
    description: 'Adjustable inference steps',
  },
  'fal-ai/flux-2-flex/edit': {
    costPerProcessedMegapixel: 0.06,
    name: 'FLUX 2 Flex Edit',
    description: 'Multi-reference editing',
  },
  'fal-ai/flux-2/turbo': {
    costPerMegapixel: 0.008,
    name: 'FLUX 2 Turbo',
    description: 'Fast FLUX 2 generation',
  },
  'fal-ai/flux-2/turbo/edit': {
    costPerMegapixel: 0.008, // Estimated
    name: 'FLUX 2 Turbo Edit',
    description: 'Fast image editing',
  },
  'fal-ai/flux-2/flash': {
    costPerMegapixel: 0.005,
    name: 'FLUX 2 Flash',
    description: 'Ultra-fast generation',
  },
  'fal-ai/flux-2/flash/edit': {
    costPerMegapixel: 0.005, // Estimated
    name: 'FLUX 2 Flash Edit',
    description: 'Ultra-fast editing',
  },
  'fal-ai/flux-2/lora': {
    costPerMegapixel: 0.012, // Estimated, same as flux-2
    name: 'FLUX 2 LoRA',
    description: 'FLUX 2 with LoRA support',
  },
  'fal-ai/flux-2/lora/edit': {
    costPerMegapixel: 0.012, // Estimated
    name: 'FLUX 2 LoRA Edit',
    description: 'Style transfer and modifications',
  },
  // GPT Image Models
  'fal-ai/gpt-image-1.5': {
    costPerImage: 0.001, // Per "units" - treating as per image
    name: 'GPT Image 1.5',
    description: 'High-fidelity with strong prompt adherence',
  },
  'fal-ai/gpt-image-1.5/edit': {
    costPerImage: 0.001, // Estimated
    name: 'GPT Image 1.5 Edit',
    description: 'Image editing with GPT Image',
  },
  // Google Models
  'fal-ai/imagen4/preview': {
    costPerImage: 0.04,
    name: 'Imagen 4',
    description: "Google's highest quality model",
  },
  'fal-ai/imagen4/preview/fast': {
    costPerImage: 0.02,
    name: 'Imagen 4 Fast',
    description: 'Fast Imagen 4 generation',
  },
  'fal-ai/nano-banana-pro': {
    costPerImage: 0.04, // Estimated, similar to imagen4
    name: 'Nano Banana Pro',
    description: "Google's state-of-the-art model",
  },
  'fal-ai/nano-banana-pro/edit': {
    costPerImage: 0.04, // Estimated
    name: 'Nano Banana Pro Edit',
    description: 'Advanced editing with Nano Banana',
  },
  'fal-ai/gemini-3-pro-image-preview': {
    costPerImage: 0.04, // Estimated
    name: 'Gemini 3 Pro Image',
    description: 'Google Gemini image generation',
  },
  'fal-ai/gemini-3-pro-image-preview/edit': {
    costPerImage: 0.04, // Estimated
    name: 'Gemini 3 Pro Image Edit',
    description: 'Image editing with Gemini',
  },
  // ByteDance Models
  'fal-ai/bytedance/seedream/v4.5/text-to-image': {
    costPerImage: 0.04,
    name: 'Seedream 4.5',
    description: 'ByteDance next-gen model',
  },
  'fal-ai/bytedance/seedream/v4.5/edit': {
    costPerImage: 0.04, // Estimated
    name: 'Seedream 4.5 Edit',
    description: 'Unified generation and editing',
  },
  // Z-Image Models
  'fal-ai/z-image/turbo': {
    costPerMegapixel: 0.005,
    name: 'Z-Image Turbo',
    description: 'Super-fast 6B parameter model',
  },
  'fal-ai/z-image/turbo/image-to-image': {
    costPerMegapixel: 0.005, // Estimated
    name: 'Z-Image Turbo I2I',
    description: 'Image-to-image transformation',
  },
  'fal-ai/z-image/turbo/image-to-image/lora': {
    costPerMegapixel: 0.005, // Estimated
    name: 'Z-Image Turbo I2I LoRA',
    description: 'I2I with LoRA support',
  },
  'fal-ai/z-image/turbo/inpaint': {
    costPerMegapixel: 0.005, // Estimated
    name: 'Z-Image Turbo Inpaint',
    description: 'Inpainting with Z-Image',
  },
  'fal-ai/z-image/turbo/inpaint/lora': {
    costPerMegapixel: 0.005, // Estimated
    name: 'Z-Image Turbo Inpaint LoRA',
    description: 'Inpainting with LoRA',
  },
  'fal-ai/z-image/turbo/controlnet': {
    costPerMegapixel: 0.005, // Estimated
    name: 'Z-Image Turbo ControlNet',
    description: 'ControlNet conditioning',
  },
  'fal-ai/z-image/turbo/controlnet/lora': {
    costPerMegapixel: 0.005, // Estimated
    name: 'Z-Image Turbo ControlNet LoRA',
    description: 'ControlNet with LoRA',
  },
  'fal-ai/z-image/turbo/lora': {
    costPerMegapixel: 0.005, // Estimated
    name: 'Z-Image Turbo LoRA',
    description: 'Text-to-image with LoRA',
  },
  // Qwen Models
  'fal-ai/qwen-image-2512': {
    costPerMegapixel: 0.02,
    name: 'Qwen Image 2512',
    description: 'Improved text rendering and realism',
  },
  'fal-ai/qwen-image-edit-2509': {
    costPerImage: 0.02, // Estimated
    name: 'Qwen Image Edit 2509',
    description: 'Superior text editing capabilities',
  },
  'fal-ai/qwen-image-edit-2509-lora': {
    costPerImage: 0.02, // Estimated
    name: 'Qwen Image Edit 2509 LoRA',
    description: 'Editing with LoRA support',
  },
  'fal-ai/qwen-image-edit-2511': {
    costPerImage: 0.02, // Estimated
    name: 'Qwen Image Edit 2511',
    description: 'Qwen image editing model',
  },
  'fal-ai/qwen-image-edit-2511/lora': {
    costPerImage: 0.02, // Estimated
    name: 'Qwen Image Edit 2511 LoRA',
    description: 'Editing with LoRA',
  },
  'fal-ai/qwen-image-layered': {
    costPerImage: 0.02, // Estimated
    name: 'Qwen Image Layered',
    description: 'RGBA layer decomposition',
  },
  'fal-ai/qwen-image-layered/lora': {
    costPerImage: 0.02, // Estimated
    name: 'Qwen Image Layered LoRA',
    description: 'Layered output with LoRA',
  },
  // HiDream Models
  'fal-ai/hidream-i1-fast': {
    costPerMegapixel: 0.01,
    name: 'HiDream I1 Fast',
    description: 'Fast 17B parameter model',
  },
  'fal-ai/hidream-i1-dev': {
    costPerMegapixel: 0.03,
    name: 'HiDream I1 Dev',
    description: '17B parameter model',
  },
  'fal-ai/hidream-i1-full': {
    costPerMegapixel: 0.05,
    name: 'HiDream I1 Full',
    description: 'Full quality 17B model',
  },
  // Other Models
  'fal-ai/ideogram/v2': {
    costPerImage: 0.08,
    name: 'Ideogram V2',
    description: 'Exceptional typography handling',
  },
  'fal-ai/stable-diffusion-v35-large': {
    costPerMegapixel: 0.065,
    name: 'Stable Diffusion 3.5 Large',
    description: 'MMDiT text-to-image model',
  },
  'fal-ai/recraft/v3/text-to-image': {
    costPerImage: 0.04,
    name: 'Recraft V3',
    description: 'Long texts, vector art, brand style',
  },
  'bria/text-to-image/3.2': {
    costPerImage: 0.04, // Per "generations"
    name: 'Bria 3.2',
    description: 'Licensed data, safe commercial use',
  },
  'fal-ai/ovis-image': {
    costPerImage: 0.02, // Estimated
    name: 'Ovis Image',
    description: '7B model optimized for text rendering',
  },
  'fal-ai/longcat-image': {
    costPerImage: 0.02, // Estimated
    name: 'Longcat Image',
    description: '6B multilingual text rendering',
  },
  'fal-ai/longcat-image/edit': {
    costPerImage: 0.02, // Estimated
    name: 'Longcat Image Edit',
    description: 'Image editing with Longcat',
  },
  'fal-ai/kling-image/o1': {
    costPerImage: 0.03, // Estimated
    name: 'Kling O1 Image',
    description: 'Precise edits with reference control',
  },
  'fal-ai/vidu/q2/text-to-image': {
    costPerImage: 0.03, // Estimated
    name: 'Vidu Q2',
    description: 'Text-to-image generation',
  },
  'fal-ai/vidu/q2/reference-to-image': {
    costPerImage: 0.03, // Estimated
    name: 'Vidu Q2 Reference',
    description: 'Reference-based image creation',
  },
  'imagineart/imagineart-1.5-preview/text-to-image': {
    costPerImage: 0.03, // Estimated
    name: 'ImagineArt 1.5',
    description: 'High-fidelity professional visuals',
  },
  // Upscaling Models
  'fal-ai/clarity-upscaler': {
    costPerImage: 0.02, // Estimated
    name: 'Clarity Upscaler',
    description: 'High fidelity upscaling',
  },
  'fal-ai/aura-sr': {
    costPerImage: 0.01, // Estimated
    name: 'AuraSR',
    description: 'Upscale images with AuraSR',
  },
  'clarityai/crystal-upscaler': {
    costPerImage: 0.02, // Estimated
    name: 'Crystal Upscaler',
    description: 'Advanced facial detail upscaling',
  },
  'fal-ai/seedvr/upscale/image': {
    costPerImage: 0.03, // Estimated
    name: 'SeedVR2',
    description: 'Use SeedVR2 to upscale your images',
  },
  'fal-ai/topaz/upscale/image': {
    costPerImage: 0.02, // Estimated
    name: 'Topaz',
    description: 'Powerful and accurate image enhancer',
  },
  // Reference Image Models (Face Consistency)
  'fal-ai/flux-pulid': {
    costPerMegapixel: 0.0333,
    name: 'FLUX PuLID',
    description: 'Face-consistent generation with FLUX',
  },
  'fal-ai/pulid': {
    costPerMegapixel: 0.025, // Estimated
    name: 'PuLID Standard',
    description: 'Tuning-free ID customization',
  },
};

/**
 * Calculate USD cost for a fal-ai model based on image dimensions
 */
export function calculateFalModelCost(
  modelId: FalFluxModelId,
  width: number,
  height: number
): number {
  const pricing = FAL_MODEL_PRICING[modelId];
  if (!pricing) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  // Calculate megapixels
  const megapixels = (width * height) / 1_000_000;

  if (pricing.costPerImage !== undefined) {
    return pricing.costPerImage;
  }

  if (pricing.costPerMegapixel !== undefined) {
    return pricing.costPerMegapixel * megapixels;
  }

  if (pricing.costPerProcessedMegapixel !== undefined) {
    return pricing.costPerProcessedMegapixel * megapixels;
  }

  throw new Error(`Invalid pricing for model: ${modelId}`);
}

/**
 * Calculate credit cost for a fal-ai model
 * Uses 10x margin model: USD cost × 10 × 10 = credits
 * (First ×10 for margin, second ×10 for psychological impact)
 */
export function calculateFalModelCredits(
  modelId: FalFluxModelId,
  width: number,
  height: number
): number {
  const usdCost = calculateFalModelCost(modelId, width, height);
  // Standard: 1 Credit = $0.001
  // Margin: 2x
  // Formula: (USD * 2) / 0.001 = USD * 2000
  return Math.ceil(usdCost * 2000);
}

/**
 * Get all available fal-ai model IDs as an array
 * Useful for validation in DTOs
 */
export function getAllFalModelIds(): FalFluxModelId[] {
  return Object.keys(FAL_MODEL_PRICING) as FalFluxModelId[];
}

/**
 * Minimal Fal HTTP client (no SDK dependency).
 *
 * Notes:
 * - We intentionally avoid adding `@fal-ai/client` here to keep deps stable and follow repo rules.
 * - If Fal changes response shape, this service should be updated with the new schema.
 */
@Injectable()
export class FalImageService {
  private readonly logger = new Logger(FalImageService.name);

  isConfigured(): boolean {
    return Boolean(this.getFalKey());
  }

  /**
   * Runs a Fal model and returns image URLs (provider-hosted).
   * We then download+upload those images into our own storage elsewhere.
   */
  async runFlux(modelId: FalFluxModelId, input: FalRunInput): Promise<FalRunOutput> {
    const falKey = this.getFalKey();
    if (!falKey) {
      throw new Error('FAL_KEY is not configured');
    }

    // Fal’s HTTP API is served from fal.run. We keep the request body minimal and resilient.
    const url = `https://fal.run/${modelId}`;
    const requestId = randomUUID();

    // Common Fal input keys across image models (best-effort):
    // - prompt / negative_prompt
    // - image_size (object) OR width/height (varies). We include both to be resilient.
    // - num_images
    // - seed
    const body: Record<string, unknown> = {
      prompt: input.prompt,
      negative_prompt: input.negativePrompt,
      width: input.width,
      height: input.height,
      image_size: { width: input.width, height: input.height },
      num_images: input.numImages,
      seed: input.seed,
    };

    // Add timeout to prevent hanging (30 seconds for initial request)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Key ${falKey}`,
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Fal request timeout (${modelId}) - model may require async polling`);
      }
      throw err;
    }

    const text = await res.text();
    if (!res.ok) {
      this.logger.warn(`Fal run failed (${modelId}) status=${res.status} body=${text.slice(0, 500)}`);
      throw new Error(`Fal run failed (${modelId}) status=${res.status}`);
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      this.logger.error(`Fal returned non-JSON response for (${modelId}): ${text.slice(0, 500)}`);
      throw new Error(`Fal returned non-JSON response for (${modelId})`);
    }

    // Log response structure for debugging
    this.logger.debug(`Fal response for ${modelId}: ${JSON.stringify(json).substring(0, 200)}`);

    // Check if this is an async queue response (returns request_id for polling)
    // Some models like Seedream 4.5 use async queue API
    const queueResponse = json as { request_id?: string; status?: string; images?: unknown };
    const hasImages = this.extractImageUrls(json).length > 0;

    this.logger.debug(`Fal response check ${modelId}: request_id=${queueResponse.request_id || 'none'}, status=${queueResponse.status || 'none'}, hasImages=${hasImages}`);

    // If we got a request_id but no images, it's async - need to poll
    if (queueResponse.request_id && !hasImages) {
      this.logger.log(`Fal model ${modelId} returned async request_id=${queueResponse.request_id}, polling queue...`);
      return await this.pollFalQueue(queueResponse.request_id, modelId);
    }

    // Also check if status indicates async processing
    if (queueResponse.status === 'IN_QUEUE' || queueResponse.status === 'IN_PROGRESS') {
      if (queueResponse.request_id) {
        this.logger.log(`Fal model ${modelId} status=${queueResponse.status} request_id=${queueResponse.request_id}, polling...`);
        return await this.pollFalQueue(queueResponse.request_id, modelId);
      }
    }

    const imageUrls = this.extractImageUrls(json);
    if (imageUrls.length === 0) {
      this.logger.error(`Fal returned 0 image URLs (${modelId}) response=${JSON.stringify(json).substring(0, 500)}`);
      throw new Error(`Fal returned no images (${modelId})`);
    }

    this.logger.log(`Fal model ${modelId} returned ${imageUrls.length} image(s) immediately`);
    return { requestId, imageUrls };
  }

  /**
   * Upscale an image using a Fal.ai upscaling model.
   * Takes an image URL and returns upscaled image URLs.
   */
  async runUpscale(modelId: FalFluxModelId, input: FalUpscaleInput): Promise<FalRunOutput> {
    const falKey = this.getFalKey();
    if (!falKey) {
      throw new Error('FAL_KEY is not configured');
    }

    const url = `https://fal.run/${modelId}`;
    const requestId = randomUUID();

    // Upscaling models typically accept:
    // - image_url: URL to the image to upscale
    // - scale: Optional scale factor (2x, 4x, etc.)
    const body: Record<string, unknown> = {
      image_url: input.imageUrl,
    };

    if (input.scale !== undefined) {
      body.scale = input.scale;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Key ${falKey}`,
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      this.logger.warn(`Fal upscale failed (${modelId}) status=${res.status} body=${text.slice(0, 500)}`);
      throw new Error(`Fal upscale failed (${modelId}) status=${res.status}`);
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Fal returned non-JSON response for (${modelId})`);
    }

    const imageUrls = this.extractImageUrls(json);
    if (imageUrls.length === 0) {
      this.logger.warn(`Fal returned 0 image URLs (${modelId}) body=${text.slice(0, 500)}`);
      throw new Error(`Fal returned no images (${modelId})`);
    }

    return { requestId, imageUrls };
  }

  /**
   * Run a reference image generation using Fal.ai PuLID endpoints.
   * Supports face-consistent generation with a reference image.
   * 
   * @param modelId - PuLID model ID (fal-ai/flux-pulid or fal-ai/pulid)
   * @param input - Reference image input parameters
   */
  async runReferenceImage(
    modelId: 'fal-ai/flux-pulid' | 'fal-ai/pulid',
    input: FalReferenceImageInput
  ): Promise<FalRunOutput> {
    const falKey = this.getFalKey();
    if (!falKey) {
      throw new Error('FAL_KEY is not configured');
    }

    const url = `https://fal.run/${modelId}`;
    const requestId = randomUUID();

    // PuLID input format:
    // - prompt: text prompt
    // - reference_images: array of { url: string } for fal-ai/pulid
    // - reference_image_url: string for fal-ai/flux-pulid
    // - id_weight: reference strength (0.0-1.0)
    // - image_size: { width, height }
    const body: Record<string, unknown> = {
      prompt: input.prompt,
      negative_prompt: input.negativePrompt,
      image_size: { width: input.width, height: input.height },
      num_images: input.numImages,
      seed: input.seed,
      id_weight: input.idWeight ?? 0.8,
    };

    // Different input format for different PuLID endpoints
    if (modelId === 'fal-ai/flux-pulid') {
      body.reference_image_url = input.referenceImageUrl;
    } else {
      // fal-ai/pulid accepts array of reference images
      body.reference_images = [{ url: input.referenceImageUrl }];
    }

    // Add timeout to prevent hanging (60 seconds for reference image models)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Key ${falKey}`,
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Fal reference image request timeout (${modelId})`);
      }
      throw err;
    }

    const text = await res.text();
    if (!res.ok) {
      this.logger.warn(`Fal reference image failed (${modelId}) status=${res.status} body=${text.slice(0, 500)}`);
      throw new Error(`Fal reference image failed (${modelId}) status=${res.status}`);
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Fal returned non-JSON response for (${modelId})`);
    }

    // Check for async queue response
    const queueResponse = json as { request_id?: string; status?: string };
    const hasImages = this.extractImageUrls(json).length > 0;

    if (queueResponse.request_id && !hasImages) {
      this.logger.log(`Fal reference model ${modelId} returned async request_id=${queueResponse.request_id}, polling...`);
      return await this.pollFalQueue(queueResponse.request_id, modelId as FalFluxModelId);
    }

    const imageUrls = this.extractImageUrls(json);
    if (imageUrls.length === 0) {
      this.logger.warn(`Fal returned 0 image URLs (${modelId}) body=${text.slice(0, 500)}`);
      throw new Error(`Fal returned no images (${modelId})`);
    }

    this.logger.log(`Fal reference model ${modelId} returned ${imageUrls.length} image(s)`);
    return { requestId, imageUrls };
  }

  /**
   * Download an image URL to a base64 data URL (data:<mime>;base64,...)
   */
  async downloadToBase64DataUrl(imageUrl: string): Promise<string> {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new Error(`Failed to download image from Fal: ${res.status}`);
    }
    const contentType = res.headers.get('content-type') || 'image/png';
    const arrayBuffer = await res.arrayBuffer();
    const b64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${contentType};base64,${b64}`;
  }

  /**
   * Poll Fal AI queue API for async model results
   * Some models (like Seedream 4.5) use async queue instead of immediate response
   */
  private async pollFalQueue(requestId: string, modelId: FalFluxModelId): Promise<FalRunOutput> {
    const falKey = this.getFalKey();
    if (!falKey) {
      throw new Error('FAL_KEY is not configured');
    }

    const maxAttempts = 60; // 5 minutes max (5s * 60)
    const pollInterval = 5000; // 5 seconds
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      attempts++;

      try {
        // Poll the queue endpoint: https://queue.fal.run/{modelId}/requests/{request_id}
        // Remove 'fal-ai/' prefix if present for queue API
        const modelPath = modelId.startsWith('fal-ai/') ? modelId : `fal-ai/${modelId}`;
        const pollUrl = `https://queue.fal.run/${modelPath}/requests/${requestId}`;

        const res = await fetch(pollUrl, {
          method: 'GET',
          headers: {
            Authorization: `Key ${falKey}`,
          },
        });

        if (!res.ok) {
          this.logger.warn(`Fal queue poll failed (${modelId}) requestId=${requestId} status=${res.status}`);
          if (attempts >= maxAttempts) {
            throw new Error(`Fal queue polling timeout (${modelId}) after ${maxAttempts} attempts`);
          }
          continue;
        }

        const json = await res.json() as { status: string; images?: Array<{ url: string }>; error?: string };

        if (json.status === 'COMPLETED' && json.images && json.images.length > 0) {
          const imageUrls = json.images.map((img) => img.url);
          this.logger.log(`Fal queue completed (${modelId}) requestId=${requestId} images=${imageUrls.length}`);
          return { requestId, imageUrls };
        }

        if (json.status === 'FAILED' || json.error) {
          throw new Error(`Fal queue failed (${modelId}): ${json.error || 'Unknown error'}`);
        }

        // Still processing - continue polling
        this.logger.debug(`Fal queue status (${modelId}) requestId=${requestId} status=${json.status} attempt=${attempts}/${maxAttempts}`);
      } catch (err) {
        if (err instanceof Error && err.message.includes('timeout')) {
          throw err;
        }
        // Log but continue polling on transient errors
        this.logger.warn(`Fal queue poll error (${modelId}) requestId=${requestId} attempt=${attempts}: ${err}`);
      }
    }

    throw new Error(`Fal queue polling timeout (${modelId}) after ${maxAttempts} attempts`);
  }

  private getFalKey(): string | undefined {
    // apps/api loads apps/api/.env via dotenv in src/main.ts.
    // We use process.env directly to avoid DI timing / runtime metadata issues.
    return process.env['FAL_KEY'];
  }

  private extractImageUrls(payload: unknown): string[] {
    // Fal commonly returns:
    // { images: [{ url: "..." }, ...] }
    // but we support a few variants just in case.
    const urls: string[] = [];

    const p = payload as any;
    if (Array.isArray(p?.images)) {
      for (const img of p.images) {
        const url = typeof img?.url === 'string' ? img.url : undefined;
        if (url) urls.push(url);
      }
    }

    if (urls.length > 0) return urls;

    const singleUrl = typeof p?.image?.url === 'string' ? p.image.url : undefined;
    if (singleUrl) return [singleUrl];

    // Sometimes models return just { url: "..." }
    if (typeof p?.url === 'string') return [p.url];

    return [];
  }
}


