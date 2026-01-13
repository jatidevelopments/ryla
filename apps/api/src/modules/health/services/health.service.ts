import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

import { RedisService } from '../../redis/services/redis.service';

@Injectable()
export class HealthService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase,
    private readonly redisService: RedisService,
  ) { }

  async checkDatabase() {
    const startTime = Date.now();
    try {
      await this.db.execute(sql`SELECT 1`);

      return {
        isHealthy: true,
        responseTime: Date.now() - startTime,
        message: 'Database connection is healthy',
      };
    } catch (error: any) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        message: `Database check failed: ${error.message}`,
      };
    }
  }

  async checkRedis() {
    const startTime = Date.now();
    try {
      // Check if Redis is ready first (fast synchronous check)
      if (!this.redisService.isReady()) {
        return {
          isHealthy: false,
          responseTime: Date.now() - startTime,
          message: 'Redis client is not connected (status: not ready)',
        };
      }

      // Try to ping Redis with timeout
      const pong = await Promise.race([
        this.redisService.ping(),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Redis ping timeout')), 1000)
        ),
      ]);

      return {
        isHealthy: pong === 'PONG',
        responseTime: Date.now() - startTime,
        message: 'Redis connection is healthy',
      };
    } catch (error: any) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        message: `Redis check failed: ${error.message}`,
      };
    }
  }

  async getRedisData(maxItems: number): Promise<Record<string, any>> {
    const keys = await this.redisService.getRedisData(maxItems);
    return keys;
  }
}

