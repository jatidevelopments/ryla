/**
 * Z-Image InstantID Workflow
 *
 * InstantID provides better face consistency than PuLID for single-image workflows.
 * Works with Z-Image models and handles extreme angles better than PuLID.
 *
 * REQUIRED SETUP (on ComfyUI pod):
 * 1. Install ComfyUI-InstantID custom nodes:
 *    cd /workspace/ComfyUI/custom_nodes
 *    git clone https://github.com/cubiq/ComfyUI_InstantID.git
 *    pip install -r ComfyUI_InstantID/requirements.txt
 *
 * 2. Download InstantID models:
 *    - ip-adapter.bin (~1.69GB) to models/instantid/
 *    - diffusion_pytorch_model.safetensors (~2.50GB) to models/controlnet/
 *    - InsightFace antelopev2 models to models/insightface/models/
 *
 * @see docs/research/CONSISTENT-IMAGE-GENERATION-METHODS.md
 */

import {
  ComfyUIWorkflow,
  WorkflowDefinition,
  WorkflowBuildOptions,
} from './types';

/** Extended options for InstantID workflow */
export interface InstantIDWorkflowBuildOptions extends WorkflowBuildOptions {
  /** Base64 reference image or filename for face consistency */
  referenceImage?: string;
  /** InstantID strength (0.0-1.0, default 0.8) */
  instantidStrength?: number;
  /** ControlNet strength (0.0-1.0, default 0.8) */
  controlnetStrength?: number;
  /** Face detection provider: 'CPU' or 'GPU' (default: 'CPU') */
  faceProvider?: 'CPU' | 'GPU';
}

/**
 * Build the Z-Image InstantID workflow with face consistency
 * InstantID works better than PuLID for single-image workflows and extreme angles
 */
export function buildZImageInstantIDWorkflow(
  options: InstantIDWorkflowBuildOptions
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
    filenamePrefix = 'ryla_instantid',
    referenceImage,
    instantidStrength = 0.8,
    controlnetStrength = 0.8,
    faceProvider = 'CPU',
  } = options;

  if (!referenceImage) {
    throw new Error('InstantID workflow requires a reference image');
  }

  const workflow: ComfyUIWorkflow = {
    // ============ MODEL LOADERS (Z-Image) ============
    '1': {
      class_type: 'UNETLoader',
      inputs: {
        unet_name: 'z_image_turbo_bf16.safetensors',
        weight_dtype: 'default',
      },
      _meta: { title: 'Load Z-Image Diffusion Model' },
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

    // ============ INSTANTID SETUP ============
    '20': {
      class_type: 'InsightFaceLoader',
      inputs: {
        provider: faceProvider, // CPU is more stable, GPU faster but may OOM
      },
      _meta: { title: 'Load InsightFace' },
    },
    '21': {
      class_type: 'InstantIDModelLoader',
      inputs: {
        instantid_file: 'ip-adapter.bin',
      },
      _meta: { title: 'Load InstantID IP-Adapter' },
    },
    '22': {
      class_type: 'InstantIDControlNetLoader',
      inputs: {
        controlnet_name: 'diffusion_pytorch_model.safetensors',
      },
      _meta: { title: 'Load InstantID ControlNet' },
    },

    // ============ REFERENCE IMAGE ============
    '23': {
      class_type: 'LoadImage',
      inputs: {
        image: referenceImage, // Can be base64 data URL or file path
      },
      _meta: { title: 'Load Reference Image' },
    },

    // ============ APPLY INSTANTID ============
    // ApplyInstantID outputs: [face_embedding, controlnet_conditioning]
    '24': {
      class_type: 'ApplyInstantID',
      inputs: {
        insightface: ['20', 0],
        instantid: ['21', 0],
        controlnet: ['22', 0],
        image: ['23', 0],
        weight: instantidStrength,
        controlnet_conditioning_scale: controlnetStrength,
      },
      _meta: { title: 'Apply InstantID' },
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

    // ============ APPLY INSTANTID TO CONDITIONING ============
    // ApplyInstantID outputs face embedding, we combine it with the prompt
    '25': {
      class_type: 'ConditioningCombine',
      inputs: {
        conditioning_1: ['4', 0], // Text prompt
        conditioning_2: ['24', 0], // InstantID face embedding
      },
      _meta: { title: 'Combine Prompt + InstantID' },
    },

    // ============ APPLY CONTROLNET (if using ControlNet) ============
    // InstantID also provides ControlNet conditioning for better face structure
    '26': {
      class_type: 'ControlNetApplyAdvanced',
      inputs: {
        positive: ['25', 0], // Combined prompt + InstantID face
        negative: ['6', 0],
        control_net: ['22', 0], // InstantID ControlNet
        image: ['24', 1], // ControlNet conditioning from ApplyInstantID
        strength: controlnetStrength,
        start_percent: 0.0,
        end_percent: 1.0,
      },
      _meta: { title: 'Apply InstantID ControlNet' },
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
      class_type: 'KSampler',
      inputs: {
        seed,
        steps,
        cfg,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1.0,
        model: ['1', 0], // Z-Image model
        positive: ['26', 0], // Prompt + InstantID + ControlNet
        negative: ['26', 1], // Negative from ControlNet
        latent_image: ['7', 0],
      },
      _meta: { title: 'KSampler' },
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
        model: ['1', 0],
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
 * Z-Image InstantID workflow definition
 */
export const zImageInstantIDDefinition: WorkflowDefinition = {
  id: 'z-image-instantid',
  name: 'Z-Image with InstantID (Face Consistency)',
  description:
    'Z-Image-Turbo with InstantID for maintaining face/identity consistency. Better than PuLID for single-image workflows and extreme angles.',
  requiredModels: {
    diffusion: 'z_image_turbo_bf16.safetensors',
    textEncoder: 'qwen_3_4b.safetensors',
    vae: 'z-image-turbo-vae.safetensors',
  },
  requiredNodes: [
    'InsightFaceLoader',
    'InstantIDModelLoader',
    'InstantIDControlNetLoader',
    'ApplyInstantID',
    'LoadImage',
    'KSampler',
    'ConditioningCombine',
    'ControlNetApplyAdvanced',
  ],
  defaults: {
    width: 1024,
    height: 1024,
    steps: 20,
    cfg: 1.0,
  },
  workflow: buildZImageInstantIDWorkflow({
    prompt: '{{prompt}}',
    referenceImage: '{{referenceImage}}',
    width: 1024,
    height: 1024,
  }),
};

