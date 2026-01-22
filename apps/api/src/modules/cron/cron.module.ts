import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { CreditRefreshService } from './services/credit-refresh.service';
import { TemplateTrendingService } from './services/template-trending.service';
import { RedisModule } from '../redis/redis.module';

/**
 * Cron module for scheduled tasks.
 *
 * Provides endpoints that can be called by external cron services:
 * - Vercel Cron
 * - GitHub Actions scheduled workflows
 * - System crontab
 *
 * All endpoints are protected by CRON_SECRET.
 */
@Module({
  imports: [RedisModule],
  controllers: [CronController],
  providers: [CreditRefreshService, TemplateTrendingService],
  exports: [CreditRefreshService, TemplateTrendingService],
})
export class CronModule {}

