/**
 * LoRA Router Tests
 * 
 * Tests for LoRA model management operations.
 * Part of Phase 7.2: Backend Tests (Tier 4)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { loraRouter } from './lora.router';
import { createCallerFactory } from '../base';
import { createTestDb, cleanupTestDb } from '../../test/utils/test-db';
import {
  createSuperAdminContext,
  createMockAdminContext,
} from '../../test/utils/test-context';
import {
  createTestUser,
  cleanupTestUser,
  createTestCharacter,
  cleanupTestCharacter,
} from '../../test/utils/test-helpers';
import { loraModels } from '@ryla/data';
import {
  createStandardTestAdmins,
} from '../../test/utils/test-helpers';
import type { TestDb } from '../../test/utils/test-db';

describe('LoraRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof loraRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(loraRouter);
    
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
    it('should require authentication for list', async () => {
      const caller = createCaller(createMockAdminContext({ admin: null, db: testDb.db }));

      await expect(caller.list({})).rejects.toThrow(TRPCError);
      await expect(caller.list({})).rejects.toThrow('You must be logged in');
    });
  });

  describe('list', () => {
    it('should return empty list when no LoRA models exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.list({});

      expect(result.models).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should list LoRA models with pagination', async () => {
      const user = await createTestUser(testDb.db);
      const character = await createTestCharacter(testDb.db, user.id);
      await testDb.db.insert(loraModels).values({
        characterId: character.id,
        userId: user.id,
        type: 'face',
        status: 'ready',
        triggerWord: 'test-trigger',
        baseModel: 'test-model',
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ limit: 10, offset: 0 });

      expect(result.models.length).toBeGreaterThanOrEqual(1);
      expect(result.pagination.total).toBeGreaterThanOrEqual(1);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by status', async () => {
      const user = await createTestUser(testDb.db);
      const character = await createTestCharacter(testDb.db, user.id);
      await testDb.db.insert(loraModels).values([
        {
          characterId: character.id,
          userId: user.id,
          type: 'face',
          status: 'ready',
          triggerWord: 'ready-trigger',
        },
        {
          characterId: character.id,
          userId: user.id,
          type: 'face',
          status: 'failed',
          triggerWord: 'failed-trigger',
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ status: 'ready' });

      expect(result.models.every(m => m.status === 'ready')).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by type', async () => {
      const user = await createTestUser(testDb.db);
      const character = await createTestCharacter(testDb.db, user.id);
      await testDb.db.insert(loraModels).values([
        {
          characterId: character.id,
          userId: user.id,
          type: 'face',
          status: 'ready',
          triggerWord: 'face-trigger',
        },
        {
          characterId: character.id,
          userId: user.id,
          type: 'style',
          status: 'ready',
          triggerWord: 'style-trigger',
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ type: 'face' });

      expect(result.models.every(m => m.type === 'face')).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by userId', async () => {
      const user1 = await createTestUser(testDb.db);
      const user2 = await createTestUser(testDb.db);
      const character1 = await createTestCharacter(testDb.db, user1.id);
      const character2 = await createTestCharacter(testDb.db, user2.id);

      await testDb.db.insert(loraModels).values([
        {
          characterId: character1.id,
          userId: user1.id,
          type: 'face',
          status: 'ready',
          triggerWord: 'user1-trigger',
        },
        {
          characterId: character2.id,
          userId: user2.id,
          type: 'face',
          status: 'ready',
          triggerWord: 'user2-trigger',
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.list({ userId: user1.id });

      expect(result.models.every(m => m.userId === user1.id)).toBe(true);

      await cleanupTestUser(testDb.db, user1.id);
      await cleanupTestUser(testDb.db, user2.id);
    });
  });

  describe('get', () => {
    it('should get LoRA model by ID', async () => {
      const user = await createTestUser(testDb.db);
      const character = await createTestCharacter(testDb.db, user.id);
      const [model] = await testDb.db.insert(loraModels).values({
        characterId: character.id,
        userId: user.id,
        type: 'face',
        status: 'ready',
        triggerWord: 'test-trigger',
        baseModel: 'test-model',
      }).returning();

      const caller = createCaller(superAdminContext);
      const result = await caller.get({ modelId: model.id });

      expect(result.id).toBe(model.id);
      expect(result.type).toBe('face');
      expect(result.status).toBe('ready');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('character');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent model', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.get({ modelId: fakeId })).rejects.toThrow(TRPCError);
      await expect(caller.get({ modelId: fakeId })).rejects.toThrow('LoRA model not found');
    });
  });

  describe('getStats', () => {
    it('should get LoRA model statistics', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.getStats();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('pending');
      expect(result).toHaveProperty('training');
      expect(result).toHaveProperty('ready');
      expect(result).toHaveProperty('failed');
      expect(result).toHaveProperty('expired');
      expect(result).toHaveProperty('totalCost');
      expect(typeof result.total).toBe('number');
      expect(typeof result.pending).toBe('number');
      expect(typeof result.training).toBe('number');
      expect(typeof result.ready).toBe('number');
      expect(typeof result.failed).toBe('number');
      expect(typeof result.expired).toBe('number');
      expect(typeof result.totalCost).toBe('number');
    });
  });

  describe('retry', () => {
    it('should retry a failed LoRA training', async () => {
      const user = await createTestUser(testDb.db);
      const character = await createTestCharacter(testDb.db, user.id);
      const [model] = await testDb.db.insert(loraModels).values({
        characterId: character.id,
        userId: user.id,
        type: 'face',
        status: 'failed',
        triggerWord: 'failed-trigger',
        errorMessage: 'Test error',
      }).returning();

      const caller = createCaller(superAdminContext);
      const result = await caller.retry({ modelId: model.id });

      expect(result.success).toBe(true);
      expect(result.model.status).toBe('pending');
      expect(result.model.errorMessage).toBeNull();
      expect(result.model.retryCount).toBeGreaterThan(0);

      // Verify audit log
      const auditLogs = await testDb.db.query.adminAuditLog.findMany({
        where: (log, { eq }) => eq(log.entityId, model.id),
        orderBy: (log, { desc }) => [desc(log.createdAt)],
      });
      expect(auditLogs[0]?.action).toBe('update');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should reject retrying non-failed model', async () => {
      const user = await createTestUser(testDb.db);
      const character = await createTestCharacter(testDb.db, user.id);
      const [model] = await testDb.db.insert(loraModels).values({
        characterId: character.id,
        userId: user.id,
        type: 'face',
        status: 'ready',
        triggerWord: 'ready-trigger',
      }).returning();

      const caller = createCaller(superAdminContext);
      await expect(caller.retry({ modelId: model.id })).rejects.toThrow(TRPCError);
      await expect(caller.retry({ modelId: model.id })).rejects.toThrow('Only failed models can be retried');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent model', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.retry({ modelId: fakeId })).rejects.toThrow(TRPCError);
      await expect(caller.retry({ modelId: fakeId })).rejects.toThrow('LoRA model not found');
    });
  });

  describe('delete', () => {
    it('should mark LoRA model as expired', async () => {
      const user = await createTestUser(testDb.db);
      const character = await createTestCharacter(testDb.db, user.id);
      const [model] = await testDb.db.insert(loraModels).values({
        characterId: character.id,
        userId: user.id,
        type: 'face',
        status: 'ready',
        triggerWord: 'to-delete-trigger',
      }).returning();

      const caller = createCaller(superAdminContext);
      const result = await caller.delete({
        modelId: model.id,
        reason: 'Test deletion',
      });

      expect(result.success).toBe(true);

      // Verify model is marked as expired
      const deleted = await caller.get({ modelId: model.id });
      expect(deleted.status).toBe('expired');

      // Verify audit log
      const auditLogs = await testDb.db.query.adminAuditLog.findMany({
        where: (log, { eq }) => eq(log.entityId, model.id),
        orderBy: (log, { desc }) => [desc(log.createdAt)],
      });
      expect(auditLogs[0]?.action).toBe('delete');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent model', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.delete({ modelId: fakeId })).rejects.toThrow(TRPCError);
      await expect(caller.delete({ modelId: fakeId })).rejects.toThrow('LoRA model not found');
    });
  });
});
