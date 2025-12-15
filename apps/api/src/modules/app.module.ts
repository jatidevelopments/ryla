import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
// import { SentryModule } from '@sentry/nestjs/setup';

import { GlobalExceptionFilter } from '../common/http/global-exception.filter';
import configuration from '../config/configuration';
import { DrizzleModule } from './drizzle/drizzle.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { CharacterModule } from './character/character.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerConfigModule } from './throttler/throttler.module';
import { HealthModule } from './health/health.module';
import { AwsS3Module } from './aws-s3/aws-s3.module';
import { ImageModule } from './image/image.module';
import { ImageGalleryModule } from './image-gallery/image-gallery.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    // BullModule.forRootAsync(...),
    // SentryModule.forRoot(),
    DrizzleModule,
    RedisModule,
    ThrottlerConfigModule,
    HealthModule,
    AwsS3Module,
    AuthModule,
    UserModule,
    CharacterModule,
    ImageModule,
    ImageGalleryModule,
    MailModule,
    NotificationModule,
    // Add other modules here
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
