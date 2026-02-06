import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AwsS3Module } from '../aws-s3/aws-s3.module';
import { RedisModule } from '../redis/redis.module';
import { RunPodModule } from '../runpod/runpod.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ImageGalleryModule } from '../image-gallery/image-gallery.module';
import { CreditsModule } from '../credits/credits.module';
import { NotificationModule } from '../notification/notification.module';
import { ImageController } from './image.controller';
import { StorageTestController } from './storage-test.controller';
import { ImageService } from './services/image.service';
import { BaseImageGenerationService } from './services/base-image-generation.service';
import { CharacterSheetService } from './services/character-sheet.service';
import { ProfilePictureSetService } from './services/profile-picture-set.service';
import { RunPodJobRunnerAdapter } from './services/runpod-job-runner.adapter';
import { ComfyUIJobRunnerAdapter } from './services/comfyui-job-runner.adapter';
import { ModalJobRunnerAdapter } from './services/modal-job-runner.adapter';
import { ImageStorageService } from './services/image-storage.service';
import { InpaintEditService } from './services/inpaint-edit.service';
import { StudioGenerationService } from './services/studio-generation.service';
import { ComfyUIResultsService } from './services/comfyui-results.service';
import { FalImageService } from './services/fal-image.service';
import { GenerationJobsRepository } from '@ryla/data';
import { ImageGenerationService } from '@ryla/business';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';

/**
 * Token for the job runner adapter (Modal.com or RunPod serverless)
 * Modal.com is preferred for fast, reliable image generation
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
    CreditsModule,
    NotificationModule,
  ],
  controllers: [ImageController, StorageTestController],
  providers: [
    ImageService,
    BaseImageGenerationService,
    FalImageService,
    CharacterSheetService,
    ProfilePictureSetService,
    InpaintEditService,
    StudioGenerationService,
    ComfyUIResultsService,
    RunPodJobRunnerAdapter,
    ComfyUIJobRunnerAdapter,
    ModalJobRunnerAdapter,
    ImageStorageService,
    // Dynamic provider that selects Modal.com (preferred) or RunPod serverless (fallback)
    // Note: ComfyUI RunPod no longer exists, removed from priority chain
    {
      provide: JOB_RUNNER_TOKEN,
      useFactory: (
        modal: ModalJobRunnerAdapter,
        runpod: RunPodJobRunnerAdapter,
      ) => {
        // Priority: Modal.com > RunPod
        // Use Modal.com if endpoint URL or workspace is configured
        if (process.env['MODAL_ENDPOINT_URL'] || process.env['MODAL_WORKSPACE']) {
          return modal;
        }
        // Fall back to RunPod serverless endpoints
        return runpod;
      },
      inject: [ModalJobRunnerAdapter, RunPodJobRunnerAdapter],
    },
    // Factory provider for ImageGenerationService from @ryla/business
    {
      provide: ImageGenerationService,
      useFactory: (
        db: NodePgDatabase<typeof schema>,
        jobRunner: ModalJobRunnerAdapter | RunPodJobRunnerAdapter,
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
    FalImageService,
    CharacterSheetService,
    ProfilePictureSetService,
    ImageGenerationService,
    ImageStorageService,
    ComfyUIJobRunnerAdapter,
    JOB_RUNNER_TOKEN,
  ],
})
export class ImageModule {}

