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
  const isLocal =
    (process.env['POSTGRES_ENVIRONMENT'] || process.env['NODE_ENV']) ===
    'local';

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
  const secret = process.env['JWT_ACCESS_SECRET'] || 'secret';

  if (process.env['NODE_ENV'] === 'production' && !process.env['JWT_ACCESS_SECRET']) {
    console.error('[tRPC Context] JWT_ACCESS_SECRET not configured in production!');
    return null;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    return payload;
  } catch (error) {
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

  // Extract authorization header
  const authHeader = headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

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
