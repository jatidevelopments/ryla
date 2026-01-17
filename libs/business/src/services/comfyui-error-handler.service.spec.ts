/**
 * ComfyUI Error Handler Service Tests
 *
 * Unit tests for error handling and retry logic.
 *
 * @see EP-041: Enhanced Error Handling and Retry Logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComfyUIErrorHandlerService } from './comfyui-error-handler.service';
import { ErrorCategory } from '../interfaces/comfyui-error.interface';

describe('ComfyUIErrorHandlerService', () => {
  let handler: ComfyUIErrorHandlerService;

  beforeEach(() => {
    handler = new ComfyUIErrorHandlerService();
  });

  describe('shouldRetry', () => {
    it('should return true for transient errors', () => {
      const error = new Error('Network timeout');
      expect(handler.shouldRetry(error)).toBe(true);
    });

    it('should return true for recoverable errors', () => {
      const error = new Error('Node timeout occurred');
      expect(handler.shouldRetry(error)).toBe(true);
    });

    it('should return false for permanent errors', () => {
      const error = new Error('Validation error: 400 Bad Request');
      expect(handler.shouldRetry(error)).toBe(false);
    });

    it('should return false for fatal errors', () => {
      const error = new Error('Workflow validation failed');
      expect(handler.shouldRetry(error)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should return exponential backoff delays', () => {
      const delay1 = handler.getRetryDelay(1);
      const delay2 = handler.getRetryDelay(2);
      const delay3 = handler.getRetryDelay(3);

      expect(delay1).toBe(1000); // base
      expect(delay2).toBe(2000); // base * 2
      expect(delay3).toBe(4000); // base * 4
    });

    it('should cap delay at maximum', () => {
      const delay10 = handler.getRetryDelay(10);
      expect(delay10).toBeLessThanOrEqual(16000); // max
    });
  });

  describe('categorizeError', () => {
    it('should categorize network errors as transient', () => {
      const error = new Error('Network error');
      expect(handler.categorizeError(error)).toBe(ErrorCategory.TRANSIENT);
    });

    it('should categorize timeout errors as transient', () => {
      const error = new Error('ETIMEDOUT');
      expect(handler.categorizeError(error)).toBe(ErrorCategory.TRANSIENT);
    });

    it('should categorize 5xx errors as transient', () => {
      const error = new Error('500 Internal Server Error');
      expect(handler.categorizeError(error)).toBe(ErrorCategory.TRANSIENT);
    });

    it('should categorize 4xx errors as permanent', () => {
      const error = new Error('404 Not Found');
      expect(handler.categorizeError(error)).toBe(ErrorCategory.PERMANENT);
    });

    it('should categorize node timeout as recoverable', () => {
      const error = new Error('Node timeout occurred');
      expect(handler.categorizeError(error)).toBe(ErrorCategory.RECOVERABLE);
    });

    it('should categorize workflow validation as fatal', () => {
      const error = new Error('Workflow validation failed: invalid workflow');
      const category = handler.categorizeError(error);
      // Workflow validation with "invalid" or "validation" should be fatal
      expect(category).toBe(ErrorCategory.FATAL);
    });
  });

  describe('getFallbackStrategy', () => {
    it('should return WebSocket to REST fallback for WebSocket errors', () => {
      const error = new Error('WebSocket connection failed');
      const strategy = handler.getFallbackStrategy(error);
      expect(strategy).not.toBeNull();
      expect(strategy?.method).toBe('websocket_to_rest');
    });

    it('should return null for errors without fallback', () => {
      const error = new Error('Unknown error');
      const strategy = handler.getFallbackStrategy(error);
      expect(strategy).toBeNull();
    });
  });

  describe('checkHealth', () => {
    it('should return true for healthy server', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      const isHealthy = await handler.checkHealth('http://localhost:8188');
      expect(isHealthy).toBe(true);
    });

    it('should return false for unhealthy server', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      const isHealthy = await handler.checkHealth('http://localhost:8188');
      expect(isHealthy).toBe(false);
    });

    it('should return false on fetch error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const isHealthy = await handler.checkHealth('http://localhost:8188');
      expect(isHealthy).toBe(false);
    });
  });

  describe('executeWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const result = await handler.executeWithRetry(
        operation,
        'http://localhost:8188'
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on transient errors', async () => {
      let attempts = 0;
      const operation = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Network timeout');
        }
        return Promise.resolve('success');
      });
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const result = await handler.executeWithRetry(
        operation,
        'http://localhost:8188'
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on permanent errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('400 Bad Request'));

      await expect(
        handler.executeWithRetry(operation, 'http://localhost:8188')
      ).rejects.toThrow('400 Bad Request');

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Network timeout'));
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      await expect(
        handler.executeWithRetry(operation, 'http://localhost:8188')
      ).rejects.toThrow('Network timeout');

      expect(operation).toHaveBeenCalledTimes(3); // max retries
    });
  });
});
