/**
 * Admin User Test Fixtures
 * 
 * Predefined admin user data for testing.
 */

import type { AdminUser } from '@/lib/auth-context';

export const SUPER_ADMIN_FIXTURE: AdminUser = {
  id: 'super-admin-fixture-id',
  email: 'super@ryla.ai',
  name: 'Super Admin',
  role: 'super_admin',
  permissions: ['*'],
};

export const ADMIN_FIXTURE: AdminUser = {
  id: 'admin-fixture-id',
  email: 'admin@ryla.ai',
  name: 'Admin User',
  role: 'admin',
  permissions: ['users:read', 'users:write', 'content:read'],
};

export const SUPPORT_FIXTURE: AdminUser = {
  id: 'support-fixture-id',
  email: 'support@ryla.ai',
  name: 'Support User',
  role: 'support',
  permissions: ['users:read', 'bugs:read', 'bugs:write'],
};

export const MODERATOR_FIXTURE: AdminUser = {
  id: 'moderator-fixture-id',
  email: 'moderator@ryla.ai',
  name: 'Moderator User',
  role: 'moderator',
  permissions: ['content:read', 'content:write'],
};

export const VIEWER_FIXTURE: AdminUser = {
  id: 'viewer-fixture-id',
  email: 'viewer@ryla.ai',
  name: 'Viewer User',
  role: 'viewer',
  permissions: [],
};
