import { Test, TestingModule } from '@nestjs/testing';
import { AuthCacheService } from './auth-cache.service';
import { RedisService } from '../../redis/services/redis.service';
import { ConfigService } from '@nestjs/config';
import { vi } from 'vitest';

describe('AuthCacheService', () => {
    let service: AuthCacheService;
    let redisService: RedisService;
    let _configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthCacheService,
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
                {
                    provide: ConfigService,
                    useValue: {
                        get: vi.fn().mockReturnValue({
                            accessExpiresIn: 3600,
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthCacheService>(AuthCacheService);
        redisService = module.get<RedisService>(RedisService);
        _configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should save a token', async () => {
        await service.saveToken('user-id', 'device-id', 'token-id');
        expect(redisService.setString).toHaveBeenCalled();
    });

    it('should delete a token', async () => {
        await service.deleteToken('user-id', 'device-id');
        expect(redisService.deleteByKey).toHaveBeenCalled();
    });

    it('should delete all user tokens', async () => {
        vi.spyOn(redisService, 'keys').mockResolvedValue(['key1', 'key2']);
        await service.deleteAllUserTokens('user-id');
        expect(redisService.deleteByKeys).toHaveBeenCalled();
    });

    it('should check if access token exists', async () => {
        vi.spyOn(redisService, 'getString').mockResolvedValue('token-id');
        const exists = await service.isAccessTokenExist('user-id', 'device-id', 'token-id');
        expect(exists).toBe(true);
    });

    it('should return false if token does not match', async () => {
        vi.spyOn(redisService, 'getString').mockResolvedValue('wrong-id');
        const exists = await service.isAccessTokenExist('user-id', 'device-id', 'token-id');
        expect(exists).toBe(false);
    });

    it('should throw Error if config is missing in constructor', () => {
        const mockConfig = { get: vi.fn().mockReturnValue(null) };
        expect(() => new AuthCacheService({} as any, mockConfig as any)).toThrow('JWT config not found');
    });

    it('should throw Error if ConfigService is null in constructor', () => {
        expect(() => new AuthCacheService({} as any, null as any)).toThrow('ConfigService is not available');
    });
});
