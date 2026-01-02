/**
 * Base Image Generation Service
 *
 * Generates character base images using the ComfyUI pod and workflow factory.
 * Integrates with the prompt library for character DNA-based prompt building.
 *
 * @see ADR-003: Use Dedicated ComfyUI Pod Over Serverless
 */

import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PromptBuilder,
  CharacterDNA,
  WorkflowId,
} from '@ryla/business';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ImageStorageService } from './image-storage.service';
import { FalImageService, type FalFluxModelId } from './fal-image.service';

export interface BaseImageGenerationInput {
  appearance: {
    gender: 'female' | 'male';
    style: 'realistic' | 'anime';
    ethnicity: string;
    age: number;
    hairStyle: string;
    hairColor: string;
    eyeColor: string;
    bodyType: string;
    breastSize?: string;
  };
  identity: {
    defaultOutfit: string;
    archetype: string;
    personalityTraits: string[];
    bio?: string;
  };
  nsfwEnabled: boolean;
  workflowId?: WorkflowId;
  seed?: number;
  steps?: number;
  cfg?: number;
  width?: number;
  height?: number;
}

export interface BaseImageGenerationResult {
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl: string;
  }>;
  jobId: string; // Primary job ID (first of 3)
  workflowUsed: WorkflowId;
  allJobIds?: string[]; // All 3 job IDs for batch polling
}

@Injectable()
export class BaseImageGenerationService {
  private readonly logger = new Logger(BaseImageGenerationService.name);
  private readonly externalResults = new Map<
    string,
    { status: 'queued' | 'in_progress' | 'completed' | 'failed'; images: any[]; error?: string; createdAt: number }
  >();

  constructor(
    @Inject(forwardRef(() => ComfyUIJobRunnerAdapter))
    private readonly comfyuiAdapter: ComfyUIJobRunnerAdapter,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(forwardRef(() => ImageStorageService))
    private readonly imageStorage: ImageStorageService,
    @Inject(forwardRef(() => FalImageService))
    private readonly fal: FalImageService,
  ) {}

  /**
   * Generate base image(s) from wizard config using ComfyUI pod
   * Generates 3 images with different seeds for variety
   */
  async generateBaseImages(
    input: BaseImageGenerationInput,
  ): Promise<BaseImageGenerationResult> {
    // Ensure ComfyUI is available
    if (!this.comfyuiAdapter.isAvailable()) {
      throw new Error(
        'ComfyUI pod not available. Check COMFYUI_POD_URL configuration.',
      );
    }

    // Convert wizard config to CharacterDNA
    const characterDNA = this.wizardConfigToCharacterDNA(input);

    // Build prompt using PromptBuilder with character DNA
    const builtPrompt = new PromptBuilder()
      .withCharacter(characterDNA)
      .withTemplate('portrait-selfie-casual') // Default template for base images
      .withOutfit(input.identity.defaultOutfit)
      .withLighting('natural.soft')
      .withExpression('positive.confident')
      .withStylePreset('quality')
      .build();

    this.logger.debug(`Generated prompt: ${builtPrompt.prompt.substring(0, 100)}...`);

    // Select workflow (use recommended or specified)
    const workflowId = input.workflowId || this.comfyuiAdapter.getRecommendedWorkflow();

    // Speed-first defaults (override per request if needed)
    const width = input.width ?? 1024;
    const height = input.height ?? 1024;
    const steps = input.steps ?? 9;
    const cfg = input.cfg ?? 1.0;

    const baseSeed = input.seed || Math.floor(Math.random() * 1000000);

    // Hybrid strategy (SFW only): Fal Schnell + Fal Dev + internal ComfyUI workflow (Danrisi recommended).
    // If Fal is not configured or errors, we fall back to internal-only.
    const shouldUseFal = !input.nsfwEnabled && this.fal.isConfigured();

    if (shouldUseFal) {
      const falModels: FalFluxModelId[] = ['fal-ai/flux/schnell', 'fal-ai/flux/dev'];
      const falJobIds = falModels.map((m) => this.createExternalJobId(`fal:${m}`));

      // Initialize entries as in_progress so polling can start immediately.
      falJobIds.forEach((id) => {
        this.externalResults.set(id, {
          status: 'in_progress',
          images: [],
          createdAt: Date.now(),
        });
      });

      // Kick off Fal work in background.
      falJobIds.forEach((jobId, idx) => {
        const modelId = falModels[idx];
        const seed = baseSeed + idx;
        void this.runFalBaseImageJob({
          jobId,
          modelId,
          prompt: builtPrompt.prompt,
          negativePrompt: builtPrompt.negativePrompt,
          width,
          height,
          seed,
          userId: 'anonymous',
        });
      });

      // Internal ComfyUI job for the 3rd image.
      const internalSeed = baseSeed + 2;
      const internalJobId = await this.comfyuiAdapter.submitBaseImageWithWorkflow({
        prompt: builtPrompt.prompt,
        negativePrompt: builtPrompt.negativePrompt,
        nsfw: input.nsfwEnabled,
        seed: internalSeed,
        width,
        height,
        steps,
        cfg,
        workflowId,
      });

      const allJobIds = [...falJobIds, internalJobId];
      this.logger.log(
        `Base images queued (hybrid): fal(${falModels.join(', ')}) + comfyui(${workflowId}) jobIds=${allJobIds.join(', ')}`,
      );

      return {
        images: [],
        jobId: allJobIds[0],
        workflowUsed: workflowId,
        allJobIds,
      };
    }

    // Internal-only fallback (3 ComfyUI jobs)
    const jobs = Array.from({ length: 3 }).map((_, i) => {
      const seed = baseSeed + i;
      return {
        seed,
        promise: this.comfyuiAdapter.submitBaseImageWithWorkflow({
          prompt: builtPrompt.prompt,
          negativePrompt: builtPrompt.negativePrompt,
          nsfw: input.nsfwEnabled,
          seed,
          width,
          height,
          steps,
          cfg,
          workflowId,
        }),
      };
    });

    const jobIds = await Promise.all(jobs.map((j) => j.promise));
    jobIds.forEach((jobId, idx) => {
      this.logger.log(
        `Job ${jobId} submitted (${idx + 1}/3) with workflow: ${workflowId}, seed: ${jobs[idx].seed}, steps: ${steps}, size: ${width}x${height}`,
      );
    });

    return {
      images: [],
      jobId: jobIds[0],
      workflowUsed: workflowId,
      allJobIds: jobIds,
    };
  }

  /**
   * Generate image directly from CharacterDNA (for API use)
   */
  async generateFromCharacterDNA(input: {
    character: CharacterDNA;
    templateId?: string;
    scene?: string;
    outfit?: string;
    lighting?: string;
    expression?: string;
    nsfw?: boolean;
    seed?: number;
    workflowId?: WorkflowId;
  }): Promise<{ jobId: string; workflowUsed: WorkflowId }> {
    if (!this.comfyuiAdapter.isAvailable()) {
      throw new Error('ComfyUI pod not available.');
    }

    const jobId = await this.comfyuiAdapter.generateFromCharacterDNA(input);
    const workflowUsed = input.workflowId || this.comfyuiAdapter.getRecommendedWorkflow();

    return { jobId, workflowUsed };
  }

  /**
   * Convert wizard appearance/identity config to CharacterDNA
   * Maps the wizard's detailed config to the simpler CharacterDNA format
   */
  private wizardConfigToCharacterDNA(input: BaseImageGenerationInput): CharacterDNA {
    const { appearance, identity } = input;

    // Build descriptive strings from detailed config
    const hairDesc = `${appearance.hairColor} ${appearance.hairStyle} hair`;
    const eyesDesc = `${appearance.eyeColor} eyes`;
    const skinDesc = appearance.ethnicity.toLowerCase().includes('asian')
      ? 'fair smooth skin'
      : 'smooth skin with natural complexion';

    return {
      name: 'Character',
      age: `${appearance.age}-year-old`,
      ethnicity: appearance.ethnicity,
      hair: hairDesc,
      eyes: eyesDesc,
      skin: skinDesc,
      bodyType: appearance.bodyType,
      facialFeatures: identity.personalityTraits.length > 0
        ? identity.personalityTraits.join(', ')
        : undefined,
      style: `${identity.archetype} ${appearance.style}`,
    };
  }

  /**
   * Check job status and get results for a single job
   * When complete, uploads images to S3/MinIO and returns permanent URLs
   *
   * @param jobId ComfyUI prompt ID
   * @param userId User ID for storage organization (optional, uses 'anonymous' if not provided)
   */
  async getJobResults(jobId: string, userId?: string) {
    this.gcExternalResults();

    // External Fal job result (in-memory)
    if (jobId.startsWith('fal_job_')) {
      const record = this.externalResults.get(jobId);
      if (!record) {
        return { status: 'failed', images: [], error: 'External job not found (expired)' };
      }
      return { status: record.status, images: record.images, error: record.error };
    }

    const status = await this.comfyuiAdapter.getJobStatus(jobId);

    if (status.status === 'COMPLETED' && status.output) {
      const output = status.output as { images?: string[] };
      // Base-image generation expects exactly 1 image per job.
      // Some ComfyUI workflows can output multiple images for a single prompt (e.g., batch size > 1).
      // Clamp to 1 to ensure we always return exactly 3 images total (one per model/job).
      const base64Images = (output.images || []).slice(0, 1);

      if (base64Images.length === 0) {
        return {
          status: 'completed',
          images: [],
        };
      }

      try {
        // Upload base64 images to MinIO/S3 storage with proper folder structure
        const { images: storedImages } = await this.imageStorage.uploadImages(
          base64Images,
          {
            userId: userId || 'anonymous',
            category: 'base-images',
            jobId,
            // characterId will be set later when character is created
          },
        );

        this.logger.log(`Uploaded ${storedImages.length} images to storage for job ${jobId}`);

        return {
          status: 'completed',
          images: storedImages.map((img, idx) => ({
            id: `${jobId}-${idx}`,
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
            s3Key: img.key,
          })),
        };
      } catch (error) {
        this.logger.error(`Failed to upload images to storage: ${error}`);
        // Fall back to base64 if storage fails
        return {
          status: 'completed',
          images: base64Images.map((img, idx) => ({
            id: `${jobId}-${idx}`,
            url: img, // Base64 data URL as fallback
            thumbnailUrl: img,
          })),
          warning: 'Images stored as base64 - storage upload failed',
        };
      }
    }

    return {
      status: status.status.toLowerCase(),
      images: [],
      error: status.error,
    };
  }

  private createExternalJobId(prefix: string): string {
    // Keep it URL-safe, but deterministic-ish for debugging.
    const id = `${prefix}:${Math.random().toString(36).slice(2, 10)}:${Date.now().toString(36)}`;
    return `fal_job_${Buffer.from(id).toString('base64url')}`;
  }

  private async runFalBaseImageJob(params: {
    jobId: string;
    modelId: FalFluxModelId;
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    seed?: number;
    userId: string;
  }) {
    const { jobId, modelId, prompt, negativePrompt, width, height, seed, userId } = params;
    try {
      this.logger.log(`Fal base image started jobId=${jobId} model=${modelId}`);
      const out = await this.fal.runFlux(modelId, {
        prompt,
        negativePrompt,
        width,
        height,
        seed,
        numImages: 1,
      });

      // Download -> base64 data URL -> upload to our storage for stable URLs.
      const base64 = await this.fal.downloadToBase64DataUrl(out.imageUrls[0]);
      const { images: stored } = await this.imageStorage.uploadImages([base64], {
        userId,
        category: 'base-images',
        jobId,
      });

      const img = stored[0];
      this.externalResults.set(jobId, {
        status: 'completed',
        images: [
          {
            id: `${jobId}-0`,
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
            s3Key: img.key,
          },
        ],
        createdAt: Date.now(),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Fal generation failed';
      this.logger.warn(`Fal base image failed jobId=${jobId} model=${modelId}: ${message}`);
      this.externalResults.set(jobId, {
        status: 'failed',
        images: [],
        error: message,
        createdAt: Date.now(),
      });
    }
  }

  private gcExternalResults() {
    // Avoid unbounded memory growth; keep entries for 30 minutes.
    const ttlMs = 30 * 60 * 1000;
    const now = Date.now();
    for (const [key, value] of this.externalResults.entries()) {
      if (now - value.createdAt > ttlMs) {
        this.externalResults.delete(key);
      }
    }
  }

  /**
   * Get results for multiple jobs (batch polling)
   * Used for base image generation where we generate 3 images
   *
   * @param jobIds Array of ComfyUI prompt IDs
   * @param userId User ID for storage organization
   */
  async getBatchJobResults(jobIds: string[], userId?: string) {
    const allImages: Array<{
      id: string;
      url: string;
      thumbnailUrl: string;
      s3Key?: string;
    }> = [];

    let allCompleted = true;
    let hasError = false;
    let errorMessage: string | undefined;
    let anyInProgress = false;

    // Poll all jobs in parallel
    const results = await Promise.allSettled(
      jobIds.map((jobId) => this.getJobResults(jobId, userId))
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const jobId = jobIds[i];

      if (result.status === 'fulfilled') {
        const jobResult = result.value;
        if (jobResult.status === 'completed' && jobResult.images) {
          allImages.push(...jobResult.images);
        } else if (jobResult.status === 'in_progress' || jobResult.status === 'queued') {
          allCompleted = false;
          anyInProgress = true;
        } else if (jobResult.status !== 'completed') {
          allCompleted = false;
          if (jobResult.error) {
            hasError = true;
            errorMessage = jobResult.error;
          }
        }
      } else {
        // Promise rejected
        allCompleted = false;
        hasError = true;
        errorMessage = result.reason?.message || `Job ${jobId} failed`;
        this.logger.error(`Job ${jobId} failed: ${result.reason}`);
      }
    }

    if (hasError && allImages.length === 0) {
      return {
        status: 'failed',
        images: [],
        error: errorMessage || 'One or more jobs failed',
      };
    }

    // Return status based on completion
    if (allCompleted && allImages.length >= jobIds.length) {
      return {
        status: 'completed',
        images: allImages,
      };
    }

    // If we have some images but not all, return partial
    if (allImages.length > 0) {
      return {
        status: anyInProgress ? 'in_progress' : 'partial',
        images: allImages,
        error: hasError ? errorMessage : undefined,
      };
    }

    // No images yet, still in progress
    return {
      status: anyInProgress ? 'in_progress' : 'queued',
      images: [],
      error: hasError ? errorMessage : undefined,
    };
  }

  /**
   * Health check for the image generation service
   */
  async healthCheck(): Promise<{ available: boolean; recommendedWorkflow?: WorkflowId }> {
    const available = await this.comfyuiAdapter.healthCheck();
    return {
      available,
      recommendedWorkflow: available ? this.comfyuiAdapter.getRecommendedWorkflow() : undefined,
    };
  }
}

