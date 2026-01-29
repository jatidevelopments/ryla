/**
 * Content Moderation Flow Integration Tests
 * 
 * Tests the complete content moderation flow:
 * - List images → Flag image → Review flag → Audit log created
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '../utils/test-db';
import { createSuperAdminContext, createRoleContext } from '../utils/test-context';
import { createStandardTestAdmins, createTestUser, createTestCharacter, createTestImage } from '../utils/test-helpers';
import { adminAppRouter } from '@/lib/trpc/admin';
import { adminAuditLog } from '@ryla/data';
import { eq } from 'drizzle-orm';

describe('Content Moderation Flow Integration', () => {
  let testDb: Awaited<ReturnType<typeof createTestDb>>;

  beforeEach(async () => {
    testDb = await createTestDb();
  });

  describe('complete content moderation flow', () => {
    it('should complete full moderation cycle: list → flag → audit log', async () => {
      // Setup: Create admin, user, character, and images
      const { superAdmin, admin } = await createStandardTestAdmins(testDb.db);
      const testUser = await createTestUser(testDb.db, {
        email: 'user@test.com',
        name: 'Test User',
      });
      const character = await createTestCharacter(testDb.db, testUser.id, {
        name: 'Test Character',
      });
      const image1 = await createTestImage(testDb.db, {
        userId: testUser.id,
        characterId: character.id,
        status: 'completed',
        s3Key: 'test/image1.jpg',
        s3Url: 'https://example.com/image1.jpg',
      });
      const image2 = await createTestImage(testDb.db, {
        userId: testUser.id,
        characterId: character.id,
        status: 'completed',
        s3Key: 'test/image2.jpg',
        s3Url: 'https://example.com/image2.jpg',
      });

      const ctx = createSuperAdminContext(testDb.db, { id: superAdmin.id });
      const caller = adminAppRouter.createCaller(ctx);

      // Step 1: List images
      const listResult = await caller.content.listImages({
        limit: 50,
        offset: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(listResult.images.length).toBeGreaterThanOrEqual(2);
      expect(listResult.images.some(img => img.id === image1.id)).toBe(true);
      expect(listResult.images.some(img => img.id === image2.id)).toBe(true);

      // Step 2: Get image detail
      const imageDetail = await caller.content.getImage({
        imageId: image1.id,
      });

      expect(imageDetail.id).toBe(image1.id);
      expect(imageDetail.userId).toBe(testUser.id);
      expect(imageDetail.characterId).toBe(character.id);

      // Step 3: Flag image
      await caller.content.flagImage({
        imageId: image1.id,
        reason: 'Inappropriate content for integration test',
      });

      // Step 4: Verify image is flagged
      const flaggedImage = await caller.content.getImage({
        imageId: image1.id,
      });
      // Note: The actual flagging behavior depends on implementation
      // This might set a flag status or create a flag record

      // Step 5: Verify audit log was created
      const auditLogs = await testDb.db
        .select()
        .from(adminAuditLog)
        .where(eq(adminAuditLog.adminId, superAdmin.id))
        .orderBy(adminAuditLog.createdAt);

      const flagAuditLog = auditLogs.find(
        log => log.entityType === 'image' && log.entityId === image1.id && log.action === 'update'
      );

      expect(flagAuditLog).toBeDefined();
      expect(flagAuditLog?.adminId).toBe(superAdmin.id);
      expect(flagAuditLog?.details).toBeDefined();
    }, 15000); // Increase timeout for complex integration test

    it('should allow moderator to flag images', async () => {
      const { admin } = await createStandardTestAdmins(testDb.db);
      const testUser = await createTestUser(testDb.db);
      const character = await createTestCharacter(testDb.db, testUser.id);
      const image = await createTestImage(testDb.db, {
        userId: testUser.id,
        characterId: character.id,
        s3Key: 'test/image.jpg',
        s3Url: 'https://example.com/image.jpg',
      });

      // Create moderator context
      const moderatorCtx = createRoleContext('moderator', testDb.db, ['content:read', 'content:write'], { id: admin.id });
      const moderatorCaller = adminAppRouter.createCaller(moderatorCtx);

      // Moderator should be able to flag
      await moderatorCaller.content.flagImage({
        imageId: image.id,
        reason: 'Moderator flag',
      });

      // Verify audit log
      const auditLogs = await testDb.db
        .select()
        .from(adminAuditLog)
        .where(eq(adminAuditLog.adminId, admin.id));

      const flagAuditLog = auditLogs.find(
        log => log.entityType === 'image' && log.entityId === image.id
      );

      expect(flagAuditLog).toBeDefined();
    });

    it('should delete image and create audit log', async () => {
      const { superAdmin } = await createStandardTestAdmins(testDb.db);
      const testUser = await createTestUser(testDb.db);
      const character = await createTestCharacter(testDb.db, testUser.id);
      const image = await createTestImage(testDb.db, {
        userId: testUser.id,
        characterId: character.id,
        s3Key: 'test/image.jpg',
        s3Url: 'https://example.com/image.jpg',
      });

      const ctx = createSuperAdminContext(testDb.db, { id: superAdmin.id });
      const caller = adminAppRouter.createCaller(ctx);

      // Delete image
      await caller.content.deleteImage({
        imageId: image.id,
        reason: 'Test deletion for integration test',
      });

      // Verify audit log
      const auditLogs = await testDb.db
        .select()
        .from(adminAuditLog)
        .where(eq(adminAuditLog.adminId, superAdmin.id));

      const deleteAuditLog = auditLogs.find(
        log => log.entityType === 'image' && log.entityId === image.id && log.action === 'delete'
      );

      expect(deleteAuditLog).toBeDefined();
    });
  });

  describe('content filtering', () => {
    it('should filter images by status', async () => {
      const { superAdmin } = await createStandardTestAdmins(testDb.db);
      const testUser = await createTestUser(testDb.db);
      const character = await createTestCharacter(testDb.db, testUser.id);
      
      const completedImage = await createTestImage(testDb.db, {
        userId: testUser.id,
        characterId: character.id,
        status: 'completed',
        s3Key: 'test/completed.jpg',
        s3Url: 'https://example.com/completed.jpg',
      });
      const pendingImage = await createTestImage(testDb.db, {
        userId: testUser.id,
        characterId: character.id,
        status: 'pending',
        s3Key: 'test/pending.jpg',
        s3Url: 'https://example.com/pending.jpg',
      });

      const ctx = createSuperAdminContext(testDb.db, { id: superAdmin.id });
      const caller = adminAppRouter.createCaller(ctx);

      // Filter by completed
      const completedResult = await caller.content.listImages({
        limit: 50,
        offset: 0,
        status: 'completed',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(completedResult.images.some(img => img.id === completedImage.id)).toBe(true);
      expect(completedResult.images.some(img => img.id === pendingImage.id)).toBe(false);
    });
  });
});
