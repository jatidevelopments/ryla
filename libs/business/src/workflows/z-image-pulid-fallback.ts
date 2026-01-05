/**
 * Z-Image PuLID Workflow with KSampler Fallback
 *
 * Alternative version that uses standard KSampler instead of ClownsharKSampler_Beta.
 * Still requires FixPulidFluxPatch to avoid the latent_shapes error.
 *
 * KSampler is more stable than ClownsharKSampler_Beta, but FixPulidFluxPatch
 * is still required to patch the PuLID-modified model wrapper.
 */

import {
  ComfyUIWorkflow,
  WorkflowDefinition,
  WorkflowBuildOptions,
} from './types';
import type { PuLIDWorkflowBuildOptions } from './z-image-pulid';

/**
 * Build the Z-Image PuLID workflow with KSampler (fallback version)
 * Uses standard KSampler instead of ClownsharKSampler_Beta for better stability.
 * Still requires FixPulidFluxPatch to avoid the latent_shapes error.
 */
export function buildZImagePuLIDWorkflowWithKSampler(
  options: PuLIDWorkflowBuildOptions
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
    filenamePrefix = 'ryla_pulid',
    referenceImage,
    pulidStrength = 0.8,
    pulidStart = 0.0,
    pulidEnd = 0.8,
  } = options;

  if (!referenceImage) {
    throw new Error('PuLID workflow requires a reference image');
  }

  const workflow: ComfyUIWorkflow = {
    // ============ MODEL LOADERS ============
    '1': {
      class_type: 'UNETLoader',
      inputs: {
        unet_name: 'z_image_turbo_bf16.safetensors',
        weight_dtype: 'default',
      },
      _meta: { title: 'Load Diffusion Model' },
    },
    '2': {
      class_type: 'CLIPLoader',
      inputs: {
        clip_name: 'qwen_3_4b.safetensors',
        type: 'lumina2',
        device: 'default',
      },
      _meta: { title: 'Load CLIP' },
    },
    '3': {
      class_type: 'VAELoader',
      inputs: {
        vae_name: 'z-image-turbo-vae.safetensors',
      },
      _meta: { title: 'Load VAE' },
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
    // REQUIRED: Even with KSampler, the PuLID-modified model needs FixPulidFluxPatch
    // to avoid "pulid_outer_sample_wrappers() got an unexpected keyword argument 'latent_shapes'"
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
      class_type: 'ConditioningZeroOut',
      inputs: {
        conditioning: ['5', 0],
      },
      _meta: { title: 'Zero Out Negative' },
    },

    // ============ LATENT IMAGE ============
    '7': {
      class_type: 'EmptySD3LatentImage',
      inputs: {
        width,
        height,
        batch_size: 1,
      },
      _meta: { title: 'Empty Latent' },
    },

    // ============ SAMPLING (Using KSampler instead of ClownsharKSampler_Beta) ============
    // KSampler works directly with ApplyPulidFlux output, no FixPulidFluxPatch needed
    '8': {
      class_type: 'KSampler',
      inputs: {
        seed,
        steps,
        cfg,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1.0,
        model: ['24', 0], // Use PuLID-modified model directly (no patch needed with KSampler)
        positive: ['4', 0],
        negative: ['6', 0],
        latent_image: ['7', 0],
      },
      _meta: { title: 'KSampler (PuLID compatible)' },
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

