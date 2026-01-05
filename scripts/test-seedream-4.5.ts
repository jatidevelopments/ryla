#!/usr/bin/env npx tsx
/**
 * Test Seedream 4.5 (ByteDance) via Fal AI
 *
 * This test verifies that Seedream 4.5 works correctly with async queue polling.
 * Tests the full flow: request → queue → polling → results
 *
 * Usage:
 *   pnpm test:seedream
 *   FAL_KEY=your-key pnpm test:seedream
 */

import * as path from 'path';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const FAL_KEY = process.env['FAL_KEY'];
const MODEL_ID = 'fal-ai/bytedance/seedream/v4.5/text-to-image';

if (!FAL_KEY) {
  console.error('❌ FAL_KEY not set in environment');
  console.error('   Set it in apps/api/.env or .env.local');
  process.exit(1);
}

interface FalQueueResponse {
  request_id?: string;
  status?: string;
  images?: Array<{ url: string }>;
  error?: string;
}

/**
 * Test 1: Submit generation request
 */
async function submitRequest(): Promise<string> {
  console.log('1️⃣  Submitting Seedream 4.5 generation request...\n');
  
  const prompt = 'A beautiful portrait of a young woman with long brown hair, professional photography, 8K, hyper-realistic, cinematic lighting';
  const negativePrompt = 'blurry, low quality, distorted, watermark';
  
  const url = `https://fal.run/${MODEL_ID}`;
  const requestId = randomUUID();
  
  const body = {
    prompt,
    negative_prompt: negativePrompt,
    width: 1024,
    height: 1024,
    num_images: 1,
    seed: Math.floor(Math.random() * 1000000),
  };

  console.log(`   📡 URL: ${url}`);
  console.log(`   📝 Prompt: ${prompt.substring(0, 60)}...`);
  console.log(`   🔑 Request ID: ${requestId}\n`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await res.text();
    console.log(`   📊 Status: ${res.status} ${res.statusText}`);
    console.log(`   📦 Response length: ${text.length} bytes\n`);

    if (!res.ok) {
      console.error(`   ❌ Request failed: ${text.slice(0, 500)}\n`);
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    let json: FalQueueResponse;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error(`   ❌ Invalid JSON response: ${text.slice(0, 500)}\n`);
      throw new Error('Invalid JSON response');
    }

    console.log('   📋 Response structure:');
    console.log(`      - request_id: ${json.request_id || 'none'}`);
    console.log(`      - status: ${json.status || 'none'}`);
    console.log(`      - images: ${json.images?.length || 0}`);
    console.log(`      - error: ${json.error || 'none'}\n`);

    // Check if async queue response
    if (json.request_id && (!json.images || json.images.length === 0)) {
      console.log('   ✅ Detected async queue API (request_id returned)\n');
      return json.request_id;
    }

    // Check if immediate response with images
    if (json.images && json.images.length > 0) {
      console.log('   ✅ Immediate response with images\n');
      console.log('   🖼️  Generated images:');
      json.images.forEach((img, idx) => {
        console.log(`      ${idx + 1}. ${img.url}`);
      });
      return json.request_id || 'immediate';
    }

    // Check status
    if (json.status === 'IN_QUEUE' || json.status === 'IN_PROGRESS') {
      if (json.request_id) {
        console.log(`   ⏳ Status: ${json.status}, polling required\n`);
        return json.request_id;
      }
    }

    console.error('   ❌ Unexpected response format\n');
    console.error('   Full response:', JSON.stringify(json, null, 2));
    throw new Error('Unexpected response format');
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('   ❌ Request timeout (30s) - model may require async polling\n');
      throw new Error('Request timeout');
    }
    throw err;
  }
}

/**
 * Test 2: Poll queue for results
 */
async function pollQueue(requestId: string): Promise<string[]> {
  console.log('2️⃣  Polling queue for results...\n');
  console.log(`   🔑 Request ID: ${requestId}\n`);

  const maxAttempts = 60; // 5 minutes max
  const pollInterval = 5000; // 5 seconds
  let attempts = 0;

  // Build queue URL
  const modelPath = MODEL_ID.startsWith('fal-ai/') ? MODEL_ID : `fal-ai/${MODEL_ID}`;
  const pollUrl = `https://queue.fal.run/${modelPath}/requests/${requestId}`;

  console.log(`   📡 Poll URL: ${pollUrl}\n`);

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`   🔄 Attempt ${attempts}/${maxAttempts}...`);

    try {
      const res = await fetch(pollUrl, {
        method: 'GET',
        headers: {
          Authorization: `Key ${FAL_KEY}`,
        },
      });

      if (!res.ok) {
        console.log(`      ⚠️  Status: ${res.status} ${res.statusText}`);
        if (attempts >= maxAttempts) {
          throw new Error(`Polling failed after ${maxAttempts} attempts: ${res.status}`);
        }
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        continue;
      }

      const json = await res.json() as FalQueueResponse;
      console.log(`      📊 Status: ${json.status || 'unknown'}`);

      if (json.status === 'COMPLETED' && json.images && json.images.length > 0) {
        console.log(`      ✅ Completed! Got ${json.images.length} image(s)\n`);
        return json.images.map((img) => img.url);
      }

      if (json.status === 'FAILED' || json.error) {
        console.error(`      ❌ Failed: ${json.error || 'Unknown error'}\n`);
        throw new Error(`Generation failed: ${json.error || 'Unknown error'}`);
      }

      // Still processing
      if (json.status === 'IN_QUEUE' || json.status === 'IN_PROGRESS') {
        console.log(`      ⏳ ${json.status}, waiting ${pollInterval / 1000}s...\n`);
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        continue;
      }

      // Unknown status
      console.log(`      ⚠️  Unknown status: ${json.status}, waiting...\n`);
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (err) {
      if (err instanceof Error && err.message.includes('Failed')) {
        throw err;
      }
      console.log(`      ⚠️  Poll error: ${err instanceof Error ? err.message : String(err)}`);
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error(`Polling timeout after ${maxAttempts} attempts (${maxAttempts * pollInterval / 1000 / 60} minutes)`);
}

/**
 * Test 3: Display results
 */
function displayResults(imageUrls: string[]): void {
  console.log('3️⃣  Results:\n');
  console.log(`   ✅ Successfully generated ${imageUrls.length} image(s)\n`);
  
  imageUrls.forEach((url, idx) => {
    console.log(`   🖼️  Image ${idx + 1}:`);
    console.log(`      ${url}\n`);
  });

  console.log('   💡 Tip: Open URLs in browser to view images\n');
}

/**
 * Main test flow
 */
async function main() {
  console.log('🧪 Seedream 4.5 (ByteDance) Test\n');
  console.log(`📦 Model: ${MODEL_ID}`);
  console.log(`🔑 FAL_KEY: ${FAL_KEY ? '✅ Set' : '❌ Missing'}\n`);

  if (!FAL_KEY) {
    process.exit(1);
  }

  try {
    // Step 1: Submit request
    const requestId = await submitRequest();

    // Step 2: Poll if async
    if (requestId && requestId !== 'immediate') {
      const imageUrls = await pollQueue(requestId);
      displayResults(imageUrls);
    } else {
      console.log('   ✅ Got immediate results (no polling needed)\n');
    }

    console.log('✅ Test completed successfully!\n');
  } catch (err) {
    console.error('\n❌ Test failed:\n');
    console.error(err instanceof Error ? err.message : String(err));
    console.error('\n');
    process.exit(1);
  }
}

// Run test
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

