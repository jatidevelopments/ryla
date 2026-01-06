#!/usr/bin/env npx ts-node
/**
 * Test script for debugging studio image generation
 * 
 * Usage: npx ts-node scripts/tests/test-studio-generation.ts
 */

const API_BASE = process.env.API_URL || 'http://localhost:3000';

// Test user and character IDs - replace with actual values from your DB
const TEST_USER_ID = process.env.TEST_USER_ID || 'af794a10-eb22-486c-bc30-7aa663268a8c';
const TEST_CHARACTER_ID = process.env.TEST_CHARACTER_ID || '1ab327af-485a-4239-90d1-02f3a7b70d74';

interface GenerateStudioImagesRequest {
  userId: string;
  characterId: string;
  scene: string;
  environment: string;
  outfit: string;
  poseId?: string;
  aspectRatio: '1:1' | '9:16' | '2:3';
  qualityMode: 'draft' | 'hq';
  count: number;
  nsfw: boolean;
  seed?: number;
}

interface GenerateResponse {
  jobId: string;
  promptId: string;
}

interface JobResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  images?: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
  }>;
  error?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImage(request: GenerateStudioImagesRequest): Promise<GenerateResponse[]> {
  console.log('\n=== Generating Studio Image ===');
  console.log('Request:', JSON.stringify(request, null, 2));
  
  const response = await fetch(`${API_BASE}/image/studio/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate image: ${response.status} ${response.statusText}\n${errorText}`);
  }
  
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
  return data;
}

async function pollResults(promptId: string, userId: string, maxAttempts: number = 60): Promise<JobResult> {
  console.log(`\n=== Polling for results: ${promptId} ===`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Attempt ${attempt}/${maxAttempts}...`);
    
    try {
      const response = await fetch(
        `${API_BASE}/image/comfyui/${promptId}/results?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${response.status} ${response.statusText}`);
        console.error('Body:', errorText);
        
        if (response.status === 500) {
          // This is the error we're looking for - log it and continue
          console.error('\n!!! SERVER ERROR DETECTED !!!');
          console.error('This is likely the image insertion error.');
          return { status: 'failed', error: errorText };
        }
        
        throw new Error(`Failed to get results: ${response.status}`);
      }
      
      const data: JobResult = await response.json();
      console.log('Status:', data.status);
      
      if (data.status === 'completed') {
        console.log('\n=== Generation Complete ===');
        console.log('Images:', JSON.stringify(data.images, null, 2));
        return data;
      }
      
      if (data.status === 'failed') {
        console.error('\n=== Generation Failed ===');
        console.error('Error:', data.error);
        return data;
      }
      
      // Still processing, wait and retry
      await sleep(2000);
    } catch (error) {
      console.error('Poll error:', error);
      await sleep(2000);
    }
  }
  
  return { status: 'failed', error: 'Timeout waiting for results' };
}

async function testDirectDbInsert(): Promise<void> {
  console.log('\n=== Testing Direct DB Insert ===');
  
  // This will help identify if the issue is with the DB insert specifically
  const testImageData = {
    characterId: TEST_CHARACTER_ID,
    userId: TEST_USER_ID,
    s3Key: 'test/test-image.png',
    thumbnailKey: 'test/test-image.png',
    prompt: 'Test prompt',
    negativePrompt: 'Test negative prompt',
    status: 'completed',
    nsfw: false,
    width: 512,
    height: 512,
    // Test enum values
    environment: 'studio', // Valid environment_preset
    outfit: 'casual',
    aspectRatio: '1:1', // Valid aspect_ratio
    qualityMode: 'draft', // Valid quality_mode
  };
  
  console.log('Test image data:', JSON.stringify(testImageData, null, 2));
  console.log('\nTo test this directly, you would need to call imagesRepo.createImage with this data');
}

async function main(): Promise<void> {
  console.log('=== Studio Generation Test Script ===');
  console.log(`API Base: ${API_BASE}`);
  console.log(`User ID: ${TEST_USER_ID}`);
  console.log(`Character ID: ${TEST_CHARACTER_ID}`);
  
  // Test 1: Generate with valid enum values
  const request: GenerateStudioImagesRequest = {
    userId: TEST_USER_ID,
    characterId: TEST_CHARACTER_ID,
    scene: 'professional_portrait', // Valid scene_preset
    environment: 'studio', // Valid environment_preset
    outfit: 'casual',
    aspectRatio: '1:1',
    qualityMode: 'draft',
    count: 1,
    nsfw: false,
    seed: 12345,
  };
  
  try {
    const jobs = await generateImage(request);
    
    if (jobs.length > 0) {
      const result = await pollResults(jobs[0].promptId, TEST_USER_ID);
      
      if (result.status === 'completed') {
        console.log('\n✅ SUCCESS: Image generated and saved successfully!');
      } else {
        console.log('\n❌ FAILED: Image generation failed');
        console.log('Error:', result.error);
      }
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
  
  // Also show what a direct DB insert would look like
  await testDirectDbInsert();
}

main().catch(console.error);

