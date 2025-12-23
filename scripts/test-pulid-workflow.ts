#!/usr/bin/env npx tsx
/**
 * Test PuLID Workflow for Face Consistency
 *
 * This test:
 * 1. Generates a base face image using z-image-simple
 * 2. Uses that face as reference with PuLID to generate a new image
 * 3. Verifies the face is consistent
 *
 * Usage:
 *   pnpm test:pulid
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const COMFYUI_URL = process.env['COMFYUI_POD_URL'];

if (!COMFYUI_URL) {
  console.error('❌ COMFYUI_POD_URL not set');
  process.exit(1);
}

console.log('🧪 PuLID Face Consistency Test\n');
console.log(`📡 ComfyUI: ${COMFYUI_URL}\n`);

interface ComfyUIWorkflow {
  [key: string]: {
    class_type: string;
    inputs: Record<string, unknown>;
    _meta?: { title?: string };
  };
}

/**
 * Step 1: Generate a base face image
 */
function buildBaseImageWorkflow(): ComfyUIWorkflow {
  return {
    '1': {
      class_type: 'UNETLoader',
      inputs: {
        unet_name: 'z_image_turbo_bf16.safetensors',
        weight_dtype: 'default',
      },
    },
    '2': {
      class_type: 'CLIPLoader',
      inputs: {
        clip_name: 'qwen_3_4b.safetensors',
        type: 'lumina2',
        device: 'default',
      },
    },
    '3': {
      class_type: 'VAELoader',
      inputs: {
        vae_name: 'z-image-turbo-vae.safetensors',
      },
    },
    '4': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: 'A beautiful 25 year old woman with long brown hair, green eyes, soft smile, professional headshot, neutral background, high quality, detailed face',
        clip: ['2', 0],
      },
    },
    '5': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: 'blurry, deformed, ugly, bad anatomy, disfigured',
        clip: ['2', 0],
      },
    },
    '6': {
      class_type: 'ConditioningZeroOut',
      inputs: {
        conditioning: ['5', 0],
      },
    },
    '7': {
      class_type: 'EmptySD3LatentImage',
      inputs: {
        width: 1024,
        height: 1024,
        batch_size: 1,
      },
    },
    '8': {
      class_type: 'KSampler',
      inputs: {
        seed: Math.floor(Math.random() * 2 ** 32), // Random seed to avoid caching
        steps: 20,
        cfg: 1.0,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1.0,
        model: ['1', 0],
        positive: ['4', 0],
        negative: ['6', 0],
        latent_image: ['7', 0],
      },
    },
    '9': {
      class_type: 'VAEDecode',
      inputs: {
        samples: ['8', 0],
        vae: ['3', 0],
      },
    },
    '10': {
      class_type: 'SaveImage',
      inputs: {
        filename_prefix: `pulid_base_${Date.now()}`,
        images: ['9', 0],
      },
    },
  };
}

/**
 * Step 2: Use the face with PuLID to generate in a new scene
 */
function buildPuLIDWorkflow(referenceImageFilename: string): ComfyUIWorkflow {
  return {
    // Model Loaders
    '1': {
      class_type: 'UNETLoader',
      inputs: {
        unet_name: 'z_image_turbo_bf16.safetensors',
        weight_dtype: 'default',
      },
    },
    '2': {
      class_type: 'CLIPLoader',
      inputs: {
        clip_name: 'qwen_3_4b.safetensors',
        type: 'lumina2',
        device: 'default',
      },
    },
    '3': {
      class_type: 'VAELoader',
      inputs: {
        vae_name: 'z-image-turbo-vae.safetensors',
      },
    },

    // PuLID Setup
    '20': {
      class_type: 'PulidFluxModelLoader',
      inputs: {
        pulid_file: 'pulid_flux_v0.9.1.safetensors',
      },
    },
    '21': {
      class_type: 'PulidFluxInsightFaceLoader',
      inputs: {
        provider: 'CPU',
      },
    },
    '22': {
      class_type: 'PulidFluxEvaClipLoader',
      inputs: {},
    },

    // Load the reference face image we generated
    '23': {
      class_type: 'LoadImage',
      inputs: {
        image: referenceImageFilename,
      },
    },

    // Apply PuLID to preserve face
    '24': {
      class_type: 'ApplyPulidFlux',
      inputs: {
        model: ['1', 0],
        pulid_flux: ['20', 0], // Corrected input name
        eva_clip: ['22', 0],
        face_analysis: ['21', 0],
        image: ['23', 0],
        weight: 0.8,
        start_at: 0.0,
        end_at: 1.0,
      },
    },
    
    // Fix PuLID compatibility with latest ComfyUI samplers
    '28': {
      class_type: 'FixPulidFluxPatch',
      inputs: {
        model: ['24', 0],
      },
    },

    // New prompt - different scene, same face
    '4': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: 'The same woman in a coffee shop, wearing casual clothes, warm lighting, candid photo, smiling',
        clip: ['2', 0],
      },
    },
    '5': {
      class_type: 'CLIPTextEncode',
      inputs: {
        text: 'blurry, deformed, ugly, bad anatomy',
        clip: ['2', 0],
      },
    },
    '6': {
      class_type: 'ConditioningZeroOut',
      inputs: {
        conditioning: ['5', 0],
      },
    },
    '7': {
      class_type: 'EmptySD3LatentImage',
      inputs: {
        width: 1024,
        height: 1024,
        batch_size: 1,
      },
    },

    // Sampling with PuLID-fixed model using standard KSampler
    '8': {
      class_type: 'KSampler',
      inputs: {
        seed: Math.floor(Math.random() * 2 ** 32),
        steps: 20,
        cfg: 1.0,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1.0,
        model: ['28', 0], // PuLID-modified AND fixed model
        positive: ['4', 0],
        negative: ['6', 0],
        latent_image: ['7', 0],
      },
    },
    '9': {
      class_type: 'VAEDecode',
      inputs: {
        samples: ['8', 0],
        vae: ['3', 0],
      },
    },
    '10': {
      class_type: 'SaveImage',
      inputs: {
        filename_prefix: 'pulid_consistent_face',
        images: ['9', 0],
      },
    },
  };
}

async function queueWorkflow(workflow: ComfyUIWorkflow): Promise<string> {
  const response = await fetch(`${COMFYUI_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Queue failed: ${error}`);
  }

  const data = (await response.json()) as { prompt_id: string };
  return data.prompt_id;
}

async function waitForCompletion(promptId: string, maxWaitMs = 180000): Promise<{
  status: 'success' | 'error';
  images?: Array<{ filename: string; subfolder: string; type: string }>;
  error?: string;
}> {
  const startTime = Date.now();
  const pollInterval = 2000;

  while (Date.now() - startTime < maxWaitMs) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const response = await fetch(`${COMFYUI_URL}/history/${promptId}`);
    if (!response.ok) continue;

    const history = (await response.json()) as Record<
      string,
      {
        status?: { completed: boolean; status_str: string };
        outputs?: Record<string, { images?: Array<{ filename: string; subfolder: string; type: string }> }>;
      }
    >;

    const item = history[promptId];
    if (!item?.status?.completed) continue;

    if (item.status.status_str === 'success') {
      const images = Object.values(item.outputs || {}).flatMap((o) => o.images || []);
      return { status: 'success', images };
    } else {
      return { status: 'error', error: item.status.status_str };
    }
  }

  return { status: 'error', error: 'Timeout' };
}

async function downloadImage(filename: string, subfolder: string, type: string): Promise<Buffer> {
  const url = `${COMFYUI_URL}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${encodeURIComponent(type)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

async function uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append('image', new Blob([imageBuffer], { type: 'image/png' }), filename);
  formData.append('subfolder', '');
  formData.append('type', 'input');

  const response = await fetch(`${COMFYUI_URL}/upload/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const result = (await response.json()) as { name: string };
  return result.name;
}

async function main() {
  const outputDir = path.join(process.cwd(), 'tmp');
  fs.mkdirSync(outputDir, { recursive: true });

  // Step 1: Generate base face
  console.log('1️⃣  Generating base face image...');
  const baseWorkflow = buildBaseImageWorkflow();
  const basePromptId = await queueWorkflow(baseWorkflow);
  console.log(`   ✅ Queued: ${basePromptId}`);

  console.log('   ⏳ Waiting for generation...');
  const baseResult = await waitForCompletion(basePromptId);

  if (baseResult.status !== 'success' || !baseResult.images?.length) {
    console.log(`   ❌ Base image failed: ${baseResult.error}`);
    process.exit(1);
  }

  const baseImage = baseResult.images[0];
  console.log(`   ✅ Generated: ${baseImage.filename}`);

  // Save base image locally
  const baseBuffer = await downloadImage(baseImage.filename, baseImage.subfolder, baseImage.type);
  const basePath = path.join(outputDir, 'pulid-base-face.png');
  fs.writeFileSync(basePath, baseBuffer);
  console.log(`   💾 Saved: ${basePath}`);

  // Upload the base image to ComfyUI input folder for PuLID
  console.log('   📤 Uploading to ComfyUI input folder...');
  const uploadedImageName = await uploadImage(baseBuffer, 'pulid-reference.png');
  console.log(`   ✅ Uploaded as: ${uploadedImageName}`);

  // Step 2: Use PuLID with the face reference
  console.log('\n2️⃣  Generating with PuLID face consistency...');
  const pulidWorkflow = buildPuLIDWorkflow(uploadedImageName);
  const pulidPromptId = await queueWorkflow(pulidWorkflow);
  console.log(`   ✅ Queued: ${pulidPromptId}`);

  console.log('   ⏳ Waiting for generation (PuLID takes longer)...');
  const pulidResult = await waitForCompletion(pulidPromptId, 300000); // 5 min timeout

  if (pulidResult.status !== 'success' || !pulidResult.images?.length) {
    console.log(`   ❌ PuLID generation failed: ${pulidResult.error}`);
    process.exit(1);
  }

  const pulidImage = pulidResult.images[0];
  console.log(`   ✅ Generated: ${pulidImage.filename}`);

  // Save PuLID result locally
  const pulidBuffer = await downloadImage(pulidImage.filename, pulidImage.subfolder, pulidImage.type);
  const pulidPath = path.join(outputDir, 'pulid-consistent-face.png');
  fs.writeFileSync(pulidPath, pulidBuffer);
  console.log(`   💾 Saved: ${pulidPath}`);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ PuLID Test Complete!\n');
  console.log('📸 Compare these images to verify face consistency:');
  console.log(`   1. Base face:      ${basePath}`);
  console.log(`   2. Same face, new scene: ${pulidPath}`);
  console.log('\n' + '='.repeat(50));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

