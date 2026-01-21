/**
 * Feature Flags Router Tests
 * 
 * Tests for feature flag management operations.
 * Part of Phase 7.2: Backend Tests (Tier 3)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { flagsRouter } from './flags.router';
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
import { featureFlags } from '@ryla/data';
import {
  createStandardTestAdmins,
} from '../../test/utils/test-helpers';
import type { TestDb } from '../../test/utils/test-db';

describe('FlagsRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof flagsRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;
  let adminContext: ReturnType<typeof createRoleContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(flagsRouter);
    
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
    it('should return empty list when no flags exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      expect(result.flags).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should list feature flags with pagination', async () => {
      const flagName = `test-flag-${Date.now()}`;
      await testDb.db.insert(featureFlags).values({
        name: flagName,
        type: 'boolean',
        enabled: false,
        config: {},
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ limit: 10, offset: 0 });

      expect(result.flags.length).toBeGreaterThanOrEqual(1);
      expect(result.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('should filter by type', async () => {
      await testDb.db.insert(featureFlags).values([
        {
          name: `boolean-flag-${Date.now()}`,
          type: 'boolean',
          enabled: false,
          config: {},
          createdBy: superAdminContext.admin.id,
        },
        {
          name: `percentage-flag-${Date.now()}`,
          type: 'percentage',
          enabled: false,
          config: { percentage: 50 },
          createdBy: superAdminContext.admin.id,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ type: 'boolean' });

      expect(result.flags.every(f => f.type === 'boolean')).toBe(true);
    });

    it('should filter by enabled status', async () => {
      await testDb.db.insert(featureFlags).values([
        {
          name: `enabled-flag-${Date.now()}`,
          type: 'boolean',
          enabled: true,
          config: {},
          createdBy: superAdminContext.admin.id,
        },
        {
          name: `disabled-flag-${Date.now()}`,
          type: 'boolean',
          enabled: false,
          config: {},
          createdBy: superAdminContext.admin.id,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const enabledResult = await caller.list({ enabled: true });
      const disabledResult = await caller.list({ enabled: false });

      expect(enabledResult.flags.every(f => f.enabled === true)).toBe(true);
      expect(disabledResult.flags.every(f => f.enabled === false)).toBe(true);
    });

    it('should search by name or description', async () => {
      await testDb.db.insert(featureFlags).values({
        name: `unique-search-flag-${Date.now()}`,
        description: 'Unique search description',
        type: 'boolean',
        enabled: false,
        config: {},
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const nameResult = await caller.list({ search: 'unique-search' });
      const descResult = await caller.list({ search: 'Unique search' });

      expect(nameResult.flags.length).toBeGreaterThan(0);
      expect(descResult.flags.length).toBeGreaterThan(0);
    });
  });

  describe('get', () => {
    it('should get feature flag by name', async () => {
      const flagName = `test-flag-${Date.now()}`;
      await testDb.db.insert(featureFlags).values({
        name: flagName,
        type: 'boolean',
        enabled: true,
        config: {},
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.get({ flagName });

      expect(result.name).toBe(flagName);
      expect(result.type).toBe('boolean');
      expect(result.enabled).toBe(true);
      expect(result).toHaveProperty('history');
    });

    it('should return error for non-existent flag', async () => {
      const caller = createCaller(superAdminContext);
      const fakeName = 'non-existent-flag';

      await expect(caller.get({ flagName: fakeName })).rejects.toThrow(TRPCError);
      await expect(caller.get({ flagName: fakeName })).rejects.toThrow('Feature flag not found');
    });
  });

  describe('create', () => {
    it('should create a new feature flag', async () => {
      const caller = createCaller(superAdminContext);
      const flagName = `new-flag-${Date.now()}`;

      const result = await caller.create({
        name: flagName,
        description: 'Test flag',
        type: 'boolean',
        enabled: false,
      });

      expect(result.name).toBe(flagName);
      expect(result.type).toBe('boolean');
      expect(result.enabled).toBe(false);

      // Verify audit log
      const auditLogs = await testDb.db.query.adminAuditLog.findMany({
        where: (log, { eq }) => eq(log.entityId, result.id),
        orderBy: (log, { desc }) => [desc(log.createdAt)],
      });
      expect(auditLogs[0]?.action).toBe('create');
    });

    it('should reject duplicate flag name', async () => {
      const flagName = `duplicate-flag-${Date.now()}`;
      await testDb.db.insert(featureFlags).values({
        name: flagName,
        type: 'boolean',
        enabled: false,
        config: {},
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      await expect(
        caller.create({
          name: flagName,
          type: 'boolean',
          enabled: false,
        })
      ).rejects.toThrow(TRPCError);
      await expect(
        caller.create({
          name: flagName,
          type: 'boolean',
          enabled: false,
        })
      ).rejects.toThrow('already exists');
    });

    it('should create percentage flag with config', async () => {
      const caller = createCaller(superAdminContext);
      const flagName = `percentage-flag-${Date.now()}`;

      const result = await caller.create({
        name: flagName,
        type: 'percentage',
        enabled: true,
        config: {
          percentage: 50,
        },
      });

      expect(result.type).toBe('percentage');
      expect(result.config).toHaveProperty('percentage', 50);
    });

    it('should create tier flag with config', async () => {
      const caller = createCaller(superAdminContext);
      const flagName = `tier-flag-${Date.now()}`;

      const result = await caller.create({
        name: flagName,
        type: 'tier',
        enabled: true,
        config: {
          tiers: ['pro', 'unlimited'],
        },
      });

      expect(result.type).toBe('tier');
      expect(result.config).toHaveProperty('tiers');
    });
  });

  describe('update', () => {
    it('should update feature flag', async () => {
      const flagName = `update-flag-${Date.now()}`;
      await testDb.db.insert(featureFlags).values({
        name: flagName,
        type: 'boolean',
        enabled: false,
        config: {},
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.update({
        flagName,
        enabled: true,
        description: 'Updated description',
      });

      expect(result.enabled).toBe(true);
      expect(result.description).toBe('Updated description');

      // Verify history was saved
      const flag = await caller.get({ flagName });
      expect(flag.history.length).toBeGreaterThan(0);
    });

    it('should merge config when updating', async () => {
      const flagName = `config-flag-${Date.now()}`;
      await testDb.db.insert(featureFlags).values({
        name: flagName,
        type: 'percentage',
        enabled: true,
        config: { percentage: 50 },
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.update({
        flagName,
        config: {
          percentage: 75,
        },
      });

      expect(result.config).toHaveProperty('percentage', 75);
    });

    it('should return error for non-existent flag', async () => {
      const caller = createCaller(superAdminContext);
      const fakeName = 'non-existent-flag';

      await expect(
        caller.update({
          flagName: fakeName,
          enabled: true,
        })
      ).rejects.toThrow(TRPCError);
      await expect(
        caller.update({
          flagName: fakeName,
          enabled: true,
        })
      ).rejects.toThrow('Feature flag not found');
    });
  });

  describe('delete', () => {
    it('should delete a feature flag', async () => {
      const flagName = `delete-flag-${Date.now()}`;
      await testDb.db.insert(featureFlags).values({
        name: flagName,
        type: 'boolean',
        enabled: false,
        config: {},
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.delete({ flagName });

      expect(result.success).toBe(true);

      // Verify flag is deleted
      await expect(caller.get({ flagName })).rejects.toThrow('Feature flag not found');
    });

    it('should return error for non-existent flag', async () => {
      const caller = createCaller(superAdminContext);
      const fakeName = 'non-existent-flag';

      await expect(caller.delete({ flagName: fakeName })).rejects.toThrow(TRPCError);
      await expect(caller.delete({ flagName: fakeName })).rejects.toThrow('Feature flag not found');
    });
  });

  describe('checkForUser', () => {
    it('should return false for non-existent flag', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.checkForUser({
        flagName: 'non-existent-flag',
      });

      expect(result.enabled).toBe(false);
      expect(result.reason).toBe('Flag not found');
    });

    it('should return false for disabled flag', async () => {
      const flagName = `disabled-flag-${Date.now()}`;
      await testDb.db.insert(featureFlags).values({
        name: flagName,
        type: 'boolean',
        enabled: false,
        config: {},
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.checkForUser({
        flagName,
      });

      expect(result.enabled).toBe(false);
      expect(result.reason).toBe('Flag disabled globally');
    });

    it('should return true for enabled boolean flag', async () => {
      const flagName = `enabled-flag-${Date.now()}`;
      await testDb.db.insert(featureFlags).values({
        name: flagName,
        type: 'boolean',
        enabled: true,
        config: {},
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.checkForUser({
        flagName,
      });

      expect(result.enabled).toBe(true);
      expect(result.reason).toBe('Flag enabled');
    });

    it('should check user override', async () => {
      const user = await createTestUser(testDb.db);
      const flagName = `override-flag-${Date.now()}`;
      await testDb.db.insert(featureFlags).values({
        name: flagName,
        type: 'boolean',
        enabled: true,
        config: {
          userOverrides: {
            [user.id]: false,
          },
        },
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.checkForUser({
        flagName,
        userId: user.id,
      });

      expect(result.enabled).toBe(false);
      expect(result.reason).toBe('User override disabled');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should check tier-based flag', async () => {
      const flagName = `tier-flag-${Date.now()}`;
      await testDb.db.insert(featureFlags).values({
        name: flagName,
        type: 'tier',
        enabled: true,
        config: {
          tiers: ['pro', 'unlimited'],
        },
        createdBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const enabledResult = await caller.checkForUser({
        flagName,
        userTier: 'pro',
      });
      const disabledResult = await caller.checkForUser({
        flagName,
        userTier: 'free',
      });

      expect(enabledResult.enabled).toBe(true);
      expect(disabledResult.enabled).toBe(false);
    });
  });
});
