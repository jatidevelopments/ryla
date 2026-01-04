/**
 * Generate Studio Preset Thumbnails using Local RunPod ComfyUI with Z-Image Turbo
 * 
 * This script generates all thumbnail images for:
 * - Visual Styles (20 styles)
 * - Scenes (14 scenes)
 * - Lighting Settings (10 lighting)
 * 
 * Uses local ComfyUI pod with Z-Image Turbo workflow to generate consistent, 
 * high-quality thumbnails that show the RYLA character in each preset.
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

// Visual Styles prompts
const VISUAL_STYLE_PROMPTS: Record<string, string> = {
  'general': 'clean professional portrait, neutral background, natural lighting, modern aesthetic',
  'iphone': 'iPhone camera style, natural colors, authentic mobile photography, casual lifestyle',
  'realistic': 'hyper-realistic portrait, photorealistic, detailed skin texture, natural lighting',
  'digitalcam': 'digital camera aesthetic, vibrant colors, sharp focus, professional photography',
  'sunset-beach': 'beautiful sunset at beach, warm golden hour lighting, ocean waves, serene atmosphere',
  'mt-fuji': 'Mount Fuji in background, Japanese aesthetic, peaceful landscape, soft natural lighting',
  'flight-mode': 'airplane window view, clouds, travel aesthetic, natural daylight, cinematic',
  'street-view': 'urban street scene, city background, street photography style, natural lighting',
  'bimbocore': 'glamorous aesthetic, vibrant colors, playful style, studio lighting, fashion photography',
  'tokyo-street': 'Tokyo street style, urban Japan, neon signs, night scene, cinematic lighting',
  'cctv': 'security camera aesthetic, grainy texture, surveillance style, low quality, documentary',
  'elevator-mirror': 'elevator mirror selfie, reflective surface, modern building, natural lighting',
  'ringselfie': 'ring light selfie, soft even lighting, clean background, social media style',
  'y2k': 'Y2K aesthetic, retro futuristic, vibrant colors, nostalgic early 2000s style',
  'vaporwave': 'vaporwave aesthetic, neon colors, retro synthwave, surreal atmosphere, pink and purple tones',
  'golden-hour': 'golden hour lighting, warm sunset glow, soft shadows, romantic atmosphere',
  'neon-nights': 'neon night scene, colorful lights, urban nightlife, dramatic lighting, cyberpunk aesthetic',
  'soft-glam': 'soft glam makeup, elegant beauty, professional portrait, soft lighting, high fashion',
  'editorial': 'editorial fashion photography, high fashion aesthetic, clean composition, professional studio',
  'retro-film': 'retro film camera aesthetic, vintage colors, film grain, nostalgic photography style',
  // Camera Presets
  'polaroid': 'Polaroid instant photo aesthetic, nostalgic vintage, square format, retro colors, authentic instant photography',
  'disposable-camera': 'disposable camera aesthetic, authentic mobile photography, casual lifestyle, natural colors',
  'film-grain': 'film grain aesthetic, vintage film texture, classic photography, nostalgic feel',
  'gopro': 'GoPro action camera style, wide-angle view, action sports aesthetic, dynamic perspective',
  'vintage-camera': 'vintage camera aesthetic, retro photography, classic film look, nostalgic colors',
  // Social Media Trends
  'cottagecore': 'cottagecore aesthetic, cozy rural lifestyle, natural textures, soft colors, pastoral atmosphere',
  'dark-academia': 'dark academia aesthetic, scholarly atmosphere, vintage library, moody lighting, intellectual',
  'light-academia': 'light academia aesthetic, bright scholarly atmosphere, clean aesthetic, intellectual elegance',
  'clean-girl': 'clean girl aesthetic, minimal makeup, natural beauty, fresh and clean, modern simplicity',
  'indie-sleaze': 'indie sleaze aesthetic, alternative style, edgy fashion, underground culture, raw authenticity',
  'coquette': 'coquette aesthetic, feminine delicate style, soft pastels, romantic vintage, playful elegance',
  'minimalist': 'minimalist style, clean simple composition, less is more, modern simplicity, elegant restraint',
  'maximalist': 'maximalist style, bold vibrant colors, rich patterns, layered textures, expressive abundance',
  // Artistic
  'watercolor': 'watercolor painting effect, soft brush strokes, artistic watercolor style, dreamy colors',
  'oil-painting': 'oil painting style, classic fine art, rich textures, traditional painting aesthetic',
  'sketch': 'pencil sketch artistic style, hand-drawn illustration, artistic line work, creative drawing',
  'pop-art': 'pop art style, vibrant bold colors, graphic design, Andy Warhol aesthetic, modern art',
  'cyberpunk': 'cyberpunk aesthetic, futuristic neon, high-tech low-life, dystopian future, sci-fi',
  'steampunk': 'steampunk aesthetic, retro-futuristic, Victorian era meets technology, brass and gears',
  // Mood
  'dreamy': 'dreamy soft focus aesthetic, ethereal atmosphere, soft blur, romantic dream-like quality',
  'moody-dark': 'moody dark tones, dramatic shadows, low key lighting, atmospheric darkness, cinematic mood',
  'pastel': 'pastel colors, soft gentle hues, light and airy, delicate color palette, sweet aesthetic',
  'high-contrast': 'high contrast photography, bold dramatic lighting, strong shadows and highlights, striking composition',
  'monochrome': 'monochrome black and white, timeless classic, elegant simplicity, artistic grayscale',
};

// Scene prompts
const SCENE_PROMPTS: Record<string, string> = {
  'beach-sunset': 'beautiful beach at sunset, golden hour, ocean waves, palm trees, serene coastal scene',
  'city-rooftop': 'urban city rooftop, city skyline in background, modern architecture, evening atmosphere',
  'cozy-cafe': 'cozy coffee shop interior, warm lighting, comfortable atmosphere, rustic decor',
  'white-studio': 'clean white studio background, minimal, professional photography setup, even lighting',
  'neon-alley': 'urban alley with neon signs, night scene, colorful lights, street art, dramatic atmosphere',
  'forest-path': 'peaceful forest path, natural greenery, dappled sunlight, serene nature scene',
  'luxury-bedroom': 'luxurious bedroom interior, elegant decor, soft lighting, high-end furniture',
  'gym': 'modern gym interior, fitness equipment, bright lighting, active atmosphere',
  'pool-party': 'swimming pool party scene, outdoor setting, sunny day, festive atmosphere',
  'paris-street': 'charming Paris street, European architecture, cobblestone, romantic atmosphere',
  'japanese-garden': 'traditional Japanese garden, zen atmosphere, cherry blossoms, peaceful setting',
  'dark-studio': 'dark studio background, moody lighting, dramatic shadows, professional photography',
  'cyberpunk-city': 'futuristic cyberpunk city, neon lights, high-tech aesthetic, night scene',
  'enchanted-forest': 'magical enchanted forest, fairy tale atmosphere, mystical lighting, fantasy setting',
  // Additional Outdoor scenes
  'mountain-view': 'mountain vista scenic view, majestic peaks, natural landscape, breathtaking scenery',
  'desert-sunset': 'desert at sunset, dramatic golden hour, sand dunes, warm colors, serene desert atmosphere',
  'lake-side': 'lakeside peaceful scene, calm water, natural setting, serene atmosphere, tranquil nature',
  'urban-park': 'urban city park, green space in city, trees and grass, peaceful urban oasis',
  'beach-day': 'beach during day, bright sunny beach, ocean waves, sand, vibrant beach scene',
  'snow-scene': 'snowy landscape, winter scene, snow-covered ground, cold atmosphere, winter wonderland',
  // Additional Indoor scenes
  'modern-kitchen': 'modern kitchen interior, clean contemporary design, bright lighting, stylish kitchen',
  'home-office': 'home office interior, professional workspace, modern desk setup, comfortable work environment',
  'bathroom-mirror': 'bathroom mirror scene, intimate setting, modern bathroom, reflective surfaces',
  'library': 'library interior, bookshelves, intellectual atmosphere, quiet study space, scholarly environment',
  'art-gallery': 'art gallery interior, sophisticated space, white walls, elegant exhibition space',
  'boutique-shop': 'boutique store interior, fashionable retail space, stylish shop, curated displays',
  // Additional Urban scenes
  'subway-station': 'subway metro station, urban transit, underground railway, city transportation',
  'street-market': 'street market scene, vibrant market, vendors and stalls, bustling urban market',
  'bridge-view': 'bridge with city view, iconic bridge, urban landscape, architectural landmark',
  'parking-garage': 'parking garage interior, industrial urban space, concrete structure, urban infrastructure',
  // Additional Fantasy/Creative scenes
  'underwater': 'underwater scene, ethereal aquatic environment, floating in water, dreamy underwater atmosphere',
  'space-station': 'space station interior, futuristic space environment, sci-fi setting, high-tech space',
  'medieval-castle': 'medieval castle interior, historical architecture, stone walls, ancient castle atmosphere',
  'tropical-paradise': 'tropical paradise scene, exotic island, palm trees, paradise beach, tropical vacation',
};

// Lighting prompts
const LIGHTING_PROMPTS: Record<string, string> = {
  'natural-daylight': 'natural daylight, soft window light, bright and airy, natural shadows',
  'golden-hour': 'golden hour lighting, warm sunset glow, soft golden tones, romantic atmosphere',
  'blue-hour': 'blue hour lighting, twilight atmosphere, cool blue tones, evening sky',
  'studio-softbox': 'professional studio softbox lighting, even and diffused, clean professional look',
  'ring-light': 'ring light effect, even circular lighting, soft shadows, modern selfie style',
  'neon-glow': 'neon glow lighting, colorful lights, dramatic atmosphere, urban nightlife',
  'dramatic-shadows': 'dramatic shadow lighting, high contrast, cinematic chiaroscuro, moody atmosphere',
  'soft-diffused': 'soft diffused lighting, gentle shadows, flattering light, elegant atmosphere',
  'cinematic-moody': 'cinematic moody lighting, film noir aesthetic, dramatic shadows, artistic composition',
  'backlit-silhouette': 'backlit silhouette, rim lighting, dramatic contrast, artistic portrait',
  // Natural Lighting
  'sunrise': 'sunrise lighting, warm morning glow, soft golden light, peaceful morning atmosphere',
  'midday': 'bright midday sun, clear daylight, strong natural light, bright and clear',
  'cloudy-day': 'cloudy diffused light, soft overcast lighting, even natural light, gentle shadows',
  'stormy': 'stormy dramatic lighting, dark clouds, dramatic atmosphere, moody storm lighting',
  // Studio Lighting
  'beauty-dish': 'beauty dish lighting, glamorous portrait lighting, professional beauty photography, flattering light',
  'butterfly': 'butterfly lighting, flattering portrait light, professional photography, elegant lighting setup',
  'rim-light': 'rim lighting, edge glow, dramatic rim light effect, artistic portrait lighting',
  'split-light': 'split lighting, dramatic half-light, high contrast, cinematic split lighting',
  // Creative Lighting
  'firelight': 'firelight glow, warm fire illumination, cozy firelight, warm intimate lighting',
  'candlelight': 'candlelight, intimate candle glow, soft warm light, romantic candlelit atmosphere',
  'strobe': 'strobe effect, high-energy flash lighting, dynamic strobe, dramatic flash effect',
  'colored-gel': 'colored gel lighting, creative colored lights, artistic color lighting, vibrant gel colors',
  'sunset-glow': 'sunset glow lighting, warm sunset colors, golden hour glow, romantic sunset atmosphere',
  'moonlight': 'moonlight, cool moon glow, night lighting, ethereal moonlit atmosphere, cool blue tones',
};

interface PresetAsset {
  id: string;
  name: string;
  category: 'style' | 'scene' | 'lighting';
  prompt: string;
  outputPath: string;
}

function getClothingForStyle(styleId: string): string {
  // Style-appropriate clothing
  const styleClothing: Record<string, string> = {
    'bimbocore': 'glamorous outfit, trendy fashion, stylish clothing, fashionable attire',
    'tokyo-street': 'streetwear, urban fashion, trendy casual outfit, modern street style',
    'y2k': 'Y2K fashion, retro outfit, early 2000s style clothing, nostalgic fashion',
    'vaporwave': 'retro futuristic outfit, synthwave style clothing, aesthetic fashion',
    'soft-glam': 'elegant outfit, glamorous attire, sophisticated clothing, fashion-forward',
    'editorial': 'high fashion outfit, editorial style clothing, designer fashion, runway style',
    'retro-film': 'vintage outfit, retro clothing, classic fashion, nostalgic attire',
    'iphone': 'casual everyday outfit, comfortable clothing, modern casual wear',
    'digitalcam': 'stylish casual outfit, modern fashion, contemporary clothing',
    'sunset-beach': 'beachwear, casual summer outfit, relaxed vacation clothing, beach appropriate attire',
    'mt-fuji': 'casual comfortable outfit, relaxed clothing, everyday wear',
    'flight-mode': 'travel outfit, comfortable travel clothing, casual travel wear',
    'street-view': 'urban casual outfit, street style clothing, modern casual wear',
    'cctv': 'casual everyday outfit, normal clothing, everyday attire',
    'elevator-mirror': 'stylish outfit, fashionable clothing, modern casual wear',
    'ringselfie': 'casual outfit, everyday clothing, comfortable stylish wear',
    'golden-hour': 'casual elegant outfit, comfortable stylish clothing, relaxed fashion',
    'neon-nights': 'nightlife outfit, trendy clothing, stylish night wear, fashionable attire',
  };

  return styleClothing[styleId] || 'casual outfit, comfortable everyday clothing, stylish modern fashion, well-fitted clothes, appropriate attire';
}

function getClothingForScene(sceneId: string): string {
  // Scene-appropriate clothing
  const sceneClothing: Record<string, string> = {
    'beach-sunset': 'beachwear, swimsuit or beach cover-up, casual summer outfit, beach appropriate clothing',
    'city-rooftop': 'stylish urban outfit, fashionable clothing, modern casual wear, city style',
    'cozy-cafe': 'casual comfortable outfit, relaxed clothing, cozy everyday wear, comfortable attire',
    'white-studio': 'stylish outfit, fashionable clothing, modern casual wear, studio appropriate',
    'neon-alley': 'urban streetwear, trendy outfit, nightlife clothing, stylish casual wear',
    'forest-path': 'casual outdoor outfit, comfortable clothing, nature-appropriate attire, relaxed wear',
    'luxury-bedroom': 'elegant loungewear, sophisticated comfortable clothing, luxury casual wear',
    'gym': 'athletic wear, sportswear, active clothing, fitness outfit, workout attire',
    'pool-party': 'swimwear, pool party outfit, beachwear, casual summer clothing',
    'paris-street': 'elegant casual outfit, Parisian style clothing, sophisticated fashion, chic attire',
    'japanese-garden': 'casual comfortable outfit, relaxed clothing, peaceful everyday wear',
    'dark-studio': 'stylish outfit, fashionable clothing, modern casual wear, studio appropriate',
    'cyberpunk-city': 'futuristic outfit, cyberpunk style clothing, edgy fashion, urban tech wear',
    'enchanted-forest': 'casual fantasy outfit, comfortable clothing, nature-appropriate attire',
  };

  return sceneClothing[sceneId] || 'casual outfit, comfortable everyday clothing, stylish modern fashion, well-fitted clothes, appropriate attire';
}

function getClothingForLighting(lightingId: string): string {
  // Lighting-appropriate clothing (generally casual/portrait appropriate)
  return 'casual outfit, comfortable everyday clothing, stylish modern fashion, well-fitted clothes, appropriate attire, portrait appropriate clothing';
}

function getAllPresets(characterDescription: string): PresetAsset[] {
  const presets: PresetAsset[] = [];
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');

  // Visual Styles - always include the character with appropriate clothing
  Object.entries(VISUAL_STYLE_PROMPTS).forEach(([id, prompt]) => {
    const clothing = getClothingForStyle(id);
    presets.push({
      id,
      name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      category: 'style',
      prompt: `${characterDescription}, ${clothing}, ${prompt}, full body portrait, clearly visible in the scene, ${BASE_STYLE}`,
      outputPath: path.join(publicDir, 'styles', `${id}.webp`),
    });
  });

  // Scenes - always include the character in the scene with appropriate clothing
  Object.entries(SCENE_PROMPTS).forEach(([id, prompt]) => {
    const clothing = getClothingForScene(id);
    presets.push({
      id,
      name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      category: 'scene',
      prompt: `${characterDescription}, ${clothing}, in ${prompt}, full body view, character prominently featured in the scene, ${BASE_STYLE}`,
      outputPath: path.join(publicDir, 'scenes', `${id}.webp`),
    });
  });

  // Lighting - always include the character with the lighting effect and appropriate clothing
  Object.entries(LIGHTING_PROMPTS).forEach(([id, prompt]) => {
    const clothing = getClothingForLighting(id);
    presets.push({
      id,
      name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      category: 'lighting',
      prompt: `${characterDescription}, ${clothing}, portrait with ${prompt}, full body view, character clearly visible, ${BASE_STYLE}`,
      outputPath: path.join(publicDir, 'lighting', `${id}.webp`),
    });
  });

  return presets;
}

async function ensureDirectories(): Promise<void> {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const dirs = ['styles', 'scenes', 'lighting'];
  
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

async function generatePresetThumbnail(
  prompt: string,
  outputPath: string,
  presetName: string,
  client: ComfyUIPodClient
): Promise<void> {
  console.log(`\n📸 Generating: ${presetName}`);
  console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

  const negativePrompt = 'deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature, no person, empty scene, no character, nude, naked, no clothing, bare skin, exposed';

  // Build Z-Image Turbo workflow
  const workflow = buildZImageSimpleWorkflow({
    prompt,
    negativePrompt,
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    steps: 9, // Z-Image Turbo uses 9 steps (8 DiT forwards)
    cfg: 1.0, // Z-Image Turbo uses cfg 1.0
    seed: Math.floor(Math.random() * 2 ** 32),
    filenamePrefix: `ryla_${presetName.toLowerCase().replace(/\s+/g, '_')}`,
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
  console.log('🎨 Studio Preset Thumbnail Generator');
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

  // Get all presets (with character included)
  const presets = getAllPresets(characterDescription);
  console.log(`\n📋 Found ${presets.length} presets to generate:`);
  console.log(`   - Styles: ${presets.filter(p => p.category === 'style').length}`);
  console.log(`   - Scenes: ${presets.filter(p => p.category === 'scene').length}`);
  console.log(`   - Lighting: ${presets.filter(p => p.category === 'lighting').length}`);

  // Generate each preset with rate limiting
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < presets.length; i++) {
    const preset = presets[i];
    try {
      // Check if already exists
      if (fs.existsSync(preset.outputPath)) {
        console.log(`⏭️  Skipping ${preset.name} (already exists)`);
        successCount++;
        continue;
      }

      await generatePresetThumbnail(preset.prompt, preset.outputPath, preset.name, client);
      successCount++;
      
      // Rate limiting: wait 1 second between requests (except for last one)
      if (i < presets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${preset.name}:`, error);
      failCount++;
      
      // Wait a bit longer on error before retrying
      if (i < presets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.log(`\n✅ Generation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total: ${presets.length}`);
}

// Run if executed directly (Node.js)
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { getAllPresets, ensureDirectories, generatePresetThumbnail };

