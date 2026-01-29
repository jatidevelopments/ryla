/**
 * User Test Fixtures for Web App
 * 
 * Test data factories for creating users in tests.
 */

import { v4 as uuidv4 } from 'uuid';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  publicName: string;
  password?: string; // For testing auth flows
  banned?: boolean;
  credits?: number;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | null;
}

/**
 * Create a test user with optional overrides
 */
export function createTestUser(overrides?: Partial<TestUser>): TestUser {
  const id = overrides?.id || uuidv4();
  
  return {
    id,
    email: overrides?.email || `test-${id.slice(0, 8)}@example.com`,
    name: overrides?.name || 'Test User',
    publicName: overrides?.publicName || `testuser-${id.slice(0, 8)}`,
    password: overrides?.password || 'test-password-123',
    banned: overrides?.banned ?? false,
    credits: overrides?.credits ?? 100,
    subscriptionStatus: overrides?.subscriptionStatus ?? null,
  };
}

/**
 * Create a test admin user
 */
export function createTestAdmin(overrides?: Partial<TestUser>): TestUser {
  return createTestUser({
    email: 'admin@example.com',
    name: 'Admin User',
    ...overrides,
  });
}

/**
 * Create a test pro user (with active subscription)
 */
export function createTestProUser(overrides?: Partial<TestUser>): TestUser {
  return createTestUser({
    subscriptionStatus: 'active',
    credits: 1000,
    ...overrides,
  });
}

/**
 * Create a test banned user
 */
export function createTestBannedUser(overrides?: Partial<TestUser>): TestUser {
  return createTestUser({
    banned: true,
    ...overrides,
  });
}

/**
 * Create multiple test users
 */
export function createTestUsers(count: number, overrides?: Partial<TestUser>): TestUser[] {
  return Array.from({ length: count }, (_, i) =>
    createTestUser({
      email: `user-${i}-${Date.now()}@example.com`,
      ...overrides,
    })
  );
}
