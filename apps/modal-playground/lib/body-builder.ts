import type { EndpointMeta } from './constants';

export type BuildInputs = {
  prompt: string;
  seed: number;
  width: number;
  height: number;
  steps: number;
  cfg: number;
  refImageDataUrl?: string | null;
  loraId?: string | null;
  inputImageDataUrl?: string | null;
};

/**
 * Build request body for a given Modal endpoint.
 * Handles text-to-image, face, LoRA, video, and upscale payloads.
 */
export function buildBodyForEndpoint(
  endpoint: EndpointMeta,
  inputs: BuildInputs
): Record<string, unknown> {
  const { prompt, seed, width, height, steps, cfg, refImageDataUrl, loraId, inputImageDataUrl } =
    inputs;

  if (endpoint.isUpscale && endpoint.path === '/seedvr2') {
    if (!inputImageDataUrl) {
      return { image: '', scale: 2 };
    }
    return { image: inputImageDataUrl, scale: 2 };
  }

  const base: Record<string, unknown> = {
    prompt,
    width,
    height,
    steps,
    cfg,
    seed,
  };

  if (endpoint.needsRefImage && refImageDataUrl) {
    base.reference_image = refImageDataUrl;
  }

  if (endpoint.needsLora && loraId) {
    base.lora_id = loraId;
    base.lora_strength = 0.8;
  }

  if (endpoint.isVideo) {
    base.width = 480;
    base.height = 480;
    base.length = 17;
    base.fps = 16;
    if (endpoint.path === '/wan2.6-lora') {
      base.steps = 30;
    } else {
      base.steps = 20;
    }
  }

  return base;
}
