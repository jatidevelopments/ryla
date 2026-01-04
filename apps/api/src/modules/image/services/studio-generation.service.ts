import { BadRequestException, Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';

import * as schema from '@ryla/data/schema';
import { GenerationJobsRepository, ImagesRepository } from '@ryla/data';
import { buildWorkflow, getRecommendedWorkflow, PromptBuilder } from '@ryla/business';
import type { OutfitComposition } from '@ryla/shared';
import { randomUUID } from 'crypto';

import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { FalImageService, type FalFluxModelId } from './fal-image.service';
import { ImageStorageService } from './image-storage.service';
import { characterConfigToDNA } from './character-config-to-dna';
import { getPosePrompt } from './pose-lookup';
import { AwsS3Service } from '../../aws-s3/services/aws-s3.service';

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

function asValidEnumOrNull<T extends readonly string[]>(value: unknown, allowed: T): T[number] | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  return allowed.includes(trimmed as T[number]) ? (trimmed as T[number]) : null;
}

function normalizeString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
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
    @Inject(AwsS3Service)
    private readonly s3Service: AwsS3Service,
  ) {
    this.generationJobsRepo = new GenerationJobsRepository(this.db);
    this.imagesRepo = new ImagesRepository(this.db);
  }

  async startStudioGeneration(input: {
    userId: string;
    additionalDetails?: string;
    characterId: string;
    scene: string;
    environment: string;
    outfit: string | OutfitComposition;
    poseId?: string;
    lighting?: string;
    expression?: string;
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

    // Verify character ownership and fetch character data
    const character = await this.db.query.characters.findFirst({
      where: and(eq(schema.characters.id, input.characterId), eq(schema.characters.userId, input.userId)),
    });
    if (!character) throw new NotFoundException('Character not found');

    // Convert CharacterConfig to CharacterDNA
    const characterDNA = characterConfigToDNA(character.config, character.name);

    // Build prompt using PromptBuilder
    const builder = new PromptBuilder()
      .withCharacter(characterDNA)
      .withScene(input.scene)
      .withOutfit(input.outfit);

    // Add pose if provided
    // Get pose prompt text and add it directly (pose IDs don't match dot notation format)
    const posePrompt = getPosePrompt(input.poseId);
    if (posePrompt) {
      builder.addDetails(posePrompt);
    }

    // Add lighting if provided
    if (input.lighting) {
      builder.withLighting(input.lighting);
    }

    // Add expression if provided
    if (input.expression) {
      builder.withExpression(input.expression);
    }

    // Add additional details if provided
    if (input.additionalDetails?.trim()) {
      builder.addDetails(input.additionalDetails.trim());
    }

    // Add quality modifiers
    builder.withStylePreset('quality');

    // Build the final prompt
    const builtPrompt = builder.build();
    const basePrompt = builtPrompt.prompt;
    const negativePrompt = builtPrompt.negativePrompt;

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
              poseId: input.poseId,
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
      
      // Validate enum values before inserting
      const safeScene = asValidEnumOrNull((trackedJob?.input as any)?.scene, schema.scenePresetEnum.enumValues);
      const safeEnvironment = asValidEnumOrNull((trackedJob?.input as any)?.environment, schema.environmentPresetEnum.enumValues);
      const safeAspectRatio = asValidEnumOrNull((trackedJob?.input as any)?.aspectRatio, schema.aspectRatioEnum.enumValues);
      const safeQualityMode = asValidEnumOrNull((trackedJob?.input as any)?.qualityMode, schema.qualityModeEnum.enumValues);
      
      // Build image data object, only including fields with values
      const imageData: any = {
        characterId,
        userId,
        s3Key: img.key,
        thumbnailKey: img.key,
        status: 'completed' as const,
        nsfw: false,
      };
      
      if (prompt) imageData.prompt = prompt;
      if (negativePrompt) imageData.negativePrompt = negativePrompt;
      if (seed) imageData.seed = seed.toString();
      if (width) imageData.width = width;
      if (height) imageData.height = height;
      if (safeScene) imageData.scene = safeScene;
      if (safeEnvironment) imageData.environment = safeEnvironment;
      
      const outfit = normalizeString((trackedJob?.input as any)?.outfit);
      if (outfit) imageData.outfit = outfit;
      
      if (safeAspectRatio) imageData.aspectRatio = safeAspectRatio;
      if (safeQualityMode) imageData.qualityMode = safeQualityMode;
      
      const row = await this.imagesRepo.createImage(imageData);

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

  /**
   * Upscale an existing image using Fal.ai upscaling models
   */
  async startUpscale(input: {
    userId: string;
    imageId: string;
    modelId?: FalFluxModelId;
    scale?: number;
  }) {
    // Verify image exists and user owns it
    const sourceImage = await this.imagesRepo.getById(input.imageId);
    if (!sourceImage) {
      throw new NotFoundException('Source image not found');
    }

    if (sourceImage.userId !== input.userId) {
      throw new ForbiddenException('You do not have access to this image');
    }

    if (sourceImage.status !== 'completed') {
      throw new BadRequestException('Source image must be completed before upscaling');
    }

    // Verify character ownership if image is tied to a character
    if (sourceImage.characterId) {
      const character = await this.db.query.characters.findFirst({
        where: and(
          eq(schema.characters.id, sourceImage.characterId),
          eq(schema.characters.userId, input.userId)
        ),
      });
      if (!character) {
        throw new NotFoundException('Character not found');
      }
    }

    // Default to clarity-upscaler if no model specified
    const modelId: FalFluxModelId = input.modelId ?? 'fal-ai/clarity-upscaler';
    const scale = input.scale ?? 2;

    // Check if Fal.ai is configured
    if (!this.fal.isConfigured()) {
      throw new BadRequestException('Fal.ai is not configured. Upscaling requires Fal.ai API key.');
    }

    // Get signed URL for the source image
    const sourceImageUrl = await this.s3Service.getFileUrl(sourceImage.s3Key);

    // Create job record
    const externalJobId = `fal_upscale_${randomUUID()}`;
    const job = await this.generationJobsRepo.createJob({
      userId: input.userId,
      characterId: sourceImage.characterId,
      type: 'image_upscale',
      status: 'processing',
      input: {
        sourceImageId: input.imageId,
        modelId,
        scale,
      },
      imageCount: 1,
      completedCount: 0,
      externalJobId,
      externalProvider: 'fal',
      startedAt: new Date(),
    });

    // Run upscaling in background
    void this.runFalUpscaleJob({
      jobId: job.id,
      externalJobId,
      userId: input.userId,
      characterId: sourceImage.characterId,
      sourceImageId: input.imageId,
      sourceImageUrl,
      modelId,
      scale,
    });

    return { jobId: job.id, promptId: externalJobId };
  }

  private async runFalUpscaleJob(params: {
    jobId: string;
    externalJobId: string;
    userId: string;
    characterId: string | null;
    sourceImageId: string;
    sourceImageUrl: string;
    modelId: FalFluxModelId;
    scale: number;
  }) {
    const {
      jobId,
      externalJobId,
      userId,
      characterId,
      sourceImageId,
      sourceImageUrl,
      modelId,
      scale,
    } = params;

    try {
      const trackedJob = await this.generationJobsRepo.getById(jobId);

      // Call Fal.ai upscaling API
      const out = await this.fal.runUpscale(modelId, {
        imageUrl: sourceImageUrl,
        scale,
      });

      // Download upscaled image
      const base64 = await this.fal.downloadToBase64DataUrl(out.imageUrls[0]);

      // Upload upscaled image to storage
      const { images: stored } = await this.imageStorage.uploadImages([base64], {
        userId,
        category: 'gallery',
        jobId: externalJobId,
        characterId: characterId ?? undefined,
      });

      const img = stored[0];

      // Get source image metadata for reference
      const sourceImage = await this.imagesRepo.getById({ id: sourceImageId, userId });

      // Build image data object for upscaled image
      const upscaleImageData: any = {
        characterId,
        userId,
        s3Key: img.key,
        thumbnailKey: img.key,
        prompt: sourceImage?.prompt ?? 'Upscaled image',
        status: 'completed' as const,
        nsfw: sourceImage?.nsfw ?? false,
        sourceImageId,
        editType: 'upscale',
      };
      
      if (sourceImage?.negativePrompt) upscaleImageData.negativePrompt = sourceImage.negativePrompt;
      if (sourceImage?.seed) upscaleImageData.seed = sourceImage.seed;
      if (sourceImage?.width) upscaleImageData.width = sourceImage.width * scale;
      if (sourceImage?.height) upscaleImageData.height = sourceImage.height * scale;
      if (sourceImage?.scene) upscaleImageData.scene = sourceImage.scene;
      if (sourceImage?.environment) upscaleImageData.environment = sourceImage.environment;
      if (sourceImage?.outfit) upscaleImageData.outfit = sourceImage.outfit;
      if (sourceImage?.aspectRatio) upscaleImageData.aspectRatio = sourceImage.aspectRatio;
      if (sourceImage?.qualityMode) upscaleImageData.qualityMode = sourceImage.qualityMode;

      // Create image record for upscaled image
      const row = await this.imagesRepo.createImage(upscaleImageData);

      // Update job status
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
      const message = e instanceof Error ? e.message : 'Fal upscaling failed';
      await this.generationJobsRepo.updateById(jobId, {
        status: 'failed',
        completedAt: new Date(),
        error: message,
      });
    }
  }
}


