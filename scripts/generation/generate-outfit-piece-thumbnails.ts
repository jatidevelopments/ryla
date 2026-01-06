/**
 * Generate Outfit Piece Thumbnails using Local RunPod ComfyUI with Z-Image Turbo
 * 
 * This script generates close-up outfit piece thumbnail images showing the body with
 * the specific piece visible. Characters are NOT naked (except for adult pieces).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getCharacterPrompt } from './analyze-base-character';
import { ComfyUIPodClient } from '@ryla/business';
import { buildZImageSimpleWorkflow } from '@ryla/business';
import { OUTFIT_PIECES } from '../libs/shared/src/constants/character/outfit-pieces';

// Load environment variables from .env files
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env.local') });

// Thumbnail dimensions: 4:5 aspect ratio (matches UI aspect-[4/5])
const THUMBNAIL_WIDTH = 768;
const THUMBNAIL_HEIGHT = 960;

// Base prompt template for consistent style and quality
const BASE_STYLE = '8K hyper-realistic, photorealistic, professional product photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, white background, editorial fashion photography, masterpiece, best quality, 4K resolution, hyper-detailed textures';

// Get clothing prompt for piece
function getClothingPromptForPiece(piece: typeof OUTFIT_PIECES[0]): string {
  const isAdult = piece.isAdult || false;
  
  if (isAdult) {
    // Adult pieces: minimal/nude as appropriate, but still show the piece
    if (piece.category === 'top' && (piece.id.includes('nude') || piece.id.includes('topless'))) {
      return 'topless, bare chest, no top, nude upper body, showing the absence of top piece';
    }
    if (piece.category === 'bottom' && (piece.id.includes('bottomless') || piece.id.includes('nude'))) {
      return 'bottomless, bare lower body, no bottom, nude lower body, showing the absence of bottom piece';
    }
    // Other adult pieces: show the piece but can be minimal/revealing
    return `wearing ${piece.label.toLowerCase()}, ${piece.category} piece clearly visible, minimal clothing, revealing, sensual`;
  }
  
  // SFW pieces: appropriate clothing with the piece clearly visible
  const categoryClothing: Record<string, string> = {
    top: `wearing ${piece.label.toLowerCase()}, ${piece.category} piece clearly visible, appropriate clothing, casual top`,
    bottom: `wearing ${piece.label.toLowerCase()}, ${piece.category} piece clearly visible, appropriate clothing, casual bottom`,
    shoes: `wearing ${piece.label.toLowerCase()}, ${piece.category} piece clearly visible, footwear, appropriate clothing`,
    headwear: `wearing ${piece.label.toLowerCase()}, ${piece.category} piece clearly visible, head accessory, appropriate clothing`,
    outerwear: `wearing ${piece.label.toLowerCase()}, ${piece.category} piece clearly visible, outer layer, appropriate clothing`,
    accessory: `wearing ${piece.label.toLowerCase()}, ${piece.category} piece clearly visible, accessory, appropriate clothing`,
  };
  
  return categoryClothing[piece.category] || `wearing ${piece.label.toLowerCase()}, ${piece.category} piece clearly visible, appropriate clothing`;
}

// Generate prompt for outfit piece
function getPiecePrompt(piece: typeof OUTFIT_PIECES[0]): string {
  const characterDescription = getCharacterPrompt();
  const clothing = getClothingPromptForPiece(piece);
  
  // Focus on close-up of the specific piece only (no face, no full body)
  const pieceFocus = `close-up product photography of ${piece.label.toLowerCase()}, ${piece.category} piece in sharp focus, showing only the clothing item on the body part, white background, professional product shot, fashion item detail, no face visible, no full body, just the ${piece.category} piece clearly visible`;
  
  return `${characterDescription}, ${clothing}, ${pieceFocus}, ${BASE_STYLE}`;
}

// Generate negative prompt
function getNegativePrompt(isAdult: boolean): string {
  const baseNegative = 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, extra limbs, missing limbs, watermark, signature, text, logo, multiple people, crowd, background clutter, dark background, colored background, busy background, face visible, full body visible, full portrait, head visible';
  
  if (isAdult) {
    return `${baseNegative}, excessive clothing, fully clothed`;
  }
  
  return `${baseNegative}, nude, naked, inappropriate, explicit`;
}

// Generate outfit piece thumbnail
async function generatePieceThumbnail(
  prompt: string,
  outputPath: string,
  pieceName: string,
  client: ComfyUIPodClient,
  isAdult: boolean
): Promise<void> {
  console.log(`🎨 Generating thumbnail for: ${pieceName}`);
  
  const negativePrompt = getNegativePrompt(isAdult);
  
  // Use Z-Image Turbo workflow (9 steps, cfg 1.0 for fast high-quality generation)
  const workflow = buildZImageSimpleWorkflow({
    prompt,
    negativePrompt,
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
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
    console.error(`❌ Error generating ${pieceName}:`, error);
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
  const outfitsDir = path.join(process.cwd(), 'apps', 'web', 'public', 'outfit-pieces');
  if (!fs.existsSync(outfitsDir)) {
    fs.mkdirSync(outfitsDir, { recursive: true });
  }
  
  // Clear existing thumbnails
  function clearAllThumbnails() {
    console.log('🧹 Clearing existing thumbnails...');
    const files = fs.readdirSync(outfitsDir);
    let cleared = 0;
    for (const file of files) {
      if (file.endsWith('.webp')) {
        fs.unlinkSync(path.join(outfitsDir, file));
        cleared++;
      }
    }
    console.log(`   Cleared ${cleared} existing thumbnails`);
  }
  
  clearAllThumbnails();
  
  // Prepare all pieces for generation
  const pieceAssets = OUTFIT_PIECES.map((piece) => {
    const pieceId = piece.id;
    const outputPath = path.join(outfitsDir, `${pieceId}.webp`);
    const fullPrompt = getPiecePrompt(piece);
    
    return {
      piece,
      pieceId,
      outputPath,
      fullPrompt,
    };
  });
  
  console.log(`\n📦 Generating ${pieceAssets.length} outfit piece thumbnails...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < pieceAssets.length; i++) {
    const asset = pieceAssets[i];
    
    try {
      // Skip if already exists (shouldn't happen after clear, but just in case)
      if (fs.existsSync(asset.outputPath)) {
        console.log(`⏭️  Skipping ${asset.piece.label} (already exists)`);
        successCount++;
        continue;
      }
      
      await generatePieceThumbnail(
        asset.fullPrompt,
        asset.outputPath,
        asset.piece.label,
        client,
        asset.piece.isAdult || false
      );
      successCount++;
      
      // Rate limiting: wait 1.5 seconds between requests
      if (i < pieceAssets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${asset.piece.label}:`, error);
      failCount++;
    }
  }
  
  console.log(`\n✅ Generation complete!`);
  console.log(`   Success: ${successCount}, Failed: ${failCount}, Total: ${pieceAssets.length}`);
}

main().catch(console.error);

