/**
 * Job Supervisor Pattern
 * 
 * Implements Erlang/OTP-style supervision for background jobs.
 * Manages job lifecycle with restart strategies and failure isolation.
 * 
 * Restart Strategies:
 * - one-for-one: Restart only the failed job
 * - exponential-backoff: Increasing delay between retries
 * - circuit-breaker: Stop retries after threshold failures
 */

import { CircuitBreaker, CircuitBreakerOpenError } from './circuit-breaker';
import { Result, success, failure, isSuccess } from '@ryla/shared';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'retrying';

export interface JobConfig {
  /** Maximum number of retries */
  maxRetries: number;
  /** Initial retry delay in ms */
  initialRetryDelay: number;
  /** Maximum retry delay in ms */
  maxRetryDelay: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** Job timeout in ms */
  timeout: number;
  /** Whether to use circuit breaker */
  useCircuitBreaker: boolean;
}

export interface JobState<T = unknown> {
  id: string;
  status: JobStatus;
  result?: T;
  error?: Error;
  retryCount: number;
  startedAt?: Date;
  completedAt?: Date;
  nextRetryAt?: Date;
}

export interface SupervisorMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  retriedJobs: number;
  activeJobs: number;
  averageRetries: number;
}

const DEFAULT_JOB_CONFIG: JobConfig = {
  maxRetries: 3,
  initialRetryDelay: 1000, // 1 second
  maxRetryDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  timeout: 300000, // 5 minutes
  useCircuitBreaker: true,
};

export class JobSupervisor {
  private jobs: Map<string, JobState> = new Map();
  private circuitBreaker: CircuitBreaker;
  private config: JobConfig;
  private metrics: SupervisorMetrics = {
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    retriedJobs: 0,
    activeJobs: 0,
    averageRetries: 0,
  };

  constructor(
    private readonly name: string,
    config: Partial<JobConfig> = {}
  ) {
    this.config = { ...DEFAULT_JOB_CONFIG, ...config };
    this.circuitBreaker = new CircuitBreaker(`${name}-circuit`, {
      failureThreshold: 5,
      resetTimeout: 60000,
      successThreshold: 2,
      failureWindow: 120000,
    });
  }

  /**
   * Execute a job with supervision
   */
  async execute<T>(
    jobId: string,
    operation: () => Promise<T>,
    options: Partial<JobConfig> = {}
  ): Promise<Result<T, Error>> {
    const config = { ...this.config, ...options };
    
    // Initialize job state
    const state: JobState<T> = {
      id: jobId,
      status: 'pending',
      retryCount: 0,
      startedAt: new Date(),
    };
    this.jobs.set(jobId, state);
    this.metrics.totalJobs++;
    this.metrics.activeJobs++;

    try {
      const result = await this.executeWithRetry(jobId, operation, config);
      
      if (isSuccess(result)) {
        state.status = 'completed';
        state.result = result.data;
        state.completedAt = new Date();
        this.metrics.completedJobs++;
      } else {
        state.status = 'failed';
        state.error = result.error;
        state.completedAt = new Date();
        this.metrics.failedJobs++;
      }

      return result;
    } finally {
      this.metrics.activeJobs--;
      this.updateAverageRetries(state.retryCount);
    }
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetry<T>(
    jobId: string,
    operation: () => Promise<T>,
    config: JobConfig
  ): Promise<Result<T, Error>> {
    const state = this.jobs.get(jobId)!;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      state.retryCount = attempt;
      state.status = attempt === 0 ? 'running' : 'retrying';

      if (attempt > 0) {
        this.metrics.retriedJobs++;
        const delay = this.calculateDelay(attempt, config);
        state.nextRetryAt = new Date(Date.now() + delay);
        console.log(`[Supervisor:${this.name}] Job ${jobId} retry ${attempt}/${config.maxRetries} in ${delay}ms`);
        await this.sleep(delay);
      }

      try {
        // Check circuit breaker if enabled
        if (config.useCircuitBreaker && !this.circuitBreaker.isAllowed()) {
          throw new CircuitBreakerOpenError(
            `Circuit breaker for ${this.name} is open`
          );
        }

        // Execute with timeout
        const result = await this.executeWithTimeout(operation, config.timeout);
        
        // Record success in circuit breaker
        if (config.useCircuitBreaker) {
          this.circuitBreaker.reset();
        }

        return success(result);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[Supervisor:${this.name}] Job ${jobId} attempt ${attempt + 1} failed:`, lastError.message);

        // Check if error is retryable
        if (!this.isRetryable(lastError)) {
          console.log(`[Supervisor:${this.name}] Job ${jobId} error is not retryable`);
          break;
        }

        // Check circuit breaker open error - don't retry these
        if (lastError instanceof CircuitBreakerOpenError) {
          break;
        }
      }
    }

    return failure(lastError || new Error('Unknown error'));
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new JobTimeoutError(`Job timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      operation()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, config: JobConfig): number {
    const baseDelay = config.initialRetryDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    const delay = Math.min(baseDelay, config.maxRetryDelay);
    // Add jitter (0-500ms) to prevent thundering herd
    const jitter = Math.random() * 500;
    return delay + jitter;
  }

  /**
   * Check if an error is retryable
   */
  private isRetryable(error: Error): boolean {
    // Non-retryable error types
    const nonRetryableMessages = [
      'validation failed',
      'invalid input',
      'not found',
      'unauthorized',
      'forbidden',
      'bad request',
    ];

    const message = error.message.toLowerCase();
    return !nonRetryableMessages.some(m => message.includes(m));
  }

  /**
   * Get job state
   */
  getJobState(jobId: string): JobState | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): JobState[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get supervisor metrics
   */
  getMetrics(): SupervisorMetrics {
    return { ...this.metrics };
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState() {
    return this.circuitBreaker.getStats();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  /**
   * Clean up completed jobs older than maxAge
   */
  cleanup(maxAgeMs: number = 3600000): number {
    const cutoff = Date.now() - maxAgeMs;
    let cleaned = 0;

    for (const [id, state] of this.jobs.entries()) {
      if (
        (state.status === 'completed' || state.status === 'failed') &&
        state.completedAt &&
        state.completedAt.getTime() < cutoff
      ) {
        this.jobs.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  private updateAverageRetries(retryCount: number): void {
    const total = this.metrics.completedJobs + this.metrics.failedJobs;
    if (total === 0) {
      this.metrics.averageRetries = 0;
    } else {
      // Running average
      this.metrics.averageRetries = 
        (this.metrics.averageRetries * (total - 1) + retryCount) / total;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class JobTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JobTimeoutError';
  }
}
