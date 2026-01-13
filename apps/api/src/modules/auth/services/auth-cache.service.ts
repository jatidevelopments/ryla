import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Config, JwtConfig } from '../../../config/config.type';
import { RedisService } from '../../redis/services/redis.service';

// Redis operation timeout - fail fast to avoid blocking requests
// Reduced from 5s to 500ms for better UX
const REDIS_OPERATION_TIMEOUT_MS = 500;

@Injectable()
export class AuthCacheService {
  private jwtConfig: JwtConfig;

  constructor(
    @Inject(forwardRef(() => RedisService)) private readonly redisService: RedisService,
    @Inject(ConfigService) private readonly configService: ConfigService<Config>,
  ) {
    if (!this.configService) {
      throw new Error('ConfigService is not available');
    }
    const config = this.configService.get<JwtConfig>('jwt');
    if (!config) {
      throw new Error('JWT config not found');
    }
    this.jwtConfig = config;
  }

  public async saveToken(
    userId: string,
    deviceId: string,
    token: string,
  ): Promise<void> {
    try {
      const key = this.getKey(userId, deviceId);
      // Add timeout to prevent hanging - fail fast
      await Promise.race([
        this.redisService.setString(key, token, {
          ttl: this.jwtConfig.accessExpiresIn,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis operation timeout')), REDIS_OPERATION_TIMEOUT_MS)
        ),
      ]);
    } catch (error) {
      // Log but don't fail login if Redis is unavailable
      // Tokens are still valid (JWT is stateless), just not cached
      console.warn('[AuthCacheService] Failed to save token to Redis:', error);
      // Don't throw - allow login to proceed without Redis caching
    }
  }

  public async isAccessTokenExist(
    userId: string,
    deviceId: string,
    token: string,
  ): Promise<boolean> {
    // Fast path: skip Redis check if not ready (fail fast)
    if (!this.redisService.isReady()) {
      // Redis not ready - assume token is valid (graceful degradation)
      // JWT validation will still work
      return true;
    }

    try {
      const key = this.getKey(userId, deviceId);
      // Add timeout to prevent hanging - fail fast for better UX
      const storedToken = await Promise.race([
        this.redisService.getString(key),
        new Promise<string | null>((_, reject) =>
          setTimeout(() => reject(new Error('Redis operation timeout')), REDIS_OPERATION_TIMEOUT_MS)
        ),
      ]);
      return storedToken === token;
    } catch (error) {
      // If Redis fails, assume token is valid (graceful degradation)
      // JWT validation will still work
      console.warn('[AuthCacheService] Failed to check token in Redis:', error);
      return true; // Allow request to proceed
    }
  }

  public async deleteToken(userId: string, deviceId: string): Promise<void> {
    try {
      const key = this.getKey(userId, deviceId);
      // Add timeout to prevent hanging - fail fast
      await Promise.race([
        this.redisService.deleteByKey(key),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis operation timeout')), REDIS_OPERATION_TIMEOUT_MS)
        ),
      ]);
    } catch (error) {
      // Log but don't fail logout if Redis is unavailable
      console.warn('[AuthCacheService] Failed to delete token from Redis:', error);
    }
  }

  public async deleteAllUserTokens(userId: string): Promise<void> {
    try {
      // Add timeout to prevent hanging - fail fast
      const keys = await Promise.race([
        this.redisService.keys(this.getKey(userId, '*')),
        new Promise<string[]>((_, reject) =>
          setTimeout(() => reject(new Error('Redis operation timeout')), REDIS_OPERATION_TIMEOUT_MS)
        ),
      ]);
      if (keys.length > 0) {
        await Promise.race([
          this.redisService.deleteByKeys(keys),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis operation timeout')), REDIS_OPERATION_TIMEOUT_MS)
          ),
        ]);
      }
    } catch (error) {
      // Log but don't fail logout if Redis is unavailable
      console.warn('[AuthCacheService] Failed to delete all tokens from Redis:', error);
    }
  }

  private getKey(userId: string, deviceId: string): string {
    return `access-token:${userId}:${deviceId}`;
  }
}

