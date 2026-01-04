/**
 * Generate Profile Picture Set Preview Images
 * 
 * Creates preview thumbnails for each profile picture set showing
 * the actual poses in the actual scenes. These are used in the wizard
 * to show users what they'll get with each set.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ComfyUIPodClient, buildZImageSimpleWorkflow } from '@ryla/business';
import { profilePictureSets } from '../libs/business/src/prompts/profile-picture-sets';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env.local') });

// Output directory for profile set previews
const OUTPUT_DIR = path.join(process.cwd(), 'apps', 'web', 'public', 'profile-sets');

// Thumbnail dimensions: 1:1 for the grid display
const THUMBNAIL_WIDTH = 512;
const THUMBNAIL_HEIGHT = 512;

// Base quality prompt
const QUALITY_PROMPT = 'photorealistic, 8K, ultra detailed, professional photography, sharp focus, high quality, masterpiece';

// Negative prompt
const NEGATIVE_PROMPT = 'blurry, deformed, ugly, bad anatomy, bad hands, missing fingers, extra fingers, watermark, signature, low quality, pixelated, cartoon, anime, illustration, painting, drawing';

// Character base description (neutral model)
const CHARACTER_BASE = 'beautiful young woman, 25 years old, brown hair, natural makeup, clean skin';

interface GenerationJob {
  setId: string;
  positionId: string;
  outputPath: string;
  prompt: string;
}

/**
 * Build prompt for a profile picture position
 */
function buildPositionPrompt(position: any, setStyle: string): string {
  const parts = [
    CHARACTER_BASE,
    position.pose,
    position.angle,
    position.expression,
    position.activity || '',
    position.lighting || 'natural lighting',
    setStyle,
    position.framing === 'full-body' ? 'full body shot' : 
      position.framing === 'close-up' ? 'close-up portrait' : 'medium shot',
    QUALITY_PROMPT,
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Generate all preview images for profile picture sets
 */
async function generateProfileSetPreviews() {
  console.log('🎨 Profile Picture Set Preview Generator\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
  }
  
  // Create subdirectories for each set
  for (const set of profilePictureSets) {
    const setDir = path.join(OUTPUT_DIR, set.id);
    if (!fs.existsSync(setDir)) {
      fs.mkdirSync(setDir, { recursive: true });
    }
  }
  
  // Build list of generation jobs
  const jobs: GenerationJob[] = [];
  
  for (const set of profilePictureSets) {
    console.log(`\n📷 ${set.name} (${set.id})`);
    console.log(`   ${set.positions.length} positions to generate\n`);
    
    // Generate ALL positions for each set
    for (const position of set.positions) {
      const outputPath = path.join(OUTPUT_DIR, set.id, `${position.id}.webp`);
      
      // Skip if already exists
      if (fs.existsSync(outputPath)) {
        console.log(`   ⏭️  ${position.name} - already exists`);
        continue;
      }
      
      const prompt = buildPositionPrompt(position, set.style);
      
      jobs.push({
        setId: set.id,
        positionId: position.id,
        outputPath,
        prompt,
      });
      
      console.log(`   📝 ${position.name}`);
      console.log(`      Scene: ${position.scene || 'studio'}`);
      console.log(`      Pose: ${position.poseId || 'default'}`);
    }
  }
  
  console.log(`\n\n📊 Total jobs to generate: ${jobs.length}\n`);
  
  if (jobs.length === 0) {
    console.log('✅ All preview images already exist!');
    return;
  }
  
  // Initialize ComfyUI client
  const podId = process.env.COMFYUI_POD_ID;
  const comfyuiUrl = process.env.COMFYUI_URL || (podId ? `https://${podId}-8188.proxy.runpod.net` : null);
  
  if (!comfyuiUrl) {
    console.error('❌ COMFYUI_URL or COMFYUI_POD_ID not set. Set in .env or .env.local');
    console.log('\n📋 Manual generation prompts:\n');
    
    // Output prompts for manual generation
    for (const job of jobs) {
      console.log(`--- ${job.setId}/${job.positionId} ---`);
      console.log(`Prompt: ${job.prompt}`);
      console.log(`Negative: ${NEGATIVE_PROMPT}`);
      console.log(`Output: ${job.outputPath}\n`);
    }
    return;
  }
  
  console.log(`🔌 Using ComfyUI at: ${comfyuiUrl}\n`);
  
  const client = new ComfyUIPodClient({ baseUrl: comfyuiUrl });
  
  console.log('🔌 Connecting to ComfyUI pod...\n');
  
  // Generate images
  let successCount = 0;
  let errorCount = 0;
  
  for (const job of jobs) {
    console.log(`\n🖼️  Generating: ${job.setId}/${job.positionId}`);
    
    try {
      const workflow = buildZImageSimpleWorkflow({
        prompt: job.prompt,
        negativePrompt: NEGATIVE_PROMPT,
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        seed: Math.floor(Math.random() * 1000000),
        steps: 6,
        cfg: 2.0,
      });
      
      const result = await client.executeWorkflow(workflow);
      
      if (result.status === 'completed' && result.images && result.images.length > 0) {
        // Save base64 image - extract data after the comma
        const base64Data = result.images[0].split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(job.outputPath, imageBuffer);
        console.log(`   ✅ Saved: ${job.outputPath}`);
        successCount++;
      } else {
        console.log(`   ❌ ${result.status}: ${result.error || 'No images returned'}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      errorCount++;
    }
    
    // Small delay between generations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n\n📊 Generation Complete`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

// Run the generator
generateProfileSetPreviews().catch(console.error);

