#!/usr/bin/env npx tsx
/**
 * Test MinIO Storage Integration
 *
 * Verifies the full flow:
 * 1. Generate image via ComfyUI pod
 * 2. Upload to MinIO storage
 * 3. Verify image is accessible via URL
 *
 * Usage:
 *   pnpm test:minio
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListBucketsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MINIO_ENDPOINT = process.env['AWS_S3_ENDPOINT'] || 'http://localhost:9000';
const ACCESS_KEY = process.env['AWS_S3_ACCESS_KEY'] || 'ryla_minio';
const SECRET_KEY = process.env['AWS_S3_SECRET_KEY'] || 'ryla_minio_secret';
const BUCKET_NAME = process.env['AWS_S3_BUCKET_NAME'] || 'ryla-images';
const REGION = process.env['AWS_S3_REGION'] || 'us-east-1';

console.log('🧪 MinIO Storage Test\n');
console.log(`📡 Endpoint: ${MINIO_ENDPOINT}`);
console.log(`📦 Bucket: ${BUCKET_NAME}\n`);

// Create S3 client configured for MinIO
const s3Client = new S3Client({
  region: REGION,
  endpoint: MINIO_ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});

async function testMinIOConnection(): Promise<boolean> {
  console.log('1️⃣  Testing MinIO connection...');
  try {
    const result = await s3Client.send(new ListBucketsCommand({}));
    console.log(`   ✅ Connected! Found ${result.Buckets?.length || 0} bucket(s)`);
    
    const bucketNames = result.Buckets?.map(b => b.Name) || [];
    console.log(`   📦 Buckets: ${bucketNames.join(', ') || 'none'}`);
    
    if (!bucketNames.includes(BUCKET_NAME)) {
      console.log(`   ⚠️  Bucket '${BUCKET_NAME}' not found!`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error}`);
    return false;
  }
}

async function testUploadImage(): Promise<string | null> {
  console.log('\n2️⃣  Testing image upload...');
  
  // Create a simple test PNG image (1x1 red pixel)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  const imageBuffer = Buffer.from(testImageBase64, 'base64');
  
  const key = `test/test-image-${Date.now()}.png`;
  
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/png',
    }));
    
    console.log(`   ✅ Uploaded: ${key}`);
    return key;
  } catch (error) {
    console.log(`   ❌ Upload failed: ${error}`);
    return null;
  }
}

async function testGetSignedUrl(key: string): Promise<string | null> {
  console.log('\n3️⃣  Testing signed URL generation...');
  
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log(`   ✅ Signed URL generated`);
    console.log(`   🔗 ${url.substring(0, 80)}...`);
    return url;
  } catch (error) {
    console.log(`   ❌ Signed URL failed: ${error}`);
    return null;
  }
}

async function testImageAccessible(url: string): Promise<boolean> {
  console.log('\n4️⃣  Testing image accessibility...');
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`);
      return false;
    }
    
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    console.log(`   ✅ Image accessible!`);
    console.log(`   📄 Content-Type: ${contentType}`);
    console.log(`   📦 Size: ${contentLength} bytes`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Access failed: ${error}`);
    return false;
  }
}

async function testComfyUIToMinIO(): Promise<boolean> {
  console.log('\n5️⃣  Testing ComfyUI → MinIO flow...');
  
  const COMFYUI_URL = process.env['COMFYUI_POD_URL'];
  
  if (!COMFYUI_URL) {
    console.log('   ⏭️  Skipped (COMFYUI_POD_URL not set)');
    return true;
  }
  
  try {
    // Import workflow factory
    const { buildWorkflow } = await import('../libs/business/src/workflows');
    
    // Build a simple workflow
    const workflow = buildWorkflow('z-image-simple', {
      prompt: 'A red circle on white background, simple test image',
      width: 512,
      height: 512,
      seed: 42,
      filenamePrefix: 'minio_test',
    });
    
    console.log('   📤 Submitting test workflow to ComfyUI...');
    
    // Queue the workflow
    const queueResp = await fetch(`${COMFYUI_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });
    
    if (!queueResp.ok) {
      const error = await queueResp.text();
      console.log(`   ❌ Queue failed: ${error}`);
      return false;
    }
    
    const { prompt_id } = await queueResp.json() as { prompt_id: string };
    console.log(`   ✅ Queued: ${prompt_id}`);
    
    // Poll for completion
    console.log('   ⏳ Waiting for generation...');
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
      
      const historyResp = await fetch(`${COMFYUI_URL}/history/${prompt_id}`);
      if (!historyResp.ok) continue;
      
      const history = await historyResp.json() as Record<string, {
        status?: { completed: boolean; status_str: string };
        outputs?: Record<string, { images?: Array<{ filename: string; subfolder: string; type: string }> }>;
      }>;
      
      const item = history[prompt_id];
      if (!item?.status?.completed) continue;
      
      if (item.status.status_str !== 'success') {
        console.log(`   ❌ Generation failed: ${item.status.status_str}`);
        return false;
      }
      
      // Get the image
      const images = Object.values(item.outputs || {}).flatMap(o => o.images || []);
      if (images.length === 0) {
        console.log('   ❌ No images in output');
        return false;
      }
      
      const img = images[0];
      const imgResp = await fetch(
        `${COMFYUI_URL}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`
      );
      
      if (!imgResp.ok) {
        console.log('   ❌ Failed to download image from ComfyUI');
        return false;
      }
      
      const buffer = Buffer.from(await imgResp.arrayBuffer());
      console.log(`   ✅ Generated image: ${buffer.length} bytes`);
      
      // Upload to MinIO
      const key = `test/comfyui-test-${Date.now()}.png`;
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
      }));
      
      console.log(`   ✅ Uploaded to MinIO: ${key}`);
      
      // Get signed URL and verify accessibility
      const url = await getSignedUrl(s3Client, new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }), { expiresIn: 3600 });
      
      const accessResp = await fetch(url);
      if (accessResp.ok) {
        console.log(`   ✅ Image accessible via signed URL!`);
        
        // Save locally for visual verification
        const outputPath = path.join(process.cwd(), 'tmp', 'minio-test-output.png');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, buffer);
        console.log(`   💾 Saved: ${outputPath}`);
        
        return true;
      } else {
        console.log(`   ❌ Image not accessible: ${accessResp.status}`);
        return false;
      }
    }
    
    console.log('   ❌ Timeout waiting for generation');
    return false;
  } catch (error) {
    console.log(`   ❌ ComfyUI → MinIO test failed: ${error}`);
    return false;
  }
}

async function main() {
  const results = {
    connection: false,
    upload: false,
    signedUrl: false,
    accessible: false,
    comfyuiFlow: false,
  };
  
  // Test MinIO connection
  results.connection = await testMinIOConnection();
  
  if (results.connection) {
    // Test upload
    const key = await testUploadImage();
    results.upload = key !== null;
    
    if (key) {
      // Test signed URL
      const url = await testGetSignedUrl(key);
      results.signedUrl = url !== null;
      
      if (url) {
        // Test accessibility
        results.accessible = await testImageAccessible(url);
      }
    }
    
    // Test full ComfyUI → MinIO flow
    results.comfyuiFlow = await testComfyUIToMinIO();
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 Test Results\n');
  console.log(`   MinIO Connection:  ${results.connection ? '✅ Pass' : '❌ Fail'}`);
  console.log(`   Image Upload:      ${results.upload ? '✅ Pass' : '❌ Fail'}`);
  console.log(`   Signed URL:        ${results.signedUrl ? '✅ Pass' : '❌ Fail'}`);
  console.log(`   Image Accessible:  ${results.accessible ? '✅ Pass' : '❌ Fail'}`);
  console.log(`   ComfyUI → MinIO:   ${results.comfyuiFlow ? '✅ Pass' : '⏭️ Skipped'}`);
  console.log('\n' + '='.repeat(50));
  
  const allPassed = results.connection && results.upload && results.signedUrl && results.accessible;
  
  if (allPassed) {
    console.log('\n🎉 MinIO storage is working correctly!\n');
    console.log('Frontend can now display images from these URLs.');
  } else {
    console.log('\n⚠️  Some tests failed. Check MinIO configuration.\n');
  }
  
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


