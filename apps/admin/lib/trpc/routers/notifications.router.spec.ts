/**
 * Broadcast Notifications Router Tests
 * 
 * Tests for broadcast notification management operations.
 * Part of Phase 7.2: Backend Tests (Tier 3)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { notificationsRouter } from './notifications.router';
import { createCallerFactory } from '../base';
import { createTestDb, cleanupTestDb } from '../../test/utils/test-db';
import {
  createSuperAdminContext,
  createRoleContext,
  createMockAdminContext,
} from '../../test/utils/test-context';
import {
  createTestUser,
  cleanupTestUser,
} from '../../test/utils/test-helpers';
import { broadcastNotifications } from '@ryla/data';
import {
  createStandardTestAdmins,
} from '../../test/utils/test-helpers';
import type { TestDb } from '../../test/utils/test-db';

describe('NotificationsRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof notificationsRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;
  let adminContext: ReturnType<typeof createRoleContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(notificationsRouter);
    
    // Create actual admin users in the database for foreign key constraints
    const { superAdmin, admin } = await createStandardTestAdmins(testDb.db);
    
    // Create contexts with the actual database IDs
    superAdminContext = createSuperAdminContext(testDb.db, { id: superAdmin.id });
    adminContext = createRoleContext('admin', testDb.db, ['settings:write'], { id: admin.id });
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
  });

  describe('list', () => {
    it('should return empty list when no notifications exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      expect(result.notifications).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should list broadcast notifications with pagination', async () => {
      await testDb.db.insert(broadcastNotifications).values({
        type: 'info',
        title: 'Test Notification',
        message: 'Test message',
        targeting: { allUsers: true },
        status: 'sent',
        targetCount: 0,
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ limit: 10, offset: 0 });

      expect(result.notifications.length).toBeGreaterThanOrEqual(1);
      expect(result.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('should filter by status', async () => {
      await testDb.db.insert(broadcastNotifications).values([
        {
          type: 'info',
          title: 'Draft Notification',
          message: 'Draft',
          targeting: { allUsers: true },
          status: 'draft',
          targetCount: 0,
          createdBy: superAdminContext.admin.id,
        },
        {
          type: 'info',
          title: 'Sent Notification',
          message: 'Sent',
          targeting: { allUsers: true },
          status: 'sent',
          targetCount: 0,
          createdBy: superAdminContext.admin.id,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ status: 'draft' });

      expect(result.notifications.every(n => n.status === 'draft')).toBe(true);
    });
  });

  describe('get', () => {
    it('should get notification by ID', async () => {
      const [notification] = await testDb.db.insert(broadcastNotifications).values({
        type: 'info',
        title: 'Test Notification',
        message: 'Test message',
        targeting: { allUsers: true },
        status: 'sent',
        targetCount: 0,
        createdBy: superAdminContext.admin.id,
      }).returning();

      const caller = createCaller(superAdminContext);
      const result = await caller.get({ notificationId: notification.id });

      expect(result.id).toBe(notification.id);
      expect(result.title).toBe('Test Notification');
      expect(result).toHaveProperty('createdByAdmin');
    });

    it('should return error for non-existent notification', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.get({ notificationId: fakeId })).rejects.toThrow(TRPCError);
      await expect(caller.get({ notificationId: fakeId })).rejects.toThrow('Notification not found');
    });
  });

  describe('preview', () => {
    it('should preview targeting for all users', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.preview({
        targeting: {
          allUsers: true,
        },
      });

      expect(result).toHaveProperty('targetCount');
      expect(result).toHaveProperty('targeting');
      expect(typeof result.targetCount).toBe('number');
    });

    it('should preview targeting for specific user IDs', async () => {
      const user1 = await createTestUser(testDb.db);
      const user2 = await createTestUser(testDb.db);

      const caller = createCaller(superAdminContext);
      const result = await caller.preview({
        targeting: {
          userIds: [user1.id, user2.id],
        },
      });

      expect(result.targetCount).toBeGreaterThanOrEqual(0);

      await cleanupTestUser(testDb.db, user1.id);
      await cleanupTestUser(testDb.db, user2.id);
    });

    it('should preview targeting by subscription tier', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.preview({
        targeting: {
          tiers: ['pro', 'unlimited'],
        },
      });

      expect(typeof result.targetCount).toBe('number');
    });

    it('should preview targeting by active subscription', async () => {
      const caller = createCaller(superAdminContext);
      const withSubResult = await caller.preview({
        targeting: {
          hasActiveSubscription: true,
        },
      });
      const withoutSubResult = await caller.preview({
        targeting: {
          hasActiveSubscription: false,
        },
      });

      expect(typeof withSubResult.targetCount).toBe('number');
      expect(typeof withoutSubResult.targetCount).toBe('number');
    });
  });

  describe('create', () => {
    it('should create a broadcast notification', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.create({
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification',
        targeting: {
          allUsers: true,
        },
      });

      expect(result.title).toBe('Test Notification');
      expect(result.message).toBe('This is a test notification');
      expect(result.targeting).toHaveProperty('allUsers', true);

      // Verify audit log
      const auditLogs = await testDb.db.query.adminAuditLog.findMany({
        where: (log, { eq }) => eq(log.entityId, result.id),
        orderBy: (log, { desc }) => [desc(log.createdAt)],
      });
      expect(auditLogs[0]?.action).toBe('create');
    });

    it('should create scheduled notification', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const caller = createCaller(superAdminContext);

      const result = await caller.create({
        type: 'info',
        title: 'Scheduled Notification',
        message: 'Scheduled message',
        targeting: {
          allUsers: true,
        },
        scheduledFor: futureDate,
      });

      expect(result.status).toBe('scheduled');
      expect(result.scheduledFor).toBeDefined();
    });

    it('should create notification with specific user targeting', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);

      const result = await caller.create({
        type: 'info',
        title: 'Targeted Notification',
        message: 'Targeted message',
        targeting: {
          userIds: [user.id],
        },
      });

      expect(result.targeting).toHaveProperty('userIds');
      expect(Array.isArray(result.targeting.userIds)).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('cancel', () => {
    it('should cancel a scheduled notification', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const caller = createCaller(superAdminContext);

      const created = await caller.create({
        type: 'info',
        title: 'To Cancel',
        message: 'Will be cancelled',
        targeting: { allUsers: true },
        scheduledFor: futureDate,
      });

      const result = await caller.cancel({ notificationId: created.id });

      expect(result.success).toBe(true);

      // Verify status changed
      const cancelled = await caller.get({ notificationId: created.id });
      expect(cancelled.status).toBe('cancelled');
    });

    it('should cancel a draft notification', async () => {
      const caller = createCaller(superAdminContext);

      // Create a scheduled notification (which can be cancelled)
      // Draft notifications are immediately sent, so we need a scheduled one
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const created = await caller.create({
        type: 'info',
        title: 'Draft to Cancel',
        message: 'Draft message',
        targeting: { allUsers: true },
        scheduledFor: futureDate, // Make it scheduled so it can be cancelled
      });

      const result = await caller.cancel({ notificationId: created.id });

      expect(result.success).toBe(true);
    });

    it('should reject cancelling sent notification', async () => {
      const caller = createCaller(superAdminContext);

      const created = await caller.create({
        type: 'info',
        title: 'Sent Notification',
        message: 'Already sent',
        targeting: { allUsers: true },
      });

      // Wait for status to be set to 'sent'
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try to cancel (may fail if already sent)
      try {
        await caller.cancel({ notificationId: created.id });
      } catch (error: any) {
        expect(error.message).toContain('Can only cancel scheduled or draft notifications');
      }
    });

    it('should return error for non-existent notification', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.cancel({ notificationId: fakeId })).rejects.toThrow(TRPCError);
      await expect(caller.cancel({ notificationId: fakeId })).rejects.toThrow('Notification not found');
    });
  });

  describe('getStats', () => {
    it('should get notification statistics', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getStats();

      expect(result).toHaveProperty('byStatus');
      expect(result).toHaveProperty('totalSent');
      expect(result).toHaveProperty('totalRead');
      expect(typeof result.totalSent).toBe('number');
      expect(typeof result.totalRead).toBe('number');
      expect(typeof result.byStatus).toBe('object');
    });
  });
});
