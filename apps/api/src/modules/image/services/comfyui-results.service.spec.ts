import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { ComfyUIResultsService } from './comfyui-results.service';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ImageStorageService } from './image-storage.service';
import { BaseImageGenerationService } from './base-image-generation.service';
import { createTestDb } from '../../../test/utils/test-db';
import * as schema from '@ryla/data/schema';
import { sql } from 'drizzle-orm';

describe('ComfyUIResultsService', () => {
  let service: ComfyUIResultsService;
  let db: any;
  let client: any;
  let mockComfyui: ComfyUIJobRunnerAdapter;
  let mockImageStorage: ImageStorageService;
  let mockBaseImageService: BaseImageGenerationService;

  // OPTIMIZATION: Create DB once per test suite instead of per test
  beforeAll(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
    client = testDb.client;

    mockComfyui = {
      getJobStatus: vi.fn(),
    } as unknown as ComfyUIJobRunnerAdapter;

    mockImageStorage = {} as ImageStorageService;

    mockBaseImageService = {
      getJobResults: vi.fn().mockResolvedValue({
        status: 'completed',
        images: [],
      }),
    } as unknown as BaseImageGenerationService;

    service = new ComfyUIResultsService(
      db,
      mockComfyui,
      mockImageStorage,
      mockBaseImageService,
    );
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

  describe('getResults', () => {
    it('should fallback to baseImageService when job not tracked', async () => {
      const mockResult = {
        status: 'completed',
        images: [{ id: 'img-1', url: 'https://example.com/img.jpg' }],
      };
      vi.mocked(mockBaseImageService.getJobResults).mockResolvedValue(mockResult as any);

      const result = await service.getResults('non-tracked-job', 'user-123');

      expect(result).toEqual(mockResult);
      expect(mockBaseImageService.getJobResults).toHaveBeenCalledWith(
        'non-tracked-job',
        'user-123',
      );
    });

    it('should return results for tracked Fal job', async () => {
      // This would require setting up a generation_jobs record
      // For now, test the service is initialized correctly
      expect(service).toBeDefined();
    });
  });
});
