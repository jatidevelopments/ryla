import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Config, JwtConfig } from '../../../config/config.type';
import { RedisService } from '../../redis/services/redis.service';

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
    const key = this.getKey(userId, deviceId);
    await this.redisService.setString(key, token, {
      ttl: this.jwtConfig.accessExpiresIn,
    });
  }

  public async isAccessTokenExist(
    userId: string,
    deviceId: string,
    token: string,
  ): Promise<boolean> {
    const key = this.getKey(userId, deviceId);
    const storedToken = await this.redisService.getString(key);
    return storedToken === token;
  }

  public async deleteToken(userId: string, deviceId: string): Promise<void> {
    const key = this.getKey(userId, deviceId);
    await this.redisService.deleteByKey(key);
  }

  public async deleteAllUserTokens(userId: string): Promise<void> {
    const keys = await this.redisService.keys(this.getKey(userId, '*'));
    if (keys.length > 0) {
      await this.redisService.deleteByKeys(keys);
    }
  }

  private getKey(userId: string, deviceId: string): string {
    return `access-token:${userId}:${deviceId}`;
  }
}

