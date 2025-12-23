import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AwsS3Module } from '../aws-s3/aws-s3.module';
import { RedisModule } from '../redis/redis.module';
import { RunPodModule } from '../runpod/runpod.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ImageGalleryModule } from '../image-gallery/image-gallery.module';
import { ImageController } from './image.controller';
import { StorageTestController } from './storage-test.controller';
import { ImageService } from './services/image.service';
import { BaseImageGenerationService } from './services/base-image-generation.service';
import { CharacterSheetService } from './services/character-sheet.service';
import { RunPodJobRunnerAdapter } from './services/runpod-job-runner.adapter';
import { ComfyUIJobRunnerAdapter } from './services/comfyui-job-runner.adapter';
import { ImageStorageService } from './services/image-storage.service';
import { GenerationJobsRepository } from '@ryla/data';
import { ImageGenerationService } from '@ryla/business';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';

/**
 * Token for the job runner adapter (ComfyUI or RunPod serverless)
 * ComfyUI is preferred for instant response (no cold starts)
 */
export const JOB_RUNNER_TOKEN = 'JOB_RUNNER';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    RedisModule,
    AwsS3Module,
    RunPodModule,
    DrizzleModule,
    forwardRef(() => ImageGalleryModule),
  ],
  controllers: [ImageController, StorageTestController],
  providers: [
    ImageService,
    BaseImageGenerationService,
    CharacterSheetService,
    RunPodJobRunnerAdapter,
    ComfyUIJobRunnerAdapter,
    ImageStorageService,
    // Dynamic provider that selects ComfyUI pod (preferred) or RunPod serverless (fallback)
    {
      provide: JOB_RUNNER_TOKEN,
      useFactory: (
        comfyui: ComfyUIJobRunnerAdapter,
        runpod: RunPodJobRunnerAdapter,
      ) => {
        // Use ComfyUI if pod URL is configured (uses process.env directly)
        if (process.env['COMFYUI_POD_URL']) {
          return comfyui;
        }
        // Fall back to RunPod serverless endpoints
        return runpod;
      },
      inject: [ComfyUIJobRunnerAdapter, RunPodJobRunnerAdapter],
    },
    // Factory provider for ImageGenerationService from @ryla/business
    {
      provide: ImageGenerationService,
      useFactory: (
        db: NodePgDatabase<typeof schema>,
        jobRunner: ComfyUIJobRunnerAdapter | RunPodJobRunnerAdapter,
      ) => {
        const generationJobsRepo = new GenerationJobsRepository(db);
        return new ImageGenerationService(generationJobsRepo, jobRunner);
      },
      inject: ['DRIZZLE_DB', JOB_RUNNER_TOKEN],
    },
  ],
  exports: [
    ImageService,
    BaseImageGenerationService,
    CharacterSheetService,
    ImageGenerationService,
    ImageStorageService,
    ComfyUIJobRunnerAdapter,
    JOB_RUNNER_TOKEN,
  ],
})
export class ImageModule {}

