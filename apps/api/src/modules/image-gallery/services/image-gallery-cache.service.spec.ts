import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGalleryCacheService } from './image-gallery-cache.service';
import { RedisService } from '../../redis/services/redis.service';

describe('ImageGalleryCacheService', () => {
  let service: ImageGalleryCacheService;
  let mockRedisService: RedisService;

  beforeEach(() => {
    mockRedisService = {
      getString: vi.fn(),
      setString: vi.fn(),
    } as unknown as RedisService;

    service = new ImageGalleryCacheService(mockRedisService);
  });

  describe('getGalleryCache', () => {
    it('should get cached gallery data', async () => {
      const key = 'gallery:char-123';
      const value = '{"images":[]}';
      vi.mocked(mockRedisService.getString).mockResolvedValue(value);

      const result = await service.getGalleryCache(key);

      expect(result).toBe(value);
      expect(mockRedisService.getString).toHaveBeenCalledWith(key);
    });

    it('should return null when cache miss', async () => {
      const key = 'gallery:char-123';
      vi.mocked(mockRedisService.getString).mockResolvedValue(null);

      const result = await service.getGalleryCache(key);

      expect(result).toBeNull();
    });
  });

  describe('setGalleryCache', () => {
    it('should set gallery cache without TTL', async () => {
      const key = 'gallery:char-123';
      const value = '{"images":[]}';
      vi.mocked(mockRedisService.setString).mockResolvedValue('OK');

      await service.setGalleryCache(key, value);

      expect(mockRedisService.setString).toHaveBeenCalledWith(key, value, { ttl: undefined });
    });

    it('should set gallery cache with TTL', async () => {
      const key = 'gallery:char-123';
      const value = '{"images":[]}';
      const ttl = 3600;
      vi.mocked(mockRedisService.setString).mockResolvedValue('OK');

      await service.setGalleryCache(key, value, ttl);

      expect(mockRedisService.setString).toHaveBeenCalledWith(key, value, { ttl });
    });
  });
});
