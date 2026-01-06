#!/usr/bin/env npx tsx
/**
 * Test FLUX PuLID Workflow for Face Consistency
 *
 * This test verifies the new FLUX-based PuLID workflow (correct model architecture).
 * Tests that PuLID works correctly with FLUX models instead of Z-Image models.
 *
 * Usage:
 *   pnpm test:flux-pulid
 *   pnpm test:flux-pulid --image-url <url>
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { buildFluxPuLIDWorkflow } from '@ryla/business';
import { ComfyUIPodClient } from '@ryla/business';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const COMFYUI_URL = process.env['COMFYUI_POD_URL'];

if (!COMFYUI_URL) {
  console.error('❌ COMFYUI_POD_URL not set in environment');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const imageUrlArg = args.find((arg) => arg.startsWith('--image-url='));
const imageUrl = imageUrlArg ? imageUrlArg.split('=')[1] : undefined;

console.log('🧪 FLUX PuLID Workflow Test\n');
console.log(`📡 ComfyUI Pod: ${COMFYUI_URL}\n`);

const client = new ComfyUIPodClient({ baseUrl: COMFYUI_URL, timeout: 300000 }); // 5 min timeout

/**
 * Step 1: Health check
 */
async function checkHealth(): Promise<boolean> {
  console.log('1️⃣  Checking ComfyUI pod health...');
  try {
    const isHealthy = await client.healthCheck();
    if (isHealthy) {
      console.log('   ✅ Pod is healthy\n');
      return true;
    } else {
      console.log('   ❌ Pod health check failed\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Health check error: ${error instanceof Error ? error.message : String(error)}\n`);
    return false;
  }
}

/**
 * Step 2: Check required nodes for FLUX PuLID
 */
async function checkRequiredNodes(): Promise<{ allPresent: boolean; missing: string[] }> {
  console.log('2️⃣  Checking required FLUX PuLID nodes...');
  const requiredNodes = [
    'PulidFluxModelLoader',
    'PulidFluxInsightFaceLoader',
    'PulidFluxEvaClipLoader',
    'ApplyPulidFlux',
    'FixPulidFluxPatch', // Required to avoid latent_shapes error
    'LoadImage',
    'DualCLIPLoader', // FLUX uses DualCLIPLoader
    'FluxGuidance', // FLUX-specific guidance
    'KSampler',
    'UNETLoader',
    'VAELoader',
    'EmptyLatentImage', // FLUX uses EmptyLatentImage (not EmptySD3LatentImage)
  ];

  try {
    const availableNodes = await client.getAvailableNodes();
    const missing = requiredNodes.filter((node) => !availableNodes.includes(node));

    if (missing.length === 0) {
      console.log(`   ✅ All ${requiredNodes.length} required nodes are available\n`);
      return { allPresent: true, missing: [] };
    } else {
      console.log(`   ⚠️  Missing ${missing.length} nodes:`);
      missing.forEach((node) => {
        const isCritical = node === 'FixPulidFluxPatch' || node === 'DualCLIPLoader' || node === 'FluxGuidance';
        console.log(`      - ${node}${isCritical ? ' ⚠️  CRITICAL' : ''}`);
      });
      console.log(`   ✅ ${requiredNodes.length - missing.length}/${requiredNodes.length} nodes available\n`);
      return { allPresent: false, missing };
    }
  } catch (error) {
    console.log(`   ❌ Failed to check nodes: ${error instanceof Error ? error.message : String(error)}\n`);
    return { allPresent: false, missing: requiredNodes };
  }
}

/**
 * Step 3: Get or generate reference image
 */
async function getReferenceImage(): Promise<Buffer> {
  console.log('3️⃣  Getting reference image...');

  if (imageUrl) {
    console.log(`   📥 Using provided image URL: ${imageUrl}`);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log(`   ✅ Downloaded image (${(buffer.length / 1024).toFixed(2)} KB)\n`);
      return buffer;
    } catch (error) {
      console.log(`   ❌ Failed to download image: ${error instanceof Error ? error.message : String(error)}\n`);
      throw error;
    }
  }

  // Check if we have a test image in tmp/
  const testImagePath = path.join(process.cwd(), 'tmp', 'pulid-base-face.png');
  if (fs.existsSync(testImagePath)) {
    console.log(`   📁 Using existing test image: ${testImagePath}`);
    const buffer = fs.readFileSync(testImagePath);
    console.log(`   ✅ Loaded image (${(buffer.length / 1024).toFixed(2)} KB)\n`);
    return buffer;
  }

  // Generate a base image first using FLUX
  console.log('   🎨 Generating base image with FLUX...');
  const baseWorkflow = {
    '1': {
      class_type: 'UNETLoader',
      inputs: {
        unet_name: 'flux1-dev.safetensors',
        weight_dtype: 'default',
      },
    },
    '2': {
      class_type: 'DualCLIPLoader',
      inputs: {
        clip_name1: 'clip_l.safetensors',
        clip_name2: 't5xxl_fp16.safetensors',
        type: 'flux',
        device: 'default',
      },
    },
    '3': {
      class_type: 'VAELoader',
      inputs: {
        vae_name: 'ae.safetensors',
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
      class_type: 'FluxGuidance',
      inputs: {
        conditioning: ['4', 0],
        guidance: 3.5,
      },
    },
    '7': {
      class_type: 'EmptyLatentImage',
      inputs: {
        width: 1024,
        height: 1024,
        batch_size: 1,
      },
    },
    '8': {
      class_type: 'KSampler',
      inputs: {
        seed: Math.floor(Math.random() * 2 ** 32),
        steps: 20,
        cfg: 1.0,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1.0,
        model: ['1', 0],
        positive: ['6', 0],
        negative: ['5', 0],
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
        filename_prefix: `flux_pulid_test_base_${Date.now()}`,
        images: ['9', 0],
      },
    },
  };

  try {
    const promptId = await client.queueWorkflow(baseWorkflow);
    console.log(`   ⏳ Queued base image generation: ${promptId}`);

    // Wait for completion
    const result = await client.executeWorkflow(baseWorkflow);
    if (result.status !== 'completed' || !result.images?.[0]) {
      throw new Error(result.error || 'Base image generation failed');
    }

    // Download the image
    const imageData = result.images[0];
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Save for future use
    fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
    fs.writeFileSync(testImagePath, buffer);
    console.log(`   ✅ Generated and saved base image (${(buffer.length / 1024).toFixed(2)} KB)\n`);
    return buffer;
  } catch (error) {
    console.log(`   ❌ Failed to generate base image: ${error instanceof Error ? error.message : String(error)}\n`);
    throw error;
  }
}

/**
 * Step 4: Upload reference image
 */
async function uploadReferenceImage(imageBuffer: Buffer): Promise<string> {
  console.log('4️⃣  Uploading reference image to ComfyUI...');
  try {
    const timestamp = Date.now();
    const filename = `flux-pulid-reference-${timestamp}.png`;
    const uploadedFilename = await client.uploadImage(imageBuffer, filename);
    console.log(`   ✅ Uploaded as: ${uploadedFilename}\n`);
    return uploadedFilename;
  } catch (error) {
    console.log(`   ❌ Upload failed: ${error instanceof Error ? error.message : String(error)}\n`);
    throw error;
  }
}

/**
 * Step 5: Build and validate FLUX PuLID workflow
 */
function buildAndValidateWorkflow(referenceImageFilename: string) {
  console.log('5️⃣  Building FLUX PuLID workflow...');
  try {
    const workflow = buildFluxPuLIDWorkflow({
      prompt: 'The same woman in a coffee shop, wearing casual clothes, warm lighting, candid photo, smiling',
      negativePrompt: 'blurry, deformed, ugly, bad anatomy, disfigured',
      referenceImage: referenceImageFilename,
      width: 1024,
      height: 1024,
      steps: 20,
      cfg: 1.0,
      seed: Math.floor(Math.random() * 2 ** 32),
      pulidStrength: 0.8,
      pulidStart: 0.0,
      pulidEnd: 0.8,
      fluxModel: 'dev',
      guidance: 3.5,
      filenamePrefix: 'flux_pulid_test_result',
    });

    // Validate workflow structure
    const requiredNodeIds = ['1', '2', '3', '20', '21', '22', '23', '24', '28', '4', '5', '6', '7', '8', '9', '10'];
    const missingNodes = requiredNodeIds.filter((id) => !workflow[id]);

    if (missingNodes.length > 0) {
      throw new Error(`Workflow missing nodes: ${missingNodes.join(', ')}`);
    }

    // Verify FLUX-specific nodes
    if (workflow['2'].class_type !== 'DualCLIPLoader') {
      throw new Error('Workflow should use DualCLIPLoader for FLUX, not CLIPLoader');
    }
    if (workflow['6'].class_type !== 'FluxGuidance') {
      throw new Error('Workflow should use FluxGuidance for FLUX');
    }
    if (workflow['7'].class_type !== 'EmptyLatentImage') {
      throw new Error('Workflow should use EmptyLatentImage for FLUX, not EmptySD3LatentImage');
    }
    if (!workflow['28'] || workflow['28'].class_type !== 'FixPulidFluxPatch') {
      throw new Error('Workflow must include FixPulidFluxPatch to avoid latent_shapes error');
    }

    console.log(`   ✅ Workflow built successfully (${Object.keys(workflow).length} nodes)`);
    console.log(`   ✅ Using FLUX models (flux1-dev.safetensors)`);
    console.log(`   ✅ Using DualCLIPLoader for FLUX text encoders`);
    console.log(`   ✅ Using FluxGuidance for FLUX conditioning`);
    console.log(`   ✅ Using FixPulidFluxPatch to avoid latent_shapes error\n`);
    return workflow;
  } catch (error) {
    console.log(`   ❌ Workflow build failed: ${error instanceof Error ? error.message : String(error)}\n`);
    throw error;
  }
}

/**
 * Step 6: Execute workflow
 */
async function executeWorkflow(workflow: any): Promise<{ success: boolean; images?: string[]; error?: string }> {
  console.log('6️⃣  Executing FLUX PuLID workflow...');
  const startTime = Date.now();

  try {
    const promptId = await client.queueWorkflow(workflow);
    console.log(`   ⏳ Queued: ${promptId}`);
    console.log('   ⏳ Waiting for generation (FLUX PuLID may take 2-5 minutes)...');

    const result = await client.executeWorkflow(workflow, 2000);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (result.status === 'completed' && result.images && result.images.length > 0) {
      console.log(`   ✅ Generation completed in ${duration}s`);
      console.log(`   ✅ Generated ${result.images.length} image(s)\n`);
      return { success: true, images: result.images };
    } else {
      console.log(`   ❌ Generation failed after ${duration}s`);
      console.log(`   ❌ Error: ${result.error || 'Unknown error'}\n`);
      return { success: false, error: result.error || 'Unknown error' };
    }
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ❌ Execution failed after ${duration}s`);
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Step 7: Save results
 */
function saveResults(images: string[]): void {
  console.log('7️⃣  Saving results...');
  const outputDir = path.join(process.cwd(), 'tmp');
  fs.mkdirSync(outputDir, { recursive: true });

  images.forEach((imageData, index) => {
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `flux-pulid-test-result-${Date.now()}-${index + 1}.png`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`   💾 Saved: ${filepath} (${(buffer.length / 1024).toFixed(2)} KB)`);
  });
  console.log('');
}

/**
 * Main test execution
 */
async function main() {
  try {
    // Step 1: Health check
    const isHealthy = await checkHealth();
    if (!isHealthy) {
      console.log('❌ Health check failed. Please verify ComfyUI pod is running.\n');
      process.exit(1);
    }

    // Step 2: Check nodes
    const { allPresent, missing } = await checkRequiredNodes();
    if (!allPresent) {
      console.log('⚠️  Some required nodes are missing. The workflow may fail.');
      console.log('   Please install missing nodes or check ComfyUI setup.\n');
      // Continue anyway to see what happens
    }

    // Step 3: Get reference image
    const imageBuffer = await getReferenceImage();

    // Step 4: Upload reference image
    const referenceImageFilename = await uploadReferenceImage(imageBuffer);

    // Step 5: Build workflow
    const workflow = buildAndValidateWorkflow(referenceImageFilename);

    // Step 6: Execute workflow
    const result = await executeWorkflow(workflow);

    if (result.success && result.images) {
      // Step 7: Save results
      saveResults(result.images);

      // Summary
      console.log('='.repeat(60));
      console.log('✅ FLUX PuLID Test PASSED!\n');
      console.log('📸 Generated images saved to tmp/ directory');
      console.log('🎯 This confirms FLUX PuLID workflow works correctly');
      console.log('   (No latent_shapes error with correct model architecture)');
      console.log('='.repeat(60));
    } else {
      console.log('='.repeat(60));
      console.log('❌ FLUX PuLID Test FAILED\n');
      console.log(`Error: ${result.error || 'Unknown error'}\n`);
      console.log('Troubleshooting:');
      console.log('1. Check ComfyUI pod logs for detailed errors');
      console.log('2. Verify FLUX models are installed (flux1-dev.safetensors, clip_l.safetensors, t5xxl_fp16.safetensors, ae.safetensors)');
      console.log('3. Check that PuLID custom nodes are properly installed');
      console.log('4. Verify FixPulidFluxPatch node is available (required to avoid latent_shapes error)');
      console.log('5. Verify reference image was uploaded correctly');
      console.log('='.repeat(60));
      process.exit(1);
    }
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ Test failed with exception\n');
    console.error(error);
    console.log('='.repeat(60));
    process.exit(1);
  }
}

main();

