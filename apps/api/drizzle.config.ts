import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from apps/api/.env
dotenv.config({ path: resolve(__dirname, '.env') });

const isLocal = (process.env.POSTGRES_ENVIRONMENT || process.env.NODE_ENV) === 'local';

export default {
  schema: './src/database/schemas/*.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'ryla',
    ssl: isLocal ? false : { rejectUnauthorized: false },
  },
} satisfies Config;

