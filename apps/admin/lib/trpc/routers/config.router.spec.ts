/**
 * System Configuration Router Tests
 * 
 * Tests for system configuration management operations.
 * Part of Phase 7.2: Backend Tests (Tier 3)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { configRouter } from './config.router';
import { createCallerFactory } from '../base';
import { createTestDb, cleanupTestDb } from '../../test/utils/test-db';
import {
  createSuperAdminContext,
  createRoleContext,
  createMockAdminContext,
} from '../../test/utils/test-context';
import { systemConfig } from '@ryla/data';
import {
  createStandardTestAdmins,
} from '../../test/utils/test-helpers';
import type { TestDb } from '../../test/utils/test-db';

describe('ConfigRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof configRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;
  let adminContext: ReturnType<typeof createRoleContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(configRouter);
    
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
    it('should return configurations grouped by category', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      expect(result).toHaveProperty('configs');
      expect(result).toHaveProperty('grouped');
      expect(result).toHaveProperty('categories');
      expect(Array.isArray(result.configs)).toBe(true);
      expect(typeof result.grouped).toBe('object');
      expect(Array.isArray(result.categories)).toBe(true);
    });

    it('should filter by category', async () => {
      await testDb.db.insert(systemConfig).values({
        key: 'test.category.key',
        value: 'test-value',
        category: 'test',
        validationType: 'string',
        updatedBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ category: 'test' });

      expect(result.configs.every(c => c.category === 'test')).toBe(true);
    });

    it('should search by key or description', async () => {
      await testDb.db.insert(systemConfig).values({
        key: 'unique-search-key',
        value: 'test',
        description: 'Unique search description',
        category: 'test',
        validationType: 'string',
        updatedBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const keyResult = await caller.list({ search: 'unique-search' });
      const descResult = await caller.list({ search: 'Unique search' });

      expect(keyResult.configs.length).toBeGreaterThan(0);
      expect(descResult.configs.length).toBeGreaterThan(0);
    });
  });

  describe('get', () => {
    it('should get configuration by key', async () => {
      const configKey = `test.config.${Date.now()}`;
      await testDb.db.insert(systemConfig).values({
        key: configKey,
        value: 'test-value',
        category: 'test',
        validationType: 'string',
        updatedBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.get({ key: configKey });

      expect(result.key).toBe(configKey);
      expect(result.value).toBe('test-value');
    });

    it('should return error for non-existent config', async () => {
      const caller = createCaller(superAdminContext);
      const fakeKey = 'non-existent.config.key';

      await expect(caller.get({ key: fakeKey })).rejects.toThrow(TRPCError);
      await expect(caller.get({ key: fakeKey })).rejects.toThrow('Configuration not found');
    });
  });

  describe('set', () => {
    it('should create a new configuration', async () => {
      const caller = createCaller(superAdminContext);
      const configKey = `new.config.${Date.now()}`;

      const result = await caller.set({
        key: configKey,
        value: 'new-value',
        description: 'Test config',
        validationType: 'string',
      });

      expect(result.key).toBe(configKey);
      expect(result.value).toBe('new-value');

      // Verify audit log
      const auditLogs = await testDb.db.query.adminAuditLog.findMany({
        where: (log, { eq }) => eq(log.entityId, result.id),
        orderBy: (log, { desc }) => [desc(log.createdAt)],
      });
      expect(auditLogs[0]?.action).toBe('create');
    });

    it('should update existing configuration', async () => {
      const configKey = `update.config.${Date.now()}`;
      await testDb.db.insert(systemConfig).values({
        key: configKey,
        value: 'old-value',
        category: 'test',
        validationType: 'string',
        updatedBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.set({
        key: configKey,
        value: 'new-value',
      });

      expect(result.value).toBe('new-value');

      // Verify history was saved
      const history = await caller.getHistory({ key: configKey });
      expect(history.length).toBeGreaterThan(0);
    });

    it('should validate number type', async () => {
      const caller = createCaller(superAdminContext);
      const configKey = `number.config.${Date.now()}`;

      const result = await caller.set({
        key: configKey,
        value: 42,
        validationType: 'number',
      });

      expect(result.value).toBe(42);

      // Should reject non-number
      await expect(
        caller.set({
          key: configKey,
          value: 'not-a-number',
          validationType: 'number',
        })
      ).rejects.toThrow(TRPCError);
      await expect(
        caller.set({
          key: configKey,
          value: 'not-a-number',
          validationType: 'number',
        })
      ).rejects.toThrow('must be a number');
    });

    it('should validate boolean type', async () => {
      const caller = createCaller(superAdminContext);
      const configKey = `boolean.config.${Date.now()}`;

      const result = await caller.set({
        key: configKey,
        value: true,
        validationType: 'boolean',
      });

      expect(result.value).toBe(true);

      // Should reject non-boolean
      await expect(
        caller.set({
          key: configKey,
          value: 'not-a-boolean',
          validationType: 'boolean',
        })
      ).rejects.toThrow('must be a boolean');
    });

    it('should validate string type', async () => {
      const caller = createCaller(superAdminContext);
      const configKey = `string.config.${Date.now()}`;

      const result = await caller.set({
        key: configKey,
        value: 'test-string',
        validationType: 'string',
      });

      expect(result.value).toBe('test-string');

      // Should reject non-string
      await expect(
        caller.set({
          key: configKey,
          value: 123,
          validationType: 'string',
        })
      ).rejects.toThrow('must be a string');
    });
  });

  describe('getHistory', () => {
    it('should get configuration change history', async () => {
      const configKey = `history.config.${Date.now()}`;
      await testDb.db.insert(systemConfig).values({
        key: configKey,
        value: 'initial',
        category: 'test',
        validationType: 'string',
        updatedBy: superAdminContext.admin.id,
      });

      const caller = createCaller(superAdminContext);
      await caller.set({ key: configKey, value: 'updated' });

      const history = await caller.getHistory({ key: configKey });

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should return error for non-existent config', async () => {
      const caller = createCaller(superAdminContext);
      const fakeKey = 'non-existent.config.key';

      await expect(caller.getHistory({ key: fakeKey })).rejects.toThrow(TRPCError);
      await expect(caller.getHistory({ key: fakeKey })).rejects.toThrow('Configuration not found');
    });
  });

  describe('initializeDefaults', () => {
    it('should initialize default configurations (super_admin only)', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.initializeDefaults();

      expect(result).toHaveProperty('initialized');
      expect(result).toHaveProperty('skipped');
      expect(result).toHaveProperty('results');
      expect(typeof result.initialized).toBe('number');
      expect(typeof result.skipped).toBe('number');
      expect(Array.isArray(result.results)).toBe(true);
    });

    it('should reject non-super_admin from initializing defaults', async () => {
      const caller = createCaller(adminContext);

      await expect(caller.initializeDefaults()).rejects.toThrow(TRPCError);
      await expect(caller.initializeDefaults()).rejects.toThrow('Only super_admin can initialize default configurations');
    });

    it('should skip existing configurations', async () => {
      const caller = createCaller(superAdminContext);

      // First initialization
      const firstResult = await caller.initializeDefaults();

      // Second initialization should skip existing
      const secondResult = await caller.initializeDefaults();

      expect(secondResult.skipped).toBeGreaterThanOrEqual(firstResult.initialized);
    });
  });
});
