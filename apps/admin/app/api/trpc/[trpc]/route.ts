/**
 * tRPC API Route Handler for Admin App
 *
 * This handles all tRPC requests for the admin app.
 * All requests to /api/trpc/* are handled here.
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { adminAppRouter, createAdminContext } from '@/lib/trpc/admin';

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
    router: adminAppRouter,
    createContext: async () => {
      return createAdminContext({
        headers: req.headers,
      });
    },
    onError({ error, path }) {
      console.error(`[Admin tRPC Error] ${path}:`, error.message);
    },
  });
};

// Export handlers for all HTTP methods
export { handler as GET, handler as POST };
