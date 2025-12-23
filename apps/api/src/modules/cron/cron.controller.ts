import {
  Controller,
  Post,
  Get,
  Param,
  Headers,
  UnauthorizedException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { CreditRefreshService, CreditRefreshResult } from './services/credit-refresh.service';

/**
 * Cron job endpoints for scheduled tasks.
 * 
 * These endpoints are designed to be called by external cron services
 * (Vercel Cron, GitHub Actions, or system crontab).
 * 
 * Security: Protected by CRON_SECRET environment variable.
 */
@ApiTags('Cron Jobs')
@Controller('cron')
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(private readonly creditRefreshService: CreditRefreshService) {}

  /**
   * Verify the cron secret from request headers
   */
  private verifyCronSecret(authHeader: string | undefined): void {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      this.logger.error('CRON_SECRET environment variable not set');
      throw new UnauthorizedException('Cron jobs not configured');
    }

    // Accept both "Bearer <secret>" and plain "<secret>" formats
    const providedSecret = authHeader?.replace('Bearer ', '');

    if (providedSecret !== cronSecret) {
      this.logger.warn('Invalid cron secret provided');
      throw new UnauthorizedException('Invalid cron secret');
    }
  }

  /**
   * Refresh credits for all subscriptions due for renewal.
   * 
   * This should be scheduled to run daily (e.g., at midnight UTC).
   * 
   * Example cron schedule: 0 0 * * * (daily at midnight)
   * 
   * Call with:
   * curl -X POST https://api.ryla.ai/cron/credits/refresh \
   *   -H "Authorization: Bearer $CRON_SECRET"
   */
  @Post('credits/refresh')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh monthly credits for due subscriptions' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <CRON_SECRET>',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Credit refresh completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        processedCount: { type: 'number' },
        successCount: { type: 'number' },
        errorCount: { type: 'number' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid cron secret' })
  async refreshCredits(
    @Headers('authorization') authHeader: string
  ): Promise<CreditRefreshResult & { success: boolean; timestamp: string }> {
    this.verifyCronSecret(authHeader);

    this.logger.log('Credit refresh cron job triggered');

    const result = await this.creditRefreshService.refreshDueCredits();

    return {
      success: result.errorCount === 0,
      ...result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Manually refresh credits for a specific user (admin use)
   */
  @Post('credits/refresh/:userId')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually refresh credits for a specific user' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <CRON_SECRET>',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User credits refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid cron secret' })
  @ApiResponse({ status: 404, description: 'User or subscription not found' })
  async refreshUserCredits(
    @Headers('authorization') authHeader: string,
    @Param('userId') userId: string
  ): Promise<{ success: boolean; userId: string; timestamp: string }> {
    this.verifyCronSecret(authHeader);

    this.logger.log(`Manual credit refresh triggered for user ${userId}`);

    await this.creditRefreshService.refreshUserCredits(userId);

    return {
      success: true,
      userId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Health check endpoint for cron monitoring
   */
  @Get('health')
  @SkipAuth()
  @ApiOperation({ summary: 'Cron service health check' })
  @ApiResponse({ status: 200, description: 'Cron service is healthy' })
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

