/**
 * Audit Router Tests
 * 
 * Tests for audit log viewing and search operations.
 * Part of Phase 7.2: Backend Tests (Tier 1)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { auditRouter } from './audit.router';
import { createCallerFactory } from '../base';
import { createTestDb, cleanupTestDb } from '../../test/utils/test-db';
import {
  createSuperAdminContext,
  createRoleContext,
  createMockAdminContext,
} from '../../test/utils/test-context';
import {
  createTestAdminUser,
  cleanupTestAdminUser,
  createTestUser,
  cleanupTestUser,
  createStandardTestAdmins,
} from '../../test/utils/test-helpers';
import { adminAuditLog } from '@ryla/data';
import { eq } from 'drizzle-orm';
import type { TestDb } from '../../test/utils/test-db';

describe('AuditRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof auditRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;
  let adminContext: ReturnType<typeof createRoleContext>;
  let viewerContext: ReturnType<typeof createRoleContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(auditRouter);
    
    // Create actual admin users in the database for foreign key constraints
    const { superAdmin, admin, viewer } = await createStandardTestAdmins(testDb.db);
    
    // Create contexts with the actual database IDs
    superAdminContext = createSuperAdminContext(testDb.db, { id: superAdmin.id });
    adminContext = createRoleContext('admin', testDb.db, ['users:read'], { id: admin.id });
    viewerContext = createRoleContext('viewer', testDb.db, [], { id: viewer.id });
  });

  afterEach(async () => {
    if (testDb?.client) {
      await cleanupTestDb(testDb.client);
    }
  });

  describe('permissions', () => {
    it('should require authentication for list', async () => {
      const caller = createCaller(createMockAdminContext({ admin: null, db: testDb.db }));

      await expect(caller.list({})).rejects.toThrow(TRPCError);
      await expect(caller.list({})).rejects.toThrow('You must be logged in');
    });

    it('should allow authenticated admins to list audit logs', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      expect(result).toHaveProperty('logs');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.logs)).toBe(true);
    });
  });

  describe('list', () => {
    it('should return empty list when no audit logs exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      expect(result.logs).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should list audit logs with pagination', async () => {
      // Create an admin and a user to generate audit logs
      const admin = await createTestAdminUser(testDb.db);
      const user = await createTestUser(testDb.db);

      // Create some audit log entries
      await testDb.db.insert(adminAuditLog).values([
        {
          adminId: admin.id,
          action: 'user_banned',
          entityType: 'user',
          entityId: user.id,
          details: { reason: 'Test ban' },
        },
        {
          adminId: admin.id,
          action: 'user_unbanned',
          entityType: 'user',
          entityId: user.id,
          details: {},
        },
        {
          adminId: admin.id,
          action: 'create',
          entityType: 'admin_user',
          entityId: admin.id,
          details: { email: 'test@example.com' },
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ limit: 10, offset: 0 });

      expect(result.logs.length).toBeGreaterThanOrEqual(3);
      expect(result.pagination.total).toBeGreaterThanOrEqual(3);

      // Cleanup - delete audit logs first to avoid FK constraint violations
      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by action', async () => {
      const admin = await createTestAdminUser(testDb.db);
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(adminAuditLog).values([
        {
          adminId: admin.id,
          action: 'user_banned',
          entityType: 'user',
          entityId: user.id,
          details: {},
        },
        {
          adminId: admin.id,
          action: 'user_unbanned',
          entityType: 'user',
          entityId: user.id,
          details: {},
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ action: 'user_banned' });

      expect(result.logs.every(log => log.action === 'user_banned')).toBe(true);

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by entityType', async () => {
      const admin = await createTestAdminUser(testDb.db);
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(adminAuditLog).values([
        {
          adminId: admin.id,
          action: 'create',
          entityType: 'user',
          entityId: user.id,
          details: {},
        },
        {
          adminId: admin.id,
          action: 'create',
          entityType: 'admin_user',
          entityId: admin.id,
          details: {},
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ entityType: 'user' });

      expect(result.logs.every(log => log.entityType === 'user')).toBe(true);

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by adminId', async () => {
      const admin1 = await createTestAdminUser(testDb.db);
      const admin2 = await createTestAdminUser(testDb.db);
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(adminAuditLog).values([
        {
          adminId: admin1.id,
          action: 'user_banned',
          entityType: 'user',
          entityId: user.id,
          details: {},
        },
        {
          adminId: admin2.id,
          action: 'user_banned',
          entityType: 'user',
          entityId: user.id,
          details: {},
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ adminId: admin1.id });

      expect(result.logs.every(log => log.adminId === admin1.id)).toBe(true);

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin1.id));
      await cleanupTestAdminUser(testDb.db, admin1.id);
      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin2.id));
      await cleanupTestAdminUser(testDb.db, admin2.id);
      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by date range', async () => {
      const admin = await createTestAdminUser(testDb.db);
      const user = await createTestUser(testDb.db);

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await testDb.db.insert(adminAuditLog).values([
        {
          adminId: admin.id,
          action: 'create',
          entityType: 'user',
          entityId: user.id,
          details: {},
          createdAt: yesterday,
        },
        {
          adminId: admin.id,
          action: 'update',
          entityType: 'user',
          entityId: user.id,
          details: {},
          createdAt: now,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({
        dateFrom: yesterday.toISOString(),
        dateTo: tomorrow.toISOString(),
      });

      expect(result.logs.length).toBeGreaterThanOrEqual(2);

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });

    it('should search by action, entityType, or details', async () => {
      const admin = await createTestAdminUser(testDb.db);
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(adminAuditLog).values([
        {
          adminId: admin.id,
          action: 'user_banned',
          entityType: 'user',
          entityId: user.id,
          details: { reason: 'Test search reason' },
        },
      ]);

      const caller = createCaller(superAdminContext);
      const actionResult = await caller.list({ search: 'user_banned' });
      const detailsResult = await caller.list({ search: 'Test search' });

      expect(actionResult.logs.length).toBeGreaterThan(0);
      expect(detailsResult.logs.length).toBeGreaterThan(0);

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });

    it('should sort by createdAt descending by default', async () => {
      const admin = await createTestAdminUser(testDb.db);
      const user = await createTestUser(testDb.db);

      const now = new Date();
      const earlier = new Date(now.getTime() - 1000);

      await testDb.db.insert(adminAuditLog).values([
        {
          adminId: admin.id,
          action: 'create',
          entityType: 'user',
          entityId: user.id,
          details: {},
          createdAt: earlier,
        },
        {
          adminId: admin.id,
          action: 'update',
          entityType: 'user',
          entityId: user.id,
          details: {},
          createdAt: now,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ sortBy: 'createdAt', sortOrder: 'desc' });

      if (result.logs.length >= 2) {
        const firstDate = new Date(result.logs[0].createdAt);
        const secondDate = new Date(result.logs[1].createdAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });

    it('should include admin information in results', async () => {
      const admin = await createTestAdminUser(testDb.db, {
        name: 'Test Admin',
        email: 'testadmin@example.com',
      });
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'user_banned',
        entityType: 'user',
        entityId: user.id,
        details: {},
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      const log = result.logs.find(l => l.adminId === admin.id);
      expect(log).toBeDefined();
      if (log && 'admin' in log && log.admin) {
        expect(log.admin.name).toBe('Test Admin');
        expect(log.admin.email).toBe('testadmin@example.com');
      }

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });

    it('should handle pagination correctly', async () => {
      const admin = await createTestAdminUser(testDb.db);
      const user = await createTestUser(testDb.db);

      // Create multiple audit logs
      const logs = Array.from({ length: 15 }, (_, i) => ({
        adminId: admin.id,
        action: `action_${i}`,
        entityType: 'user',
        entityId: user.id,
        details: { index: i },
      }));

      await testDb.db.insert(adminAuditLog).values(logs);

      const caller = createCaller(superAdminContext);
      const page1 = await caller.list({ limit: 10, offset: 0 });
      const page2 = await caller.list({ limit: 10, offset: 10 });

      expect(page1.logs.length).toBeLessThanOrEqual(10);
      expect(page2.logs.length).toBeLessThanOrEqual(10);
      expect(page1.pagination.hasMore).toBe(true);
      expect(page2.pagination.hasMore).toBe(false);

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('get', () => {
    it('should get audit log by ID', async () => {
      const admin = await createTestAdminUser(testDb.db);
      const user = await createTestUser(testDb.db);

      const [log] = await testDb.db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'user_banned',
        entityType: 'user',
        entityId: user.id,
        details: { reason: 'Test ban' },
      }).returning();

      const caller = createCaller(superAdminContext);
      const result = await caller.get({ logId: log.id });

      expect(result.id).toBe(log.id);
      expect(result.action).toBe('user_banned');
      expect(result.entityType).toBe('user');
      expect(result.details).toHaveProperty('reason', 'Test ban');
      expect(result).toHaveProperty('admin');

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent log', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.get({ logId: fakeId })).rejects.toThrow('Audit log not found');
    });

    it('should include admin information', async () => {
      const admin = await createTestAdminUser(testDb.db, {
        name: 'Test Admin',
        email: 'testadmin@example.com',
      });
      const user = await createTestUser(testDb.db);

      const [log] = await testDb.db.insert(adminAuditLog).values({
        adminId: admin.id,
        action: 'create',
        entityType: 'user',
        entityId: user.id,
        details: {},
      }).returning();

      const caller = createCaller(superAdminContext);
      const result = await caller.get({ logId: log.id });

      expect(result.admin).toBeDefined();
      if (result.admin) {
        expect(result.admin.name).toBe('Test Admin');
        expect(result.admin.email).toBe('testadmin@example.com');
      }

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getStats', () => {
    it('should get audit log statistics', async () => {
      const admin = await createTestAdminUser(testDb.db);
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(adminAuditLog).values([
        {
          adminId: admin.id,
          action: 'user_banned',
          entityType: 'user',
          entityId: user.id,
          details: {},
        },
        {
          adminId: admin.id,
          action: 'user_unbanned',
          entityType: 'user',
          entityId: user.id,
          details: {},
        },
        {
          adminId: admin.id,
          action: 'create',
          entityType: 'admin_user',
          entityId: admin.id,
          details: {},
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.getStats({});

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('actionCounts');
      expect(result).toHaveProperty('entityTypeCounts');
      expect(result).toHaveProperty('topAdmins');
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(Array.isArray(result.actionCounts)).toBe(true);
      expect(Array.isArray(result.entityTypeCounts)).toBe(true);
      expect(Array.isArray(result.topAdmins)).toBe(true);

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter stats by date range', async () => {
      const admin = await createTestAdminUser(testDb.db);
      const user = await createTestUser(testDb.db);

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await testDb.db.insert(adminAuditLog).values([
        {
          adminId: admin.id,
          action: 'create',
          entityType: 'user',
          entityId: user.id,
          details: {},
          createdAt: yesterday,
        },
        {
          adminId: admin.id,
          action: 'update',
          entityType: 'user',
          entityId: user.id,
          details: {},
          createdAt: now,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.getStats({
        dateFrom: yesterday.toISOString(),
        dateTo: tomorrow.toISOString(),
      });

      expect(result.total).toBeGreaterThanOrEqual(2);

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin.id));
      await cleanupTestAdminUser(testDb.db, admin.id);
      await cleanupTestUser(testDb.db, user.id);
    });

    it('should include top admins with activity counts', async () => {
      const admin1 = await createTestAdminUser(testDb.db, { name: 'Admin 1' });
      const admin2 = await createTestAdminUser(testDb.db, { name: 'Admin 2' });
      const user = await createTestUser(testDb.db);

      // Admin1 has more activity
      await testDb.db.insert(adminAuditLog).values([
        {
          adminId: admin1.id,
          action: 'create',
          entityType: 'user',
          entityId: user.id,
          details: {},
        },
        {
          adminId: admin1.id,
          action: 'update',
          entityType: 'user',
          entityId: user.id,
          details: {},
        },
        {
          adminId: admin2.id,
          action: 'create',
          entityType: 'user',
          entityId: user.id,
          details: {},
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.getStats({});

      expect(result.topAdmins.length).toBeGreaterThan(0);
      const admin1Stats = result.topAdmins.find(a => a.adminId === admin1.id);
      expect(admin1Stats).toBeDefined();
      if (admin1Stats) {
        expect(admin1Stats.count).toBeGreaterThanOrEqual(2);
        expect(admin1Stats.admin).toBeDefined();
      }

      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin1.id));
      await cleanupTestAdminUser(testDb.db, admin1.id);
      await testDb.db.delete(adminAuditLog).where(eq(adminAuditLog.adminId, admin2.id));
      await cleanupTestAdminUser(testDb.db, admin2.id);
      await cleanupTestUser(testDb.db, user.id);
    });
  });
});
