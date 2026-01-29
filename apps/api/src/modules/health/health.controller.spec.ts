import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthController } from './health.controller';
import { HealthService } from './services/health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let mockHealthService: HealthService;

  beforeEach(() => {
    mockHealthService = {
      checkDatabase: vi.fn(),
      checkRedis: vi.fn(),
      getRedisData: vi.fn(),
    } as unknown as HealthService;

    controller = new HealthController(mockHealthService);
  });

  describe('health', () => {
    it('should return health status string', () => {
      const result = controller.health();

      expect(result).toBe('ok, application is working fine!!!');
    });
  });

  describe('checkDatabase', () => {
    it('should return database health status', async () => {
      const mockStatus = {
        isHealthy: true,
        responseTime: 10,
        message: 'Database connection is healthy',
      };
      vi.mocked(mockHealthService.checkDatabase).mockResolvedValue(mockStatus);

      const result = await controller.checkDatabase();

      expect(result).toEqual(mockStatus);
      expect(mockHealthService.checkDatabase).toHaveBeenCalled();
    });
  });

  describe('checkRedis', () => {
    it('should return Redis health status', async () => {
      const mockStatus = {
        isHealthy: true,
        responseTime: 5,
        message: 'Redis connection is healthy',
      };
      vi.mocked(mockHealthService.checkRedis).mockResolvedValue(mockStatus);

      const result = await controller.checkRedis();

      expect(result).toEqual(mockStatus);
      expect(mockHealthService.checkRedis).toHaveBeenCalled();
    });
  });

  describe('getRedisDataDefault', () => {
    it('should return Redis data with default limit', async () => {
      const mockData = { key1: 'value1', key2: 'value2' };
      vi.mocked(mockHealthService.getRedisData).mockResolvedValue(mockData);

      const result = await controller.getRedisDataDefault();

      expect(result).toEqual(mockData);
      expect(mockHealthService.getRedisData).toHaveBeenCalledWith(100);
    });
  });

  describe('getRedisDataWithLimit', () => {
    it('should return Redis data with provided limit', async () => {
      const mockData = { key1: 'value1' };
      vi.mocked(mockHealthService.getRedisData).mockResolvedValue(mockData);

      const result = await controller.getRedisDataWithLimit(50);

      expect(result).toEqual(mockData);
      expect(mockHealthService.getRedisData).toHaveBeenCalledWith(50);
    });

    it('should use default limit when maxItems is not provided', async () => {
      const mockData = {};
      vi.mocked(mockHealthService.getRedisData).mockResolvedValue(mockData);

      const result = await controller.getRedisDataWithLimit(undefined);

      expect(result).toEqual(mockData);
      expect(mockHealthService.getRedisData).toHaveBeenCalledWith(100);
    });

    it('should use default limit when maxItems is 0', async () => {
      const mockData = {};
      vi.mocked(mockHealthService.getRedisData).mockResolvedValue(mockData);

      const result = await controller.getRedisDataWithLimit(0);

      expect(result).toEqual(mockData);
      expect(mockHealthService.getRedisData).toHaveBeenCalledWith(100);
    });
  });
});
