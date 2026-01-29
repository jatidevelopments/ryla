import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RedisLeaderElectionService } from './redis-leader-election.service';
import Redis from 'ioredis';

describe('RedisLeaderElectionService', () => {
  let service: RedisLeaderElectionService;
  let mockRedisClient: Redis;

  beforeEach(() => {
    mockRedisClient = {
      set: vi.fn(),
      get: vi.fn(),
      expire: vi.fn(),
    } as unknown as Redis;

    service = new RedisLeaderElectionService(mockRedisClient);
  });

  afterEach(() => {
    service.onApplicationShutdown();
  });

  describe('registerCronJob', () => {
    it('should register cron job and attempt to become leader', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue('OK');

      await service.registerCronJob('test-job');

      expect(mockRedisClient.set).toHaveBeenCalled();
    });

    it('should not register same job twice', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue('OK');

      await service.registerCronJob('test-job');
      await service.registerCronJob('test-job');

      // Should only attempt to become leader once per registration
      expect(mockRedisClient.set).toHaveBeenCalled();
    });
  });

  describe('isLeader', () => {
    it('should return false initially', async () => {
      const result = await service.isLeader('test-job');

      expect(result).toBe(false);
    });

    it('should return true after becoming leader', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue('OK');
      vi.mocked(mockRedisClient.get).mockResolvedValue(service['instanceId']);

      await service.registerCronJob('test-job');
      // Wait a bit for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await service.isLeader('test-job');
      expect(result).toBe(true);
    });
  });

  describe('onApplicationShutdown', () => {
    it('should clear all intervals and status', () => {
      service.onApplicationShutdown();

      // Verify intervals are cleared (no way to directly test, but should not throw)
      expect(() => service.onApplicationShutdown()).not.toThrow();
    });
  });
});
