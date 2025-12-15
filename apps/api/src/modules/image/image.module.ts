import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from '../auth/auth.module';
import { AwsS3Module } from '../aws-s3/aws-s3.module';
import { RedisModule } from '../redis/redis.module';
import { RunPodModule } from '../runpod/runpod.module';
import { ImageGalleryModule } from '../image-gallery/image-gallery.module';
import { ImageController } from './image.controller';
import { ImageService } from './services/image.service';
import { BaseImageGenerationService } from './services/base-image-generation.service';
import { CharacterSheetService } from './services/character-sheet.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    RedisModule,
    AwsS3Module,
    RunPodModule,
    HttpModule.register({}),
    ScheduleModule.forRoot(),
    forwardRef(() => ImageGalleryModule),
    // BullModule.registerQueue({
    //   name: 'image-blur',
    // }),
  ],
  controllers: [ImageController],
  providers: [
    ImageService,
    BaseImageGenerationService,
    CharacterSheetService,
  ],
  exports: [
    ImageService,
    BaseImageGenerationService,
    CharacterSheetService,
  ],
})
export class ImageModule {}

