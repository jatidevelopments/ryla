import { Injectable, Inject } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as schema from '@ryla/data/schema';
import { GenerationJobsRepository, ImagesRepository, NotificationsRepository } from '@ryla/data';

import { BaseImageGenerationService } from './base-image-generation.service';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ImageStorageService } from './image-storage.service';

/**
 * Reconciles ComfyUI prompt results into DB-backed image assets.
 *
 * - For Studio/inpaint jobs: persists to `images` with structured metadata from generation_jobs.input
 * - For base-image jobs (wizard): falls back to existing BaseImageGenerationService behavior
 */
@Injectable()
export class ComfyUIResultsService {
  private readonly generationJobsRepo: GenerationJobsRepository;
  private readonly imagesRepo: ImagesRepository;
  private readonly notificationsRepo: NotificationsRepository;

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(ComfyUIJobRunnerAdapter)
    private readonly comfyui: ComfyUIJobRunnerAdapter,
    @Inject(ImageStorageService)
    private readonly imageStorage: ImageStorageService,
    @Inject(BaseImageGenerationService)
    private readonly baseImageService: BaseImageGenerationService,
  ) {
    this.generationJobsRepo = new GenerationJobsRepository(this.db);
    this.imagesRepo = new ImagesRepository(this.db);
    this.notificationsRepo = new NotificationsRepository(this.db);
  }

  async getResults(promptId: string, userId: string) {
    const trackedJob = await this.generationJobsRepo.getByExternalJobId({
      externalJobId: promptId,
      userId,
    });

    // Not DB-tracked → treat as base-image job (existing behavior)
    if (!trackedJob) {
      return this.baseImageService.getJobResults(promptId, userId);
    }

    // External provider: Fal (served from DB job output)
    if (trackedJob.externalProvider === 'fal') {
      const status =
        trackedJob.status === 'queued'
          ? 'queued'
          : trackedJob.status === 'processing'
            ? 'processing'
            : trackedJob.status === 'failed'
              ? 'failed'
              : 'completed';

      if (status !== 'completed') {
        return { status, images: [], error: trackedJob.error ?? undefined };
      }

      const output = (trackedJob.output ?? {}) as any;
      const imageUrls: string[] = Array.isArray(output.imageUrls) ? output.imageUrls : [];
      const thumbnailUrls: string[] = Array.isArray(output.thumbnailUrls)
        ? output.thumbnailUrls
        : imageUrls;
      const imageIds: string[] = Array.isArray(output.imageIds) ? output.imageIds : [];
      const s3Keys: string[] = Array.isArray(output.s3Keys) ? output.s3Keys : [];

      const images = imageUrls.map((url, idx) => ({
        id: imageIds[idx] || `${trackedJob.id}-${idx}`,
        url,
        thumbnailUrl: thumbnailUrls[idx] || url,
        s3Key: s3Keys[idx],
      }));

      return { status: 'completed', images, error: trackedJob.error ?? undefined };
    }

    const status = await this.comfyui.getJobStatus(promptId);

    if (status.status !== 'COMPLETED' || !status.output) {
      // Keep job row status in sync for UI polling consistency
      const mapped =
        status.status === 'IN_QUEUE'
          ? 'queued'
          : status.status === 'IN_PROGRESS'
            ? 'processing'
            : status.status === 'FAILED'
              ? 'failed'
              : 'processing';

      if (trackedJob.status !== mapped) {
        await this.generationJobsRepo.updateById(trackedJob.id, {
          status: mapped,
          error: status.error,
        });

        // Create in-app notification on first transition to failed
        if (mapped === 'failed') {
          await this.notificationsRepo.create({
            userId,
            type: 'generation.failed',
            title: 'Generation failed',
            body: status.error ?? 'Your generation failed. Please try again.',
            href: '/activity',
            metadata: {
              generationJobId: trackedJob.id,
              externalJobId: promptId,
              characterId: trackedJob.characterId,
            },
          });
        }
      }

      return {
        status: mapped,
        images: [],
        error: status.error,
      };
    }

    const output = status.output as { images?: string[] };
    const base64Images = output.images || [];

    if (base64Images.length === 0) {
      const wasCompleted = trackedJob.status === 'completed';

      await this.generationJobsRepo.updateById(trackedJob.id, {
        status: 'completed',
        completedAt: new Date(),
        output: { imageUrls: [], thumbnailUrls: [], s3Keys: [], imageIds: [] },
      });

      // Create in-app notification once when transitioning to completed
      if (!wasCompleted) {
        await this.notificationsRepo.create({
          userId,
          type: 'generation.completed',
          title: 'Your images are ready',
          body: 'Your generation completed successfully.',
          href: '/activity',
          metadata: {
            generationJobId: trackedJob.id,
            externalJobId: promptId,
            characterId: trackedJob.characterId,
            imageCount: 0,
          },
        });
      }
      return { status: 'completed', images: [] };
    }

    // Upload images to storage
    const category =
      trackedJob.input?.editType === 'inpaint' ? 'inpaint' : 'studio-images';

    const { images: storedImages } = await this.imageStorage.uploadImages(base64Images, {
      userId,
      category,
      jobId: promptId,
      characterId: trackedJob.characterId ?? undefined,
    });

    // Persist as image assets with structured metadata
    const created = [];
    for (let i = 0; i < storedImages.length; i++) {
      const img = storedImages[i];
      const row = await this.imagesRepo.createImage({
        characterId: trackedJob.characterId ?? null,
        userId,
        s3Key: img.key,
        s3Url: img.url,
        thumbnailKey: img.thumbnailKey,
        thumbnailUrl: img.thumbnailUrl,
        prompt: (trackedJob.input as any)?.prompt ?? null,
        negativePrompt: (trackedJob.input as any)?.negativePrompt ?? null,
        seed: (trackedJob.input as any)?.seed ?? null,
        width: (trackedJob.input as any)?.width ?? null,
        height: (trackedJob.input as any)?.height ?? null,
        status: 'completed',
        scene: (trackedJob.input as any)?.scene ?? null,
        environment: (trackedJob.input as any)?.environment ?? null,
        outfit: (trackedJob.input as any)?.outfit ?? null,
        aspectRatio: (trackedJob.input as any)?.aspectRatio ?? null,
        qualityMode: (trackedJob.input as any)?.qualityMode ?? null,
        nsfw: Boolean((trackedJob.input as any)?.nsfw),
        sourceImageId: (trackedJob.input as any)?.sourceImageId ?? null,
        editType: (trackedJob.input as any)?.editType ?? null,
        editMaskS3Key: (trackedJob.input as any)?.editMaskS3Key ?? null,
      });
      created.push(row);
    }

    await this.generationJobsRepo.updateById(trackedJob.id, {
      status: 'completed',
      completedAt: new Date(),
      completedCount: storedImages.length,
      output: {
        imageUrls: storedImages.map((i) => i.url),
        thumbnailUrls: storedImages.map((i) => i.thumbnailUrl),
        s3Keys: storedImages.map((i) => i.key),
        imageIds: created.map((r) => r.id),
      } as any,
    });

    // Create in-app notification once when transitioning to completed
    if (trackedJob.status !== 'completed') {
      // Get the first thumbnail for notification preview
      const firstThumbnail = storedImages[0]?.thumbnailUrl ?? storedImages[0]?.url ?? null;
      
      await this.notificationsRepo.create({
        userId,
        type: 'generation.completed',
        title: 'Your images are ready',
        body: `Generated ${storedImages.length} image${storedImages.length === 1 ? '' : 's'}.`,
        href: trackedJob.characterId 
          ? `/influencer/${trackedJob.characterId}/studio` 
          : '/activity',
        metadata: {
          generationJobId: trackedJob.id,
          externalJobId: promptId,
          characterId: trackedJob.characterId,
          imageCount: storedImages.length,
          thumbnailUrl: firstThumbnail,
          // Include credit info from job input if available
          qualityMode: (trackedJob.input as any)?.qualityMode ?? null,
        },
      });
    }

    return {
      status: 'completed',
      images: created.map((r) => ({
        id: r.id,
        url: r.s3Url,
        thumbnailUrl: r.thumbnailUrl,
        s3Key: r.s3Key,
      })),
    };
  }
}


