import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { InpaintEditService } from './inpaint-edit.service';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ImageStorageService } from './image-storage.service';
import { createTestDb } from '../../../test/utils/test-db';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '@ryla/data/schema';

describe('InpaintEditService', () => {
  let service: InpaintEditService;
  let db: any;
  let client: any;
  let mockComfyui: ComfyUIJobRunnerAdapter;
  let mockImageStorage: ImageStorageService;

  // OPTIMIZATION: Create DB once per test suite instead of per test
  beforeAll(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
    client = testDb.client;

    mockComfyui = {
      uploadImage: vi.fn().mockResolvedValue('uploaded-image.png'),
      queueWorkflow: vi.fn().mockResolvedValue('prompt-123'),
    } as unknown as ComfyUIJobRunnerAdapter;

    mockImageStorage = {
      uploadImages: vi.fn().mockResolvedValue({
        images: [{ key: 'mask-key.png' }],
      }),
    } as unknown as ImageStorageService;

    service = new InpaintEditService(db, mockComfyui, mockImageStorage);
  });

  // OPTIMIZATION: Clean up data between tests instead of recreating DB
  beforeEach(async () => {
    // Use DELETE with condition that's always true to delete all rows
    // Delete in reverse order of foreign key dependencies
    try {
      await db.delete(schema.generationJobs).where(sql`1=1`);
      await db.delete(schema.images).where(sql`1=1`);
      await db.delete(schema.characters).where(sql`1=1`);
      await db.delete(schema.users).where(sql`1=1`);
    } catch (error) {
      // If DELETE fails, tests will still run
      console.warn('Cleanup failed, continuing with test:', error);
    }
    vi.clearAllMocks();
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('startInpaintEdit', () => {
    it('should throw NotFoundException when character does not exist', async () => {
      await expect(
        service.startInpaintEdit({
          userId: 'user-123',
          characterId: 'non-existent',
          sourceImageId: 'img-123',
          prompt: 'test prompt',
          maskedImageBase64Png: 'data:image/png;base64,iVBORw0KGgoAAAANS',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when source image does not exist', async () => {
      const [character] = await db
        .insert(schema.characters)
        .values({
          userId: 'user-123',
          name: 'Test Character',
          config: {},
        })
        .returning();

      await expect(
        service.startInpaintEdit({
          userId: 'user-123',
          characterId: character.id,
          sourceImageId: 'non-existent',
          prompt: 'test prompt',
          maskedImageBase64Png: 'data:image/png;base64,iVBORw0KGgoAAAANS',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when source image missing metadata', async () => {
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
          userId: 'user-123',
          characterId: character.id,
          s3Key: 'images/test.jpg',
          status: 'completed',
          // Missing scene, environment, outfit, aspectRatio
        })
        .returning();

      await expect(
        service.startInpaintEdit({
          userId: 'user-123',
          characterId: character.id,
          sourceImageId: image.id,
          prompt: 'test prompt',
          maskedImageBase64Png: 'data:image/png;base64,iVBORw0KGgoAAAANS',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should start inpaint edit successfully', async () => {
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
          userId: 'user-123',
          characterId: character.id,
          s3Key: 'images/test.jpg',
          status: 'completed',
          scene: 'beach',
          environment: 'outdoor',
          outfit: 'swimsuit',
          aspectRatio: '16:9',
        })
        .returning();

      const result = await service.startInpaintEdit({
        userId: 'user-123',
        characterId: character.id,
        sourceImageId: image.id,
        prompt: 'test prompt',
        maskedImageBase64Png: 'data:image/png;base64,iVBORw0KGgoAAAANS',
      });

      expect(result).toHaveProperty('jobId');
      expect(mockComfyui.uploadImage).toHaveBeenCalled();
      expect(mockComfyui.queueWorkflow).toHaveBeenCalled();
    });
  });
});
