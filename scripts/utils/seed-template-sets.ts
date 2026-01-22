#!/usr/bin/env npx tsx
/**
 * Template Sets Seed Script
 *
 * Populates the database with curated template sets (collections of templates).
 * Template sets allow users to apply multiple templates at once for consistent content packs.
 *
 * Usage:
 *   npx tsx scripts/utils/seed-template-sets.ts [--dry-run]
 *
 * Epic: EP-052
 * Initiative: IN-017
 */

import * as schema from '../../libs/data/src/schema';

// =============================================================================
// TEMPLATE SET DEFINITIONS
// =============================================================================

interface TemplateSetSeed {
  name: string;
  description: string;
  category: string;
  contentType: 'image' | 'mixed';
  isPublic: true;
  isCurated: true;
  // Template slugs that belong to this set (references seed-templates.ts)
  templateSlugs: string[];
  previewImageUrl: string;
  thumbnailUrl: string;
}

const TEMPLATE_SETS: TemplateSetSeed[] = [
  // -----------------------------------------
  // Instagram Starter Pack
  // -----------------------------------------
  {
    name: 'Instagram Starter Pack',
    description: 'Perfect mix of feed and story formats for new Instagram creators',
    category: 'social',
    contentType: 'image',
    isPublic: true,
    isCurated: true,
    templateSlugs: [
      'classic-portrait',       // 2:3 - Feed
      'cozy-home-vibes',       // 1:1 - Feed square
      'golden-hour-magic',     // 9:16 - Story
      'clean-girl-aesthetic',  // 1:1 - Feed square
      'tiktok-street-style',   // 9:16 - Story/Reel
      'date-night-glam',       // 9:16 - Story
      'yoga-zen',              // 1:1 - Feed square
      'beach-babe',            // 9:16 - Story
    ],
    previewImageUrl: '/templates/sets/instagram-starter-pack.webp',
    thumbnailUrl: '/templates/sets/instagram-starter-pack-thumb.webp',
  },

  // -----------------------------------------
  // OnlyFans Essentials
  // -----------------------------------------
  {
    name: 'OnlyFans Essentials',
    description: 'Mix of SFW teasers and NSFW content for OnlyFans creators',
    category: 'monetization',
    contentType: 'mixed',
    isPublic: true,
    isCurated: true,
    templateSlugs: [
      'classic-portrait',       // SFW - Profile
      'cozy-home-vibes',        // SFW - Lifestyle
      'beach-babe',             // SFW - Beach tease
      'coquette-vibes',         // SFW - Flirty
      'bunny-girl',             // SFW - Cosplay tease
      'bedroom-eyes',           // NSFW - Intimate
      'seductive-silhouette',   // NSFW - Artistic
    ],
    previewImageUrl: '/templates/sets/onlyfans-essentials.webp',
    thumbnailUrl: '/templates/sets/onlyfans-essentials-thumb.webp',
  },

  // -----------------------------------------
  // Professional Portfolio
  // -----------------------------------------
  {
    name: 'Professional Portfolio',
    description: 'Business-ready headshots and poses for LinkedIn and professional use',
    category: 'business',
    contentType: 'image',
    isPublic: true,
    isCurated: true,
    templateSlugs: [
      'linkedin-headshot',      // 1:1 - Profile
      'boss-mode-office',       // 2:3 - Full
      'dark-academia-study',    // 2:3 - Intellectual
      'classic-portrait',       // 2:3 - Clean
    ],
    previewImageUrl: '/templates/sets/professional-portfolio.webp',
    thumbnailUrl: '/templates/sets/professional-portfolio-thumb.webp',
  },

  // -----------------------------------------
  // Beach Day Collection
  // -----------------------------------------
  {
    name: 'Beach Day Collection',
    description: 'Various beach scenes and outfits for summer content',
    category: 'lifestyle',
    contentType: 'image',
    isPublic: true,
    isCurated: true,
    templateSlugs: [
      'beach-babe',             // Bikini sunset
      'poolside-luxury',        // Pool lounge
      'golden-hour-magic',      // Beach golden hour
    ],
    previewImageUrl: '/templates/sets/beach-day-collection.webp',
    thumbnailUrl: '/templates/sets/beach-day-collection-thumb.webp',
  },

  // -----------------------------------------
  // Date Night Series
  // -----------------------------------------
  {
    name: 'Date Night Series',
    description: 'Evening and glamour looks for special occasions',
    category: 'glamour',
    contentType: 'image',
    isPublic: true,
    isCurated: true,
    templateSlugs: [
      'red-carpet-ready',       // Formal
      'date-night-glam',        // Cocktail
      'neon-nights',            // City night
      'club-ready',             // Party
    ],
    previewImageUrl: '/templates/sets/date-night-series.webp',
    thumbnailUrl: '/templates/sets/date-night-series-thumb.webp',
  },

  // -----------------------------------------
  // Fitness Journey
  // -----------------------------------------
  {
    name: 'Fitness Journey',
    description: 'Gym, yoga, and active content for fitness influencers',
    category: 'fitness',
    contentType: 'image',
    isPublic: true,
    isCurated: true,
    templateSlugs: [
      'gym-motivation',         // Workout
      'yoga-zen',               // Yoga
      'beach-babe',             // Active beach
    ],
    previewImageUrl: '/templates/sets/fitness-journey.webp',
    thumbnailUrl: '/templates/sets/fitness-journey-thumb.webp',
  },

  // -----------------------------------------
  // Cozy Home Vibes
  // -----------------------------------------
  {
    name: 'Cozy Home Vibes',
    description: 'At-home lifestyle content for relatable influencers',
    category: 'lifestyle',
    contentType: 'image',
    isPublic: true,
    isCurated: true,
    templateSlugs: [
      'cozy-home-vibes',        // Living room
      'clean-girl-aesthetic',   // Morning bedroom
      'cottagecore-dream',      // Rustic
      'y2k-nostalgia',          // Bedroom retro
    ],
    previewImageUrl: '/templates/sets/cozy-home-vibes.webp',
    thumbnailUrl: '/templates/sets/cozy-home-vibes-thumb.webp',
  },

  // -----------------------------------------
  // Bedroom Collection (NSFW)
  // -----------------------------------------
  {
    name: 'Bedroom Collection',
    description: 'Intimate and sensual content for adult platforms',
    category: 'intimate',
    contentType: 'image',
    isPublic: true,
    isCurated: true,
    templateSlugs: [
      'bedroom-eyes',           // Lingerie
      'seductive-silhouette',   // Artistic
      'coquette-vibes',         // Flirty tease
    ],
    previewImageUrl: '/templates/sets/bedroom-collection.webp',
    thumbnailUrl: '/templates/sets/bedroom-collection-thumb.webp',
  },

  // -----------------------------------------
  // Fantasy Roleplay
  // -----------------------------------------
  {
    name: 'Fantasy Roleplay',
    description: 'Cosplay and costume content for creative creators',
    category: 'fantasy',
    contentType: 'image',
    isPublic: true,
    isCurated: true,
    templateSlugs: [
      'anime-maid',             // Maid cosplay
      'bunny-girl',             // Bunny costume
      'cyberpunk-future',       // Sci-fi
    ],
    previewImageUrl: '/templates/sets/fantasy-roleplay.webp',
    thumbnailUrl: '/templates/sets/fantasy-roleplay-thumb.webp',
  },

  // -----------------------------------------
  // Street Style Pack
  // -----------------------------------------
  {
    name: 'Street Style Pack',
    description: 'Urban and streetwear content for fashion influencers',
    category: 'fashion',
    contentType: 'image',
    isPublic: true,
    isCurated: true,
    templateSlugs: [
      'tiktok-street-style',    // Urban walking
      'neon-nights',            // City night
      'cyberpunk-future',       // Futuristic
      'vaporwave-dreams',       // Retro
    ],
    previewImageUrl: '/templates/sets/street-style-pack.webp',
    thumbnailUrl: '/templates/sets/street-style-pack-thumb.webp',
  },

  // -----------------------------------------
  // Trending Aesthetics
  // -----------------------------------------
  {
    name: 'Trending Aesthetics',
    description: 'All the trending aesthetics in one pack',
    category: 'trending',
    contentType: 'image',
    isPublic: true,
    isCurated: true,
    templateSlugs: [
      'clean-girl-aesthetic',   // Clean girl
      'dark-academia-study',    // Dark academia
      'cottagecore-dream',      // Cottagecore
      'coquette-vibes',         // Coquette
      'y2k-nostalgia',          // Y2K
      'vaporwave-dreams',       // Vaporwave
    ],
    previewImageUrl: '/templates/sets/trending-aesthetics.webp',
    thumbnailUrl: '/templates/sets/trending-aesthetics-thumb.webp',
  },
];

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log('📦 Template Sets Seed Script\n');
  console.log('='.repeat(60));

  console.log(`\n📊 Template Sets Summary:`);
  console.log(`   Total sets: ${TEMPLATE_SETS.length}`);

  // Group by category
  const byCategory = TEMPLATE_SETS.reduce(
    (acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('\n   By category:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count}`);
  });

  if (isDryRun) {
    console.log('\n🔍 DRY RUN - Template sets that would be created:\n');
    TEMPLATE_SETS.forEach((set, i) => {
      console.log(`   ${i + 1}. ${set.name}`);
      console.log(`      Category: ${set.category}`);
      console.log(`      Content Type: ${set.contentType}`);
      console.log(`      Templates: ${set.templateSlugs.length}`);
      console.log(`      - ${set.templateSlugs.join(', ')}`);
      console.log();
    });
    console.log('✅ Dry run complete. Use without --dry-run to insert into database.');
    return;
  }

  // Database connection
  console.log('\n🔌 Connecting to database...');

  const { Pool } = await import('pg');

  const pool = new Pool({
    host: process.env['POSTGRES_HOST'] || 'localhost',
    port: Number(process.env['POSTGRES_PORT']) || 5432,
    user: process.env['POSTGRES_USER'] || 'ryla',
    password: process.env['POSTGRES_PASSWORD'] || 'ryla_local_dev',
    database: process.env['POSTGRES_DB'] || 'ryla',
    max: 5,
  });

  const { drizzle } = await import('drizzle-orm/node-postgres');
  const { eq } = await import('drizzle-orm');
  const db = drizzle(pool, { schema });

  // Test connection
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Count existing sets
    const countResult = await client.query('SELECT COUNT(*) as count FROM template_sets');
    console.log(`📊 Existing template sets in DB: ${countResult.rows[0]?.count ?? 0}`);
    client.release();
  } catch (connError: any) {
    console.error('❌ Database connection failed:', connError.message);
    await pool.end();
    process.exit(1);
  }

  // Get all templates to resolve slugs to IDs
  console.log('\n📝 Loading templates...');
  const templates = await db.query.templates.findMany();
  console.log(`   Found ${templates.length} templates`);

  // Create slug -> id mapping
  // Note: We need to derive slug from template name since it's not stored
  const slugToId = new Map<string, string>();
  for (const t of templates) {
    const slug = t.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    slugToId.set(slug, t.id);
  }

  console.log('📝 Inserting template sets...\n');

  let inserted = 0;
  for (const set of TEMPLATE_SETS) {
    try {
      // Resolve template slugs to IDs
      const templateIds: string[] = [];
      for (const slug of set.templateSlugs) {
        const id = slugToId.get(slug);
        if (id) {
          templateIds.push(id);
        } else {
          console.log(`   ⚠️ Template "${slug}" not found, skipping`);
        }
      }

      if (templateIds.length === 0) {
        console.log(`   ✗ ${set.name}: No valid templates found`);
        continue;
      }

      // Insert template set
      const [insertedSet] = await db
        .insert(schema.templateSets)
        .values({
          name: set.name,
          description: set.description,
          previewImageUrl: set.previewImageUrl,
          thumbnailUrl: set.thumbnailUrl,
          contentType: set.contentType,
          isPublic: true,
          isCurated: true,
          likesCount: Math.floor(Math.random() * 50), // Seed with random likes
          usageCount: Math.floor(Math.random() * 100), // Seed with random usage
        })
        .returning({ id: schema.templateSets.id });

      // Insert set members
      for (let i = 0; i < templateIds.length; i++) {
        await db.insert(schema.templateSetMembers).values({
          setId: insertedSet.id,
          templateId: templateIds[i],
          orderPosition: i,
        });
      }

      // Update member_count after inserting members
      await db
        .update(schema.templateSets)
        .set({ memberCount: templateIds.length })
        .where(eq(schema.templateSets.id, insertedSet.id));

      inserted++;
      console.log(`   ✓ ${set.name} (${templateIds.length} templates)`);
    } catch (error: any) {
      console.error(`   ✗ ${set.name}:`);
      console.error(`      Error: ${error?.message || String(error)}`);
    }
  }

  console.log(`\n✅ Inserted ${inserted}/${TEMPLATE_SETS.length} template sets`);

  // Close pool
  await pool.end();
  console.log('🔌 Done');
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
