import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CircuitBreaker, CircuitBreakerOpenError } from './circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test', {
      failureThreshold: 3,
      resetTimeout: 1000,
      successThreshold: 2,
      failureWindow: 5000,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start in CLOSED state', () => {
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should allow requests in CLOSED state', () => {
      expect(breaker.isAllowed()).toBe(true);
    });
  });

  describe('successful operations', () => {
    it('should execute operations in CLOSED state', async () => {
      const result = await breaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should track success count', async () => {
      await breaker.execute(() => Promise.resolve('ok'));
      await breaker.execute(() => Promise.resolve('ok'));
      
      const stats = breaker.getStats();
      expect(stats.totalSuccesses).toBe(2);
      expect(stats.totalRequests).toBe(2);
    });
  });

  describe('failure handling', () => {
    it('should stay CLOSED under failure threshold', async () => {
      for (let i = 0; i < 2; i++) {
        await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      }
      
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should open after reaching failure threshold', async () => {
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      }
      
      expect(breaker.getState()).toBe('OPEN');
    });

    it('should reject requests when OPEN', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      }

      await expect(breaker.execute(() => Promise.resolve('ok'))).rejects.toThrow(CircuitBreakerOpenError);
    });
  });

  describe('recovery', () => {
    it('should transition to HALF_OPEN after reset timeout', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      }
      expect(breaker.getState()).toBe('OPEN');

      // Advance time past reset timeout
      vi.advanceTimersByTime(1100);

      // Should allow requests now (transitions to HALF_OPEN on next check)
      expect(breaker.isAllowed()).toBe(true);
    });

    it('should close after success threshold in HALF_OPEN', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      }

      // Advance time to allow HALF_OPEN
      vi.advanceTimersByTime(1100);

      // Execute successful operations
      await breaker.execute(() => Promise.resolve('ok'));
      expect(breaker.getState()).toBe('HALF_OPEN');

      await breaker.execute(() => Promise.resolve('ok'));
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should reopen on failure in HALF_OPEN', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      }

      // Advance time to allow HALF_OPEN
      vi.advanceTimersByTime(1100);

      // First request transitions to HALF_OPEN, then fail
      await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      
      expect(breaker.getState()).toBe('OPEN');
    });
  });

  describe('reset', () => {
    it('should reset to CLOSED state', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      }
      expect(breaker.getState()).toBe('OPEN');

      breaker.reset();

      expect(breaker.getState()).toBe('CLOSED');
      expect(breaker.isAllowed()).toBe(true);
    });
  });

  describe('failure window', () => {
    it('should only count failures within the window', async () => {
      // First failure
      await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      
      // Advance time past failure window
      vi.advanceTimersByTime(6000);
      
      // Two more failures (total of 2 in window, not 3)
      await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      
      // Should still be CLOSED (only 2 failures in window)
      expect(breaker.getState()).toBe('CLOSED');
    });
  });

  describe('statistics', () => {
    it('should track all metrics', async () => {
      await breaker.execute(() => Promise.resolve('ok'));
      await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
      await breaker.execute(() => Promise.resolve('ok'));

      const stats = breaker.getStats();
      expect(stats.totalRequests).toBe(3);
      expect(stats.totalSuccesses).toBe(2);
      expect(stats.totalFailures).toBe(1);
      expect(stats.lastSuccessTime).not.toBeNull();
      expect(stats.lastFailureTime).not.toBeNull();
    });
  });
});
