/**
 * ComfyUI Error Handler Service
 *
 * Enhanced error handling with automatic retry logic, exponential backoff,
 * health checks, and error categorization.
 *
 * @see EP-041: Enhanced Error Handling and Retry Logic
 * @see IN-007: ComfyUI Infrastructure Improvements
 */

import { ErrorCategory, FallbackStrategy } from '../interfaces/comfyui-error.interface';
import type { ComfyUIPodClient } from './comfyui-pod-client';

export interface ComfyUIErrorHandlerConfig {
  /** Max retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay for exponential backoff in milliseconds (default: 1000) */
  backoffBase?: number;
  /** Max delay for exponential backoff in milliseconds (default: 16000) */
  backoffMax?: number;
  /** Health check timeout in milliseconds (default: 2000) */
  healthCheckTimeout?: number;
}

export class ComfyUIErrorHandlerService {
  private maxRetries: number;
  private backoffBase: number;
  private backoffMax: number;
  private healthCheckTimeout: number;

  constructor(config?: ComfyUIErrorHandlerConfig) {
    this.maxRetries = config?.maxRetries ?? 3;
    this.backoffBase = config?.backoffBase ?? 1000;
    this.backoffMax = config?.backoffMax ?? 16000;
    this.healthCheckTimeout = config?.healthCheckTimeout ?? 2000;
  }

  /**
   * Determine if error should be retried
   */
  shouldRetry(error: Error): boolean {
    const category = this.categorizeError(error);
    return category === ErrorCategory.TRANSIENT || category === ErrorCategory.RECOVERABLE;
  }

  /**
   * Get retry delay for attempt number (exponential backoff)
   * Formula: min(backoffBase * 2^(attempt-1), backoffMax)
   */
  getRetryDelay(attempt: number): number {
    const delay = Math.min(
      this.backoffBase * Math.pow(2, attempt - 1),
      this.backoffMax
    );
    return Math.round(delay);
  }

  /**
   * Check ComfyUI server health
   */
  async checkHealth(serverUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.healthCheckTimeout);

      const response = await fetch(`${serverUrl}/system_stats`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn(`Health check failed for ${serverUrl}: ${error}`);
      return false;
    }
  }

  /**
   * Categorize error type
   */
  categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors (transient)
    if (
      name.includes('network') ||
      name.includes('timeout') ||
      name.includes('econnrefused') ||
      name.includes('etimedout') ||
      message.includes('fetch failed') ||
      message.includes('network error')
    ) {
      return ErrorCategory.TRANSIENT;
    }

    // HTTP 5xx errors (transient)
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      return ErrorCategory.TRANSIENT;
    }

    // HTTP 4xx errors (permanent)
    if (
      message.includes('400') ||
      message.includes('401') ||
      message.includes('403') ||
      message.includes('404') ||
      message.includes('422') ||
      message.includes('validation')
    ) {
      return ErrorCategory.PERMANENT;
    }

    // Node timeout errors (recoverable)
    if (message.includes('node timeout') || message.includes('execution timeout')) {
      return ErrorCategory.RECOVERABLE;
    }

    // Workflow validation errors (fatal)
    if (message.includes('workflow') && (message.includes('invalid') || message.includes('validation'))) {
      return ErrorCategory.FATAL;
    }

    // Default: treat as transient (safer to retry)
    return ErrorCategory.TRANSIENT;
  }

  /**
   * Get fallback strategy for error
   */
  getFallbackStrategy(error: Error): FallbackStrategy | null {
    const message = error.message.toLowerCase();

    // WebSocket errors → fallback to REST
    if (message.includes('websocket') || message.includes('ws')) {
      return {
        method: 'websocket_to_rest',
        reason: 'WebSocket connection failed',
      };
    }

    // Model errors → fallback to secondary model
    if (message.includes('model') || message.includes('checkpoint')) {
      return {
        method: 'primary_to_secondary',
        reason: 'Primary model unavailable',
      };
    }

    // Workflow errors → fallback to simple workflow
    if (message.includes('workflow') || message.includes('node')) {
      return {
        method: 'optimized_to_simple',
        reason: 'Optimized workflow failed',
      };
    }

    return null;
  }

  /**
   * Execute operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    serverUrl: string,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Health check before retry (except first attempt)
        if (attempt > 1) {
          const isHealthy = await this.checkHealth(serverUrl);
          if (!isHealthy) {
            throw new Error('Server health check failed');
          }
        }

        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if should retry
        if (!this.shouldRetry(lastError) || attempt === this.maxRetries) {
          throw lastError;
        }

        // Calculate delay and wait
        const delay = this.getRetryDelay(attempt);
        if (onRetry) {
          onRetry(attempt, lastError);
        }

        console.log(
          `Retry attempt ${attempt}/${this.maxRetries} after ${delay}ms for error: ${lastError.message}`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }
}
