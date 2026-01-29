/**
 * Test Context Utilities
 * 
 * Creates mock admin context for testing tRPC procedures.
 */

import { v4 as uuidv4 } from 'uuid';
import type { AdminContext, AdminContextUser, ProtectedAdminContext } from '@/lib/trpc/base';
import type { PgLiteDatabase } from './test-db';

export interface MockAdminContextOptions {
  admin?: Partial<AdminContextUser> | null;
  headers?: Headers;
  db: PgLiteDatabase;
}

/**
 * Create a mock admin context for testing
 */
export function createMockAdminContext(
  options: MockAdminContextOptions
): AdminContext {
  const { admin, headers, db } = options;

  const mockAdmin: AdminContextUser | null = admin
    ? {
        id: admin.id || uuidv4(),
        email: admin.email || 'test@example.com',
        name: admin.name || 'Test Admin',
        role: admin.role || 'admin',
        permissions: admin.permissions || [],
      }
    : null;

  return {
    admin: mockAdmin,
    headers: headers || new Headers(),
    db: db as any, // Type assertion for test database compatibility
  };
}

/**
 * Create a mock protected admin context (guaranteed admin)
 */
export function createMockProtectedContext(
  options: Omit<MockAdminContextOptions, 'admin'> & { admin: AdminContextUser }
): ProtectedAdminContext {
  const { admin, headers, db } = options;

  return {
    admin,
    headers: headers || new Headers(),
    db: db as any, // Type assertion for test database compatibility
  };
}

/**
 * Create a super_admin context for testing
 */
export function createSuperAdminContext(
  db: PgLiteDatabase,
  overrides?: Partial<AdminContextUser>
): ProtectedAdminContext {
  return createMockProtectedContext({
    admin: {
      id: overrides?.id || uuidv4(),
      email: overrides?.email || 'super@example.com',
      name: overrides?.name || 'Super Admin',
      role: 'super_admin',
      permissions: overrides?.permissions || ['*'],
    },
    db,
  });
}

/**
 * Create an admin context with specific role
 */
export function createRoleContext(
  role: AdminContextUser['role'],
  db: PgLiteDatabase,
  permissions: string[] = [],
  overrides?: Partial<AdminContextUser>
): ProtectedAdminContext {
  return createMockProtectedContext({
    admin: {
      id: overrides?.id || uuidv4(), // Use provided ID or generate UUID
      email: overrides?.email || `${role}@example.com`,
      name: overrides?.name || `${role} User`,
      role,
      permissions: overrides?.permissions || permissions,
    },
    db,
  });
}
