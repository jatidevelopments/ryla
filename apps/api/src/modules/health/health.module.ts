import { Module } from '@nestjs/common';

// import { RedisModule } from '../redis/redis.module';
import { HealthController } from './health.controller';
// import { HealthService } from './services/health.service';

// Minimal health controller for debugging
import { Controller, Get } from '@nestjs/common';

@Controller()
class MinimalHealthController {
  @Get('health')
  health(): string {
    return 'ok';
  }
}

@Module({
  // imports: [RedisModule],
  controllers: [MinimalHealthController],
  // providers: [HealthService],
})
export class HealthModule {}

