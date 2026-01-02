/**
 * Credits Module
 *
 * Provides credit management services for feature usage tracking and billing.
 */

import { Module, forwardRef } from '@nestjs/common';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { CreditManagementService } from './services/credit-management.service';

@Module({
  imports: [forwardRef(() => DrizzleModule)],
  providers: [CreditManagementService],
  exports: [CreditManagementService],
})
export class CreditsModule {}

