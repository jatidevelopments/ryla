/**
 * Server-side tRPC utilities
 *
 * For calling tRPC procedures directly on the server
 * (e.g., in Server Components or API routes)
 */

import 'server-only';

import { cache } from 'react';
import { headers } from 'next/headers';

import { appRouter, createContext, createCallerFactory } from '@ryla/trpc';

/**
 * Create a cached context for the current request
 */
export const getServerContext = cache(async () => {
  const headersList = await headers();
  return createContext({ headers: headersList });
});

/**
 * Create a server-side tRPC caller
 *
 * Use this to call tRPC procedures directly in Server Components:
 *
 * ```tsx
 * async function MyServerComponent() {
 *   const caller = await getServerCaller();
 *   const user = await caller.user.me();
 *   return <div>{user.name}</div>;
 * }
 * ```
 */
export async function getServerCaller() {
  const ctx = await getServerContext();
  const createCaller = createCallerFactory(appRouter);
  return createCaller(ctx);
}
