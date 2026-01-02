/**
 * Profile Picture Set Service
 *
 * Generates 7-10 profile pictures using profile picture sets from the prompt library.
 * Uses PuLID workflow for face consistency with the selected base image.
 */

import { forwardRef, Inject, Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  getProfilePictureSet,
  buildProfilePicturePrompt,
  ProfilePictureSet,
  buildWorkflow,
  buildZImagePuLIDWorkflow,
  WorkflowId,
} from '@ryla/business';
import * as schema from '@ryla/data/schema';
import { GenerationJobsRepository, ImagesRepository } from '@ryla/data';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ImageStorageService } from './image-storage.service';

export interface ProfilePictureSetGenerationInput {
  baseImageUrl: string;
  characterId?: string;
  userId?: string;
  setId: 'classic-influencer' | 'professional-model' | 'natural-beauty';
  nsfwEnabled: boolean;
  generationMode?: 'fast' | 'consistent';
  workflowId?: WorkflowId;
  steps?: number;
  cfg?: number;
  width?: number;
  height?: number;
}

export interface ProfilePictureGenerationResult {
  jobId: string; // Primary job ID (first of batch)
  allJobIds: string[]; // All job IDs for batch polling
  jobPositions: Array<{
    jobId: string;
    positionId: string;
    positionName: string;
    prompt: string;
    negativePrompt: string;
    isNSFW: boolean;
  }>; // Map job IDs to positions
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
  private readonly comfyuiAdapter: ComfyUIJobRunnerAdapter;
  private readonly imageStorage: ImageStorageService;
  private readonly generationJobsRepo: GenerationJobsRepository;
  private readonly imagesRepo: ImagesRepository;

  constructor(
    @Inject('DRIZZLE_DB')
    db: NodePgDatabase<typeof schema>,
    @Inject(forwardRef(() => ComfyUIJobRunnerAdapter))
    comfyuiAdapter: ComfyUIJobRunnerAdapter,
    @Inject(forwardRef(() => ImageStorageService))
    imageStorage: ImageStorageService,
  ) {
    this.comfyuiAdapter = comfyuiAdapter;
    this.imageStorage = imageStorage;
    this.generationJobsRepo = new GenerationJobsRepository(db);
    this.imagesRepo = new ImagesRepository(db);
  }

  /**
   * Generate profile picture set (7-10 images) from selected base image
   */
  async generateProfilePictureSet(
    input: ProfilePictureSetGenerationInput,
  ): Promise<ProfilePictureGenerationResult> {
    // Ensure ComfyUI is available
    if (!this.comfyuiAdapter.isAvailable()) {
      throw new BadRequestException(
        'ComfyUI pod not available. Check COMFYUI_POD_URL configuration.',
      );
    }

    // Get profile picture set definition
    const set = getProfilePictureSet(input.setId);
    if (!set) {
      throw new BadRequestException(`Profile picture set '${input.setId}' not found`);
    }

    // Generate regular images (7-10 based on set)
    const regularImages = set.positions.map((position: ProfilePictureSet['positions'][0]) => {
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
      ? this.generateNSFWPositions().map((position) => {
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

    const generationMode = input.generationMode ?? 'fast';

    // Only upload reference image when using consistent mode (PuLID).
    // Uploading adds latency, and fast mode is speed-first.
    const referenceImageFilename =
      generationMode === 'consistent'
        ? await this.uploadReferenceImageToComfyUI(input.baseImageUrl)
        : null;

    // Speed-first defaults (can be overridden by input)
    const steps = input.steps ?? (generationMode === 'fast' ? 9 : 20);
    const cfg = input.cfg ?? 1.0;
    const defaultSize = generationMode === 'fast' ? 768 : 1024;

    const workflows = allImages.map((imageData) => {
      const { width, height } = this.getDimensionsForPosition(
        imageData.position,
        input.width,
        input.height,
        defaultSize,
      );

      // Fast mode: speed-first, no PuLID / no reference image
      if (generationMode === 'fast') {
        const workflowId = input.workflowId ?? this.comfyuiAdapter.getRecommendedWorkflow();
        return buildWorkflow(workflowId, {
          prompt: imageData.prompt,
          negativePrompt: imageData.negativePrompt,
          width,
          height,
          steps,
          cfg,
          seed: Math.floor(Math.random() * 2 ** 32),
          filenamePrefix: 'ryla_profile_fast',
        });
      }

      // Consistent mode: PuLID (slower), requires reference image uploaded to ComfyUI input
      if (!referenceImageFilename) {
        throw new BadRequestException('Reference image is required for consistent mode');
      }

      return buildZImagePuLIDWorkflow({
        prompt: imageData.prompt,
        negativePrompt: imageData.negativePrompt,
        referenceImage: referenceImageFilename,
        width,
        height,
        steps,
        cfg,
        seed: Math.floor(Math.random() * 2 ** 32),
        pulidStrength: 0.8,
        pulidStart: 0.0,
        pulidEnd: 0.8,
      });
    });

    // Submit all workflows in parallel to ComfyUI for simultaneous generation
    const jobIds: string[] = [];
    // Always use input.userId (which should be the authenticated user's ID from the controller)
    // Fallback to 'anonymous' only if not provided (shouldn't happen in normal flow)
    const userId = input.userId || 'anonymous';
    try {
      // Queue all workflows simultaneously using Promise.all
      const queuePromises = workflows.map((workflow) => {
        return this.comfyuiAdapter.queueWorkflow(workflow);
      });

      const queuedJobIds = await Promise.all(queuePromises);
      jobIds.push(...queuedJobIds);

      // Create generation job entries for each profile picture job
      // This allows us to track characterId and save images to the database later
      // IMPORTANT: userId must match the authenticated user's ID used in getJobResult
      for (let i = 0; i < queuedJobIds.length; i++) {
        const externalJobId = queuedJobIds[i];
        const imageData = allImages[i];
        const { width, height } = this.getDimensionsForPosition(
          imageData.position,
          input.width,
          input.height,
          defaultSize,
        );

        await this.generationJobsRepo.createJob({
          userId, // This should be the authenticated user's ID
          characterId: input.characterId || undefined,
          type: 'character_sheet_generation', // Profile pictures are a type of character sheet
          status: 'queued',
          input: {
            prompt: imageData.prompt,
            negativePrompt: imageData.negativePrompt,
            seed: undefined,
            width,
            height,
            steps,
            nsfw: imageData.isNSFW,
            // Store position metadata for reference
            scene: undefined,
            environment: undefined,
            outfit: undefined,
            aspectRatio: imageData.position.aspectRatio === '1:1' ? '1:1' :
              imageData.position.aspectRatio === '4:5' ? '2:3' : '9:16',
            qualityMode: generationMode === 'fast' ? 'draft' : 'hq',
          },
          imageCount: 1,
          completedCount: 0,
          externalJobId,
          externalProvider: 'comfyui',
          startedAt: new Date(),
        });
      }

      this.logger.log(
        `Queued ${jobIds.length} workflows in parallel for profile picture generation (mode=${generationMode}, steps=${steps})`,
      );
    } catch (error) {
      this.logger.error(`Failed to queue profile picture workflows: ${error}`);
      throw new InternalServerErrorException(
        `Failed to queue profile picture generation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    this.logger.log(
      `Submitted ${workflows.length} profile picture generation jobs (${regularImages.length} regular, ${nsfwImages.length} NSFW)`,
    );

    // Map job IDs to positions for progressive loading
    const jobPositions = jobIds.map((jobId, index) => ({
      jobId,
      positionId: allImages[index].position.id,
      positionName: allImages[index].position.name,
      prompt: allImages[index].prompt,
      negativePrompt: allImages[index].negativePrompt,
      isNSFW: allImages[index].isNSFW,
    }));

    // Return all job IDs with position mapping for progressive loading
    return {
      jobId: jobIds[0], // Primary job ID for backward compatibility
      allJobIds: jobIds, // All job IDs for batch polling
      jobPositions, // Map to track which job corresponds to which position
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
    generationMode?: 'fast' | 'consistent';
    workflowId?: WorkflowId;
    steps?: number;
    cfg?: number;
    width?: number;
    height?: number;
  }): Promise<{ jobId: string }> {
    if (!this.comfyuiAdapter.isAvailable()) {
      throw new BadRequestException(
        'ComfyUI pod not available. Check COMFYUI_POD_URL configuration.',
      );
    }

    // Get profile picture set
    const set = getProfilePictureSet(input.setId);
    if (!set) {
      throw new BadRequestException(`Profile picture set '${input.setId}' not found`);
    }

    // Find position
    const position = set.positions.find((p: ProfilePictureSet['positions'][0]) => p.id === input.positionId);
    if (!position) {
      throw new BadRequestException(`Position '${input.positionId}' not found in set`);
    }

    // Use provided prompt or build from position
    const { prompt, negativePrompt } = input.prompt
      ? { prompt: input.prompt, negativePrompt: input.negativePrompt || set.negativePrompt }
      : buildProfilePicturePrompt(set, position);

    const generationMode = input.generationMode ?? 'fast';
    const steps = input.steps ?? (generationMode === 'fast' ? 9 : 20);
    const cfg = input.cfg ?? 1.0;
    const defaultSize = generationMode === 'fast' ? 768 : 1024;
    const { width, height } = this.getDimensionsForPosition(
      position,
      input.width,
      input.height,
      defaultSize,
    );

    let workflow: unknown;
    if (generationMode === 'fast') {
      const workflowId = input.workflowId ?? this.comfyuiAdapter.getRecommendedWorkflow();
      workflow = buildWorkflow(workflowId, {
        prompt,
        negativePrompt,
        width,
        height,
        steps,
        cfg,
        seed: Math.floor(Math.random() * 2 ** 32),
        filenamePrefix: 'ryla_profile_fast',
      });
    } else {
      const referenceImageFilename = await this.uploadReferenceImageToComfyUI(input.baseImageUrl);
      workflow = buildZImagePuLIDWorkflow({
        prompt,
        negativePrompt,
        referenceImage: referenceImageFilename,
        width,
        height,
        steps,
        cfg,
        seed: Math.floor(Math.random() * 2 ** 32),
        pulidStrength: 0.8,
        pulidStart: 0.0,
        pulidEnd: 0.8,
      });
    }

    // Submit workflow
    const jobId = await this.comfyuiAdapter.queueWorkflow(workflow);

    this.logger.log(`Regenerated profile picture for position '${input.positionId}'`);

    return { jobId };
  }

  private getDimensionsForPosition(
    position: { aspectRatio?: '1:1' | '4:5' | '9:16' } | undefined,
    widthOverride: number | undefined,
    heightOverride: number | undefined,
    baseSize: number,
  ): { width: number; height: number } {
    if (widthOverride && heightOverride) {
      return { width: widthOverride, height: heightOverride };
    }

    const ratio = position?.aspectRatio ?? '1:1';
    switch (ratio) {
      case '4:5':
        return { width: baseSize, height: Math.round(baseSize * 5 / 4) };
      case '9:16':
        return { width: baseSize, height: Math.round(baseSize * 16 / 9) };
      case '1:1':
      default:
        return { width: baseSize, height: baseSize };
    }
  }

  /**
   * Generate NSFW positions (3 additional adult images)
   */
  private generateNSFWPositions(): Array<{
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
   * Get results for a single profile picture job
   * Used for progressive loading - returns image as soon as it's ready
   * Saves images to database with characterId for proper association
   */
  async getJobResult(jobId: string, userId?: string) {
    // Look up the generation job to get characterId and metadata
    const trackedJob = userId
      ? await this.generationJobsRepo.getByExternalJobId({
        externalJobId: jobId,
        userId,
      })
      : null;

    const status = await this.comfyuiAdapter.getJobStatus(jobId);

    if (status.status === 'COMPLETED' && status.output) {
      const output = status.output as { images?: string[] };
      const base64Images = output.images || [];

      if (base64Images.length === 0) {
        // Update job status even if no images
        if (trackedJob) {
          await this.generationJobsRepo.updateById(trackedJob.id, {
            status: 'completed',
            completedAt: new Date(),
            output: { imageUrls: [], thumbnailUrls: [], s3Keys: [], imageIds: [] },
          });
        }
        return {
          status: 'completed',
          images: [],
        };
      }

      try {
        const actualUserId = userId || trackedJob?.userId || 'anonymous';
        const characterId = trackedJob?.characterId || null;

        // Upload base64 images to MinIO/S3 storage
        const { images: storedImages } = await this.imageStorage.uploadImages(
          base64Images,
          {
            userId: actualUserId,
            category: 'profile-pictures',
            jobId,
            characterId: characterId || undefined,
          },
        );

        this.logger.log(`Uploaded ${storedImages.length} profile picture(s) for job ${jobId}`);

        // Save images to database with characterId for proper association
        const createdImages = [];
        for (let i = 0; i < storedImages.length; i++) {
          const img = storedImages[i];
          const jobInput = trackedJob?.input as schema.GenerationInput | undefined;

          const imageRow = await this.imagesRepo.createImage({
            characterId: characterId || null,
            userId: actualUserId,
            s3Key: img.key,
            s3Url: img.url,
            thumbnailKey: null, // StoredImage doesn't have thumbnailKey, only thumbnailUrl
            thumbnailUrl: img.thumbnailUrl,
            prompt: jobInput?.prompt ?? null,
            negativePrompt: jobInput?.negativePrompt ?? null,
            seed: jobInput?.seed ?? null,
            width: jobInput?.width ?? null,
            height: jobInput?.height ?? null,
            status: 'completed',
            scene: (jobInput?.scene as any) ?? null,
            environment: (jobInput?.environment as any) ?? null,
            outfit: jobInput?.outfit ?? null,
            aspectRatio: jobInput?.aspectRatio ?? null,
            qualityMode: jobInput?.qualityMode ?? null,
            nsfw: Boolean(jobInput?.nsfw),
            sourceImageId: null,
            editType: null,
            editMaskS3Key: null,
          });
          createdImages.push(imageRow);
        }

        // Update generation job with completed status and image IDs
        if (trackedJob) {
          await this.generationJobsRepo.updateById(trackedJob.id, {
            status: 'completed',
            completedAt: new Date(),
            completedCount: storedImages.length,
            output: {
              imageUrls: storedImages.map((i) => i.url),
              thumbnailUrls: storedImages.map((i) => i.thumbnailUrl),
              s3Keys: storedImages.map((i) => i.key),
              imageIds: createdImages.map((r) => r.id),
            } as Record<string, unknown>,
          });
        }

        return {
          status: 'completed',
          images: createdImages.map((row) => ({
            id: row.id,
            url: row.s3Url || storedImages[0]?.url || '',
            thumbnailUrl: row.thumbnailUrl || storedImages[0]?.thumbnailUrl || '',
            s3Key: row.s3Key || storedImages[0]?.key,
          })),
        };
      } catch (error) {
        this.logger.error(`Failed to upload/save images: ${error}`);

        // Update job status to failed if we have a tracked job
        if (trackedJob) {
          await this.generationJobsRepo.updateById(trackedJob.id, {
            status: 'failed',
            completedAt: new Date(),
            error: error instanceof Error ? error.message : 'Failed to save images',
          });
        }

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

    // Update job status for non-completed states
    if (trackedJob) {
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
      }
    }

    return {
      status: status.status.toLowerCase(),
      images: [],
      error: status.error,
    };
  }

  /**
   * Upload reference image to ComfyUI input folder
   * Returns the filename that can be used with LoadImage node
   */
  private async uploadReferenceImageToComfyUI(imageUrl: string): Promise<string> {
    try {
      // Fetch image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `pulid-reference-${timestamp}.png`;

      // Upload to ComfyUI input folder
      const uploadedFilename = await this.comfyuiAdapter.uploadImage(buffer, filename);

      this.logger.log(`Uploaded reference image to ComfyUI: ${uploadedFilename}`);
      return uploadedFilename;
    } catch (error) {
      this.logger.error(`Failed to upload reference image to ComfyUI: ${error}`);
      throw new BadRequestException(
        `Failed to upload reference image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

