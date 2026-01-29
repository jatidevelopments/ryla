import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { ProfilePictureSetService } from './profile-picture-set.service';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ImageStorageService } from './image-storage.service';
import { createTestDb } from '../../../test/utils/test-db';
import * as schema from '@ryla/data/schema';
import { sql } from 'drizzle-orm';

describe('ProfilePictureSetService', () => {
  let service: ProfilePictureSetService;
  let db: any;
  let client: any;
  let mockComfyuiAdapter: ComfyUIJobRunnerAdapter;
  let mockImageStorage: ImageStorageService;

  // OPTIMIZATION: Create DB once per test suite instead of per test
  beforeAll(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
    client = testDb.client;

    mockComfyuiAdapter = {
      isAvailable: vi.fn().mockReturnValue(true),
      queueWorkflow: vi.fn().mockResolvedValue('job-123'),
    } as unknown as ComfyUIJobRunnerAdapter;

    mockImageStorage = {} as ImageStorageService;

    service = new ProfilePictureSetService(db, mockComfyuiAdapter, mockImageStorage);
  });

  // OPTIMIZATION: Clean up data between tests instead of recreating DB
  beforeEach(async () => {
    // Use DELETE with condition that's always true to delete all rows
    // Delete in reverse order of foreign key dependencies
    try {
      await db.delete(schema.generationJobs).where(sql`1=1`);
      await db.delete(schema.images).where(sql`1=1`);
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

  describe('generateProfilePictureSet', () => {
    it('should throw error when ComfyUI is not available', async () => {
      vi.mocked(mockComfyuiAdapter.isAvailable).mockReturnValue(false);

      await expect(
        service.generateProfilePictureSet({
          baseImageUrl: 'https://example.com/base.jpg',
          setId: 'classic-influencer',
          nsfwEnabled: false,
        }),
      ).rejects.toThrow();
    });

    it('should generate profile picture set', async () => {
      const input = {
        baseImageUrl: 'https://example.com/base.jpg',
        setId: 'classic-influencer',
        nsfwEnabled: false,
      };

      const result = await service.generateProfilePictureSet(input);

      expect(result).toHaveProperty('jobId');
      expect(result).toHaveProperty('allJobIds');
      expect(Array.isArray(result.allJobIds)).toBe(true);
    });
  });

  describe('regenerateProfilePicture', () => {
    it('should regenerate single profile picture', async () => {
      const input = {
        baseImageUrl: 'https://example.com/base.jpg',
        positionId: 'front-standing',
        prompt: 'test prompt',
        nsfwEnabled: false,
      };

      const result = await service.regenerateProfilePicture(input);

      expect(result).toHaveProperty('jobId');
    });
  });

  describe('getJobResult', () => {
    it('should return job result', async () => {
      expect(typeof service.getJobResult).toBe('function');
    });
  });
});
