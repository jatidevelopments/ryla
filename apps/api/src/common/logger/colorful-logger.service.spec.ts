import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ColorfulLogger } from './colorful-logger.service';

describe('ColorfulLogger', () => {
  let logger: ColorfulLogger;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logger = new ColorfulLogger();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setContext', () => {
    it('should set context', () => {
      logger.setContext('TestContext');
      logger.log('test message');
      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('[TestContext]');
    });
  });

  describe('log', () => {
    it('should log message with default context', () => {
      logger.log('test message');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('LOG');
      expect(call).toContain('[Application]');
      expect(call).toContain('test message');
    });

    it('should log message with provided context', () => {
      logger.log('test message', 'CustomContext');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('[CustomContext]');
    });

    it('should log message with set context', () => {
      logger.setContext('SetContext');
      logger.log('test message');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('[SetContext]');
    });

    it('should include timestamp', () => {
      logger.log('test message');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      logger.error('error message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain('ERROR');
      expect(call).toContain('error message');
    });

    it('should log error with trace', () => {
      logger.error('error message', 'stack trace');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy.mock.calls[1][0]).toContain('stack trace');
    });

    it('should log error with context', () => {
      logger.error('error message', undefined, 'ErrorContext');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const call = consoleErrorSpy.mock.calls[0][0];
      expect(call).toContain('[ErrorContext]');
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      logger.warn('warning message');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const call = consoleWarnSpy.mock.calls[0][0];
      expect(call).toContain('WARN');
      expect(call).toContain('warning message');
    });

    it('should log warning with context', () => {
      logger.warn('warning message', 'WarnContext');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const call = consoleWarnSpy.mock.calls[0][0];
      expect(call).toContain('[WarnContext]');
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      logger.debug('debug message');
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const call = consoleDebugSpy.mock.calls[0][0];
      expect(call).toContain('DEBUG');
      expect(call).toContain('debug message');
    });

    it('should log debug with context', () => {
      logger.debug('debug message', 'DebugContext');
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const call = consoleDebugSpy.mock.calls[0][0];
      expect(call).toContain('[DebugContext]');
    });
  });

  describe('verbose', () => {
    it('should log verbose message', () => {
      logger.verbose('verbose message');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('VERBOSE');
      expect(call).toContain('verbose message');
    });

    it('should log verbose with context', () => {
      logger.verbose('verbose message', 'VerboseContext');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const call = consoleLogSpy.mock.calls[0][0];
      expect(call).toContain('[VerboseContext]');
    });
  });
});
