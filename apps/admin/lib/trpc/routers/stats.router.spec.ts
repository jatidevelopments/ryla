/**
 * Stats Router Tests
 * 
 * Tests for dashboard statistics.
 * Part of Phase 7.2: Backend Tests (Tier 3)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { statsRouter } from './stats.router';
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

describe('StatsRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof statsRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(statsRouter);
    
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
    it('should require authentication for getDashboardStats', async () => {
      const caller = createCaller(createMockAdminContext({ admin: null, db: testDb.db }));

      await expect(caller.getDashboardStats()).rejects.toThrow(TRPCError);
      await expect(caller.getDashboardStats()).rejects.toThrow('You must be logged in');
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getDashboardStats();

      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('usersChange');
      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('revenueChange');
      expect(result).toHaveProperty('openBugs');
      expect(result).toHaveProperty('bugsChange');
      expect(result).toHaveProperty('imagesGenerated');
      expect(result).toHaveProperty('imagesChange');
      expect(typeof result.totalUsers).toBe('number');
      expect(typeof result.openBugs).toBe('number');
      expect(typeof result.imagesGenerated).toBe('number');
    });

    it('should calculate recent users correctly', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getDashboardStats();

      // Recent users should be a number
      expect(typeof result.usersChange).toBe('number');
    });
  });
});
