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
      inject: [ConfigService, REDIS_CLIENT], // Inject ConfigService and the Redis client.
      useFactory: async (_: ConfigService, redisClient: Redis) => {
        // Retrieve throttler configuration from the application's config service.
        return {
          // Only include throttlers used with standard @Throttle() decorator
          // CustomThrottlerGuard uses @CustomThrottleConfig instead
          throttlers: [
            {
              name: 'default',
              ...DEFAULT_THROTTLE,
            },
          ],
          // Use Redis for storing throttler data, allowing for distributed rate limiting.
          storage: new ThrottlerStorageRedisService(redisClient),
        };
      },
    } as ThrottlerAsyncOptions),
  ],
})
export class ThrottlerConfigModule {}

