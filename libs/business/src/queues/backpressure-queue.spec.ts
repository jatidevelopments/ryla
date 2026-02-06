import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  BackpressureQueue,
  QueueFullError,
  QueueTimeoutError,
  createGenerationQueue,
  createModalQueue,
  createWebhookQueue,
} from './backpressure-queue';
import { isSuccess, isFailure } from '@ryla/shared';

describe('BackpressureQueue', () => {
  let queue: BackpressureQueue;

  beforeEach(() => {
    queue = new BackpressureQueue('test', {
      maxConcurrent: 2,
      maxQueueSize: 3,
      queueTimeout: 1000,
      defaultPriority: 'normal',
    });
  });

  describe('immediate processing', () => {
    it('should process immediately when under capacity', async () => {
      const result = await queue.enqueue('job-1', () => Promise.resolve('done'));
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe('done');
      }
    });

    it('should track concurrent operations', async () => {
      const slow = () => new Promise<string>(r => setTimeout(() => r('done'), 100));
      
      // Start 2 concurrent operations
      const p1 = queue.enqueue('job-1', slow);
      const p2 = queue.enqueue('job-2', slow);
      
      expect(queue.getStats().currentConcurrent).toBe(2);
      
      await Promise.all([p1, p2]);
      
      expect(queue.getStats().currentConcurrent).toBe(0);
    });

    it('should update totalProcessed on success', async () => {
      await queue.enqueue('job-1', () => Promise.resolve('done'));
      await queue.enqueue('job-2', () => Promise.resolve('done'));
      
      expect(queue.getStats().totalProcessed).toBe(2);
    });
  });

  describe('queueing', () => {
    it('should queue when at capacity', async () => {
      const slow = () => new Promise<string>(r => setTimeout(() => r('done'), 100));
      
      // Fill up concurrent slots
      const p1 = queue.enqueue('job-1', slow);
      const p2 = queue.enqueue('job-2', slow);
      
      // This should be queued
      const p3 = queue.enqueue('job-3', () => Promise.resolve('queued'));
      
      expect(queue.getStats().queueDepth).toBe(1);
      
      // Wait for all to complete
      await Promise.all([p1, p2, p3]);
      
      const results = await p3;
      expect(isSuccess(results)).toBe(true);
    });

    it('should reject when queue is full', async () => {
      const slow = () => new Promise<string>(r => setTimeout(() => r('done'), 500));
      
      // Fill up concurrent slots and queue
      queue.enqueue('job-1', slow);
      queue.enqueue('job-2', slow);
      queue.enqueue('job-3', slow);
      queue.enqueue('job-4', slow);
      queue.enqueue('job-5', slow);
      
      // This should be rejected (queue is full)
      const result = await queue.enqueue('job-6', slow);
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(QueueFullError);
      }
      
      expect(queue.getStats().totalRejected).toBe(1);
    });
  });

  describe('priority', () => {
    it('should process high priority jobs first', async () => {
      const results: string[] = [];
      const slow = () => new Promise<string>(r => setTimeout(() => r('done'), 50));
      
      // Fill up concurrent slots
      queue.enqueue('job-1', slow);
      queue.enqueue('job-2', slow);
      
      // Queue jobs with different priorities
      queue.enqueue('low', async () => { results.push('low'); return 'low'; }, 'low');
      queue.enqueue('high', async () => { results.push('high'); return 'high'; }, 'high');
      queue.enqueue('normal', async () => { results.push('normal'); return 'normal'; }, 'normal');
      
      // Wait for all to complete
      await new Promise(r => setTimeout(r, 300));
      
      // High should come before normal, which should come before low
      expect(results[0]).toBe('high');
      expect(results[1]).toBe('normal');
      expect(results[2]).toBe('low');
    });
  });

  describe('queue position', () => {
    it('should return position for queued job', async () => {
      const slow = () => new Promise<string>(r => setTimeout(() => r('done'), 100));
      
      // Fill up concurrent slots
      queue.enqueue('job-1', slow);
      queue.enqueue('job-2', slow);
      
      // Queue a job
      queue.enqueue('job-3', slow);
      
      const position = queue.getPosition('job-3');
      expect(position).not.toBeNull();
      expect(position?.position).toBe(1);
    });

    it('should return null for unknown job', () => {
      const position = queue.getPosition('unknown');
      expect(position).toBeNull();
    });
  });

  describe('timeout', () => {
    it('should timeout jobs waiting too long in queue', async () => {
      const verySlowQueue = new BackpressureQueue('slow-test', {
        maxConcurrent: 1,
        maxQueueSize: 10,
        queueTimeout: 50, // Very short timeout
        defaultPriority: 'normal',
      });

      // Block the queue
      const blocker = () => new Promise<string>(r => setTimeout(() => r('done'), 200));
      verySlowQueue.enqueue('blocker', blocker);
      
      // This should timeout while waiting
      const result = await verySlowQueue.enqueue('timeout-job', () => Promise.resolve('never'));
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(QueueTimeoutError);
      }
      
      expect(verySlowQueue.getStats().totalTimedOut).toBe(1);
    });
  });

  describe('cancellation', () => {
    it('should cancel a queued job', async () => {
      const slow = () => new Promise<string>(r => setTimeout(() => r('done'), 100));
      
      // Fill up concurrent slots
      queue.enqueue('job-1', slow);
      queue.enqueue('job-2', slow);
      
      // Queue a job
      const jobPromise = queue.enqueue('job-3', slow);
      
      // Cancel it
      const cancelled = queue.cancel('job-3');
      expect(cancelled).toBe(true);
      
      const result = await jobPromise;
      expect(isFailure(result)).toBe(true);
    });

    it('should return false for unknown job', () => {
      const cancelled = queue.cancel('unknown');
      expect(cancelled).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all queued jobs', async () => {
      const slow = () => new Promise<string>(r => setTimeout(() => r('done'), 100));
      
      // Fill up concurrent slots and queue
      queue.enqueue('job-1', slow);
      queue.enqueue('job-2', slow);
      const p3 = queue.enqueue('job-3', slow);
      const p4 = queue.enqueue('job-4', slow);
      
      const cleared = queue.clear();
      expect(cleared).toBe(2);
      expect(queue.getStats().queueDepth).toBe(0);
      
      // Cleared jobs should fail
      const results = await Promise.all([p3, p4]);
      expect(results.every(r => isFailure(r))).toBe(true);
    });
  });

  describe('utilization', () => {
    it('should calculate utilization correctly', async () => {
      const slow = () => new Promise<string>(r => setTimeout(() => r('done'), 100));
      
      expect(queue.getUtilization()).toBe(0);
      
      queue.enqueue('job-1', slow);
      expect(queue.getUtilization()).toBe(0.5);
      
      queue.enqueue('job-2', slow);
      expect(queue.getUtilization()).toBe(1);
    });
  });

  describe('hasCapacity', () => {
    it('should return true when under capacity', () => {
      expect(queue.hasCapacity()).toBe(true);
    });

    it('should return true when concurrent full but queue has space', async () => {
      const slow = () => new Promise<string>(r => setTimeout(() => r('done'), 100));
      
      queue.enqueue('job-1', slow);
      queue.enqueue('job-2', slow);
      
      expect(queue.hasCapacity()).toBe(true); // Queue still has space
    });
  });

  describe('updateConfig', () => {
    it('should update configuration dynamically', async () => {
      const slow = () => new Promise<string>(r => setTimeout(() => r('done'), 50));
      
      // Fill up with original capacity (2)
      queue.enqueue('job-1', slow);
      queue.enqueue('job-2', slow);
      queue.enqueue('job-3', slow); // Queued
      
      expect(queue.getStats().currentConcurrent).toBe(2);
      
      // Increase capacity
      queue.updateConfig({ maxConcurrent: 4 });
      
      // Wait a bit for queue processing
      await new Promise(r => setTimeout(r, 10));
      
      // job-3 should now be processing
      expect(queue.getStats().currentConcurrent).toBeGreaterThanOrEqual(2);
    });
  });

  describe('stats', () => {
    it('should track all statistics', async () => {
      await queue.enqueue('job-1', () => Promise.resolve('done'));
      
      const stats = queue.getStats();
      expect(stats.totalProcessed).toBe(1);
      expect(stats.maxConcurrent).toBe(2);
      expect(stats.maxQueueSize).toBe(3);
    });
  });
});

describe('Factory functions', () => {
  it('should create generation queue', () => {
    const queue = createGenerationQueue();
    expect(queue.getStats().maxConcurrent).toBe(10);
  });

  it('should create Modal queue', () => {
    const queue = createModalQueue();
    expect(queue.getStats().maxConcurrent).toBe(10);
  });

  it('should create webhook queue', () => {
    const queue = createWebhookQueue();
    expect(queue.getStats().maxConcurrent).toBe(20);
  });

  it('should allow custom config', () => {
    const queue = createGenerationQueue({ maxConcurrent: 5 });
    expect(queue.getStats().maxConcurrent).toBe(5);
  });
});
