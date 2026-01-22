#!/usr/bin/env npx tsx
/**
 * Generate Template Set Preview Images
 *
 * Creates preview images for template sets by:
 * 1. Using member template thumbnails to create a composite grid
 * 2. Or using the first member's preview as fallback
 * 3. Updates the database with preview URLs
 *
 * Usage:
 *   npx tsx scripts/generation/generate-template-set-previews.ts [options]
 *
 * Options:
 *   --dry-run           Preview without updating database
 *   --set-id=<id>       Generate for specific set only
 *   --resume            Skip sets that already have preview images
 *
 * Epic: EP-047 (Template Gallery UX Redesign)
 * Initiative: IN-011 (Template Gallery & Content Library)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@ryla/data/schema';
import { eq, or, asc } from 'drizzle-orm';
import sharp from 'sharp';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env.local') });

// =============================================================================
// CONFIGURATION
// =============================================================================

const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), 'apps', 'web', 'public', 'template-sets');
const PREVIEW_SIZE = 1024; // Square preview image
const THUMBNAIL_SIZE = 512; // Square thumbnail

// =============================================================================
// ARGUMENT PARSING
// =============================================================================

interface Args {
  dryRun: boolean;
  setId?: string;
  resume: boolean;
}

function parseArgs(): Args {
  const args: Args = {
    dryRun: false,
    resume: false,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--resume') {
      args.resume = true;
    } else if (arg.startsWith('--set-id=')) {
      args.setId = arg.split('=')[1];
    }
  }

  return args;
}

// =============================================================================
// DATABASE SETUP
// =============================================================================

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  return drizzle(pool, { schema });
}

// =============================================================================
// IMAGE COMPOSITION
// =============================================================================

/**
 * Create a composite grid preview from member template thumbnails
 */
async function createCompositePreview(
  memberThumbnails: string[],
  outputPath: string,
  size: number = PREVIEW_SIZE
): Promise<void> {
  if (memberThumbnails.length === 0) {
    throw new Error('No thumbnails provided');
  }

  // Take up to 4 thumbnails for the grid
  const thumbnails = memberThumbnails.slice(0, 4);
  const gridSize = thumbnails.length <= 1 ? 1 : 2; // 1x1 or 2x2 grid
  const cellSize = Math.floor(size / gridSize);
  const gap = 4; // Gap between cells

  // Load and resize all thumbnails
  const images: sharp.OverlayOptions[] = [];
  
  for (let i = 0; i < thumbnails.length; i++) {
    const thumb = thumbnails[i];
    if (!thumb || !fs.existsSync(thumb)) {
      continue;
    }

    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const x = col * cellSize + (col > 0 ? gap : 0);
    const y = row * cellSize + (row > 0 ? gap : 0);

    try {
      const resized = await sharp(thumb)
        .resize(cellSize - gap, cellSize - gap, {
          fit: 'cover',
          position: 'center',
        })
        .toBuffer();

      images.push({
        input: resized,
        left: x,
        top: y,
      });
    } catch (error) {
      console.warn(`   ⚠️  Failed to load thumbnail ${thumb}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (images.length === 0) {
    throw new Error('No valid thumbnails could be loaded');
  }

  // Create composite image
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 16, g: 16, b: 22 }, // Dark background matching RYLA theme
    },
  })
    .composite(images)
    .webp({ quality: 85 })
    .toFile(outputPath);
}

/**
 * Copy and resize a single image as preview
 */
async function createSinglePreview(
  sourcePath: string,
  outputPath: string,
  size: number = PREVIEW_SIZE
): Promise<void> {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source image not found: ${sourcePath}`);
  }

  await sharp(sourcePath)
    .resize(size, size, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 85 })
    .toFile(outputPath);
}

// =============================================================================
// MAIN GENERATION LOGIC
// =============================================================================

async function generateTemplateSetPreviews() {
  const args = parseArgs();

  console.log('🎨 Template Set Preview Generator\n');
  console.log('='.repeat(60));
  console.log(`   Output: ${DEFAULT_OUTPUT_DIR}`);
  console.log(`   Mode: ${args.dryRun ? 'DRY RUN' : 'GENERATE & UPDATE'}`);
  if (args.setId) console.log(`   Set ID: ${args.setId}`);
  if (args.resume) console.log(`   Resume: Skip sets with existing previews`);
  console.log('='.repeat(60));

  // Ensure output directory exists
  if (!fs.existsSync(DEFAULT_OUTPUT_DIR)) {
    fs.mkdirSync(DEFAULT_OUTPUT_DIR, { recursive: true });
    console.log(`\n📁 Created output directory: ${DEFAULT_OUTPUT_DIR}`);
  }

  // Connect to database
  const db = getDatabase();
  console.log('\n🔌 Connected to database\n');

  // Fetch template sets
  let sets;
  if (args.setId) {
    const set = await db.query.templateSets.findFirst({
      where: eq(schema.templateSets.id, args.setId),
    });
    sets = set ? [set] : [];
  } else {
    // Get all public/curated sets
    sets = await db.query.templateSets.findMany({
      where: or(
        eq(schema.templateSets.isPublic, true),
        eq(schema.templateSets.isCurated, true)
      ),
    });
  }

  console.log(`📊 Template sets to process: ${sets.length}\n`);

  if (sets.length === 0) {
    console.log('✅ No template sets found!');
    return;
  }

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const set of sets) {
    console.log(`\n📦 ${set.name} (${set.id})`);

    // Skip if resume mode and preview exists
    if (args.resume && set.previewImageUrl) {
      console.log(`   ⏭️  Already has preview: ${set.previewImageUrl}`);
      skippedCount++;
      continue;
    }

    // Get set members with templates
    const members = await db.query.templateSetMembers.findMany({
      where: eq(schema.templateSetMembers.setId, set.id),
      orderBy: [asc(schema.templateSetMembers.orderPosition)],
      with: {
        template: true,
      },
    });

    if (members.length === 0) {
      console.log(`   ⚠️  No members found, skipping`);
      errorCount++;
      continue;
    }

    console.log(`   📋 ${members.length} member templates`);

    // Collect member thumbnails/previews
    const memberThumbnails: string[] = [];
    for (const member of members) {
      const template = member.template;
      if (!template) continue;

      // Try thumbnail first, then preview
      const thumbUrl = template.thumbnailUrl || template.previewImageUrl;
      if (thumbUrl) {
        // Convert URL to local path if needed
        // Assuming images are in apps/web/public/templates/
        const localPath = thumbUrl.startsWith('http')
          ? null // Skip remote URLs for now
          : path.join(process.cwd(), 'apps', 'web', 'public', thumbUrl.replace(/^\//, ''));

        if (localPath && fs.existsSync(localPath)) {
          memberThumbnails.push(localPath);
        }
      }
    }

    if (memberThumbnails.length === 0) {
      console.log(`   ⚠️  No member thumbnails found, using first template's preview`);
      // Try to use first member's preview as fallback
      const firstMember = members[0]?.template;
      if (firstMember?.previewImageUrl) {
        const firstPreview = path.join(
          process.cwd(),
          'apps',
          'web',
          'public',
          firstMember.previewImageUrl.replace(/^\//, '')
        );
        if (fs.existsSync(firstPreview)) {
          memberThumbnails.push(firstPreview);
        }
      }
    }

    if (memberThumbnails.length === 0) {
      console.log(`   ❌ No preview images available for members`);
      errorCount++;
      continue;
    }

    // Generate preview and thumbnail
    const setId = set.id;
    const previewPath = path.join(DEFAULT_OUTPUT_DIR, `${setId}-preview.webp`);
    const thumbnailPath = path.join(DEFAULT_OUTPUT_DIR, `${setId}-thumb.webp`);

    try {
      if (memberThumbnails.length > 1) {
        // Create composite grid
        console.log(`   🖼️  Creating composite grid from ${memberThumbnails.length} thumbnails`);
        await createCompositePreview(memberThumbnails, previewPath, PREVIEW_SIZE);
        await createCompositePreview(memberThumbnails, thumbnailPath, THUMBNAIL_SIZE);
      } else {
        // Use single image
        console.log(`   🖼️  Using single member preview`);
        await createSinglePreview(memberThumbnails[0], previewPath, PREVIEW_SIZE);
        await createSinglePreview(memberThumbnails[0], thumbnailPath, THUMBNAIL_SIZE);
      }

      const previewUrl = `/template-sets/${setId}-preview.webp`;
      const thumbnailUrl = `/template-sets/${setId}-thumb.webp`;

      console.log(`   ✅ Generated: ${previewPath}`);
      console.log(`   ✅ Generated: ${thumbnailPath}`);

      if (!args.dryRun) {
        // Update database
        await db
          .update(schema.templateSets)
          .set({
            previewImageUrl: previewUrl,
            thumbnailUrl: thumbnailUrl,
            updatedAt: new Date(),
          })
          .where(eq(schema.templateSets.id, setId));

        console.log(`   💾 Updated database with preview URLs`);
      } else {
        console.log(`   🔍 Would update database with:`);
        console.log(`      previewImageUrl: ${previewUrl}`);
        console.log(`      thumbnailUrl: ${thumbnailUrl}`);
      }

      successCount++;
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Generation complete`);
  console.log(`   Generated: ${successCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Failed: ${errorCount}`);
  console.log('='.repeat(60));
}

// =============================================================================
// RUN
// =============================================================================

generateTemplateSetPreviews()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
