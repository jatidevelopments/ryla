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
import { RunPodJobRunnerAdapter } from './services/runpod-job-runner.adapter';
import { GenerationJobsRepository } from '@ryla/data';
import { ImageGenerationService } from '@ryla/business';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';

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
    RunPodJobRunnerAdapter,
    {
      provide: GenerationJobsRepository,
      useFactory: (db: NodePgDatabase<typeof schema>) => new GenerationJobsRepository(db),
      inject: ['DRIZZLE_DB'],
    },
    {
      provide: ImageGenerationService,
      useFactory: (
        generationJobsRepo: GenerationJobsRepository,
        runpodRunner: RunPodJobRunnerAdapter,
      ) => new ImageGenerationService(generationJobsRepo, runpodRunner),
      inject: [GenerationJobsRepository, RunPodJobRunnerAdapter],
    },
  ],
  exports: [
    ImageService,
    BaseImageGenerationService,
    CharacterSheetService,
    ImageGenerationService,
  ],
})
export class ImageModule { }

