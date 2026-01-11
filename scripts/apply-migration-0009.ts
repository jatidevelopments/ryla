/**
 * Script to apply migration 0009 (cards table and expired_at column)
 * This applies the migration directly to avoid interactive prompts
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function applyMigration() {
  const isLocal = (process.env.POSTGRES_ENVIRONMENT || process.env.NODE_ENV) === 'local';
  const host = process.env.POSTGRES_HOST || 'localhost';
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';
  
  const pool = new Pool({
    host,
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'ryla',
    password: process.env.POSTGRES_PASSWORD || 'ryla_local_dev',
    database: process.env.POSTGRES_DB || 'ryla',
    ssl: (isLocal || isLocalHost) ? false : { rejectUnauthorized: false },
  });

  const db = drizzle(pool);

  try {
    console.log('Applying migration 0009...');

    // Create cards table (if it doesn't exist)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "cards" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "card_hash" text NOT NULL,
        "last4" text,
        "card_type" text,
        "expiry_date" text,
        "is_default" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('✓ Created cards table');

    // Add expired_at column to subscriptions (if it doesn't exist)
    await pool.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'subscriptions' AND column_name = 'expired_at'
          ) THEN
              ALTER TABLE "subscriptions" ADD COLUMN "expired_at" timestamp;
          END IF;
      END $$;
    `);
    console.log('✓ Added expired_at column to subscriptions');

    // Add foreign key constraint (if it doesn't exist)
    await pool.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name = 'cards_user_id_users_id_fk'
          ) THEN
              ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_users_id_fk" 
              FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
              ON DELETE cascade ON UPDATE no action;
          END IF;
      END $$;
    `);
    console.log('✓ Added foreign key constraint');

    // Create indexes (if they don't exist)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "cards_user_id_idx" ON "cards" USING btree ("user_id");
    `);
    console.log('✓ Created cards_user_id_idx');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS "cards_is_default_idx" ON "cards" USING btree ("is_default");
    `);
    console.log('✓ Created cards_is_default_idx');

    // Mark migration as applied in drizzle migrations table
    await pool.query(`
      INSERT INTO "__drizzle_migrations" (hash, created_at)
      VALUES ('0009_opposite_sinister_six', NOW())
      ON CONFLICT DO NOTHING;
    `).catch(() => {
      // Migration table might not exist or migration already recorded
      console.log('Note: Could not record migration in drizzle_migrations table (this is OK)');
    });

    console.log('\n✅ Migration 0009 applied successfully!');
  } catch (error: any) {
    console.error('❌ Error applying migration:', error.message);
    if (error.code === '42P07') {
      console.log('Note: Some tables/columns may already exist. This is OK.');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

applyMigration().catch(console.error);

