import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/services/redis.service';

@Injectable()
export class ImageGalleryCacheService {
  constructor(private readonly redisService: RedisService) {}

  // TODO: Implement gallery caching methods
  public async getGalleryCache(key: string): Promise<string | null> {
    return await this.redisService.getString(key);
  }

  public async setGalleryCache(key: string, value: string, ttl?: number): Promise<void> {
    await this.redisService.setString(key, value, { ttl });
  }
}

