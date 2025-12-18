/**
 * tRPC initialization and procedure definitions
 *
 * This is where we define the base tRPC instance and reusable procedures.
 * Uses JWT auth and direct Postgres (NO SUPABASE).
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import type { Context, ContextUser } from './context/context';
import type { DrizzleDb } from '@ryla/data';

/**
 * Initialize tRPC with context and transformer
 */
const t = initTRPC.context<Context>().create({
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
    console.log(`[tRPC] ${type} ${path} - ${duration}ms`);
  } else {
    console.error(`[tRPC] ${type} ${path} - ${duration}ms - ERROR`);
  }

  return result;
});

/**
 * Context type with guaranteed user (for protected procedures)
 */
export interface ProtectedContext {
  user: ContextUser;
  headers: Headers;
  db: DrizzleDb;
}

/**
 * Authentication middleware - ensures user is authenticated
 */
const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }

  // Return context with guaranteed user
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    } as ProtectedContext,
  });
});

/**
 * Admin middleware - ensures user has admin role
 */
const adminMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }

  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to perform this action',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    } as ProtectedContext,
  });
});

/**
 * Protected procedure - requires authentication
 * Context includes: user (guaranteed), db
 */
export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(authMiddleware);

/**
 * Admin procedure - requires admin role
 * Context includes: user (guaranteed, admin), db
 */
export const adminProcedure = t.procedure
  .use(loggingMiddleware)
  .use(adminMiddleware);

/**
 * Logged procedure - public but with logging
 * Context includes: user (nullable), db
 */
export const loggedProcedure = t.procedure.use(loggingMiddleware);
