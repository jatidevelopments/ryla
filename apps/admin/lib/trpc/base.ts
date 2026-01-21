/**
 * Admin tRPC Base Setup
 *
 * This file exports the router and procedure helpers without importing any routers.
 * This breaks the circular dependency between admin.ts and the router files.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { DrizzleDb } from '@ryla/data';

/**
 * Admin user type for context
 */
export interface AdminContextUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'support' | 'moderator' | 'viewer';
  permissions?: string[];
}

/**
 * Admin context available to all admin tRPC procedures
 */
export interface AdminContext {
  /**
   * The authenticated admin user, or null if not authenticated
   */
  admin: AdminContextUser | null;

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
 * Context type with guaranteed admin (for protected procedures)
 */
export interface ProtectedAdminContext {
  admin: AdminContextUser;
  headers: Headers;
  db: DrizzleDb;
}

/**
 * Initialize tRPC with admin context and transformer
 */
const t = initTRPC.context<AdminContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error ? error.cause.message : undefined,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;

/**
 * Public procedure - no authentication required
 * Still has access to db via context
 */
export const publicProcedure = t.procedure;

/**
 * Logging middleware - logs request timing
 */
const loggingMiddleware = middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;

  if (result.ok) {
    // Log successful requests (using console.warn for visibility in development)
    console.warn(`[Admin tRPC] ${type} ${path} - ${duration}ms`);
  } else {
    console.error(`[Admin tRPC] ${type} ${path} - ${duration}ms - ERROR`);
  }

  return result;
});

/**
 * Authentication middleware - ensures admin is authenticated
 */
const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.admin) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }

  // Return context with guaranteed admin
  return next({
    ctx: {
      ...ctx,
      admin: ctx.admin,
    } as ProtectedAdminContext,
  });
});

/**
 * Protected procedure - requires admin authentication
 * Context includes: admin (guaranteed), db
 */
export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(authMiddleware);

/**
 * Logged procedure - public but with logging
 * Context includes: admin (nullable), db
 */
export const loggedProcedure = t.procedure.use(loggingMiddleware);
