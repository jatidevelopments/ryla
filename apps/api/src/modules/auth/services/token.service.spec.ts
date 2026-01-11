import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthCacheService } from './auth-cache.service';
import { TokenType } from '../enums/token-type.enum';
import { ActionTokenType } from '../enums/action-token.type';
import { vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';

describe('TokenService', () => {
    let service: TokenService;
    let jwtService: JwtService;
    let _configService: ConfigService;
    let _authCacheService: AuthCacheService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
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
                    provide: AuthCacheService,
                    useValue: {
                        saveToken: vi.fn().mockResolvedValue(true),
                        isTokenValid: vi.fn().mockResolvedValue(true),
                    },
                },
            ],
        }).compile();

        service = module.get<TokenService>(TokenService);
        jwtService = module.get<JwtService>(JwtService);
        _configService = module.get<ConfigService>(ConfigService);
        _authCacheService = module.get<AuthCacheService>(AuthCacheService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate auth tokens', async () => {
        const user = { id: 'user-id', email: 'test@example.com', role: 'user' };
        const tokens = await service.generateAuthTokens(user as any);
        expect(tokens.accessToken).toBe('fake-token');
        expect(tokens.refreshToken).toBe('fake-token');
    });

    it('should verify token successfully', async () => {
        vi.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ userId: 'user-id', deviceId: 'device-id' });
        const payload = await service.verifyToken('token', TokenType.ACCESS);
        expect(payload.userId).toBe('user-id');
    });

    it('should throw UnauthorizedException if jwt verify fails', async () => {
        vi.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('JWT Error'));
        await expect(service.verifyToken('token', TokenType.ACCESS)).rejects.toThrow(UnauthorizedException);
    });

    it('should generate action token', async () => {
        const token = await service.generateActionToken({ userId: 'user-id' } as any, ActionTokenType.FORGOT_PASSWORD);
        expect(token).toBe('fake-token');
    });

    it('should throw UnauthorizedException for unknown action token type', async () => {
        await expect(service.generateActionToken({ userId: 'user-id' } as any, 'unknown' as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should verify action token successfully', async () => {
        vi.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ userId: 'user-id' });
        const payload = await service.verifyActionToken('token', ActionTokenType.FORGOT_PASSWORD);
        expect(payload.userId).toBe('user-id');
    });

    it('should throw UnauthorizedException if verifyActionToken fails', async () => {
        vi.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('JWT Error'));
        await expect(service.verifyActionToken('token', ActionTokenType.FORGOT_PASSWORD)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unknown token type in getSecret', async () => {
        // We can test this by calling verifyToken with invalid type
        await expect(service.verifyToken('token', 'unknown' as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should generate dev token', async () => {
        const token = await service.generateDevToken({ userId: 'user-id' } as any);
        expect(token).toBe('fake-token');
        expect(jwtService.signAsync).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ expiresIn: expect.any(Number) }));
    });

    it('should throw Error if config is missing in constructor', () => {
        const mockConfig = { get: vi.fn().mockReturnValue(null) };
        expect(() => new TokenService({} as any, mockConfig as any)).toThrow('JWT config not found');
    });

    it('should throw UnauthorizedException for unknown token type in getSecret', async () => {
        await expect(service.verifyToken('token', 'unknown' as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unknown action token type in getActionSecret', async () => {
        await expect(service.verifyActionToken('token', 'unknown' as any)).rejects.toThrow(UnauthorizedException);
    });
});
