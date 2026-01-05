/**
 * FLUX PuLID Workflow
 *
 * Proper FLUX-based PuLID workflow for face/identity consistency.
 * Uses FLUX models (flux1-dev or flux1-schnell) with PuLID, which is what PuLID was designed for.
 *
 * This is the correct implementation - PuLID components are designed for FLUX models,
 * not Z-Image models. Using FLUX models should eliminate the latent_shapes error.
 *
 * REQUIRED SETUP (on ComfyUI pod):
 * 1. Install ComfyUI-PuLID custom nodes (see docs/ops/runpod/PULID-SETUP.md)
 * 2. FLUX models must be available:
 *    - flux1-dev.safetensors or flux1-schnell.safetensors
 *    - clip_l.safetensors, t5xxl_fp16.safetensors (FLUX text encoders)
 *    - ae.safetensors (FLUX VAE)
 * 3. PuLID model: pulid_flux_v0.9.1.safetensors
 *
 * @see docs/ops/runpod/PULID-SETUP.md
 */

import {
  ComfyUIWorkflow,
  WorkflowDefinition,
  WorkflowBuildOptions,
} from './types';

/** Extended options for FLUX PuLID workflow */
export interface FluxPuLIDWorkflowBuildOptions extends WorkflowBuildOptions {
  /** Base64 reference image for face consistency */
  referenceImage?: string;
  /** PuLID strength (0.0-1.0, default 0.8) */
  pulidStrength?: number;
  /** Start applying PuLID at this step percentage (0.0-1.0) */
  pulidStart?: number;
  /** Stop applying PuLID at this step percentage (0.0-1.0) */
  pulidEnd?: number;
  /** FLUX model to use: 'dev' or 'schnell' (default: 'dev') */
  fluxModel?: 'dev' | 'schnell';
  /** FLUX guidance strength (default: 3.5) */
  guidance?: number;
}

/**
 * Build the FLUX PuLID workflow with face consistency
 * This is the correct implementation - PuLID was designed for FLUX models
 */
export function buildFluxPuLIDWorkflow(
  options: FluxPuLIDWorkflowBuildOptions
): ComfyUIWorkflow {
  const {
    prompt,
    negativePrompt = '',
    width = 1024,
    height = 1024,
    steps = 20,
    cfg = 1.0,
    seed = Math.floor(Math.random() * 2 ** 32),
    lora,
    filenamePrefix = 'ryla_flux_pulid',
    referenceImage,
    pulidStrength = 0.8,
    pulidStart = 0.0,
    pulidEnd = 1.0,
    fluxModel = 'dev',
    guidance = 3.5,
  } = options;

  if (!referenceImage) {
    throw new Error('PuLID workflow requires a reference image');
  }

  // Select FLUX model filename
  const fluxModelName = fluxModel === 'schnell' 
    ? 'flux1-schnell.safetensors' 
    : 'flux1-dev.safetensors';

  const workflow: ComfyUIWorkflow = {
    // ============ MODEL LOADERS (FLUX) ============
    '1': {
      class_type: 'UNETLoader',
      inputs: {
        unet_name: fluxModelName,
        weight_dtype: 'default',
      },
      _meta: { title: 'Load FLUX Diffusion Model' },
    },
    '2': {
      class_type: 'DualCLIPLoader',
      inputs: {
        clip_name1: 'clip_l.safetensors',
        clip_name2: 't5xxl_fp16.safetensors',
        type: 'flux',
        device: 'default',
      },
      _meta: { title: 'Load FLUX Text Encoders' },
    },
    '3': {
      class_type: 'VAELoader',
      inputs: {
        vae_name: 'ae.safetensors',
      },
      _meta: { title: 'Load FLUX VAE' },
    },

    // ============ PULID SETUP ============
    '20': {
      class_type: 'PulidFluxModelLoader',
      inputs: {
        pulid_file: 'pulid_flux_v0.9.1.safetensors',
      },
      _meta: { title: 'Load PuLID Model' },
    },
    '21': {
      class_type: 'PulidFluxInsightFaceLoader',
      inputs: {
        provider: 'CPU', // CPU is more stable, GPU faster but may OOM
      },
      _meta: { title: 'Load InsightFace' },
    },
    '22': {
      class_type: 'PulidFluxEvaClipLoader',
      inputs: {},
      _meta: { title: 'Load EVA CLIP' },
    },

    // ============ REFERENCE IMAGE ============
    '23': {
      class_type: 'LoadImage',
      inputs: {
        image: referenceImage, // Can be base64 data URL or file path
      },
      _meta: { title: 'Load Reference Image' },
    },

    // ============ APPLY PULID ============
    '24': {
      class_type: 'ApplyPulidFlux',
      inputs: {
        model: ['1', 0],
        pulid_flux: ['20', 0],
        eva_clip: ['22', 0],
        face_analysis: ['21', 0],
        image: ['23', 0],
        weight: pulidStrength,
        start_at: pulidStart,
        end_at: pulidEnd,
      },
      _meta: { title: 'Apply PuLID' },
    },

    // ============ PULID COMPATIBILITY PATCH ============
    // Required for compatibility with newer sampler wrappers.
    // Without this, some environments error with:
    // "pulid_outer_sample_wrappers_with_override() got an unexpected keyword argument 'latent_shapes'"
    '28': {
      class_type: 'FixPulidFluxPatch',
      inputs: {
        model: ['24', 0],
      },
      _meta: { title: 'Fix PuLID Flux Patch' },
    },

    // ============ PROMPT ENCODING ============
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
      _meta: { title: 'FLUX Guidance' },
    },

    // ============ LATENT IMAGE ============
    '7': {
      class_type: 'EmptyLatentImage',
      inputs: {
        width,
        height,
        batch_size: 1,
      },
      _meta: { title: 'Empty Latent' },
    },

    // ============ SAMPLING (Using KSampler for FLUX) ============
    '8': {
      class_type: 'KSampler',
      inputs: {
        seed,
        steps,
        cfg,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1.0,
        model: ['28', 0], // Use patched PuLID-modified FLUX model
        positive: ['6', 0], // Use FLUX guidance output
        negative: ['5', 0],
        latent_image: ['7', 0],
      },
      _meta: { title: 'KSampler (FLUX PuLID)' },
    },

    // ============ DECODE AND SAVE ============
    '9': {
      class_type: 'VAEDecode',
      inputs: {
        samples: ['8', 0],
        vae: ['3', 0],
      },
      _meta: { title: 'VAE Decode' },
    },
    '10': {
      class_type: 'SaveImage',
      inputs: {
        filename_prefix: filenamePrefix,
        images: ['9', 0],
      },
      _meta: { title: 'Save Image' },
    },
  };

  // If LoRA is specified, insert it and update references
  if (lora) {
    workflow['30'] = {
      class_type: 'LoraLoader',
      inputs: {
        model: ['28', 0], // After PuLID + patch
        clip: ['2', 0],
        lora_name: lora.name,
        strength_model: lora.strength,
        strength_clip: lora.strength,
      },
      _meta: { title: `LoRA: ${lora.name}` },
    };

    // Update references to use LoRA output
    workflow['4'].inputs['clip'] = ['30', 1];
    workflow['5'].inputs['clip'] = ['30', 1];
    workflow['8'].inputs['model'] = ['30', 0];
  }

  return workflow;
}

/**
 * FLUX PuLID workflow definition
 */
export const fluxPuLIDDefinition: WorkflowDefinition = {
  id: 'flux-pulid',
  name: 'FLUX with PuLID (Face Consistency)',
  description:
    'FLUX model with PuLID for maintaining face/identity consistency from a reference image. This is the correct implementation - PuLID was designed for FLUX models.',
  requiredModels: {
    diffusion: 'flux1-dev.safetensors', // or flux1-schnell.safetensors
    textEncoder: 'clip_l.safetensors, t5xxl_fp16.safetensors',
    vae: 'ae.safetensors',
  },
  requiredNodes: [
    'PulidFluxModelLoader',
    'PulidFluxInsightFaceLoader',
    'PulidFluxEvaClipLoader',
    'ApplyPulidFlux',
    'FixPulidFluxPatch',
    'LoadImage',
    'DualCLIPLoader',
    'FluxGuidance',
    'KSampler',
  ],
  defaults: {
    width: 1024,
    height: 1024,
    steps: 20,
    cfg: 1.0,
  },
  workflow: buildFluxPuLIDWorkflow({
    prompt: '{{prompt}}',
    referenceImage: '{{referenceImage}}',
    width: 1024,
    height: 1024,
  }),
};

