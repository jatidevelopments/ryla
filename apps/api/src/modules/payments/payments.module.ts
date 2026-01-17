/**
 * Payments Module
 * 
 * Handles payment processing with Finby
 */

import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentsController } from './payments.controller';
import { FinbyService } from './services/finby.service';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import { PaymentRepository } from '@ryla/data';

// Debug: Check environment variables at module load time
const moduleLogger = new Logger('PaymentsModule');
moduleLogger.log('=== PaymentsModule Loading ===');
moduleLogger.log(`FINBY_PROJECT_ID: ${process.env.FINBY_PROJECT_ID ? 'SET (' + process.env.FINBY_PROJECT_ID.substring(0, 8) + '...)' : 'NOT SET'}`);
moduleLogger.log(`FINBY_SECRET_KEY: ${process.env.FINBY_SECRET_KEY ? 'SET (' + process.env.FINBY_SECRET_KEY.substring(0, 8) + '...)' : 'NOT SET'}`);
moduleLogger.log('==============================');

@Module({
  imports: [
    ConfigModule,
    DrizzleModule,
    AuthModule, // Required for JwtAccessGuard (TokenService, AuthCacheService)
  ],
  controllers: [PaymentsController],
  providers: [
    // Register FinbyService directly - NestJS handles DI via @Inject decorators
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
export class PaymentsModule implements OnModuleInit {
  private readonly logger = new Logger(PaymentsModule.name);

  onModuleInit() {
    this.logger.log('PaymentsModule initialized');
  }
}

