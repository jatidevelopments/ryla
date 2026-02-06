import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RedisIoAdapter } from './redis-io.adapter';
import { INestApplication } from '@nestjs/common';

// Mock redis and @socket.io/redis-adapter
vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    quit: vi.fn().mockResolvedValue(undefined),
    duplicate: vi.fn().mockReturnThis(),
    on: vi.fn(),
  })),
}));

vi.mock('@socket.io/redis-adapter', () => ({
  createAdapter: vi.fn(() => 'mock-adapter'),
}));

describe('RedisIoAdapter', () => {
  let adapter: RedisIoAdapter;
  let mockApp: INestApplication;

  beforeEach(() => {
    mockApp = {} as INestApplication;
    adapter = new RedisIoAdapter(mockApp);
    // Clear env vars
    delete process.env.REDIS_URL;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('connectToRedis', () => {
    it('should return false when REDIS_URL is not set', async () => {
      const result = await adapter.connectToRedis();
      expect(result).toBe(false);
      expect(adapter.isUsingRedis()).toBe(false);
    });

    it('should connect to Redis when REDIS_URL is set', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      
      const result = await adapter.connectToRedis();
      
      expect(result).toBe(true);
      expect(adapter.isUsingRedis()).toBe(true);
    });

    it('should handle Redis connection failure gracefully', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      
      const { createClient } = await import('redis');
      (createClient as any).mockImplementationOnce(() => ({
        connect: vi.fn().mockRejectedValue(new Error('Connection failed')),
        duplicate: vi.fn().mockReturnThis(),
        on: vi.fn(),
      }));

      // Create new adapter to use the mocked implementation
      const failingAdapter = new RedisIoAdapter(mockApp);
      const result = await failingAdapter.connectToRedis();
      
      expect(result).toBe(false);
      expect(failingAdapter.isUsingRedis()).toBe(false);
    });
  });

  describe('isUsingRedis', () => {
    it('should return false initially', () => {
      expect(adapter.isUsingRedis()).toBe(false);
    });

    it('should return true after successful Redis connection', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      await adapter.connectToRedis();
      expect(adapter.isUsingRedis()).toBe(true);
    });
  });

  describe('disconnect', () => {
    it('should disconnect Redis clients', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      await adapter.connectToRedis();
      
      await adapter.disconnect();
      
      expect(adapter.isUsingRedis()).toBe(false);
    });

    it('should handle disconnect when not connected', async () => {
      await expect(adapter.disconnect()).resolves.not.toThrow();
    });
  });
});
