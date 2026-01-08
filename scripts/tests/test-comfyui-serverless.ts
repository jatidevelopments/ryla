#!/usr/bin/env tsx
/**
 * Test ComfyUI Serverless Endpoint
 * 
 * Tests Z-Image Danrisi workflow on RunPod ComfyUI serverless endpoint.
 * 
 * Usage:
 *   pnpm tsx scripts/tests/test-comfyui-serverless.ts
 * 
 * Requires:
 *   - RUNPOD_API_KEY in environment or .env.local
 *   - RUNPOD_ENDPOINT_COMFYUI (optional, defaults to pwqwwai0hlhtw9)
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { buildZImageDanrisiWorkflow } from '../../libs/business/src/workflows/z-image-danrisi';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const COMFYUI_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_COMFYUI || 'pwqwwai0hlhtw9';

const TEST_PROMPT = 'A beautiful woman, 25 years old, blonde hair, blue eyes, portrait, high quality, professional photography, studio lighting';

interface TestResult {
  endpoint: string;
  endpointId: string;
  success: boolean;
  jobId?: string;
  status?: string;
  error?: string;
  duration?: number;
  coldStartTime?: number;
  executionTime?: number;
  hasImage?: boolean;
  imageCount?: number;
}

/**
 * Submit ComfyUI workflow to serverless endpoint
 */
async function submitComfyUIWorkflow(
  apiKey: string,
  endpointId: string,
  workflow: any
): Promise<string> {
  const response = await fetch(`https://api.runpod.ai/v2/${endpointId}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: {
        workflow: workflow,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Poll for job completion
 */
async function pollJobStatus(
  apiKey: string,
  endpointId: string,
  jobId: string,
  startTime: number
): Promise<TestResult> {
  console.log(`   ⏳ Waiting for completion (this may take 3-5 min for cold start)...`);
  let status = 'IN_QUEUE';
  let attempts = 0;
  const maxAttempts = 120; // 10 minutes max (120 * 5s = 600s)
  let coldStartComplete = false;
  let executionStartTime: number | null = null;

  while (status !== 'COMPLETED' && status !== 'FAILED' && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    attempts++;

    try {
      const statusResponse = await fetch(
        `https://api.runpod.ai/v2/${endpointId}/status/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error(`Failed to get job status: ${statusResponse.statusText}`);
      }

      const jobStatus = await statusResponse.json();
      status = jobStatus.status;

      // Track when we move from IN_QUEUE to IN_PROGRESS (cold start complete)
      if (!coldStartComplete && status === 'IN_PROGRESS') {
        coldStartComplete = true;
        executionStartTime = Date.now();
        const coldStartTime = executionStartTime - startTime;
        console.log(`   🔥 Cold start complete in ${(coldStartTime / 1000).toFixed(1)}s`);
      }

      if (attempts % 12 === 0) {
        // Log every 60 seconds
        console.log(`   ⏳ Status: ${status} (${attempts * 5}s elapsed)...`);
      }

      if (status === 'COMPLETED') {
        const duration = Date.now() - startTime;
        const output = jobStatus.output as any;
        
        // ComfyUI worker returns images in output.images array
        const images = output?.images || [];
        const hasImage = images.length > 0;

        const coldStartTime = coldStartComplete && executionStartTime 
          ? executionStartTime - startTime 
          : undefined;
        const executionTime = executionStartTime 
          ? Date.now() - executionStartTime 
          : undefined;

        console.log(`   ✅ Job completed in ${(duration / 1000).toFixed(1)}s`);
        if (coldStartTime) {
          console.log(`   🔥 Cold start: ${(coldStartTime / 1000).toFixed(1)}s`);
        }
        if (executionTime) {
          console.log(`   ⚡ Execution: ${(executionTime / 1000).toFixed(1)}s`);
        }
        console.log(`   📊 Output keys: ${Object.keys(output || {}).join(', ')}`);
        console.log(`   🖼️  Images generated: ${images.length}`);

        return {
          endpoint: 'ComfyUI Serverless',
          endpointId,
          success: true,
          jobId,
          status,
          duration,
          coldStartTime,
          executionTime,
          hasImage,
          imageCount: images.length,
        };
      }

      if (status === 'FAILED') {
        const error = (jobStatus.output as any)?.error || jobStatus.error || 'Unknown error';
        console.log(`   ❌ Job failed: ${error}`);
        return {
          endpoint: 'ComfyUI Serverless',
          endpointId,
          success: false,
          jobId,
          status,
          error,
          duration: Date.now() - startTime,
        };
      }
    } catch (error: any) {
      console.log(`   ⚠️  Error checking status: ${error.message}`);
      // Continue polling
    }
  }

  // Timeout
  return {
    endpoint: 'ComfyUI Serverless',
    endpointId,
    success: false,
    jobId,
    status: 'TIMEOUT',
    error: `Job did not complete within ${maxAttempts * 5} seconds`,
    duration: Date.now() - startTime,
  };
}

/**
 * Test Z-Image Danrisi workflow on ComfyUI serverless endpoint
 */
async function testComfyUIEndpoint(apiKey: string): Promise<TestResult> {
  const startTime = Date.now();
  console.log(`\n🧪 Testing ComfyUI Serverless Endpoint (${COMFYUI_ENDPOINT_ID})...`);

  try {
    // Build Z-Image Danrisi workflow
    console.log(`   📝 Building Z-Image Danrisi workflow...`);
    const workflow = buildZImageDanrisiWorkflow({
      prompt: TEST_PROMPT,
      negativePrompt: 'blurry, low quality, distorted, ugly, bad anatomy',
      width: 1024,
      height: 1024,
      steps: 20,
      cfg: 1.0,
      seed: 42,
    });

    console.log(`   ✅ Workflow built with ${Object.keys(workflow).length} nodes`);
    console.log(`   📤 Submitting workflow to endpoint...`);

    // Submit workflow
    const jobId = await submitComfyUIWorkflow(apiKey, COMFYUI_ENDPOINT_ID, workflow);
    console.log(`   ✅ Job submitted: ${jobId}`);

    // Poll for completion
    return await pollJobStatus(apiKey, COMFYUI_ENDPOINT_ID, jobId, startTime);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      endpoint: 'ComfyUI Serverless',
      endpointId: COMFYUI_ENDPOINT_ID,
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

async function main() {
  const apiKey = process.env.RUNPOD_API_KEY;
  if (!apiKey) {
    console.error('❌ RUNPOD_API_KEY environment variable is required');
    console.error('   Set it in your .env file or export it:');
    console.error('   export RUNPOD_API_KEY=your_key_here');
    process.exit(1);
  }

  console.log('🚀 ComfyUI Serverless Endpoint Test');
  console.log('====================================');
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`Endpoint ID: ${COMFYUI_ENDPOINT_ID}`);
  console.log(`Workflow: Z-Image Danrisi`);

  const result = await testComfyUIEndpoint(apiKey);

  // Summary
  console.log('\n📊 Test Summary');
  console.log('====================================');
  const icon = result.success ? '✅' : '❌';
  const duration = result.duration ? `${(result.duration / 1000).toFixed(1)}s` : 'N/A';
  console.log(`${icon} ${result.endpoint}: ${result.success ? 'PASS' : 'FAIL'} (${duration})`);
  
  if (result.coldStartTime) {
    console.log(`   🔥 Cold start: ${(result.coldStartTime / 1000).toFixed(1)}s`);
  }
  if (result.executionTime) {
    console.log(`   ⚡ Execution: ${(result.executionTime / 1000).toFixed(1)}s`);
  }
  if (result.imageCount !== undefined) {
    console.log(`   🖼️  Images: ${result.imageCount}`);
  }
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
  if (result.jobId) {
    console.log(`   Job ID: ${result.jobId}`);
  }

  process.exit(result.success ? 0 : 1);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

