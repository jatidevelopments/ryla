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
  getRecommendedWorkflow,
} from '@ryla/business';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ImageStorageService } from './image-storage.service';

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

  constructor(
    @Inject(forwardRef(() => ComfyUIJobRunnerAdapter))
    private readonly comfyuiAdapter: ComfyUIJobRunnerAdapter,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(forwardRef(() => ImageStorageService))
    private readonly imageStorage: ImageStorageService,
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

    // Generate 3 images with different seeds for variety
    const baseSeed = input.seed || Math.floor(Math.random() * 1000000);
    const jobIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      // Use different seeds for each image to create variation
      const seed = baseSeed + i;
      
      const jobId = await this.comfyuiAdapter.submitBaseImageWithWorkflow({
        prompt: builtPrompt.prompt,
        negativePrompt: builtPrompt.negativePrompt,
        nsfw: input.nsfwEnabled,
        seed,
        width: 1024,
        height: 1024,
        workflowId,
      });

      jobIds.push(jobId);
      this.logger.log(`Job ${jobId} submitted (${i + 1}/3) with workflow: ${workflowId}, seed: ${seed}`);
    }

    // Return first job ID as primary, but include all job IDs
    return {
      images: [], // Will be populated when jobs complete
      jobId: jobIds[0], // Primary job ID
      workflowUsed: workflowId,
      allJobIds: jobIds, // All 3 job IDs for batch polling
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
    const status = await this.comfyuiAdapter.getJobStatus(jobId);

    if (status.status === 'COMPLETED' && status.output) {
      const output = status.output as { images?: string[] };
      const base64Images = output.images || [];

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

