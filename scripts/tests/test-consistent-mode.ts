#!/usr/bin/env npx tsx
/**
 * Test Consistent Mode (PuLID) for Image Generation
 *
 * This test script:
 * 1. Checks ComfyUI pod connectivity
 * 2. Verifies required nodes are available
 * 3. Tests reference image upload
 * 4. Tests PuLID workflow generation
 * 5. Executes a full consistent mode generation
 * 6. Provides detailed error diagnostics
 *
 * Usage:
 *   pnpm test:consistent-mode
 *   pnpm test:consistent-mode --image-url <url>
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { buildZImagePuLIDWorkflowWithKSampler } from '@ryla/business';
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

console.log('🧪 Consistent Mode (PuLID) Test\n');
console.log(`📡 ComfyUI Pod: ${COMFYUI_URL}\n`);

const client = new ComfyUIPodClient({ baseUrl: COMFYUI_URL, timeout: 600000 }); // 10 min timeout for PuLID

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
 * Step 2: Check required nodes
 */
async function checkRequiredNodes(): Promise<{ allPresent: boolean; missing: string[] }> {
  console.log('2️⃣  Checking required PuLID nodes...');
  // Using KSampler fallback, so we don't need FixPulidFluxPatch or ClownsharKSampler_Beta
  const requiredNodes = [
    'PulidFluxModelLoader',
    'PulidFluxInsightFaceLoader',
    'PulidFluxEvaClipLoader',
    'ApplyPulidFlux',
    'LoadImage',
    'KSampler', // Using KSampler instead of ClownsharKSampler_Beta
    'UNETLoader',
    'CLIPLoader',
    'VAELoader',
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
        const isCritical = node === 'FixPulidFluxPatch';
        console.log(`      - ${node}${isCritical ? ' ⚠️  CRITICAL - This fixes latent_shapes error!' : ''}`);
      });
      // Note: We're using KSampler fallback, so FixPulidFluxPatch is not required
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

  // Generate a base image first
  console.log('   🎨 Generating base image first...');
  const baseWorkflow = {
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
        seed: Math.floor(Math.random() * 2 ** 32),
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
        filename_prefix: `consistent_test_base_${Date.now()}`,
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
    const filename = `pulid-reference-${timestamp}.png`;
    const uploadedFilename = await client.uploadImage(imageBuffer, filename);
    console.log(`   ✅ Uploaded as: ${uploadedFilename}\n`);
    return uploadedFilename;
  } catch (error) {
    console.log(`   ❌ Upload failed: ${error instanceof Error ? error.message : String(error)}\n`);
    throw error;
  }
}

/**
 * Step 5: Build and validate workflow
 */
function buildAndValidateWorkflow(referenceImageFilename: string) {
  console.log('5️⃣  Building PuLID workflow (KSampler fallback)...');
  try {
    const workflow = buildZImagePuLIDWorkflowWithKSampler({
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
      filenamePrefix: 'consistent_test_result',
    });

    // Validate workflow structure (KSampler version doesn't need nodes 8, 9, 28)
    const requiredNodeIds = ['1', '2', '3', '20', '21', '22', '23', '24', '4', '5', '6', '7', '8', '9', '10'];
    const missingNodes = requiredNodeIds.filter((id) => !workflow[id]);

    if (missingNodes.length > 0) {
      throw new Error(`Workflow missing nodes: ${missingNodes.join(', ')}`);
    }

    console.log(`   ✅ Workflow built successfully (${Object.keys(workflow).length} nodes)\n`);
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
  console.log('6️⃣  Executing PuLID workflow...');
  const startTime = Date.now();

  try {
    const promptId = await client.queueWorkflow(workflow);
    console.log(`   ⏳ Queued: ${promptId}`);
    console.log('   ⏳ Waiting for generation (PuLID can take 3-10 minutes)...');

    // Check status a few times to see progress
    let checkCount = 0;
    const statusCheckInterval = setInterval(async () => {
      checkCount++;
      if (checkCount % 15 === 0) { // Every 30 seconds (15 * 2s)
        try {
          const status = await client.getJobStatus(promptId);
          console.log(`   📊 Status check (${checkCount * 2}s): ${status.status}`);
          if (status.error) {
            console.log(`   ⚠️  Error detected: ${status.error}`);
          }
        } catch (e) {
          // Ignore status check errors
        }
      }
    }, 2000);

    const result = await client.executeWorkflow(workflow, 2000);
    
    clearInterval(statusCheckInterval);

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
    const filename = `consistent-test-result-${Date.now()}-${index + 1}.png`;
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
      console.log('✅ Consistent Mode Test PASSED!\n');
      console.log('📸 Generated images saved to tmp/ directory');
      console.log('='.repeat(60));
    } else {
      console.log('='.repeat(60));
      console.log('❌ Consistent Mode Test FAILED\n');
      console.log(`Error: ${result.error || 'Unknown error'}\n`);
      console.log('Troubleshooting:');
      console.log('1. Check ComfyUI pod logs for detailed errors');
      console.log('2. Verify all required models are installed');
      console.log('3. Check that PuLID custom nodes are properly installed');
      console.log('4. Verify reference image was uploaded correctly');
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

