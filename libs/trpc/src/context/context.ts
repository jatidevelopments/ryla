/**
 * tRPC Context
 *
 * Creates the context available in all tRPC procedures.
 * Uses JWT auth (same as NestJS API) and direct Drizzle database connection.
 *
 * NO SUPABASE - uses direct Postgres connection.
 */

import * as jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

import { createDrizzleDb, users, type DrizzleDb } from '@ryla/data';

/**
 * JWT payload structure (matches NestJS API)
 */
export interface JwtPayload {
  userId: string; // User UUID (NestJS API uses 'userId')
  email: string;
  role?: string;
  deviceId?: string;
  iat?: number;
  exp?: number;
}

/**
 * User type for context
 */
export interface ContextUser {
  id: string;
  email: string;
  name: string;
  publicName: string;
  role: 'user' | 'admin';
}

/**
 * Context available to all tRPC procedures
 */
export interface Context {
  /**
   * The authenticated user, or null if not authenticated
   */
  user: ContextUser | null;

  /**
   * Request headers
   */
  headers: Headers;

  /**
   * Drizzle database instance
   */
  db: DrizzleDb;
}

/**
 * Get database configuration from environment
 */
function getDbConfig() {
  const postgresEnv = process.env['POSTGRES_ENVIRONMENT'];
  const nodeEnv = process.env['NODE_ENV'];
  
  // Consider local if POSTGRES_ENVIRONMENT is 'local' OR NODE_ENV is 'development' or 'local'
  const isLocal =
    postgresEnv === 'local' ||
    nodeEnv === 'development' ||
    (nodeEnv as string) === 'local' ||
    (!postgresEnv && !nodeEnv); // Default to local if neither is set

  return {
    host: process.env['POSTGRES_HOST'] || 'localhost',
    port: Number(process.env['POSTGRES_PORT']) || 5432,
    user: process.env['POSTGRES_USER'] || 'ryla',
    password: process.env['POSTGRES_PASSWORD'] || 'ryla_local_dev',
    database: process.env['POSTGRES_DB'] || 'ryla',
    ssl: isLocal ? false : { rejectUnauthorized: false },
  };
}

/**
 * Verify JWT token and return payload
 */
function verifyToken(token: string): JwtPayload | null {
  // Use env var or fallback to 'secret' for local development
  // IMPORTANT: In production, JWT_ACCESS_SECRET MUST be set
  // MUST match the JWT_ACCESS_SECRET in apps/api/.env (or Infisical /apps/api path)
  const secret = process.env['JWT_ACCESS_SECRET'] || 'secret';

  // Warn if using default secret (might indicate misconfiguration)
  if (!process.env['JWT_ACCESS_SECRET']) {
    console.warn(
      '[tRPC Context] JWT_ACCESS_SECRET not set - using default "secret". ' +
      'This will cause token verification to fail if the API uses a different secret. ' +
      'Set JWT_ACCESS_SECRET in Infisical at /apps/web path (must match /apps/api).'
    );
  }

  if (process.env['NODE_ENV'] === 'production' && !process.env['JWT_ACCESS_SECRET']) {
    console.error('[tRPC Context] JWT_ACCESS_SECRET not configured in production!');
    return null;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    return payload;
  } catch (error) {
    // Log the actual error in development for debugging
    if (process.env['NODE_ENV'] === 'development') {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('[tRPC Context] Token verification failed:', errorMessage);
      console.warn('[tRPC Context] Token (first 20 chars):', token.substring(0, 20));
      console.warn('[tRPC Context] Using secret:', secret === 'secret' ? 'default "secret"' : 'from env');
    }
    // Token invalid or expired
    return null;
  }
}

/**
 * Options for creating context
 */
interface CreateContextOptions {
  headers: Headers;
}

/**
 * Creates the context for each tRPC request
 *
 * 1. Creates database connection
 * 2. Extracts and verifies JWT from Authorization header
 * 3. Looks up user in database
 * 4. Returns context with user and db
 */
export async function createContext(
  opts: CreateContextOptions
): Promise<Context> {
  const { headers } = opts;

  // Create database connection
  const db = createDrizzleDb(getDbConfig());

  // Extract authorization header (case-insensitive)
  const authHeader = headers.get('authorization') || headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  // No token = unauthenticated context
  if (!token) {
    return {
      user: null,
      headers,
      db,
    };
  }

  // Verify JWT
  const payload = verifyToken(token);

  if (!payload) {
    // Log token verification failure in development for debugging
    if (process.env['NODE_ENV'] === 'development') {
      console.warn('[tRPC Context] Token verification failed - token may be expired or invalid');
    }
    return {
      user: null,
      headers,
      db,
    };
  }

  try {
    // Look up user in database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      columns: {
        id: true,
        email: true,
        name: true,
        publicName: true,
        role: true,
      },
    });

    if (!dbUser) {
      return {
        user: null,
        headers,
        db,
      };
    }

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        publicName: dbUser.publicName,
        role: dbUser.role ?? 'user',
      },
      headers,
      db,
    };
  } catch (error) {
    console.error('[tRPC Context] Error looking up user:', error);
    return {
      user: null,
      headers,
      db,
    };
  }
}

/**
 * Create context for Next.js App Router
 */
export async function createNextContext() {
  const { headers } = await import('next/headers');
  const headersList = await headers();

  return createContext({
    headers: headersList,
  });
}
