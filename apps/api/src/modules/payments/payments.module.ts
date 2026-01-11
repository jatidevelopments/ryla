/**
 * Payments Module
 * 
 * Handles payment processing with Finby
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentsController } from './payments.controller';
import { FinbyService } from './services/finby.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import { PaymentRepository } from '@ryla/data';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    DrizzleModule,
    AuthModule, // Required for JwtAccessGuard (TokenService, AuthCacheService)
  ],
  controllers: [PaymentsController],
  providers: [
    FinbyService,
    {
      provide: PaymentRepository,
      useFactory: (db: NodePgDatabase<typeof schema>) => {
        return new PaymentRepository(db);
      },
      inject: ['DRIZZLE_DB'],
    },
  ],
  exports: [FinbyService],
})
export class PaymentsModule {}

