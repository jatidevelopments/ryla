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

  private async checkRedis() {
    const startTime = Date.now();
    try {
      const pong = await this.redisService.ping();
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

