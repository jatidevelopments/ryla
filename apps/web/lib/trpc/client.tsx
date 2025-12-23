'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

// Import only client-side code to avoid bundling server code
import { trpc } from '@ryla/trpc/client';

// Re-export auth utilities for convenience
import { getAccessToken, setTokens, clearTokens } from '../auth';

/**
 * Get auth token from storage
 * @deprecated Use getAccessToken from '../auth' instead
 */
export function getAuthToken(): string | null {
  return getAccessToken();
}

/**
 * Set auth token in storage
 * @deprecated Use setTokens from '../auth' instead
 */
export function setAuthToken(token: string): void {
  setTokens({ accessToken: token, refreshToken: '' });
}

/**
 * Clear auth token from storage
 * @deprecated Use clearTokens from '../auth' instead
 */
export function clearAuthToken(): void {
  clearTokens();
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

  return 'http://localhost:4200/api/trpc';
}

/**
 * tRPC + React Query Provider
 *
 * Wrap your app with this provider to enable tRPC hooks.
 * Uses JWT auth (NO SUPABASE).
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getTrpcUrl(),
          transformer: superjson,
          headers() {
            const token = getAuthToken();
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
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

// Re-export trpc hooks for convenience
export { trpc };
