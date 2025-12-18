import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '../schema';

export type DrizzleDb = ReturnType<typeof createDrizzleDb>;

/**
 * Create a Drizzle database instance with the provided connection config.
 * Use this for standalone scripts or testing.
 */
export function createDrizzleDb(config: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  max?: number;
}) {
  const pool = new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl ?? false,
    max: config.max ?? 20,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });

  return drizzle(pool, { schema });
}

/**
 * Create a Drizzle database instance from environment variables.
 * Useful for scripts and CLI tools.
 */
export function createDrizzleDbFromEnv() {
  const isLocal =
    (process.env['POSTGRES_ENVIRONMENT'] || process.env['NODE_ENV']) ===
    'local';

  return createDrizzleDb({
    host: process.env['POSTGRES_HOST'] || 'localhost',
    port: Number(process.env['POSTGRES_PORT']) || 5432,
    user: process.env['POSTGRES_USER'] || 'ryla',
    password: process.env['POSTGRES_PASSWORD'] || 'ryla_local_dev',
    database: process.env['POSTGRES_DB'] || 'ryla',
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
}

// Re-export schema for convenience
export { schema };
