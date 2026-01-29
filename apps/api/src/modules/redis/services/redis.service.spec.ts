import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedisService } from './redis.service';
import { Redis } from 'ioredis';

describe('RedisService', () => {
  let service: RedisService;
  let mockRedisClient: Redis;

  beforeEach(() => {
    mockRedisClient = {
      sadd: vi.fn(),
      srem: vi.fn(),
      del: vi.fn(),
      smembers: vi.fn(),
      expire: vi.fn(),
      ping: vi.fn(),
      keys: vi.fn(),
      type: vi.fn(),
      get: vi.fn(),
      lrange: vi.fn(),
      zrange: vi.fn(),
      hgetall: vi.fn(),
      incr: vi.fn(),
      decr: vi.fn(),
      set: vi.fn(),
      exists: vi.fn(),
      status: 'ready',
      pipeline: vi.fn(),
    } as unknown as Redis;

    service = new RedisService(mockRedisClient);
  });

  describe('addOneToSet', () => {
    it('should add one member to set', async () => {
      vi.mocked(mockRedisClient.sadd).mockResolvedValue(1);

      const result = await service.addOneToSet('key', 'value');

      expect(result).toBe(1);
      expect(mockRedisClient.sadd).toHaveBeenCalledWith('key', 'value');
    });
  });

  describe('addManyToSet', () => {
    it('should add multiple members to set', async () => {
      vi.mocked(mockRedisClient.sadd).mockResolvedValue(2);

      const result = await service.addManyToSet('key', ['value1', 'value2']);

      expect(result).toBe(2);
      expect(mockRedisClient.sadd).toHaveBeenCalledWith('key', 'value1', 'value2');
    });
  });

  describe('removeOneFromSet', () => {
    it('should remove member from set', async () => {
      vi.mocked(mockRedisClient.srem).mockResolvedValue(1);

      const result = await service.removeOneFromSet('key', 'value');

      expect(result).toBe(1);
      expect(mockRedisClient.srem).toHaveBeenCalledWith('key', 'value');
    });
  });

  describe('deleteByKey', () => {
    it('should delete key', async () => {
      vi.mocked(mockRedisClient.del).mockResolvedValue(1);

      const result = await service.deleteByKey('key');

      expect(result).toBe(1);
      expect(mockRedisClient.del).toHaveBeenCalledWith('key');
    });
  });

  describe('deleteByKeys', () => {
    it('should delete multiple keys', async () => {
      vi.mocked(mockRedisClient.del).mockResolvedValue(2);

      const result = await service.deleteByKeys(['key1', 'key2']);

      expect(result).toBe(2);
      expect(mockRedisClient.del).toHaveBeenCalledWith('key1', 'key2');
    });

    it('should return 0 for empty array', async () => {
      const result = await service.deleteByKeys([]);

      expect(result).toBe(0);
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });
  });

  describe('sMembers', () => {
    it('should get all members in set', async () => {
      vi.mocked(mockRedisClient.smembers).mockResolvedValue(['value1', 'value2']);

      const result = await service.sMembers('key');

      expect(result).toEqual(['value1', 'value2']);
      expect(mockRedisClient.smembers).toHaveBeenCalledWith('key');
    });
  });

  describe('expire', () => {
    it('should set expiration on key', async () => {
      vi.mocked(mockRedisClient.expire).mockResolvedValue(1);

      const result = await service.expire('key', 3600);

      expect(result).toBe(1);
      expect(mockRedisClient.expire).toHaveBeenCalledWith('key', 3600);
    });
  });

  describe('ping', () => {
    it('should ping Redis server', async () => {
      vi.mocked(mockRedisClient.ping).mockResolvedValue('PONG');

      const result = await service.ping();

      expect(result).toBe('PONG');
      expect(mockRedisClient.ping).toHaveBeenCalled();
    });
  });

  describe('getRedisData', () => {
    it('should get Redis data for string type', async () => {
      vi.mocked(mockRedisClient.keys).mockResolvedValue(['key1']);
      vi.mocked(mockRedisClient.type).mockResolvedValue('string');
      vi.mocked(mockRedisClient.get).mockResolvedValue('value1');

      const result = await service.getRedisData(100);

      expect(result).toHaveProperty('key1');
      expect(result.key1.type).toBe('string');
    });

    it('should get Redis data for list type', async () => {
      vi.mocked(mockRedisClient.keys).mockResolvedValue(['key1']);
      vi.mocked(mockRedisClient.type).mockResolvedValue('list');
      vi.mocked(mockRedisClient.lrange).mockResolvedValue(['item1', 'item2']);

      const result = await service.getRedisData(100);

      expect(result).toHaveProperty('key1');
      expect(result.key1.type).toBe('list');
    });

    it('should get Redis data for set type', async () => {
      vi.mocked(mockRedisClient.keys).mockResolvedValue(['key1']);
      vi.mocked(mockRedisClient.type).mockResolvedValue('set');
      vi.mocked(mockRedisClient.smembers).mockResolvedValue(['value1']);

      const result = await service.getRedisData(100);

      expect(result).toHaveProperty('key1');
      expect(result.key1.type).toBe('set');
    });

    it('should get Redis data for hash type', async () => {
      vi.mocked(mockRedisClient.keys).mockResolvedValue(['key1']);
      vi.mocked(mockRedisClient.type).mockResolvedValue('hash');
      vi.mocked(mockRedisClient.hgetall).mockResolvedValue({ field1: 'value1' });

      const result = await service.getRedisData(100);

      expect(result).toHaveProperty('key1');
      expect(result.key1.type).toBe('hash');
    });

    it('should limit preview length', async () => {
      vi.mocked(mockRedisClient.keys).mockResolvedValue(['key1']);
      vi.mocked(mockRedisClient.type).mockResolvedValue('string');
      vi.mocked(mockRedisClient.get).mockResolvedValue('a'.repeat(200));

      const result = await service.getRedisData(50);

      expect(result.key1.preview.length).toBeLessThanOrEqual(50);
    });
  });

  describe('increment', () => {
    it('should increment key value', async () => {
      vi.mocked(mockRedisClient.incr).mockResolvedValue(2);

      const result = await service.increment('key');

      expect(result).toBe(2);
      expect(mockRedisClient.incr).toHaveBeenCalledWith('key');
    });
  });

  describe('decrement', () => {
    it('should decrement key value', async () => {
      vi.mocked(mockRedisClient.decr).mockResolvedValue(1);

      const result = await service.decrement('key');

      expect(result).toBe(1);
      expect(mockRedisClient.decr).toHaveBeenCalledWith('key');
    });
  });

  describe('getString', () => {
    it('should get string value', async () => {
      vi.mocked(mockRedisClient.get).mockResolvedValue('value');

      const result = await service.getString('key');

      expect(result).toBe('value');
      expect(mockRedisClient.get).toHaveBeenCalledWith('key');
    });

    it('should return null when key does not exist', async () => {
      vi.mocked(mockRedisClient.get).mockResolvedValue(null);

      const result = await service.getString('key');

      expect(result).toBeNull();
    });
  });

  describe('get', () => {
    it('should get numeric value', async () => {
      vi.mocked(mockRedisClient.get).mockResolvedValue('123');

      const result = await service.get('key');

      expect(result).toBe(123);
    });

    it('should return null when key does not exist', async () => {
      vi.mocked(mockRedisClient.get).mockResolvedValue(null);

      const result = await service.get('key');

      expect(result).toBeNull();
    });
  });

  describe('setString', () => {
    it('should set string value without TTL', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue('OK');

      const result = await service.setString('key', 'value');

      expect(result).toBe('OK');
      expect(mockRedisClient.set).toHaveBeenCalledWith('key', 'value');
    });

    it('should set string value with TTL', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue('OK');

      const result = await service.setString('key', 'value', { ttl: 3600 });

      expect(result).toBe('OK');
      expect(mockRedisClient.set).toHaveBeenCalledWith('key', 'value', 'EX', 3600);
    });
  });

  describe('set', () => {
    it('should set numeric value', async () => {
      vi.mocked(mockRedisClient.set).mockResolvedValue('OK');

      const result = await service.set('key', 123);

      expect(result).toBe('OK');
      expect(mockRedisClient.set).toHaveBeenCalledWith('key', 123);
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      vi.mocked(mockRedisClient.exists).mockResolvedValue(1);

      const result = await service.exists('key');

      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      vi.mocked(mockRedisClient.exists).mockResolvedValue(0);

      const result = await service.exists('key');

      expect(result).toBe(false);
    });
  });

  describe('keys', () => {
    it('should get keys matching pattern', async () => {
      vi.mocked(mockRedisClient.keys).mockResolvedValue(['key1', 'key2']);

      const result = await service.keys('key*');

      expect(result).toEqual(['key1', 'key2']);
      expect(mockRedisClient.keys).toHaveBeenCalledWith('key*');
    });
  });

  describe('pipeline', () => {
    it('should create pipeline', () => {
      const mockPipeline = {};
      vi.mocked(mockRedisClient.pipeline).mockReturnValue(mockPipeline as any);

      const result = service.pipeline();

      expect(result).toBe(mockPipeline);
      expect(mockRedisClient.pipeline).toHaveBeenCalled();
    });
  });

  describe('isReady', () => {
    it('should return true when status is ready', () => {
      (mockRedisClient as any).status = 'ready';

      const result = service.isReady();

      expect(result).toBe(true);
    });

    it('should return false when status is not ready', () => {
      (mockRedisClient as any).status = 'connecting';

      const result = service.isReady();

      expect(result).toBe(false);
    });
  });
});
