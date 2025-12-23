import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { CreditRefreshService } from './services/credit-refresh.service';

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
  controllers: [CronController],
  providers: [CreditRefreshService],
  exports: [CreditRefreshService],
})
export class CronModule {}

