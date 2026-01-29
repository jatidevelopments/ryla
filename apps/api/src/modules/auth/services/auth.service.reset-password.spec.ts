import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AuthCacheService } from './auth-cache.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/services/redis.service';
import { createTestDb } from '../../../test/utils/test-db';
import * as schema from '@ryla/data/schema';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService - Reset Password End-to-End', () => {
  let service: AuthService;
  let db: any;
  let client: any;
  let testCounter = 0;

  const getUniqueUser = () => {
    const id = ++testCounter;
    return {
      email: `reset-${id}-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: `Reset User ${id}`,
      publicName: `reset-pub-${id}-${Date.now()}`,
    };
  };

  // OPTIMIZATION: Create DB once per test suite instead of per test
  beforeAll(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
    client = testDb.client;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        TokenService,
        AuthCacheService,
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => {
              if (key === 'jwt') {
                return {
                  accessSecret: 'test-access-secret',
                  refreshSecret: 'test-refresh-secret',
                  accessExpiresIn: '1h',
                  refreshExpiresIn: '7d',
                };
              }
              if (key === 'app') {
                return {
                  appUrl: 'http://localhost:3000',
                };
              }
              return null;
            }),
          },
        },
        { provide: 'DRIZZLE_DB', useValue: db },
        { provide: RedisService, useValue: { get: vi.fn(), set: vi.fn(), del: vi.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // OPTIMIZATION: Clean up data between tests instead of recreating DB
  beforeEach(async () => {
    // Use DELETE with condition that's always true to delete all rows
    // Delete in reverse order of foreign key dependencies
    try {
      await db.delete(schema.creditTransactions).where(sql`1=1`);
      await db.delete(schema.userCredits).where(sql`1=1`);
      await db.delete(schema.notifications).where(sql`1=1`);
      await db.delete(schema.users).where(sql`1=1`);
    } catch (error) {
      // If DELETE fails, tests will still run
      console.warn('Cleanup failed, continuing with test:', error);
    }
    vi.clearAllMocks();
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  describe('resetPassword - End-to-End Flow', () => {
    it('should successfully reset password with valid token', async () => {
      const userData = getUniqueUser();

      // Register user
      const registration = await service.registerUserByEmail(
        {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          publicName: userData.publicName,
        },
        'test-user-agent',
        '127.0.0.1'
      );

      expect(registration.user).toBeDefined();
      expect(registration.tokens).toBeDefined();

      // Request password reset
      await service.requestPasswordReset({ email: userData.email });

      // Get the reset token from database
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, userData.email));

      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpiresAt).toBeDefined();

      const resetToken = user.passwordResetToken;
      const newPassword = 'NewSecurePassword456!';

      // Mock token verification
      vi.spyOn((service as any).tokenService, 'verifyActionToken').mockResolvedValueOnce({
        userId: user.id,
        actionToken: 'password-reset',
      });

      // Reset password
      await service.resetPassword({
        token: resetToken,
        password: newPassword,
      });

      // Verify password was updated
      const [updatedUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id));

      // Verify old password doesn't work
      const oldPasswordValid = await bcrypt.compare(userData.password, updatedUser.password);
      expect(oldPasswordValid).toBe(false);

      // Verify new password works
      const newPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
      expect(newPasswordValid).toBe(true);

      // Verify reset token was cleared
      expect(updatedUser.passwordResetToken).toBeNull();
      expect(updatedUser.passwordResetExpiresAt).toBeNull();

      // Verify can login with new password
      const loginResult = await service.loginUser(
        { email: userData.email, password: newPassword },
        'test-user-agent',
        '127.0.0.1'
      );

      expect(loginResult.tokens.accessToken).toBeDefined();
      expect(loginResult.user.id).toBe(user.id);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const userData = getUniqueUser();

      await service.registerUserByEmail(
        {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          publicName: userData.publicName,
        },
        'test-user-agent',
        '127.0.0.1'
      );

      // Mock token verification to fail
      vi.spyOn((service as any).tokenService, 'verifyActionToken').mockRejectedValueOnce(
        new Error('Invalid token')
      );

      await expect(
        service.resetPassword({
          token: 'invalid-token-123',
          password: 'NewPassword123!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const userData = getUniqueUser();

      const registration = await service.registerUserByEmail(
        {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          publicName: userData.publicName,
        },
        'test-user-agent',
        '127.0.0.1'
      );

      // Manually set expired token
      await db
        .update(schema.users)
        .set({
          passwordResetToken: 'expired-token',
          passwordResetExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        })
        .where(eq(schema.users.id, registration.user.id));

      // Mock token verification to succeed
      vi.spyOn((service as any).tokenService, 'verifyActionToken').mockResolvedValueOnce({
        userId: registration.user.id,
        actionToken: 'password-reset',
      });

      await expect(
        service.resetPassword({
          token: 'expired-token',
          password: 'NewPassword123!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token does not match stored token', async () => {
      const userData = getUniqueUser();

      const registration = await service.registerUserByEmail(
        {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          publicName: userData.publicName,
        },
        'test-user-agent',
        '127.0.0.1'
      );

      // Set a different token in database
      await db
        .update(schema.users)
        .set({
          passwordResetToken: 'stored-token-123',
          passwordResetExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        })
        .where(eq(schema.users.id, registration.user.id));

      // Mock token verification to succeed
      vi.spyOn((service as any).tokenService, 'verifyActionToken').mockResolvedValueOnce({
        userId: registration.user.id,
        actionToken: 'password-reset',
      });

      // Try to reset with different token
      await expect(
        service.resetPassword({
          token: 'different-token-456',
          password: 'NewPassword123!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const nonExistentUserId = randomUUID();

      // Mock token verification to return non-existent user ID
      vi.spyOn((service as any).tokenService, 'verifyActionToken').mockResolvedValueOnce({
        userId: nonExistentUserId,
        actionToken: 'password-reset',
      });

      await expect(
        service.resetPassword({
          token: 'some-token',
          password: 'NewPassword123!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should hash password correctly', async () => {
      const userData = getUniqueUser();

      const registration = await service.registerUserByEmail(
        {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          publicName: userData.publicName,
        },
        'test-user-agent',
        '127.0.0.1'
      );

      await service.requestPasswordReset({ email: userData.email });

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, userData.email));

      const resetToken = user.passwordResetToken;
      const newPassword = 'NewHashedPassword789!';

      vi.spyOn((service as any).tokenService, 'verifyActionToken').mockResolvedValueOnce({
        userId: user.id,
        actionToken: 'password-reset',
      });

      await service.resetPassword({
        token: resetToken,
        password: newPassword,
      });

      // Verify password is hashed (not plain text)
      const [updatedUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id));

      expect(updatedUser.password).not.toBe(newPassword);
      expect(updatedUser.password.length).toBeGreaterThan(50); // bcrypt hash length
      expect(updatedUser.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it('should clear reset token after successful reset', async () => {
      const userData = getUniqueUser();

      await service.registerUserByEmail(
        {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          publicName: userData.publicName,
        },
        'test-user-agent',
        '127.0.0.1'
      );

      await service.requestPasswordReset({ email: userData.email });

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, userData.email));

      const resetToken = user.passwordResetToken;

      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpiresAt).toBeDefined();

      vi.spyOn((service as any).tokenService, 'verifyActionToken').mockResolvedValueOnce({
        userId: user.id,
        actionToken: 'password-reset',
      });

      await service.resetPassword({
        token: resetToken,
        password: 'NewPassword123!',
      });

      // Verify token is cleared
      const [updatedUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id));

      expect(updatedUser.passwordResetToken).toBeNull();
      expect(updatedUser.passwordResetExpiresAt).toBeNull();
    });

    it('should prevent reuse of reset token', async () => {
      const userData = getUniqueUser();

      await service.registerUserByEmail(
        {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          publicName: userData.publicName,
        },
        'test-user-agent',
        '127.0.0.1'
      );

      await service.requestPasswordReset({ email: userData.email });

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, userData.email));

      const resetToken = user.passwordResetToken;

      vi.spyOn((service as any).tokenService, 'verifyActionToken').mockResolvedValue({
        userId: user.id,
        actionToken: 'password-reset',
      });

      // First reset should succeed
      await service.resetPassword({
        token: resetToken,
        password: 'FirstPassword123!',
      });

      // Second reset with same token should fail (token was cleared)
      await expect(
        service.resetPassword({
          token: resetToken,
          password: 'SecondPassword123!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
