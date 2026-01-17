/**
 * Generate Ethnicity-Specific Character Images using Local RunPod ComfyUI with Z-Image Turbo
 * 
 * This script generates ethnicity-specific character images for EP-034:
 * - 7 ethnicities × 2 genders = 14 full body images
 * - 7 ethnicities × 2 genders = 14 portrait images
 * 
 * Each ethnicity has:
 * - Distinct ethnic features
 * - Regional background that fits the ethnicity
 * - Authentic beauty marks and features
 * - Influencer-style, emotional, happy, sexy appearance
 * 
 * Uses local ComfyUI pod with Z-Image Turbo workflow to generate consistent,
 * high-quality, appealing ethnicity-specific character images.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ComfyUIPodClient } from '@ryla/business';
import { buildZImageSimpleWorkflow } from '@ryla/business';

// Load environment variables from .env files
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env.local') });

// Image dimensions: 4:5 aspect ratio (matches UI aspect-[4/5])
const IMAGE_WIDTH = 768;
const IMAGE_HEIGHT = 960;

// Base style template for consistent quality
const BASE_STYLE = '8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality';

// Negative prompt for ethnicity images (SFW only) - Strong emphasis on clothing
const NEGATIVE_PROMPT = 'deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature, no person, empty scene, no character, nude, naked, no clothing, bare skin, exposed, topless, bottomless, see-through, transparent clothing, revealing, lingerie, underwear visible, cleavage, white background, plain background, blank background, stereotypical, caricature, offensive';

// Ethnicity-specific configurations
interface EthnicityConfig {
  value: string;
  displayName: string;
  regionalBackground: string;
  beautyMarks: string;
  skinFeatures: string;
  hairDescription: string;
  eyeColor: string;
}

const ETHNICITY_CONFIGS: Record<string, EthnicityConfig> = {
  asian: {
    value: 'asian',
    displayName: 'Asian',
    regionalBackground: 'modern Asian cityscape, Tokyo or Seoul urban background, cherry blossoms, traditional and modern architecture blend, vibrant city lights, Asian cultural elements',
    beautyMarks: 'small beauty mark on cheek, natural skin texture, flawless complexion',
    skinFeatures: 'fair smooth skin, delicate features, natural Asian skin tone',
    hairDescription: 'long black hair, silky straight hair',
    eyeColor: 'brown eyes',
  },
  black: {
    value: 'black',
    displayName: 'Black',
    regionalBackground: 'vibrant African cityscape, modern African architecture, warm sunset colors, cultural elements, urban African setting, rich cultural heritage',
    beautyMarks: 'natural beauty marks, melanin-rich skin, beautiful skin texture',
    skinFeatures: 'rich dark skin, beautiful melanin-rich complexion, natural skin glow',
    hairDescription: 'natural black hair, textured hair, beautiful curls',
    eyeColor: 'brown eyes',
  },
  caucasian: {
    value: 'caucasian',
    displayName: 'Caucasian',
    regionalBackground: 'European cityscape, Paris or London urban background, classic European architecture, elegant streets, European cultural elements',
    beautyMarks: 'freckles on cheeks, natural beauty marks, rosy complexion, actress-like features',
    skinFeatures: 'fair smooth skin, natural European skin tone, healthy glow, screen actress appearance, model-like features',
    hairDescription: 'long brown hair, natural waves, styled like a screen actress',
    eyeColor: 'brown eyes',
  },
  latina: {
    value: 'latina',
    displayName: 'Latina',
    regionalBackground: 'Latin American cityscape, colorful Mexican or Brazilian urban background, vibrant colors, tropical elements, warm cultural atmosphere',
    beautyMarks: 'natural beauty marks, warm skin tone, sun-kissed glow',
    skinFeatures: 'warm tanned skin, olive complexion, natural Latin American skin tone',
    hairDescription: 'long dark brown hair, natural waves',
    eyeColor: 'brown eyes',
  },
  arabian: {
    value: 'arabian',
    displayName: 'Arab',
    regionalBackground: 'Middle Eastern cityscape, Dubai or Istanbul urban background, modern Middle Eastern architecture, desert elements, cultural heritage',
    beautyMarks: 'natural beauty marks, olive skin tone, elegant features',
    skinFeatures: 'olive skin, warm Mediterranean complexion, natural Middle Eastern skin tone',
    hairDescription: 'long dark brown hair, silky hair',
    eyeColor: 'brown eyes',
  },
  indian: {
    value: 'indian',
    displayName: 'Indian',
    regionalBackground: 'South Asian cityscape, Mumbai or Delhi urban background, vibrant Indian architecture, colorful cultural elements, rich heritage',
    beautyMarks: 'natural beauty mark on forehead (bindi area), natural beauty marks, warm skin tone',
    skinFeatures: 'warm brown skin, natural South Asian complexion, healthy glow',
    hairDescription: 'long black hair, silky hair',
    eyeColor: 'brown eyes',
  },
  mixed: {
    value: 'mixed',
    displayName: 'Mixed',
    regionalBackground: 'diverse urban cityscape, multicultural city background, modern cosmopolitan setting, diverse cultural elements, global city atmosphere',
    beautyMarks: 'natural beauty marks, unique mixed heritage features, diverse skin tone',
    skinFeatures: 'mixed heritage skin tone, unique complexion, natural diversity',
    hairDescription: 'long brown hair, natural texture',
    eyeColor: 'brown eyes',
  },
};

interface EthnicityImage {
  ethnicity: string;
  gender: 'female' | 'male';
  type: 'full-body' | 'portrait';
  prompt: string;
  outputPath: string;
  name: string;
}

function getEthnicityPrompt(
  ethnicity: string,
  gender: 'female' | 'male',
  type: 'full-body' | 'portrait'
): string {
  const config = ETHNICITY_CONFIGS[ethnicity];
  if (!config) {
    throw new Error(`Unknown ethnicity: ${ethnicity}`);
  }

  const genderTerm = gender === 'female' ? 'beautiful, attractive woman' : 'handsome, attractive man';
  const age = gender === 'female' ? 25 : 28;
  const bodyType = gender === 'female' ? 'slim athletic body type' : 'athletic body type';
  const outfit = 'fully clothed, casual stylish outfit, appropriate clothing, modest attire, well-dressed, professional clothing, complete outfit';

  // Base character description
  let baseDescription = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${config.hairDescription}, ${config.eyeColor}, ${bodyType}, ${config.skinFeatures}, ${config.beautyMarks}`;
  
  // Add actress/model styling for Caucasian
  if (ethnicity === 'caucasian' && gender === 'female') {
    baseDescription += `, screen actress appearance, professional model look, Hollywood actress features, elegant and refined`;
  }
  
  baseDescription += `, wearing ${outfit}`;
  
  let prompt = baseDescription;

  // Add background
  prompt += `, in ${config.regionalBackground}`;

  // Add style based on type
  if (type === 'portrait') {
    prompt += `, influencer style portrait, close-up portrait, head and shoulders, face clearly visible, beautiful facial features, happy expression, genuine smile, confident pose, sexy attractive look, emotional connection, unique personality, social media influencer aesthetic, engaging eye contact, natural lighting`;
  } else {
    prompt += `, influencer style portrait, full body view, clearly visible in the scene, happy expression, genuine smile, confident pose, sexy attractive look, emotional connection, unique personality, social media influencer aesthetic, engaging pose`;
  }

  prompt += `, ${BASE_STYLE}`;

  return prompt;
}

function getEthnicityImages(): EthnicityImage[] {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  
  const images: EthnicityImage[] = [];
  const ethnicities = Object.keys(ETHNICITY_CONFIGS);
  const genders: ('female' | 'male')[] = ['female', 'male'];
  const types: ('full-body' | 'portrait')[] = ['full-body', 'portrait'];

  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      for (const type of types) {
        const config = ETHNICITY_CONFIGS[ethnicity];
        const fileName = `${gender}-${type}.webp`;
        const outputPath = path.join(
          publicDir,
          'images',
          'wizard',
          'appearance',
          ethnicity,
          'ethnicity',
          fileName
        );
        const prompt = getEthnicityPrompt(ethnicity, gender, type);
        
        images.push({
          ethnicity,
          gender,
          type,
          prompt,
          outputPath,
          name: `${config.displayName} ${gender === 'female' ? 'Female' : 'Male'} (${type === 'portrait' ? 'Portrait' : 'Full Body'})`,
        });
      }
    }
  }

  return images;
}

async function ensureDirectories(): Promise<void> {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const ethnicities = Object.keys(ETHNICITY_CONFIGS);
  
  for (const ethnicity of ethnicities) {
    const ethnicityDir = path.join(publicDir, 'images', 'wizard', 'appearance', ethnicity, 'ethnicity');
    if (!fs.existsSync(ethnicityDir)) {
      fs.mkdirSync(ethnicityDir, { recursive: true });
      console.log(`✓ Created directory: ${ethnicityDir}`);
    }
  }
}

async function saveImageAsWebP(imageBuffer: Buffer, outputPath: string): Promise<void> {
  fs.writeFileSync(outputPath, imageBuffer);
}

async function generateEthnicityImage(
  image: EthnicityImage,
  client: ComfyUIPodClient
): Promise<void> {
  console.log(`\n📸 Generating: ${image.name}`);
  console.log(`   Ethnicity: ${image.ethnicity}, Gender: ${image.gender}, Type: ${image.type}`);
  console.log(`   Prompt: ${image.prompt.substring(0, 120)}...`);

  // Build Z-Image Turbo workflow
  const workflow = buildZImageSimpleWorkflow({
    prompt: image.prompt,
    negativePrompt: NEGATIVE_PROMPT,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    steps: 9, // Z-Image Turbo uses 9 steps (8 DiT forwards)
    cfg: 1.0, // Z-Image Turbo uses cfg 1.0
    seed: Math.floor(Math.random() * 2 ** 32),
    filenamePrefix: `ryla_ethnicity_${image.ethnicity}_${image.gender}_${image.type}`,
  });

  console.log(`   ✓ Workflow built, queuing to ComfyUI pod...`);

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
  await saveImageAsWebP(imageBuffer, image.outputPath);
  
  console.log(`   ✓ Saved to ${image.outputPath}`);
  
  // Check file size
  const stats = fs.statSync(image.outputPath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  console.log(`   ✓ File size: ${fileSizeKB} KB`);
  
  if (stats.size > 100 * 1024) {
    console.warn(`   ⚠️  Warning: File size exceeds 100KB target (${fileSizeKB} KB)`);
  }
}

async function main() {
  console.log('🎨 Ethnicity Image Generator');
  console.log('============================\n');
  console.log('Generating ethnicity-specific character images for EP-034');
  console.log('Each ethnicity will have distinct features, regional backgrounds, and authentic beauty marks.\n');

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
  const isHealthy = await client.healthCheck();
  if (!isHealthy) {
    console.error('❌ ComfyUI pod is not responding. Please check the pod URL and ensure the pod is running.');
    process.exit(1);
  }
  console.log('✓ ComfyUI pod is healthy\n');

  // Ensure directories exist
  await ensureDirectories();

  // Get ethnicity images to generate
  const ethnicityImages = getEthnicityImages();
  console.log(`\n📋 Found ${ethnicityImages.length} ethnicity images to generate:`);
  console.log(`   - Full body: ${ethnicityImages.filter(img => img.type === 'full-body').length}`);
  console.log(`   - Portrait: ${ethnicityImages.filter(img => img.type === 'portrait').length}`);
  console.log(`   - Total: ${ethnicityImages.length} images\n`);

  // Generate each ethnicity image
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < ethnicityImages.length; i++) {
    const image = ethnicityImages[i];
    try {
      // Check if already exists
      if (fs.existsSync(image.outputPath)) {
        console.log(`\n⏭️  Skipping ${image.name} (already exists)`);
        successCount++;
        continue;
      }

      await generateEthnicityImage(image, client);
      successCount++;
      
      // Rate limiting: wait 1 second between requests (except for last one)
      if (i < ethnicityImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${image.name}:`, error);
      failCount++;
      
      // Wait a bit longer on error before retrying
      if (i < ethnicityImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.log(`\n✅ Generation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total: ${ethnicityImages.length}`);
  
  if (successCount === ethnicityImages.length) {
    console.log(`\n🎉 All ethnicity images generated successfully!`);
    console.log(`   Next step: Run optimization script to compress images`);
    console.log(`   Command: python3 scripts/generation/optimize-ethnicity-images.py`);
  }
}

// Run if executed directly (Node.js)
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { getEthnicityImages, ensureDirectories, generateEthnicityImage };
