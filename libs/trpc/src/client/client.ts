/**
 * tRPC Client Setup Helpers
 *
 * Provides utilities for setting up tRPC client in React applications.
 */

import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import type { AppRouter } from '../router';

/**
 * React hooks client for tRPC
 * Use this in React components with React Query
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get the tRPC API URL based on environment
 */
export function getTrpcUrl(base?: string): string {
  // Browser: relative path
  if (typeof window !== 'undefined') {
    return `${base || ''}/api/trpc`;
  }

  // Server: need full URL
  if (process.env['VERCEL_URL']) {
    return `https://${process.env['VERCEL_URL']}/api/trpc`;
  }

  // Local development
  return `http://localhost:3000/api/trpc`;
}

/**
 * Create a standalone tRPC client (non-React)
 * Useful for server-side calls or scripts
 */
export function createApiClient(opts?: { baseUrl?: string }) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: getTrpcUrl(opts?.baseUrl),
        transformer: superjson,
      }),
    ],
  });
}

/**
 * Create tRPC links for the React client
 */
export function createTrpcLinks(opts?: { getAuthToken?: () => string | null }) {
  return [
    httpBatchLink({
      url: getTrpcUrl(),
      transformer: superjson,
      headers() {
        const headers: Record<string, string> = {};

        // Add auth token if available
        if (opts?.getAuthToken) {
          const token = opts.getAuthToken();
          if (token) {
            headers['authorization'] = `Bearer ${token}`;
          }
        }

        return headers;
      },
    }),
  ];
}
