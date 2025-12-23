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
  jobId: string;
  workflowUsed: WorkflowId;
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

    // Submit to ComfyUI pod
    const jobId = await this.comfyuiAdapter.submitBaseImageWithWorkflow({
      prompt: builtPrompt.prompt,
      negativePrompt: builtPrompt.negativePrompt,
      nsfw: input.nsfwEnabled,
      seed: input.seed,
      width: 1024,
      height: 1024,
      workflowId,
    });

    this.logger.log(`Job ${jobId} submitted with workflow: ${workflowId}`);

    // Return job ID - caller will poll for results
    return {
      images: [], // Will be populated when job completes
      jobId,
      workflowUsed: workflowId,
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
   * Check job status and get results
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

