import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CharacterCacheService } from './character-cache.service';
import { RedisService } from '../../redis/services/redis.service';

describe('CharacterCacheService', () => {
  let service: CharacterCacheService;
  let mockRedisService: RedisService;

  beforeEach(() => {
    mockRedisService = {
      getString: vi.fn(),
      setString: vi.fn(),
    } as unknown as RedisService;

    service = new CharacterCacheService(mockRedisService);
  });

  describe('getCharacterCache', () => {
    it('should get cached character data', async () => {
      const key = 'character:123';
      const value = '{"id":"123","name":"Test"}';
      vi.mocked(mockRedisService.getString).mockResolvedValue(value);

      const result = await service.getCharacterCache(key);

      expect(result).toBe(value);
      expect(mockRedisService.getString).toHaveBeenCalledWith(key);
    });

    it('should return null when cache miss', async () => {
      const key = 'character:123';
      vi.mocked(mockRedisService.getString).mockResolvedValue(null);

      const result = await service.getCharacterCache(key);

      expect(result).toBeNull();
      expect(mockRedisService.getString).toHaveBeenCalledWith(key);
    });
  });

  describe('setCharacterCache', () => {
    it('should set character cache without TTL', async () => {
      const key = 'character:123';
      const value = '{"id":"123","name":"Test"}';
      vi.mocked(mockRedisService.setString).mockResolvedValue(undefined);

      await service.setCharacterCache(key, value);

      expect(mockRedisService.setString).toHaveBeenCalledWith(key, value, { ttl: undefined });
    });

    it('should set character cache with TTL', async () => {
      const key = 'character:123';
      const value = '{"id":"123","name":"Test"}';
      const ttl = 3600;
      vi.mocked(mockRedisService.setString).mockResolvedValue(undefined);

      await service.setCharacterCache(key, value, ttl);

      expect(mockRedisService.setString).toHaveBeenCalledWith(key, value, { ttl });
    });
  });
});
