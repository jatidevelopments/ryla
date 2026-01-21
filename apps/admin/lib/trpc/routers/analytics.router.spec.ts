/**
 * Analytics Router Tests
 * 
 * Tests for user analytics and platform metrics.
 * Part of Phase 7.2: Backend Tests (Tier 3)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { analyticsRouter } from './analytics.router';
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

describe('AnalyticsRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof analyticsRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(analyticsRouter);
    
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
    it('should require authentication for getMetrics', async () => {
      const caller = createCaller(createMockAdminContext({ admin: null, db: testDb.db }));

      await expect(caller.getMetrics({ timeRange: '7d' })).rejects.toThrow(TRPCError);
      await expect(caller.getMetrics({ timeRange: '7d' })).rejects.toThrow('You must be logged in');
    });
  });

  describe('getMetrics', () => {
    it('should return analytics metrics for 7d', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getMetrics({ timeRange: '7d' });

      expect(result).toHaveProperty('dau');
      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('newUsers');
      expect(result).toHaveProperty('usersChange');
      expect(result).toHaveProperty('imagesGenerated');
      expect(result).toHaveProperty('totalImages');
      expect(result).toHaveProperty('imagesChange');
      expect(result).toHaveProperty('monthlyRevenue');
      expect(result).toHaveProperty('creditsSpent');
      expect(typeof result.dau).toBe('number');
      expect(typeof result.totalUsers).toBe('number');
      expect(typeof result.newUsers).toBe('number');
    });

    it('should return metrics for different time ranges', async () => {
      const caller = createCaller(superAdminContext);

      const dayResult = await caller.getMetrics({ timeRange: '1d' });
      const weekResult = await caller.getMetrics({ timeRange: '7d' });
      const monthResult = await caller.getMetrics({ timeRange: '30d' });
      const quarterResult = await caller.getMetrics({ timeRange: '90d' });

      expect(dayResult).toHaveProperty('dau');
      expect(weekResult).toHaveProperty('dau');
      expect(monthResult).toHaveProperty('dau');
      expect(quarterResult).toHaveProperty('dau');
    });
  });

  describe('getTimeSeries', () => {
    it('should return time-series data for 7d', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getTimeSeries({ timeRange: '7d' });

      expect(result).toHaveProperty('images');
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('revenue');
      expect(Array.isArray(result.images)).toBe(true);
      expect(Array.isArray(result.users)).toBe(true);
      expect(Array.isArray(result.revenue)).toBe(true);
    });

    it('should return time-series data for different time ranges', async () => {
      const caller = createCaller(superAdminContext);

      const dayResult = await caller.getTimeSeries({ timeRange: '1d' });
      const weekResult = await caller.getTimeSeries({ timeRange: '7d' });
      const monthResult = await caller.getTimeSeries({ timeRange: '30d' });

      expect(dayResult).toHaveProperty('images');
      expect(weekResult).toHaveProperty('images');
      expect(monthResult).toHaveProperty('images');
    });
  });

  describe('getTopUsers', () => {
    it('should return top users by images', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getTopUsers({
        limit: 10,
        timeRange: '7d',
        metric: 'images',
      });

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('userId');
        expect(result[0]).toHaveProperty('email');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('images');
      }
    });

    it('should return top users by credits', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getTopUsers({
        limit: 10,
        timeRange: '7d',
        metric: 'credits',
      });

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('credits');
      }
    });

    it('should return top users by revenue', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getTopUsers({
        limit: 10,
        timeRange: '7d',
        metric: 'revenue',
      });

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('revenue');
      }
    });

    it('should respect limit parameter', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getTopUsers({
        limit: 5,
        timeRange: 'all',
        metric: 'images',
      });

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });
});
