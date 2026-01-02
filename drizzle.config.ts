import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const postgresEnvironment = process.env.POSTGRES_ENVIRONMENT || process.env.NODE_ENV;
const isLocal = postgresEnvironment === 'local';

function parseBoolEnv(value: string | undefined): boolean | undefined {
  if (value == null) return undefined;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
}

function isLocalHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1';
}

export default defineConfig({
  // Schema lives in libs/data for sharing across apps
  schema: './libs/data/src/schema/*.ts',

  // Migrations output directory
  out: './drizzle/migrations',

  dialect: 'postgresql',

  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'ryla',
    password: process.env.POSTGRES_PASSWORD || 'ryla_local_dev',
    database: process.env.POSTGRES_DB || 'ryla',
    // Local Docker Postgres typically does NOT support SSL.
    // Allow explicit override via POSTGRES_SSL=true/false, otherwise:
    // - disable SSL for localhost/127.0.0.1 or when POSTGRES_ENVIRONMENT=local
    // - enable SSL for remote hosts (e.g., Supabase)
    ssl:
      parseBoolEnv(process.env.POSTGRES_SSL) ??
      (isLocal || isLocalHost(process.env.POSTGRES_HOST || 'localhost')
        ? false
        : { rejectUnauthorized: false }),
  },

  // Verbose logging during migrations
  verbose: true,

  // Strict mode for safer migrations
  strict: true,
});
