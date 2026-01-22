#!/usr/bin/env npx tsx
/**
 * Upscale Auth Promotional Images using fal.ai
 *
 * This script upscales the promotional images used in the auth modal/page
 * to ensure they look crisp on high-DPI displays (440px panel needs 880px+ images).
 *
 * Usage:
 *   FAL_KEY=your_key npx tsx scripts/upscale-auth-images.ts
 *
 * Or with infisical:
 *   infisical run --path=/mcp --env=dev -- npx tsx scripts/upscale-auth-images.ts
 */

import { fal } from '@fal-ai/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// Configure fal.ai
const FAL_KEY = process.env.FAL_KEY || process.env.FAL_API_KEY;
if (!FAL_KEY) {
  console.error('❌ FAL_KEY or FAL_API_KEY environment variable is required');
  console.error('   Usage: FAL_KEY=your_key npx tsx scripts/upscale-auth-images.ts');
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

// Images to upscale (relative to apps/web/public/)
const AUTH_PROMO_IMAGES = [
  'poses/expressive-laughing.webp',
  'templates/beach/poolside-luxury.webp',
  'templates/trending/clean-girl-aesthetic.webp',
  'templates/professional/boss-mode-office.webp',
  'templates/beginner/golden-hour-magic.webp',
];

// Output directory for upscaled images
const OUTPUT_DIR = 'apps/web/public/auth-promo';
const SOURCE_DIR = 'apps/web/public';

interface UpscaleResult {
  originalPath: string;
  outputPath: string;
  success: boolean;
  error?: string;
}

/**
 * Upload a local file to a temporary URL for fal.ai processing
 */
async function uploadToFal(filePath: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/webp' });
  const file = new File([blob], path.basename(filePath), { type: 'image/webp' });
  
  const url = await fal.storage.upload(file);
  return url;
}

/**
 * Download image from URL to local file
 */
async function downloadImage(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(outputPath);
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, outputPath).then(resolve).catch(reject);
          return;
        }
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

/**
 * Upscale a single image using fal.ai creative upscaler
 */
async function upscaleImage(
  sourcePath: string,
  outputPath: string
): Promise<UpscaleResult> {
  try {
    console.log(`  📤 Uploading ${path.basename(sourcePath)}...`);
    const imageUrl = await uploadToFal(sourcePath);
    
    console.log(`  🔄 Upscaling with fal.ai creative-upscaler (2x)...`);
    const result = await fal.run('fal-ai/creative-upscaler', {
      input: {
        image_url: imageUrl,
        scale: 2,
        creativity: 0.2, // Low creativity to stay close to original
        prompt: 'high resolution, professional photography, sharp focus, detailed skin texture, beautiful lighting',
      },
    });

    // fal.ai returns { data: { image: { url } } }
    const upscaledUrl = (result as { data: { image: { url: string } } }).data.image.url;
    
    console.log(`  📥 Downloading upscaled image...`);
    await downloadImage(upscaledUrl, outputPath);
    
    // Get file size for verification
    const stats = fs.statSync(outputPath);
    const sizeKB = Math.round(stats.size / 1024);
    
    console.log(`  ✅ Saved: ${path.basename(outputPath)} (${sizeKB} KB)`);
    
    return {
      originalPath: sourcePath,
      outputPath,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ Failed: ${errorMessage}`);
    return {
      originalPath: sourcePath,
      outputPath,
      success: false,
      error: errorMessage,
    };
  }
}

async function main() {
  console.log('🖼️  Auth Promotional Image Upscaler');
  console.log('====================================\n');
  
  // Create output directory
  const outputDirPath = path.join(process.cwd(), OUTPUT_DIR);
  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
  }
  
  const results: UpscaleResult[] = [];
  
  for (let i = 0; i < AUTH_PROMO_IMAGES.length; i++) {
    const imagePath = AUTH_PROMO_IMAGES[i];
    const sourcePath = path.join(process.cwd(), SOURCE_DIR, imagePath);
    const outputFileName = `auth-promo-${i + 1}.webp`;
    const outputPath = path.join(outputDirPath, outputFileName);
    
    console.log(`\n[${i + 1}/${AUTH_PROMO_IMAGES.length}] Processing: ${imagePath}`);
    
    if (!fs.existsSync(sourcePath)) {
      console.error(`  ❌ Source file not found: ${sourcePath}`);
      results.push({
        originalPath: sourcePath,
        outputPath,
        success: false,
        error: 'Source file not found',
      });
      continue;
    }
    
    const result = await upscaleImage(sourcePath, outputPath);
    results.push(result);
    
    // Small delay between requests to avoid rate limiting
    if (i < AUTH_PROMO_IMAGES.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
  // Summary
  console.log('\n====================================');
  console.log('📊 Summary');
  console.log('====================================');
  
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach((f) => console.log(`   - ${path.basename(f.originalPath)}: ${f.error}`));
  }
  
  if (successful.length > 0) {
    console.log(`\n📂 Upscaled images saved to: ${OUTPUT_DIR}/`);
    console.log('\n📝 Update your auth components to use these new images:');
    console.log('');
    console.log('const PROMO_IMAGES = [');
    successful.forEach((_, i) => {
      console.log(`  '/auth-promo/auth-promo-${i + 1}.webp',`);
    });
    console.log('];');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
