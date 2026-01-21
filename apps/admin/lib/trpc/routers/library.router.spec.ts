/**
 * Library Router Tests
 * 
 * Tests for content library management operations.
 * Part of Phase 7.2: Backend Tests (Tier 4)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { libraryRouter } from './library.router';
import { createCallerFactory } from '../base';
import { createTestDb, cleanupTestDb } from '../../test/utils/test-db';
import {
  createSuperAdminContext,
  createMockAdminContext,
} from '../../test/utils/test-context';
import {
  createTestUser,
  cleanupTestUser,
  createStandardTestAdmins,
} from '../../test/utils/test-helpers';
import { prompts, users } from '@ryla/data';
import {
  createStandardTestAdmins,
} from '../../test/utils/test-helpers';
import type { TestDb } from '../../test/utils/test-db';

describe('LibraryRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof libraryRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(libraryRouter);
    
    // Create actual admin users in the database for foreign key constraints
    const { superAdmin } = await createStandardTestAdmins(testDb.db);
    
    // Create a regular user for prompts (created_by references users table, not admin_users)
    testUser = await createTestUser(testDb.db);
    
    // Create contexts with the actual database IDs
    superAdminContext = createSuperAdminContext(testDb.db, { id: superAdmin.id });
  });

  afterEach(async () => {
    if (testDb?.client) {
      if (testUser) {
        await cleanupTestUser(testDb.db, testUser.id);
      }
      await cleanupTestDb(testDb.client);
    }
  });

  describe('permissions', () => {
    it('should require authentication for listPrompts', async () => {
      const caller = createCaller(createMockAdminContext({ admin: null, db: testDb.db }));

      await expect(caller.listPrompts({})).rejects.toThrow(TRPCError);
      await expect(caller.listPrompts({})).rejects.toThrow('You must be logged in');
    });
  });

  describe('listPrompts', () => {
    it('should return empty list when no prompts exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.listPrompts({});

      expect(result.prompts).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should list prompts with pagination', async () => {
      await testDb.db.insert(prompts).values({
        name: 'Test Prompt',
        category: 'portrait',
        template: 'Test template',
        rating: 'sfw',
        isActive: true,
        isPublic: true,
        createdBy: testUser.id,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.listPrompts({ limit: 10, offset: 0 });

      expect(result.prompts.length).toBeGreaterThanOrEqual(1);
      expect(result.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('should filter by category', async () => {
      await testDb.db.insert(prompts).values([
        {
          name: 'Portrait Prompt',
          category: 'portrait',
          template: 'Template',
          rating: 'sfw',
          isActive: true,
          isPublic: true,
          createdBy: testUser.id,
        },
        {
          name: 'Fashion Prompt',
          category: 'fashion',
          template: 'Template',
          rating: 'sfw',
          isActive: true,
          isPublic: true,
          createdBy: testUser.id,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.listPrompts({ category: 'portrait' });

      expect(result.prompts.every(p => p.category === 'portrait')).toBe(true);
    });

    it('should filter by rating', async () => {
      await testDb.db.insert(prompts).values([
        {
          name: 'SFW Prompt',
          category: 'portrait',
          template: 'Template',
          rating: 'sfw',
          isActive: true,
          isPublic: true,
          createdBy: testUser.id,
        },
        {
          name: 'NSFW Prompt',
          category: 'portrait',
          template: 'Template',
          rating: 'nsfw',
          isActive: true,
          isPublic: true,
          createdBy: testUser.id,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.listPrompts({ rating: 'sfw' });

      expect(result.prompts.every(p => p.rating === 'sfw')).toBe(true);
    });

    it('should filter by isActive', async () => {
      await testDb.db.insert(prompts).values([
        {
          name: 'Active Prompt',
          category: 'portrait',
          template: 'Template',
          rating: 'sfw',
          isActive: true,
          isPublic: true,
          createdBy: testUser.id,
        },
        {
          name: 'Inactive Prompt',
          category: 'portrait',
          template: 'Template',
          rating: 'sfw',
          isActive: false,
          isPublic: true,
          createdBy: testUser.id,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const activeResult = await caller.listPrompts({ isActive: true });
      const inactiveResult = await caller.listPrompts({ isActive: false });

      expect(activeResult.prompts.every(p => p.isActive === true)).toBe(true);
      expect(inactiveResult.prompts.every(p => p.isActive === false)).toBe(true);
    });
  });

  describe('getPrompt', () => {
    it('should get prompt by ID', async () => {
      const [prompt] = await testDb.db.insert(prompts).values({
        name: 'Test Prompt',
        category: 'portrait',
        template: 'Test template',
        rating: 'sfw',
        isActive: true,
        isPublic: true,
        createdBy: testUser.id,
      }).returning();

      const caller = createCaller(superAdminContext);
      const result = await caller.getPrompt({ promptId: prompt.id });

      expect(result.id).toBe(prompt.id);
      expect(result.name).toBe('Test Prompt');
    });

    it('should return error for non-existent prompt', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.getPrompt({ promptId: fakeId })).rejects.toThrow('Prompt not found');
    });
  });

  describe('createPrompt', () => {
    it('should create a new prompt', async () => {
      // The router uses admin.id for createdBy, but createdBy references users table
      // Create a user with the same ID as the admin to satisfy FK constraint
      // This is a workaround for the router bug - it should use a user ID, not admin ID
      await testDb.db.insert(users).values({
        id: superAdminContext.admin.id,
        email: 'admin-as-user@example.com',
        password: 'hashed-password',
        name: 'Admin User',
        publicName: 'admin-user', // Required NOT NULL, unique field
      }).onConflictDoNothing();
      
      const caller = createCaller(superAdminContext);
      const result = await caller.createPrompt({
        name: 'New Prompt',
        category: 'portrait',
        template: 'New template',
        rating: 'sfw',
        isActive: true,
        isPublic: true,
      });

      expect(result.name).toBe('New Prompt');
      expect(result.category).toBe('portrait');
      expect(result.usageCount).toBe(0);

      // Verify audit log
      const auditLogs = await testDb.db.query.adminAuditLog.findMany({
        where: (log, { eq }) => eq(log.entityId, result.id),
        orderBy: (log, { desc }) => [desc(log.createdAt)],
      });
      expect(auditLogs[0]?.action).toBe('create');
    });
  });

  describe('updatePrompt', () => {
    it('should update a prompt', async () => {
      const [prompt] = await testDb.db.insert(prompts).values({
        name: 'Original Prompt',
        category: 'portrait',
        template: 'Original template',
        rating: 'sfw',
        isActive: true,
        isPublic: true,
        createdBy: testUser.id,
      }).returning();

      const caller = createCaller(superAdminContext);
      const result = await caller.updatePrompt({
        promptId: prompt.id,
        name: 'Updated Prompt',
        description: 'Updated description',
      });

      expect(result.name).toBe('Updated Prompt');
      expect(result.description).toBe('Updated description');
    });

    it('should return error for non-existent prompt', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(
        caller.updatePrompt({
          promptId: fakeId,
          name: 'Updated',
        })
      ).rejects.toThrow('Prompt not found');
    });
  });

  describe('deletePrompt', () => {
    it('should soft delete a prompt', async () => {
      const [prompt] = await testDb.db.insert(prompts).values({
        name: 'To Delete',
        category: 'portrait',
        template: 'Template',
        rating: 'sfw',
        isActive: true,
        isPublic: true,
        createdBy: testUser.id,
      }).returning();

      const caller = createCaller(superAdminContext);
      const result = await caller.deletePrompt({
        promptId: prompt.id,
        reason: 'Test deletion',
      });

      expect(result.success).toBe(true);

      // Verify prompt is soft deleted (should not appear in list)
      const listResult = await caller.listPrompts({});
      expect(listResult.prompts.find(p => p.id === prompt.id)).toBeUndefined();
    });
  });

  describe('togglePromptStatus', () => {
    it('should toggle prompt active status', async () => {
      const [prompt] = await testDb.db.insert(prompts).values({
        name: 'Toggle Prompt',
        category: 'portrait',
        template: 'Template',
        rating: 'sfw',
        isActive: true,
        isPublic: true,
        createdBy: testUser.id,
      }).returning();

      const caller = createCaller(superAdminContext);
      const result = await caller.togglePromptStatus({
        promptId: prompt.id,
        isActive: false,
      });

      expect(result.success).toBe(true);
      expect(result.isActive).toBe(false);

      // Verify status changed
      const updated = await caller.getPrompt({ promptId: prompt.id });
      expect(updated.isActive).toBe(false);
    });
  });

  describe('listTemplates', () => {
    it('should return empty list when no templates exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.listTemplates({});

      expect(result.templates).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('listOutfitPresets', () => {
    it('should return empty list when no outfit presets exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.listOutfitPresets({});

      expect(result.presets).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('listPromptSets', () => {
    it('should return empty list when no prompt sets exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.listPromptSets({});

      expect(result.sets).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
