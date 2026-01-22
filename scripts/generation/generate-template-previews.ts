#!/usr/bin/env npx tsx
/**
 * Generate Template Preview Images
 *
 * Creates preview images for all curated templates in the template gallery.
 * Uses the Z-Image/Denrisi workflow for high-quality, consistent generation.
 * Stores images locally in apps/web/public/templates/
 *
 * Usage:
 *   npx tsx scripts/generation/generate-template-previews.ts [options]
 *
 * Options:
 *   --dry-run           Preview without generating
 *   --category=<name>   Generate only specific category
 *   --template=<name>   Generate specific template
 *   --resume            Skip already generated images
 *   --output=<dir>      Output directory (default: apps/web/public/templates)
 *
 * Epic: EP-050
 * Initiative: IN-017
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ComfyUIPodClient, buildZImageSimpleWorkflow } from '@ryla/business';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env.local') });

// =============================================================================
// CONFIGURATION
// =============================================================================

const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), 'apps', 'web', 'public', 'templates');

// Image dimensions by aspect ratio
const DIMENSIONS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '2:3': { width: 1024, height: 1536 },
  '9:16': { width: 768, height: 1365 },
  '3:4': { width: 1024, height: 1365 },
  '4:3': { width: 1365, height: 1024 },
  '16:9': { width: 1365, height: 768 },
  '3:2': { width: 1536, height: 1024 },
};

// For faster generation, use smaller preview size
const PREVIEW_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 512, height: 512 },
  '2:3': { width: 512, height: 768 },
  '9:16': { width: 512, height: 910 },
  '3:4': { width: 512, height: 683 },
  '4:3': { width: 683, height: 512 },
  '16:9': { width: 910, height: 512 },
  '3:2': { width: 768, height: 512 },
};

// Quality prompts
const QUALITY_PROMPT =
  'photorealistic, 8K, ultra detailed, professional photography, sharp focus, high quality, masterpiece';

const NEGATIVE_PROMPT =
  'blurry, deformed, ugly, bad anatomy, bad hands, missing fingers, extra fingers, watermark, signature, low quality, pixelated, cartoon, anime, illustration, painting, drawing, text, logo';

// Reference character for template previews
// Using a neutral, attractive character that works for all template types
const REFERENCE_CHARACTER = {
  sfw: {
    id: 'ref-sfw-001',
    description:
      'beautiful young woman, 25 years old, blonde hair, blue eyes, athletic body, natural makeup, clean skin',
  },
  nsfw: {
    id: 'ref-nsfw-001',
    description:
      'beautiful young woman, 25 years old, blonde hair, blue eyes, athletic body, sensual, natural makeup, clean skin',
  },
};

// =============================================================================
// TEMPLATE DEFINITIONS (from seed-templates.ts)
// =============================================================================

interface TemplatePreview {
  name: string;
  slug: string;
  category: string;
  aspectRatio: '1:1' | '2:3' | '9:16' | '3:4' | '4:3' | '16:9' | '3:2';
  nsfw: boolean;
  prompt: string;
  negativePrompt?: string;
  scene?: string;
  environment?: string;
  outfit?: string;
  poseId?: string;
  lightingId?: string;
  styleId?: string;
}

// Import template definitions
// These match the templates in seed-templates.ts
const TEMPLATES: TemplatePreview[] = [
  // -----------------------------------------
  // CATEGORY 1: Best for Beginners
  // -----------------------------------------
  {
    name: 'Classic Portrait',
    slug: 'classic-portrait',
    category: 'beginner',
    aspectRatio: '2:3',
    nsfw: false,
    scene: 'professional-portrait',
    environment: 'studio',
    outfit: 'Casual Streetwear',
    poseId: 'standing-confident',
    lightingId: 'studio-softbox',
    styleId: 'realistic',
    prompt: 'professional portrait, studio lighting, confident pose, casual streetwear, clean background',
  },
  {
    name: 'Cozy Home Vibes',
    slug: 'cozy-home-vibes',
    category: 'beginner',
    aspectRatio: '1:1',
    nsfw: false,
    scene: 'cozy-at-home',
    environment: 'home-living-room',
    outfit: 'Hoodie',
    poseId: 'sitting-lounging',
    lightingId: 'soft-diffused',
    styleId: 'general',
    prompt: 'cozy at home, relaxed on couch, wearing comfortable hoodie, soft natural lighting, living room',
  },
  {
    name: 'Golden Hour Magic',
    slug: 'golden-hour-magic',
    category: 'beginner',
    aspectRatio: '9:16',
    nsfw: false,
    scene: 'candid-lifestyle',
    environment: 'beach',
    outfit: 'Summer Chic',
    poseId: 'standing-casual',
    lightingId: 'golden-hour',
    styleId: 'golden-hour',
    prompt: 'candid beach shot, golden hour sunset, summer dress, relaxed casual pose, ocean background',
  },

  // -----------------------------------------
  // CATEGORY 2: Trending on Social
  // -----------------------------------------
  {
    name: 'TikTok Street Style',
    slug: 'tiktok-street-style',
    category: 'trending',
    aspectRatio: '9:16',
    nsfw: false,
    scene: 'candid-lifestyle',
    environment: 'urban-street',
    outfit: 'Casual Streetwear',
    poseId: 'standing-walking',
    lightingId: 'natural-daylight',
    styleId: 'street-view',
    prompt: 'urban street style, walking casually, streetwear fashion, city background, TikTok aesthetic',
  },
  {
    name: 'Clean Girl Aesthetic',
    slug: 'clean-girl-aesthetic',
    category: 'trending',
    aspectRatio: '1:1',
    nsfw: false,
    scene: 'morning-vibes',
    environment: 'home-bedroom',
    outfit: 'Tank Top',
    poseId: 'sitting-relaxed',
    lightingId: 'soft-diffused',
    styleId: 'clean-girl',
    prompt: 'clean girl aesthetic, minimal makeup, dewy skin, relaxed morning, soft natural light, bedroom',
  },
  {
    name: 'Dark Academia Study',
    slug: 'dark-academia-study',
    category: 'trending',
    aspectRatio: '2:3',
    nsfw: false,
    scene: 'professional-portrait',
    environment: 'office',
    outfit: 'Formal Attire',
    poseId: 'sitting-reading',
    lightingId: 'candlelight',
    styleId: 'dark-academia',
    prompt: 'dark academia aesthetic, reading in library, warm candlelight, vintage books, intellectual vibe',
  },
  {
    name: 'Cottagecore Dream',
    slug: 'cottagecore-dream',
    category: 'trending',
    aspectRatio: '2:3',
    nsfw: false,
    scene: 'candid-lifestyle',
    environment: 'cafe',
    outfit: 'Dress',
    poseId: 'sitting-perched',
    lightingId: 'sunrise',
    styleId: 'cottagecore',
    prompt: 'cottagecore aesthetic, floral dress, rustic cafe, soft morning light, romantic countryside',
  },
  {
    name: 'Coquette Vibes',
    slug: 'coquette-vibes',
    category: 'trending',
    aspectRatio: '9:16',
    nsfw: false,
    scene: 'morning-vibes',
    environment: 'home-bedroom',
    outfit: 'Babydoll',
    poseId: 'sitting-perched',
    lightingId: 'soft-diffused',
    styleId: 'coquette',
    prompt: 'coquette aesthetic, soft pink tones, feminine babydoll outfit, delicate, flirty, bows and lace',
  },

  // -----------------------------------------
  // CATEGORY 3: Professional/Business
  // -----------------------------------------
  {
    name: 'LinkedIn Headshot',
    slug: 'linkedin-headshot',
    category: 'professional',
    aspectRatio: '1:1',
    nsfw: false,
    scene: 'professional-portrait',
    environment: 'office',
    outfit: 'Formal Attire',
    poseId: 'standing-confident',
    lightingId: 'studio-softbox',
    styleId: 'realistic',
    prompt:
      'professional business headshot, formal attire, clean office background, confident smile, LinkedIn profile',
  },
  {
    name: 'Boss Mode Office',
    slug: 'boss-mode-office',
    category: 'professional',
    aspectRatio: '2:3',
    nsfw: false,
    scene: 'professional-portrait',
    environment: 'office',
    outfit: 'Formal Attire',
    poseId: 'standing-arms-crossed',
    lightingId: 'ring-light',
    styleId: 'editorial',
    prompt: 'boss woman, power pose, arms crossed, modern office, editorial lighting, confident entrepreneur',
  },

  // -----------------------------------------
  // CATEGORY 4: Fitness & Wellness
  // -----------------------------------------
  {
    name: 'Gym Motivation',
    slug: 'gym-motivation',
    category: 'fitness',
    aspectRatio: '9:16',
    nsfw: false,
    scene: 'fitness-motivation',
    environment: 'studio',
    outfit: 'Athleisure',
    poseId: 'action-exercising',
    lightingId: 'dramatic-shadows',
    styleId: 'high-contrast',
    prompt: 'gym workout, athletic wear, exercising, dramatic gym lighting, fitness motivation, strong pose',
  },
  {
    name: 'Yoga Zen',
    slug: 'yoga-zen',
    category: 'fitness',
    aspectRatio: '1:1',
    nsfw: false,
    scene: 'morning-vibes',
    environment: 'home-living-room',
    outfit: 'Yoga',
    poseId: 'action-yoga',
    lightingId: 'sunrise',
    styleId: 'dreamy',
    prompt: 'yoga pose, peaceful meditation, sunrise light, zen aesthetic, wellness, calm and centered',
  },

  // -----------------------------------------
  // CATEGORY 5: Glamour & Fashion
  // -----------------------------------------
  {
    name: 'Red Carpet Ready',
    slug: 'red-carpet-ready',
    category: 'glamour',
    aspectRatio: '2:3',
    nsfw: false,
    scene: 'fashion-editorial',
    environment: 'studio',
    outfit: 'Evening Gown',
    poseId: 'standing-confident',
    lightingId: 'dramatic-shadows',
    styleId: 'editorial',
    prompt:
      'red carpet glamour, elegant evening gown, dramatic lighting, Hollywood celebrity, fashion editorial',
  },
  {
    name: 'Date Night Glam',
    slug: 'date-night-glam',
    category: 'glamour',
    aspectRatio: '9:16',
    nsfw: false,
    scene: 'night-out',
    environment: 'urban-street',
    outfit: 'Cocktail Dress',
    poseId: 'standing-leaning',
    lightingId: 'neon-glow',
    styleId: 'neon-nights',
    prompt: 'date night look, cocktail dress, neon city lights, glamorous night out, sophisticated',
  },

  // -----------------------------------------
  // CATEGORY 6: Beach & Summer
  // -----------------------------------------
  {
    name: 'Beach Babe',
    slug: 'beach-babe',
    category: 'beach',
    aspectRatio: '9:16',
    nsfw: false,
    scene: 'beach-day',
    environment: 'beach',
    outfit: 'Bikini',
    poseId: 'standing-casual',
    lightingId: 'golden-hour',
    styleId: 'sunset-beach',
    prompt: 'beach vibes, bikini, golden hour sunset, ocean waves, summer vacation, sandy beach',
  },
  {
    name: 'Poolside Luxury',
    slug: 'poolside-luxury',
    category: 'beach',
    aspectRatio: '1:1',
    nsfw: false,
    scene: 'beach-day',
    environment: 'beach',
    outfit: 'Swimsuit',
    poseId: 'sitting-lounging',
    lightingId: 'midday',
    styleId: 'general',
    prompt: 'luxury pool party, stylish swimsuit, lounging poolside, summer vibes, bright sun',
  },

  // -----------------------------------------
  // CATEGORY 7: Night Life
  // -----------------------------------------
  {
    name: 'Neon Nights',
    slug: 'neon-nights',
    category: 'nightlife',
    aspectRatio: '9:16',
    nsfw: false,
    scene: 'night-out',
    environment: 'urban-street',
    outfit: 'Bodycon Dress',
    poseId: 'standing-leaning',
    lightingId: 'neon-glow',
    styleId: 'neon-nights',
    prompt: 'neon city nightlife, bodycon dress, vibrant neon lights, urban night scene, party vibe',
  },
  {
    name: 'Club Ready',
    slug: 'club-ready',
    category: 'nightlife',
    aspectRatio: '9:16',
    nsfw: false,
    scene: 'night-out',
    environment: 'urban-street',
    outfit: 'Mini Skirt',
    poseId: 'action-dancing',
    lightingId: 'strobe',
    styleId: 'high-contrast',
    prompt: 'club night, dancing, mini skirt, strobe lights, party atmosphere, bold and confident',
  },

  // -----------------------------------------
  // CATEGORY 8: Artistic & Creative
  // -----------------------------------------
  {
    name: 'Cyberpunk Future',
    slug: 'cyberpunk-future',
    category: 'artistic',
    aspectRatio: '2:3',
    nsfw: false,
    scene: 'night-out',
    environment: 'urban-street',
    outfit: 'Leather Outfit',
    poseId: 'standing-confident',
    lightingId: 'neon-glow',
    styleId: 'cyberpunk',
    prompt: 'cyberpunk aesthetic, leather outfit, neon lights, futuristic city, sci-fi atmosphere',
  },
  {
    name: 'Vaporwave Dreams',
    slug: 'vaporwave-dreams',
    category: 'artistic',
    aspectRatio: '1:1',
    nsfw: false,
    scene: 'candid-lifestyle',
    environment: 'studio',
    outfit: 'Casual Streetwear',
    poseId: 'sitting-relaxed',
    lightingId: 'colored-gel',
    styleId: 'vaporwave',
    prompt: 'vaporwave aesthetic, retro-futuristic, pastel colors, 80s nostalgia, dreamy atmosphere',
  },
  {
    name: 'Y2K Nostalgia',
    slug: 'y2k-nostalgia',
    category: 'artistic',
    aspectRatio: '1:1',
    nsfw: false,
    scene: 'candid-lifestyle',
    environment: 'home-bedroom',
    outfit: 'Crop Top',
    poseId: 'sitting-backward',
    lightingId: 'ring-light',
    styleId: 'y2k',
    prompt: 'Y2K aesthetic, early 2000s style, crop top, ring light selfie, nostalgic, playful',
  },

  // -----------------------------------------
  // CATEGORY 9: Fantasy & Cosplay
  // -----------------------------------------
  {
    name: 'Anime Maid',
    slug: 'anime-maid',
    category: 'fantasy',
    aspectRatio: '2:3',
    nsfw: false,
    scene: 'cozy-at-home',
    environment: 'home-living-room',
    outfit: 'Maid',
    poseId: 'standing-waving',
    lightingId: 'soft-diffused',
    styleId: 'general',
    prompt: 'cute anime maid costume, kawaii pose, waving, soft lighting, cosplay, playful',
  },
  {
    name: 'Bunny Girl',
    slug: 'bunny-girl',
    category: 'fantasy',
    aspectRatio: '9:16',
    nsfw: false,
    scene: 'night-out',
    environment: 'studio',
    outfit: 'Bunny',
    poseId: 'standing-confident',
    lightingId: 'ring-light',
    styleId: 'soft-glam',
    prompt: 'bunny girl costume, playful pose, ring light glamour, cosplay, cute and confident',
  },

  // -----------------------------------------
  // CATEGORY 10: Intimate/Adult (NSFW)
  // -----------------------------------------
  {
    name: 'Bedroom Eyes',
    slug: 'bedroom-eyes',
    category: 'intimate',
    aspectRatio: '2:3',
    nsfw: true,
    scene: 'cozy-at-home',
    environment: 'home-bedroom',
    outfit: 'Lingerie',
    poseId: 'adult-lying-elegant',
    lightingId: 'candlelight',
    styleId: 'soft-glam',
    prompt:
      'sensual bedroom, elegant lingerie, lying on bed, soft candlelight, intimate atmosphere, seductive eyes',
  },
  {
    name: 'Seductive Silhouette',
    slug: 'seductive-silhouette',
    category: 'intimate',
    aspectRatio: '9:16',
    nsfw: true,
    scene: 'night-out',
    environment: 'home-bedroom',
    outfit: 'Nightgown',
    poseId: 'adult-standing-seductive',
    lightingId: 'backlit-silhouette',
    styleId: 'moody-dark',
    prompt:
      'dramatic silhouette, sheer nightgown, backlit mysterious, moody dark atmosphere, seductive pose',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildFullPrompt(template: TemplatePreview): string {
  const character = template.nsfw ? REFERENCE_CHARACTER.nsfw : REFERENCE_CHARACTER.sfw;
  return `${character.description}, ${template.prompt}, ${QUALITY_PROMPT}`;
}

function parseArgs(): {
  dryRun: boolean;
  category?: string;
  template?: string;
  resume: boolean;
  outputDir: string;
  fullSize: boolean;
} {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    category: args.find((a) => a.startsWith('--category='))?.split('=')[1],
    template: args.find((a) => a.startsWith('--template='))?.split('=')[1],
    resume: args.includes('--resume') || !args.includes('--force'),
    outputDir: args.find((a) => a.startsWith('--output='))?.split('=')[1] || DEFAULT_OUTPUT_DIR,
    fullSize: args.includes('--full-size'),
  };
}

interface GenerationJob {
  template: TemplatePreview;
  outputPath: string;
  thumbPath: string;
  prompt: string;
  dimensions: { width: number; height: number };
}

// =============================================================================
// MAIN GENERATION LOGIC
// =============================================================================

async function generateTemplatePreviews() {
  const args = parseArgs();

  console.log('🎨 Template Preview Generator\n');
  console.log('='.repeat(60));
  console.log(`   Output: ${args.outputDir}`);
  console.log(`   Mode: ${args.dryRun ? 'DRY RUN' : 'GENERATE'}`);
  console.log(`   Size: ${args.fullSize ? 'FULL SIZE' : 'PREVIEW (512px)'}`);
  if (args.category) console.log(`   Category: ${args.category}`);
  if (args.template) console.log(`   Template: ${args.template}`);
  if (args.resume) console.log(`   Resume: Skip existing images`);
  console.log('='.repeat(60));

  // Filter templates
  let templates = TEMPLATES;

  if (args.category) {
    templates = templates.filter((t) => t.category === args.category);
  }

  if (args.template) {
    templates = templates.filter(
      (t) => t.name.toLowerCase() === args.template?.toLowerCase() || t.slug === args.template
    );
  }

  console.log(`\n📊 Templates to generate: ${templates.length}`);

  // Group by category
  const byCategory = templates.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('\n   By category:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count}`);
  });

  // Ensure output directory exists
  if (!fs.existsSync(args.outputDir)) {
    fs.mkdirSync(args.outputDir, { recursive: true });
    console.log(`\n📁 Created output directory: ${args.outputDir}`);
  }

  // Create category subdirectories
  for (const category of Object.keys(byCategory)) {
    const categoryDir = path.join(args.outputDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
  }

  // Build job list
  const jobs: GenerationJob[] = [];

  for (const template of templates) {
    const outputPath = path.join(args.outputDir, template.category, `${template.slug}.webp`);
    const thumbPath = path.join(args.outputDir, template.category, `${template.slug}-thumb.webp`);

    // Skip if resume mode and file exists
    if (args.resume && fs.existsSync(outputPath)) {
      console.log(`   ⏭️  ${template.name} - already exists`);
      continue;
    }

    const dimensionSet = args.fullSize ? DIMENSIONS : PREVIEW_DIMENSIONS;
    const dimensions = dimensionSet[template.aspectRatio] || dimensionSet['2:3'];

    jobs.push({
      template,
      outputPath,
      thumbPath,
      prompt: buildFullPrompt(template),
      dimensions,
    });
  }

  console.log(`\n📋 Jobs to process: ${jobs.length}`);

  if (jobs.length === 0) {
    console.log('✅ All preview images already exist!');
    return;
  }

  if (args.dryRun) {
    console.log('\n🔍 DRY RUN - Templates that would be generated:\n');
    for (const job of jobs) {
      console.log(`   ${job.template.name} (${job.template.category})`);
      console.log(`     Slug: ${job.template.slug}`);
      console.log(`     Aspect: ${job.template.aspectRatio}`);
      console.log(`     Dimensions: ${job.dimensions.width}x${job.dimensions.height}`);
      console.log(`     NSFW: ${job.template.nsfw ? 'Yes' : 'No'}`);
      console.log(`     Output: ${job.outputPath}`);
      console.log(`     Prompt: ${job.prompt.slice(0, 80)}...`);
      console.log();
    }
    console.log('✅ Dry run complete. Use without --dry-run to generate images.');
    return;
  }

  // Initialize ComfyUI client
  const podId = process.env['COMFYUI_POD_ID'];
  const comfyuiUrl =
    process.env['COMFYUI_URL'] ||
    process.env['COMFYUI_POD_URL'] ||
    (podId ? `https://${podId}-8188.proxy.runpod.net` : null);

  if (!comfyuiUrl) {
    console.error('\n❌ COMFYUI_URL or COMFYUI_POD_ID not set. Set in .env or .env.local');
    console.log('\n📋 Manual generation prompts:\n');

    // Output prompts for manual generation
    for (const job of jobs) {
      console.log(`--- ${job.template.category}/${job.template.slug} ---`);
      console.log(`Prompt: ${job.prompt}`);
      console.log(`Negative: ${NEGATIVE_PROMPT}`);
      console.log(`Dimensions: ${job.dimensions.width}x${job.dimensions.height}`);
      console.log(`Output: ${job.outputPath}\n`);
    }
    return;
  }

  console.log(`\n🔌 Using ComfyUI at: ${comfyuiUrl}`);

  const client = new ComfyUIPodClient({ baseUrl: comfyuiUrl });

  console.log('🔌 Connecting to ComfyUI pod...\n');

  // Generate images
  let successCount = 0;
  let errorCount = 0;

  for (const job of jobs) {
    console.log(`\n🖼️  Generating: ${job.template.category}/${job.template.slug}`);
    console.log(`   Dimensions: ${job.dimensions.width}x${job.dimensions.height}`);

    try {
      const workflow = buildZImageSimpleWorkflow({
        prompt: job.prompt,
        negativePrompt: NEGATIVE_PROMPT,
        width: job.dimensions.width,
        height: job.dimensions.height,
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
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Generation complete`);
  console.log(`   Generated: ${successCount}`);
  console.log(`   Failed: ${errorCount}`);
  console.log('='.repeat(60));
}

// =============================================================================
// RUN
// =============================================================================

generateTemplatePreviews().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
