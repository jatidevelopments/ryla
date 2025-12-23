/**
 * Z-Image Danrisi Modified Loaders Workflow
 *
 * Optimized workflow for Z-Image-Turbo using:
 * - ClownsharKSampler_Beta (res4lyf) for better sampling
 * - BetaSamplingScheduler with Sigmas Rescale for faster convergence
 * - FluxResolutionNode for aspect ratio presets
 * - Optional LoRA support
 *
 * Source: https://www.youtube.com/watch?v=-u9VLMVwDXM
 * @see docs/research/youtube-videos/-u9VLMVwDXM/Z-Image_Danrisi_modified_loaders.json
 */

import {
  ComfyUIWorkflow,
  WorkflowDefinition,
  WorkflowBuildOptions,
} from './types';

/**
 * Build the Z-Image Danrisi workflow with custom parameters
 */
export function buildZImageDanrisiWorkflow(
  options: WorkflowBuildOptions
): ComfyUIWorkflow {
  const {
    prompt,
    negativePrompt = '',
    width = 1024,
    height = 1024,
    steps = 20,
    cfg = 1.0, // Danrisi uses cfg=1, NOT 0.5
    seed = Math.floor(Math.random() * 2 ** 32),
    lora,
    filenamePrefix = 'ryla_output',
  } = options;

  // Base workflow without LoRA
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
        type: 'lumina2', // Important: Danrisi uses lumina2, not sd3
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
        clip: ['2', 0], // References node 2, output 0
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

    // Latent Image
    '7': {
      class_type: 'EmptySD3LatentImage',
      inputs: {
        width,
        height,
        batch_size: 1,
      },
      _meta: { title: 'Empty Latent' },
    },

    // Sampling (Danrisi optimized)
    '8': {
      class_type: 'BetaSamplingScheduler',
      inputs: {
        model: ['1', 0],
        steps,
        alpha: 0.4,
        beta: 0.4,
      },
      _meta: { title: 'Beta Scheduler' },
    },
    '9': {
      class_type: 'Sigmas Rescale',
      inputs: {
        sigmas: ['8', 0],
        start: 0.996, // rescale start
        end: 0, // rescale end
      },
      _meta: { title: 'Sigmas Rescale' },
    },
    '10': {
      class_type: 'ClownsharKSampler_Beta',
      inputs: {
        // Required widget inputs (order matters!)
        eta: 0.5,
        sampler_name: 'linear/ralston_2s', // From original workflow
        scheduler: 'beta', // Uses beta scheduler from BetaSamplingScheduler
        steps,
        steps_to_run: -1, // -1 means run all steps
        denoise: 1.0,
        cfg, // 1.0 from original workflow
        seed,
        sampler_mode: 'standard',
        bongmath: true,
        // Optional connected inputs
        model: ['1', 0],
        positive: ['4', 0],
        negative: ['6', 0],
        latent_image: ['7', 0],
        sigmas: ['9', 0], // Rescaled sigmas from BetaSamplingScheduler
      },
      _meta: { title: 'ClownsharK Sampler' },
    },

    // Decode and Save
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

  // If LoRA is specified, insert it between model loaders and sampler
  if (lora) {
    // Insert LoRA loader
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

    // Update references to use LoRA output instead of direct model
    workflow['4'].inputs['clip'] = ['20', 1]; // CLIP from LoRA
    workflow['5'].inputs['clip'] = ['20', 1];
    workflow['8'].inputs['model'] = ['20', 0]; // Model from LoRA
    workflow['10'].inputs['model'] = ['20', 0];
  }

  return workflow;
}

/**
 * Z-Image Danrisi workflow definition
 */
export const zImageDanrisiDefinition: WorkflowDefinition = {
  id: 'z-image-danrisi',
  name: 'Z-Image Danrisi Modified Loaders',
  description:
    'Optimized Z-Image-Turbo workflow with ClownsharKSampler_Beta, BetaSamplingScheduler, and Sigmas Rescale. Requires res4lyf custom nodes.',
  requiredModels: {
    diffusion: 'z_image_turbo_bf16.safetensors',
    textEncoder: 'qwen_3_4b.safetensors',
    vae: 'z-image-turbo-vae.safetensors',
  },
  // These are actual node class_types from res4lyf package (not package names)
  requiredNodes: ['ClownsharKSampler_Beta', 'Sigmas Rescale', 'BetaSamplingScheduler'],
  defaults: {
    width: 1024,
    height: 1024,
    steps: 20,
    cfg: 1.0, // Danrisi uses cfg=1
  },
  workflow: buildZImageDanrisiWorkflow({
    prompt: '{{prompt}}',
    width: 1024,
    height: 1024,
  }),
};
