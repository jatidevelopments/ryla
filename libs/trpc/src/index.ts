/**
 * @ryla/trpc - Type-safe API layer
 *
 * End-to-end type safety for API calls using tRPC.
 * Uses JWT auth and direct Postgres (NO SUPABASE).
 */

// Core tRPC setup
export {
  router,
  middleware,
  createCallerFactory,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  loggedProcedure,
  type ProtectedContext,
} from './trpc';

// Router
export { appRouter, type AppRouter } from './router';

// Context
export {
  createContext,
  createNextContext,
  type Context,
  type ContextUser,
  type JwtPayload,
} from './context';

// Client helpers
export { trpc, getTrpcUrl, createApiClient, createTrpcLinks } from './client';

// Individual routers (for extending/testing)
export * from './routers';
