/**
 * Error types for AI provider calls
 * 
 * Categorizes errors to determine retry behavior:
 * - Transient: Network issues, timeouts, rate limits (retryable)
 * - Permanent: Invalid input, auth failure (not retryable)
 * - Provider: AI provider internal error (may be retryable)
 * - Unknown: Unexpected error (log and fail)
 */

export type ErrorCategory = 'transient' | 'permanent' | 'provider' | 'unknown';

export interface CategorizedError {
  category: ErrorCategory;
  message: string;
  originalError: Error;
  retryable: boolean;
  retryAfterMs?: number;
  errorCode?: string;
  provider?: string;
}

/**
 * Base class for provider errors with category
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly category: ErrorCategory,
    public readonly retryable: boolean,
    public readonly originalError?: Error,
    public readonly errorCode?: string,
    public readonly retryAfterMs?: number,
    public readonly provider?: string,
  ) {
    super(message);
    this.name = 'ProviderError';
  }

  toCategorized(): CategorizedError {
    return {
      category: this.category,
      message: this.message,
      originalError: this.originalError || this,
      retryable: this.retryable,
      retryAfterMs: this.retryAfterMs,
      errorCode: this.errorCode,
      provider: this.provider,
    };
  }
}

/**
 * Transient error - network issues, timeouts, rate limits
 */
export class TransientError extends ProviderError {
  constructor(
    message: string,
    originalError?: Error,
    retryAfterMs?: number,
    provider?: string,
  ) {
    super(message, 'transient', true, originalError, 'TRANSIENT', retryAfterMs, provider);
    this.name = 'TransientError';
  }
}

/**
 * Permanent error - invalid input, auth failure
 */
export class PermanentError extends ProviderError {
  constructor(
    message: string,
    originalError?: Error,
    errorCode?: string,
    provider?: string,
  ) {
    super(message, 'permanent', false, originalError, errorCode || 'PERMANENT', undefined, provider);
    this.name = 'PermanentError';
  }
}

/**
 * Provider internal error - may be retryable
 */
export class AIProviderError extends ProviderError {
  constructor(
    message: string,
    originalError?: Error,
    retryable: boolean = true,
    errorCode?: string,
    provider?: string,
  ) {
    super(message, 'provider', retryable, originalError, errorCode || 'PROVIDER_ERROR', undefined, provider);
    this.name = 'AIProviderError';
  }
}

/**
 * Unknown error - unexpected, should be logged
 */
export class UnknownError extends ProviderError {
  constructor(
    message: string,
    originalError?: Error,
    provider?: string,
  ) {
    super(message, 'unknown', false, originalError, 'UNKNOWN', undefined, provider);
    this.name = 'UnknownError';
  }
}

/**
 * Categorize an HTTP status code
 */
export function categorizeHttpStatus(status: number): ErrorCategory {
  if (status === 429) return 'transient'; // Rate limit
  if (status >= 500 && status < 600) return 'provider'; // Server error
  if (status >= 400 && status < 500) return 'permanent'; // Client error
  return 'unknown';
}

/**
 * Check if an error is retryable based on category
 */
export function isRetryable(error: Error): boolean {
  if (error instanceof ProviderError) {
    return error.retryable;
  }
  
  // Network errors are typically retryable
  const message = error.message.toLowerCase();
  if (
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('socket hang up')
  ) {
    return true;
  }
  
  return false;
}

/**
 * Create a typed error from a raw error
 */
export function createTypedError(
  error: unknown,
  provider?: string
): ProviderError {
  if (error instanceof ProviderError) {
    return error;
  }

  const err = error instanceof Error ? error : new Error(String(error));
  const message = err.message.toLowerCase();

  // Check for transient errors
  if (
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('econnrefused') ||
    message.includes('rate limit') ||
    message.includes('too many requests')
  ) {
    return new TransientError(err.message, err, undefined, provider);
  }

  // Check for permanent errors
  if (
    message.includes('invalid') ||
    message.includes('validation') ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('not found')
  ) {
    return new PermanentError(err.message, err, undefined, provider);
  }

  // Check for provider errors
  if (
    message.includes('server error') ||
    message.includes('internal error') ||
    message.includes('service unavailable')
  ) {
    return new AIProviderError(err.message, err, true, undefined, provider);
  }

  // Default to unknown
  return new UnknownError(err.message, err, provider);
}
