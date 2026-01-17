/**
 * ComfyUI Job Persistence Service Tests
 *
 * Unit tests for Redis job persistence functionality.
 *
 * @see EP-040: Redis Job Persistence and Recovery
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComfyUIJobPersistenceService } from './comfyui-job-persistence.service';
import type { JobState } from '../interfaces/comfyui-job-state.interface';
import Redis from 'ioredis';

// Mock Redis client
class MockRedis {
  private data: Map<string, string> = new Map();

  async get(key: string): Promise<string | null> {
    return this.data.get(key) || null;
  }

  async set(key: string, value: string, ...args: any[]): Promise<string> {
    this.data.set(key, value);
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.data.has(key);
    this.data.delete(key);
    return existed ? 1 : 0;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.data.keys()).filter((key) => regex.test(key));
  }

  async ping(): Promise<string> {
    return 'PONG';
  }
}

describe('ComfyUIJobPersistenceService', () => {
  let service: ComfyUIJobPersistenceService;
  let mockRedis: MockRedis;

  beforeEach(() => {
    mockRedis = new MockRedis() as any;
    service = new ComfyUIJobPersistenceService({
      redisClient: mockRedis as any,
    });
  });

  describe('saveJobState', () => {
    it('should save job state to Redis', async () => {
      const jobState: JobState = {
        promptId: 'test-123',
        type: 'image_generation',
        userId: 'user-123',
        status: 'queued',
        progress: 0,
        startedAt: Date.now(),
        serverUrl: 'http://localhost:8188',
      };

      await service.saveJobState(jobState);

      const saved = await service.getJobState('test-123');
      expect(saved).not.toBeNull();
      expect(saved?.promptId).toBe('test-123');
    });
  });

  describe('getJobState', () => {
    it('should retrieve job state from Redis', async () => {
      const jobState: JobState = {
        promptId: 'test-456',
        type: 'image_generation',
        userId: 'user-456',
        status: 'processing',
        progress: 50,
        startedAt: Date.now(),
        serverUrl: 'http://localhost:8188',
      };

      await service.saveJobState(jobState);
      const retrieved = await service.getJobState('test-456');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.promptId).toBe('test-456');
      expect(retrieved?.status).toBe('processing');
      expect(retrieved?.progress).toBe(50);
    });

    it('should return null for non-existent job', async () => {
      const retrieved = await service.getJobState('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('updateJobState', () => {
    it('should update existing job state', async () => {
      const jobState: JobState = {
        promptId: 'test-789',
        type: 'image_generation',
        userId: 'user-789',
        status: 'queued',
        progress: 0,
        startedAt: Date.now(),
        serverUrl: 'http://localhost:8188',
      };

      await service.saveJobState(jobState);
      await service.updateJobState('test-789', {
        status: 'processing',
        progress: 75,
      });

      const updated = await service.getJobState('test-789');
      expect(updated?.status).toBe('processing');
      expect(updated?.progress).toBe(75);
    });

    it('should not update non-existent job', async () => {
      await service.updateJobState('non-existent', {
        status: 'processing',
      });

      const retrieved = await service.getJobState('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('deleteJobState', () => {
    it('should delete job state from Redis', async () => {
      const jobState: JobState = {
        promptId: 'test-delete',
        type: 'image_generation',
        userId: 'user-delete',
        status: 'completed',
        progress: 100,
        startedAt: Date.now(),
        serverUrl: 'http://localhost:8188',
      };

      await service.saveJobState(jobState);
      await service.deleteJobState('test-delete');

      const retrieved = await service.getJobState('test-delete');
      expect(retrieved).toBeNull();
    });
  });

  describe('recoverActiveJobs', () => {
    it('should recover active jobs from Redis', async () => {
      const now = Date.now();
      const activeJob: JobState = {
        promptId: 'active-1',
        type: 'image_generation',
        userId: 'user-1',
        status: 'processing',
        progress: 50,
        startedAt: now - 300000, // 5 minutes ago
        serverUrl: 'http://localhost:8188',
      };

      const oldJob: JobState = {
        promptId: 'old-1',
        type: 'image_generation',
        userId: 'user-1',
        status: 'processing',
        progress: 50,
        startedAt: now - 900000, // 15 minutes ago (older than maxRecoveryAge)
        serverUrl: 'http://localhost:8188',
      };

      await service.saveJobState(activeJob);
      await service.saveJobState(oldJob);

      const recovered = await service.recoverActiveJobs();

      expect(recovered.length).toBe(1);
      expect(recovered[0].promptId).toBe('active-1');
    });

    it('should skip completed jobs', async () => {
      const completedJob: JobState = {
        promptId: 'completed-1',
        type: 'image_generation',
        userId: 'user-1',
        status: 'completed',
        progress: 100,
        startedAt: Date.now() - 300000,
        serverUrl: 'http://localhost:8188',
      };

      await service.saveJobState(completedJob);

      const recovered = await service.recoverActiveJobs();
      expect(recovered.length).toBe(0);
    });
  });

  describe('isAvailable', () => {
    it('should return true when Redis is available', async () => {
      const available = await service.isAvailable();
      expect(available).toBe(true);
    });
  });
});
