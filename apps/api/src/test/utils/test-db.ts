import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '@ryla/data/schema';
import { resolve } from 'path';

export async function createTestDb() {
    const client = new PGlite();
    const db = drizzle(client, { schema });

    // Apply migrations
    // Use __dirname to resolve path relative to this file
    // apps/api/src/test/utils/test-db.ts -> drizzle/migrations is 5 levels up
    const migrationsPath = resolve(__dirname, '../../../../../drizzle/migrations');

    await migrate(db, { migrationsFolder: migrationsPath });

    return { db, client };
}
