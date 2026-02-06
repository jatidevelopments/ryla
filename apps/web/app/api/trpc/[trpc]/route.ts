/**
 * tRPC API Route Handler
 *
 * This handles all tRPC requests for the web app.
 * All requests to /api/trpc/* are handled here.
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter, createContext } from '@ryla/trpc';

// Disable caching for tRPC routes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Handle tRPC requests
 */
const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      return createContext({
        headers: req.headers,
      });
    },
    onError({ error, path, type }) {
      // Don't log UNAUTHORIZED errors as they're expected when users aren't authenticated
      // Only log actual errors (INTERNAL_SERVER_ERROR, BAD_REQUEST, etc.)
      if (error.code === 'UNAUTHORIZED') {
        // Silently handle auth errors - they're expected behavior
        return;
      }
      
      // Log actual errors
      console.error(`[tRPC Error] ${type} ${path}:`, error.message);
    },
  });
};

// Export handlers for all HTTP methods
export { handler as GET, handler as POST };
