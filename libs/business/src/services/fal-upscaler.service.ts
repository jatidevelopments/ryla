/**
 * fal.ai Image Upscaling Service
 *
 * Provides high-quality image upscaling using fal.ai models:
 * - Creative Upscaler: Best for adding realistic detail (skin, hair)
 * - AuraSR: Sharp, high-quality 4x upscaling
 */

import { fal } from '@fal-ai/client';

export interface UpscaleOptions {
  /** The image URL to upscale */
  imageUrl: string;
  /** Upscale factor (2 or 4) */
  scale?: 2 | 4;
  /** Creativity level (0-1, lower = closer to original) */
  creativity?: number;
  /** Optional prompt to guide upscaling */
  prompt?: string;
  /** Model to use */
  model?: 'creative-upscaler' | 'aura-sr';
}

export interface UpscaleResult {
  /** The upscaled image URL */
  imageUrl: string;
  /** Original dimensions */
  originalWidth?: number;
  originalHeight?: number;
  /** New dimensions */
  newWidth?: number;
  newHeight?: number;
}

/**
 * Configure fal.ai client with API key
 */
export function configureFal(apiKey?: string): void {
  fal.config({
    credentials: apiKey || process.env['FAL_KEY'] || process.env['FAL_API_KEY'],
  });
}

/**
 * Upscale an image using fal.ai Creative Upscaler
 * Best for portraits and photos with skin/hair detail
 */
export async function upscaleCreative(
  options: UpscaleOptions
): Promise<UpscaleResult> {
  const {
    imageUrl,
    scale = 2,
    creativity = 0.3,
    prompt = 'high resolution, professional photography, sharp focus, detailed textures',
  } = options;

  const result = await fal.run('fal-ai/creative-upscaler', {
    input: {
      image_url: imageUrl,
      scale,
      creativity,
      prompt,
      // Optimize for quality
      detail: 1,
      shape_preservation: 0.25,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = result.data as any;
  return {
    imageUrl: data?.image?.url ?? data?.images?.[0]?.url ?? '',
  };
}

/**
 * Upscale an image using fal.ai AuraSR
 * Fast, high-quality 4x upscaling
 */
export async function upscaleAuraSR(imageUrl: string): Promise<UpscaleResult> {
  const result = await fal.run('fal-ai/aura-sr', {
    input: {
      image_url: imageUrl,
      upscaling_factor: '4' as const,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = result.data as any;
  return {
    imageUrl: data?.image?.url ?? data?.images?.[0]?.url ?? '',
  };
}

/**
 * Main upscale function - selects appropriate model based on options
 */
export async function upscaleImage(
  options: UpscaleOptions
): Promise<UpscaleResult> {
  const { model = 'creative-upscaler' } = options;

  if (model === 'aura-sr') {
    return upscaleAuraSR(options.imageUrl);
  }

  return upscaleCreative(options);
}

/**
 * Batch upscale multiple images
 */
export async function upscaleBatch(
  images: UpscaleOptions[]
): Promise<UpscaleResult[]> {
  const results = await Promise.all(images.map((img) => upscaleImage(img)));
  return results;
}
