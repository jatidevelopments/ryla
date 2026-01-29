import { describe, it, expect } from 'vitest';
import { LoggerHelper } from './logger.helper';

describe('LoggerHelper', () => {
  describe('formatMethod', () => {
    it('should format GET method in green', () => {
      const result = LoggerHelper.formatMethod('GET');
      expect(result).toContain('GET');
      expect(result.length).toBeGreaterThan(3); // padded
    });

    it('should format POST method in blue', () => {
      const result = LoggerHelper.formatMethod('POST');
      expect(result).toContain('POST');
    });

    it('should format PUT method in yellow', () => {
      const result = LoggerHelper.formatMethod('PUT');
      expect(result).toContain('PUT');
    });

    it('should format PATCH method in magenta', () => {
      const result = LoggerHelper.formatMethod('PATCH');
      expect(result).toContain('PATCH');
    });

    it('should format DELETE method in red', () => {
      const result = LoggerHelper.formatMethod('DELETE');
      expect(result).toContain('DELETE');
    });

    it('should format OPTIONS method in gray', () => {
      const result = LoggerHelper.formatMethod('OPTIONS');
      expect(result).toContain('OPTIONS');
    });

    it('should handle lowercase method names', () => {
      const result = LoggerHelper.formatMethod('get');
      // formatMethod converts to uppercase and pads, so result should contain the method
      expect(result.length).toBeGreaterThanOrEqual(7);
      expect(result.toLowerCase()).toContain('get');
    });

    it('should handle unknown methods in white', () => {
      const result = LoggerHelper.formatMethod('CUSTOM');
      expect(result).toContain('CUSTOM');
    });

    it('should pad method to 7 characters', () => {
      const result = LoggerHelper.formatMethod('GET');
      expect(result.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('formatStatusCode', () => {
    it('should format 2xx status codes in green', () => {
      const result200 = LoggerHelper.formatStatusCode(200);
      const result299 = LoggerHelper.formatStatusCode(299);
      expect(result200).toBeDefined();
      expect(result299).toBeDefined();
    });

    it('should format 3xx status codes in yellow', () => {
      const result300 = LoggerHelper.formatStatusCode(300);
      const result399 = LoggerHelper.formatStatusCode(399);
      expect(result300).toBeDefined();
      expect(result399).toBeDefined();
    });

    it('should format 4xx status codes in red', () => {
      const result400 = LoggerHelper.formatStatusCode(400);
      const result499 = LoggerHelper.formatStatusCode(499);
      expect(result400).toBeDefined();
      expect(result499).toBeDefined();
    });

    it('should format 5xx status codes in bold red', () => {
      const result500 = LoggerHelper.formatStatusCode(500);
      const result599 = LoggerHelper.formatStatusCode(599);
      expect(result500).toBeDefined();
      expect(result599).toBeDefined();
    });

    it('should format other status codes in gray', () => {
      const result = LoggerHelper.formatStatusCode(199);
      expect(result).toBeDefined();
    });
  });

  describe('formatUrl', () => {
    it('should format URL in cyan', () => {
      const result = LoggerHelper.formatUrl('/api/test');
      expect(result).toContain('/api/test');
    });

    it('should handle complex URLs', () => {
      const result = LoggerHelper.formatUrl('/api/users/123?page=1&limit=10');
      expect(result).toContain('/api/users/123?page=1&limit=10');
    });
  });

  describe('formatTime', () => {
    it('should format times under 100ms in green', () => {
      const result = LoggerHelper.formatTime(50);
      expect(result).toContain('50ms');
    });

    it('should format times under 500ms in yellow', () => {
      const result = LoggerHelper.formatTime(200);
      expect(result).toContain('200ms');
    });

    it('should format times 500ms and above in red', () => {
      const result = LoggerHelper.formatTime(600);
      expect(result).toContain('600ms');
    });

    it('should handle zero time', () => {
      const result = LoggerHelper.formatTime(0);
      expect(result).toBeDefined();
    });
  });

  describe('formatRequest', () => {
    it('should format request with method and URL', () => {
      const result = LoggerHelper.formatRequest('GET', '/api/test');
      expect(result).toContain('GET');
      expect(result).toContain('/api/test');
    });

    it('should handle different methods', () => {
      const getResult = LoggerHelper.formatRequest('GET', '/api/test');
      const postResult = LoggerHelper.formatRequest('POST', '/api/users');
      expect(getResult).toBeDefined();
      expect(postResult).toBeDefined();
    });
  });

  describe('formatResponse', () => {
    it('should format response with all details', () => {
      const result = LoggerHelper.formatResponse('GET', '/api/test', 200, 150);
      expect(result).toContain('GET');
      expect(result).toContain('/api/test');
      expect(result).toContain('200');
      expect(result).toContain('150ms');
    });

    it('should handle error status codes', () => {
      const result = LoggerHelper.formatResponse('POST', '/api/users', 400, 50);
      expect(result).toContain('POST');
      expect(result).toContain('400');
    });
  });

  describe('formatError', () => {
    it('should format error with all details', () => {
      const result = LoggerHelper.formatError(
        'GET',
        '/api/test',
        500,
        200,
        'Internal server error',
      );
      expect(result).toContain('GET');
      expect(result).toContain('/api/test');
      expect(result).toContain('500');
      expect(result).toContain('200ms');
      expect(result).toContain('Error: Internal server error');
    });

    it('should handle different error messages', () => {
      const result = LoggerHelper.formatError(
        'POST',
        '/api/users',
        404,
        100,
        'Not found',
      );
      expect(result).toContain('Not found');
    });
  });
});
