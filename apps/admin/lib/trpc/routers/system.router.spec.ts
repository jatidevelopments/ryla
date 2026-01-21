/**
 * System Router Tests
 * 
 * Tests for system health monitoring.
 * Part of Phase 7.2: Backend Tests (Tier 3)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { systemRouter } from './system.router';
import { createCallerFactory } from '../base';
import { createTestDb, cleanupTestDb } from '../../test/utils/test-db';
import {
  createSuperAdminContext,
  createMockAdminContext,
} from '../../test/utils/test-context';
import {
  createStandardTestAdmins,
} from '../../test/utils/test-helpers';
import type { TestDb } from '../../test/utils/test-db';

describe('SystemRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof systemRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(systemRouter);
    
    // Create actual admin users in the database for foreign key constraints
    const { superAdmin } = await createStandardTestAdmins(testDb.db);
    
    // Create contexts with the actual database IDs
    superAdminContext = createSuperAdminContext(testDb.db, { id: superAdmin.id });
  });

  afterEach(async () => {
    if (testDb?.client) {
      await cleanupTestDb(testDb.client);
    }
  });

  describe('permissions', () => {
    it('should require authentication for getHealth', async () => {
      const caller = createCaller(createMockAdminContext({ admin: null, db: testDb.db }));

      await expect(caller.getHealth()).rejects.toThrow(TRPCError);
      await expect(caller.getHealth()).rejects.toThrow('You must be logged in');
    });
  });

  describe('getHealth', () => {
    it('should return system health status', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getHealth();

      expect(result).toHaveProperty('overall');
      expect(result).toHaveProperty('database');
      expect(result).toHaveProperty('generation');
      expect(result).toHaveProperty('storage');

      expect(result.overall).toHaveProperty('healthy');
      expect(result.overall).toHaveProperty('status');
      expect(result.overall).toHaveProperty('timestamp');

      expect(result.database).toHaveProperty('healthy');
      expect(result.database).toHaveProperty('responseTime');
      expect(result.database).toHaveProperty('message');

      expect(result.generation).toHaveProperty('healthy');
      expect(result.generation).toHaveProperty('queued');
      expect(result.generation).toHaveProperty('processing');
      expect(result.generation).toHaveProperty('failed');
      expect(result.generation).toHaveProperty('totalActive');
      expect(result.generation).toHaveProperty('recentFailed');

      expect(result.storage).toHaveProperty('totalImages');
      expect(result.storage).toHaveProperty('estimatedStorageGB');
      expect(result.storage).toHaveProperty('usagePercentage');
      expect(result.storage).toHaveProperty('status');
    });

    it('should report database as healthy when connection works', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getHealth();

      // Database should be healthy in test environment
      expect(result.database.healthy).toBe(true);
      expect(result.database.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should include generation queue statistics', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getHealth();

      expect(typeof result.generation.queued).toBe('number');
      expect(typeof result.generation.processing).toBe('number');
      expect(typeof result.generation.failed).toBe('number');
      expect(typeof result.generation.totalActive).toBe('number');
      expect(typeof result.generation.recentFailed).toBe('number');
    });

    it('should include storage information', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getHealth();

      expect(typeof result.storage.totalImages).toBe('number');
      expect(result.storage.estimatedStorageGB).toBeDefined();
      expect(typeof result.storage.usagePercentage).toBe('number');
      expect(['healthy', 'caution', 'warning']).toContain(result.storage.status);
    });
  });
});
