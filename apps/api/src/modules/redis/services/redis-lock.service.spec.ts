import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedisLockService } from './redis-lock.service';
import Redis from 'ioredis';

describe('RedisLockService', () => {
  let service: RedisLockService;
  let mockRedisClient: Redis;

  beforeEach(() => {
    mockRedisClient = {
      set: vi.fn(),
      del: vi.fn(),
    } as unknown as Redis;

    service = new RedisLockService(mockRedisClient);
  });

  describe('acquireLock', () => {
    it('should acquire lock when available', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue('OK');

      const result = await service.acquireLock('test-key', 60);

      expect(result).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith('test-key', '1', 'EX', 60, 'NX');
    });

    it('should return false when lock is already held', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue(null);

      const result = await service.acquireLock('test-key', 60);

      expect(result).toBe(false);
    });

    it('should set TTL correctly', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue('OK');

      await service.acquireLock('test-key', 120);

      expect(mockRedisClient.set).toHaveBeenCalledWith('test-key', '1', 'EX', 120, 'NX');
    });
  });

  describe('releaseLock', () => {
    it('should release lock', async () => {
      vi.mocked(mockRedisClient.del).mockResolvedValue(1);

      await service.releaseLock('test-key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
    });

    it('should handle lock release when key does not exist', async () => {
      vi.mocked(mockRedisClient.del).mockResolvedValue(0);

      await service.releaseLock('non-existent-key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('non-existent-key');
    });
  });
});
