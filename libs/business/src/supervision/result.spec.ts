import { describe, it, expect } from 'vitest';
import {
  success,
  failure,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  mapResult,
  mapError,
  flatMap,
  fromPromise,
  fromTry,
} from '@ryla/shared';

describe('Result type utilities', () => {
  describe('success', () => {
    it('should create a success result', () => {
      const result = success('hello');
      expect(result.success).toBe(true);
      expect(result.data).toBe('hello');
    });
  });

  describe('failure', () => {
    it('should create a failure result', () => {
      const error = new Error('oops');
      const result = failure(error);
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('isSuccess', () => {
    it('should return true for success results', () => {
      expect(isSuccess(success('ok'))).toBe(true);
      expect(isSuccess(failure(new Error('fail')))).toBe(false);
    });
  });

  describe('isFailure', () => {
    it('should return true for failure results', () => {
      expect(isFailure(failure(new Error('fail')))).toBe(true);
      expect(isFailure(success('ok'))).toBe(false);
    });
  });

  describe('unwrap', () => {
    it('should return data for success', () => {
      expect(unwrap(success('hello'))).toBe('hello');
    });

    it('should throw for failure', () => {
      const error = new Error('boom');
      expect(() => unwrap(failure(error))).toThrow('boom');
    });
  });

  describe('unwrapOr', () => {
    it('should return data for success', () => {
      expect(unwrapOr(success('hello'), 'default')).toBe('hello');
    });

    it('should return default for failure', () => {
      expect(unwrapOr(failure(new Error('fail')), 'default')).toBe('default');
    });
  });

  describe('mapResult', () => {
    it('should map success value', () => {
      const result = mapResult(success(5), (n) => n * 2);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe(10);
      }
    });

    it('should pass through failure', () => {
      const error = new Error('fail');
      const result = mapResult(failure<number, Error>(error), (n) => n * 2);
      expect(isFailure(result)).toBe(true);
    });
  });

  describe('mapError', () => {
    it('should map error', () => {
      const result = mapError(failure(new Error('original')), (e) => new Error(`wrapped: ${e.message}`));
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.message).toBe('wrapped: original');
      }
    });

    it('should pass through success', () => {
      const result = mapError(success('ok'), () => new Error('should not happen'));
      expect(isSuccess(result)).toBe(true);
    });
  });

  describe('flatMap', () => {
    it('should chain successful operations', () => {
      const result = flatMap(success(5), (n) => success(n * 2));
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe(10);
      }
    });

    it('should propagate failure', () => {
      const result = flatMap(failure<number, Error>(new Error('fail')), (n) => success(n * 2));
      expect(isFailure(result)).toBe(true);
    });

    it('should return failure from chained operation', () => {
      const result = flatMap(success(5), () => failure(new Error('chained fail')));
      expect(isFailure(result)).toBe(true);
    });
  });

  describe('fromPromise', () => {
    it('should convert resolved promise to success', async () => {
      const result = await fromPromise(Promise.resolve('done'));
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe('done');
      }
    });

    it('should convert rejected promise to failure', async () => {
      const result = await fromPromise(Promise.reject(new Error('oops')));
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.message).toBe('oops');
      }
    });

    it('should wrap non-Error rejections', async () => {
      const result = await fromPromise(Promise.reject('string error'));
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.message).toBe('string error');
      }
    });
  });

  describe('fromTry', () => {
    it('should convert successful sync operation to success', () => {
      const result = fromTry(() => 'computed');
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe('computed');
      }
    });

    it('should convert thrown error to failure', () => {
      const result = fromTry(() => {
        throw new Error('sync error');
      });
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.message).toBe('sync error');
      }
    });
  });
});
