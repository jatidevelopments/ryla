/**
 * Generate Outfit Gallery Thumbnails using Local RunPod ComfyUI with Z-Image Turbo
 * 
 * This script generates close-up outfit thumbnail images showing the body with
 * part of the outfit or accessory visible. Characters are NOT naked (except for
 * adult outfits which can be minimal/nude).
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

// Thumbnail dimensions: 4:5 aspect ratio (matches UI aspect-[4/5])
const THUMBNAIL_WIDTH = 768;
const THUMBNAIL_HEIGHT = 960;

// Base prompt template for consistent style and quality
const BASE_STYLE = '8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality';

// Outfit definitions from outfit-options.ts
interface Outfit {
  label: string;
  category: 'casual' | 'glamour' | 'intimate' | 'fantasy' | 'kinky' | 'sexual';
  isAdult?: boolean;
}

const OUTFITS: Outfit[] = [
  // Casual (10)
  { label: 'Casual Streetwear', category: 'casual' },
  { label: 'Athleisure', category: 'casual' },
  { label: 'Yoga', category: 'casual' },
  { label: 'Jeans', category: 'casual' },
  { label: 'Tank Top', category: 'casual' },
  { label: 'Crop Top', category: 'casual' },
  { label: 'Hoodie', category: 'casual' },
  { label: 'Sweatpants', category: 'casual' },
  { label: 'Denim Jacket', category: 'casual' },
  { label: 'Sneakers & Leggings', category: 'casual' },
  // Glamour (10)
  { label: 'Date Night Glam', category: 'glamour' },
  { label: 'Cocktail Dress', category: 'glamour' },
  { label: 'Mini Skirt', category: 'glamour' },
  { label: 'Dress', category: 'glamour' },
  { label: 'Summer Chic', category: 'glamour' },
  { label: 'Evening Gown', category: 'glamour' },
  { label: 'Bodycon Dress', category: 'glamour' },
  { label: 'High Heels & Dress', category: 'glamour' },
  { label: 'Formal Attire', category: 'glamour' },
  { label: 'Red Carpet', category: 'glamour' },
  // Intimate (10)
  { label: 'Bikini', category: 'intimate' },
  { label: 'Lingerie', category: 'intimate' },
  { label: 'Swimsuit', category: 'intimate' },
  { label: 'Nightgown', category: 'intimate' },
  { label: 'Leotard', category: 'intimate' },
  { label: 'Teddy', category: 'intimate' },
  { label: 'Babydoll', category: 'intimate' },
  { label: 'Bodysuit', category: 'intimate' },
  { label: 'Chemise', category: 'intimate' },
  { label: 'Slip', category: 'intimate' },
  // Fantasy (10)
  { label: 'Cheerleader', category: 'fantasy' },
  { label: 'Nurse', category: 'fantasy' },
  { label: 'Maid', category: 'fantasy' },
  { label: 'Student Uniform', category: 'fantasy' },
  { label: 'Police Officer', category: 'fantasy' },
  { label: 'Bunny', category: 'fantasy' },
  { label: 'Cat', category: 'fantasy' },
  { label: 'Princess', category: 'fantasy' },
  { label: 'Superhero', category: 'fantasy' },
  { label: 'Witch', category: 'fantasy' },
  // Kinky (NSFW) (15)
  { label: 'Bondage Gear', category: 'kinky', isAdult: true },
  { label: 'Leather Outfit', category: 'kinky', isAdult: true },
  { label: 'Latex', category: 'kinky', isAdult: true },
  { label: 'Corset', category: 'kinky', isAdult: true },
  { label: 'Fishnet Stockings', category: 'kinky', isAdult: true },
  { label: 'Garter Belt', category: 'kinky', isAdult: true },
  { label: 'Thigh Highs', category: 'kinky', isAdult: true },
  { label: 'Collar & Leash', category: 'kinky', isAdult: true },
  { label: 'PVC Outfit', category: 'kinky', isAdult: true },
  { label: 'Harness', category: 'kinky', isAdult: true },
  { label: 'Cage Bra', category: 'kinky', isAdult: true },
  { label: 'Pasties Only', category: 'kinky', isAdult: true },
  { label: 'Body Harness', category: 'kinky', isAdult: true },
  { label: 'Strap-On', category: 'kinky', isAdult: true },
  { label: 'Bondage Rope', category: 'kinky', isAdult: true },
  // Sexual (NSFW) (15)
  { label: 'Nude', category: 'sexual', isAdult: true },
  { label: 'Topless', category: 'sexual', isAdult: true },
  { label: 'Bottomless', category: 'sexual', isAdult: true },
  { label: 'See-Through', category: 'sexual', isAdult: true },
  { label: 'Wet T-Shirt', category: 'sexual', isAdult: true },
  { label: 'Oil Covered', category: 'sexual', isAdult: true },
  { label: 'Shower Scene', category: 'sexual', isAdult: true },
  { label: 'Bed Sheets Only', category: 'sexual', isAdult: true },
  { label: 'Towel Wrap', category: 'sexual', isAdult: true },
  { label: 'Open Robe', category: 'sexual', isAdult: true },
  { label: 'Peek-a-Boo', category: 'sexual', isAdult: true },
  { label: 'Micro Bikini', category: 'sexual', isAdult: true },
  { label: 'Pasties & Thong', category: 'sexual', isAdult: true },
  { label: 'Body Paint', category: 'sexual', isAdult: true },
  { label: 'Edible Outfit', category: 'sexual', isAdult: true },
];

function getOutfitDescription(outfit: Outfit): string {
  // Detailed outfit descriptions for close-up body shots
  const descriptions: Record<string, string> = {
    // Casual
    'Casual Streetwear': 'close-up body shot, wearing casual streetwear outfit, trendy urban fashion, comfortable stylish clothing, modern casual wear, outfit clearly visible',
    'Athleisure': 'close-up body shot, wearing athleisure outfit, athletic casual wear, sporty comfortable clothing, active lifestyle outfit, outfit clearly visible',
    'Yoga': 'close-up body shot, wearing yoga outfit, yoga pants and top, athletic yoga wear, comfortable stretchy clothing, outfit clearly visible',
    'Jeans': 'close-up body shot, wearing jeans, denim jeans outfit, casual jeans look, stylish denim clothing, outfit clearly visible',
    'Tank Top': 'close-up body shot, wearing tank top, casual tank top outfit, comfortable casual top, simple stylish top, outfit clearly visible',
    'Crop Top': 'close-up body shot, wearing crop top, trendy crop top outfit, fashionable crop top, modern casual top, outfit clearly visible',
    'Hoodie': 'close-up body shot, wearing hoodie, casual hoodie outfit, comfortable hoodie, cozy casual wear, outfit clearly visible',
    'Sweatpants': 'close-up body shot, wearing sweatpants, casual sweatpants outfit, comfortable athletic pants, relaxed casual wear, outfit clearly visible',
    'Denim Jacket': 'close-up body shot, wearing denim jacket, stylish denim jacket outfit, classic denim jacket, fashionable outerwear, outfit clearly visible',
    'Sneakers & Leggings': 'close-up body shot, wearing sneakers and leggings, athletic leggings with sneakers, sporty casual outfit, active wear, outfit clearly visible',
    // Glamour
    'Date Night Glam': 'close-up body shot, wearing date night glam outfit, elegant glamorous dress, sophisticated evening wear, stylish formal outfit, outfit clearly visible',
    'Cocktail Dress': 'close-up body shot, wearing cocktail dress, elegant cocktail dress, sophisticated party dress, stylish formal wear, outfit clearly visible',
    'Mini Skirt': 'close-up body shot, wearing mini skirt outfit, fashionable mini skirt, trendy skirt look, stylish casual dressy outfit, outfit clearly visible',
    'Dress': 'close-up body shot, wearing dress, elegant dress outfit, stylish dress, fashionable dress, outfit clearly visible',
    'Summer Chic': 'close-up body shot, wearing summer chic outfit, light summer dress, breezy summer fashion, elegant summer wear, outfit clearly visible',
    'Evening Gown': 'close-up body shot, wearing evening gown, elegant formal gown, sophisticated evening dress, glamorous formal wear, outfit clearly visible',
    'Bodycon Dress': 'close-up body shot, wearing bodycon dress, fitted bodycon dress, form-fitting dress, stylish fitted outfit, outfit clearly visible',
    'High Heels & Dress': 'close-up body shot, wearing high heels and dress, elegant dress with high heels, sophisticated formal outfit, stylish heels and dress, outfit clearly visible',
    'Formal Attire': 'close-up body shot, wearing formal attire, elegant formal outfit, sophisticated formal wear, professional formal clothing, outfit clearly visible',
    'Red Carpet': 'close-up body shot, wearing red carpet outfit, glamorous red carpet dress, elegant formal gown, sophisticated celebrity style, outfit clearly visible',
    // Intimate
    'Bikini': 'close-up body shot, wearing bikini, swimwear bikini, beach bikini outfit, two-piece swimsuit, outfit clearly visible',
    'Lingerie': 'close-up body shot, wearing lingerie, elegant lingerie set, beautiful intimate wear, sophisticated lingerie, outfit clearly visible',
    'Swimsuit': 'close-up body shot, wearing swimsuit, one-piece swimsuit, elegant swimwear, beach swimsuit outfit, outfit clearly visible',
    'Nightgown': 'close-up body shot, wearing nightgown, elegant nightgown, comfortable sleepwear, beautiful nightwear, outfit clearly visible',
    'Leotard': 'close-up body shot, wearing leotard, athletic leotard, dance leotard, form-fitting leotard, outfit clearly visible',
    'Teddy': 'close-up body shot, wearing teddy lingerie, elegant teddy, beautiful intimate wear, sophisticated lingerie piece, outfit clearly visible',
    'Babydoll': 'close-up body shot, wearing babydoll lingerie, elegant babydoll, beautiful intimate wear, sophisticated lingerie, outfit clearly visible',
    'Bodysuit': 'close-up body shot, wearing bodysuit, elegant bodysuit, form-fitting bodysuit, stylish bodysuit outfit, outfit clearly visible',
    'Chemise': 'close-up body shot, wearing chemise, elegant chemise lingerie, beautiful intimate wear, sophisticated sleepwear, outfit clearly visible',
    'Slip': 'close-up body shot, wearing slip, elegant slip lingerie, beautiful intimate wear, sophisticated undergarment, outfit clearly visible',
    // Fantasy
    'Cheerleader': 'close-up body shot, wearing cheerleader outfit, cheerleader uniform, athletic cheerleading outfit, pom-poms visible, outfit clearly visible',
    'Nurse': 'close-up body shot, wearing nurse outfit, nurse uniform, medical professional outfit, white nurse uniform, outfit clearly visible',
    'Maid': 'close-up body shot, wearing maid outfit, maid uniform, elegant maid costume, traditional maid dress, outfit clearly visible',
    'Student Uniform': 'close-up body shot, wearing student uniform, school uniform, academic outfit, student school outfit, outfit clearly visible',
    'Police Officer': 'close-up body shot, wearing police officer outfit, police uniform, law enforcement outfit, professional police attire, outfit clearly visible',
    'Bunny': 'close-up body shot, wearing bunny outfit, bunny costume, playful bunny ears, cute bunny outfit, outfit clearly visible',
    'Cat': 'close-up body shot, wearing cat outfit, cat costume, playful cat ears, cute cat outfit, outfit clearly visible',
    'Princess': 'close-up body shot, wearing princess outfit, elegant princess dress, royal princess costume, beautiful princess gown, outfit clearly visible',
    'Superhero': 'close-up body shot, wearing superhero outfit, superhero costume, heroic superhero suit, powerful superhero attire, outfit clearly visible',
    'Witch': 'close-up body shot, wearing witch outfit, witch costume, mystical witch dress, magical witch attire, outfit clearly visible',
    // Kinky (NSFW)
    'Bondage Gear': 'close-up body shot, wearing bondage gear, leather bondage outfit, BDSM gear, fetish bondage attire, outfit clearly visible',
    'Leather Outfit': 'close-up body shot, wearing leather outfit, black leather clothing, fetish leather attire, stylish leather outfit, outfit clearly visible',
    'Latex': 'close-up body shot, wearing latex outfit, shiny latex clothing, fetish latex attire, glossy latex outfit, outfit clearly visible',
    'Corset': 'close-up body shot, wearing corset, elegant corset, waist-cinching corset, beautiful corset outfit, outfit clearly visible',
    'Fishnet Stockings': 'close-up body shot, wearing fishnet stockings, fishnet hosiery, fishnet tights, fishnet legwear, outfit clearly visible',
    'Garter Belt': 'close-up body shot, wearing garter belt, elegant garter belt, lingerie garter belt, sophisticated garter outfit, outfit clearly visible',
    'Thigh Highs': 'close-up body shot, wearing thigh high stockings, thigh high socks, long stockings, thigh high legwear, outfit clearly visible',
    'Collar & Leash': 'close-up body shot, wearing collar and leash, BDSM collar, fetish collar accessory, leather collar outfit, outfit clearly visible',
    'PVC Outfit': 'close-up body shot, wearing PVC outfit, shiny PVC clothing, fetish PVC attire, glossy PVC outfit, outfit clearly visible',
    'Harness': 'close-up body shot, wearing harness, body harness, BDSM harness, fetish harness outfit, outfit clearly visible',
    'Cage Bra': 'close-up body shot, wearing cage bra, open cage bra, fetish bra, stylish cage bra outfit, outfit clearly visible',
    'Pasties Only': 'close-up body shot, wearing pasties only, nipple pasties, minimal pasties, small pasties outfit, outfit clearly visible',
    'Body Harness': 'close-up body shot, wearing body harness, full body harness, BDSM body harness, fetish harness outfit, outfit clearly visible',
    'Strap-On': 'close-up body shot, wearing strap-on, harness strap-on, BDSM strap-on, fetish strap-on outfit, outfit clearly visible',
    'Bondage Rope': 'close-up body shot, wearing bondage rope, rope bondage, shibari rope, artistic rope bondage, outfit clearly visible',
    // Sexual (NSFW)
    'Nude': 'close-up body shot, completely nude, no clothing, bare skin, natural body, artistic nude',
    'Topless': 'close-up body shot, topless, no top, bare chest, lower body clothed, partial nudity',
    'Bottomless': 'close-up body shot, bottomless, no bottom, bare lower body, top clothed, partial nudity',
    'See-Through': 'close-up body shot, wearing see-through clothing, transparent outfit, revealing see-through fabric, outfit clearly visible',
    'Wet T-Shirt': 'close-up body shot, wearing wet t-shirt, wet clothing, see-through wet shirt, revealing wet outfit, outfit clearly visible',
    'Oil Covered': 'close-up body shot, oil covered body, shiny oiled skin, glossy oiled body, sensual oiled appearance',
    'Shower Scene': 'close-up body shot, in shower scene, wet in shower, shower setting, water droplets, shower environment',
    'Bed Sheets Only': 'close-up body shot, bed sheets only, wrapped in sheets, minimal covering, bed setting, outfit clearly visible',
    'Towel Wrap': 'close-up body shot, towel wrap, wrapped in towel, minimal towel covering, bathroom setting, outfit clearly visible',
    'Open Robe': 'close-up body shot, open robe, robe partially open, revealing robe, elegant robe outfit, outfit clearly visible',
    'Peek-a-Boo': 'close-up body shot, peek-a-boo outfit, revealing peek-a-boo style, playful revealing outfit, outfit clearly visible',
    'Micro Bikini': 'close-up body shot, wearing micro bikini, minimal bikini, tiny swimwear, revealing micro swimsuit, outfit clearly visible',
    'Pasties & Thong': 'close-up body shot, wearing pasties and thong, minimal covering, pasties and thong only, revealing outfit, outfit clearly visible',
    'Body Paint': 'close-up body shot, body paint, painted body, artistic body paint, colorful body paint design, outfit clearly visible',
    'Edible Outfit': 'close-up body shot, edible outfit, food-based clothing, creative edible clothing, playful edible outfit, outfit clearly visible',
  };

  return descriptions[outfit.label] || `close-up body shot, wearing ${outfit.label.toLowerCase()}, outfit clearly visible`;
}

function getClothingForOutfit(outfit: Outfit): string {
  // Adult outfits: minimal/nude as appropriate
  if (outfit.isAdult) {
    if (outfit.category === 'sexual') {
      // Sexual category can be nude/minimal
      if (outfit.label === 'Nude') {
        return 'completely nude, no clothing, bare skin';
      } else if (outfit.label === 'Topless') {
        return 'topless, no top, bare chest';
      } else if (outfit.label === 'Bottomless') {
        return 'bottomless, no bottom, bare lower body';
      } else {
        return 'minimal clothing, revealing outfit, outfit as described';
      }
    } else {
      // Kinky category: outfit as described (bondage gear, etc.)
      return 'wearing outfit as described, outfit clearly visible';
    }
  }

  // SFW outfits: appropriate clothing
  return 'wearing outfit as described, outfit clearly visible, appropriate clothing, well-fitted clothes';
}

interface OutfitAsset {
  outfit: Outfit;
  outputPath: string;
  fullPrompt: string;
}

function getAllOutfitAssets(): OutfitAsset[] {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const outfitsDir = path.join(publicDir, 'outfits');

  if (!fs.existsSync(outfitsDir)) {
    fs.mkdirSync(outfitsDir, { recursive: true });
  }

  return OUTFITS.map(outfit => {
    // Build comprehensive prompt with character description + outfit + close-up + quality specs
    const characterDesc = getCharacterPrompt();
    const outfitDescription = getOutfitDescription(outfit);
    const clothing = getClothingForOutfit(outfit);

    // Combine: Character + Clothing + Outfit Description + Close-up + Quality + Style
    const fullPrompt = `${characterDesc}, ${clothing}, ${outfitDescription}, close-up body shot, upper body and torso visible, outfit prominently featured, ${BASE_STYLE}`;

    const outfitId = outfit.label.toLowerCase().replace(/\s+/g, '-');

    return {
      outfit,
      outputPath: path.join(outfitsDir, `${outfitId}.webp`),
      fullPrompt,
    };
  });
}

async function ensureDirectories(): Promise<void> {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const dirs = ['outfits'];

  for (const dir of dirs) {
    const dirPath = path.join(publicDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Created directory: ${dirPath}`);
    }
  }
}

async function saveImageAsWebP(imageBuffer: Buffer, outputPath: string): Promise<void> {
  fs.writeFileSync(outputPath, imageBuffer);
}

async function generateOutfitThumbnail(
  prompt: string,
  outputPath: string,
  outfitName: string,
  client: ComfyUIPodClient,
  isAdult: boolean = false
): Promise<void> {
  console.log(`\n📸 Generating: ${outfitName}${isAdult ? ' (Adult)' : ''}`);
  console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

  // Build negative prompt - add clothing-related negatives based on outfit type
  const baseNegative = 'deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature';
  
  // For SFW outfits, ensure clothing is present (negative: no clothing)
  const negativePrompt = isAdult 
    ? baseNegative 
    : `${baseNegative}, nude, naked, no clothing, bare skin, exposed`;

  // Build Z-Image Turbo workflow
  const workflow = buildZImageSimpleWorkflow({
    prompt,
    negativePrompt,
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    steps: 9, // Z-Image Turbo uses 9 steps (8 DiT forwards)
    cfg: 1.0, // Z-Image Turbo uses cfg 1.0
    seed: Math.floor(Math.random() * 2 ** 32),
    filenamePrefix: `ryla_outfit_${outfitName.toLowerCase().replace(/\s+/g, '_')}`,
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
  await saveImageAsWebP(imageBuffer, outputPath);
  
  console.log(`   ✓ Saved to ${outputPath}`);
}

async function main() {
  console.log('🎨 Outfit Gallery Thumbnail Generator');
  console.log('=====================================\n');

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

  // Load character description
  const characterDescription = getCharacterPrompt();
  console.log('📋 Character Analysis:');
  console.log(`   ${characterDescription.substring(0, 120)}...`);
  console.log('✓ Character description loaded\n');

  // Ensure directories exist
  await ensureDirectories();

  // Get all outfit assets
  const outfitAssets = getAllOutfitAssets();
  console.log(`\n📋 Found ${outfitAssets.length} outfits to generate:`);
  console.log(`   - Casual: ${outfitAssets.filter(a => a.outfit.category === 'casual').length}`);
  console.log(`   - Glamour: ${outfitAssets.filter(a => a.outfit.category === 'glamour').length}`);
  console.log(`   - Intimate: ${outfitAssets.filter(a => a.outfit.category === 'intimate').length}`);
  console.log(`   - Fantasy: ${outfitAssets.filter(a => a.outfit.category === 'fantasy').length}`);
  console.log(`   - Kinky: ${outfitAssets.filter(a => a.outfit.category === 'kinky').length}`);
  console.log(`   - Sexual: ${outfitAssets.filter(a => a.outfit.category === 'sexual').length}`);

  // Generate each outfit with rate limiting
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < outfitAssets.length; i++) {
    const asset = outfitAssets[i];
    try {
      // Check if already exists
      if (fs.existsSync(asset.outputPath)) {
        console.log(`⏭️  Skipping ${asset.outfit.label} (already exists)`);
        successCount++;
        continue;
      }

      await generateOutfitThumbnail(
        asset.fullPrompt,
        asset.outputPath,
        asset.outfit.label,
        client,
        asset.outfit.isAdult || false
      );
      successCount++;
      
      // Rate limiting: wait 1.5 seconds between requests
      if (i < outfitAssets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${asset.outfit.label}:`, error);
      failCount++;
      
      // Wait a bit longer on error before retrying
      if (i < outfitAssets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.log(`\n✅ Generation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total: ${outfitAssets.length}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { getAllOutfitAssets, ensureDirectories, generateOutfitThumbnail };

