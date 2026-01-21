'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { createTRPCReact } from '@trpc/react-query';

import type { AdminAppRouter } from './admin';

// Re-export type for convenience
export type { AdminAppRouter };

/**
 * React hooks client for admin tRPC
 */
export const adminTrpc = createTRPCReact<AdminAppRouter>();

/**
 * Get admin auth token from localStorage
 */
function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

/**
 * Create a stable query client instance
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus in development
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        // Stale time of 1 minute
        staleTime: 60 * 1000,
        // Retry failed requests 3 times (except 401/403)
        retry: (failureCount, error) => {
          if (failureCount >= 3) return false;
          // Don't retry auth errors
          const status = (error as { data?: { httpStatus?: number } })?.data
            ?.httpStatus;
          if (status === 401 || status === 403) return false;
          return true;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create new query client
    return makeQueryClient();
  }

  // Browser: use singleton pattern
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

/**
 * Get the tRPC API URL
 */
function getTrpcUrl() {
  if (typeof window !== 'undefined') {
    // Browser: relative URL
    return '/api/trpc';
  }

  // Server
  if (process.env['VERCEL_URL']) {
    return `https://${process.env['VERCEL_URL']}/api/trpc`;
  }

  return 'http://localhost:3004/api/trpc';
}

/**
 * Admin tRPC + React Query Provider
 *
 * Wrap your app with this provider to enable admin tRPC hooks.
 * Uses admin JWT auth.
 */
export function AdminTRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    adminTrpc.createClient({
      links: [
        httpBatchLink({
          url: getTrpcUrl(),
          transformer: superjson,
          headers() {
            const token = getAdminToken();
            if (token) {
              return { authorization: `Bearer ${token}` };
            }
            return {};
          },
        }),
      ],
    })
  );

  return (
    <adminTrpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </adminTrpc.Provider>
  );
}
