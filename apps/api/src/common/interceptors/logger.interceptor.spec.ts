import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoggingInterceptor } from './logger.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LoggerHelper } from '../logger/logger.helper';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let loggerLogSpy: ReturnType<typeof vi.spyOn>;
  let loggerErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => ({
          method: 'GET',
          url: '/api/test',
        }),
        getResponse: () => ({
          statusCode: 200,
        }),
      }),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: vi.fn().mockReturnValue(of({ data: 'test' })),
    } as unknown as CallHandler;

    loggerLogSpy = vi.spyOn(interceptor['logger'], 'log').mockImplementation(() => {});
    loggerErrorSpy = vi.spyOn(interceptor['logger'], 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('intercept', () => {
    it('should log request', () => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      expect(loggerLogSpy).toHaveBeenCalled();
      const logCall = loggerLogSpy.mock.calls[0][0];
      expect(logCall).toContain('GET');
      expect(logCall).toContain('/api/test');
    });

    it('should log successful response', async () => {
      return new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          next: () => {
            expect(loggerLogSpy).toHaveBeenCalledTimes(2); // Request + Response
            const responseCall = loggerLogSpy.mock.calls[1][0];
            expect(responseCall).toContain('GET');
            expect(responseCall).toContain('/api/test');
            expect(responseCall).toContain('200');
            resolve();
          },
        });
      });
    });

    it('should log response time', async () => {
      return new Promise<void>((resolve) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          next: () => {
            const responseCall = loggerLogSpy.mock.calls[1][0];
            expect(responseCall).toMatch(/\d+ms/);
            resolve();
          },
        });
      });
    });

    it('should log error response', async () => {
      return new Promise<void>((resolve) => {
        const error = new Error('Test error');
        (error as any).status = 500;
        (error as any).message = 'Test error';
        const errorCallHandler = {
          handle: vi.fn().mockReturnValue(throwError(() => error)),
        } as unknown as CallHandler;

        interceptor.intercept(mockExecutionContext, errorCallHandler).subscribe({
          error: () => {
            expect(loggerErrorSpy).toHaveBeenCalled();
            const errorCall = loggerErrorSpy.mock.calls[0][0];
            expect(errorCall).toContain('GET');
            expect(errorCall).toContain('/api/test');
            expect(errorCall).toContain('500');
            expect(errorCall).toContain('Test error');
            resolve();
          },
        });
      });
    });

    it('should handle errors without status code', async () => {
      return new Promise<void>((resolve) => {
        const error = new Error('Test error');
        const errorCallHandler = {
          handle: vi.fn().mockReturnValue(throwError(() => error)),
        } as unknown as CallHandler;

        interceptor.intercept(mockExecutionContext, errorCallHandler).subscribe({
          error: () => {
            expect(loggerErrorSpy).toHaveBeenCalled();
            const errorCall = loggerErrorSpy.mock.calls[0][0];
            expect(errorCall).toContain('500');
            resolve();
          },
        });
      });
    });

    it('should handle errors without message', async () => {
      return new Promise<void>((resolve) => {
        const error = new Error();
        (error as any).status = 400;
        const errorCallHandler = {
          handle: vi.fn().mockReturnValue(throwError(() => error)),
        } as unknown as CallHandler;

        interceptor.intercept(mockExecutionContext, errorCallHandler).subscribe({
          error: () => {
            expect(loggerErrorSpy).toHaveBeenCalled();
            const errorCall = loggerErrorSpy.mock.calls[0][0];
            expect(errorCall).toContain('Internal server error');
            resolve();
          },
        });
      });
    });

    it('should handle different HTTP methods', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      const promises = methods.map((method) => {
        return new Promise<void>((resolve) => {
          const methodExecutionContext = {
            switchToHttp: vi.fn().mockReturnValue({
              getRequest: () => ({ method, url: '/api/test' }),
              getResponse: () => ({ statusCode: 200 }),
            }),
          } as unknown as ExecutionContext;

          interceptor.intercept(methodExecutionContext, mockCallHandler).subscribe({
            next: () => {
              // Find the call for this method (may not be first due to async)
              const methodCall = loggerLogSpy.mock.calls.find((call) =>
                call[0].includes(method),
              );
              expect(methodCall).toBeDefined();
              expect(methodCall![0]).toContain(method);
              resolve();
            },
          });
        });
      });

      await Promise.all(promises);
    });

    it('should rethrow error after logging', async () => {
      return new Promise<void>((resolve) => {
        const error = new Error('Test error');
        const errorCallHandler = {
          handle: vi.fn().mockReturnValue(throwError(() => error)),
        } as unknown as CallHandler;

        interceptor.intercept(mockExecutionContext, errorCallHandler).subscribe({
          error: (err) => {
            expect(err).toBe(error);
            resolve();
          },
        });
      });
    });
  });
});
