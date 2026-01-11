/**
 * Profile Picture Set Service
 *
 * Generates 7-10 profile pictures using profile picture sets from the prompt library.
 * Uses PuLID workflow for face consistency with the selected base image.
 */

import { forwardRef, Inject, Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import {
  getProfilePictureSet,
  buildProfilePicturePrompt,
  ProfilePictureSet,
  buildWorkflow,
  buildZImageInstantIDWorkflow,
  WorkflowId,
  PromptBuilder,
  CharacterDNA,
  ProfilePicturePosition,
} from '@ryla/business';
import { CharacterConfig } from '@ryla/data/schema';
import { characterConfigToDNA } from './character-config-to-dna';
import * as schema from '@ryla/data/schema';
import { GenerationJobsRepository, ImagesRepository } from '@ryla/data';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ImageStorageService } from './image-storage.service';
import { getPosePrompt } from './pose-lookup';

export interface ProfilePictureSetGenerationInput {
  baseImageUrl: string;
  characterId?: string;
  userId?: string;
  setId: string; // Use string to allow any valid set ID
  nsfwEnabled: boolean;
  characterConfig?: CharacterConfig; // Optional character config
  characterName?: string; // Optional character name for DNA conversion
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
  private readonly db: NodePgDatabase<typeof schema>;

  constructor(
    @Inject('DRIZZLE_DB')
    db: NodePgDatabase<typeof schema>,
    @Inject(forwardRef(() => ComfyUIJobRunnerAdapter))
    comfyuiAdapter: ComfyUIJobRunnerAdapter,
    @Inject(forwardRef(() => ImageStorageService))
    imageStorage: ImageStorageService,
  ) {
    this.db = db;
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

    // Convert character config to CharacterDNA if provided, otherwise use set's default DNA
    let characterDNA: CharacterDNA;
    if (input.characterConfig && input.characterName) {
      characterDNA = characterConfigToDNA(input.characterConfig, input.characterName);
    } else {
      // Fall back to set's default character DNA
      characterDNA = set.characterDNA;
    }

    // Generate regular images (7-10 based on set) using PromptBuilder
    const regularImages = set.positions.map((position: ProfilePictureSet['positions'][0]) => {
      // Use actual studio components from position
      const scene = position.scene || this.mapPositionToScene(position);
      const environment = position.environment || this.mapPositionToEnvironment(position);
      const outfit = position.outfit || input.characterConfig?.defaultOutfit || 'casual';
      const lighting = position.lighting || this.mapPositionToLighting(position);

      // Use PromptBuilder with character DNA and position-specific settings
      const promptBuilder = new PromptBuilder()
        .withCharacter(characterDNA)
        .withTemplate('portrait-selfie-casual') // Base template
        .withScene(scene)
        .withOutfit(outfit)
        .withLighting(lighting)
        .withExpression(this.mapPositionToExpression(position));

      // Add pose using actual poseId if available, otherwise use pose description
      if (position.poseId) {
        const posePrompt = getPosePrompt(position.poseId);
        if (posePrompt) {
          promptBuilder.addDetails(posePrompt);
        }
      } else {
        promptBuilder.addDetails(this.mapPositionToPose(position));
      }

      // Add activity/personality element if specified
      if (position.activity) {
        promptBuilder.addDetails(position.activity);
      }

      const builtPrompt = promptBuilder
        .withStylePreset('quality')
        .build();

      return {
        position,
        prompt: builtPrompt.prompt,
        negativePrompt: builtPrompt.negativePrompt,
        isNSFW: false,
        // Store metadata for database
        scene,
        environment,
        outfit,
        lighting,
        poseId: position.poseId || null,
      };
    });

    // Generate NSFW images if enabled (3 additional) using PromptBuilder
    const nsfwImages = input.nsfwEnabled
      ? this.generateNSFWPositions().map((position) => {
        const scene = (position as any).scene || this.mapPositionToScene(position);
        const environment = (position as any).environment || this.mapPositionToEnvironment(position);
        const outfit = 'intimate'; // NSFW appropriate outfit
        const lighting = position.lighting || this.mapPositionToLighting(position);

        const promptBuilder = new PromptBuilder()
          .withCharacter(characterDNA)
          .withTemplate('portrait-selfie-casual')
          .withScene(scene)
          .withOutfit(outfit)
          .withLighting(lighting)
          .withExpression(this.mapPositionToExpression(position));

        // Add pose using actual poseId if available
        const poseId = (position as any).poseId;
        if (poseId) {
          const posePrompt = getPosePrompt(poseId);
          if (posePrompt) {
            promptBuilder.addDetails(posePrompt);
          }
        } else {
          promptBuilder.addDetails(this.mapPositionToPose(position));
        }

        const builtPrompt = promptBuilder
          .withStylePreset('quality')
          .build();

        return {
          position,
          prompt: builtPrompt.prompt,
          negativePrompt: builtPrompt.negativePrompt,
          isNSFW: true,
          // Store metadata for database
          scene,
          environment,
          outfit,
          lighting,
          poseId: (position as any).poseId || null,
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

    // For consistent mode, use Z-Image InstantID workflow
    // InstantID works better than PuLID for single-image workflows and extreme angles
    if (generationMode === 'consistent') {
      this.logger.log(
        `Using Z-Image InstantID workflow for consistent mode (better than PuLID)`
      );
    }

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

      // Consistent mode: Z-Image InstantID (slower), requires reference image uploaded to ComfyUI input
      // InstantID works better than PuLID for single-image workflows and handles extreme angles better
      if (!referenceImageFilename) {
        throw new BadRequestException('Reference image is required for consistent mode');
      }

      return buildZImageInstantIDWorkflow({
        prompt: imageData.prompt,
        negativePrompt: imageData.negativePrompt,
        referenceImage: referenceImageFilename,
        width,
        height,
        steps,
        cfg,
        seed: Math.floor(Math.random() * 2 ** 32),
        instantidStrength: 0.8,
        controlnetStrength: 0.8,
        faceProvider: 'CPU', // CPU is more stable
        filenamePrefix: 'ryla_profile_consistent',
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

        // Map aspect ratio from position to valid enum value
        const aspectRatio = imageData.position.aspectRatio === '1:1' ? '1:1' :
          imageData.position.aspectRatio === '4:5' ? '2:3' : '9:16';

        // Convert scene/environment to snake_case (as studio does)
        const sceneSnakeCase = (imageData as any).scene
          ? (imageData as any).scene.replace(/-/g, '_')
          : null;
        const environmentSnakeCase = (imageData as any).environment
          ? (imageData as any).environment.replace(/-/g, '_')
          : null;

        // Validate scene/environment against enum values
        const scene = sceneSnakeCase && schema.scenePresetEnum.enumValues.includes(sceneSnakeCase as any)
          ? sceneSnakeCase
          : null;
        const environment = environmentSnakeCase && schema.environmentPresetEnum.enumValues.includes(environmentSnakeCase as any)
          ? environmentSnakeCase
          : null;

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
            cfg: input.cfg ?? 1.0, // Store CFG for retry
            nsfw: imageData.isNSFW,
            // Store actual studio metadata from position
            scene,
            environment,
            outfit: (imageData as any).outfit || input.characterConfig?.defaultOutfit || null,
            poseId: (imageData as any).poseId || null,
            lightingId: (imageData as any).lighting || null,
            aspectRatio, // Valid enum value: '1:1', '2:3', or '9:16'
            qualityMode: generationMode === 'fast' ? 'draft' : 'hq',
            // Store metadata for retry: baseImageUrl and generationMode
            // We'll store these as optional fields in the input
            sourceImageId: input.baseImageUrl, // Reuse sourceImageId field to store baseImageUrl
            editType: generationMode === 'consistent' ? 'inpaint' : undefined, // Use editType to indicate consistent mode
          } as any, // Type assertion needed to store additional fields
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
    setId: string;
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
      // Consistent mode: Use Z-Image InstantID (better than PuLID for single-image workflows)
      const referenceImageFilename = await this.uploadReferenceImageToComfyUI(input.baseImageUrl);
      workflow = buildZImageInstantIDWorkflow({
        prompt,
        negativePrompt,
        referenceImage: referenceImageFilename,
        width,
        height,
        steps,
        cfg,
        seed: Math.floor(Math.random() * 2 ** 32),
        instantidStrength: 0.8,
        controlnetStrength: 0.8,
        faceProvider: 'CPU',
        filenamePrefix: 'ryla_profile_consistent',
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

          // Helper to normalize values: convert empty strings, undefined, and invalid values to null
          const normalizeString = (value: any): string | null => {
            if (!value) return null;
            if (typeof value !== 'string') return null;
            const trimmed = value.trim();
            return trimmed === '' ? null : trimmed;
          };

          // Validate enum values before inserting - ensure they're valid enum values or null
          const aspectRatio = (() => {
            const val = jobInput?.aspectRatio;
            if (!val) return null;
            if (schema.aspectRatioEnum.enumValues.includes(val as any)) {
              return val;
            }
            return null;
          })();

          const qualityMode = (() => {
            const val = jobInput?.qualityMode;
            if (!val) return null;
            if (schema.qualityModeEnum.enumValues.includes(val as any)) {
              return val;
            }
            return null;
          })();

          const scene = (() => {
            const val = normalizeString((jobInput as any)?.scene);
            if (!val) return null;
            if (schema.scenePresetEnum.enumValues.includes(val as any)) {
              return val;
            }
            return null;
          })();

          const environment = (() => {
            const val = normalizeString((jobInput as any)?.environment);
            if (!val) return null;
            if (schema.environmentPresetEnum.enumValues.includes(val as any)) {
              return val;
            }
            return null;
          })();

          // Ensure outfit is null if empty string or invalid
          const outfit = normalizeString(jobInput?.outfit);

          // Ensure poseId is null if empty string or invalid
          const poseId = normalizeString((jobInput as any)?.poseId);

          // Ensure lightingId is null if empty string or invalid
          const lightingId = normalizeString((jobInput as any)?.lightingId);

          try {
            // Build the image data object - use undefined for null values so Drizzle omits them
            const imageData: any = {
              characterId: characterId || null, // Can be null for foreign key
              userId: actualUserId,
              s3Key: img.key,
              thumbnailKey: img.key, // Use same key for now
              status: 'completed' as const,
              nsfw: Boolean(jobInput?.nsfw),
            };

            // Add optional fields - use undefined instead of null so Drizzle omits them
            const promptVal = normalizeString(jobInput?.prompt);
            imageData.prompt = promptVal || undefined;

            const negativePromptVal = normalizeString(jobInput?.negativePrompt);
            imageData.negativePrompt = negativePromptVal || undefined;

            const seedVal = normalizeString(jobInput?.seed);
            imageData.seed = seedVal || undefined;

            imageData.width = jobInput?.width ?? undefined;
            imageData.height = jobInput?.height ?? undefined;

            imageData.scene = scene || undefined;
            imageData.environment = environment || undefined;
            imageData.outfit = outfit || undefined;
            imageData.poseId = poseId || undefined;
            imageData.lightingId = lightingId || undefined;
            imageData.aspectRatio = aspectRatio || undefined;
            imageData.qualityMode = qualityMode || undefined;

            // Remove undefined values to avoid passing them to Drizzle
            Object.keys(imageData).forEach(key => {
              if (imageData[key] === undefined) {
                delete imageData[key];
              }
            });

            const imageRow = await this.imagesRepo.createImage(imageData);
            createdImages.push(imageRow);
          } catch (error) {
            this.logger.error(
              `Failed to create image record for job ${jobId}: ${error instanceof Error ? error.message : String(error)}`
            );
            this.logger.error(`Image data: s3Key=${img.key}, characterId=${characterId}, userId=${actualUserId}`);
            this.logger.error(`Validated values: scene=${scene}, environment=${environment}, outfit=${outfit}, poseId=${poseId}, aspectRatio=${aspectRatio}, qualityMode=${qualityMode}`);
            this.logger.error(`Full error: ${error instanceof Error ? error.stack : String(error)}`);
            throw error; // Re-throw to be caught by outer try-catch
          }
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

      // Handle failed jobs with automatic retry (up to 3 attempts)
      if (mapped === 'failed' && trackedJob.status !== 'failed') {
        const retryCount = (trackedJob.retryCount || 0);
        const maxRetries = 3;

        if (retryCount < maxRetries) {
          // Automatically retry the job
          try {
            this.logger.log(
              `Retrying failed profile picture job ${jobId} (attempt ${retryCount + 1}/${maxRetries})`
            );

            // Rebuild workflow from job input
            const jobInput = trackedJob.input as schema.GenerationInput & {
              sourceImageId?: string; // baseImageUrl stored here
              editType?: string; // generationMode indicator
              cfg?: number; // CFG scale
            };

            const workflow = await this.rebuildWorkflowFromJobInput(
              jobInput,
              trackedJob.characterId
            );

            // Re-queue the workflow
            const newJobId = await this.comfyuiAdapter.queueWorkflow(workflow);

            // Update job with new external job ID and reset status
            await this.generationJobsRepo.updateById(trackedJob.id, {
              status: 'queued',
              externalJobId: newJobId,
              retryCount: retryCount + 1,
              error: undefined, // Clear previous error
              startedAt: new Date(),
            });

            this.logger.log(
              `Retried job ${jobId} -> new job ${newJobId} (retry ${retryCount + 1}/${maxRetries})`
            );

            // Return queued status for the new job - retry successful
            return {
              status: 'queued',
              images: [],
            };
          } catch (retryError) {
            this.logger.error(
              `Failed to retry job ${jobId}: ${retryError instanceof Error ? retryError.message : String(retryError)}`
            );
            // Mark as failed if retry itself fails
            await this.generationJobsRepo.updateById(trackedJob.id, {
              status: 'failed',
              error: status.error || `Retry failed: ${retryError instanceof Error ? retryError.message : String(retryError)}`,
            });
          }
        } else {
          // Max retries reached - mark as permanently failed
          this.logger.warn(
            `Job ${jobId} failed after ${retryCount} retries. Marking as permanently failed.`
          );
          await this.generationJobsRepo.updateById(trackedJob.id, {
            status: 'failed',
            error: status.error || `Failed after ${retryCount} retry attempts`,
          });
        }
      } else if (trackedJob.status !== mapped && mapped !== 'failed') {
        // Update status for non-failed states
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
   * Map position to scene for PromptBuilder using explicit scene field or fallback mapping
   */
  private mapPositionToScene(position: ProfilePicturePosition): string {
    // Use explicit scene field if provided
    if (position.scene) {
      return position.scene;
    }

    // Fallback: Map position framing and angle to appropriate scenes from available options
    if (position.framing === 'close-up') {
      // Close-ups work well with clean backgrounds
      if (position.angle.includes('front')) {
        return 'white-studio'; // Clean studio for front-facing close-ups
      } else {
        return 'dark-studio'; // Dark studio for angled close-ups
      }
    } else if (position.framing === 'medium') {
      // Medium shots use lifestyle scenes
      if (position.lighting?.includes('golden') || position.lighting?.includes('sunlight')) {
        return 'cozy-cafe'; // Warm lifestyle scene
      } else {
        return 'luxury-bedroom'; // Indoor lifestyle scene
      }
    } else {
      // Full-body shots use outdoor/urban scenes
      if (position.lighting?.includes('golden') || position.lighting?.includes('sunset')) {
        return 'beach-sunset'; // Golden hour outdoor scene
      } else if (position.lighting?.includes('dramatic')) {
        return 'city-rooftop'; // Urban dramatic scene
      } else {
        return 'paris-street'; // Urban lifestyle scene
      }
    }
  }

  /**
   * Map position to environment using explicit environment field or fallback mapping
   */
  private mapPositionToEnvironment(position: ProfilePicturePosition): string {
    // Use explicit environment field if provided
    if (position.environment) {
      return position.environment;
    }

    // Fallback: Infer from scene
    const scene = position.scene || this.mapPositionToScene(position);
    if (scene.includes('studio') || scene.includes('gym') || scene.includes('cafe') || scene.includes('bedroom') || scene.includes('office') || scene.includes('gallery') || scene.includes('boutique') || scene.includes('library') || scene.includes('kitchen') || scene.includes('bathroom')) {
      return 'indoor';
    } else if (scene.includes('beach') || scene.includes('park') || scene.includes('forest') || scene.includes('mountain') || scene.includes('lake') || scene.includes('desert') || scene.includes('snow')) {
      return 'outdoor';
    } else if (scene.includes('rooftop') || scene.includes('street') || scene.includes('alley') || scene.includes('subway') || scene.includes('market') || scene.includes('bridge') || scene.includes('garage')) {
      return 'urban';
    }

    return 'indoor'; // Default to indoor
  }

  /**
   * Map position lighting to PromptBuilder lighting format using real lighting IDs
   */
  private mapPositionToLighting(position: ProfilePicturePosition): string {
    // Convert position lighting description to actual lighting preset IDs
    const lightingLower = (position.lighting || 'natural-daylight').toLowerCase();
    if (lightingLower.includes('natural') || lightingLower.includes('window')) {
      return 'natural-daylight'; // Maps to natural.soft in PromptBuilder
    } else if (lightingLower.includes('golden') || lightingLower.includes('sunlight') || lightingLower.includes('golden hour')) {
      return 'golden-hour'; // Maps to natural.golden-hour
    } else if (lightingLower.includes('professional') || lightingLower.includes('softbox')) {
      return 'studio-softbox'; // Maps to studio.soft
    } else if (lightingLower.includes('dramatic') || lightingLower.includes('shadows')) {
      return 'dramatic-shadows'; // Maps to studio.dramatic
    } else if (lightingLower.includes('soft') || lightingLower.includes('diffused')) {
      return 'soft-diffused'; // Maps to natural.soft
    }
    return 'natural-daylight'; // Default to natural daylight
  }

  /**
   * Map position expression to PromptBuilder expression format
   */
  private mapPositionToExpression(position: ProfilePicturePosition): string {
    const exprLower = position.expression.toLowerCase();
    if (exprLower.includes('smile') || exprLower.includes('warm') || exprLower.includes('genuine')) {
      return 'positive.happy';
    } else if (exprLower.includes('confident') || exprLower.includes('self-assured')) {
      return 'positive.confident';
    } else if (exprLower.includes('relaxed') || exprLower.includes('natural')) {
      return 'neutral.natural';
    } else if (exprLower.includes('seductive') || exprLower.includes('alluring')) {
      return 'suggestive.seductive';
    }
    return 'positive.confident'; // Default
  }

  /**
   * Map position pose to prompt details using real pose descriptions
   */
  private mapPositionToPose(position: ProfilePicturePosition): string {
    // Map position pose to actual pose prompts from available poses
    const poseLower = position.pose.toLowerCase();

    // Map common pose descriptions to actual pose prompts
    if (poseLower.includes('standing') && poseLower.includes('confident')) {
      return 'confident power stance';
    } else if (poseLower.includes('standing') && poseLower.includes('casual')) {
      return 'relaxed casual standing pose';
    } else if (poseLower.includes('sitting') && poseLower.includes('relaxed')) {
      return 'relaxed sitting position';
    } else if (poseLower.includes('sitting') && poseLower.includes('perched')) {
      return 'perched on edge elegantly';
    } else if (poseLower.includes('facing camera')) {
      return 'facing camera directly, engaging eye contact';
    } else if (poseLower.includes('slightly turned')) {
      return 'slightly turned, natural angle';
    }

    // Fallback: combine angle and pose for detailed prompt
    return `${position.angle}, ${position.pose}`;
  }

  /**
   * Rebuild workflow from job input for retry
   * Extracts stored parameters and rebuilds the workflow
   */
  private async rebuildWorkflowFromJobInput(
    jobInput: schema.GenerationInput & {
      sourceImageId?: string; // baseImageUrl stored here
      editType?: string; // generationMode indicator
    },
    characterId?: string | null
  ): Promise<unknown> {
    const generationMode = jobInput.editType === 'inpaint' ? 'consistent' : 'fast';
    let baseImageUrl = jobInput.sourceImageId; // baseImageUrl was stored in sourceImageId

    if (!baseImageUrl && characterId) {
      // Try to fetch from character if not stored
      const character = await this.db.query.characters.findFirst({
        where: eq(schema.characters.id, characterId),
        columns: { baseImageUrl: true },
      });
      if (character?.baseImageUrl) {
        baseImageUrl = character.baseImageUrl;
      }
    }

    if (!baseImageUrl && generationMode === 'consistent') {
      throw new BadRequestException('Cannot retry: base image URL not available for consistent mode');
    }

    const width = jobInput.width || 768;
    const height = jobInput.height || 768;
    const steps = jobInput.steps || (generationMode === 'fast' ? 9 : 20);
    const cfg = (jobInput as any).cfg || 1.0;

    // Fast mode: simple workflow
    if (generationMode === 'fast') {
      const workflowId = this.comfyuiAdapter.getRecommendedWorkflow();
      return buildWorkflow(workflowId, {
        prompt: jobInput.prompt || '',
        negativePrompt: jobInput.negativePrompt || '',
        width,
        height,
        steps,
        cfg,
        seed: Math.floor(Math.random() * 2 ** 32),
        filenamePrefix: 'ryla_profile_fast',
      });
    }

    // Consistent mode: Z-Image InstantID workflow (better than PuLID)
    if (!baseImageUrl) {
      throw new BadRequestException('Reference image is required for consistent mode retry');
    }

    const referenceImageFilename = await this.uploadReferenceImageToComfyUI(baseImageUrl);
    return buildZImageInstantIDWorkflow({
      prompt: jobInput.prompt || '',
      negativePrompt: jobInput.negativePrompt || '',
      referenceImage: referenceImageFilename,
      width,
      height,
      steps,
      cfg,
      seed: Math.floor(Math.random() * 2 ** 32),
      instantidStrength: 0.8,
      controlnetStrength: 0.8,
      faceProvider: 'CPU',
      filenamePrefix: 'ryla_profile_consistent',
    });
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

