import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SwaggerHelper } from './swagger.helper';
import { OpenAPIObject } from '@nestjs/swagger/dist/interfaces';

describe('SwaggerHelper', () => {
  describe('setDefaultResponses', () => {
    it('should add general responses to all routes', () => {
      const document: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0' },
        paths: {
          '/test': {
            get: {
              responses: {},
            },
            post: {
              responses: {},
            },
          },
        },
      };

      SwaggerHelper.setDefaultResponses(document);

      expect(document.paths['/test']?.get?.responses).toMatchObject({
        400: { description: 'Bad request' },
        404: { description: 'Not found' },
        500: { description: 'Server error' },
        503: { description: 'Service unavailable' },
      });

      expect(document.paths['/test']?.post?.responses).toMatchObject({
        400: { description: 'Bad request' },
        404: { description: 'Not found' },
        500: { description: 'Server error' },
        503: { description: 'Service unavailable' },
      });
    });

    it('should add auth responses to secured routes', () => {
      const document: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0' },
        paths: {
          '/secured': {
            get: {
              security: [{ bearer: [] }],
              responses: {},
            },
          },
        },
      };

      SwaggerHelper.setDefaultResponses(document);

      expect(document.paths['/secured']?.get?.responses).toMatchObject({
        400: { description: 'Bad request' },
        404: { description: 'Not found' },
        500: { description: 'Server error' },
        503: { description: 'Service unavailable' },
        401: { description: 'Not authenticated' },
        403: { description: 'Access denied' },
      });
    });

    it('should handle DELETE method with 204 response', () => {
      const document: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0' },
        paths: {
          '/resource': {
            delete: {
              responses: {
                200: { description: 'Success' },
              },
            },
          },
        },
      };

      SwaggerHelper.setDefaultResponses(document);

      const deleteRoute = document.paths['/resource']?.delete;
      expect(deleteRoute?.responses[200]).toBeUndefined();
      expect(deleteRoute?.responses[204]).toMatchObject({
        description: 'No content',
      });
      expect(deleteRoute?.responses).toMatchObject({
        400: { description: 'Bad request' },
        404: { description: 'Not found' },
        500: { description: 'Server error' },
        503: { description: 'Service unavailable' },
      });
    });

    it('should handle all HTTP methods', () => {
      const document: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0' },
        paths: {
          '/all-methods': {
            get: { responses: {} },
            post: { responses: {} },
            put: { responses: {} },
            patch: { responses: {} },
            delete: { responses: {} },
          },
        },
      };

      SwaggerHelper.setDefaultResponses(document);

      const path = document.paths['/all-methods'];
      expect(path?.get?.responses[400]).toBeDefined();
      expect(path?.post?.responses[400]).toBeDefined();
      expect(path?.put?.responses[400]).toBeDefined();
      expect(path?.patch?.responses[400]).toBeDefined();
      expect(path?.delete?.responses[400]).toBeDefined();
    });

    it('should not modify non-existent paths', () => {
      const document: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0' },
        paths: {
          '/exists': {
            get: { responses: {} },
          },
        },
      };

      SwaggerHelper.setDefaultResponses(document);

      expect(document.paths['/does-not-exist']).toBeUndefined();
    });

    it('should handle paths with no methods', () => {
      const document: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0' },
        paths: {
          '/no-methods': {},
        },
      };

      expect(() => {
        SwaggerHelper.setDefaultResponses(document);
      }).not.toThrow();
    });

    it('should merge with existing responses', () => {
      const document: OpenAPIObject = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0' },
        paths: {
          '/test': {
            get: {
              responses: {
                200: { description: 'Custom success' },
                400: { description: 'Custom bad request' },
              },
            },
          },
        },
      };

      SwaggerHelper.setDefaultResponses(document);

      const responses = document.paths['/test']?.get?.responses;
      // Object.assign overwrites, so 400 will be overwritten with default
      expect(responses?.[200]).toMatchObject({ description: 'Custom success' });
      expect(responses?.[400]).toMatchObject({ description: 'Bad request' }); // Overwritten
      expect(responses?.[404]).toMatchObject({ description: 'Not found' });
    });
  });
});
