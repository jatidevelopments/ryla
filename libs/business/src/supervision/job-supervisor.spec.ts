import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JobSupervisor, JobTimeoutError } from './job-supervisor';
import { isSuccess, isFailure } from '@ryla/shared';

describe('JobSupervisor', () => {
  let supervisor: JobSupervisor;

  beforeEach(() => {
    supervisor = new JobSupervisor('test', {
      maxRetries: 2,
      initialRetryDelay: 10, // Short delays for testing
      maxRetryDelay: 50,
      backoffMultiplier: 2,
      timeout: 1000,
      useCircuitBreaker: false, // Disable for most tests
    });
  });

  describe('successful execution', () => {
    it('should execute and return success result', async () => {
      const result = await supervisor.execute('job-1', () => Promise.resolve('done'));
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe('done');
      }
    });

    it('should track job state', async () => {
      await supervisor.execute('job-1', () => Promise.resolve('done'));
      
      const state = supervisor.getJobState('job-1');
      expect(state).toBeDefined();
      expect(state?.status).toBe('completed');
      expect(state?.retryCount).toBe(0);
    });

    it('should update metrics on success', async () => {
      await supervisor.execute('job-1', () => Promise.resolve('done'));
      
      const metrics = supervisor.getMetrics();
      expect(metrics.totalJobs).toBe(1);
      expect(metrics.completedJobs).toBe(1);
      expect(metrics.failedJobs).toBe(0);
    });
  });

  describe('failure handling', () => {
    it('should return failure result after max retries', async () => {
      const result = await supervisor.execute('job-1', () => Promise.reject(new Error('fail')));
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.message).toBe('fail');
      }
    });

    it('should retry the configured number of times', async () => {
      let attempts = 0;
      const result = await supervisor.execute('job-1', () => {
        attempts++;
        return Promise.reject(new Error('fail'));
      });
      
      expect(attempts).toBe(3); // Initial + 2 retries
      expect(isFailure(result)).toBe(true);
    });

    it('should update metrics on failure', async () => {
      await supervisor.execute('job-1', () => Promise.reject(new Error('fail')));
      
      const metrics = supervisor.getMetrics();
      expect(metrics.failedJobs).toBe(1);
      expect(metrics.retriedJobs).toBe(2); // 2 retries
    });
  });

  describe('retry with recovery', () => {
    it('should succeed after transient failures', async () => {
      let attempts = 0;
      const result = await supervisor.execute('job-1', () => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('transient'));
        }
        return Promise.resolve('recovered');
      });
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe('recovered');
      }
      expect(attempts).toBe(3);
    });
  });

  describe('non-retryable errors', () => {
    it('should not retry validation errors', async () => {
      let attempts = 0;
      const result = await supervisor.execute('job-1', () => {
        attempts++;
        return Promise.reject(new Error('validation failed'));
      });
      
      expect(attempts).toBe(1); // No retries
      expect(isFailure(result)).toBe(true);
    });

    it('should not retry unauthorized errors', async () => {
      let attempts = 0;
      const result = await supervisor.execute('job-1', () => {
        attempts++;
        return Promise.reject(new Error('unauthorized'));
      });
      
      expect(attempts).toBe(1);
    });
  });

  describe('timeout', () => {
    it('should timeout long-running operations', async () => {
      const slowSupervisor = new JobSupervisor('slow-test', {
        maxRetries: 0,
        timeout: 50,
        useCircuitBreaker: false,
        initialRetryDelay: 10,
        maxRetryDelay: 50,
        backoffMultiplier: 2,
      });

      const result = await slowSupervisor.execute('job-1', () => 
        new Promise(resolve => setTimeout(() => resolve('done'), 200))
      );
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(JobTimeoutError);
      }
    });
  });

  describe('circuit breaker integration', () => {
    it('should use circuit breaker when enabled', async () => {
      const cbSupervisor = new JobSupervisor('cb-test', {
        maxRetries: 0,
        useCircuitBreaker: true,
        initialRetryDelay: 10,
        maxRetryDelay: 50,
        backoffMultiplier: 2,
        timeout: 1000,
      });

      // Initial state should be closed
      const cbState = cbSupervisor.getCircuitBreakerState();
      expect(cbState.state).toBe('CLOSED');
    });

    it('should reset circuit breaker', async () => {
      supervisor.resetCircuitBreaker();
      const state = supervisor.getCircuitBreakerState();
      expect(state.state).toBe('CLOSED');
    });
  });

  describe('cleanup', () => {
    it('should clean up old completed jobs', async () => {
      await supervisor.execute('job-1', () => Promise.resolve('done'));
      await supervisor.execute('job-2', () => Promise.resolve('done'));
      
      // Force the completedAt time to be old
      const state1 = supervisor.getJobState('job-1');
      const state2 = supervisor.getJobState('job-2');
      if (state1) state1.completedAt = new Date(Date.now() - 7200000); // 2 hours ago
      if (state2) state2.completedAt = new Date(Date.now() - 1800000); // 30 min ago

      const cleaned = supervisor.cleanup(3600000); // 1 hour max age
      
      expect(cleaned).toBe(1);
      expect(supervisor.getJobState('job-1')).toBeUndefined();
      expect(supervisor.getJobState('job-2')).toBeDefined();
    });
  });

  describe('getAllJobs', () => {
    it('should return all jobs', async () => {
      await supervisor.execute('job-1', () => Promise.resolve('done'));
      await supervisor.execute('job-2', () => Promise.reject(new Error('fail')));
      
      const jobs = supervisor.getAllJobs();
      expect(jobs.length).toBe(2);
    });
  });

  describe('metrics', () => {
    it('should calculate average retries', async () => {
      // Job with 0 retries
      await supervisor.execute('job-1', () => Promise.resolve('done'));
      
      // Job with 2 retries
      let attempts = 0;
      await supervisor.execute('job-2', () => {
        attempts++;
        if (attempts < 3) return Promise.reject(new Error('fail'));
        return Promise.resolve('done');
      });
      
      const metrics = supervisor.getMetrics();
      expect(metrics.averageRetries).toBe(1); // (0 + 2) / 2
    });

    it('should track active jobs', async () => {
      const slowOperation = new Promise(resolve => setTimeout(resolve, 100));
      
      const promise = supervisor.execute('job-1', () => slowOperation);
      
      // While running, activeJobs should be 1
      expect(supervisor.getMetrics().activeJobs).toBe(1);
      
      await promise;
      
      // After completion, activeJobs should be 0
      expect(supervisor.getMetrics().activeJobs).toBe(0);
    });
  });
});
