/**
 * Test Database Setup for Web App
 * 
 * Creates an in-memory PostgreSQL database using pglite for testing.
 * Applies all migrations to ensure schema is up-to-date.
 */

import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '@ryla/data/schema';
import { resolve } from 'path';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';

// PGlite uses sync mode, so we use 'sync' as the mode
export type PgLiteDatabase = PgDatabase<'sync', ExtractTablesWithRelations<typeof schema>>;

export interface TestDb {
  db: PgLiteDatabase;
  client: PGlite;
}

/**
 * Create a test database instance with all migrations applied
 */
export async function setupTestDb(): Promise<TestDb> {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  // Apply migrations
  // apps/web/lib/test/utils/test-db.ts -> drizzle/migrations is 6 levels up
  const migrationsPath = resolve(__dirname, '../../../../../drizzle/migrations');

  await migrate(db, { migrationsFolder: migrationsPath });

  return { db, client };
}

/**
 * Reset test database (clear all data but keep schema)
 */
export async function resetTestDb(db: PgLiteDatabase): Promise<void> {
  // Note: pglite doesn't have a built-in reset, so we'd need to truncate tables
  // For now, we'll create a new instance per test file
  // This is acceptable since pglite is fast
}

/**
 * Clean up test database
 */
export async function teardownTestDb(client: PGlite): Promise<void> {
  await client.close();
}
