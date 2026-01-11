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
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as rylaEmail from '@ryla/email';

describe('AuthService Integration', () => {
    let service: AuthService;
    let db: any;
    let client: any;

    const email = 'test@example.com';
    const password = 'Password123!';
    const name = 'Test User';
    const publicName = 'testuser';

    beforeEach(async () => {
        const testDb = await createTestDb();
        db = testDb.db;
        client = testDb.client;

        // Mock email
        vi.spyOn(rylaEmail, 'sendEmail').mockResolvedValue({} as any);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                TokenService,
                AuthCacheService,
                { provide: 'DRIZZLE_DB', useValue: db },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: vi.fn().mockResolvedValue('fake-token'),
                        verifyAsync: vi.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: vi.fn().mockImplementation((key) => {
                            if (key === 'JWT_ACCESS_EXPIRATION') return '1h';
                            if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
                            return 'secret';
                        }),
                    },
                },
                {
                    provide: RedisService,
                    useValue: {
                        setString: vi.fn(),
                        getString: vi.fn(),
                        deleteByKey: vi.fn(),
                        deleteByKeys: vi.fn(),
                        keys: vi.fn().mockResolvedValue([]),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(async () => {
        if (client) await client.close();
        vi.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should register a new user', async () => {
        const res = await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
        expect(res.user.email).toBe(email);
        expect(res.tokens.accessToken).toBeDefined();

        // Verify welcome email was called
        expect(rylaEmail.sendEmail).toHaveBeenCalled();
    });

    it('should handle welcome email failure', async () => {
        vi.spyOn(rylaEmail, 'sendEmail').mockRejectedValueOnce(new Error('Email failed'));
        const res = await service.registerUserByEmail({
            email: 'fail@example.com',
            password,
            name,
            publicName: 'failuser'
        }, 'ua', 'ip');
        expect(res.user.email).toBe('fail@example.com');
    });

    it('should throw ConflictException if email already exists', async () => {
        await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
        await expect(service.registerUserByEmail({ email, password, name, publicName: 'other' }, 'ua', 'ip'))
            .rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if public name already exists', async () => {
        await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
        await expect(service.registerUserByEmail({ email: 'other@example.com', password, name, publicName }, 'ua', 'ip'))
            .rejects.toThrow(ConflictException);
    });

    it('should throw UnauthorizedException for non-existent user login', async () => {
        await expect(service.loginUser({ email, password }, 'ua', 'ip')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is banned during login', async () => {
        await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
        await db.update(schema.users).set({ banned: true }).where(eq(schema.users.email, email));
        await expect(service.loginUser({ email, password }, 'ua', 'ip')).rejects.toThrow(UnauthorizedException);
    });

    it('should login a user with correct credentials', async () => {
        await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
        const res = await service.loginUser({ email, password }, 'ua', 'ip');
        expect(res.tokens.accessToken).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid password', async () => {
        await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
        await expect(service.loginUser({ email, password: 'wrong' }, 'ua', 'ip')).rejects.toThrow(UnauthorizedException);
    });

    describe('Refresh and Logout', () => {
        it('should refresh tokens', async () => {
            const reg = await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
            // Mock verifyToken outcome
            vi.spyOn((service as any).tokenService, 'verifyToken').mockResolvedValueOnce({
                userId: reg.user.id,
                email: reg.user.email,
                role: 'user',
                deviceId: 'some-device'
            });

            const res = await service.refreshTokens(reg.tokens.refreshToken, 'ua', 'ip');
            expect(res.tokens.accessToken).toBeDefined();
        });

        it('should throw Unauthorized if user is banned during refresh', async () => {
            const reg = await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
            vi.spyOn((service as any).tokenService, 'verifyToken').mockResolvedValueOnce({
                userId: reg.user.id,
                email: reg.user.email,
                role: 'user',
                deviceId: 'some-device'
            });
            await db.update(schema.users).set({ banned: true }).where(eq(schema.users.email, email));
            await expect(service.refreshTokens(reg.tokens.refreshToken, 'ua', 'ip')).rejects.toThrow(UnauthorizedException);
        });

        it('should throw Unauthorized if user is missing during refresh', async () => {
            const reg = await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
            vi.spyOn((service as any).tokenService, 'verifyToken').mockResolvedValueOnce({
                userId: reg.user.id,
                email: reg.user.email,
                role: 'user',
                deviceId: 'some-device'
            });
            await db.delete(schema.users).where(eq(schema.users.id, reg.user.id));
            await expect(service.refreshTokens(reg.tokens.refreshToken, 'ua', 'ip')).rejects.toThrow(UnauthorizedException);
        });

        it('should logout a user', async () => {
            await service.logout(randomUUID(), 'dev1');
        });

        it('should logout from all devices', async () => {
            await service.logoutAll(randomUUID());
        });
    });

    it('should check if email exists', async () => {
        expect(await service.checkEmailExists(email)).toBe(false);
        await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
        expect(await service.checkEmailExists(email)).toBe(true);
    });

    it('should return null if user not found in getCurrentUser', async () => {
        expect(await service.getCurrentUser(randomUUID())).toBeNull();
    });

    it('should return user with hasPassword in getCurrentUser', async () => {
        const reg = await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
        const user = await service.getCurrentUser(reg.user.id);
        expect(user?.hasPassword).toBe(true);
    });

    describe('Password Reset', () => {
        it('should do nothing in requestPasswordReset if user not found', async () => {
            await service.requestPasswordReset({ email });
            expect(rylaEmail.sendEmail).not.toHaveBeenCalled();
        });

        it('should request and reset password', async () => {
            await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
            await service.requestPasswordReset({ email });
            expect(rylaEmail.sendEmail).toHaveBeenCalled();

            const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
            const token = user.passwordResetToken;

            vi.spyOn((service as any).tokenService, 'verifyActionToken').mockResolvedValueOnce({
                userId: user.id,
                actionToken: 'password-reset'
            });

            await service.resetPassword({ token, password: 'NewPassword123!' });

            // Verify login with new password
            const login = await service.loginUser({ email, password: 'NewPassword123!' }, 'ua', 'ip');
            expect(login.tokens.accessToken).toBeDefined();
        });

        it('should handle password reset email failure', async () => {
            await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
            vi.spyOn(rylaEmail, 'sendEmail').mockRejectedValueOnce(new Error('Email fail'));
            await service.requestPasswordReset({ email });
        });

        it('should throw if reset token is invalid or expired', async () => {
            vi.spyOn((service as any).tokenService, 'verifyActionToken').mockRejectedValueOnce(new Error('JWT Error'));
            await expect(service.resetPassword({ token: 'invalid', password: '!' })).rejects.toThrow(UnauthorizedException);
        });

        it('should throw if user not found during reset', async () => {
            vi.spyOn((service as any).tokenService, 'verifyActionToken').mockResolvedValueOnce({ userId: randomUUID() });
            await expect(service.resetPassword({ token: 'tok', password: '!' })).rejects.toThrow(UnauthorizedException);
        });

        it('should throw if token does not match stored token', async () => {
            const reg = await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
            await db.update(schema.users).set({
                passwordResetToken: 'tok1',
                passwordResetExpiresAt: new Date(Date.now() + 3600000)
            }).where(eq(schema.users.id, reg.user.id));

            vi.spyOn((service as any).tokenService, 'verifyActionToken').mockResolvedValueOnce({ userId: reg.user.id });
            await expect(service.resetPassword({ token: 'tok2', password: '!' })).rejects.toThrow(UnauthorizedException);
        });

        it('should throw if reset token expired', async () => {
            const reg = await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
            await db.update(schema.users).set({
                passwordResetToken: 'tok1',
                passwordResetExpiresAt: new Date(Date.now() - 3600000)
            }).where(eq(schema.users.id, reg.user.id));

            vi.spyOn((service as any).tokenService, 'verifyActionToken').mockResolvedValueOnce({ userId: reg.user.id });
            await expect(service.resetPassword({ token: 'tok1', password: '!' })).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('Change Password', () => {
        it('should throw if user not found in changePassword', async () => {
            await expect(service.changePassword(randomUUID(), {} as any)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw for invalid current password in changePassword', async () => {
            const reg = await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
            await expect(service.changePassword(reg.user.id, { currentPassword: 'wrong', newPassword: '!' }))
                .rejects.toThrow(BadRequestException);
        });

        it('should change password', async () => {
            const reg = await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
            await service.changePassword(reg.user.id, { currentPassword: password, newPassword: 'NewPassword123!' });

            const login = await service.loginUser({ email, password: 'NewPassword123!' }, 'ua', 'ip');
            expect(login.tokens.accessToken).toBeDefined();
        });
    });

    describe('Dev Token and Device ID', () => {
        it('should generate dev token', async () => {
            await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
            const res = await service.generateDevToken({ email, password }, 'ua', 'ip');
            expect(res.accessToken).toBeDefined();
        });

        it('should throw if invalid credentials for dev token', async () => {
            await expect(service.generateDevToken({ email, password }, 'ua', 'ip')).rejects.toThrow(UnauthorizedException);
            await service.registerUserByEmail({ email, password, name, publicName }, 'ua', 'ip');
            await expect(service.generateDevToken({ email, password: 'wrong' }, 'ua', 'ip')).rejects.toThrow(UnauthorizedException);
        });

        it('should generate uuid device id if no ua or ip', async () => {
            const devId = (service as any).generateDeviceId('', '');
            expect(devId).toHaveLength(36); // UUID length
        });
    });
});
