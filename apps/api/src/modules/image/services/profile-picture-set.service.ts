/**
 * Profile Picture Set Service
 *
 * Generates 7-10 profile pictures using profile picture sets from the prompt library.
 * Uses PuLID workflow for face consistency with the selected base image.
 */

import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getProfilePictureSet,
  buildProfilePicturePrompt,
  type ProfilePictureSet,
} from '@ryla/business';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ImageStorageService } from './image-storage.service';
import { buildZImagePuLIDWorkflow } from '@ryla/business';

export interface ProfilePictureSetGenerationInput {
  baseImageUrl: string;
  characterId?: string;
  userId?: string;
  setId: 'classic-influencer' | 'professional-model' | 'natural-beauty';
  nsfwEnabled: boolean;
}

export interface ProfilePictureGenerationResult {
  jobId: string;
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    positionId: string;
    positionName: string;
    prompt: string;
    negativePrompt: string;
    isNSFW?: boolean;
  }>;
}

@Injectable()
export class ProfilePictureSetService {
  private readonly logger = new Logger(ProfilePictureSetService.name);

  constructor(
    @Inject(forwardRef(() => ComfyUIJobRunnerAdapter))
    private readonly comfyuiAdapter: ComfyUIJobRunnerAdapter,
    @Inject(forwardRef(() => ImageStorageService))
    private readonly imageStorage: ImageStorageService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  /**
   * Generate profile picture set (7-10 images) from selected base image
   */
  async generateProfilePictureSet(
    input: ProfilePictureSetGenerationInput,
  ): Promise<ProfilePictureGenerationResult> {
    // Ensure ComfyUI is available
    if (!this.comfyuiAdapter.isAvailable()) {
      throw new Error(
        'ComfyUI pod not available. Check COMFYUI_POD_URL configuration.',
      );
    }

    // Get profile picture set definition
    const set = getProfilePictureSet(input.setId);
    if (!set) {
      throw new Error(`Profile picture set '${input.setId}' not found`);
    }

    // Generate regular images (7-10 based on set)
    const regularImages = set.positions.map((position) => {
      const { prompt, negativePrompt } = buildProfilePicturePrompt(set, position);
      return {
        position,
        prompt,
        negativePrompt,
        isNSFW: false,
      };
    });

    // Generate NSFW images if enabled (3 additional)
    const nsfwImages = input.nsfwEnabled
      ? this.generateNSFWPositions(set).map((position) => {
          const { prompt, negativePrompt } = buildProfilePicturePrompt(set, position);
          return {
            position,
            prompt,
            negativePrompt,
            isNSFW: true,
          };
        })
      : [];

    const allImages = [...regularImages, ...nsfwImages];

    // Convert base image URL to base64 for PuLID workflow
    const referenceImageBase64 = await this.convertImageUrlToBase64(
      input.baseImageUrl,
    );

    // Generate workflows for each position using PuLID
    const workflows = allImages.map((imageData) => {
      return buildZImagePuLIDWorkflow({
        prompt: imageData.prompt,
        negativePrompt: imageData.negativePrompt,
        referenceImage: referenceImageBase64,
        width: 1024,
        height: 1024,
        seed: -1, // Random seed for variety
        pulidStrength: 0.8,
        pulidStart: 0.0,
        pulidEnd: 0.8,
      });
    });

    // Submit all workflows as batch to ComfyUI
    // For now, submit sequentially (can be optimized to batch later)
    const jobIds: string[] = [];
    for (let i = 0; i < workflows.length; i++) {
      const workflow = workflows[i];
      const imageData = allImages[i];
      // Queue the PuLID workflow directly
      const jobId = await this.comfyuiAdapter.queueWorkflow(workflow);
      jobIds.push(jobId);
    }

    this.logger.log(
      `Submitted ${workflows.length} profile picture generation jobs (${regularImages.length} regular, ${nsfwImages.length} NSFW)`,
    );

    // Return job IDs - caller will poll for results
    // For now, return first job ID as main job ID
    // TODO: Implement batch job tracking
    return {
      jobId: jobIds[0],
      images: [], // Will be populated when jobs complete
    };
  }

  /**
   * Regenerate a single profile picture with optional prompt override
   */
  async regenerateProfilePicture(input: {
    baseImageUrl: string;
    positionId: string;
    prompt?: string;
    negativePrompt?: string;
    nsfwEnabled: boolean;
    setId: 'classic-influencer' | 'professional-model' | 'natural-beauty';
  }): Promise<{ jobId: string }> {
    if (!this.comfyuiAdapter.isAvailable()) {
      throw new Error(
        'ComfyUI pod not available. Check COMFYUI_POD_URL configuration.',
      );
    }

    // Get profile picture set
    const set = getProfilePictureSet(input.setId);
    if (!set) {
      throw new Error(`Profile picture set '${input.setId}' not found`);
    }

    // Find position
    const position = set.positions.find((p) => p.id === input.positionId);
    if (!position) {
      throw new Error(`Position '${input.positionId}' not found in set`);
    }

    // Use provided prompt or build from position
    const { prompt, negativePrompt } = input.prompt
      ? { prompt: input.prompt, negativePrompt: input.negativePrompt || set.negativePrompt }
      : buildProfilePicturePrompt(set, position);

    // Convert base image URL to base64 for PuLID workflow
    const referenceImageBase64 = await this.convertImageUrlToBase64(
      input.baseImageUrl,
    );

    // Build PuLID workflow
    const workflow = buildZImagePuLIDWorkflow({
      prompt,
      negativePrompt,
      referenceImage: referenceImageBase64,
      width: 1024,
      height: 1024,
      seed: -1,
      pulidStrength: 0.8,
      pulidStart: 0.0,
      pulidEnd: 0.8,
    });

    // Submit workflow
    const jobId = await this.comfyuiAdapter.queueWorkflow(workflow);

    this.logger.log(`Regenerated profile picture for position '${input.positionId}'`);

    return { jobId };
  }

  /**
   * Generate NSFW positions (3 additional adult images)
   */
  private generateNSFWPositions(
    set: ProfilePictureSet,
  ): Array<{
    id: string;
    name: string;
    angle: string;
    pose: string;
    expression: string;
    lighting: string;
    framing: 'close-up' | 'medium' | 'full-body';
    aspectRatio: '1:1' | '4:5' | '9:16';
  }> {
    // Generate 3 NSFW positions based on set style
    return [
      {
        id: 'nsfw-1',
        name: 'NSFW Front',
        angle: 'front',
        pose: 'standing',
        expression: 'seductive',
        lighting: 'dramatic',
        framing: 'full-body',
        aspectRatio: '9:16',
      },
      {
        id: 'nsfw-2',
        name: 'NSFW Side',
        angle: 'side',
        pose: 'standing',
        expression: 'confident',
        lighting: 'soft',
        framing: 'full-body',
        aspectRatio: '9:16',
      },
      {
        id: 'nsfw-3',
        name: 'NSFW 3/4',
        angle: '3/4',
        pose: 'sitting',
        expression: 'alluring',
        lighting: 'dramatic',
        framing: 'medium',
        aspectRatio: '4:5',
      },
    ];
  }

  /**
   * Convert image URL to base64 string for PuLID workflow
   */
  private async convertImageUrlToBase64(imageUrl: string): Promise<string> {
    // If already base64, return as is
    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }

    try {
      // Fetch image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');

      // Determine MIME type from response or URL
      const contentType =
        response.headers.get('content-type') || 'image/png';
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      this.logger.error(`Failed to convert image URL to base64: ${error}`);
      throw new Error(
        `Failed to convert image URL to base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

