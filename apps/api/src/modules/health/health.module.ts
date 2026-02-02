import { Module } from '@nestjs/common';

// Provides health check endpoints: GET /health, POST /waitlist, GET /database-check, GET /redis-check
import { RedisModule } from '../redis/redis.module';
import { HealthController } from './health.controller';
import { HealthService } from './services/health.service';

@Module({
  imports: [RedisModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
