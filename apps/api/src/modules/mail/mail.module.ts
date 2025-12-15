import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { RedisModule } from '../redis/redis.module';
import { MailService } from './services/mail.service';

@Module({
  imports: [RedisModule, HttpModule.register({})],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

