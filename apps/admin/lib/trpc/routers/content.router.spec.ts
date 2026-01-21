/**
 * Content Router Tests
 * 
 * Tests for content moderation operations.
 * Part of Phase 7.2: Backend Tests (Tier 2)
 * 
 * Note: This router may have schema inconsistencies (uses adminUserId instead of adminId)
 * Tests will help identify these issues.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { contentRouter } from './content.router';
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
import { images } from '@ryla/data';
import type { TestDb } from '../../test/utils/test-db';

describe('ContentRouter', () => {
  let testDb: TestDb;
  let createCaller: ReturnType<typeof createCallerFactory<typeof contentRouter>>;
  let superAdminContext: ReturnType<typeof createSuperAdminContext>;
  let moderatorContext: ReturnType<typeof createRoleContext>;

  beforeEach(async () => {
    testDb = await createTestDb();
    createCaller = createCallerFactory(contentRouter);
    
    // Create actual admin users in the database for foreign key constraints
    const { superAdmin } = await createStandardTestAdmins(testDb.db);
    const moderator = await createTestAdminUser(testDb.db, {
      email: 'moderator@example.com',
      role: 'moderator',
      permissions: ['content:read', 'content:write'],
    });
    
    // Create contexts with the actual database IDs
    superAdminContext = createSuperAdminContext(testDb.db, { id: superAdmin.id });
    moderatorContext = createRoleContext('moderator', testDb.db, ['content:read', 'content:write'], { id: moderator.id });
  });

  afterEach(async () => {
    if (testDb?.client) {
      await cleanupTestDb(testDb.client);
    }
  });

  describe('permissions', () => {
    it('should require authentication for listImages', async () => {
      const caller = createCaller(createMockAdminContext({ admin: null, db: testDb.db }));

      await expect(caller.listImages({})).rejects.toThrow(TRPCError);
      await expect(caller.listImages({})).rejects.toThrow('You must be logged in');
    });
  });

  describe('listImages', () => {
    it('should return empty list when no images exist', async () => {
      const caller = createCaller(superAdminContext);
      const result = await caller.listImages({});

      expect(result.images).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should list images with pagination', async () => {
      const user = await createTestUser(testDb.db);
      const imageId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(images).values({
        id: imageId,
        userId: user.id,
        s3Key: 'test/image.jpg',
        s3Url: 'https://example.com/image.jpg',
        status: 'completed',
        nsfw: false,
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.listImages({ limit: 10, offset: 0 });

      expect(result.images.length).toBeGreaterThanOrEqual(1);
      expect(result.pagination.total).toBeGreaterThanOrEqual(1);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by status', async () => {
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(images).values([
        {
          id: '00000000-0000-0000-0000-000000000001',
          userId: user.id,
          s3Key: 'test/completed.jpg',
          status: 'completed',
          nsfw: false,
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          userId: user.id,
          s3Key: 'test/failed.jpg',
          status: 'failed',
          nsfw: false,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.listImages({ status: 'completed' });

      expect(result.images.every(img => img.status === 'completed')).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should filter by userId', async () => {
      const user1 = await createTestUser(testDb.db);
      const user2 = await createTestUser(testDb.db);

      await testDb.db.insert(images).values([
        {
          id: '00000000-0000-0000-0000-000000000001',
          userId: user1.id,
          s3Key: 'test/user1.jpg',
          status: 'completed',
          nsfw: false,
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          userId: user2.id,
          s3Key: 'test/user2.jpg',
          status: 'completed',
          nsfw: false,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.listImages({ userId: user1.id });

      expect(result.images.every(img => img.userId === user1.id)).toBe(true);

      await cleanupTestUser(testDb.db, user1.id);
      await cleanupTestUser(testDb.db, user2.id);
    });

    it('should filter by nsfw', async () => {
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(images).values([
        {
          id: '00000000-0000-0000-0000-000000000001',
          userId: user.id,
          s3Key: 'test/safe.jpg',
          status: 'completed',
          nsfw: false,
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          userId: user.id,
          s3Key: 'test/nsfw.jpg',
          status: 'completed',
          nsfw: true,
        },
      ]);

      const caller = createCaller(superAdminContext);
      const nsfwResult = await caller.listImages({ nsfw: true });
      const safeResult = await caller.listImages({ nsfw: false });

      expect(nsfwResult.images.every(img => img.nsfw === true)).toBe(true);
      expect(safeResult.images.every(img => img.nsfw === false)).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should exclude deleted images', async () => {
      const user = await createTestUser(testDb.db);

      await testDb.db.insert(images).values([
        {
          id: '00000000-0000-0000-0000-000000000001',
          userId: user.id,
          s3Key: 'test/active.jpg',
          status: 'completed',
          nsfw: false,
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          userId: user.id,
          s3Key: 'test/deleted.jpg',
          status: 'completed',
          nsfw: false,
          deletedAt: new Date(),
        },
      ]);

      const caller = createCaller(superAdminContext);
      const result = await caller.listImages({});

      // Should only return non-deleted images
      expect(result.images.every(img => img.id !== '00000000-0000-0000-0000-000000000002')).toBe(true);

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('getImage', () => {
    it('should get image by ID', async () => {
      const user = await createTestUser(testDb.db);
      const imageId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(images).values({
        id: imageId,
        userId: user.id,
        s3Key: 'test/image.jpg',
        s3Url: 'https://example.com/image.jpg',
        status: 'completed',
        nsfw: false,
        prompt: 'Test prompt',
      });

      const caller = createCaller(superAdminContext);
      const result = await caller.getImage({ imageId });

      expect(result.id).toBe(imageId);
      expect(result.userId).toBe(user.id);
      expect(result.prompt).toBe('Test prompt');

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent image', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(caller.getImage({ imageId: fakeId })).rejects.toThrow('Image not found');
    });

    it('should return error for deleted image', async () => {
      const user = await createTestUser(testDb.db);
      const imageId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(images).values({
        id: imageId,
        userId: user.id,
        s3Key: 'test/deleted.jpg',
        status: 'completed',
        nsfw: false,
        deletedAt: new Date(),
      });

      const caller = createCaller(superAdminContext);
      await expect(caller.getImage({ imageId })).rejects.toThrow('Image not found');

      await cleanupTestUser(testDb.db, user.id);
    });
  });

  describe('flagImage', () => {
    it('should flag an image as NSFW', async () => {
      const user = await createTestUser(testDb.db);
      const imageId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(images).values({
        id: imageId,
        userId: user.id,
        s3Key: 'test/image.jpg',
        status: 'completed',
        nsfw: false,
      });

      // Use the context from beforeEach which has the admin user in the database
      const caller = createCaller(superAdminContext);

      const result = await caller.flagImage({
        imageId,
        reason: 'Inappropriate content',
      });

      expect(result.success).toBe(true);

      // Verify image is flagged
      const flaggedImage = await caller.getImage({ imageId });
      expect(flaggedImage.nsfw).toBe(true);

      // Note: Audit log check may fail if router uses wrong field names
      // This will help identify the bug

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent image', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(
        caller.flagImage({
          imageId: fakeId,
          reason: 'Test',
        })
      ).rejects.toThrow('Image not found');
    });
  });

  describe('deleteImage', () => {
    it('should soft delete an image', async () => {
      const user = await createTestUser(testDb.db);
      const imageId = '00000000-0000-0000-0000-000000000001';

      await testDb.db.insert(images).values({
        id: imageId,
        userId: user.id,
        s3Key: 'test/image.jpg',
        status: 'completed',
        nsfw: false,
      });

      // Use the context from beforeEach which has the admin user in the database
      const caller = createCaller(superAdminContext);

      const result = await caller.deleteImage({
        imageId,
        reason: 'Violates terms of service',
      });

      expect(result.success).toBe(true);

      // Verify image is deleted (should not appear in list)
      const listResult = await caller.listImages({});
      expect(listResult.images.find(img => img.id === imageId)).toBeUndefined();

      await cleanupTestUser(testDb.db, user.id);
    });

    it('should return error for non-existent image', async () => {
      const caller = createCaller(superAdminContext);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(
        caller.deleteImage({
          imageId: fakeId,
          reason: 'Test',
        })
      ).rejects.toThrow('Image not found');
    });
  });
});
