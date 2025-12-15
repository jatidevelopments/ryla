import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HealthService } from './services/health.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  health(): string {
    return 'ok, application is working fine!!!';
  }

  @Get('database-check')
  @ApiOperation({ summary: 'Check database health' })
  @ApiResponse({
    status: 200,
    description: 'Returns the health status of the database',
  })
  async checkDatabase() {
    return await this.healthService.checkDatabase();
  }

  @Get('redis-keys')
  async getRedisDataDefault(): Promise<Record<string, any>> {
    return await this.healthService.getRedisData(100);
  }
  
  @Get('redis-keys/:maxItems')
  @ApiParam({
    name: 'maxItems',
    required: false,
    type: Number,
  })
  async getRedisDataWithLimit(
    @Param('maxItems') maxItems: number,
  ): Promise<Record<string, any>> {
    return await this.healthService.getRedisData(maxItems || 100);
  }
}

