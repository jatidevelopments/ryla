#!/usr/bin/env tsx
/**
 * Test RunPod Serverless Endpoints
 * 
 * Usage:
 *   pnpm tsx scripts/test-runpod-endpoints.ts [flux|z-image|both]
 * 
 * Requires:
 *   - RUNPOD_API_KEY in environment or .env.local
 *   - RUNPOD_ENDPOINT_FLUX_DEV (optional, defaults to jpcxjab2zpro19)
 *   - RUNPOD_ENDPOINT_Z_IMAGE_TURBO (optional, defaults to xqs8k7yhabwh0k)
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local or .env
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const FLUX_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_FLUX_DEV || 'jpcxjab2zpro19';
const Z_IMAGE_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_Z_IMAGE_TURBO || 'xqs8k7yhabwh0k';

const TEST_PROMPT = 'A beautiful woman, 25 years old, blonde hair, blue eyes, portrait, high quality, professional photography';

interface TestResult {
  endpoint: string;
  endpointId: string;
  success: boolean;
  jobId?: string;
  status?: string;
  error?: string;
  duration?: number;
  hasImage?: boolean;
}

async function testEndpoint(
  apiKey: string,
  endpointId: string,
  endpointName: string,
  taskType: string = 'base_image'
): Promise<TestResult> {
  const startTime = Date.now();
  console.log(`\n🧪 Testing ${endpointName} (${endpointId})...`);

  try {
    // Submit job using REST API
    const input = {
      task_type: taskType,
      prompt: TEST_PROMPT,
      nsfw: false,
      num_images: 1,
      seed: 42,
    };

    console.log(`   📤 Submitting job...`);
    // RunPod serverless uses REST API: https://api.runpod.ai/v2/{endpoint_id}/run
    const runResponse = await fetch(`https://api.runpod.ai/v2/${endpointId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input }),
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      throw new Error(`HTTP ${runResponse.status}: ${errorText}`);
    }

    const runData = await runResponse.json();
    const jobId = runData.id;
    console.log(`   ✅ Job submitted: ${jobId}`);
    return await pollJobStatus(apiKey, endpointId, jobId, startTime, endpointName);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      endpoint: endpointName,
      endpointId,
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

async function pollJobStatus(
  apiKey: string,
  endpointId: string,
  jobId: string,
  startTime: number,
  endpointName: string
): Promise<TestResult> {
  // Poll for completion
  console.log(`   ⏳ Waiting for completion (this may take 30-60s for cold start)...`);
  let status = 'IN_QUEUE';
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max (60 * 5s = 300s)

  while (status !== 'COMPLETED' && status !== 'FAILED' && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    attempts++;

    try {
      // Get job status using REST API: https://api.runpod.ai/v2/{endpoint_id}/status/{job_id}
      const statusResponse = await fetch(`https://api.runpod.ai/v2/${endpointId}/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to get job status: ${statusResponse.statusText}`);
      }

      const jobStatus = await statusResponse.json();
      status = jobStatus.status;

      if (attempts % 6 === 0) {
        // Log every 30 seconds
        console.log(`   ⏳ Status: ${status} (${attempts * 5}s elapsed)...`);
      }

      if (status === 'COMPLETED') {
        const duration = Date.now() - startTime;
        const output = jobStatus.output as any;
        const hasImage = !!(output?.image || output?.images);

        console.log(`   ✅ Job completed in ${(duration / 1000).toFixed(1)}s`);
        console.log(`   📊 Output keys: ${Object.keys(output || {}).join(', ')}`);
        console.log(`   🖼️  Has image: ${hasImage ? '✅' : '❌'}`);

        return {
          endpoint: endpointName,
          endpointId,
          success: true,
          jobId,
          status,
          duration,
          hasImage,
        };
      }

      if (status === 'FAILED') {
        const error = (jobStatus.output as any)?.error || jobStatus.error || 'Unknown error';
        console.log(`   ❌ Job failed: ${error}`);
        return {
          endpoint: endpointName,
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
    endpoint: endpointName,
    endpointId,
    success: false,
    jobId,
    status: 'TIMEOUT',
    error: `Job did not complete within ${maxAttempts * 5} seconds`,
    duration: Date.now() - startTime,
  };
}

async function main() {
  const apiKey = process.env.RUNPOD_API_KEY;
  if (!apiKey) {
    console.error('❌ RUNPOD_API_KEY environment variable is required');
    console.error('   Set it in your .env file or export it:');
    console.error('   export RUNPOD_API_KEY=your_key_here');
    process.exit(1);
  }

  const testType = process.argv[2] || 'both';

  console.log('🚀 RunPod Endpoint Test Script');
  console.log('================================');
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`Test type: ${testType}`);

  const results: TestResult[] = [];

  if (testType === 'flux' || testType === 'both') {
    const result = await testEndpoint(
      apiKey,
      FLUX_ENDPOINT_ID,
      'Flux (FLUX.1-schnell)',
      'base_image'
    );
    results.push(result);
  }

  if (testType === 'z-image' || testType === 'both') {
    const result = await testEndpoint(
      apiKey,
      Z_IMAGE_ENDPOINT_ID,
      'Z-Image-Turbo',
      'base_image'
    );
    results.push(result);
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log('================================');
  results.forEach((result) => {
    const icon = result.success ? '✅' : '❌';
    const duration = result.duration ? `${(result.duration / 1000).toFixed(1)}s` : 'N/A';
    console.log(
      `${icon} ${result.endpoint}: ${result.success ? 'PASS' : 'FAIL'} (${duration})`
    );
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.jobId) {
      console.log(`   Job ID: ${result.jobId}`);
    }
  });

  const allPassed = results.every((r) => r.success);
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

