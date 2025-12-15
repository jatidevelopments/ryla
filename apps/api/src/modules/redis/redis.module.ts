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
      throw new Error('Redis config not found');
    }
    const redisOptions = {
      port: redisConfig.port,
      host: redisConfig.host,
      username: 'default',
      password: redisConfig.password,
      connectTimeout: 30000,
      maxRetriesPerRequest: null,
    };
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
export class RedisModule {}

