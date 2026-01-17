/**
 * Generate Ethnicity-Specific Feature Images using Local RunPod ComfyUI with Z-Image Turbo
 * 
 * This script generates ethnicity-specific feature images for EP-036:
 * - Hair styles (7 female + 7 male styles × 7 ethnicities)
 * - Eye colors (6 colors × 7 ethnicities × 2 genders)
 * - Hair colors (7 colors × 7 ethnicities × 2 genders)
 * - Face shapes (5 shapes × 7 ethnicities × 2 genders)
 * - Age ranges (4 ranges × 7 ethnicities × 2 genders)
 * 
 * Each image is ethnicity-specific with:
 * - Distinct ethnic features
 * - Regional backgrounds
 * - Authentic beauty marks and features
 * - Clear focus on the specific feature
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

// Negative prompt for feature images (SFW only) - Strong emphasis on clothing
const NEGATIVE_PROMPT = 'deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature, no person, empty scene, no character, nude, naked, no clothing, bare skin, exposed, topless, bottomless, see-through, transparent clothing, revealing, lingerie, underwear visible, cleavage, white background, plain background, blank background, stereotypical, caricature, offensive';

// Ethnicity configurations (reuse from ethnicity generation)
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

// Feature definitions
const HAIR_STYLES = {
  female: ['long', 'short', 'braids', 'ponytail', 'bangs', 'bun', 'wavy'],
  male: ['short', 'long', 'crew-cut', 'wavy', 'pompadour', 'layered-cut', 'bald'],
};

const EYE_COLORS = ['brown', 'blue', 'green', 'hazel', 'gray', 'amber'];

const HAIR_COLORS = ['black', 'brown', 'blonde', 'auburn', 'red', 'gray', 'white'];

const FACE_SHAPES = ['oval', 'round', 'square', 'heart', 'diamond'];

const AGE_RANGES = [
  { value: '18-25', min: 18, max: 25 },
  { value: '26-33', min: 26, max: 33 },
  { value: '34-41', min: 34, max: 41 },
  { value: '42-50', min: 42, max: 50 },
];

interface FeatureImage {
  category: 'hair-style' | 'eye-color' | 'hair-color' | 'face-shape' | 'age-range';
  ethnicity: string;
  gender: 'female' | 'male';
  featureValue: string;
  prompt: string;
  outputPath: string;
  name: string;
}

function getHairStyleDescription(style: string, gender: 'female' | 'male'): string {
  const descriptions: Record<string, string> = {
    'long': gender === 'female' ? 'long flowing hair' : 'long hair',
    'short': 'short hair',
    'braids': 'braided hair, beautiful braids',
    'ponytail': 'ponytail hairstyle',
    'bangs': 'hair with bangs',
    'bun': 'hair in a bun',
    'wavy': 'wavy hair',
    'crew-cut': 'crew cut hairstyle',
    'pompadour': 'pompadour hairstyle',
    'layered-cut': 'layered haircut',
    'bald': 'bald head, no hair',
  };
  return descriptions[style] || style;
}

function getFeaturePrompt(
  category: 'hair-style' | 'eye-color' | 'hair-color' | 'face-shape' | 'age-range',
  ethnicity: string,
  gender: 'female' | 'male',
  featureValue: string
): string {
  const config = ETHNICITY_CONFIGS[ethnicity];
  if (!config) {
    throw new Error(`Unknown ethnicity: ${ethnicity}`);
  }

  const genderTerm = gender === 'female' ? 'beautiful, attractive woman' : 'handsome, attractive man';
  const age = gender === 'female' ? 25 : 28;
  const bodyType = gender === 'female' ? 'slim athletic body type' : 'athletic body type';
  const outfit = 'fully clothed, casual stylish outfit, appropriate clothing, modest attire, well-dressed, professional clothing, complete outfit';

  let prompt = '';
  let focusInstruction = '';

  switch (category) {
    case 'hair-style': {
      const hairStyleDesc = getHairStyleDescription(featureValue, gender);
      const hairColor = config.defaultHairColor;
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyleDesc}, ${config.defaultEyeColor} eyes, ${bodyType}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', hair style clearly visible, focus on hair, hair prominently featured';
      break;
    }
    case 'eye-color': {
      const hairColor = config.defaultHairColor;
      const hairStyle = gender === 'female' ? 'long hair' : 'short hair';
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyle}, ${featureValue} eyes, ${bodyType}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', close-up of eyes, eye color clearly visible, focus on eyes, eyes prominently featured';
      break;
    }
    case 'hair-color': {
      const hairStyle = gender === 'female' ? 'long hair' : 'short hair';
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${featureValue} ${hairStyle}, ${config.defaultEyeColor} eyes, ${bodyType}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', hair color clearly visible, focus on hair, hair prominently featured';
      break;
    }
    case 'face-shape': {
      const hairColor = config.defaultHairColor;
      const hairStyle = gender === 'female' ? 'long hair' : 'short hair';
      const faceShapeDesc = featureValue === 'oval' ? 'oval face shape' : 
                           featureValue === 'round' ? 'round face shape' :
                           featureValue === 'square' ? 'square face shape' :
                           featureValue === 'heart' ? 'heart-shaped face' :
                           featureValue === 'diamond' ? 'diamond face shape' : featureValue;
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyle}, ${config.defaultEyeColor} eyes, ${faceShapeDesc}, ${bodyType}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', face shape clearly visible, focus on facial structure, face prominently featured';
      break;
    }
    case 'age-range': {
      const ageRange = AGE_RANGES.find(r => r.value === featureValue);
      const age = ageRange ? Math.floor((ageRange.min + ageRange.max) / 2) : 30;
      const hairColor = config.defaultHairColor;
      const hairStyle = gender === 'female' ? 'long hair' : 'short hair';
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyle}, ${config.defaultEyeColor} eyes, ${bodyType}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', age-appropriate appearance, focus on age characteristics';
      break;
    }
  }

  // Add background
  prompt += `, in ${config.regionalBackground}`;

  // Add influencer style and focus
  prompt += `, influencer style portrait, close-up portrait, head and shoulders, face clearly visible, beautiful facial features, happy expression, genuine smile, confident pose, sexy attractive look, emotional connection, unique personality, social media influencer aesthetic, engaging eye contact, natural lighting${focusInstruction}, ${BASE_STYLE}`;

  return prompt;
}

function getAllFeatureImages(): FeatureImage[] {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const images: FeatureImage[] = [];
  const ethnicities = Object.keys(ETHNICITY_CONFIGS);
  const genders: ('female' | 'male')[] = ['female', 'male'];

  // Hair Styles
  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      for (const style of HAIR_STYLES[gender]) {
        const prompt = getFeaturePrompt('hair-style', ethnicity, gender, style);
        const fileName = `${style}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'hair', ethnicity, 'styles', fileName);
        
        images.push({
          category: 'hair-style',
          ethnicity,
          gender,
          featureValue: style,
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${style} Hair`,
        });
      }
    }
  }

  // Eye Colors
  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      for (const color of EYE_COLORS) {
        const prompt = getFeaturePrompt('eye-color', ethnicity, gender, color);
        const fileName = `${color}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'eyes', ethnicity, 'colors', fileName);
        
        images.push({
          category: 'eye-color',
          ethnicity,
          gender,
          featureValue: color,
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${color} Eyes`,
        });
      }
    }
  }

  // Hair Colors
  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      for (const color of HAIR_COLORS) {
        const prompt = getFeaturePrompt('hair-color', ethnicity, gender, color);
        const fileName = `${color}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'hair', ethnicity, 'colors', fileName);
        
        images.push({
          category: 'hair-color',
          ethnicity,
          gender,
          featureValue: color,
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${color} Hair`,
        });
      }
    }
  }

  // Face Shapes
  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      for (const shape of FACE_SHAPES) {
        const prompt = getFeaturePrompt('face-shape', ethnicity, gender, shape);
        const fileName = `${shape}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'appearance', ethnicity, 'face-shapes', fileName);
        
        images.push({
          category: 'face-shape',
          ethnicity,
          gender,
          featureValue: shape,
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${shape} Face`,
        });
      }
    }
  }

  // Age Ranges
  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      for (const ageRange of AGE_RANGES) {
        const prompt = getFeaturePrompt('age-range', ethnicity, gender, ageRange.value);
        const fileName = `${ageRange.value}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'appearance', ethnicity, 'age-ranges', fileName);
        
        images.push({
          category: 'age-range',
          ethnicity,
          gender,
          featureValue: ageRange.value,
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - Age ${ageRange.value}`,
        });
      }
    }
  }

  return images;
}

async function ensureDirectories(): Promise<void> {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const ethnicities = Object.keys(ETHNICITY_CONFIGS);
  
  // Hair styles and colors
  for (const ethnicity of ethnicities) {
    const hairStylesDir = path.join(publicDir, 'images', 'wizard', 'hair', ethnicity, 'styles');
    const hairColorsDir = path.join(publicDir, 'images', 'wizard', 'hair', ethnicity, 'colors');
    for (const dir of [hairStylesDir, hairColorsDir]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✓ Created directory: ${dir}`);
      }
    }
  }
  
  // Eye colors
  for (const ethnicity of ethnicities) {
    const eyeColorsDir = path.join(publicDir, 'images', 'wizard', 'eyes', ethnicity, 'colors');
    if (!fs.existsSync(eyeColorsDir)) {
      fs.mkdirSync(eyeColorsDir, { recursive: true });
      console.log(`✓ Created directory: ${eyeColorsDir}`);
    }
  }
  
  // Face shapes and age ranges
  for (const ethnicity of ethnicities) {
    const faceShapesDir = path.join(publicDir, 'images', 'wizard', 'appearance', ethnicity, 'face-shapes');
    const ageRangesDir = path.join(publicDir, 'images', 'wizard', 'appearance', ethnicity, 'age-ranges');
    for (const dir of [faceShapesDir, ageRangesDir]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✓ Created directory: ${dir}`);
      }
    }
  }
}

async function saveImageAsWebP(imageBuffer: Buffer, outputPath: string): Promise<void> {
  fs.writeFileSync(outputPath, imageBuffer);
}

async function generateFeatureImage(
  image: FeatureImage,
  client: ComfyUIPodClient,
  retries = 3
): Promise<void> {
  console.log(`\n📸 Generating: ${image.name}`);
  console.log(`   Category: ${image.category}, Ethnicity: ${image.ethnicity}, Gender: ${image.gender}`);
  console.log(`   Prompt: ${image.prompt.substring(0, 120)}...`);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`   🔄 Retry attempt ${attempt}/${retries}...`);
        // Wait longer between retries
        await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
        
        // Re-check health on retry
        const isHealthy = await client.healthCheck();
        if (!isHealthy) {
          throw new Error('ComfyUI pod is not responding');
        }
      }

      // Build Z-Image Turbo workflow
      const workflow = buildZImageSimpleWorkflow({
        prompt: image.prompt,
        negativePrompt: NEGATIVE_PROMPT,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        steps: 9, // Z-Image Turbo uses 9 steps (8 DiT forwards)
        cfg: 1.0, // Z-Image Turbo uses cfg 1.0
        seed: Math.floor(Math.random() * 2 ** 32),
        filenamePrefix: `ryla_${image.category}_${image.ethnicity}_${image.gender}_${image.featureValue}`,
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

      // Success - return
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`   ❌ Attempt ${attempt}/${retries} failed: ${lastError.message}`);
      
      if (attempt === retries) {
        throw lastError;
      }
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('Unknown error');
}

async function main() {
  console.log('🎨 Ethnicity-Specific Feature Image Generator');
  console.log('==============================================\n');
  console.log('Generating ethnicity-specific feature images for EP-036');
  console.log('Each image will have distinct ethnic features, regional backgrounds, and clear feature focus.\n');

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
    timeout: 300000, // 5 minutes timeout (increased for reliability)
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

  // Get all feature images to generate
  const featureImages = getAllFeatureImages();
  console.log(`\n📋 Found ${featureImages.length} feature images to generate:`);
  console.log(`   - Hair Styles: ${featureImages.filter(img => img.category === 'hair-style').length}`);
  console.log(`   - Eye Colors: ${featureImages.filter(img => img.category === 'eye-color').length}`);
  console.log(`   - Hair Colors: ${featureImages.filter(img => img.category === 'hair-color').length}`);
  console.log(`   - Face Shapes: ${featureImages.filter(img => img.category === 'face-shape').length}`);
  console.log(`   - Age Ranges: ${featureImages.filter(img => img.category === 'age-range').length}`);
  console.log(`   - Total: ${featureImages.length} images\n`);

  // Generate each feature image
  let successCount = 0;
  let failCount = 0;
  const failedImages: FeatureImage[] = [];

  for (let i = 0; i < featureImages.length; i++) {
    const image = featureImages[i];
    try {
      // Check if already exists
      if (fs.existsSync(image.outputPath)) {
        console.log(`\n⏭️  Skipping ${image.name} (already exists)`);
        successCount++;
        continue;
      }

      // Progress indicator
      const progress = ((i + 1) / featureImages.length * 100).toFixed(1);
      console.log(`\n[${i + 1}/${featureImages.length}] (${progress}%)`);

      await generateFeatureImage(image, client);
      successCount++;
      
      // Rate limiting: wait 1 second between requests (except for last one)
      if (i < featureImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to generate ${image.name}: ${errorMessage}`);
      failCount++;
      failedImages.push(image);
      
      // Wait a bit longer on error before continuing
      if (i < featureImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Periodic health check every 10 images
    if ((i + 1) % 10 === 0) {
      console.log(`\n🔍 Health check (${i + 1}/${featureImages.length} processed)...`);
      const isHealthy = await client.healthCheck();
      if (!isHealthy) {
        console.error('❌ ComfyUI pod is not responding. Pausing for 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        // Re-check
        const stillUnhealthy = !(await client.healthCheck());
        if (stillUnhealthy) {
          console.error('❌ ComfyUI pod is still not responding. Exiting.');
          console.log(`\n📊 Progress so far:`);
          console.log(`   Success: ${successCount}`);
          console.log(`   Failed: ${failCount}`);
          console.log(`   Remaining: ${featureImages.length - successCount - failCount}`);
          process.exit(1);
        }
      }
      console.log('✓ Pod is healthy, continuing...\n');
    }
  }

  console.log(`\n✅ Generation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total: ${featureImages.length}`);
  
  if (failedImages.length > 0) {
    console.log(`\n⚠️  Failed images (${failedImages.length}):`);
    failedImages.forEach(img => {
      console.log(`   - ${img.name} (${img.category}, ${img.ethnicity}, ${img.gender})`);
    });
    console.log(`\n💡 You can re-run this script to retry failed images (it will skip existing ones)`);
  }
  
  if (successCount === featureImages.length) {
    console.log(`\n🎉 All ethnicity-specific feature images generated successfully!`);
    console.log(`   Next step: Run optimization script to compress images`);
    console.log(`   Command: python3 scripts/generation/optimize-ethnicity-features.py`);
  } else {
    console.log(`\n📝 Partial completion. Re-run the script to continue generating remaining images.`);
  }
}

// Run if executed directly (Node.js)
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { getAllFeatureImages, ensureDirectories, generateFeatureImage };
