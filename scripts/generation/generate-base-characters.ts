/**
 * Generate Base Character Images using Local RunPod ComfyUI with Z-Image Turbo
 * 
 * This script generates base character images for EP-033:
 * - 1 base female character image
 * - 1 base male character image
 * 
 * These base characters serve as reference templates for all subsequent
 * wizard image generation (ethnicity, body types, features, etc.).
 * 
 * Uses local ComfyUI pod with Z-Image Turbo workflow to generate consistent,
 * high-quality, appealing base character images.
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

// Negative prompt for base characters (SFW only) - Strong emphasis on clothing
const NEGATIVE_PROMPT = 'deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature, no person, empty scene, no character, nude, naked, no clothing, bare skin, exposed, topless, bottomless, see-through, transparent clothing, revealing, lingerie, underwear visible, cleavage';

// Base character prompts - Full body
const BASE_CHARACTER_PROMPTS = {
    female: 'A beautiful, attractive woman, 25 years old, caucasian ethnicity, screen actress appearance, professional model look, Hollywood actress features, elegant and refined, long brown hair, brown eyes, slim athletic body type, freckles on cheeks, natural beauty marks, rosy complexion, wearing fully clothed, casual stylish outfit, appropriate clothing, modest attire, professional portrait, full body view, clearly visible in the scene, ' + BASE_STYLE,
    male: 'A handsome, attractive man, 28 years old, caucasian ethnicity, short brown hair, brown eyes, athletic body type, wearing fully clothed, casual stylish outfit, appropriate clothing, modest attire, professional portrait, full body view, clearly visible in the scene, ' + BASE_STYLE,
};

// Base character prompts - Portrait (close-up, influencer-style, emotional, happy, sexy)
const BASE_CHARACTER_PORTRAIT_PROMPTS = {
    female: 'A beautiful, attractive woman, 25 years old, caucasian ethnicity, screen actress appearance, professional model look, Hollywood actress features, elegant and refined, long brown hair, brown eyes, slim athletic body type, freckles on cheeks, natural beauty marks, rosy complexion, wearing fully clothed, casual stylish outfit, appropriate clothing, modest attire, influencer style portrait, close-up portrait, head and shoulders, face clearly visible, beautiful facial features, happy expression, genuine smile, confident pose, sexy attractive look, emotional connection, unique personality, social media influencer aesthetic, engaging eye contact, natural lighting, ' + BASE_STYLE,
    male: 'A handsome, attractive man, 28 years old, caucasian ethnicity, short brown hair, brown eyes, athletic body type, wearing fully clothed, casual stylish outfit, appropriate clothing, modest attire, influencer style portrait, close-up portrait, head and shoulders, face clearly visible, handsome facial features, happy expression, genuine smile, confident pose, sexy attractive look, emotional connection, unique personality, social media influencer aesthetic, engaging eye contact, natural lighting, ' + BASE_STYLE,
};

interface BaseCharacter {
    gender: 'female' | 'male';
    prompt: string;
    outputPath: string;
    name: string;
}

function getBaseCharacters(): BaseCharacter[] {
    const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
    const baseDir = path.join(publicDir, 'images', 'wizard', 'base', 'caucasian');

    return [
        {
            gender: 'female',
            prompt: BASE_CHARACTER_PROMPTS.female,
            outputPath: path.join(baseDir, 'female-full-body.webp'),
            name: 'Base Female Character (Full Body)',
        },
        {
            gender: 'male',
            prompt: BASE_CHARACTER_PROMPTS.male,
            outputPath: path.join(baseDir, 'male-full-body.webp'),
            name: 'Base Male Character (Full Body)',
        },
        {
            gender: 'female',
            prompt: BASE_CHARACTER_PORTRAIT_PROMPTS.female,
            outputPath: path.join(baseDir, 'female-portrait.webp'),
            name: 'Base Female Character (Portrait)',
        },
        {
            gender: 'male',
            prompt: BASE_CHARACTER_PORTRAIT_PROMPTS.male,
            outputPath: path.join(baseDir, 'male-portrait.webp'),
            name: 'Base Male Character (Portrait)',
        },
    ];
}

async function ensureDirectories(): Promise<void> {
    const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
    const baseDir = path.join(publicDir, 'images', 'wizard', 'base', 'caucasian');

    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
        console.log(`✓ Created directory: ${baseDir}`);
    }
}

async function saveImageAsWebP(imageBuffer: Buffer, outputPath: string): Promise<void> {
    fs.writeFileSync(outputPath, imageBuffer);
}

async function generateBaseCharacter(
    character: BaseCharacter,
    client: ComfyUIPodClient
): Promise<void> {
    console.log(`\n📸 Generating: ${character.name}`);
    console.log(`   Prompt: ${character.prompt.substring(0, 100)}...`);

    // Build Z-Image Turbo workflow
    const workflow = buildZImageSimpleWorkflow({
        prompt: character.prompt,
        negativePrompt: NEGATIVE_PROMPT,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        steps: 9, // Z-Image Turbo uses 9 steps (8 DiT forwards)
        cfg: 1.0, // Z-Image Turbo uses cfg 1.0
        seed: Math.floor(Math.random() * 2 ** 32),
        filenamePrefix: `ryla_base_${character.gender}`,
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
    await saveImageAsWebP(imageBuffer, character.outputPath);

    console.log(`   ✓ Saved to ${character.outputPath}`);

    // Check file size
    const stats = fs.statSync(character.outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   ✓ File size: ${fileSizeKB} KB`);

    if (stats.size > 100 * 1024) {
        console.warn(`   ⚠️  Warning: File size exceeds 100KB target (${fileSizeKB} KB)`);
        console.log(`   💡 Run: python3 scripts/generation/optimize-base-characters.py to optimize`);
    }
}

async function main() {
    console.log('🎨 Base Character Image Generator');
    console.log('=================================\n');
    console.log('Generating base character images for EP-033');
    console.log('These will serve as reference templates for all wizard image generation.\n');

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

    // Get base characters to generate
    const baseCharacters = getBaseCharacters();
    console.log(`\n📋 Found ${baseCharacters.length} base characters to generate:`);
    baseCharacters.forEach((char) => {
        console.log(`   - ${char.name} (${char.gender})`);
    });

    // Generate each base character
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < baseCharacters.length; i++) {
        const character = baseCharacters[i];
        try {
            // Check if already exists
            if (fs.existsSync(character.outputPath)) {
                console.log(`\n⏭️  Skipping ${character.name} (already exists at ${character.outputPath})`);
                successCount++;
                continue;
            }

            await generateBaseCharacter(character, client);
            successCount++;

            // Rate limiting: wait 1 second between requests (except for last one)
            if (i < baseCharacters.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error(`❌ Failed to generate ${character.name}:`, error);
            failCount++;

            // Wait a bit longer on error before retrying
            if (i < baseCharacters.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    console.log(`\n✅ Generation complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Total: ${baseCharacters.length}`);

    if (successCount === baseCharacters.length) {
        console.log(`\n🎉 All base character images generated successfully!`);
        console.log(`   These images are ready to use as reference templates for:`);
        console.log(`   - EP-034: Ethnicity Image Generation`);
        console.log(`   - EP-035: Body Type Image Generation`);
        console.log(`   - EP-036: Ethnicity-Specific Feature Images`);
    }
}

// Run if executed directly (Node.js)
if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export { getBaseCharacters, ensureDirectories, generateBaseCharacter };
