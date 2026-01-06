/**
 * Generate Outfit Mode Selector Background Images
 * 
 * Generates two background images for the outfit mode selector:
 * 1. Pre-Composed - showing a complete outfit
 * 2. Custom Composition - showing outfit pieces/components
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getCharacterPrompt } from './analyze-base-character';
import { ComfyUIPodClient } from '@ryla/business';
import { buildZImageSimpleWorkflow } from '@ryla/business';

// Load environment variables from .env files
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env.local') });

// Image dimensions: 16:10 aspect ratio (matches UI aspect-[16/10])
const IMAGE_WIDTH = 1280;
const IMAGE_HEIGHT = 800;

// Base prompt template for consistent style and quality
const BASE_STYLE = '8K hyper-realistic, photorealistic, professional fashion photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality, 4K resolution, hyper-detailed textures, professional model photography';

// Generate pre-composed outfit image
async function generatePreComposedImage(
  outputPath: string,
  client: ComfyUIPodClient
): Promise<void> {
  console.log('🎨 Generating pre-composed outfit mode image...');
  
  const characterDescription = getCharacterPrompt();
  
  // Warm color scheme (purple/pink tones) - showing complete coordinated outfit
  const prompt = `${characterDescription}, wearing a complete elegant coordinated outfit, full body portrait, professional fashion photography, showcasing a ready-to-wear complete outfit combination with matching top, bottom, shoes, and accessories all perfectly coordinated, stylish cohesive look, warm color palette with purple, pink, and rose tones, soft warm lighting, clean minimalist background, fashion editorial style, ${BASE_STYLE}`;
  
  const negativePrompt = 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, extra limbs, missing limbs, watermark, signature, text, logo, multiple people, crowd, background clutter, incomplete outfit, separate pieces, mismatched clothing, uncoordinated look, cold colors, blue tones, teal tones, individual clothing items, mix and match';
  
  // Use Z-Image Turbo workflow (9 steps, cfg 1.0 for fast high-quality generation)
  const workflow = buildZImageSimpleWorkflow({
    prompt,
    negativePrompt,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    steps: 9, // Z-Image Turbo uses 9 steps (8 DiT forwards)
    cfg: 1.0, // Z-Image Turbo uses cfg 1.0
    seed: Math.floor(Math.random() * 2 ** 32),
  });
  
  try {
    // Execute workflow (queues and polls until complete)
    const result = await client.executeWorkflow(workflow);
    
    if (result.status === 'failed' || !result.images || result.images.length === 0) {
      throw new Error(result.error || 'ComfyUI generation failed - no images returned');
    }
    
    // Get first image (base64 data URL)
    const imageDataUrl = result.images[0];
    
    // Convert data URL to buffer
    const base64Data = imageDataUrl.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Save as WebP
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log(`✅ Saved: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error generating pre-composed image:`, error);
    throw error;
  }
}

// Generate custom composition image
async function generateCustomCompositionImage(
  outputPath: string,
  client: ComfyUIPodClient
): Promise<void> {
  console.log('🎨 Generating custom composition mode image...');
  
  const characterDescription = getCharacterPrompt();
  
  // Cool color scheme (blue/teal tones) - showing individual pieces for mix and match
  const prompt = `${characterDescription}, fashion photography showing individual outfit pieces arranged artistically around the model, separate clothing items clearly visible: different tops, bottoms, shoes, accessories displayed in a creative mix-and-match layout, model wearing some pieces while other individual pieces are shown nearby or arranged around her, cool color palette with blue, teal, and cyan tones, cool lighting, modern fashion styling, clean minimalist background, fashion editorial style, ${BASE_STYLE}, showcasing customizable outfit pieces that can be combined`;
  
  const negativePrompt = 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, extra limbs, missing limbs, watermark, signature, text, logo, multiple people, crowd, background clutter, complete matching outfit, single coordinated look, warm colors, purple tones, pink tones, rose tones, perfectly matched set';
  
  // Use Z-Image Turbo workflow (9 steps, cfg 1.0 for fast high-quality generation)
  const workflow = buildZImageSimpleWorkflow({
    prompt,
    negativePrompt,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    steps: 9, // Z-Image Turbo uses 9 steps (8 DiT forwards)
    cfg: 1.0, // Z-Image Turbo uses cfg 1.0
    seed: Math.floor(Math.random() * 2 ** 32),
  });
  
  try {
    // Execute workflow (queues and polls until complete)
    const result = await client.executeWorkflow(workflow);
    
    if (result.status === 'failed' || !result.images || result.images.length === 0) {
      throw new Error(result.error || 'ComfyUI generation failed - no images returned');
    }
    
    // Get first image (base64 data URL)
    const imageDataUrl = result.images[0];
    
    // Convert data URL to buffer
    const base64Data = imageDataUrl.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Save as WebP
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log(`✅ Saved: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error generating custom composition image:`, error);
    throw error;
  }
}

// Main execution
async function main() {
  // Check for ComfyUI pod URL
  const comfyuiPodUrl = process.env.COMFYUI_POD_URL;
  if (!comfyuiPodUrl) {
    console.error('❌ COMFYUI_POD_URL environment variable is required');
    console.error('   Set it in your .env file: COMFYUI_POD_URL=https://your-pod-id-8188.proxy.runpod.net');
    process.exit(1);
  }
  
  // Initialize ComfyUI pod client
  console.log(`🔗 Connecting to ComfyUI pod: ${comfyuiPodUrl}`);
  const client = new ComfyUIPodClient({
    baseUrl: comfyuiPodUrl,
    timeout: 180000, // 3 minutes timeout
  });
  
  // Health check
  try {
    await client.healthCheck();
  } catch (error) {
    console.error('❌ ComfyUI pod is not responding. Please check the pod URL and ensure the pod is running.');
    process.exit(1);
  }
  console.log('✓ ComfyUI pod is healthy\n');
  
  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), 'apps', 'web', 'public', 'outfit-modes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('\n📦 Generating outfit mode selector images...\n');
  
  try {
    // Generate pre-composed image
    const preComposedPath = path.join(outputDir, 'pre-composed.webp');
    await generatePreComposedImage(preComposedPath, client);
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate custom composition image
    const customCompositionPath = path.join(outputDir, 'custom-composition.webp');
    await generateCustomCompositionImage(customCompositionPath, client);
    
    console.log(`\n✅ Generation complete!`);
    console.log(`   Images saved to: ${outputDir}`);
  } catch (error) {
    console.error('❌ Failed to generate images:', error);
    process.exit(1);
  }
}

main().catch(console.error);

