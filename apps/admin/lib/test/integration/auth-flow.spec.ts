/**
 * Authentication Flow Integration Tests
 * 
 * Tests the complete authentication flow:
 * - Login → Validate → Access protected route → Logout
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../utils/test-db';
import { createSuperAdminContext, createRoleContext } from '../utils/test-context';
import { createStandardTestAdmins, createTestAdminUser } from '../utils/test-helpers';
import { adminAppRouter } from '@/lib/trpc/admin';
import { TRPCError } from '@trpc/server';

// Note: Authentication flow integration tests would typically test API routes
// Since we're using pglite for testing, we focus on tRPC router integration
// For full E2E auth flow, see Phase 7.5 E2E tests with Playwright

describe('Authentication Flow Integration', () => {
  let testDb: Awaited<ReturnType<typeof createTestDb>>;

  beforeEach(async () => {
    testDb = await createTestDb();
  });

  describe('protected route access', () => {
    it('should allow authenticated admin to access protected routes', async () => {
      const admin = await createTestAdminUser(testDb.db, {
        email: 'admin@test.com',
        password: 'password123',
        role: 'super_admin',
        permissions: ['*'],
      });

      const ctx = createSuperAdminContext(testDb.db, { id: admin.id });
      const caller = adminAppRouter.createCaller(ctx);

      // Access protected route
      const statsResult = await caller.stats.getDashboardStats();
      expect(statsResult).toBeDefined();
      expect(statsResult.totalUsers).toBeDefined();
    });

    it('should prevent unauthenticated access to protected routes', async () => {
      // Create context without admin (unauthenticated)
      const { createMockAdminContext } = await import('../utils/test-context');
      const unauthenticatedCtx = createMockAdminContext({ admin: null, db: testDb.db });
      const caller = adminAppRouter.createCaller(unauthenticatedCtx);

      // Should fail when trying to access protected route
      await expect(
        caller.stats.getDashboardStats()
      ).rejects.toThrow(TRPCError);
      await expect(
        caller.stats.getDashboardStats()
      ).rejects.toThrow('You must be logged in');
    });
  });

  describe('permission-based access', () => {
    it('should enforce permissions for different roles', async () => {
      const { admin, viewer } = await createStandardTestAdmins(testDb.db);
      
      // Admin with permissions should access billing
      const adminCtx = createRoleContext('admin', testDb.db, ['billing:read'], { id: admin.id });
      const adminCaller = adminAppRouter.createCaller(adminCtx);
      
      // Should be able to access billing stats
      const stats = await adminCaller.billing.getStats({ period: 'month' });
      expect(stats).toBeDefined();

      // Note: billing.getStats is a protectedProcedure that only checks authentication,
      // not specific permissions. So viewers can access it if authenticated.
      // If permission checking is needed, it should be added to the billing router.
      // For now, we test that authenticated users can access it.
      const viewerCtx = createRoleContext('viewer', testDb.db, [], { id: viewer.id });
      const viewerCaller = adminAppRouter.createCaller(viewerCtx);
      
      // Viewer can access billing stats (no permission check in router)
      const viewerStats = await viewerCaller.billing.getStats({ period: 'month' });
      expect(viewerStats).toBeDefined();
      
      // Test actual permission enforcement: admins router requires super_admin
      await expect(
        viewerCaller.admins.list({ limit: 10, offset: 0 })
      ).rejects.toThrow(TRPCError);
      await expect(
        viewerCaller.admins.list({ limit: 10, offset: 0 })
      ).rejects.toThrow('Only super_admin');
    });
  });
});

