/**
 * Test Context Utilities for Web App
 * 
 * Creates mock context for testing tRPC procedures and API routes.
 */

import { v4 as uuidv4 } from 'uuid';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  publicName?: string;
  banned?: boolean;
}

export interface MockContext {
  user?: MockUser | null;
  headers?: Headers;
}

export interface MockContextOptions {
  userId?: string;
  email?: string;
  name?: string;
  publicName?: string;
  banned?: boolean;
  headers?: Headers;
}

/**
 * Create a mock user context for testing
 */
export function createMockContext(options?: MockContextOptions): MockContext {
  const userId = options?.userId || uuidv4();
  
  const user: MockUser | null = options !== undefined
    ? {
        id: userId,
        email: options.email || `test-${userId}@example.com`,
        name: options.name || 'Test User',
        publicName: options.publicName || `testuser-${userId.slice(0, 8)}`,
        banned: options.banned ?? false,
      }
    : null;

  return {
    user,
    headers: options?.headers || new Headers(),
  };
}

/**
 * Create a mock user context (guaranteed user)
 */
export function createUserContext(
  userId?: string,
  overrides?: Partial<MockUser>
): MockContext {
  const id = userId || uuidv4();
  
  return {
    user: {
      id,
      email: overrides?.email || `user-${id}@example.com`,
      name: overrides?.name || 'Test User',
      publicName: overrides?.publicName || `testuser-${id.slice(0, 8)}`,
      banned: overrides?.banned ?? false,
    },
    headers: new Headers(),
  };
}

/**
 * Create an unauthenticated context
 */
export function createUnauthenticatedContext(): MockContext {
  return {
    user: null,
    headers: new Headers(),
  };
}
