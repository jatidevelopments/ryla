/**
 * ComfyUI Error Handling Interfaces
 *
 * TypeScript interfaces for error handling and retry logic.
 *
 * @see EP-041: Enhanced Error Handling and Retry Logic
 */

/**
 * Error categories for determining retry strategy
 */
export enum ErrorCategory {
  /** Transient errors - should retry (network, timeout, 5xx) */
  TRANSIENT = 'transient',
  /** Permanent errors - don't retry (4xx, validation) */
  PERMANENT = 'permanent',
  /** Recoverable errors - can retry (node timeout) */
  RECOVERABLE = 'recoverable',
  /** Fatal errors - don't retry (workflow validation) */
  FATAL = 'fatal',
}

/**
 * Retry state for tracking retry attempts
 */
export interface RetryState {
  attempt: number;
  maxAttempts: number;
  lastError: Error;
  nextRetryAt: number;  // timestamp
}

/**
 * Fallback strategy for graceful degradation
 */
export interface FallbackStrategy {
  method: 'websocket_to_rest' | 'primary_to_secondary' | 'optimized_to_simple';
  reason: string;
}
