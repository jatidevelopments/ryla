import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

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
import { CronModule } from './cron/cron.module';
import { PromptsModule } from './prompts/prompts.module';
import { OutfitPresetsModule } from './outfit-presets/outfit-presets.module';
import { VoiceTranscriptionModule } from './voice-transcription/voice-transcription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      // Load .env from the api app directory (apps/api/.env)
      envFilePath: [
        '.env',
        '.env.local',
        'apps/api/.env',
        'apps/api/.env.local',
      ],
    }),
    DrizzleModule,
    RedisModule,
    HealthModule,
    AwsS3Module,
    MailModule,
    AuthModule,
    UserModule,
    CharacterModule,
    ImageModule,
    ImageGalleryModule,
    NotificationModule,
    CronModule,
    PromptsModule,
    OutfitPresetsModule,
    VoiceTranscriptionModule,
    ThrottlerConfigModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
