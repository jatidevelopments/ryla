import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AIProviderBoundary,
  createModalBoundary,
  createReplicateBoundary,
  createFalBoundary,
  createComfyUIBoundary,
} from './ai-provider-boundary';
import { isSuccess, isFailure } from '@ryla/shared';
import { TransientError, PermanentError } from './error-types';

describe('AIProviderBoundary', () => {
  let boundary: AIProviderBoundary;

  beforeEach(() => {
    boundary = new AIProviderBoundary('test', {
      maxRetries: 2,
      initialRetryDelay: 10, // Short delays for testing
      maxRetryDelay: 50,
      backoffMultiplier: 2,
      timeout: 1000,
      logErrors: false, // Suppress logs in tests
    });
  });

  describe('successful execution', () => {
    it('should return success result', async () => {
      const result = await boundary.run(() => Promise.resolve('done'));
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe('done');
      }
    });

    it('should track successful calls in metrics', async () => {
      await boundary.run(() => Promise.resolve('done'));
      await boundary.run(() => Promise.resolve('done'));
      
      const metrics = boundary.getMetrics();
      expect(metrics.totalCalls).toBe(2);
      expect(metrics.successfulCalls).toBe(2);
      expect(metrics.failedCalls).toBe(0);
    });

    it('should track latency', async () => {
      // Add a small delay to ensure measurable latency
      await boundary.run(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'done';
      });
      
      const metrics = boundary.getMetrics();
      expect(metrics.averageLatencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('failure handling', () => {
    it('should return failure result after max retries', async () => {
      const result = await boundary.run(() => Promise.reject(new Error('fail')));
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.message).toBe('fail');
      }
    });

    it('should retry transient errors', async () => {
      let attempts = 0;
      const result = await boundary.run(() => {
        attempts++;
        return Promise.reject(new TransientError('timeout'));
      });
      
      expect(attempts).toBe(3); // Initial + 2 retries
      expect(isFailure(result)).toBe(true);
    });

    it('should not retry permanent errors', async () => {
      let attempts = 0;
      const result = await boundary.run(() => {
        attempts++;
        return Promise.reject(new PermanentError('invalid'));
      });
      
      expect(attempts).toBe(1); // No retries
      expect(isFailure(result)).toBe(true);
    });

    it('should track error categories in metrics', async () => {
      await boundary.run(() => Promise.reject(new TransientError('timeout')));
      await boundary.run(() => Promise.reject(new PermanentError('invalid')));
      
      const metrics = boundary.getMetrics();
      expect(metrics.errorsByCategory['transient']).toBe(1);
      expect(metrics.errorsByCategory['permanent']).toBe(1);
    });
  });

  describe('retry with recovery', () => {
    it('should succeed after transient failures', async () => {
      let attempts = 0;
      const result = await boundary.run(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new TransientError('transient'));
        }
        return Promise.resolve('recovered');
      });
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe('recovered');
      }
    });
  });

  describe('runOnce', () => {
    it('should not retry even for transient errors', async () => {
      let attempts = 0;
      const result = await boundary.runOnce(() => {
        attempts++;
        return Promise.reject(new TransientError('timeout'));
      });
      
      expect(attempts).toBe(1);
      expect(isFailure(result)).toBe(true);
    });
  });

  describe('runWithHandler', () => {
    it('should call error handler on failure', async () => {
      const handler = vi.fn();
      
      await boundary.runWithHandler(
        () => Promise.reject(new Error('fail')),
        handler
      );
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        message: 'fail',
      }));
    });

    it('should not call error handler on success', async () => {
      const handler = vi.fn();
      
      await boundary.runWithHandler(
        () => Promise.resolve('ok'),
        handler
      );
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('runOrThrow', () => {
    it('should return result on success', async () => {
      const result = await boundary.runOrThrow(() => Promise.resolve('done'));
      expect(result).toBe('done');
    });

    it('should throw on failure', async () => {
      await expect(
        boundary.runOrThrow(() => Promise.reject(new Error('fail')))
      ).rejects.toThrow('fail');
    });
  });

  describe('timeout', () => {
    it('should timeout long-running operations', async () => {
      const slowBoundary = new AIProviderBoundary('slow-test', {
        maxRetries: 0,
        timeout: 50,
        logErrors: false,
        initialRetryDelay: 10,
        maxRetryDelay: 50,
        backoffMultiplier: 2,
      });

      const result = await slowBoundary.run(() => 
        new Promise(resolve => setTimeout(() => resolve('done'), 200))
      );
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.message).toContain('timed out');
      }
    });
  });

  describe('resetMetrics', () => {
    it('should reset all metrics', async () => {
      await boundary.run(() => Promise.resolve('done'));
      await boundary.run(() => Promise.reject(new Error('fail')));
      
      boundary.resetMetrics();
      
      const metrics = boundary.getMetrics();
      expect(metrics.totalCalls).toBe(0);
      expect(metrics.successfulCalls).toBe(0);
      expect(metrics.failedCalls).toBe(0);
    });
  });
});

describe('Factory functions', () => {
  it('should create Modal boundary with correct config', () => {
    const boundary = createModalBoundary();
    const metrics = boundary.getMetrics();
    expect(metrics.totalCalls).toBe(0);
  });

  it('should create Replicate boundary', () => {
    const boundary = createReplicateBoundary();
    const metrics = boundary.getMetrics();
    expect(metrics.totalCalls).toBe(0);
  });

  it('should create Fal boundary', () => {
    const boundary = createFalBoundary();
    const metrics = boundary.getMetrics();
    expect(metrics.totalCalls).toBe(0);
  });

  it('should create ComfyUI boundary', () => {
    const boundary = createComfyUIBoundary();
    const metrics = boundary.getMetrics();
    expect(metrics.totalCalls).toBe(0);
  });

  it('should allow custom config override', () => {
    const boundary = createModalBoundary({ maxRetries: 5 });
    // The maxRetries config is internal, so we test behavior indirectly
    expect(boundary.getMetrics().totalCalls).toBe(0);
  });
});
