import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

import { REDIS_CLIENT } from '../redis.constants';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {
  }

  /**
   * Add member to hash set.
   */
  public async addOneToSet(hash: string, value: string): Promise<number> {
    return await this.redisClient.sadd(hash, value);
  }

  /**
   * Add multiple members to a set.
   */
  public async addManyToSet(hash: string, values: string[]): Promise<number> {
    return await this.redisClient.sadd(hash, ...values);
  }

  /**
   * Remove one member from hash set.
   */
  public async removeOneFromSet(
    key: string,
    setMember: string,
  ): Promise<number> {
    return await this.redisClient.srem(key, setMember);
  }

  /**
   * Delete all records by key from Redis.
   */
  public async deleteByKey(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  /**
   * Delete multiple records by keys from Redis.
   */
  public async deleteByKeys(keys: string[]): Promise<number> {
    if (!keys || keys.length === 0) {
      return 0;
    }
    return await this.redisClient.del(...keys);
  }

  /**
   * Get all the members in a set.
   */
  public async sMembers(key: string): Promise<string[]> {
    return await this.redisClient.smembers(key);
  }

  /**
   * Sets a timeout on a key.
   * After the timeout, the key will be automatically deleted.
   */
  public async expire(key: string, time: number): Promise<number> {
    return await this.redisClient.expire(key, time);
  }

  /**
   * Ping Redis server to check connection.
   */
  public async ping(): Promise<string> {
    return await this.redisClient.ping();
  }

  /**
   * Get Redis data with preview of values.
   */
  public async getRedisData(maxItems = 100): Promise<Record<string, any>> {
    const keys = await this.redisClient.keys('*');
    const result: Record<string, any> = {};

    for (const key of keys) {
      const type = await this.redisClient.type(key);
      let value: any;

      switch (type) {
        case 'string':
          value = await this.redisClient.get(key);
          break;
        case 'list':
          value = await this.redisClient.lrange(key, 0, -1);
          break;
        case 'set':
          value = await this.redisClient.smembers(key);
          break;
        case 'zset':
          value = await this.redisClient.zrange(key, 0, -1, 'WITHSCORES');
          break;
        case 'hash':
          value = await this.redisClient.hgetall(key);
          break;
        default:
          value = `<unsupported type: ${type}>`;
      }

      let preview: string;

      if (typeof value === 'string') {
        preview = value.slice(0, maxItems);
      } else {
        try {
          preview = JSON.stringify(value).slice(0, maxItems);
        } catch {
          preview = '<unserializable>';
        }
      }

      result[key] = {
        type,
        preview,
      };
    }

    return result;
  }

  /**
   * Increment the value of a key by 1.
   */
  public async increment(key: string): Promise<number> {
    return await this.redisClient.incr(key);
  }

  /**
   * Decrement the value of a key by 1.
   */
  public async decrement(key: string): Promise<number> {
    return await this.redisClient.decr(key);
  }

  /**
   * Get the string value of a key.
   */
  public async getString(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  /**
   * Get the value of a key.
   */
  public async get(key: string): Promise<number | null> {
    const value = await this.redisClient.get(key);
    return value ? parseInt(value, 10) : null;
  }

  /**
   * Set the string value of a key.
   */
  public async setString(
    key: string,
    value: string,
    options?: { ttl?: number },
  ): Promise<string> {
    if (options?.ttl) {
      return await this.redisClient.set(key, value, 'EX', options.ttl);
    }
    return await this.redisClient.set(key, value);
  }

  /**
   * Set the value of a key.
   */
  public async set(key: string, value: number): Promise<string> {
    return await this.redisClient.set(key, value);
  }

  /**
   * Check if a key exists in Redis.
   * @param key The key to check
   * @returns True if the key exists, false otherwise
   */
  public async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  /**
   * Get all keys matching a pattern
   */
  public async keys(pattern: string): Promise<string[]> {
    return await this.redisClient.keys(pattern);
  }

  /**
   * Create a pipeline for batch operations
   */
  public pipeline(): any {
    return this.redisClient.pipeline();
  }
}

