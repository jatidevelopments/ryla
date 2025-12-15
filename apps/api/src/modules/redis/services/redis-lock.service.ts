import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '../redis.constants';

@Injectable()
export class RedisLockService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  /**
   * Attempts to acquire Redis lock
   * @param key Key that locks the task
   * @param ttlSeconds
   * @returns true - if lock is acquired, false - if not
   */
  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redisClient.set(key, '1', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  /**
   * Manual lock release (optional if TTL is set)
   */
  async releaseLock(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}

