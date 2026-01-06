#!/usr/bin/env npx tsx
/**
 * Template Gallery Seed Script
 *
 * Generates curated templates for the template gallery based on:
 * - Outfits (70 options)
 * - Poses (105+ options - SFW + Adult)
 * - Scenes (28 options)
 * - Visual Styles (40 options)
 * - Lighting (26 options)
 * - Environments (7 options)
 *
 * Usage:
 *   npx tsx scripts/utils/seed-templates.ts [--dry-run] [--category=<category>]
 *
 * Options:
 *   --dry-run           Preview without inserting to database
 *   --category=<name>   Generate only specific category
 */

import { schema } from '../libs/data/src';
import type { TemplateConfig } from '../libs/data/src/schema/templates.schema';

// =============================================================================
// TEMPLATE CATEGORIES DEFINITION
// =============================================================================

interface TemplateSeed {
  name: string;
  description: string;
  category: string;
  tags: string[];
  config: Partial<TemplateConfig>;
  previewImageUrl: string;
  thumbnailUrl: string;
}

// -----------------------------------------------------------------------------
// 1. OUTFITS - 70 outfit templates
// -----------------------------------------------------------------------------
const OUTFIT_CATEGORIES = {
  casual: [
    'Casual Streetwear', 'Athleisure', 'Yoga', 'Jeans', 'Tank Top',
    'Crop Top', 'Hoodie', 'Sweatpants', 'Denim Jacket', 'Sneakers & Leggings'
  ],
  glamour: [
    'Date Night Glam', 'Cocktail Dress', 'Mini Skirt', 'Dress', 'Summer Chic',
    'Evening Gown', 'Bodycon Dress', 'High Heels & Dress', 'Formal Attire', 'Red Carpet'
  ],
  intimate: [
    'Bikini', 'Lingerie', 'Swimsuit', 'Nightgown', 'Leotard',
    'Teddy', 'Babydoll', 'Bodysuit', 'Chemise', 'Slip'
  ],
  fantasy: [
    'Cheerleader', 'Nurse', 'Maid', 'Student Uniform', 'Police Officer',
    'Bunny', 'Cat', 'Princess', 'Superhero', 'Witch'
  ],
  kinky: [
    'Bondage Gear', 'Leather Outfit', 'Latex', 'Corset', 'Fishnet Stockings',
    'Garter Belt', 'Thigh Highs', 'Collar & Leash', 'PVC Outfit', 'Harness',
    'Cage Bra', 'Pasties Only', 'Body Harness', 'Strap-On', 'Bondage Rope'
  ],
  sexual: [
    'Nude', 'Topless', 'Bottomless', 'See-Through', 'Wet T-Shirt',
    'Oil Covered', 'Shower Scene', 'Bed Sheets Only', 'Towel Wrap', 'Open Robe',
    'Peek-a-Boo', 'Micro Bikini', 'Pasties & Thong', 'Body Paint', 'Edible Outfit'
  ]
};

// -----------------------------------------------------------------------------
// 2. POSES - 105+ pose templates
// -----------------------------------------------------------------------------
const SFW_POSES = [
  // Standing (13)
  'standing-casual', 'standing-confident', 'standing-walking', 'standing-leaning',
  'standing-arms-crossed', 'standing-hands-pocket', 'standing-pointing',
  'standing-waving', 'standing-thinking',
  // Sitting (8)
  'sitting-relaxed', 'sitting-cross', 'sitting-perched', 'sitting-lounging',
  'sitting-edge', 'sitting-backward', 'sitting-reading', 'sitting-working',
  // Action (8)
  'action-dancing', 'action-stretching', 'action-exercising', 'action-playing',
  'action-jumping', 'action-running', 'action-yoga', 'action-sports',
  // Expressive (3)
  'expressive-laughing', 'expressive-thinking', 'expressive-surprised'
];

const ADULT_POSES = [
  // Standing
  'adult-standing-seductive', 'adult-standing-alluring', 'adult-standing-sensual',
  // Sitting
  'adult-sitting-sensual', 'adult-sitting-suggestive', 'adult-sitting-elegant',
  // Lying
  'adult-lying-elegant', 'adult-lying-alluring', 'adult-lying-sensual',
  // Positions (subset - most popular)
  'adult-pov-missionary', 'adult-cowgirl', 'adult-doggystyle', 'adult-reverse-cowgirl',
  'adult-blowjob', 'adult-deepthroat', 'adult-handjob', 'adult-titjob',
  'adult-facesitting', 'adult-cunnilingus', 'adult-female-masturbation'
];

// -----------------------------------------------------------------------------
// 3. SCENES - 28 scene templates
// -----------------------------------------------------------------------------
const SCENES = {
  nature: [
    'beach-sunset', 'mountain-view', 'desert-sunset', 'lake-side',
    'forest-path', 'japanese-garden', 'urban-park', 'snow-scene'
  ],
  indoor: [
    'cozy-cafe', 'luxury-bedroom', 'gym', 'modern-kitchen',
    'home-office', 'bathroom-mirror', 'library', 'art-gallery', 'boutique-shop'
  ],
  urban: [
    'city-rooftop', 'neon-alley', 'paris-street', 'subway-station',
    'street-market', 'bridge-view', 'parking-garage'
  ],
  studio: ['white-studio', 'dark-studio'],
  fantasy: ['cyberpunk-city', 'enchanted-forest', 'underwater', 'space-station', 'medieval-castle', 'tropical-paradise']
};

// -----------------------------------------------------------------------------
// 4. VISUAL STYLES - 40 style templates
// -----------------------------------------------------------------------------
const VISUAL_STYLES = {
  camera: [
    'iphone', 'digitalcam', 'polaroid', 'disposable-camera',
    'film-grain', 'gopro', 'vintage-camera', 'cctv', 'retro-film'
  ],
  trending: ['cottagecore', 'clean-girl'],
  instagram: [
    'flight-mode', 'bimbocore', 'elevator-mirror', 'coquette', 'editorial'
  ],
  tiktok: ['street-view', 'tokyo-street', 'indie-sleaze'],
  beauty: ['ringselfie', 'soft-glam'],
  artistic: [
    'y2k', 'dark-academia', 'light-academia', 'minimalist', 'maximalist',
    'watercolor', 'oil-painting', 'sketch', 'pop-art'
  ],
  mood: [
    'sunset-beach', 'mt-fuji', 'golden-hour', 'neon-nights',
    'dreamy', 'moody-dark', 'pastel', 'high-contrast', 'monochrome'
  ],
  surreal: ['vaporwave', 'cyberpunk', 'steampunk']
};

// -----------------------------------------------------------------------------
// 5. LIGHTING - 26 lighting templates
// -----------------------------------------------------------------------------
const LIGHTING = {
  natural: [
    'natural-daylight', 'blue-hour', 'sunrise', 'midday',
    'cloudy-day', 'stormy', 'moonlight'
  ],
  golden_hour: ['golden-hour', 'sunset-glow'],
  studio: [
    'studio-softbox', 'ring-light', 'beauty-dish',
    'butterfly', 'rim-light', 'split-light'
  ],
  dramatic: [
    'dramatic-shadows', 'backlit-silhouette', 'firelight',
    'candlelight', 'strobe'
  ],
  cinematic: ['cinematic-moody'],
  soft: ['soft-diffused'],
  neon: ['neon-glow', 'colored-gel']
};

// -----------------------------------------------------------------------------
// 6. ENVIRONMENTS - 7 environment templates
// -----------------------------------------------------------------------------
const ENVIRONMENTS = [
  'beach', 'home-bedroom', 'home-living-room', 'office',
  'cafe', 'urban-street', 'studio'
];

// =============================================================================
// CURATED TEMPLATE COMBINATIONS
// =============================================================================

function generateCuratedTemplates(): TemplateSeed[] {
  const templates: TemplateSeed[] = [];

  // -----------------------------------------
  // CATEGORY 1: Best for Beginners (10)
  // -----------------------------------------
  templates.push(
    {
      name: 'Classic Portrait',
      description: 'Clean, professional portrait with natural lighting',
      category: 'beginner',
      tags: ['portrait', 'professional', 'beginner-friendly'],
      config: {
        scene: 'professional-portrait',
        environment: 'studio',
        outfit: 'Casual Streetwear',
        poseId: 'standing-confident',
        lightingId: 'studio-softbox',
        styleId: 'realistic',
        aspectRatio: '2:3',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/classic-portrait.webp',
      thumbnailUrl: '/templates/classic-portrait-thumb.webp',
    },
    {
      name: 'Cozy Home Vibes',
      description: 'Relaxed at-home aesthetic perfect for lifestyle content',
      category: 'beginner',
      tags: ['lifestyle', 'cozy', 'casual'],
      config: {
        scene: 'cozy-at-home',
        environment: 'home-living-room',
        outfit: 'Hoodie',
        poseId: 'sitting-lounging',
        lightingId: 'soft-diffused',
        styleId: 'general',
        aspectRatio: '1:1',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/cozy-home-vibes.webp',
      thumbnailUrl: '/templates/cozy-home-vibes-thumb.webp',
    },
    {
      name: 'Golden Hour Magic',
      description: 'Beautiful sunset lighting for dreamy outdoor shots',
      category: 'beginner',
      tags: ['golden-hour', 'outdoor', 'romantic'],
      config: {
        scene: 'candid-lifestyle',
        environment: 'beach',
        outfit: 'Summer Chic',
        poseId: 'standing-casual',
        lightingId: 'golden-hour',
        styleId: 'golden-hour',
        aspectRatio: '9:16',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/golden-hour-magic.webp',
      thumbnailUrl: '/templates/golden-hour-magic-thumb.webp',
    }
  );

  // -----------------------------------------
  // CATEGORY 2: Trending on Social (15)
  // -----------------------------------------
  const trendingTemplates: TemplateSeed[] = [
    {
      name: 'TikTok Street Style',
      description: 'Urban aesthetic perfect for TikTok content',
      category: 'trending',
      tags: ['tiktok', 'urban', 'streetwear'],
      config: {
        scene: 'candid-lifestyle',
        environment: 'urban-street',
        outfit: 'Casual Streetwear',
        poseId: 'standing-walking',
        lightingId: 'natural-daylight',
        styleId: 'street-view',
        aspectRatio: '9:16',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/tiktok-street-style.webp',
      thumbnailUrl: '/templates/tiktok-street-style-thumb.webp',
    },
    {
      name: 'Clean Girl Aesthetic',
      description: 'Minimalist beauty vibes trending on Instagram',
      category: 'trending',
      tags: ['instagram', 'clean-girl', 'minimal'],
      config: {
        scene: 'morning-vibes',
        environment: 'home-bedroom',
        outfit: 'Tank Top',
        poseId: 'sitting-relaxed',
        lightingId: 'soft-diffused',
        styleId: 'clean-girl',
        aspectRatio: '1:1',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/clean-girl-aesthetic.webp',
      thumbnailUrl: '/templates/clean-girl-aesthetic-thumb.webp',
    },
    {
      name: 'Dark Academia Study',
      description: 'Intellectual aesthetic with moody library vibes',
      category: 'trending',
      tags: ['dark-academia', 'library', 'aesthetic'],
      config: {
        scene: 'professional-portrait',
        environment: 'office',
        outfit: 'Formal Attire',
        poseId: 'sitting-reading',
        lightingId: 'candlelight',
        styleId: 'dark-academia',
        aspectRatio: '2:3',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/dark-academia-study.webp',
      thumbnailUrl: '/templates/dark-academia-study-thumb.webp',
    },
    {
      name: 'Cottagecore Dream',
      description: 'Rustic, romantic countryside aesthetic',
      category: 'trending',
      tags: ['cottagecore', 'romantic', 'nature'],
      config: {
        scene: 'candid-lifestyle',
        environment: 'cafe',
        outfit: 'Dress',
        poseId: 'sitting-perched',
        lightingId: 'sunrise',
        styleId: 'cottagecore',
        aspectRatio: '2:3',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/cottagecore-dream.webp',
      thumbnailUrl: '/templates/cottagecore-dream-thumb.webp',
    },
    {
      name: 'Coquette Vibes',
      description: 'Feminine, flirty aesthetic with soft pink tones',
      category: 'trending',
      tags: ['coquette', 'feminine', 'pink'],
      config: {
        scene: 'morning-vibes',
        environment: 'home-bedroom',
        outfit: 'Babydoll',
        poseId: 'sitting-perched',
        lightingId: 'soft-diffused',
        styleId: 'coquette',
        aspectRatio: '9:16',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/coquette-vibes.webp',
      thumbnailUrl: '/templates/coquette-vibes-thumb.webp',
    },
  ];
  templates.push(...trendingTemplates);

  // -----------------------------------------
  // CATEGORY 3: Professional/Business (10)
  // -----------------------------------------
  templates.push(
    {
      name: 'LinkedIn Headshot',
      description: 'Professional headshot for business profiles',
      category: 'professional',
      tags: ['business', 'headshot', 'professional'],
      config: {
        scene: 'professional-portrait',
        environment: 'office',
        outfit: 'Formal Attire',
        poseId: 'standing-confident',
        lightingId: 'studio-softbox',
        styleId: 'realistic',
        aspectRatio: '1:1',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/linkedin-headshot.webp',
      thumbnailUrl: '/templates/linkedin-headshot-thumb.webp',
    },
    {
      name: 'Boss Mode Office',
      description: 'Powerful office aesthetic for entrepreneurs',
      category: 'professional',
      tags: ['boss', 'office', 'power'],
      config: {
        scene: 'professional-portrait',
        environment: 'office',
        outfit: 'Formal Attire',
        poseId: 'standing-arms-crossed',
        lightingId: 'ring-light',
        styleId: 'editorial',
        aspectRatio: '2:3',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/boss-mode-office.webp',
      thumbnailUrl: '/templates/boss-mode-office-thumb.webp',
    }
  );

  // -----------------------------------------
  // CATEGORY 4: Fitness & Wellness (10)
  // -----------------------------------------
  templates.push(
    {
      name: 'Gym Motivation',
      description: 'Powerful gym workout aesthetic',
      category: 'fitness',
      tags: ['gym', 'fitness', 'workout'],
      config: {
        scene: 'fitness-motivation',
        environment: 'studio',
        outfit: 'Athleisure',
        poseId: 'action-exercising',
        lightingId: 'dramatic-shadows',
        styleId: 'high-contrast',
        aspectRatio: '9:16',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/gym-motivation.webp',
      thumbnailUrl: '/templates/gym-motivation-thumb.webp',
    },
    {
      name: 'Yoga Zen',
      description: 'Peaceful yoga and meditation aesthetic',
      category: 'fitness',
      tags: ['yoga', 'zen', 'wellness'],
      config: {
        scene: 'morning-vibes',
        environment: 'home-living-room',
        outfit: 'Yoga',
        poseId: 'action-yoga',
        lightingId: 'sunrise',
        styleId: 'dreamy',
        aspectRatio: '1:1',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/yoga-zen.webp',
      thumbnailUrl: '/templates/yoga-zen-thumb.webp',
    }
  );

  // -----------------------------------------
  // CATEGORY 5: Glamour & Fashion (15)
  // -----------------------------------------
  templates.push(
    {
      name: 'Red Carpet Ready',
      description: 'Hollywood glamour with dramatic lighting',
      category: 'glamour',
      tags: ['red-carpet', 'glamour', 'celebrity'],
      config: {
        scene: 'fashion-editorial',
        environment: 'studio',
        outfit: 'Evening Gown',
        poseId: 'standing-confident',
        lightingId: 'dramatic-shadows',
        styleId: 'editorial',
        aspectRatio: '2:3',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/red-carpet-ready.webp',
      thumbnailUrl: '/templates/red-carpet-ready-thumb.webp',
    },
    {
      name: 'Date Night Glam',
      description: 'Perfect look for a romantic evening out',
      category: 'glamour',
      tags: ['date-night', 'romantic', 'glamour'],
      config: {
        scene: 'night-out',
        environment: 'urban-street',
        outfit: 'Cocktail Dress',
        poseId: 'standing-leaning',
        lightingId: 'neon-glow',
        styleId: 'neon-nights',
        aspectRatio: '9:16',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/date-night-glam.webp',
      thumbnailUrl: '/templates/date-night-glam-thumb.webp',
    }
  );

  // -----------------------------------------
  // CATEGORY 6: Beach & Summer (10)
  // -----------------------------------------
  templates.push(
    {
      name: 'Beach Babe',
      description: 'Perfect summer beach vibes',
      category: 'beach',
      tags: ['beach', 'summer', 'bikini'],
      config: {
        scene: 'beach-day',
        environment: 'beach',
        outfit: 'Bikini',
        poseId: 'standing-casual',
        lightingId: 'golden-hour',
        styleId: 'sunset-beach',
        aspectRatio: '9:16',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/beach-babe.webp',
      thumbnailUrl: '/templates/beach-babe-thumb.webp',
    },
    {
      name: 'Poolside Luxury',
      description: 'Glamorous pool party aesthetic',
      category: 'beach',
      tags: ['pool', 'luxury', 'summer'],
      config: {
        scene: 'beach-day',
        environment: 'beach',
        outfit: 'Swimsuit',
        poseId: 'sitting-lounging',
        lightingId: 'midday',
        styleId: 'general',
        aspectRatio: '1:1',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/poolside-luxury.webp',
      thumbnailUrl: '/templates/poolside-luxury-thumb.webp',
    }
  );

  // -----------------------------------------
  // CATEGORY 7: Night Life (10)
  // -----------------------------------------
  templates.push(
    {
      name: 'Neon Nights',
      description: 'Vibrant city nightlife with neon lights',
      category: 'nightlife',
      tags: ['neon', 'night', 'city'],
      config: {
        scene: 'night-out',
        environment: 'urban-street',
        outfit: 'Bodycon Dress',
        poseId: 'standing-leaning',
        lightingId: 'neon-glow',
        styleId: 'neon-nights',
        aspectRatio: '9:16',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/neon-nights.webp',
      thumbnailUrl: '/templates/neon-nights-thumb.webp',
    },
    {
      name: 'Club Ready',
      description: 'Bold look for the dance floor',
      category: 'nightlife',
      tags: ['club', 'party', 'dance'],
      config: {
        scene: 'night-out',
        environment: 'urban-street',
        outfit: 'Mini Skirt',
        poseId: 'action-dancing',
        lightingId: 'strobe',
        styleId: 'high-contrast',
        aspectRatio: '9:16',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/club-ready.webp',
      thumbnailUrl: '/templates/club-ready-thumb.webp',
    }
  );

  // -----------------------------------------
  // CATEGORY 8: Artistic & Creative (10)
  // -----------------------------------------
  templates.push(
    {
      name: 'Cyberpunk Future',
      description: 'Futuristic neon cyberpunk aesthetic',
      category: 'artistic',
      tags: ['cyberpunk', 'futuristic', 'neon'],
      config: {
        scene: 'night-out',
        environment: 'urban-street',
        outfit: 'Leather Outfit',
        poseId: 'standing-confident',
        lightingId: 'neon-glow',
        styleId: 'cyberpunk',
        aspectRatio: '2:3',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/cyberpunk-future.webp',
      thumbnailUrl: '/templates/cyberpunk-future-thumb.webp',
    },
    {
      name: 'Vaporwave Dreams',
      description: 'Retro-futuristic aesthetic with pastel colors',
      category: 'artistic',
      tags: ['vaporwave', 'retro', 'aesthetic'],
      config: {
        scene: 'candid-lifestyle',
        environment: 'studio',
        outfit: 'Casual Streetwear',
        poseId: 'sitting-relaxed',
        lightingId: 'colored-gel',
        styleId: 'vaporwave',
        aspectRatio: '1:1',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/vaporwave-dreams.webp',
      thumbnailUrl: '/templates/vaporwave-dreams-thumb.webp',
    },
    {
      name: 'Y2K Nostalgia',
      description: 'Early 2000s aesthetic with low-res charm',
      category: 'artistic',
      tags: ['y2k', 'nostalgia', '2000s'],
      config: {
        scene: 'candid-lifestyle',
        environment: 'home-bedroom',
        outfit: 'Crop Top',
        poseId: 'sitting-backward',
        lightingId: 'ring-light',
        styleId: 'y2k',
        aspectRatio: '1:1',
        qualityMode: 'draft',
        nsfw: false,
      },
      previewImageUrl: '/templates/y2k-nostalgia.webp',
      thumbnailUrl: '/templates/y2k-nostalgia-thumb.webp',
    }
  );

  // -----------------------------------------
  // CATEGORY 9: Fantasy & Cosplay (10)
  // -----------------------------------------
  templates.push(
    {
      name: 'Anime Maid',
      description: 'Cute anime-inspired maid aesthetic',
      category: 'fantasy',
      tags: ['anime', 'maid', 'cosplay'],
      config: {
        scene: 'cozy-at-home',
        environment: 'home-living-room',
        outfit: 'Maid',
        poseId: 'standing-waving',
        lightingId: 'soft-diffused',
        styleId: 'general',
        aspectRatio: '2:3',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/anime-maid.webp',
      thumbnailUrl: '/templates/anime-maid-thumb.webp',
    },
    {
      name: 'Bunny Girl',
      description: 'Playful bunny costume aesthetic',
      category: 'fantasy',
      tags: ['bunny', 'playful', 'costume'],
      config: {
        scene: 'night-out',
        environment: 'studio',
        outfit: 'Bunny',
        poseId: 'standing-confident',
        lightingId: 'ring-light',
        styleId: 'soft-glam',
        aspectRatio: '9:16',
        qualityMode: 'hq',
        nsfw: false,
      },
      previewImageUrl: '/templates/bunny-girl.webp',
      thumbnailUrl: '/templates/bunny-girl-thumb.webp',
    }
  );

  // -----------------------------------------
  // CATEGORY 10: Intimate/Adult (15) - NSFW
  // -----------------------------------------
  templates.push(
    {
      name: 'Bedroom Eyes',
      description: 'Sensual bedroom aesthetic with soft lighting',
      category: 'intimate',
      tags: ['bedroom', 'sensual', 'intimate'],
      config: {
        scene: 'cozy-at-home',
        environment: 'home-bedroom',
        outfit: 'Lingerie',
        poseId: 'adult-lying-elegant',
        lightingId: 'candlelight',
        styleId: 'soft-glam',
        aspectRatio: '2:3',
        qualityMode: 'hq',
        nsfw: true,
      },
      previewImageUrl: '/templates/bedroom-eyes.webp',
      thumbnailUrl: '/templates/bedroom-eyes-thumb.webp',
    },
    {
      name: 'Seductive Silhouette',
      description: 'Dramatic backlit silhouette for mystery',
      category: 'intimate',
      tags: ['silhouette', 'dramatic', 'sensual'],
      config: {
        scene: 'night-out',
        environment: 'home-bedroom',
        outfit: 'Nightgown',
        poseId: 'adult-standing-seductive',
        lightingId: 'backlit-silhouette',
        styleId: 'moody-dark',
        aspectRatio: '9:16',
        qualityMode: 'hq',
        nsfw: true,
      },
      previewImageUrl: '/templates/seductive-silhouette.webp',
      thumbnailUrl: '/templates/seductive-silhouette-thumb.webp',
    }
  );

  return templates;
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const categoryArg = args.find(a => a.startsWith('--category='));
  const filterCategory = categoryArg?.split('=')[1];

  console.log('🎨 Template Gallery Seed Script\n');
  console.log('='.repeat(60));

  // Generate templates
  let templates = generateCuratedTemplates();

  if (filterCategory) {
    templates = templates.filter(t => t.category === filterCategory);
    console.log(`📁 Filtering by category: ${filterCategory}`);
  }

  console.log(`\n📊 Template Summary:`);
  console.log(`   Total templates: ${templates.length}`);

  // Group by category
  const byCategory = templates.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n   By category:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count}`);
  });

  if (isDryRun) {
    console.log('\n🔍 DRY RUN - Preview of templates:');
    templates.slice(0, 5).forEach((t, i) => {
      console.log(`\n   ${i + 1}. ${t.name}`);
      console.log(`      Category: ${t.category}`);
      console.log(`      Tags: ${t.tags.join(', ')}`);
      console.log(`      Scene: ${t.config.scene}`);
      console.log(`      Outfit: ${t.config.outfit}`);
      console.log(`      Pose: ${t.config.poseId}`);
    });
    console.log('\n   ... and more');
    console.log('\n✅ Dry run complete. Use without --dry-run to insert into database.');
    return;
  }

  // Database connection - use pg Pool directly for better error handling
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
  const db = drizzle(pool, { schema });
  
  // Test connection
  try {
    const client = await pool.connect();
    const testResult = await client.query('SELECT 1 as test');
    console.log('✅ Database connection successful');
    
    // Count existing templates
    const countResult = await client.query('SELECT COUNT(*) as count FROM templates');
    console.log(`📊 Existing templates in DB: ${countResult.rows[0]?.count ?? 0}`);
    client.release();
  } catch (connError: any) {
    console.error('❌ Database connection failed:', connError.message);
    await pool.end();
    process.exit(1);
  }

  console.log('📝 Inserting templates...\n');

  let inserted = 0;
  for (const template of templates) {
    try {
      const config = {
        scene: template.config.scene ?? null,
        environment: template.config.environment ?? null,
        outfit: template.config.outfit ?? null,
        aspectRatio: template.config.aspectRatio ?? '1:1',
        qualityMode: template.config.qualityMode ?? 'hq',
        nsfw: template.config.nsfw ?? false,
        poseId: template.config.poseId ?? null,
        styleId: template.config.styleId ?? null,
        lightingId: template.config.lightingId ?? null,
        modelId: template.config.modelId ?? 'flux-pulid',
        objects: template.config.objects ?? null,
        prompt: template.config.prompt,
        promptEnhance: template.config.promptEnhance,
      };
      
      const result = await db.insert(schema.templates).values({
        name: template.name,
        description: template.description,
        previewImageUrl: template.previewImageUrl,
        thumbnailUrl: template.thumbnailUrl,
        config: config as TemplateConfig,
        tags: template.tags,
        isPublic: true,
        isCurated: true,
        usageCount: Math.floor(Math.random() * 100), // Seed with random usage
      }).returning({ id: schema.templates.id });
      
      inserted++;
      console.log(`   ✓ ${template.name} (id: ${result[0]?.id})`);
    } catch (error: any) {
      // Log full error details
      console.error(`   ✗ ${template.name}:`);
      console.error(`      Error: ${error?.message || String(error)}`);
      console.error(`      Code: ${error?.code}`);
      console.error(`      Detail: ${error?.detail}`);
    }
  }

  console.log(`\n✅ Inserted ${inserted}/${templates.length} templates`);
  
  // Close pool
  await pool.end();
  console.log('🔌 Done');
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

