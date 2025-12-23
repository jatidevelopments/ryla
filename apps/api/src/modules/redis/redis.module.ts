import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { Config, RedisConfig } from '../../config/config.type';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './services/redis.service';
import { RedisLeaderElectionService } from './services/redis-leader-election.service';
import { RedisLockService } from './services/redis-lock.service';

const redisProvider: Provider = {
  useFactory: (configService: ConfigService<Config>): Redis => {
    const redisConfig = configService.get<RedisConfig>('redis');
    if (!redisConfig) {
      console.warn('Redis config not found, creating Redis client with defaults');
      // Return a Redis client that will fail gracefully when used
      return new Redis({
        port: 6379,
        host: 'localhost',
        connectTimeout: 1000,
        lazyConnect: true,
        retryStrategy: () => null, // Don't retry if connection fails
      });
    }
    const redisOptions: any = {
      port: redisConfig.port,
      host: redisConfig.host,
      password: redisConfig.password || undefined,
      connectTimeout: 30000,
      maxRetriesPerRequest: null,
      lazyConnect: true, // Don't connect immediately
      retryStrategy: () => null, // Don't retry on connection failure
    };
    
    // Only add username for non-local environments
    if (redisConfig.environment !== 'local' && redisConfig.password) {
      redisOptions.username = 'default';
    }
    if (redisConfig.environment !== 'local') {
      return new Redis({
        ...redisOptions,
        retryStrategy: (times) => Math.min(times * 100, 3000),
        tls: {
          rejectUnauthorized: false,
        },
      });
    } else {
      return new Redis({
        ...redisOptions,
      });
    }
  },
  inject: [ConfigService],
  provide: REDIS_CLIENT,
};

@Module({
  providers: [
    redisProvider,
    RedisService,
    RedisLockService,
    RedisLeaderElectionService,
  ],
  exports: [
    REDIS_CLIENT,
    RedisService,
    RedisLockService,
    RedisLeaderElectionService,
  ],
})
export class RedisModule { }

