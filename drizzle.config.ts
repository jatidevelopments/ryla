import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const isLocal =
  (process.env.POSTGRES_ENVIRONMENT || process.env.NODE_ENV) === 'local';

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
    ssl: isLocal ? false : { rejectUnauthorized: false },
  },

  // Verbose logging during migrations
  verbose: true,

  // Strict mode for safer migrations
  strict: true,
});
