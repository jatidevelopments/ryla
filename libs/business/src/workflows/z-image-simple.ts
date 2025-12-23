/**
 * Z-Image Simple Workflow
 *
 * Basic Z-Image-Turbo workflow using only built-in ComfyUI nodes.
 * Use this as a fallback when custom nodes (res4lyf) aren't installed.
 *
 * Differences from Danrisi:
 * - Uses standard KSampler instead of ClownsharKSampler_Beta
 * - Uses simple scheduler instead of BetaSamplingScheduler + Sigmas Rescale
 * - No FluxResolutionNode (hardcoded dimensions)
 */

import {
  ComfyUIWorkflow,
  WorkflowDefinition,
  WorkflowBuildOptions,
} from './types';

/**
 * Build the Z-Image Simple workflow with custom parameters
 */
export function buildZImageSimpleWorkflow(
  options: WorkflowBuildOptions
): ComfyUIWorkflow {
  const {
    prompt,
    negativePrompt = '',
    width = 1024,
    height = 1024,
    steps = 9,
    cfg = 1.0,
    seed = Math.floor(Math.random() * 2 ** 32),
    lora,
    filenamePrefix = 'ryla_output',
  } = options;

  const workflow: ComfyUIWorkflow = {
    // Model Loaders
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
        type: 'sd3', // Simple workflow uses sd3 (works, but lumina2 is better)
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

    // Prompt Encoding
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

    // Latent Image
    '6': {
      class_type: 'EmptySD3LatentImage',
      inputs: {
        width,
        height,
        batch_size: 1,
      },
      _meta: { title: 'Empty Latent' },
    },

    // Standard Sampling
    '7': {
      class_type: 'KSampler',
      inputs: {
        model: ['1', 0],
        positive: ['4', 0],
        negative: ['5', 0],
        latent_image: ['6', 0],
        seed,
        steps,
        cfg,
        sampler_name: 'euler',
        scheduler: 'simple',
        denoise: 1.0,
      },
      _meta: { title: 'KSampler' },
    },

    // Decode and Save
    '8': {
      class_type: 'VAEDecode',
      inputs: {
        samples: ['7', 0],
        vae: ['3', 0],
      },
      _meta: { title: 'VAE Decode' },
    },
    '9': {
      class_type: 'SaveImage',
      inputs: {
        filename_prefix: filenamePrefix,
        images: ['8', 0],
      },
      _meta: { title: 'Save Image' },
    },
  };

  // If LoRA is specified, insert it between model loaders and sampler
  if (lora) {
    workflow['20'] = {
      class_type: 'LoraLoader',
      inputs: {
        model: ['1', 0],
        clip: ['2', 0],
        lora_name: lora.name,
        strength_model: lora.strength,
        strength_clip: lora.strength,
      },
      _meta: { title: `LoRA: ${lora.name}` },
    };

    // Update references
    workflow['4'].inputs['clip'] = ['20', 1];
    workflow['5'].inputs['clip'] = ['20', 1];
    workflow['7'].inputs['model'] = ['20', 0];
  }

  return workflow;
}

/**
 * Z-Image Simple workflow definition
 */
export const zImageSimpleDefinition: WorkflowDefinition = {
  id: 'z-image-simple',
  name: 'Z-Image Simple (No Custom Nodes)',
  description:
    'Basic Z-Image-Turbo workflow using only built-in ComfyUI nodes. Use when res4lyf nodes are unavailable.',
  requiredModels: {
    diffusion: 'z_image_turbo_bf16.safetensors',
    textEncoder: 'qwen_3_4b.safetensors',
    vae: 'z-image-turbo-vae.safetensors',
  },
  requiredNodes: [], // No custom nodes required
  defaults: {
    width: 1024,
    height: 1024,
    steps: 9,
    cfg: 1.0,
  },
  workflow: buildZImageSimpleWorkflow({
    prompt: '{{prompt}}',
    width: 1024,
    height: 1024,
  }),
};

