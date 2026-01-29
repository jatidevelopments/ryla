'use client';

import React, { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import superjson from 'superjson';

// Import only client-side code to avoid bundling server code
import { trpc } from '@ryla/trpc/client';

// Re-export auth utilities for convenience
import { getAccessToken, setTokens, clearTokens, refreshTokens } from '../auth';

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
 * Custom link that handles token refresh on 401 errors
 * Intercepts 401 responses, refreshes the token, and retries the request
 * Prevents concurrent refresh attempts with a simple flag
 */
let isRefreshing = false;
let refreshPromise: Promise<{ tokens: { accessToken: string } } | null> | null = null;

const tokenRefreshLink: TRPCLink<any> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err: any) {
          // Check if it's a 401 error (check multiple possible error structures)
          const httpStatus =
            err?.data?.httpStatus ||
            err?.meta?.response?.status ||
            err?.status ||
            err?.cause?.status;
          if (httpStatus === 401) {
            // If already refreshing, wait for that to complete
            if (isRefreshing && refreshPromise) {
              refreshPromise
                .then((refreshed) => {
                  if (refreshed) {
                    // Retry with new token
                    const retryUnsubscribe = next(op).subscribe(observer);
                    return () => retryUnsubscribe.unsubscribe();
                  } else {
                    observer.error(err);
                  }
                })
                .catch(() => observer.error(err));
              return;
            }
            
            // Start refresh process
            isRefreshing = true;
            refreshPromise = refreshTokens();
            
            refreshPromise
              .then((refreshed) => {
                isRefreshing = false;
                refreshPromise = null;
                
                if (refreshed) {
                  // Token refreshed successfully, retry the request
                  // The headers function will get the new token automatically
                  const retryUnsubscribe = next(op).subscribe(observer);
                  return () => retryUnsubscribe.unsubscribe();
                } else {
                  // Refresh failed, clear tokens and pass through the error
                  clearTokens();
                  observer.error(err);
                }
              })
              .catch(() => {
                isRefreshing = false;
                refreshPromise = null;
                clearTokens();
                observer.error(err);
              });
          } else {
            // Not a 401 error, pass through
            observer.error(err);
          }
        },
        complete() {
          observer.complete();
        },
      });
      return () => unsubscribe.unsubscribe();
    });
  };
};

/**
 * tRPC + React Query Provider
 *
 * Wrap your app with this provider to enable tRPC hooks.
 * Uses JWT auth (NO SUPABASE).
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  // Create tRPC client with reactive headers that always get the latest token
  // Using useMemo to recreate client when needed, but headers function is called on every request
  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [
          // Token refresh link - handles 401 errors and refreshes tokens
          tokenRefreshLink,
          // HTTP batch link - makes the actual requests
          httpBatchLink({
            url: getTrpcUrl(),
            transformer: superjson,
            headers() {
              // Always get the latest token from storage (called on every request)
              const token = getAuthToken();
              if (token) {
                return {
                  authorization: `Bearer ${token}`,
                };
              }
              return {};
            },
          }),
        ],
      }),
    [] // Empty deps - headers function is called on every request, so it always gets latest token
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

// Re-export trpc hooks for convenience
export { trpc };
