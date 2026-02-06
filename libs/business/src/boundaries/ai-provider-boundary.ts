/**
 * AI Provider Boundary
 * 
 * Wraps AI provider calls with structured error handling and retry logic.
 * Implements "let it crash" style: catch errors, categorize, log, and return Result.
 * 
 * Usage:
 * ```typescript
 * const boundary = new AIProviderBoundary('modal');
 * const result = await boundary.run(() => modalClient.generate(input));
 * if (isSuccess(result)) {
 *   // Handle success
 * } else {
 *   // Handle failure with typed error
 * }
 * ```
 */

import { Result, success, failure } from '@ryla/shared';
import {
  ProviderError,
  TransientError,
  PermanentError,
  AIProviderError,
  createTypedError,
  isRetryable,
  CategorizedError,
} from './error-types';

export interface BoundaryConfig {
  /** Maximum number of retries for transient errors */
  maxRetries: number;
  /** Initial retry delay in ms */
  initialRetryDelay: number;
  /** Maximum retry delay in ms */
  maxRetryDelay: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** Operation timeout in ms */
  timeout: number;
  /** Whether to log errors */
  logErrors: boolean;
}

const DEFAULT_CONFIG: BoundaryConfig = {
  maxRetries: 3,
  initialRetryDelay: 1000,
  maxRetryDelay: 10000,
  backoffMultiplier: 2,
  timeout: 120000, // 2 minutes
  logErrors: true,
};

export interface BoundaryMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  retriedCalls: number;
  averageLatencyMs: number;
  errorsByCategory: Record<string, number>;
}

export class AIProviderBoundary {
  private config: BoundaryConfig;
  private metrics: BoundaryMetrics = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    retriedCalls: 0,
    averageLatencyMs: 0,
    errorsByCategory: {},
  };
  private latencies: number[] = [];

  constructor(
    private readonly providerName: string,
    config: Partial<BoundaryConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute an operation with error boundary
   */
  async run<T>(
    operation: () => Promise<T>,
    options: Partial<BoundaryConfig> = {}
  ): Promise<Result<T, CategorizedError>> {
    const config = { ...this.config, ...options };
    const startTime = Date.now();
    this.metrics.totalCalls++;

    let lastError: ProviderError | undefined;
    let attempts = 0;

    while (attempts <= config.maxRetries) {
      try {
        const result = await this.executeWithTimeout(operation, config.timeout);
        
        // Record success
        this.recordSuccess(Date.now() - startTime);
        
        return success(result);
      } catch (error) {
        attempts++;
        lastError = createTypedError(error, this.providerName);
        
        if (config.logErrors) {
          this.logError(lastError, attempts);
        }

        // Check if we should retry
        if (attempts <= config.maxRetries && isRetryable(lastError)) {
          this.metrics.retriedCalls++;
          const delay = this.calculateDelay(attempts, config, lastError);
          await this.sleep(delay);
          continue;
        }

        // No more retries
        break;
      }
    }

    // Record failure
    this.recordFailure(lastError!);

    return failure(lastError!.toCategorized());
  }

  /**
   * Execute an operation without retry (single attempt)
   */
  async runOnce<T>(
    operation: () => Promise<T>
  ): Promise<Result<T, CategorizedError>> {
    return this.run(operation, { maxRetries: 0 });
  }

  /**
   * Execute with custom error handler
   */
  async runWithHandler<T>(
    operation: () => Promise<T>,
    onError: (error: CategorizedError) => void
  ): Promise<Result<T, CategorizedError>> {
    const result = await this.run(operation);
    
    if (!result.success) {
      onError(result.error);
    }
    
    return result;
  }

  /**
   * Execute and throw on failure (for cases where Result doesn't fit)
   */
  async runOrThrow<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.run(operation);
    
    if (result.success) {
      return result.data;
    }
    
    throw new ProviderError(
      result.error.message,
      result.error.category,
      result.error.retryable,
      result.error.originalError,
      result.error.errorCode,
      result.error.retryAfterMs,
      result.error.provider
    );
  }

  /**
   * Get metrics
   */
  getMetrics(): BoundaryMetrics {
    return {
      ...this.metrics,
      averageLatencyMs: this.calculateAverageLatency(),
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      retriedCalls: 0,
      averageLatencyMs: 0,
      errorsByCategory: {},
    };
    this.latencies = [];
  }

  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new TransientError(`Operation timed out after ${timeoutMs}ms`, undefined, undefined, this.providerName));
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

  private calculateDelay(
    attempt: number,
    config: BoundaryConfig,
    error: ProviderError
  ): number {
    // Use retry-after if provided
    if (error.retryAfterMs) {
      return error.retryAfterMs;
    }

    // Exponential backoff with jitter
    const baseDelay = config.initialRetryDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    const delay = Math.min(baseDelay, config.maxRetryDelay);
    const jitter = Math.random() * 500; // 0-500ms jitter
    
    return delay + jitter;
  }

  private recordSuccess(latencyMs: number): void {
    this.metrics.successfulCalls++;
    this.latencies.push(latencyMs);
    
    // Keep only last 100 latencies for memory efficiency
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }
  }

  private recordFailure(error: ProviderError): void {
    this.metrics.failedCalls++;
    this.metrics.errorsByCategory[error.category] = 
      (this.metrics.errorsByCategory[error.category] || 0) + 1;
  }

  private calculateAverageLatency(): number {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((a, b) => a + b, 0);
    return sum / this.latencies.length;
  }

  private logError(error: ProviderError, attempt: number): void {
    const prefix = `[${this.providerName}:Boundary]`;
    
    if (isRetryable(error)) {
      console.warn(`${prefix} Attempt ${attempt} failed (retryable): ${error.message}`);
    } else {
      console.error(`${prefix} Attempt ${attempt} failed (not retryable): ${error.message}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a pre-configured boundary for Modal.com
 */
export function createModalBoundary(config: Partial<BoundaryConfig> = {}): AIProviderBoundary {
  return new AIProviderBoundary('modal', {
    maxRetries: 3,
    timeout: 180000, // 3 minutes for GPU operations
    ...config,
  });
}

/**
 * Create a pre-configured boundary for Replicate
 */
export function createReplicateBoundary(config: Partial<BoundaryConfig> = {}): AIProviderBoundary {
  return new AIProviderBoundary('replicate', {
    maxRetries: 2,
    timeout: 300000, // 5 minutes for long predictions
    ...config,
  });
}

/**
 * Create a pre-configured boundary for Fal.ai
 */
export function createFalBoundary(config: Partial<BoundaryConfig> = {}): AIProviderBoundary {
  return new AIProviderBoundary('fal', {
    maxRetries: 3,
    timeout: 120000, // 2 minutes
    ...config,
  });
}

/**
 * Create a pre-configured boundary for ComfyUI
 */
export function createComfyUIBoundary(config: Partial<BoundaryConfig> = {}): AIProviderBoundary {
  return new AIProviderBoundary('comfyui', {
    maxRetries: 2,
    timeout: 600000, // 10 minutes for complex workflows
    ...config,
  });
}
