/**
 * Seed Prompts Database
 *
 * Imports all prompts from libs/business/src/prompts/templates.ts
 * into the database prompts table.
 *
 * Usage:
 *   pnpm db:seed:prompts
 *   # or directly:
 *   pnpm tsx apps/api/src/database/seed-prompts.ts
 *
 * Automatically loads .env file if available.
 * Defaults match docker-compose.yml (ryla/ryla_local_dev)
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@ryla/data/schema';
// Import from business prompts (exported via index)
import { promptTemplates } from '@ryla/business';

async function seedPrompts() {
  // Get database connection from env (same as API config)
  // Defaults match docker-compose.yml for local development
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = parseInt(process.env.POSTGRES_PORT || '5432', 10);
  const user = process.env.POSTGRES_USER || 'ryla';
  const password = process.env.POSTGRES_PASSWORD || 'ryla_local_dev';
  const database = process.env.POSTGRES_DB || 'ryla';

  const pool = new Pool({
    host,
    port,
    user,
    password,
    database,
    max: 20,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });

  const db = drizzle(pool, { schema });

  console.log('🌱 Starting prompt seed...');
  console.log(`📦 Found ${promptTemplates.length} prompts to import`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const template of promptTemplates) {
    try {
      // Check if prompt already exists (by checking if there's a prompt with similar name)
      const existing = await db.query.prompts.findFirst({
        where: (prompts, { eq }) => eq(prompts.name, template.name),
      });

      if (existing) {
        console.log(`⏭️  Skipping "${template.name}" (already exists)`);
        skipped++;
        continue;
      }

      // Map template to database schema
      await db.insert(schema.prompts).values({
        name: template.name,
        description: template.description,
        category: template.category as any,
        subcategory: template.subcategory,
        template: template.template,
        negativePrompt: template.negativePrompt || null,
        requiredDNA: template.requiredDNA || [],
        tags: template.tags || [],
        rating: template.rating as any,
        recommendedWorkflow: template.recommendedWorkflow || null,
        aspectRatio: template.aspectRatio as any,
        isSystemPrompt: true, // All imported prompts are system prompts
        isPublic: true,
        isActive: true,
        usageCount: 0,
        successCount: 0,
        favoriteCount: 0,
        createdBy: null, // System prompts have no creator
      });

      console.log(`✅ Imported "${template.name}"`);
      imported++;
    } catch (error) {
      console.error(`❌ Error importing "${template.name}":`, error);
      errors++;
    }
  }

  console.log('\n📊 Seed Summary:');
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📦 Total: ${promptTemplates.length}`);

  await pool.end();
  console.log('\n✨ Seed complete!');
}

// Run if called directly
if (require.main === module) {
  seedPrompts()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { seedPrompts };

