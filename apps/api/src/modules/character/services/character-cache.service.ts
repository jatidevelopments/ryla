import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/services/redis.service';

@Injectable()
export class CharacterCacheService {
  constructor(private readonly redisService: RedisService) {}

  // TODO: Implement character caching methods
  public async getCharacterCache(key: string): Promise<string | null> {
    return await this.redisService.getString(key);
  }

  public async setCharacterCache(key: string, value: string, ttl?: number): Promise<void> {
    await this.redisService.setString(key, value, { ttl });
  }
}

