import { describe, it, expect } from 'vitest';
import {
  ProviderError,
  TransientError,
  PermanentError,
  AIProviderError,
  UnknownError,
  categorizeHttpStatus,
  isRetryable,
  createTypedError,
} from './error-types';

describe('Error Types', () => {
  describe('TransientError', () => {
    it('should be retryable', () => {
      const error = new TransientError('timeout', undefined, undefined, 'modal');
      expect(error.retryable).toBe(true);
      expect(error.category).toBe('transient');
    });

    it('should convert to categorized error', () => {
      const error = new TransientError('timeout', undefined, 5000, 'modal');
      const categorized = error.toCategorized();
      
      expect(categorized.retryable).toBe(true);
      expect(categorized.retryAfterMs).toBe(5000);
      expect(categorized.provider).toBe('modal');
    });
  });

  describe('PermanentError', () => {
    it('should not be retryable', () => {
      const error = new PermanentError('invalid input', undefined, 'INVALID_INPUT', 'replicate');
      expect(error.retryable).toBe(false);
      expect(error.category).toBe('permanent');
    });
  });

  describe('AIProviderError', () => {
    it('should be retryable by default', () => {
      const error = new AIProviderError('server error', undefined, true, 'SERVER_ERROR', 'fal');
      expect(error.retryable).toBe(true);
      expect(error.category).toBe('provider');
    });

    it('should support non-retryable provider errors', () => {
      const error = new AIProviderError('model not found', undefined, false, 'MODEL_NOT_FOUND', 'fal');
      expect(error.retryable).toBe(false);
    });
  });

  describe('UnknownError', () => {
    it('should not be retryable', () => {
      const error = new UnknownError('something went wrong', undefined, 'modal');
      expect(error.retryable).toBe(false);
      expect(error.category).toBe('unknown');
    });
  });
});

describe('categorizeHttpStatus', () => {
  it('should categorize rate limit as transient', () => {
    expect(categorizeHttpStatus(429)).toBe('transient');
  });

  it('should categorize server errors as provider', () => {
    expect(categorizeHttpStatus(500)).toBe('provider');
    expect(categorizeHttpStatus(502)).toBe('provider');
    expect(categorizeHttpStatus(503)).toBe('provider');
  });

  it('should categorize client errors as permanent', () => {
    expect(categorizeHttpStatus(400)).toBe('permanent');
    expect(categorizeHttpStatus(401)).toBe('permanent');
    expect(categorizeHttpStatus(403)).toBe('permanent');
    expect(categorizeHttpStatus(404)).toBe('permanent');
  });

  it('should categorize other codes as unknown', () => {
    expect(categorizeHttpStatus(200)).toBe('unknown');
    expect(categorizeHttpStatus(301)).toBe('unknown');
  });
});

describe('isRetryable', () => {
  it('should return true for TransientError', () => {
    expect(isRetryable(new TransientError('timeout'))).toBe(true);
  });

  it('should return false for PermanentError', () => {
    expect(isRetryable(new PermanentError('invalid'))).toBe(false);
  });

  it('should return true for network-related errors', () => {
    expect(isRetryable(new Error('Connection timeout'))).toBe(true);
    expect(isRetryable(new Error('ECONNREFUSED'))).toBe(true);
    expect(isRetryable(new Error('ECONNRESET'))).toBe(true);
    expect(isRetryable(new Error('socket hang up'))).toBe(true);
    expect(isRetryable(new Error('network error'))).toBe(true);
  });

  it('should return false for other errors', () => {
    expect(isRetryable(new Error('some random error'))).toBe(false);
  });
});

describe('createTypedError', () => {
  it('should return ProviderError unchanged', () => {
    const original = new TransientError('timeout', undefined, undefined, 'modal');
    const typed = createTypedError(original, 'replicate');
    expect(typed).toBe(original);
  });

  it('should create TransientError for timeout', () => {
    const typed = createTypedError(new Error('Operation timeout'), 'modal');
    expect(typed).toBeInstanceOf(TransientError);
    expect(typed.provider).toBe('modal');
  });

  it('should create TransientError for rate limit', () => {
    const typed = createTypedError(new Error('Rate limit exceeded'), 'replicate');
    expect(typed).toBeInstanceOf(TransientError);
  });

  it('should create PermanentError for validation', () => {
    const typed = createTypedError(new Error('Validation failed'), 'fal');
    expect(typed).toBeInstanceOf(PermanentError);
  });

  it('should create PermanentError for unauthorized', () => {
    const typed = createTypedError(new Error('Unauthorized access'), 'modal');
    expect(typed).toBeInstanceOf(PermanentError);
  });

  it('should create AIProviderError for server errors', () => {
    const typed = createTypedError(new Error('Internal server error'), 'modal');
    expect(typed).toBeInstanceOf(AIProviderError);
    expect(typed.retryable).toBe(true);
  });

  it('should create UnknownError for unknown errors', () => {
    const typed = createTypedError(new Error('Something happened'), 'modal');
    expect(typed).toBeInstanceOf(UnknownError);
  });

  it('should handle string errors', () => {
    const typed = createTypedError('string error', 'modal');
    expect(typed).toBeInstanceOf(UnknownError);
    expect(typed.message).toBe('string error');
  });
});
