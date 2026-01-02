/**
 * Generate Studio Pose Thumbnails using Local RunPod ComfyUI with Z-Image Turbo
 * 
 * This script generates all pose thumbnail images using detailed character descriptions
 * extracted from the base character image. Uses local ComfyUI pod with Z-Image Turbo workflow.
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

// Pose definitions from types.ts
interface Pose {
  id: string;
  name: string;
  prompt: string;
  category: 'standing' | 'sitting' | 'lying' | 'action';
  isAdult?: boolean;
}

const SFW_POSES: Pose[] = [
  // Standing poses
  { id: 'standing-casual', name: 'Casual', prompt: 'relaxed casual standing pose', category: 'standing' },
  { id: 'standing-confident', name: 'Confident', prompt: 'confident power stance', category: 'standing' },
  { id: 'standing-walking', name: 'Walking', prompt: 'natural walking mid-stride', category: 'standing' },
  { id: 'standing-leaning', name: 'Leaning', prompt: 'casually leaning against wall', category: 'standing' },
  // Sitting poses
  { id: 'sitting-relaxed', name: 'Relaxed', prompt: 'relaxed sitting position', category: 'sitting' },
  { id: 'sitting-cross', name: 'Cross-legged', prompt: 'sitting cross-legged', category: 'sitting' },
  { id: 'sitting-perched', name: 'Perched', prompt: 'perched on edge elegantly', category: 'sitting' },
  { id: 'sitting-lounging', name: 'Lounging', prompt: 'lounging comfortably', category: 'sitting' },
  // Action poses
  { id: 'action-dancing', name: 'Dancing', prompt: 'dynamic dancing movement', category: 'action' },
  { id: 'action-stretching', name: 'Stretching', prompt: 'graceful stretching pose', category: 'action' },
  { id: 'action-exercising', name: 'Exercising', prompt: 'active workout pose', category: 'action' },
  { id: 'action-playing', name: 'Playing', prompt: 'playful action pose', category: 'action' },
];

const ADULT_POSES: Pose[] = [
  // Standing poses
  { id: 'adult-standing-seductive', name: 'Seductive', prompt: 'seductive standing pose', category: 'standing', isAdult: true },
  { id: 'adult-standing-alluring', name: 'Alluring', prompt: 'alluring confident pose', category: 'standing', isAdult: true },
  { id: 'adult-standing-sensual', name: 'Sensual', prompt: 'sensual standing pose', category: 'standing', isAdult: true },
  // Sitting poses
  { id: 'adult-sitting-sensual', name: 'Sensual', prompt: 'sensual sitting position', category: 'sitting', isAdult: true },
  { id: 'adult-sitting-suggestive', name: 'Suggestive', prompt: 'suggestive perched pose', category: 'sitting', isAdult: true },
  { id: 'adult-sitting-elegant', name: 'Elegant', prompt: 'elegant sensual sitting pose', category: 'sitting', isAdult: true },
  // Lying poses
  { id: 'adult-lying-elegant', name: 'Elegant', prompt: 'elegant reclining pose', category: 'lying', isAdult: true },
  { id: 'adult-lying-alluring', name: 'Alluring', prompt: 'alluring reclining pose', category: 'lying', isAdult: true },
  { id: 'adult-lying-sensual', name: 'Sensual', prompt: 'sensual reclining pose', category: 'lying', isAdult: true },
];

const ALL_POSES: Pose[] = [...SFW_POSES, ...ADULT_POSES];

interface PoseAsset {
  pose: Pose;
  outputPath: string;
  fullPrompt: string;
}

function getAllPoseAssets(): PoseAsset[] {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const posesDir = path.join(publicDir, 'poses');

  if (!fs.existsSync(posesDir)) {
    fs.mkdirSync(posesDir, { recursive: true });
  }

  return ALL_POSES.map(pose => {
    // Build comprehensive prompt with character description + detailed pose + quality specs
    const characterDesc = getCharacterPrompt();
    const poseDescription = getDetailedPoseDescription(pose);

    // Combine: Character + Pose + Quality + Style
    const fullPrompt = `${characterDesc}, ${poseDescription}, ${BASE_STYLE}, full body visible, complete figure, professional studio photography`;

    return {
      pose,
      outputPath: path.join(posesDir, `${pose.id}.webp`),
      fullPrompt,
    };
  });
}

function getDetailedPoseDescription(pose: Pose): string {
  // Highly detailed pose descriptions with specific body positioning
  const detailedDescriptions: Record<string, string> = {
    'standing-casual': 'full body standing pose, relaxed casual stance, arms hanging naturally at sides, shoulders relaxed, feet positioned shoulder-width apart, natural weight distribution, comfortable posture, looking at camera with friendly expression',
    'standing-confident': 'full body standing pose, confident power stance, one hand placed on hip with elbow out, other arm relaxed at side, shoulders pulled back, chest slightly forward, feet planted firmly apart, strong upright posture, confident expression, looking directly at camera',
    'standing-walking': 'full body walking pose, natural mid-stride movement, one leg forward in walking motion, opposite arm swinging forward, dynamic body position, weight shifting, natural walking rhythm, captured in motion, looking ahead or at camera',
    'standing-leaning': 'full body standing pose, casually leaning against vertical surface, one shoulder and side of body touching wall, arms crossed comfortably in front, one leg crossed over the other at ankle, relaxed casual posture, looking at camera with relaxed expression',
    'sitting-relaxed': 'full body sitting pose, relaxed sitting position on comfortable surface, legs extended forward and slightly apart, back reclined against support, arms resting on armrests or lap, comfortable casual posture, looking at camera with relaxed expression',
    'sitting-cross': 'full body sitting pose, sitting cross-legged on floor or cushion, back straight and upright, hands resting on knees, legs crossed at ankles, meditative or yoga-like posture, calm expression, looking at camera or slightly downward',
    'sitting-perched': 'full body sitting pose, perched elegantly on edge of seat or surface, legs together and positioned to one side, leaning forward slightly with back straight, hands resting on thighs or seat edge, elegant poised posture, looking at camera with sophisticated expression',
    'sitting-lounging': 'full body sitting pose, lounging comfortably on sofa or chair, back reclined, one leg bent with foot on surface, other leg extended, arms relaxed, casual comfortable posture, looking at camera with relaxed expression',
    'action-dancing': 'full body dynamic pose, dancing movement captured mid-action, arms raised above head or extended to sides, one leg lifted or in motion, body twisted or turned, flowing movement, energetic expression, dynamic composition',
    'action-stretching': 'full body stretching pose, graceful stretching movement, arms reaching upward and extended, body elongated and extended, one leg may be raised or extended, yoga-like position, graceful lines, looking upward or at camera',
    'action-exercising': 'full body athletic pose, active workout position, athletic stance with muscles engaged, dynamic fitness position, body in motion or ready position, athletic clothing visible, energetic expression, fitness-focused composition',
    'action-playing': 'full body playful pose, dynamic action movement, engaging gesture with arms, playful body positioning, lively expression, movement captured, fun and energetic composition, looking at camera with playful expression',
    'adult-standing-seductive': 'full body standing pose, seductive confident stance, one hand on hip with elbow out creating curve, other hand may touch hair or rest on body, slight hip tilt creating S-curve, shoulders back, confident alluring expression, looking at camera with sultry gaze',
    'adult-standing-alluring': 'full body standing pose, alluring confident posture, elegant body positioning with graceful curves, one hand on hip or touching body elegantly, sophisticated stance, refined posture, elegant expression, looking at camera with alluring gaze',
    'adult-standing-sensual': 'full body standing pose, sensual relaxed stance, natural curves emphasized through body positioning, relaxed but elegant posture, soft positioning, graceful lines, sensual expression, looking at camera with soft gaze',
    'adult-sitting-sensual': 'full body sitting pose, sensual sitting position, legs positioned elegantly to one side or crossed, graceful body curves, sophisticated posture, elegant positioning, sensual expression, looking at camera with sophisticated gaze',
    'adult-sitting-suggestive': 'full body sitting pose, suggestive perched position, leaning forward slightly on edge of seat, legs positioned elegantly, alluring body positioning, elegant and suggestive posture, looking at camera with alluring expression',
    'adult-sitting-elegant': 'full body sitting pose, elegant sensual positioning, refined sophisticated posture, graceful body lines, elegant leg positioning, sophisticated pose, refined expression, looking at camera with elegant gaze',
    'adult-lying-elegant': 'full body reclining pose, lying down gracefully on surface, elegant positioning with refined posture, graceful body curves, sophisticated reclining position, elegant expression, looking at camera with refined gaze',
    'adult-lying-alluring': 'full body reclining pose, lying down elegantly, graceful curves emphasized, sophisticated positioning, alluring reclining posture, elegant lines, alluring expression, looking at camera with alluring gaze',
    'adult-lying-sensual': 'full body reclining pose, lying down gracefully, natural elegant positioning, graceful body positioning, refined reclining posture, sensual expression, looking at camera with sensual gaze',
  };

  return detailedDescriptions[pose.id] || pose.prompt;
}

async function ensureDirectories(): Promise<void> {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const dirs = ['poses', 'characters'];

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

async function generatePoseFromPrompt(
  prompt: string,
  outputPath: string,
  poseName: string,
  client: ComfyUIPodClient
): Promise<void> {
  console.log(`\n📸 Generating: ${poseName}`);
  console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

  const negativePrompt = 'deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature';

  // Build Z-Image Turbo workflow
  const workflow = buildZImageSimpleWorkflow({
    prompt,
    negativePrompt,
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    steps: 9, // Z-Image Turbo uses 9 steps (8 DiT forwards)
    cfg: 1.0, // Z-Image Turbo uses cfg 1.0
    seed: Math.floor(Math.random() * 2 ** 32),
    filenamePrefix: `ryla_pose_${poseName.toLowerCase().replace(/\s+/g, '_')}`,
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
  console.log('🎨 Studio Pose Thumbnail Generator');
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

  // Ensure directories exist
  await ensureDirectories();

  // Load character description
  console.log('📋 Character Analysis:');
  console.log(`   ${getCharacterPrompt().substring(0, 120)}...`);
  console.log('✓ Character description loaded\n');

  // Get all pose assets
  const poseAssets = getAllPoseAssets();
  console.log(`\n📋 Found ${poseAssets.length} poses to generate:`);
  console.log(`   - SFW: ${SFW_POSES.length}`);
  console.log(`   - Adult: ${ADULT_POSES.length}`);

  // Generate each pose
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < poseAssets.length; i++) {
    const asset = poseAssets[i];
    try {
      // Check if already exists
      if (fs.existsSync(asset.outputPath)) {
        console.log(`⏭️  Skipping ${asset.pose.name} (already exists)`);
        successCount++;
        continue;
      }

      await generatePoseFromPrompt(
        asset.fullPrompt,
        asset.outputPath,
        asset.pose.name,
        client
      );
      successCount++;

      // Rate limiting: wait 1.5 seconds between requests
      if (i < poseAssets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${asset.pose.name}:`, error);
      failCount++;

      // Wait longer on error
      if (i < poseAssets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  console.log(`\n✅ Generation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total: ${poseAssets.length}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { getAllPoseAssets, ensureDirectories, generatePoseFromPrompt };

