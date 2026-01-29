/**
 * User Management Flow Integration Tests
 * 
 * Tests the complete user management flow:
 * - List users → View user detail → Update user → Audit log created
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../utils/test-db';
import { createSuperAdminContext } from '../utils/test-context';
import { createStandardTestAdmins, createTestUser } from '../utils/test-helpers';
import { adminAppRouter } from '@/lib/trpc/admin';
import { adminAuditLog } from '@ryla/data';
import { eq } from 'drizzle-orm';

describe('User Management Flow Integration', () => {
  let testDb: Awaited<ReturnType<typeof createTestDb>>;

  beforeEach(async () => {
    testDb = await createTestDb();
  });

  describe('complete user management flow', () => {
    it('should complete full user management cycle: list → view → update → audit log', async () => {
      // Setup: Create admin and regular users
      const { superAdmin } = await createStandardTestAdmins(testDb.db);
      const testUser1 = await createTestUser(testDb.db, {
        email: 'user1@test.com',
        name: 'User One',
      });
      const testUser2 = await createTestUser(testDb.db, {
        email: 'user2@test.com',
        name: 'User Two',
      });

      const ctx = createSuperAdminContext(testDb.db, { id: superAdmin.id });
      const caller = adminAppRouter.createCaller(ctx);

      // Step 1: List users
      const listResult = await caller.users.list({
        limit: 50,
        offset: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(listResult.users.length).toBeGreaterThanOrEqual(2);
      expect(listResult.users.some(u => u.id === testUser1.id)).toBe(true);
      expect(listResult.users.some(u => u.id === testUser2.id)).toBe(true);

      // Step 2: View user detail
      const userDetail = await caller.users.get({
        userId: testUser1.id,
      });

      expect(userDetail.id).toBe(testUser1.id);
      expect(userDetail.email).toBe(testUser1.email);
      expect(userDetail.name).toBe(testUser1.name);

      // Step 3: Update user (ban user)
      await caller.users.ban({
        userId: testUser1.id,
        reason: 'Test ban for integration test',
      });

      // Step 4: Verify user is banned
      const updatedUser = await caller.users.get({
        userId: testUser1.id,
      });
      expect(updatedUser.banned).toBe(true);

      // Step 5: Verify audit log was created
      const auditLogs = await testDb.db
        .select()
        .from(adminAuditLog)
        .where(eq(adminAuditLog.adminId, superAdmin.id))
        .orderBy(adminAuditLog.createdAt);

      const banAuditLog = auditLogs.find(
        log => log.entityType === 'user' && log.entityId === testUser1.id
      );

      expect(banAuditLog).toBeDefined();
      expect(banAuditLog?.action).toBe('user_banned'); // Actual action name in audit log
      expect(banAuditLog?.adminId).toBe(superAdmin.id);

      // Step 6: Unban user
      await caller.users.unban({
        userId: testUser1.id,
      });

      // Step 7: Verify user is unbanned
      const unbannedUser = await caller.users.get({
        userId: testUser1.id,
      });
      expect(unbannedUser.banned).toBe(false);

      // Step 8: Verify unban audit log was created
      const updatedAuditLogs = await testDb.db
        .select()
        .from(adminAuditLog)
        .where(eq(adminAuditLog.adminId, superAdmin.id))
        .orderBy(adminAuditLog.createdAt);

      const unbanAuditLog = updatedAuditLogs.find(
        log => log.entityType === 'user' && log.entityId === testUser1.id && log.action === 'user_unbanned'
      );

      expect(unbanAuditLog).toBeDefined();
    }, 15000); // Increase timeout for complex integration test

    it('should track user credit operations in audit log', async () => {
      const { superAdmin } = await createStandardTestAdmins(testDb.db);
      const testUser = await createTestUser(testDb.db, {
        email: 'user@test.com',
        name: 'Test User',
      });

      const ctx = createSuperAdminContext(testDb.db, { id: superAdmin.id });
      const caller = adminAppRouter.createCaller(ctx);

      // Add credits
      const addResult = await caller.billing.addCredits({
        userId: testUser.id,
        amount: 100,
        reason: 'Test credit addition',
        category: 'other',
      });

      expect(addResult.newBalance).toBeGreaterThan(0);

      // Verify audit log
      const auditLogs = await testDb.db
        .select()
        .from(adminAuditLog)
        .where(eq(adminAuditLog.adminId, superAdmin.id))
        .orderBy(adminAuditLog.createdAt);

      const creditAuditLog = auditLogs.find(
        log => log.entityType === 'user_credits' && log.entityId === testUser.id && log.action === 'credits_added'
      );

      expect(creditAuditLog).toBeDefined();
    }, 15000); // Increase timeout for database operations
  });

  describe('user list filtering and pagination', () => {
    it('should filter users by status', async () => {
      const { superAdmin } = await createStandardTestAdmins(testDb.db);
      const activeUser = await createTestUser(testDb.db, {
        email: 'active@test.com',
        name: 'Active User',
      });
      const bannedUser = await createTestUser(testDb.db, {
        email: 'banned@test.com',
        name: 'Banned User',
      });

      const ctx = createSuperAdminContext(testDb.db, { id: superAdmin.id });
      const caller = adminAppRouter.createCaller(ctx);

      // Ban one user
      await caller.users.ban({
        userId: bannedUser.id,
        reason: 'Test ban',
      });

      // Filter by active
      const activeResult = await caller.users.list({
        limit: 50,
        offset: 0,
        status: 'active',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(activeResult.users.some(u => u.id === activeUser.id)).toBe(true);
      expect(activeResult.users.some(u => u.id === bannedUser.id)).toBe(false);

      // Filter by banned
      const bannedResult = await caller.users.list({
        limit: 50,
        offset: 0,
        status: 'banned',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(bannedResult.users.some(u => u.id === bannedUser.id)).toBe(true);
    }, 15000); // Increase timeout for database operations
  });
});
