import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '@ryla/data/schema';
import { resolve } from 'path';
import { sql } from 'drizzle-orm';

/**
 * Create a test database instance
 * 
 * NOTE: This creates a NEW database and runs ALL migrations (17 migrations, ~1100 lines of SQL).
 * This is expensive and happens for every test that calls this.
 * 
 * For better performance, consider:
 * 1. Using beforeAll instead of beforeEach to create DB once per test suite
 * 2. Using transactions to rollback changes between tests
 * 3. Sharing database instances across tests in the same file
 */
export async function createTestDb(): Promise<{ db: any; client: any }> {
    // Create new database instance
    const client = new PGlite();
    const db = drizzle(client, { schema });

    // Apply migrations (this is the expensive operation - runs 17 migrations with ~1100 lines of SQL)
    // Use __dirname to resolve path relative to this file
    // apps/api/src/test/utils/test-db.ts -> drizzle/migrations is 5 levels up
    const migrationsPath = resolve(__dirname, '../../../../../drizzle/migrations');
    await migrate(db, { migrationsFolder: migrationsPath });

    return { db, client };
}
