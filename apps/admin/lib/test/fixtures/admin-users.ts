/**
 * Admin User Test Fixtures
 * 
 * Predefined admin user data for testing.
 */

import type { AdminContextUser } from '@/lib/auth-context';

export const SUPER_ADMIN_FIXTURE: AdminContextUser = {
  id: 'super-admin-fixture-id',
  email: 'super@ryla.ai',
  name: 'Super Admin',
  role: 'super_admin',
  permissions: ['*'],
};

export const ADMIN_FIXTURE: AdminContextUser = {
  id: 'admin-fixture-id',
  email: 'admin@ryla.ai',
  name: 'Admin User',
  role: 'admin',
  permissions: ['users:read', 'users:write', 'content:read'],
};

export const SUPPORT_FIXTURE: AdminContextUser = {
  id: 'support-fixture-id',
  email: 'support@ryla.ai',
  name: 'Support User',
  role: 'support',
  permissions: ['users:read', 'bugs:read', 'bugs:write'],
};

export const MODERATOR_FIXTURE: AdminContextUser = {
  id: 'moderator-fixture-id',
  email: 'moderator@ryla.ai',
  name: 'Moderator User',
  role: 'moderator',
  permissions: ['content:read', 'content:write'],
};

export const VIEWER_FIXTURE: AdminContextUser = {
  id: 'viewer-fixture-id',
  email: 'viewer@ryla.ai',
  name: 'Viewer User',
  role: 'viewer',
  permissions: [],
};
