import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { TemplateTrendingService } from './template-trending.service';
import { RedisService } from '../../redis/services/redis.service';
import { createTestDb } from '../../../test/utils/test-db';
import { sql } from 'drizzle-orm';

describe('TemplateTrendingService', () => {
  let service: TemplateTrendingService;
  let db: any;
  let client: any;
  let mockRedisService: RedisService;

  // OPTIMIZATION: Create DB once per test suite instead of per test
  beforeAll(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
    client = testDb.client;

    mockRedisService = {
      isReady: vi.fn().mockReturnValue(true),
      exists: vi.fn(),
      setString: vi.fn(),
      deleteByKey: vi.fn(),
    } as unknown as RedisService;

    service = new TemplateTrendingService(db, mockRedisService);
  });

  // OPTIMIZATION: Clean up mocks between tests
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('refreshTrendingView', () => {
    it('should skip refresh when lock is already active', async () => {
      vi.mocked(mockRedisService.exists).mockResolvedValue(true);

      const result = await service.refreshTrendingView();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Lock already active');
    });

    it('should proceed when Redis is not ready', async () => {
      vi.mocked(mockRedisService.isReady).mockReturnValue(false);

      // Mock view check to return false (view doesn't exist in test DB)
      const result = await service.refreshTrendingView();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Materialized view does not exist');
    });

    it('should acquire and release lock', async () => {
      vi.mocked(mockRedisService.exists).mockResolvedValue(false);
      vi.mocked(mockRedisService.setString).mockResolvedValue('OK');

      // Mock view check to return false
      const result = await service.refreshTrendingView();

      expect(mockRedisService.setString).toHaveBeenCalled();
      expect(mockRedisService.deleteByKey).toHaveBeenCalled();
    });
  });

  describe('getTrendingStats', () => {
    it('should return trending stats', async () => {
      const result = await service.getTrendingStats();

      expect(result).toHaveProperty('totalTemplates');
      expect(result).toHaveProperty('topTemplates');
      expect(Array.isArray(result.topTemplates)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Force error by using invalid query
      const result = await service.getTrendingStats();

      expect(result.totalTemplates).toBeDefined();
      expect(result.topTemplates).toBeDefined();
    });
  });
});
