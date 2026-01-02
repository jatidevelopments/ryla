/**
 * Flux Inpaint Workflow (ComfyUI prompt format)
 *
 * MVP use-case: edit a selected image by providing an edit prompt + an inpaint mask.
 *
 * Input image should be an RGBA PNG where alpha acts as the mask:
 * - opaque/white alpha = editable region
 * - transparent/black alpha = preserve region
 *
 * Notes:
 * - This workflow targets Flux Fill ("flux1-fill-dev.safetensors") running on the ComfyUI pod.
 * - Requires standard ComfyUI nodes: UNETLoader, DualCLIPLoader, VAELoader, LoadImage, etc.
 */

import type { ComfyUIWorkflow } from './types';

export interface FluxInpaintWorkflowOptions {
  prompt: string;
  negativePrompt?: string;
  /** Filename in ComfyUI input folder (returned by /upload/image). */
  imageFilename: string;
  seed?: number;
  steps?: number;
  cfg?: number;
  /** Flux guidance strength (commonly 30). */
  guidance?: number;
  filenamePrefix?: string;
}

export function buildFluxInpaintWorkflow(options: FluxInpaintWorkflowOptions): ComfyUIWorkflow {
  const {
    prompt,
    negativePrompt = '',
    imageFilename,
    seed = Math.floor(Math.random() * 2 ** 32),
    steps = 20,
    cfg = 1.0,
    guidance = 30,
    filenamePrefix = 'ryla_inpaint',
  } = options;

  return {
    // Model loaders (Flux Fill)
    '1': {
      class_type: 'UNETLoader',
      inputs: {
        unet_name: 'flux1-fill-dev.safetensors',
        weight_dtype: 'default',
      },
      _meta: { title: 'Load Flux Fill UNet' },
    },
    '2': {
      class_type: 'DualCLIPLoader',
      inputs: {
        clip_name1: 'clip_l.safetensors',
        clip_name2: 't5xxl_fp16.safetensors',
        type: 'flux',
        device: 'default',
      },
      _meta: { title: 'Load Flux Text Encoders' },
    },
    '3': {
      class_type: 'VAELoader',
      inputs: {
        vae_name: 'ae.safetensors',
      },
      _meta: { title: 'Load VAE' },
    },

    // Prompts
    '4': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: prompt,
        clip: ['2', 0],
      },
      _meta: { title: 'Positive Prompt' },
    },
    '5': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: negativePrompt,
        clip: ['2', 0],
      },
      _meta: { title: 'Negative Prompt' },
    },
    '6': {
      class_type: 'FluxGuidance',
      inputs: {
        conditioning: ['4', 0],
        guidance,
      },
      _meta: { title: 'Flux Guidance' },
    },

    // Load image (RGBA PNG where alpha is mask)
    '7': {
      class_type: 'LoadImage',
      inputs: {
        image: imageFilename,
      },
      _meta: { title: 'Load Image + Mask' },
    },

    // Inpaint conditioning and latent
    '8': {
      class_type: 'InpaintModelConditioning',
      inputs: {
        positive: ['6', 0],
        negative: ['5', 0],
        vae: ['3', 0],
        pixels: ['7', 0],
        mask: ['7', 1],
      },
      _meta: { title: 'Inpaint Conditioning' },
    },

    // Differential diffusion wrapper
    '9': {
      class_type: 'DifferentialDiffusion',
      inputs: {
        model: ['1', 0],
      },
      _meta: { title: 'Differential Diffusion' },
    },

    // Sampling
    '10': {
      class_type: 'KSampler',
      inputs: {
        model: ['9', 0],
        positive: ['8', 0],
        negative: ['8', 1],
        latent_image: ['8', 2],
        seed,
        steps,
        cfg,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1.0,
      },
      _meta: { title: 'KSampler' },
    },

    // Decode + save
    '11': {
      class_type: 'VAEDecode',
      inputs: {
        samples: ['10', 0],
        vae: ['3', 0],
      },
      _meta: { title: 'VAE Decode' },
    },
    '12': {
      class_type: 'SaveImage',
      inputs: {
        filename_prefix: filenamePrefix,
        images: ['11', 0],
      },
      _meta: { title: 'Save Image' },
    },
  };
}


