import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions, ThrottlerModule } from '@nestjs/throttler';
import Redis from 'ioredis';

import { DEFAULT_THROTTLE } from './constants/default-throttler-constants';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    RedisModule,
    // Asynchronously configure the ThrottlerModule.
    ThrottlerModule.forRootAsync({
      imports: [RedisModule], // Import RedisModule to use the Redis client.
      inject: [ConfigService, REDIS_CLIENT],
      useFactory: async (_: ConfigService, redisClient: Redis) => {
        let storage;
        try {
          storage = new ThrottlerStorageRedisService(redisClient);
        } catch (error) {
          console.error('[Throttler] Failed to create Redis storage:', error);
          storage = undefined;
        }

        const config = {
          throttlers: [
            {
              name: 'default',
              ...DEFAULT_THROTTLE,
            },
          ],
        };

        if (storage) {
          (config as any).storage = storage;
        }

        return config;
      },
    } as ThrottlerAsyncOptions),
  ],
})
export class ThrottlerConfigModule { }

