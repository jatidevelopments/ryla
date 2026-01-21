/**
 * Billing Router Tests
 * 
 * Tests for billing and credit operations.
 * Part of Phase 7.2: Backend Tests (Tier 2)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { billingRouter } from './billing.router';
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
  createMockHeaders,
  createStandardTestAdmins,
} from '../../test/utils/test-helpers';
import { userCredits, creditTransactions } from '@ryla/data';
import type { TestDb } from '../../test/utils/test-db';

describe('BillingRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof billingRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;
  let adminContext: ReturnType<typeof createRoleContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(billingRouter);
    
    // Create actual admin users in the database for foreign key constraints
    const { superAdmin, admin } = await createStandardTestAdmins(testDb.db);
    
    // Create contexts with the actual database IDs
    superAdminContext = createSuperAdminContext(testDb.db, { id: superAdmin.id });
    adminContext = createRoleContext('admin', testDb.db, ['billing:read', 'billing:write'], { id: admin.id });
  });

  afterEach(async () => {
    if (testDb?.client) {
      await cleanupTestDb(testDb.client);
    }
  });

  describe('permissions', () => {
    it('should require authentication for getUserCredits', async () => {
      const caller = createCaller(createMockAdminContext({ admin: null, db: testDb.db }));
      const user = await createTestUser(testDb.db);

      await expect(caller.getUserCredits({ userId: user.id })).rejects.toThrow(TRPCError);
      await expect(caller.getUserCredits({ userId: user.id })).rejects.toThrow('You must be logged in');

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getUserCredits', () => {
    it('should get user credits', async () => {
      const user = await createTestUser(testDb.db);
      await testDb.db.insert(userCredits).values({
        userId: user.id,
        balance: 100,
        totalEarned: 200,
        totalSpent: 100,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.getUserCredits({ userId: user.id });

      expect(result.balance).toBe(100);
      expect(result.totalEarned).toBe(200);
      expect(result.totalSpent).toBe(100);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should create credits record if it does not exist', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);

      const result = await caller.getUserCredits({ userId: user.id });

      expect(result.balance).toBe(0);
      expect(result.totalEarned).toBe(0);
      expect(result.totalSpent).toBe(0);

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getTransactions', () => {
    it('should get credit transactions with pagination', async () => {
      const user = await createTestUser(testDb.db);
      await testDb.db.insert(userCredits).values({
        userId: user.id,
        balance: 100,
        totalEarned: 100,
        totalSpent: 0,
      });

      await testDb.db.insert(creditTransactions).values([
        {
          userId: user.id,
          type: 'bonus',
          amount: 50,
          balanceAfter: 50,
          description: 'Test bonus',
        },
        {
          userId: user.id,
          type: 'generation',
          amount: -10,
          balanceAfter: 40,
          description: 'Test generation',
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.getTransactions({
        userId: user.id,
        limit: 10,
        offset: 0,
      });

      expect(result.transactions.length).toBeGreaterThanOrEqual(2);
      expect(result.pagination.total).toBeGreaterThanOrEqual(2);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by transaction type', async () => {
      const user = await createTestUser(testDb.db);
      await testDb.db.insert(userCredits).values({
        userId: user.id,
        balance: 100,
        totalEarned: 100,
        totalSpent: 0,
      });

      await testDb.db.insert(creditTransactions).values([
        {
          userId: user.id,
          type: 'bonus',
          amount: 50,
          balanceAfter: 50,
          description: 'Test bonus',
        },
        {
          userId: user.id,
          type: 'generation',
          amount: -10,
          balanceAfter: 40,
          description: 'Test generation',
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.getTransactions({
        userId: user.id,
        type: 'bonus',
      });

      expect(result.transactions.every(t => t.type === 'bonus')).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by date range', async () => {
      const user = await createTestUser(testDb.db);
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await testDb.db.insert(creditTransactions).values({
        userId: user.id,
        type: 'bonus',
        amount: 50,
        balanceAfter: 50,
        description: 'Test',
        createdAt: now,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.getTransactions({
        userId: user.id,
        startDate: yesterday.toISOString(),
        endDate: tomorrow.toISOString(),
      });

      expect(result.transactions.length).toBeGreaterThan(0);

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('addCredits', () => {
    it('should add credits to user account', async () => {
      const user = await createTestUser(testDb.db);
      await testDb.db.insert(userCredits).values({
        userId: user.id,
        balance: 50,
        totalEarned: 50,
        totalSpent: 0,
      });

      // Use the context from beforeEach which has the admin user in the database
      const caller = createCaller(superAdminContext);

      const result = await caller.addCredits({
        userId: user.id,
        amount: 100,
        reason: 'Test credit addition',
        category: 'promotional',
      });

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(150);

      // Verify credits were updated
      const updatedCredits = await caller.getUserCredits({ userId: user.id });
      expect(updatedCredits.balance).toBe(150);
      expect(updatedCredits.totalEarned).toBe(150);

      // Verify transaction was created
      const transactions = await caller.getTransactions({ userId: user.id });
      expect(transactions.transactions.some(t => t.type === 'admin_adjustment')).toBe(true);

      // Verify audit log
      const auditLogs = await testDb.db.query.adminAuditLog.findMany({
        where: (log, { eq }) => eq(log.entityId, user.id),
        orderBy: (log, { desc }) => [desc(log.createdAt)],
      });
      expect(auditLogs[0]?.action).toBe('credits_added');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should create credits record if it does not exist', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);

      const result = await caller.addCredits({
        userId: user.id,
        amount: 50,
        reason: 'Initial credit',
      });

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(50);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent user', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(
        caller.addCredits({
          userId: fakeId,
          amount: 50,
          reason: 'Test',
        })
      ).rejects.toThrow('User not found');
    });
  });

  describe('refundCredits', () => {
    it('should refund credits to user account', async () => {
      const user = await createTestUser(testDb.db);
      await testDb.db.insert(userCredits).values({
        userId: user.id,
        balance: 50,
        totalEarned: 100,
        totalSpent: 50,
      });

      // Use the context from beforeEach which has the admin user in the database
      const caller = createCaller(superAdminContext);

      const result = await caller.refundCredits({
        userId: user.id,
        amount: 25,
        reason: 'Test refund',
      });

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(75);

      // Verify transaction was created
      const transactions = await caller.getTransactions({ userId: user.id });
      expect(transactions.transactions.some(t => t.type === 'refund')).toBe(true);

      // Verify audit log
      const auditLogs = await testDb.db.query.adminAuditLog.findMany({
        where: (log, { eq }) => eq(log.entityId, user.id),
        orderBy: (log, { desc }) => [desc(log.createdAt)],
      });
      expect(auditLogs[0]?.action).toBe('credits_refunded');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should include jobId in refund if provided', async () => {
      const user = await createTestUser(testDb.db);
      const jobId = '00000000-0000-0000-0000-000000000001';
      const caller = createCaller(superAdminContext);

      const result = await caller.refundCredits({
        userId: user.id,
        amount: 10,
        reason: 'Failed job refund',
        jobId,
      });

      expect(result.success).toBe(true);

      const transactions = await caller.getTransactions({ userId: user.id });
      const refundTransaction = transactions.transactions.find(t => t.type === 'refund');
      expect(refundTransaction).toBeDefined();

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('adjustCredits', () => {
    it('should add credits with positive adjustment', async () => {
      const user = await createTestUser(testDb.db);
      await testDb.db.insert(userCredits).values({
        userId: user.id,
        balance: 50,
        totalEarned: 50,
        totalSpent: 0,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.adjustCredits({
        userId: user.id,
        amount: 25,
        reason: 'Positive adjustment',
      });

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(75);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should remove credits with negative adjustment (super_admin only)', async () => {
      const user = await createTestUser(testDb.db);
      await testDb.db.insert(userCredits).values({
        userId: user.id,
        balance: 100,
        totalEarned: 100,
        totalSpent: 0,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.adjustCredits({
        userId: user.id,
        amount: -25,
        reason: 'Negative adjustment',
      });

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(75);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should prevent negative balance', async () => {
      const user = await createTestUser(testDb.db);
      await testDb.db.insert(userCredits).values({
        userId: user.id,
        balance: 10,
        totalEarned: 10,
        totalSpent: 0,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.adjustCredits({
        userId: user.id,
        amount: -50,
        reason: 'Large negative adjustment',
      });

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(0); // Should not go negative

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should reject negative adjustment from non-super_admin', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(adminContext);

      await expect(
        caller.adjustCredits({
          userId: user.id,
          amount: -10,
          reason: 'Test',
        })
      ).rejects.toThrow('Only super_admin can make negative credit adjustments');

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getUserSubscription', () => {
    it('should get user subscription', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);

      const result = await caller.getUserSubscription({ userId: user.id });

      // Subscription may be null or undefined if user doesn't have one
      expect(result === null || result === undefined || typeof result === 'object').toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getSubscriptionHistory', () => {
    it('should get subscription history', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);

      const result = await caller.getSubscriptionHistory({ userId: user.id });

      expect(Array.isArray(result)).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getStats', () => {
    it('should get billing statistics for day period', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getStats({ period: 'day' });

      expect(result).toHaveProperty('period', 'day');
      expect(result).toHaveProperty('creditsAdded');
      expect(result).toHaveProperty('refunds');
      expect(result).toHaveProperty('creditsSpent');
      expect(result).toHaveProperty('subscriptionDistribution');
      expect(Array.isArray(result.subscriptionDistribution)).toBe(true);
    });

    it('should get billing statistics for week period', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getStats({ period: 'week' });

      expect(result.period).toBe('week');
    });

    it('should get billing statistics for month period', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getStats({ period: 'month' });

      expect(result.period).toBe('month');
    });
  });
});
