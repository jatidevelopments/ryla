/**
 * Jobs Router Tests
 * 
 * Tests for generation job monitoring operations.
 * Part of Phase 7.2: Backend Tests (Tier 2)
 * 
 * Note: This router may have schema inconsistencies (uses adminUserId instead of adminId)
 * Tests will help identify these issues.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { jobsRouter } from './jobs.router';
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
import { generationJobs } from '@ryla/data';
import type { TestDb } from '../../test/utils/test-db';

describe('JobsRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof jobsRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;
  let adminContext: ReturnType<typeof createRoleContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(jobsRouter);
    
    // Create actual admin users in the database for foreign key constraints
    const { superAdmin, admin } = await createStandardTestAdmins(testDb.db);
    
    // Create contexts with the actual database IDs
    superAdminContext = createSuperAdminContext(testDb.db, { id: superAdmin.id });
    adminContext = createRoleContext('admin', testDb.db, ['users:read'], { id: admin.id });
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
    it('should return empty list when no jobs exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      expect(result.jobs).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should list jobs with pagination', async () => {
      const user = await createTestUser(testDb.db);
      const jobId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(generationJobs).values({
        id: jobId,
        userId: user.id,
        type: 'image_generation',
        status: 'completed',
        creditsUsed: 10,
        input: {}, // Required NOT NULL field
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ limit: 10, offset: 0 });

      expect(result.jobs.length).toBeGreaterThanOrEqual(1);
      expect(result.pagination.total).toBeGreaterThanOrEqual(1);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by status', async () => {
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(generationJobs).values([
        {
          id: '00000000-0000-0000-0000-000000000001',
          userId: user.id,
          type: 'image_generation',
          status: 'completed',
          input: {}, // Required NOT NULL field
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          userId: user.id,
          type: 'image_generation',
          status: 'failed',
          input: {}, // Required NOT NULL field
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ status: 'completed' });

      expect(result.jobs.every(job => job.status === 'completed')).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by type', async () => {
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(generationJobs).values([
        {
          id: '00000000-0000-0000-0000-000000000001',
          userId: user.id,
          type: 'image_generation',
          status: 'completed',
          input: {}, // Required NOT NULL field
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          userId: user.id,
          type: 'image_upscale',
          status: 'completed',
          input: {}, // Required NOT NULL field
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ type: 'image_generation' });

      expect(result.jobs.every(job => job.type === 'image_generation')).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by userId', async () => {
      const user1 = await createTestUser(testDb.db);
      const user2 = await createTestUser(testDb.db);

      await testDb.db.insert(generationJobs).values([
        {
          id: '00000000-0000-0000-0000-000000000001',
          userId: user1.id,
          type: 'image_generation',
          status: 'completed',
          input: {}, // Required NOT NULL field
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          userId: user2.id,
          type: 'image_generation',
          status: 'completed',
          input: {}, // Required NOT NULL field
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ userId: user1.id });

      expect(result.jobs.every(job => job.userId === user1.id)).toBe(true);

      await cleanupTestUser(testDb.db, user1.id);
      await cleanupTestUser(testDb.db, user2.id);
    });
  });

  describe('get', () => {
    it('should get job by ID', async () => {
      const user = await createTestUser(testDb.db);
      const jobId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(generationJobs).values({
        id: jobId,
        userId: user.id,
        type: 'image_generation',
        status: 'completed',
        creditsUsed: 10,
        input: {}, // Required NOT NULL field
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.get({ jobId });

      expect(result.id).toBe(jobId);
      expect(result.userId).toBe(user.id);
      expect(result.type).toBe('image_generation');
      expect(result.status).toBe('completed');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent job', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.get({ jobId: fakeId })).rejects.toThrow('Job not found');
    });
  });

  describe('getStats', () => {
    it('should get job statistics for 24h period', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getStats({ timeRange: '24h' });

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('active');
      expect(result).toHaveProperty('completed');
      expect(result).toHaveProperty('failed');
      expect(result).toHaveProperty('totalCreditsUsed');
      expect(result).toHaveProperty('statusCounts');
      expect(Array.isArray(result.statusCounts)).toBe(true);
    });

    it('should get job statistics for different time ranges', async () => {
      const caller = createCaller(superAdminContext);

      const hourResult = await caller.getStats({ timeRange: '1h' });
      const weekResult = await caller.getStats({ timeRange: '7d' });
      const monthResult = await caller.getStats({ timeRange: '30d' });

      expect(hourResult).toHaveProperty('total');
      expect(weekResult).toHaveProperty('total');
      expect(monthResult).toHaveProperty('total');
    });
  });

  describe('retry', () => {
    it('should retry a failed job', async () => {
      const user = await createTestUser(testDb.db);
      const jobId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(generationJobs).values({
        id: jobId,
        userId: user.id,
        type: 'image_generation',
        status: 'failed',
        error: 'Test error',
        input: {}, // Required NOT NULL field
      });

      // Use the context from beforeEach which has the admin user in the database
      const caller = createCaller(superAdminContext);

      const result = await caller.retry({ jobId });

      expect(result.success).toBe(true);

      // Verify job status changed to queued
      const retriedJob = await caller.get({ jobId });
      expect(retriedJob.status).toBe('queued');
      expect(retriedJob.error).toBeNull();

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should reject retrying non-failed job', async () => {
      const user = await createTestUser(testDb.db);
      const jobId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(generationJobs).values({
        id: jobId,
        userId: user.id,
        type: 'image_generation',
        status: 'completed',
        input: {}, // Required NOT NULL field
      });

      const caller = createCaller(superAdminContext);
      await expect(caller.retry({ jobId })).rejects.toThrow('Only failed jobs can be retried');

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('cancel', () => {
    it('should cancel a queued job', async () => {
      const user = await createTestUser(testDb.db);
      const jobId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(generationJobs).values({
        id: jobId,
        userId: user.id,
        type: 'image_generation',
        status: 'queued',
        input: {}, // Required NOT NULL field
      });

      // Use the context from beforeEach which has the admin user in the database
      const caller = createCaller(superAdminContext);

      const result = await caller.cancel({ jobId, reason: 'Admin cancellation' });

      expect(result.success).toBe(true);

      // Verify job is cancelled
      const cancelledJob = await caller.get({ jobId });
      expect(cancelledJob.status).toBe('cancelled');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should reject cancelling completed job', async () => {
      const user = await createTestUser(testDb.db);
      const jobId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(generationJobs).values({
        id: jobId,
        userId: user.id,
        type: 'image_generation',
        status: 'completed',
        input: {}, // Required NOT NULL field
      });

      const caller = createCaller(superAdminContext);
      await expect(caller.cancel({ jobId })).rejects.toThrow('Job cannot be cancelled');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should reject cancelling already cancelled job', async () => {
      const user = await createTestUser(testDb.db);
      const jobId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(generationJobs).values({
        id: jobId,
        userId: user.id,
        type: 'image_generation',
        status: 'cancelled',
        input: {}, // Required NOT NULL field
      });

      const caller = createCaller(superAdminContext);
      await expect(caller.cancel({ jobId })).rejects.toThrow('Job cannot be cancelled');

      await cleanupTestUser(testDb.db, user.id);
    });
  });
});
