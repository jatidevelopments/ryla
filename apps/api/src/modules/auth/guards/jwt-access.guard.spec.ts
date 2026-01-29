import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JwtAccessGuard } from './jwt-access.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../services/token.service';
import { AuthCacheService } from '../services/auth-cache.service';
import { TokenType } from '../enums/token-type.enum';

describe('JwtAccessGuard', () => {
  let guard: JwtAccessGuard;
  let mockReflector: Reflector;
  let mockTokenService: TokenService;
  let mockAuthCacheService: AuthCacheService;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: vi.fn(),
    } as unknown as Reflector;

    mockTokenService = {
      verifyToken: vi.fn(),
    } as unknown as TokenService;

    mockAuthCacheService = {
      isAccessTokenExist: vi.fn(),
    } as unknown as AuthCacheService;

    guard = new JwtAccessGuard(mockReflector, mockTokenService, mockAuthCacheService);

    mockExecutionContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => ({
          get: vi.fn(),
        }),
      }),
    } as unknown as ExecutionContext;
  });

  describe('canActivate', () => {
    it('should return true if SKIP_AUTH is set', async () => {
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockTokenService.verifyToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if no Authorization header', async () => {
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValue(false);
      const request = {
        get: vi.fn().mockReturnValue(undefined),
      };
      vi.mocked(mockExecutionContext.switchToHttp).mockReturnValue({
        getRequest: () => request,
      } as any);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if Authorization header does not start with Bearer', async () => {
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValue(false);
      const request = {
        get: vi.fn().mockReturnValue('Invalid token'),
      };
      vi.mocked(mockExecutionContext.switchToHttp).mockReturnValue({
        getRequest: () => request,
      } as any);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValue(false);
      const request = {
        get: vi.fn().mockReturnValue('Bearer valid-token'),
      };
      vi.mocked(mockExecutionContext.switchToHttp).mockReturnValue({
        getRequest: () => request,
      } as any);
      vi.mocked(mockTokenService.verifyToken).mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token does not exist in cache', async () => {
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValue(false);
      const request = {
        get: vi.fn().mockReturnValue('Bearer valid-token'),
        user: undefined,
      };
      vi.mocked(mockExecutionContext.switchToHttp).mockReturnValue({
        getRequest: () => request,
      } as any);
      vi.mocked(mockTokenService.verifyToken).mockResolvedValue({
        userId: 'user-123',
        deviceId: 'device-123',
      } as any);
      vi.mocked(mockAuthCacheService.isAccessTokenExist).mockResolvedValue(false);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return true and set user if token is valid', async () => {
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValue(false);
      const request = {
        get: vi.fn().mockReturnValue('Bearer valid-token'),
        user: undefined,
      };
      vi.mocked(mockExecutionContext.switchToHttp).mockReturnValue({
        getRequest: () => request,
      } as any);
      const payload = {
        userId: 'user-123',
        deviceId: 'device-123',
        email: 'test@example.com',
      };
      vi.mocked(mockTokenService.verifyToken).mockResolvedValue(payload as any);
      vi.mocked(mockAuthCacheService.isAccessTokenExist).mockResolvedValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(
        'valid-token',
        TokenType.ACCESS,
      );
      expect(mockAuthCacheService.isAccessTokenExist).toHaveBeenCalledWith(
        'user-123',
        'device-123',
        'valid-token',
      );
      expect(request.user).toEqual(payload);
    });

    it('should extract token correctly from Bearer header', async () => {
      vi.mocked(mockReflector.getAllAndOverride).mockReturnValue(false);
      const request = {
        get: vi.fn().mockReturnValue('Bearer my-access-token'),
        user: undefined,
      };
      vi.mocked(mockExecutionContext.switchToHttp).mockReturnValue({
        getRequest: () => request,
      } as any);
      vi.mocked(mockTokenService.verifyToken).mockResolvedValue({
        userId: 'user-123',
        deviceId: 'device-123',
      } as any);
      vi.mocked(mockAuthCacheService.isAccessTokenExist).mockResolvedValue(true);

      await guard.canActivate(mockExecutionContext);

      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(
        'my-access-token',
        TokenType.ACCESS,
      );
    });
  });
});
