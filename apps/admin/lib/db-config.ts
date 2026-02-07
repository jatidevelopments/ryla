/**
 * Database configuration for the admin app.
 * Supports DATABASE_URL (e.g. on Fly.io) or POSTGRES_* env vars.
 */

export interface AdminDbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean | { rejectUnauthorized: boolean };
}

/**
 * Parse DATABASE_URL into connection config.
 * Handles postgresql:// and postgres:// with optional ?sslmode=require.
 */
function parseDatabaseUrl(url: string): AdminDbConfig {
  const parsed = new URL(url);
  const database =
    (parsed.pathname || '/ryla').slice(1).replace(/^\/+/, '') || 'ryla';
  const sslMode = parsed.searchParams.get('sslmode');
  const isLocalHost =
    !parsed.hostname ||
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1';
  const useSsl =
    sslMode === 'require' ||
    sslMode === 'no-verify' ||
    (!isLocalHost && parsed.hostname !== '');

  return {
    host: parsed.hostname || 'localhost',
    port: Number(parsed.port) || 5432,
    user: decodeURIComponent(parsed.username || 'ryla'),
    password: decodeURIComponent(parsed.password || ''),
    database,
    ssl: useSsl ? { rejectUnauthorized: sslMode !== 'no-verify' } : false,
  };
}

/**
 * Get database config from environment.
 * Uses DATABASE_URL if set (typical on Fly.io), otherwise POSTGRES_*.
 */
export function getAdminDbConfig(): AdminDbConfig {
  const databaseUrl = process.env['DATABASE_URL'];
  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    return parseDatabaseUrl(databaseUrl);
  }

  const env =
    process.env['POSTGRES_ENVIRONMENT'] ||
    process.env['NODE_ENV'] ||
    'development';
  const isLocal = env === 'local' || env === 'development';
  const isProduction = env === 'production';

  return {
    host: process.env['POSTGRES_HOST'] || 'localhost',
    port: Number(process.env['POSTGRES_PORT']) || 5432,
    user: process.env['POSTGRES_USER'] || 'ryla',
    password: process.env['POSTGRES_PASSWORD'] || 'ryla_local_dev',
    database: process.env['POSTGRES_DB'] || 'ryla',
    ssl: isLocal ? false : isProduction ? { rejectUnauthorized: false } : false,
  };
}
