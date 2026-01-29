import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { ImageGalleryService } from './image-gallery.service';
import { RedisService } from '../../redis/services/redis.service';
import { AwsS3Service } from '../../aws-s3/services/aws-s3.service';
import { createTestDb } from '../../../test/utils/test-db';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import * as schema from '@ryla/data/schema';

describe('ImageGalleryService', () => {
  let service: ImageGalleryService;
  let db: any;
  let client: any;
  let mockRedisService: RedisService;
  let mockS3Service: AwsS3Service;

  // OPTIMIZATION: Create DB once per test suite instead of per test
  beforeAll(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
    client = testDb.client;

    mockRedisService = {} as RedisService;
    mockS3Service = {
      getFileUrl: vi.fn().mockResolvedValue('https://s3.example.com/image.jpg'),
    } as unknown as AwsS3Service;

    service = new ImageGalleryService(db, mockRedisService, mockS3Service);
  });

  // OPTIMIZATION: Clean up data between tests instead of recreating DB
  beforeEach(async () => {
    // Use DELETE with condition that's always true to delete all rows
    // Delete in reverse order of foreign key dependencies
    try {
      await db.delete(schema.imageLikes).where(sql`1=1`);
      await db.delete(schema.images).where(sql`1=1`);
      await db.delete(schema.characters).where(sql`1=1`);
      await db.delete(schema.users).where(sql`1=1`);
    } catch (error) {
      // If DELETE fails, tests will still run
      console.warn('Cleanup failed, continuing with test:', error);
    }
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('getCharacterImages', () => {
    it('should throw NotFoundException when character does not exist', async () => {
      await expect(
        service.getCharacterImages('non-existent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own character', async () => {
      const [character] = await db
        .insert(schema.characters)
        .values({
          userId: 'other-user',
          name: 'Test Character',
          config: {},
        })
        .returning();

      await expect(
        service.getCharacterImages(character.id, 'user-123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return images for character', async () => {
      const [character] = await db
        .insert(schema.characters)
        .values({
          userId: 'user-123',
          name: 'Test Character',
          config: {},
        })
        .returning();

      const [image] = await db
        .insert(schema.images)
        .values({
          characterId: character.id,
          userId: 'user-123',
          s3Key: 'images/test.jpg',
          status: 'completed',
        })
        .returning();

      const result = await service.getCharacterImages(character.id, 'user-123');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBe(image.id);
    });

    it('should exclude deleted images', async () => {
      const [character] = await db
        .insert(schema.characters)
        .values({
          userId: 'user-123',
          name: 'Test Character',
          config: {},
        })
        .returning();

      await db.insert(schema.images).values({
        characterId: character.id,
        userId: 'user-123',
        s3Key: 'images/deleted.jpg',
        status: 'completed',
        deletedAt: new Date(),
      });

      const result = await service.getCharacterImages(character.id, 'user-123');

      expect(result.length).toBe(0);
    });
  });

  describe('getImageRedirectUrl', () => {
    it('should throw NotFoundException when image does not exist', async () => {
      await expect(
        service.getImageRedirectUrl('non-existent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own image', async () => {
      const [image] = await db
        .insert(schema.images)
        .values({
          userId: 'other-user',
          s3Key: 'images/test.jpg',
          status: 'completed',
        })
        .returning();

      await expect(
        service.getImageRedirectUrl(image.id, 'user-123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return signed URL for image', async () => {
      const [image] = await db
        .insert(schema.images)
        .values({
          userId: 'user-123',
          s3Key: 'images/test.jpg',
          status: 'completed',
        })
        .returning();

      const result = await service.getImageRedirectUrl(image.id, 'user-123');

      expect(result).toBe('https://s3.example.com/image.jpg');
      expect(mockS3Service.getFileUrl).toHaveBeenCalledWith('images/test.jpg');
    });
  });

  describe('likeImage', () => {
    it('should toggle like status', async () => {
      const [image] = await db
        .insert(schema.images)
        .values({
          userId: 'user-123',
          s3Key: 'images/test.jpg',
          status: 'completed',
          liked: false,
        })
        .returning();

      const result = await service.likeImage(image.id, 'user-123');

      expect(result).toBe(true);

      const [updated] = await db
        .select()
        .from(schema.images)
        .where(eq(schema.images.id, image.id));

      expect(updated.liked).toBe(true);
    });

    it('should throw NotFoundException when image does not exist', async () => {
      await expect(service.likeImage('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own image', async () => {
      const [image] = await db
        .insert(schema.images)
        .values({
          userId: 'other-user',
          s3Key: 'images/test.jpg',
          status: 'completed',
        })
        .returning();

      await expect(service.likeImage(image.id, 'user-123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('deleteImage', () => {
    it('should soft delete image', async () => {
      const [image] = await db
        .insert(schema.images)
        .values({
          userId: 'user-123',
          s3Key: 'images/test.jpg',
          status: 'completed',
        })
        .returning();

      const result = await service.deleteImage(image.id, 'user-123');

      expect(result).toBe(true);

      const [deleted] = await db
        .select()
        .from(schema.images)
        .where(eq(schema.images.id, image.id));

      expect(deleted.deletedAt).toBeDefined();
    });

    it('should throw NotFoundException when image does not exist', async () => {
      await expect(service.deleteImage('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own image', async () => {
      const [image] = await db
        .insert(schema.images)
        .values({
          userId: 'other-user',
          s3Key: 'images/test.jpg',
          status: 'completed',
        })
        .returning();

      await expect(service.deleteImage(image.id, 'user-123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
