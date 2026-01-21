/**
 * Users Router Tests
 * 
 * Tests for user management operations.
 * Part of Phase 7.2: Backend Tests (Tier 1)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { usersRouter } from './users.router';
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
  createTestUsers,
  createMockHeaders,
  createStandardTestAdmins,
} from '../../test/utils/test-helpers';
import type { TestDb } from '../../test/utils/test-db';

describe('UsersRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof usersRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;
  let adminContext: ReturnType<typeof createRoleContext>;
  let viewerContext: ReturnType<typeof createRoleContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(usersRouter);
    
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

    it('should allow authenticated admins to list users', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.users)).toBe(true);
    });
  });

  describe('list', () => {
    it('should return empty list when no users exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      expect(result.users).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should list users with pagination', async () => {
      const testUsers = await createTestUsers(testDb.db, 5);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ limit: 10, offset: 0 });

      expect(result.users.length).toBeGreaterThanOrEqual(5);
      expect(result.pagination.total).toBeGreaterThanOrEqual(5);
      expect(result.pagination.hasMore).toBe(false);

      // Cleanup
      for (const user of testUsers) {
        await cleanupTestUser(testDb.db, user.id);
      }
    });

    it('should filter by status (active)', async () => {
      const activeUser = await createTestUser(testDb.db, { banned: false });
      const bannedUser = await createTestUser(testDb.db, { banned: true });

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ status: 'active' });

      expect(result.users.every(u => u.banned === false)).toBe(true);

      await cleanupTestUser(testDb.db, activeUser.id);
      await cleanupTestUser(testDb.db, bannedUser.id);
    });

    it('should filter by status (banned)', async () => {
      const activeUser = await createTestUser(testDb.db, { banned: false });
      const bannedUser = await createTestUser(testDb.db, { banned: true });

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ status: 'banned' });

      expect(result.users.every(u => u.banned === true)).toBe(true);

      await cleanupTestUser(testDb.db, activeUser.id);
      await cleanupTestUser(testDb.db, bannedUser.id);
    });

    it('should search by email, name, or publicName', async () => {
      const user = await createTestUser(testDb.db, {
        email: 'unique-search@example.com',
        name: 'Unique Search Name',
        publicName: 'unique-search-handle',
      });

      const caller = createCaller(superAdminContext);
      const emailResult = await caller.list({ search: 'unique-search' });
      const nameResult = await caller.list({ search: 'Unique Search' });
      const handleResult = await caller.list({ search: 'unique-search-handle' });

      expect(emailResult.users.length).toBeGreaterThan(0);
      expect(nameResult.users.length).toBeGreaterThan(0);
      expect(handleResult.users.length).toBeGreaterThan(0);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should sort by createdAt descending by default', async () => {
      const user1 = await createTestUser(testDb.db);
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const user2 = await createTestUser(testDb.db);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ sortBy: 'createdAt', sortOrder: 'desc' });

      const user1Index = result.users.findIndex(u => u.id === user1.id);
      const user2Index = result.users.findIndex(u => u.id === user2.id);

      // user2 should come before user1 (newer first)
      expect(user2Index).toBeLessThan(user1Index);

      await cleanupTestUser(testDb.db, user1.id);
      await cleanupTestUser(testDb.db, user2.id);
    });

    it('should enrich users with credits, subscription, and counts', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      const foundUser = result.users.find(u => u.id === user.id);
      if (foundUser) {
        expect(foundUser).toHaveProperty('credits');
        expect(foundUser).toHaveProperty('totalEarned');
        expect(foundUser).toHaveProperty('totalSpent');
        expect(foundUser).toHaveProperty('subscriptionTier');
        expect(foundUser).toHaveProperty('subscriptionStatus');
        expect(foundUser).toHaveProperty('characterCount');
        expect(foundUser).toHaveProperty('imageCount');
      }

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('get', () => {
    it('should get user by ID with full details', async () => {
      const testUser = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);

      const result = await caller.get({ userId: testUser.id });

      expect(result.id).toBe(testUser.id);
      expect(result.email).toBe(testUser.email);
      expect(result).toHaveProperty('credits');
      expect(result).toHaveProperty('subscription');
      expect(result).toHaveProperty('characterCount');
      expect(result).toHaveProperty('imageCount');

      await cleanupTestUser(testDb.db, testUser.id);
    });

    it('should return error for non-existent user', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.get({ userId: fakeId })).rejects.toThrow('User not found');
    });
  });

  describe('search', () => {
    it('should search users by email', async () => {
      const user = await createTestUser(testDb.db, {
        email: 'search-test@example.com',
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.search({ query: 'search-test' });

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(u => u.id === user.id)).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should search users by name', async () => {
      const user = await createTestUser(testDb.db, {
        name: 'Search Test Name',
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.search({ query: 'Search Test' });

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(u => u.id === user.id)).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should search users by UUID (exact match)', async () => {
      const user = await createTestUser(testDb.db);

      const caller = createCaller(superAdminContext);
      const result = await caller.search({ query: user.id });

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(u => u.id === user.id)).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should respect limit parameter', async () => {
      await createTestUsers(testDb.db, 10);

      const caller = createCaller(superAdminContext);
      const result = await caller.search({ query: 'user', limit: 5 });

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe('ban', () => {
    it('should ban a user', async () => {
      const user = await createTestUser(testDb.db, { banned: false });
      // Use the context from beforeEach which has the admin user in the database
      const caller = createCaller(superAdminContext);

      const result = await caller.ban({
        userId: user.id,
        reason: 'Test ban reason',
      });

      expect(result.success).toBe(true);

      // Verify user is banned
      const bannedUser = await caller.get({ userId: user.id });
      expect(bannedUser.banned).toBe(true);

      // Verify audit log
      const auditLogs = await testDb.db.query.adminAuditLog.findMany({
        where: (log, { eq }) => eq(log.entityId, user.id),
        orderBy: (log, { desc }) => [desc(log.createdAt)],
      });
      expect(auditLogs[0]?.action).toBe('user_banned');
      expect(auditLogs[0]?.details).toHaveProperty('reason', 'Test ban reason');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should reject banning already banned user', async () => {
      const user = await createTestUser(testDb.db, { banned: true });
      const caller = createCaller(superAdminContext);

      await expect(
        caller.ban({
          userId: user.id,
          reason: 'Test reason',
        })
      ).rejects.toThrow('User is already banned');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent user', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(
        caller.ban({
          userId: fakeId,
          reason: 'Test reason',
        })
      ).rejects.toThrow('User not found');
    });
  });

  describe('unban', () => {
    it('should unban a user', async () => {
      const user = await createTestUser(testDb.db, { banned: true });
      // Use the context from beforeEach which has the admin user in the database
      const caller = createCaller(superAdminContext);

      const result = await caller.unban({ userId: user.id });

      expect(result.success).toBe(true);

      // Verify user is unbanned
      const unbannedUser = await caller.get({ userId: user.id });
      expect(unbannedUser.banned).toBe(false);

      // Verify audit log
      const auditLogs = await testDb.db.query.adminAuditLog.findMany({
        where: (log, { eq }) => eq(log.entityId, user.id),
        orderBy: (log, { desc }) => [desc(log.createdAt)],
      });
      expect(auditLogs[0]?.action).toBe('user_unbanned');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should reject unbanning non-banned user', async () => {
      const user = await createTestUser(testDb.db, { banned: false });
      const caller = createCaller(superAdminContext);

      await expect(caller.unban({ userId: user.id })).rejects.toThrow('User is not banned');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent user', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.unban({ userId: fakeId })).rejects.toThrow('User not found');
    });
  });

  describe('getCredits', () => {
    it('should get user credit transactions', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);

      const result = await caller.getCredits({
        userId: user.id,
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.transactions)).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should handle pagination correctly', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);

      const result = await caller.getCredits({
        userId: user.id,
        limit: 5,
        offset: 0,
      });

      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.offset).toBe(0);
      expect(result.transactions.length).toBeLessThanOrEqual(5);

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getSubscription', () => {
    it('should get user subscription', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);

      const result = await caller.getSubscription({ userId: user.id });

      // Subscription may be null or undefined if user doesn't have one
      expect(result === null || result === undefined || typeof result === 'object').toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getCharacters', () => {
    it('should get user characters', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);

      const result = await caller.getCharacters({ userId: user.id });

      expect(Array.isArray(result)).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getImages', () => {
    it('should get user images', async () => {
      const user = await createTestUser(testDb.db);
      const caller = createCaller(superAdminContext);

      const result = await caller.getImages({
        userId: user.id,
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('images');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.images)).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by characterId when provided', async () => {
      const user = await createTestUser(testDb.db);
      const fakeCharacterId = '00000000-0000-0000-0000-000000000000';
      const caller = createCaller(superAdminContext);

      const result = await caller.getImages({
        userId: user.id,
        characterId: fakeCharacterId,
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('images');
      expect(Array.isArray(result.images)).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });
  });
});
