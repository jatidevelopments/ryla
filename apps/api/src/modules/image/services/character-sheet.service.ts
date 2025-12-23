import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RunPodService } from '../../runpod/services/runpod.service';
import { createCharacterSheetWorkflow } from '@ryla/business';
import { ImageStorageService } from './image-storage.service';

export interface CharacterSheetGenerationInput {
  baseImageUrl: string;
  characterId: string;
  nsfwEnabled: boolean;
}

export interface CharacterSheetVariation {
  angle: string;
  pose: string;
  expression?: string;
  lighting?: string;
}

export interface CharacterSheetGenerationResult {
  jobId: string;
  variations: CharacterSheetVariation[];
}

/**
 * Service for generating character sheets (7-10 variations) from a base image
 * 
 * Uses PuLID + ControlNet to generate consistent character variations with:
 * - Multiple angles (front, side, 3/4, back)
 * - Different poses
 * - Various expressions
 * - Different lighting conditions
 */
@Injectable()
export class CharacterSheetService {
  private readonly logger = new Logger(CharacterSheetService.name);
  private readonly runpodEndpointId: string;

  // Predefined variations for character sheet generation
  private readonly defaultVariations: CharacterSheetVariation[] = [
    { angle: 'front', pose: 'standing', expression: 'neutral', lighting: 'studio' },
    { angle: 'front', pose: 'standing', expression: 'smiling', lighting: 'natural' },
    { angle: '3/4 left', pose: 'standing', expression: 'neutral', lighting: 'studio' },
    { angle: '3/4 right', pose: 'standing', expression: 'confident', lighting: 'natural' },
    { angle: 'side left', pose: 'standing', expression: 'neutral', lighting: 'studio' },
    { angle: 'side right', pose: 'standing', expression: 'neutral', lighting: 'natural' },
    { angle: 'back', pose: 'standing', expression: undefined, lighting: 'studio' },
    { angle: 'front', pose: 'sitting', expression: 'relaxed', lighting: 'natural' },
    { angle: '3/4 left', pose: 'sitting', expression: 'neutral', lighting: 'studio' },
    { angle: 'front', pose: 'dynamic', expression: 'energetic', lighting: 'dramatic' },
  ];

  constructor(
    @Inject(forwardRef(() => RunPodService)) private readonly runpodService: RunPodService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(forwardRef(() => ImageStorageService))
    private readonly imageStorage: ImageStorageService,
  ) {
    this.runpodEndpointId =
      this.configService.get<string>('RUNPOD_ENDPOINT_CHARACTER_SHEET') ||
      this.configService.get<string>('RUNPOD_ENDPOINT_IMAGE_GENERATION') ||
      '';
  }

  /**
   * Generate character sheet (7-10 variations) from base image
   * 
   * This runs in the background after character creation.
   * User can generate images with face swap while this processes.
   */
  async generateCharacterSheet(
    input: CharacterSheetGenerationInput,
  ): Promise<CharacterSheetGenerationResult> {
    // Select 7-10 variations (randomize selection for variety)
    const variations = this.selectVariations(7, 10);

    // Build base prompt (minimal, since PuLID handles face consistency)
    const basePrompt = this.buildBasePrompt(input.nsfwEnabled);
    const negativePrompt = this.buildNegativePrompt();

    // Generate workflows for each variation
    const workflows = variations.map((variation) =>
      createCharacterSheetWorkflow(
        input.baseImageUrl, // Base image URL (will be downloaded in RunPod handler)
        basePrompt,
        negativePrompt,
        variation,
        input.nsfwEnabled
          ? 'flux1-schnell-uncensored.safetensors'
          : 'flux1-schnell.safetensors',
        1024, // width
        1024, // height
        25, // steps (higher for better quality)
        7.0, // cfg
        -1 // seed (random for each variation)
      )
    );

    // Execute all variations as a batch job on RunPod
    // The RunPod handler will process each workflow and return all images
    const jobId = await this.runpodService.runJob(this.runpodEndpointId, {
      workflows,
      baseImageUrl: input.baseImageUrl,
      characterId: input.characterId,
      count: variations.length,
    });

    return {
      jobId,
      variations,
    };
  }

  /**
   * Check job status and get results
   * When complete, uploads images to S3/MinIO and returns permanent URLs
   *
   * @param jobId RunPod job ID
   * @param userId User ID for storage organization (optional, uses 'anonymous' if not provided)
   */
  async getJobResults(jobId: string, userId?: string) {
    const status = await this.runpodService.getJobStatus(jobId);

    if (status.status === 'COMPLETED' && status.output) {
      // Parse output - could be base64 images or URLs depending on handler
      const output = status.output as { images?: string[]; variations?: CharacterSheetVariation[] };
      const base64Images = output.images || [];

      if (base64Images.length === 0) {
        return {
          status: 'completed',
          images: [],
        };
      }

      // Check if images are base64 (need upload) or URLs (already hosted)
      const isBase64 = base64Images[0]?.startsWith('data:');

      if (isBase64) {
        try {
          // Upload base64 images to MinIO/S3 storage with proper folder structure
          const { images: storedImages } = await this.imageStorage.uploadImages(
            base64Images,
            {
              userId: userId || 'anonymous',
              category: 'character-sheets',
              jobId,
            },
          );

          this.logger.log(`Uploaded ${storedImages.length} character sheet images for job ${jobId}`);

          return {
            status: 'completed',
            images: storedImages.map((img, idx) => ({
              id: `${jobId}-${idx}`,
              url: img.url,
              thumbnailUrl: img.thumbnailUrl,
              s3Key: img.key,
              variation: output.variations?.[idx],
            })),
          };
        } catch (error) {
          this.logger.error(`Failed to upload character sheet images: ${error}`);
          // Fall back to base64 if storage fails
          return {
            status: 'completed',
            images: base64Images.map((img, idx) => ({
              id: `${jobId}-${idx}`,
              url: img,
              thumbnailUrl: img,
              variation: output.variations?.[idx],
            })),
            warning: 'Images stored as base64 - storage upload failed',
          };
        }
      }

      // Images are already URLs
      return {
        status: 'completed',
        images: base64Images.map((url, idx) => ({
          id: `${jobId}-${idx}`,
          url,
          thumbnailUrl: url,
          variation: output.variations?.[idx],
        })),
      };
    }

    return {
      status: status.status.toLowerCase(),
      images: [],
    };
  }

  /**
   * Select random variations from default set
   */
  private selectVariations(min: number, max: number): CharacterSheetVariation[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...this.defaultVariations].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Build base prompt for character sheet generation
   * 
   * Minimal prompt since PuLID handles face consistency.
   * Focus on quality and style.
   */
  private buildBasePrompt(nsfwEnabled: boolean): string {
    let prompt = 'high quality, detailed, professional photography, ';
    prompt += '8k, best quality, masterpiece, sharp focus';

    if (nsfwEnabled) {
      prompt += ', nsfw allowed';
    }

    return prompt;
  }

  /**
   * Build negative prompt
   */
  private buildNegativePrompt(): string {
    return `deformed, blurry, bad anatomy, disfigured, poorly drawn face, 
      mutation, mutated, extra limb, ugly, poorly drawn hands, 
      bad fingers, extra fingers, missing fingers, low quality, 
      worst quality, jpeg artifacts, watermark, signature`;
  }
}

