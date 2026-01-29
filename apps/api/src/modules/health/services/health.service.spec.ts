import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthService } from './health.service';
import { RedisService } from '../../redis/services/redis.service';
import { sql } from 'drizzle-orm';

describe('HealthService', () => {
  let service: HealthService;
  let mockDb: any;
  let mockRedisService: RedisService;

  beforeEach(() => {
    mockDb = {
      execute: vi.fn(),
    };

    mockRedisService = {
      isReady: vi.fn(),
      ping: vi.fn(),
      getRedisData: vi.fn(),
    } as unknown as RedisService;

    service = new HealthService(mockDb, mockRedisService);
  });

  describe('checkDatabase', () => {
    it('should return healthy status when database query succeeds', async () => {
      mockDb.execute.mockResolvedValue(undefined);

      const result = await service.checkDatabase();

      expect(result.isHealthy).toBe(true);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.message).toBe('Database connection is healthy');
      expect(mockDb.execute).toHaveBeenCalledWith(sql`SELECT 1`);
    });

    it('should return unhealthy status when database query fails', async () => {
      const error = new Error('Connection timeout');
      mockDb.execute.mockRejectedValue(error);

      const result = await service.checkDatabase();

      expect(result.isHealthy).toBe(false);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.message).toContain('Database check failed');
      expect(result.message).toContain('Connection timeout');
    });

    it('should measure response time', async () => {
      mockDb.execute.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10)),
      );

      const result = await service.checkDatabase();

      expect(result.responseTime).toBeGreaterThanOrEqual(10);
    });
  });

  describe('checkRedis', () => {
    it('should return unhealthy status when Redis is not ready', async () => {
      vi.mocked(mockRedisService.isReady).mockReturnValue(false);

      const result = await service.checkRedis();

      expect(result.isHealthy).toBe(false);
      expect(result.message).toContain('not connected');
      expect(mockRedisService.ping).not.toHaveBeenCalled();
    });

    it('should return healthy status when Redis ping succeeds', async () => {
      vi.mocked(mockRedisService.isReady).mockReturnValue(true);
      vi.mocked(mockRedisService.ping).mockResolvedValue('PONG');

      const result = await service.checkRedis();

      expect(result.isHealthy).toBe(true);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.message).toBe('Redis connection is healthy');
      expect(mockRedisService.ping).toHaveBeenCalled();
    });

    it('should return unhealthy status when Redis ping fails', async () => {
      vi.mocked(mockRedisService.isReady).mockReturnValue(true);
      vi.mocked(mockRedisService.ping).mockRejectedValue(new Error('Connection failed'));

      const result = await service.checkRedis();

      expect(result.isHealthy).toBe(false);
      expect(result.message).toContain('Redis check failed');
      expect(result.message).toContain('Connection failed');
    });

    it('should return unhealthy status when Redis ping times out', async () => {
      vi.mocked(mockRedisService.isReady).mockReturnValue(true);
      vi.mocked(mockRedisService.ping).mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000)),
      );

      const result = await service.checkRedis();

      expect(result.isHealthy).toBe(false);
      expect(result.message).toContain('Redis ping timeout');
    });

    it('should return unhealthy status when ping returns non-PONG', async () => {
      vi.mocked(mockRedisService.isReady).mockReturnValue(true);
      vi.mocked(mockRedisService.ping).mockResolvedValue('ERROR');

      const result = await service.checkRedis();

      expect(result.isHealthy).toBe(false);
    });
  });

  describe('getRedisData', () => {
    it('should return Redis data', async () => {
      const mockData = { key1: 'value1', key2: 'value2' };
      vi.mocked(mockRedisService.getRedisData).mockResolvedValue(mockData);

      const result = await service.getRedisData(10);

      expect(result).toEqual(mockData);
      expect(mockRedisService.getRedisData).toHaveBeenCalledWith(10);
    });

    it('should handle empty Redis data', async () => {
      vi.mocked(mockRedisService.getRedisData).mockResolvedValue({});

      const result = await service.getRedisData(5);

      expect(result).toEqual({});
    });
  });
});
