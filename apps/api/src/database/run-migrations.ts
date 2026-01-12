/**
 * Database Migration Runner
 * 
 * This script runs Drizzle migrations on application startup.
 * It should be called before the NestJS app starts.
 * 
 * Usage:
 *   import { runMigrations } from './database/run-migrations';
 *   await runMigrations();
 */

import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { resolve } from 'path';
import chalk from 'chalk';

export async function runMigrations(): Promise<void> {
  try {
    const postgresHost = process.env.POSTGRES_HOST || 'localhost';
    const postgresPort = parseInt(process.env.POSTGRES_PORT || '5432', 10);
    const postgresUser = process.env.POSTGRES_USER || 'postgres';
    const postgresPassword = process.env.POSTGRES_PASSWORD || '';
    const postgresDb = process.env.POSTGRES_DB || 'ryla';
    const postgresEnvironment = process.env.POSTGRES_ENVIRONMENT || 'local';

    // Create connection pool
    const pool = new Pool({
      host: postgresHost,
      port: postgresPort,
      user: postgresUser,
      password: postgresPassword,
      database: postgresDb,
      ssl: postgresEnvironment !== 'local' ? { rejectUnauthorized: false } : false,
    });

    // Create Drizzle instance
    const db = drizzle(pool);

    // Resolve migrations path
    // In production Docker: /app/drizzle/migrations (copied to Docker image)
    // In local dev: drizzle/migrations (relative to project root)
    // __dirname in production: /app/dist/apps/api/src/database
    // __dirname in local: <project>/dist/apps/api/src/database
    const migrationsPath = process.env.NODE_ENV === 'production'
      ? resolve('/app/drizzle/migrations')
      : resolve(__dirname, '../../../../drizzle/migrations');

    console.log(chalk.blue('🔄 Running database migrations...'));
    console.log(chalk.gray(`   Migrations path: ${migrationsPath}`));
    console.log(chalk.gray(`   Database: ${postgresHost}:${postgresPort}/${postgresDb}`));

    // Run migrations
    await migrate(db, { migrationsFolder: migrationsPath });

    console.log(chalk.green('✅ Database migrations completed successfully'));

    // Close the pool
    await pool.end();
  } catch (error) {
    console.error(chalk.red('❌ Migration failed:'), error);
    throw error;
  }
}
