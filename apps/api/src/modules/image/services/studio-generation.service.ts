import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';

import * as schema from '@ryla/data/schema';
import { GenerationJobsRepository, ImagesRepository } from '@ryla/data';
import { buildWorkflow, getRecommendedWorkflow } from '@ryla/business';
import { randomUUID } from 'crypto';

import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { FalImageService, type FalFluxModelId } from './fal-image.service';
import { ImageStorageService } from './image-storage.service';

function aspectRatioToSize(aspectRatio: '1:1' | '9:16' | '2:3'): { width: number; height: number } {
  switch (aspectRatio) {
    case '1:1':
      return { width: 1024, height: 1024 };
    case '9:16':
      return { width: 832, height: 1472 };
    case '2:3':
      return { width: 896, height: 1344 };
  }
}

function qualityToParams(qualityMode: 'draft' | 'hq'): { steps: number; cfg: number } {
  if (qualityMode === 'hq') return { steps: 20, cfg: 1.0 };
  return { steps: 9, cfg: 1.0 };
}

@Injectable()
export class StudioGenerationService {
  private readonly generationJobsRepo: GenerationJobsRepository;
  private readonly imagesRepo: ImagesRepository;

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(ComfyUIJobRunnerAdapter)
    private readonly comfyui: ComfyUIJobRunnerAdapter,
    @Inject(FalImageService)
    private readonly fal: FalImageService,
    @Inject(ImageStorageService)
    private readonly imageStorage: ImageStorageService,
  ) {
    this.generationJobsRepo = new GenerationJobsRepository(this.db);
    this.imagesRepo = new ImagesRepository(this.db);
  }

  async startStudioGeneration(input: {
    userId: string;
    prompt?: string;
    characterId: string;
    scene: string;
    environment: string;
    outfit: string;
    aspectRatio: '1:1' | '9:16' | '2:3';
    qualityMode: 'draft' | 'hq';
    count: number;
    nsfw: boolean;
    seed?: number;
    modelProvider?: 'comfyui' | 'fal';
    modelId?: FalFluxModelId;
  }) {
    if (input.count < 1 || input.count > 10) {
      throw new BadRequestException('count must be between 1 and 10');
    }

    // Verify character ownership
    const character = await this.db.query.characters.findFirst({
      where: and(eq(schema.characters.id, input.characterId), eq(schema.characters.userId, input.userId)),
    });
    if (!character) throw new NotFoundException('Character not found');

    // Build a simple prompt (we'll refine prompt engineering later; metadata is stored separately)
    const userPrompt = input.prompt?.trim();
    const basePrompt = userPrompt
      ? `High quality photo of an AI influencer. ${userPrompt}. ` +
        `Environment: ${input.environment}. Scene: ${input.scene}. Outfit: ${input.outfit}. ` +
        `Professional photography, detailed, sharp focus`
      : `High quality photo of an AI influencer, ${input.environment}, ${input.scene}, ` +
        `wearing ${input.outfit}, professional photography, detailed, sharp focus`;

    const negativePrompt = input.nsfw
      ? 'deformed, blurry, bad anatomy, ugly, low quality'
      : 'deformed, blurry, bad anatomy, ugly, low quality, nsfw, nude, naked';

    const { width, height } = aspectRatioToSize(input.aspectRatio);
    const { steps, cfg } = qualityToParams(input.qualityMode);

    // Pick the best available workflow for the pod (danrisi if nodes available; else simple)
    const workflowId = getRecommendedWorkflow([]); // default fallback
    const actualWorkflowId = this.comfyui.getRecommendedWorkflow?.() ?? workflowId;

    const results: Array<{ jobId: string; promptId: string }> = [];

    // Provider selection:
    // - NSFW always forces comfyui (self-hosted)
    // - default provider is comfyui
    const provider: 'comfyui' | 'fal' = input.nsfw ? 'comfyui' : (input.modelProvider ?? 'comfyui');
    const falModel: FalFluxModelId = input.modelId ?? 'fal-ai/flux/schnell';

    for (let i = 0; i < input.count; i++) {
      const seed = typeof input.seed === 'number' ? input.seed + i : undefined;

      if (provider === 'fal') {
        if (!this.fal.isConfigured()) {
          // Safe fallback if env is missing.
          // Keep server stable: do not throw; run comfyui instead.
          // (This also keeps UI stable without special-casing.)
          // eslint-disable-next-line no-console
          console.warn('FAL_KEY not configured; falling back to comfyui for studio generation');
        } else {
          const externalJobId = `fal_${randomUUID()}`;
          const job = await this.generationJobsRepo.createJob({
            userId: input.userId,
            characterId: input.characterId,
            type: 'image_generation',
            status: 'processing',
            input: {
              scene: input.scene,
              environment: input.environment,
              outfit: input.outfit,
              aspectRatio: input.aspectRatio,
              qualityMode: input.qualityMode,
              imageCount: 1,
              nsfw: input.nsfw,
              prompt: basePrompt,
              negativePrompt,
              seed: seed?.toString(),
              width,
              height,
              steps,
            },
            imageCount: 1,
            completedCount: 0,
            externalJobId,
            externalProvider: 'fal',
            startedAt: new Date(),
          });

          // Run in background; UI will poll /image/comfyui/:promptId/results which is
          // handled by ComfyUIResultsService (special-cased for externalProvider='fal').
          void this.runFalStudioJob({
            jobId: job.id,
            externalJobId,
            userId: input.userId,
            characterId: input.characterId,
            modelId: falModel,
            prompt: basePrompt,
            negativePrompt,
            width,
            height,
            seed,
          });

          results.push({ jobId: job.id, promptId: externalJobId });
          continue;
        }
      }

      const workflow = buildWorkflow(actualWorkflowId, {
        prompt: basePrompt,
        negativePrompt,
        width,
        height,
        steps,
        cfg,
        seed,
        filenamePrefix: 'ryla_studio',
      });

      const promptId = await this.comfyui.queueWorkflow(workflow);

      const job = await this.generationJobsRepo.createJob({
        userId: input.userId,
        characterId: input.characterId,
        type: 'image_generation',
        status: 'queued',
        input: {
          scene: input.scene,
          environment: input.environment,
          outfit: input.outfit,
          aspectRatio: input.aspectRatio,
          qualityMode: input.qualityMode,
          imageCount: 1,
          nsfw: input.nsfw,
          prompt: basePrompt,
          negativePrompt,
          seed: seed?.toString(),
          width,
          height,
          steps,
        },
        imageCount: 1,
        completedCount: 0,
        externalJobId: promptId,
        externalProvider: 'comfyui',
        startedAt: new Date(),
      });

      results.push({ jobId: job.id, promptId });
    }

    return { workflowId: actualWorkflowId, jobs: results };
  }

  private async runFalStudioJob(params: {
    jobId: string;
    externalJobId: string;
    userId: string;
    characterId: string;
    modelId: FalFluxModelId;
    prompt: string;
    negativePrompt: string;
    width: number;
    height: number;
    seed?: number;
  }) {
    const { jobId, externalJobId, userId, characterId, modelId, prompt, negativePrompt, width, height, seed } =
      params;
    try {
      const trackedJob = await this.generationJobsRepo.getById(jobId);

      const out = await this.fal.runFlux(modelId, {
        prompt,
        negativePrompt,
        width,
        height,
        seed,
        numImages: 1,
      });

      const base64 = await this.fal.downloadToBase64DataUrl(out.imageUrls[0]);

      // Studio outputs should be persisted as DB-backed image assets.
      const { images: stored } = await this.imageStorage.uploadImages([base64], {
        userId,
        category: 'gallery',
        jobId: externalJobId,
        characterId,
      });

      const img = stored[0];
      const row = await this.imagesRepo.createImage({
        characterId,
        userId,
        s3Key: img.key,
        s3Url: img.url,
        thumbnailKey: img.key,
        thumbnailUrl: img.thumbnailUrl,
        prompt,
        negativePrompt,
        seed: seed?.toString() ?? null,
        width,
        height,
        status: 'completed',
        scene: (trackedJob?.input as any)?.scene ?? null,
        environment: (trackedJob?.input as any)?.environment ?? null,
        outfit: (trackedJob?.input as any)?.outfit ?? null,
        aspectRatio: (trackedJob?.input as any)?.aspectRatio ?? null,
        qualityMode: (trackedJob?.input as any)?.qualityMode ?? null,
        nsfw: false,
        sourceImageId: null,
        editType: null,
        editMaskS3Key: null,
      });

      await this.generationJobsRepo.updateById(jobId, {
        status: 'completed',
        completedAt: new Date(),
        completedCount: 1,
        output: {
          imageUrls: [img.url],
          thumbnailUrls: [img.thumbnailUrl],
          s3Keys: [img.key],
          imageIds: [row.id],
        } as any,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Fal generation failed';
      await this.generationJobsRepo.updateById(jobId, {
        status: 'failed',
        completedAt: new Date(),
        error: message,
      });
    }
  }
}


