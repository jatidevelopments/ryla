import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: AuthService;
  let mockRequest: Partial<Request>;
  let mockUser: IJwtPayload;

  beforeEach(() => {
    mockUser = {
      userId: 'user-123',
      email: 'test@example.com',
      deviceId: 'device-123',
    } as IJwtPayload;

    mockRequest = {
      get: vi.fn().mockReturnValue('Mozilla/5.0'),
      ip: '127.0.0.1',
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
    };

    mockAuthService = {
      registerUserByEmail: vi.fn(),
      loginUser: vi.fn(),
      refreshTokens: vi.fn(),
      logout: vi.fn(),
      logoutAll: vi.fn(),
      getCurrentUser: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
      checkEmailExists: vi.fn(),
    } as unknown as AuthService;

    controller = new AuthController(mockAuthService);
  });

  describe('registerUserByEmail', () => {
    it('should register user', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
        publicName: 'testuser',
      };
      const mockResponse = {
        user: { id: 'user-123', email: 'test@example.com' },
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
      };
      vi.mocked(mockAuthService.registerUserByEmail).mockResolvedValue(mockResponse as any);

      const result = await controller.registerUserByEmail(dto, mockRequest as Request);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.registerUserByEmail).toHaveBeenCalledWith(
        dto,
        'Mozilla/5.0',
        expect.any(String),
      );
    });
  });

  describe('loginUser', () => {
    it('should login user', async () => {
      const dto = { email: 'test@example.com', password: 'Password123!' };
      const mockResponse = {
        user: { id: 'user-123', email: 'test@example.com' },
        tokens: { accessToken: 'token', refreshToken: 'refresh' },
      };
      vi.mocked(mockAuthService.loginUser).mockResolvedValue(mockResponse as any);

      const result = await controller.loginUser(dto, mockRequest as Request);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.loginUser).toHaveBeenCalledWith(
        dto,
        'Mozilla/5.0',
        expect.any(String),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens', async () => {
      const mockResponse = {
        user: { id: 'user-123' },
        tokens: { accessToken: 'new-token', refreshToken: 'new-refresh' },
      };
      vi.mocked(mockAuthService.refreshTokens).mockResolvedValue(mockResponse as any);

      const result = await controller.refreshTokens('refresh-token', mockRequest as Request);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        'refresh-token',
        'Mozilla/5.0',
        expect.any(String),
      );
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      vi.mocked(mockAuthService.logout).mockResolvedValue(undefined);

      await controller.logout(mockUser);

      expect(mockAuthService.logout).toHaveBeenCalledWith('user-123', 'device-123');
    });
  });

  describe('logoutAll', () => {
    it('should logout all devices', async () => {
      vi.mocked(mockAuthService.logoutAll).mockResolvedValue(undefined);

      await controller.logoutAll(mockUser);

      expect(mockAuthService.logoutAll).toHaveBeenCalledWith('user-123');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUserProfile = { id: 'user-123', email: 'test@example.com' };
      vi.mocked(mockAuthService.getCurrentUser).mockResolvedValue(mockUserProfile as any);

      const result = await controller.getCurrentUser(mockUser);

      expect(result).toEqual({ user: mockUserProfile });
      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith('user-123');
    });
  });

  describe('forgotPassword', () => {
    it('should request password reset', async () => {
      const dto = { email: 'test@example.com' };
      vi.mocked(mockAuthService.requestPasswordReset).mockResolvedValue(undefined);

      const result = await controller.forgotPassword(dto);

      expect(result).toEqual({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(dto);
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const dto = { token: 'reset-token', password: 'NewPassword123!' };
      vi.mocked(mockAuthService.resetPassword).mockResolvedValue(undefined);

      const result = await controller.resetPassword(dto);

      expect(result).toEqual({ message: 'Password has been reset successfully' });
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const dto = { currentPassword: 'OldPass123!', newPassword: 'NewPass123!' };
      vi.mocked(mockAuthService.changePassword).mockResolvedValue(undefined);

      const result = await controller.changePassword(mockUser, dto);

      expect(result).toEqual({ message: 'Password has been updated successfully' });
      expect(mockAuthService.changePassword).toHaveBeenCalledWith('user-123', dto);
    });
  });

  describe('checkEmail', () => {
    it('should check if email exists', async () => {
      vi.mocked(mockAuthService.checkEmailExists).mockResolvedValue(true);

      const result = await controller.checkEmail('test@example.com');

      expect(result).toEqual({ exists: true });
      expect(mockAuthService.checkEmailExists).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw BadRequestException when email is missing', async () => {
      await expect(controller.checkEmail('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when email format is invalid', async () => {
      await expect(controller.checkEmail('invalid-email')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
