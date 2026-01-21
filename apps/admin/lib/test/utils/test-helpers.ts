/**
 * Test Helper Utilities
 * 
 * Common utilities for writing admin panel tests.
 */

import { eq } from 'drizzle-orm';
import type * as schema from '@ryla/data/schema';
import { adminUsers, users } from '@ryla/data';
import bcrypt from 'bcryptjs';
import type { PgLiteDatabase } from './test-db';
import { eq } from 'drizzle-orm';

/**
 * Create a test admin user in the database
 */
export async function createTestAdminUser(
  db: PgLiteDatabase,
  overrides?: {
    email?: string;
    password?: string;
    name?: string;
    role?: 'super_admin' | 'admin' | 'support' | 'moderator' | 'viewer';
    permissions?: string[];
    isActive?: boolean;
  }
) {
  const email = overrides?.email || `test-${Date.now()}@example.com`;
  const password = overrides?.password || 'test-password-123';
  const passwordHash = await bcrypt.hash(password, 12);

  const [admin] = await db
    .insert(adminUsers)
    .values({
      email,
      passwordHash,
      name: overrides?.name || 'Test Admin',
      role: overrides?.role || 'admin',
      permissions: (overrides?.permissions || []) as unknown as string[],
      isActive: overrides?.isActive ?? true,
    })
    .returning();

  return { ...admin, password }; // Return password for testing
}

/**
 * Clean up test admin user
 */
export async function cleanupTestAdminUser(
  db: PgLiteDatabase,
  adminId: string
) {
  await db.delete(adminUsers).where(eq(adminUsers.id, adminId));
}

/**
 * Create multiple test admin users
 */
export async function createTestAdminUsers(
  db: PgLiteDatabase,
  count: number,
  role: 'super_admin' | 'admin' | 'support' | 'moderator' | 'viewer' = 'admin'
) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestAdminUser(db, {
      email: `test-${i}-${Date.now()}@example.com`,
      role,
    });
    users.push(user);
  }
  return users;
}

/**
 * Create standard test admin users for test contexts
 * Returns admin users that can be used to create contexts with proper IDs
 */
export async function createStandardTestAdmins(db: PgLiteDatabase) {
  const superAdmin = await createTestAdminUser(db, {
    email: 'super@example.com',
    role: 'super_admin',
    permissions: ['*'],
  });
  const admin = await createTestAdminUser(db, {
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['users:read', 'billing:read', 'billing:write', 'content:read', 'content:write'],
  });
  const viewer = await createTestAdminUser(db, {
    email: 'viewer@example.com',
    role: 'viewer',
    permissions: [],
  });

  return { superAdmin, admin, viewer };
}

/**
 * Create a test regular user in the database
 */
export async function createTestUser(
  db: PgLiteDatabase,
  overrides?: {
    email?: string;
    password?: string;
    name?: string;
    publicName?: string;
    banned?: boolean;
  }
) {
  const email = overrides?.email || `user-${Date.now()}@example.com`;
  const password = overrides?.password || 'user-password-123';
  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      email,
      password: passwordHash, // users table uses 'password' not 'passwordHash'
      name: overrides?.name || 'Test User',
      publicName: overrides?.publicName || `testuser-${Date.now()}`,
      banned: overrides?.banned ?? false,
    })
    .returning();

  return { ...user, password }; // Return password for testing
}

/**
 * Clean up test user
 */
export async function cleanupTestUser(
  db: PgLiteDatabase,
  userId: string
) {
  await db.delete(users).where(eq(users.id, userId));
}

/**
 * Create multiple test users
 */
export async function createTestUsers(
  db: PgLiteDatabase,
  count: number,
  overrides?: {
    banned?: boolean;
  }
) {
  const userList = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser(db, {
      email: `user-${i}-${Date.now()}@example.com`,
      banned: overrides?.banned ?? false,
    });
    userList.push(user);
  }
  return userList;
}

/**
 * Wait for async operations to complete
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock Headers object
 */
export function createMockHeaders(overrides?: Record<string, string>): Headers {
  const headers = new Headers();
  if (overrides) {
    Object.entries(overrides).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }
  return headers;
}

/**
 * Create a test character in the database
 */
export async function createTestCharacter(
  db: PgLiteDatabase,
  userId: string,
  overrides?: {
    name?: string;
    handle?: string;
    status?: 'draft' | 'generating' | 'ready' | 'failed' | 'training' | 'hd_ready';
  }
) {
  const { characters } = await import('@ryla/data');
  const [character] = await db.insert(characters).values({
    userId,
    name: overrides?.name || 'Test Character',
    handle: overrides?.handle || 'test-character',
    config: {},
    status: overrides?.status || 'ready',
  }).returning();
  return character;
}

/**
 * Clean up a test character
 */
export async function cleanupTestCharacter(
  db: PgLiteDatabase,
  characterId: string
) {
  const { characters } = await import('@ryla/data');
  await db.delete(characters).where(eq(characters.id, characterId));
}
