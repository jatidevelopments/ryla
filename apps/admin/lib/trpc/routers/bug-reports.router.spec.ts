/**
 * Bug Reports Router Tests
 * 
 * Tests for bug report management operations.
 * Part of Phase 7.2: Backend Tests (Tier 2)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { bugReportsRouter } from './bug-reports.router';
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
  createTestAdminUser,
} from '../../test/utils/test-helpers';
import { bugReports } from '@ryla/data';
import type { TestDb } from '../../test/utils/test-db';

describe('BugReportsRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof bugReportsRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;
  let supportContext: ReturnType<typeof createRoleContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(bugReportsRouter);
    
    // Create actual admin users in the database for foreign key constraints
    const { superAdmin } = await createStandardTestAdmins(testDb.db);
    const support = await createTestAdminUser(testDb.db, {
      email: 'support@example.com',
      role: 'support',
      permissions: ['bugs:read', 'bugs:write'],
    });
    
    // Create contexts with the actual database IDs
    superAdminContext = createSuperAdminContext(testDb.db, { id: superAdmin.id });
    supportContext = createRoleContext('support', testDb.db, ['bugs:read', 'bugs:write'], { id: support.id });
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
    it('should return empty list when no bug reports exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      expect(result.reports).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should list bug reports with pagination', async () => {
      const user = await createTestUser(testDb.db);
      const reportId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(bugReports).values({
        id: reportId,
        userId: user.id,
        email: user.email,
        description: 'Test bug report',
        status: 'open',
        browserMetadata: {}, // Required NOT NULL field
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ limit: 10, offset: 0 });

      expect(result.reports.length).toBeGreaterThanOrEqual(1);
      expect(result.pagination.total).toBeGreaterThanOrEqual(1);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by status', async () => {
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(bugReports).values([
        {
          id: '00000000-0000-0000-0000-000000000001',
          userId: user.id,
          email: user.email,
          description: 'Open bug',
          status: 'open',
          browserMetadata: {}, // Required NOT NULL field
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          userId: user.id,
          email: user.email,
          description: 'Resolved bug',
          status: 'resolved',
          browserMetadata: {}, // Required NOT NULL field
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ status: 'open' });

      expect(result.reports.every(r => r.status === 'open')).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by userId', async () => {
      const user1 = await createTestUser(testDb.db);
      const user2 = await createTestUser(testDb.db);

      await testDb.db.insert(bugReports).values([
        {
          id: '00000000-0000-0000-0000-000000000001',
          userId: user1.id,
          email: user1.email,
          description: 'User1 bug',
          status: 'open',
          browserMetadata: {}, // Required NOT NULL field
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          userId: user2.id,
          email: user2.email,
          description: 'User2 bug',
          status: 'open',
          browserMetadata: {}, // Required NOT NULL field
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ userId: user1.id });

      expect(result.reports.every(r => r.userId === user1.id)).toBe(true);

      await cleanupTestUser(testDb.db, user1.id);
      await cleanupTestUser(testDb.db, user2.id);
    });

    it('should search by description or email', async () => {
      const user = await createTestUser(testDb.db, { email: 'search-test@example.com' });

      await testDb.db.insert(bugReports).values({
        id: '00000000-0000-0000-0000-000000000001',
        userId: user.id,
        email: user.email,
        description: 'Unique search term bug',
        status: 'open',
        browserMetadata: {}, // Required NOT NULL field
      });

      const caller = createCaller(superAdminContext);
      const descResult = await caller.list({ search: 'Unique search' });
      const emailResult = await caller.list({ search: 'search-test' });

      expect(descResult.reports.length).toBeGreaterThan(0);
      expect(emailResult.reports.length).toBeGreaterThan(0);

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('get', () => {
    it('should get bug report by ID', async () => {
      const user = await createTestUser(testDb.db);
      const reportId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(bugReports).values({
        id: reportId,
        userId: user.id,
        email: user.email,
        description: 'Test bug description',
        status: 'open',
        browserMetadata: {}, // Required NOT NULL field
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.get({ reportId });

      expect(result.id).toBe(reportId);
      expect(result.description).toBe('Test bug description');
      expect(result.status).toBe('open');
      expect(result).toHaveProperty('user');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent report', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.get({ reportId: fakeId })).rejects.toThrow('Bug report not found');
    });
  });

  describe('updateStatus', () => {
    it('should update bug report status', async () => {
      const user = await createTestUser(testDb.db);
      const reportId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(bugReports).values({
        id: reportId,
        userId: user.id,
        email: user.email,
        description: 'Test bug',
        status: 'open',
        browserMetadata: {}, // Required NOT NULL field
      });

      // Use the context from beforeEach which has the admin user in the database
      const caller = createCaller(superAdminContext);

      const result = await caller.updateStatus({
        reportId,
        status: 'in_progress',
        note: 'Working on it',
      });

      expect(result.success).toBe(true);

      // Verify status updated
      const updated = await caller.get({ reportId });
      expect(updated.status).toBe('in_progress');

      // Verify audit log
      const auditLogs = await testDb.db.query.adminAuditLog.findMany({
        where: (log, { eq }) => eq(log.entityId, reportId),
        orderBy: (log, { desc }) => [desc(log.createdAt)],
      });
      expect(auditLogs[0]?.action).toBe('bug_report_status_changed');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent report', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(
        caller.updateStatus({
          reportId: fakeId,
          status: 'resolved',
        })
      ).rejects.toThrow('Bug report not found');
    });
  });

  describe('addNote', () => {
    it('should add note to bug report', async () => {
      const user = await createTestUser(testDb.db);
      const reportId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(bugReports).values({
        id: reportId,
        userId: user.id,
        email: user.email,
        description: 'Test bug',
        status: 'open',
        browserMetadata: {}, // Required NOT NULL field
      });

      // Use the context from beforeEach which has the admin user in the database
      const caller = createCaller(superAdminContext);

      const result = await caller.addNote({
        reportId,
        note: 'This is a test note',
      });

      expect(result.success).toBe(true);

      // Verify note was added (via getNotes)
      const notes = await caller.getNotes({ reportId });
      expect(notes.length).toBeGreaterThan(0);
      expect(notes[0]?.note).toBe('This is a test note');

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getNotes', () => {
    it('should get notes for bug report', async () => {
      const user = await createTestUser(testDb.db);
      const reportId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(bugReports).values({
        id: reportId,
        userId: user.id,
        email: user.email,
        description: 'Test bug',
        status: 'open',
        browserMetadata: {}, // Required NOT NULL field
      });

      const caller = createCaller(superAdminContext);
      const notes = await caller.getNotes({ reportId });

      expect(Array.isArray(notes)).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getStats', () => {
    it('should get bug report statistics', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getStats();

      expect(result).toHaveProperty('openCount');
      expect(result).toHaveProperty('statusCounts');
      expect(result).toHaveProperty('thisWeek');
      expect(result).toHaveProperty('lastWeek');
      expect(result).toHaveProperty('change');
      expect(Array.isArray(result.statusCounts)).toBe(true);
    });
  });
});
