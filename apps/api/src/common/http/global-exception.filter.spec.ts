import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlobalExceptionFilter } from './global-exception.filter';
import {
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockRequest = {
      method: 'GET',
      url: '/api/test',
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockArgumentsHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  describe('catch', () => {
    it('should handle HttpException with message', () => {
      const exception = new BadRequestException('Bad request message');
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        messages: ['Bad request message'],
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle HttpException with array of messages', () => {
      const exception = new BadRequestException(['Error 1', 'Error 2']);
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        messages: ['Error 1', 'Error 2'],
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle HttpException with response object', () => {
      const exception = new BadRequestException({
        message: ['Custom error'],
        error: 'Bad Request',
      });
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        messages: ['Custom error'],
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle different HTTP status codes', () => {
      const exceptions = [
        { exception: new UnauthorizedException(), status: 401 },
        { exception: new NotFoundException(), status: 404 },
        { exception: new HttpException('Server error', 500), status: 500 },
      ];

      exceptions.forEach(({ exception, status }) => {
        filter.catch(exception, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(status);
        expect(mockResponse.json).toHaveBeenCalledWith({
          statusCode: status,
          messages: expect.any(Array),
          timestamp: expect.any(String),
          path: '/api/test',
        });
      });
    });

    it('should handle non-HttpException errors', () => {
      const exception = new Error('Internal server error');
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        messages: ['Internal server error'],
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle errors without message', () => {
      const exception = new Error();
      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        messages: ['Internal server error'],
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle non-Error objects', () => {
      const exception = { message: 'Custom error object' };
      filter.catch(exception as any, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        messages: ['Custom error object'],
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should include timestamp in ISO format', () => {
      const exception = new BadRequestException('Test');
      filter.catch(exception, mockArgumentsHost);

      const jsonCall = (mockResponse.json as any).mock.calls[0][0];
      expect(jsonCall.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include request path in response', () => {
      mockRequest.url = '/api/users/123';
      const exception = new BadRequestException('Test');
      filter.catch(exception, mockArgumentsHost);

      const jsonCall = (mockResponse.json as any).mock.calls[0][0];
      expect(jsonCall.path).toBe('/api/users/123');
    });
  });
});
