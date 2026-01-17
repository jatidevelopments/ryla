/**
 * Generate Ethnicity-Specific Archetype Images using Local RunPod ComfyUI with Z-Image Turbo
 * 
 * This script generates ethnicity-specific images for:
 * - Archetypes (6 types × 7 ethnicities = 42 images)
 * 
 * Each image is ethnicity-specific with:
 * - Distinct ethnic features
 * - Regional backgrounds matching archetype
 * - Authentic persona representation
 * - Clear focus on the archetype personality
 * - Influencer-style, emotional, happy, sexy appearance
 * 
 * Uses local ComfyUI pod with Z-Image Turbo workflow.
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

// Negative prompt for archetype images (SFW only)
const NEGATIVE_PROMPT = 'deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature, no person, empty scene, no character, nude, naked, no clothing, bare skin, exposed, topless, bottomless, see-through, transparent clothing, revealing, lingerie, underwear visible, cleavage, white background, plain background, blank background, stereotypical, caricature, offensive';

// Ethnicity configurations
interface EthnicityConfig {
  value: string;
  displayName: string;
  regionalBackground: string;
  beautyMarks: string;
  skinFeatures: string;
  defaultHairColor: string;
  defaultEyeColor: string;
}

const ETHNICITY_CONFIGS: Record<string, EthnicityConfig> = {
  asian: {
    value: 'asian',
    displayName: 'Asian',
    regionalBackground: 'modern Asian cityscape, Tokyo or Seoul urban background, cherry blossoms, traditional and modern architecture blend, vibrant city lights, Asian cultural elements',
    beautyMarks: 'small beauty mark on cheek, natural skin texture, flawless complexion',
    skinFeatures: 'fair smooth skin, delicate features, natural Asian skin tone',
    defaultHairColor: 'black',
    defaultEyeColor: 'brown',
  },
  black: {
    value: 'black',
    displayName: 'Black',
    regionalBackground: 'vibrant African cityscape, modern African architecture, warm sunset colors, cultural elements, urban African setting, rich cultural heritage',
    beautyMarks: 'natural beauty marks, melanin-rich skin, beautiful skin texture',
    skinFeatures: 'rich dark skin, beautiful melanin-rich complexion, natural skin glow',
    defaultHairColor: 'black',
    defaultEyeColor: 'brown',
  },
  caucasian: {
    value: 'caucasian',
    displayName: 'Caucasian',
    regionalBackground: 'European cityscape, Paris or London urban background, classic European architecture, elegant streets, European cultural elements',
    beautyMarks: 'freckles on cheeks, natural beauty marks, rosy complexion, actress-like features',
    skinFeatures: 'fair smooth skin, natural European skin tone, healthy glow, screen actress appearance, model-like features',
    defaultHairColor: 'brown',
    defaultEyeColor: 'brown',
  },
  latina: {
    value: 'latina',
    displayName: 'Latina',
    regionalBackground: 'Latin American cityscape, colorful Mexican or Brazilian urban background, vibrant colors, tropical elements, warm cultural atmosphere',
    beautyMarks: 'natural beauty marks, warm skin tone, sun-kissed glow',
    skinFeatures: 'warm tanned skin, olive complexion, natural Latin American skin tone',
    defaultHairColor: 'brown',
    defaultEyeColor: 'brown',
  },
  arabian: {
    value: 'arabian',
    displayName: 'Arab',
    regionalBackground: 'Middle Eastern cityscape, Dubai or Istanbul urban background, modern Middle Eastern architecture, desert elements, cultural heritage',
    beautyMarks: 'natural beauty marks, olive skin tone, elegant features',
    skinFeatures: 'olive skin, warm Mediterranean complexion, natural Middle Eastern skin tone',
    defaultHairColor: 'brown',
    defaultEyeColor: 'brown',
  },
  indian: {
    value: 'indian',
    displayName: 'Indian',
    regionalBackground: 'South Asian cityscape, Mumbai or Delhi urban background, vibrant Indian architecture, colorful cultural elements, rich heritage',
    beautyMarks: 'natural beauty mark on forehead area, natural beauty marks, warm skin tone',
    skinFeatures: 'warm brown skin, natural South Asian complexion, healthy glow',
    defaultHairColor: 'black',
    defaultEyeColor: 'brown',
  },
  mixed: {
    value: 'mixed',
    displayName: 'Mixed',
    regionalBackground: 'diverse urban cityscape, multicultural city background, modern cosmopolitan setting, diverse cultural elements, global city atmosphere',
    beautyMarks: 'natural beauty marks, unique mixed heritage features, diverse skin tone',
    skinFeatures: 'mixed heritage skin tone, unique complexion, natural diversity',
    defaultHairColor: 'brown',
    defaultEyeColor: 'brown',
  },
};

// Archetype definitions with prompts
interface ArchetypeConfig {
  id: string;
  label: string;
  outfit: string;
  pose: string;
  expression: string;
  setting: string;
  accessories: string;
}

const ARCHETYPE_CONFIGS: ArchetypeConfig[] = [
  {
    id: 'girl-next-door',
    label: 'Girl Next Door',
    outfit: 'casual sundress, simple cotton dress, comfortable everyday clothing',
    pose: 'relaxed natural pose, friendly approachable stance, genuine smile',
    expression: 'warm friendly smile, approachable expression, kind eyes, natural happiness',
    setting: 'cozy neighborhood background, suburban setting, picket fence, garden flowers',
    accessories: 'simple jewelry, natural makeup, minimal accessories',
  },
  {
    id: 'fitness-enthusiast',
    label: 'Fitness Enthusiast',
    outfit: 'athletic wear, sports bra and leggings, gym clothes, workout outfit',
    pose: 'confident athletic stance, energetic pose, fitness motivation pose',
    expression: 'determined confident expression, energetic smile, motivated look',
    setting: 'modern gym background, fitness studio, outdoor workout area, yoga studio',
    accessories: 'fitness tracker, water bottle, headphones, athletic accessories',
  },
  {
    id: 'luxury-lifestyle',
    label: 'Luxury Lifestyle',
    outfit: 'designer dress, elegant gown, haute couture, sophisticated attire',
    pose: 'elegant refined pose, sophisticated stance, model-like posture',
    expression: 'sophisticated smile, elegant expression, confident glamorous look',
    setting: 'luxury penthouse, yacht deck, five-star hotel, upscale restaurant background',
    accessories: 'designer jewelry, luxury handbag, diamond earrings, expensive watch',
  },
  {
    id: 'mysterious-edgy',
    label: 'Mysterious & Edgy',
    outfit: 'dark gothic clothing, leather jacket, alternative fashion, edgy streetwear',
    pose: 'mysterious alluring pose, confident edgy stance, sultry posture',
    expression: 'mysterious smirk, intense gaze, sultry expression, enigmatic look',
    setting: 'urban alley, neon-lit street, moody city background, underground club',
    accessories: 'dark jewelry, choker necklace, statement rings, alternative accessories',
  },
  {
    id: 'playful-fun',
    label: 'Playful & Fun',
    outfit: 'colorful trendy outfit, fun casual wear, playful dress, bright colors',
    pose: 'dynamic playful pose, energetic stance, fun movement, carefree posture',
    expression: 'bright genuine smile, laughing expression, joyful happy face, excited look',
    setting: 'colorful party background, carnival setting, beach party, festival atmosphere',
    accessories: 'fun colorful jewelry, trendy accessories, playful hair accessories',
  },
  {
    id: 'professional-boss',
    label: 'Professional Boss',
    outfit: 'power suit, business attire, professional blazer, executive clothing',
    pose: 'confident power pose, authoritative stance, professional posture, CEO presence',
    expression: 'confident professional smile, determined expression, commanding presence',
    setting: 'modern office, executive boardroom, corporate building, professional workspace',
    accessories: 'elegant watch, professional briefcase, designer glasses, business jewelry',
  },
];

// Image generation interface
interface ImageToGenerate {
  archetype: string;
  archetypeLabel: string;
  ethnicity: string;
  prompt: string;
  outputPath: string;
  name: string;
}

function getArchetypePrompt(archetype: ArchetypeConfig, ethnicity: string): string {
  const config = ETHNICITY_CONFIGS[ethnicity];
  
  return `gorgeous beautiful attractive ${config.displayName} woman, ${config.skinFeatures}, ${config.defaultHairColor} hair, ${config.defaultEyeColor} eyes, ${archetype.expression}, ${archetype.pose}, wearing ${archetype.outfit}, ${archetype.accessories}, ${archetype.setting}, ${config.beautyMarks}, influencer social media star, stunning gorgeous appearance, captivating beauty, perfect lighting, ${BASE_STYLE}`;
}

function buildImageList(): ImageToGenerate[] {
  const images: ImageToGenerate[] = [];
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');

  for (const ethnicity of Object.keys(ETHNICITY_CONFIGS)) {
    for (const archetype of ARCHETYPE_CONFIGS) {
      const prompt = getArchetypePrompt(archetype, ethnicity);
      const fileName = `archetype-${archetype.id}-${ethnicity}.webp`;
      const outputPath = path.join(publicDir, 'images', 'wizard', 'personality', ethnicity, 'archetypes', fileName);

      images.push({
        archetype: archetype.id,
        archetypeLabel: archetype.label,
        ethnicity,
        prompt,
        outputPath,
        name: `${ETHNICITY_CONFIGS[ethnicity].displayName} - ${archetype.label}`,
      });
    }
  }

  return images;
}

async function generateImage(
  client: ComfyUIPodClient,
  image: ImageToGenerate,
  index: number,
  total: number
): Promise<boolean> {
  console.log(`\n[${index + 1}/${total}] Generating: ${image.name}`);
  console.log(`  Archetype: ${image.archetypeLabel}`);
  console.log(`  Ethnicity: ${image.ethnicity}`);

  // Check if image already exists
  if (fs.existsSync(image.outputPath)) {
    console.log(`  ⏭️  Skipping (already exists)`);
    return true;
  }

  // Ensure output directory exists
  const outputDir = path.dirname(image.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Build workflow
    const workflow = buildZImageSimpleWorkflow({
      prompt: image.prompt,
      negativePrompt: NEGATIVE_PROMPT,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      steps: 6,
      cfg: 2.0,
      seed: Math.floor(Math.random() * 1000000000),
    });

    // Execute workflow and wait for completion
    console.log(`  📤 Queuing workflow...`);
    const result = await client.executeWorkflow(workflow, 2000);

    if (result.status === 'completed' && result.images && result.images.length > 0) {
      // Save first image (base64 data URL)
      const imageDataUrl = result.images[0];
      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      fs.writeFileSync(image.outputPath, imageBuffer);
      console.log(`  ✅ Saved: ${path.basename(image.outputPath)}`);
      return true;
    } else if (result.status === 'failed') {
      console.error(`  ❌ Generation failed: ${result.error || 'Unknown error'}`);
      return false;
    } else {
      console.error(`  ❌ No images in result`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function main() {
  console.log('🎭 Archetype Image Generation Script');
  console.log('=====================================\n');

  // Get RunPod URL - try multiple env var names
  const runpodUrl = process.env.COMFYUI_POD_URL || process.env.RUNPOD_COMFYUI_URL;
  if (!runpodUrl) {
    console.error('❌ COMFYUI_POD_URL environment variable not set');
    console.log('\nTo set it:');
    console.log('  1. Start your RunPod pod');
    console.log('  2. Get the proxy URL (e.g., https://xxxxx-8188.proxy.runpod.net)');
    console.log('  3. Add to apps/api/.env: COMFYUI_POD_URL="https://xxxxx-8188.proxy.runpod.net"');
    process.exit(1);
  }

  // Initialize client
  const client = new ComfyUIPodClient({ baseUrl: runpodUrl });

  // Test connection
  console.log('🔌 Testing connection to ComfyUI...');
  try {
    const isHealthy = await client.healthCheck();
    if (!isHealthy) {
      throw new Error('Health check returned false');
    }
    console.log('✅ Connected to ComfyUI\n');
  } catch (error) {
    console.error('❌ Failed to connect to ComfyUI:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }

  // Build image list
  const images = buildImageList();
  console.log(`📋 Total images to generate: ${images.length}`);
  console.log(`   (6 archetypes × 7 ethnicities = 42 images)\n`);

  // Count existing images
  const existingCount = images.filter((img) => fs.existsSync(img.outputPath)).length;
  console.log(`   Existing: ${existingCount}`);
  console.log(`   To generate: ${images.length - existingCount}\n`);

  // Generate images
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < images.length; i++) {
    const success = await generateImage(client, images[i], i, images.length);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Small delay between generations
    if (i < images.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n=====================================');
  console.log('📊 Generation Complete!');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log('=====================================\n');
}

main().catch(console.error);
