/**
 * Admin tRPC Setup
 *
 * Separate tRPC setup for admin app with admin JWT authentication.
 * Uses admin_users table and ADMIN_JWT_SECRET.
 */

import * as jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { createDrizzleDb, adminUsers } from '@ryla/data';
import { getAdminDbConfig } from '@/lib/db-config';

// Import types from base.ts (they're defined there to avoid circular dependencies)
import type { AdminContextUser, AdminContext } from './base';

/**
 * Admin JWT payload structure
 */
export interface AdminJwtPayload {
  sub: string; // Admin user ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Verify admin JWT token and return payload
 */
function verifyAdminToken(token: string): AdminJwtPayload | null {
  const secret =
    process.env['ADMIN_JWT_SECRET'] || 'admin-secret-change-in-production';

  if (
    process.env['NODE_ENV'] === 'production' &&
    !process.env['ADMIN_JWT_SECRET']
  ) {
    console.error(
      '[Admin tRPC Context] ADMIN_JWT_SECRET not configured in production!'
    );
    return null;
  }

  try {
    const payload = jwt.verify(token, secret) as AdminJwtPayload;
    return payload;
  } catch (_error) {
    // Token invalid or expired
    return null;
  }
}

/**
 * Options for creating admin context
 */
interface CreateAdminContextOptions {
  headers: Headers;
}

/**
 * Creates the admin context for each tRPC request
 *
 * 1. Creates database connection
 * 2. Extracts and verifies admin JWT from Authorization header
 * 3. Looks up admin user in database
 * 4. Returns context with admin and db
 */
export async function createAdminContext(
  opts: CreateAdminContextOptions
): Promise<AdminContext> {
  const { headers } = opts;

  // Create database connection
  const db = createDrizzleDb(getAdminDbConfig());

  // Extract authorization header
  const authHeader = headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  // No token = unauthenticated context
  if (!token) {
    return {
      admin: null,
      headers,
      db,
    };
  }

  // Verify admin JWT
  const payload = verifyAdminToken(token);

  if (!payload) {
    return {
      admin: null,
      headers,
      db,
    };
  }

  try {
    // Look up admin user in database
    const dbAdmin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, payload.sub),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!dbAdmin) {
      return {
        admin: null,
        headers,
        db,
      };
    }

    return {
      admin: {
        id: dbAdmin.id,
        email: dbAdmin.email,
        name: dbAdmin.name,
        role: dbAdmin.role as AdminContextUser['role'],
      },
      headers,
      db,
    };
  } catch (error) {
    console.error('[Admin tRPC Context] Error looking up admin:', error);
    return {
      admin: null,
      headers,
      db,
    };
  }
}

// Re-export router helpers and types from base.ts to maintain backward compatibility
export {
  router,
  middleware,
  createCallerFactory,
  publicProcedure,
  protectedProcedure,
  loggedProcedure,
} from './base';

export type {
  AdminContextUser,
  AdminContext,
  ProtectedAdminContext,
} from './base';

// Import and export the combined router
import { adminAppRouter } from './router';
export { adminAppRouter };

/**
 * Type definition for the admin API
 * This is used by the client to get full type safety
 */
export type AdminAppRouter = typeof adminAppRouter;
