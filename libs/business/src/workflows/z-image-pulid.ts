/**
 * Z-Image PuLID Workflow
 *
 * Extends Z-Image-Turbo with PuLID for face/identity consistency.
 * Uses a reference image to maintain the same face across generations.
 *
 * REQUIRED SETUP (on ComfyUI pod):
 * 1. Install ComfyUI-PuLID custom nodes:
 *    cd /workspace/ComfyUI/custom_nodes
 *    git clone https://github.com/cubiq/ComfyUI_PuLID.git
 *    pip install -r ComfyUI_PuLID/requirements.txt
 *
 * 2. Download PuLID models to /workspace/models/pulid/:
 *    - pulid_flux_v0.9.1.safetensors (~1.2GB)
 *    From: https://huggingface.co/huchenlei/PuLID/tree/main
 *
 * 3. Download InsightFace models to /workspace/models/insightface/:
 *    - antelopev2 folder (buffalo_l model)
 *    From: https://huggingface.co/MonsterMMORPG/tools/tree/main
 *
 * 4. Download EVA CLIP to /workspace/models/clip/:
 *    - eva02_clip_l_14_plus.safetensors (~700MB)
 *    From: https://huggingface.co/QuanSun/EVA-CLIP/tree/main
 *
 * @see docs/ops/runpod/PULID-SETUP.md
 */

import {
  ComfyUIWorkflow,
  WorkflowDefinition,
  WorkflowBuildOptions,
} from './types';

/** Extended options for PuLID workflow */
export interface PuLIDWorkflowBuildOptions extends WorkflowBuildOptions {
  /** Base64 reference image for face consistency */
  referenceImage?: string;
  /** PuLID strength (0.0-1.0, default 0.8) */
  pulidStrength?: number;
  /** Start applying PuLID at this step percentage (0.0-1.0) */
  pulidStart?: number;
  /** Stop applying PuLID at this step percentage (0.0-1.0) */
  pulidEnd?: number;
}

/**
 * Build the Z-Image PuLID workflow with face consistency
 */
export function buildZImagePuLIDWorkflow(
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
    pulidEnd = 1.0,
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
    // Use LoadImage with base64 data URL (ComfyUI supports data: URLs)
    // Alternative: If ETN_LoadImageBase64 is not available, use standard LoadImage
    // with a file path after uploading the image to ComfyUI's input folder
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
        pulid_flux: ['20', 0], // Correct input name (not 'pulid')
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

    // ============ SAMPLING ============
    '8': {
      class_type: 'BetaSamplingScheduler',
      inputs: {
        model: ['28', 0], // Use patched PuLID-modified model
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
        start: 0.996,
        end: 0,
      },
      _meta: { title: 'Sigmas Rescale' },
    },
    '10': {
      class_type: 'ClownsharKSampler_Beta',
      inputs: {
        eta: 0.5,
        sampler_name: 'linear/ralston_2s',
        scheduler: 'beta',
        steps,
        steps_to_run: -1,
        denoise: 1.0,
        cfg,
        seed,
        sampler_mode: 'standard',
        bongmath: true,
        model: ['28', 0], // Use patched PuLID-modified model
        positive: ['4', 0],
        negative: ['6', 0],
        latent_image: ['7', 0],
        sigmas: ['9', 0],
      },
      _meta: { title: 'ClownsharK Sampler' },
    },

    // ============ DECODE AND SAVE ============
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
    workflow['10'].inputs['model'] = ['30', 0];
  }

  return workflow;
}

/**
 * Z-Image PuLID workflow definition
 */
export const zImagePuLIDDefinition: WorkflowDefinition = {
  id: 'z-image-pulid',
  name: 'Z-Image with PuLID (Face Consistency)',
  description:
    'Z-Image-Turbo with PuLID for maintaining face/identity consistency from a reference image. Requires ComfyUI-PuLID custom nodes.',
  requiredModels: {
    diffusion: 'z_image_turbo_bf16.safetensors',
    textEncoder: 'qwen_3_4b.safetensors',
    vae: 'z-image-turbo-vae.safetensors',
  },
  // PuLID custom nodes (from ComfyUI_PuLID package)
  requiredNodes: [
    'PulidFluxModelLoader',
    'PulidFluxInsightFaceLoader',
    'PulidFluxEvaClipLoader',
    'ApplyPulidFlux',
    'FixPulidFluxPatch',
    'LoadImage', // For loading reference images (standard ComfyUI node)
    // Also requires res4lyf nodes
    'ClownsharKSampler_Beta',
    'Sigmas Rescale',
    'BetaSamplingScheduler',
  ],
  defaults: {
    width: 1024,
    height: 1024,
    steps: 20,
    cfg: 1.0,
  },
  workflow: buildZImagePuLIDWorkflow({
    prompt: '{{prompt}}',
    referenceImage: '{{referenceImage}}',
    width: 1024,
    height: 1024,
  }),
};

/**
 * Additional models required for PuLID (not in standard Z-Image)
 */
export const PULID_REQUIRED_MODELS = {
  pulid: {
    name: 'pulid_flux_v0.9.1.safetensors',
    url: 'https://huggingface.co/huchenlei/PuLID/resolve/main/pulid_flux_v0.9.1.safetensors',
    size: '1.2GB',
    path: 'models/pulid/',
  },
  evaClip: {
    name: 'eva02_clip_l_14_plus.safetensors',
    url: 'https://huggingface.co/QuanSun/EVA-CLIP/resolve/main/EVA02_CLIP_L_336_psz14_s6B.pt',
    size: '700MB',
    path: 'models/clip/',
  },
  insightface: {
    name: 'antelopev2',
    url: 'https://huggingface.co/MonsterMMORPG/tools/tree/main/antelopev2',
    size: '360MB',
    path: 'models/insightface/models/',
  },
};

