import {
  BadRequestException,
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';

import * as schema from '@ryla/data/schema';
import { GenerationJobsRepository, ImagesRepository } from '@ryla/data';
import {
  buildWorkflow,
  getRecommendedWorkflow,
  PromptBuilder,
  createAutoEnhancer,
} from '@ryla/business';
import type { OutfitComposition } from '@ryla/shared';
import { randomUUID } from 'crypto';

import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ModalJobRunnerAdapter } from './modal-job-runner.adapter';
import { FalImageService, type FalFluxModelId } from './fal-image.service';
import { ImageStorageService } from './image-storage.service';
import { characterConfigToDNA } from './character-config-to-dna';
import { getPosePrompt } from './pose-lookup';
import { AwsS3Service } from '../../aws-s3/services/aws-s3.service';

function aspectRatioToSize(aspectRatio: '1:1' | '9:16' | '2:3'): {
  width: number;
  height: number;
} {
  switch (aspectRatio) {
    case '1:1':
      return { width: 1024, height: 1024 };
    case '9:16':
      return { width: 832, height: 1472 };
    case '2:3':
      return { width: 896, height: 1344 };
  }
}

// qualityMode removed - EP-045
// Using community-validated quality params (2026-02-06)
//
// COMMUNITY RESEARCH FINDINGS (Reddit, Civitai, AI influencer guides):
// - steps: 28-36 for production portraits
// - cfg: 3.5-4.0 for balanced realism (preserves skin microstructure)
// - cfg: 2.5-3.5 for maximum natural look (may reduce prompt adherence)
// - cfg: 4.5-6.0 for portrait work with natural skin texture
// - LoRA weights ≤0.8 to avoid oversaturation
//
// Key insight: Lower CFG preserves photorealistic skin texture;
// Higher CFG creates "plastic" look with flattened details.
//
// NSFW UPDATE (2026-02-04):
// RYLA Core Values research findings:
// - SFW: CFG 3.5-4.5 for natural skin texture with visible pores
// - NSFW: CFG 6-8 for body anatomy (stay under 8 for realism)
// - Hands: Include negative prompts for anatomy
//
// See: docs/research/infrastructure/PROMPT-ENGINEERING-GUIDE.md
// See: docs/research/infrastructure/AI-INFLUENCER-COMMUNITY-RESEARCH.md
function getStandardQualityParams(isNsfw?: boolean): {
  steps: number;
  cfg: number;
} {
  if (isNsfw) {
    // NSFW: Higher CFG for body anatomy, but stay under 8
    return { steps: 28, cfg: 6.5 };
  }
  // SFW: Lower CFG for natural skin texture
  return { steps: 28, cfg: 3.5 };
}

// Negative prompt templates based on RYLA core values research
// - "Hyper-Realistic Skin" = avoid plastic/airbrushed
// - "Perfect Hands" = avoid extra fingers/mutated hands
const NEGATIVE_PROMPTS = {
  standard:
    '(worst quality, low quality:1.4), (low resolution, blurry:1.2), jpeg artifacts, (cartoon, anime, illustration:1.3), 3d render, cgi, unrealistic, artificial, plastic skin, airbrushed, extra fingers, mutated hands, bad hands, fused fingers, too many fingers',
  nsfw: '(worst quality, low quality:1.4), (low resolution, blurry:1.2), jpeg artifacts, cartoon, anime, illustration, extra limbs, mutated hands, extra fingers, bad anatomy, distorted body, unnatural proportions, deformed, plastic skin, airbrushed',
  hands:
    'extra fingers, mutated hands, bad hands, fused fingers, too many fingers, malformed hands, missing fingers, deformed fingers',
};

function _getNegativePrompt(isNsfw?: boolean): string {
  return isNsfw ? NEGATIVE_PROMPTS.nsfw : NEGATIVE_PROMPTS.standard;
}

// Optimal seeds per endpoint based on:
// 1. Academic research: "Good Seed Makes a Good Crop" (WACV 2025)
//    - Seed 469 = best FID score (21.60) = highest quality
//    - Seeds to AVOID: 12 (grayscale), 16 (borders), 133/493 (sky), 696 (worst), 857 (text)
// 2. Internal multi-seed quality testing
// 3. Community recommendations
// See: docs/research/infrastructure/PROMPT-ENGINEERING-GUIDE.md
const OPTIMAL_SEEDS: Record<string, number> = {
  '/flux': 469, // Academic "golden seed" - best FID
  '/flux-dev': 469, // Same golden seed
  '/qwen-image-2512': 1374878599, // Sharpness 550, Quality 100 (internal test)
  '/qwen-image-2512-fast': 1374878599,
  '/z-image-simple': 469,
  '/z-image-danrisi': 469,
  '/wan2.6': 42, // Classic seed, stable for video
  '/wan2.6-i2v': 42,
  '/wan22-i2v': 42,
  _default: 469, // Default to academic golden seed
};

function getOptimalSeed(endpoint: string, userSeed?: number): number {
  if (userSeed !== undefined) return userSeed;
  return OPTIMAL_SEEDS[endpoint] ?? OPTIMAL_SEEDS['_default'];
}

function asValidEnumOrNull<T extends readonly string[]>(
  value: unknown,
  allowed: T
): T[number] | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  return allowed.includes(trimmed as T[number]) ? (trimmed as T[number]) : null;
}

@Injectable()
export class StudioGenerationService {
  private readonly logger = new Logger(StudioGenerationService.name);
  private readonly generationJobsRepo: GenerationJobsRepository;
  private readonly imagesRepo: ImagesRepository;

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(ComfyUIJobRunnerAdapter)
    private readonly comfyui: ComfyUIJobRunnerAdapter,
    @Inject(ModalJobRunnerAdapter)
    private readonly modal: ModalJobRunnerAdapter,
    @Inject(FalImageService)
    private readonly fal: FalImageService,
    @Inject(ImageStorageService)
    private readonly imageStorage: ImageStorageService,
    @Inject(AwsS3Service)
    private readonly s3Service: AwsS3Service
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
    // qualityMode removed - EP-045
    count: number;
    nsfw: boolean;
    promptEnhance?: boolean; // Enable AI prompt enhancement
    seed?: number;
    modelProvider?: 'modal' | 'comfyui' | 'fal';
    modelId?: FalFluxModelId;
    // LoRA support for character consistency
    useLora?: boolean;
    loraId?: string;
    loraStrength?: number;
    // Reference image support for face consistency
    referenceImageUrl?: string;
    referenceStrength?: number;
    referenceMethod?: string;
  }) {
    if (input.count < 1 || input.count > 10) {
      throw new BadRequestException('count must be between 1 and 10');
    }

    // Verify character ownership and fetch character data
    const character = await this.db.query.characters.findFirst({
      where: and(
        eq(schema.characters.id, input.characterId),
        eq(schema.characters.userId, input.userId)
      ),
    });
    if (!character) throw new NotFoundException('Character not found');

    // Convert CharacterConfig to CharacterDNA
    // For SFW content, exclude breast/ass size from the prompt to avoid triggering NSFW content
    // For NSFW content, include breast/ass size for adult content
    const characterDNA = characterConfigToDNA(
      character.config,
      character.name,
      { sfwMode: !input.nsfw }
    );

    // Check if outfit is empty (null, empty string, or empty composition)
    const isOutfitEmpty =
      !input.outfit ||
      (typeof input.outfit === 'string' && input.outfit.trim() === '') ||
      (typeof input.outfit === 'object' &&
        !input.outfit.top &&
        !input.outfit.bottom &&
        !input.outfit.shoes &&
        (!input.outfit.headwear ||
          input.outfit.headwear === 'none' ||
          input.outfit.headwear === 'none-headwear') &&
        (!input.outfit.outerwear ||
          input.outfit.outerwear === 'none' ||
          input.outfit.outerwear === 'none-outerwear') &&
        (!input.outfit.accessories || input.outfit.accessories.length === 0));

    // For NSFW content, be more explicit about nudity:
    // - If no outfit selected: "fully naked, completely nude, no clothing"
    // - If partial outfit selected: keep outfit but add explicit nudity emphasis
    let outfitToUse = input.outfit;
    let nsfwNudityDetails: string | null = null;

    if (input.nsfw) {
      if (isOutfitEmpty) {
        // Fully naked - no clothes at all
        outfitToUse = 'fully naked, completely nude, no clothing, bare skin';
        nsfwNudityDetails =
          'fully naked, completely nude, exposed body, no clothes';
      } else {
        // Partial outfit - emphasize nudity with the selected clothing
        nsfwNudityDetails = 'nude, naked body, exposed skin';
      }
    }

    // Build prompt using PromptBuilder
    const builder = new PromptBuilder()
      .withCharacter(characterDNA)
      .withScene(input.scene)
      .withOutfit(outfitToUse);

    // Add explicit NSFW nudity details to ensure naked generation
    if (nsfwNudityDetails) {
      builder.addDetails(nsfwNudityDetails);
    }

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

    // Build base prompt immediately (synchronous, no delay)
    const baseBuiltPrompt = builder.build();
    let basePrompt = baseBuiltPrompt.prompt;
    let negativePrompt = baseBuiltPrompt.negativePrompt;
    const originalPrompt = basePrompt; // Store original for metadata
    let promptEnhanceUsed = false;
    let enhancedPrompt: string | undefined = undefined;

    // If prompt enhancement is enabled, try to enhance in parallel with timeout
    // This prevents blocking the generation start - we'll use enhanced prompt if it completes quickly,
    // otherwise fall back to base prompt
    if (input.promptEnhance !== false) {
      const enhancer = createAutoEnhancer();

      // Enhance in parallel with 500ms timeout - don't block generation start
      const enhancementPromise = builder
        .buildWithAI(enhancer, {
          strength: 0.7,
          focus: ['realism', 'lighting', 'details'],
        })
        .catch((err) => {
          // If enhancement fails, log but don't block - use base prompt
          console.warn('Prompt enhancement failed, using base prompt:', err);
          return null;
        });

      // Race: enhancement vs timeout
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 500)
      );

      const enhancementResult = await Promise.race([
        enhancementPromise,
        timeoutPromise,
      ]);

      // Use enhanced prompt if it completed in time, otherwise use base
      if (enhancementResult) {
        basePrompt = enhancementResult.prompt;
        enhancedPrompt = enhancementResult.prompt;
        promptEnhanceUsed = true;
        // Merge negative prompt additions
        if (enhancementResult.enhancement.negativeAdditions.length > 0) {
          negativePrompt +=
            ', ' + enhancementResult.enhancement.negativeAdditions.join(', ');
        }
      }
      // If timeout or error, continue with base prompt (already set above)
    }

    const { width, height } = aspectRatioToSize(input.aspectRatio);
    const { steps, cfg } = getStandardQualityParams(); // qualityMode removed - EP-045

    // Pick the best available workflow for the pod (danrisi if nodes available; else simple)
    const workflowId = getRecommendedWorkflow([]); // default fallback
    const actualWorkflowId =
      this.comfyui.getRecommendedWorkflow?.() ?? workflowId;

    const results: Array<{ jobId: string; promptId: string }> = [];

    // Provider selection:
    // - SFW: Modal > FAL (never ComfyUI pod or RunPod serverless)
    // - NSFW: ComfyUI pod (self-hosted) only - Modal/FAL don't support NSFW
    // - When Modal is requested but unavailable, fall back to FAL if configured
    const shouldUseModal = this.modal.isAvailable() && !input.nsfw;
    const shouldUseFal = this.fal.isConfigured() && !input.nsfw;
    let provider: 'modal' | 'comfyui' | 'fal' = input.nsfw
      ? 'comfyui' // NSFW requires self-hosted ComfyUI pod (Modal/FAL don't support NSFW)
      : input.modelProvider ??
        (shouldUseModal ? 'modal' : shouldUseFal ? 'fal' : 'comfyui');
    if (provider === 'modal' && !this.modal.isAvailable() && shouldUseFal) {
      provider = 'fal'; // Fallback to FAL when Modal is down
    }
    const falModel: FalFluxModelId = input.modelId ?? 'fal-ai/flux/schnell';

    for (let i = 0; i < input.count; i++) {
      // Use optimal seed if not provided, or user seed + offset for multiple images
      const baseSeed =
        typeof input.seed === 'number'
          ? input.seed
          : getOptimalSeed('_default'); // Use optimal default seed
      const seed = baseSeed + i;

      // Validate enum values for image creation
      const safeScene = asValidEnumOrNull(
        input.scene,
        schema.scenePresetEnum.enumValues
      );
      const safeEnvironment = asValidEnumOrNull(
        input.environment,
        schema.environmentPresetEnum.enumValues
      );
      const safeAspectRatio = asValidEnumOrNull(
        input.aspectRatio,
        schema.aspectRatioEnum.enumValues
      );
      // qualityMode removed - EP-045

      // Create image record immediately with status 'generating' so it persists across page reloads
      const placeholderS3Key = `generating/${
        input.characterId
      }/${randomUUID()}`;
      const imageData: any = {
        characterId: input.characterId,
        userId: input.userId,
        s3Key: placeholderS3Key, // Placeholder key - will be updated when image completes
        thumbnailKey: placeholderS3Key,
        status: 'generating' as const,
        nsfw: input.nsfw,
      };

      // Add optional fields
      if (basePrompt) imageData.prompt = basePrompt;
      if (negativePrompt) imageData.negativePrompt = negativePrompt;
      if (seed) imageData.seed = seed.toString();
      if (width) imageData.width = width;
      if (height) imageData.height = height;
      if (safeScene) imageData.scene = safeScene;
      if (safeEnvironment) imageData.environment = safeEnvironment;

      const outfit =
        typeof input.outfit === 'string'
          ? input.outfit
          : JSON.stringify(input.outfit);
      if (outfit) imageData.outfit = outfit;

      if (input.poseId) imageData.poseId = input.poseId;
      if (input.lighting) imageData.lightingId = input.lighting;
      if (safeAspectRatio) imageData.aspectRatio = safeAspectRatio;
      // qualityMode removed - EP-045

      // Prompt enhancement metadata
      if (typeof promptEnhanceUsed === 'boolean') {
        imageData.promptEnhance = promptEnhanceUsed;
      }
      if (promptEnhanceUsed && originalPrompt)
        imageData.originalPrompt = originalPrompt;
      if (promptEnhanceUsed && enhancedPrompt)
        imageData.enhancedPrompt = enhancedPrompt;

      const imageRecord = await this.imagesRepo.createImage(imageData);

      if (provider === 'modal') {
        if (!this.modal.isAvailable()) {
          // Should not happen: we already set provider to 'fal' when Modal unavailable and FAL configured
          this.logger.warn(
            'Modal.com not available; skipping modal job (consider FAL fallback)'
          );
        } else {
          const externalJobId = `modal_${randomUUID()}`;
          const job = await this.generationJobsRepo.createJob({
            userId: input.userId,
            characterId: input.characterId,
            type: 'image_generation',
            status: 'processing',
            input: {
              scene: input.scene,
              environment: input.environment,
              outfit:
                typeof input.outfit === 'string'
                  ? input.outfit
                  : JSON.stringify(input.outfit),
              poseId: input.poseId,
              aspectRatio: input.aspectRatio,
              imageCount: 1,
              nsfw: input.nsfw,
              prompt: basePrompt,
              negativePrompt,
              seed: seed?.toString(),
              width,
              height,
              steps,
              promptEnhance: promptEnhanceUsed,
              originalPrompt: promptEnhanceUsed ? originalPrompt : undefined,
              enhancedPrompt: promptEnhanceUsed ? enhancedPrompt : undefined,
              imageId: imageRecord.id,
            },
            imageCount: 1,
            completedCount: 0,
            externalJobId,
            externalProvider: 'modal',
            startedAt: new Date(),
            output: {
              imageIds: [imageRecord.id],
            },
          });

          // Map model ID to Modal.com endpoint
          // fal-ai/flux/dev → /flux-dev, fal-ai/flux/schnell → /flux
          const modalModel =
            falModel === 'fal-ai/flux/dev' ? 'flux-dev' : 'flux';

          // handled by ComfyUIResultsService (special-cased for externalProvider='modal').
          void this.runModalStudioJob({
            jobId: job.id,
            externalJobId,
            imageId: imageRecord.id,
            prompt: basePrompt,
            negativePrompt,
            width,
            height,
            seed,
            model: modalModel,
          });

          results.push({ jobId: job.id, promptId: imageRecord.id });
          continue;
        }
      }

      if (provider === 'fal') {
        if (!this.fal.isConfigured()) {
          // Safe fallback if env is missing.
          // Keep server stable: do not throw; run comfyui instead.
          // (This also keeps UI stable without special-casing.)

          console.warn(
            'FAL_KEY not configured; falling back to comfyui for studio generation'
          );
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
              outfit:
                typeof input.outfit === 'string'
                  ? input.outfit
                  : JSON.stringify(input.outfit),
              poseId: input.poseId,
              aspectRatio: input.aspectRatio,
              // qualityMode removed - EP-045
              imageCount: 1,
              nsfw: input.nsfw,
              prompt: basePrompt,
              negativePrompt,
              seed: seed?.toString(),
              width,
              height,
              steps,
              // Prompt enhancement metadata
              promptEnhance: promptEnhanceUsed,
              originalPrompt: promptEnhanceUsed ? originalPrompt : undefined,
              enhancedPrompt: promptEnhanceUsed ? enhancedPrompt : undefined,
              // Store image ID so we can update it when complete
              imageId: imageRecord.id,
            },
            imageCount: 1,
            completedCount: 0,
            externalJobId,
            externalProvider: 'fal',
            startedAt: new Date(),
            // Store image ID in output for reference
            output: {
              imageIds: [imageRecord.id],
            } as any,
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
            imageId: imageRecord.id,
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

      // Provider priority for workflows:
      // - SFW: Modal > FAL (never ComfyUI pod or RunPod serverless)
      // - NSFW: ComfyUI pod (self-hosted) only
      // Note: FAL doesn't support workflow-based generation (Z-Image, InstantID, etc.)
      const shouldUseModalForWorkflow = this.modal.isAvailable() && !input.nsfw;

      let adapter: ModalJobRunnerAdapter | ComfyUIJobRunnerAdapter;
      let externalProvider: 'modal' | 'comfyui' | 'fal';

      if (shouldUseModalForWorkflow) {
        adapter = this.modal;
        externalProvider = 'modal';
      } else if (input.nsfw) {
        // NSFW content requires self-hosted ComfyUI pod (Modal/FAL don't support NSFW)
        adapter = this.comfyui;
        externalProvider = 'comfyui';
      } else {
        // SFW but Modal not available - FAL doesn't support workflows
        // Throw error instead of falling back to ComfyUI pod
        throw new BadRequestException(
          'Modal.com is required for workflow-based studio generation. FAL does not support Z-Image or face consistency workflows. Set MODAL_WORKSPACE in Infisical /apps/api.'
        );
      }

      const promptId = await adapter.queueWorkflow(workflow);

      const job = await this.generationJobsRepo.createJob({
        userId: input.userId,
        characterId: input.characterId,
        type: 'image_generation',
        status: 'queued',
        input: {
          scene: input.scene,
          environment: input.environment,
          outfit:
            typeof input.outfit === 'string'
              ? input.outfit
              : JSON.stringify(input.outfit),
          poseId: input.poseId,
          aspectRatio: input.aspectRatio,
          // qualityMode removed - EP-045
          imageCount: 1,
          nsfw: input.nsfw,
          prompt: basePrompt,
          negativePrompt,
          seed: seed?.toString(),
          width,
          height,
          steps,
          // Prompt enhancement metadata
          promptEnhance: promptEnhanceUsed,
          originalPrompt: promptEnhanceUsed ? originalPrompt : undefined,
          enhancedPrompt: promptEnhanceUsed ? enhancedPrompt : undefined,
          // Store image ID so we can update it when complete
          imageId: imageRecord.id,
        },
        imageCount: 1,
        completedCount: 0,
        externalJobId: promptId,
        externalProvider,
        startedAt: new Date(),
        // Store image ID in output for reference
        output: {
          imageIds: [imageRecord.id],
        } as any,
      });

      results.push({ jobId: job.id, promptId });
    }

    return { workflowId: actualWorkflowId, jobs: results };
  }

  /**
   * Sanitize prompt for models with strict content policies (like Seedream 4.5)
   * Removes body part descriptions that trigger content policy violations
   */
  private sanitizePromptForStrictModels(
    prompt: string,
    modelId: FalFluxModelId
  ): string {
    // Seedream 4.5 has stricter content filtering - remove body part descriptions
    const isStrictModel =
      modelId.includes('seedream') || modelId.includes('bytedance');

    if (!isStrictModel) {
      return prompt;
    }

    // Remove body part descriptions that trigger content policy violations
    const bodyPartPatterns = [
      /\b(small|medium|large|big|tiny|huge)\s+(ass|butt|buttocks|booty)\b/gi,
      /\b(small|medium|large|big|tiny|huge|perky|saggy)\s+(breasts|boobs|chest|bust)\b/gi,
      /\b(ass|butt|buttocks|booty)\s+(size|shape)\b/gi,
      /\b(breast|boob|chest|bust)\s+(size|type|shape)\b/gi,
    ];

    let sanitized = prompt;
    for (const pattern of bodyPartPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Clean up double commas and extra spaces
    sanitized = sanitized
      .replace(/,\s*,/g, ',')
      .replace(/,\s*$/g, '')
      .replace(/^\s*,/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return sanitized;
  }

  private async runModalStudioJob(params: {
    jobId: string;
    externalJobId: string;
    imageId: string;
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    seed?: number;
    model: 'flux-dev' | 'flux';
  }) {
    const {
      jobId,
      externalJobId,
      imageId,
      prompt,
      negativePrompt: _negativePrompt,
      width: _width,
      height: _height,
      seed,
      model: _model,
    } = params;

    try {
      const trackedJob = await this.generationJobsRepo.getById(jobId);
      if (!trackedJob) {
        throw new Error('Job not found');
      }

      // Submit job to Modal.com (both flux-dev and flux use submitBaseImages)
      const modalJobId = await this.modal.submitBaseImages({
        prompt,
        nsfw: false, // Studio generation handles NSFW separately
        seed,
      });

      // Poll for result
      let attempts = 0;
      const maxAttempts = 30;
      let jobStatus;

      while (attempts < maxAttempts) {
        jobStatus = await this.modal.getJobStatus(modalJobId);

        if (jobStatus.status === 'COMPLETED') {
          break;
        }

        if (jobStatus.status === 'FAILED') {
          throw new Error(jobStatus.error || 'Modal.com generation failed');
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!jobStatus || jobStatus.status !== 'COMPLETED') {
        throw new Error('Modal.com job did not complete in time');
      }

      const output = jobStatus.output as {
        images?: Array<{ buffer?: Buffer }>;
      };
      if (
        !output?.images ||
        output.images.length === 0 ||
        !output.images[0].buffer
      ) {
        throw new Error('No image buffer returned from Modal.com');
      }

      // Convert Buffer to base64 data URL
      const imageBuffer = output.images[0].buffer;
      const base64 = imageBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      // Upload to storage
      const { images: stored } = await this.imageStorage.uploadImages(
        [dataUrl],
        {
          userId: trackedJob.userId,
          category: 'studio-images',
          jobId: externalJobId,
        }
      );

      if (!stored || stored.length === 0) {
        throw new Error('Failed to upload image to storage');
      }

      const img = stored[0];

      // Update job status
      await this.generationJobsRepo.updateById(jobId, {
        status: 'completed',
        completedCount: 1,
        output: {
          imageIds: [imageId],
          images: [
            {
              id: imageId,
              url: img.url,
              thumbnailUrl: img.thumbnailUrl,
              s3Key: img.key,
            },
          ],
        },
      });

      // Update image record
      await this.imagesRepo.updateById({
        id: imageId,
        userId: trackedJob.userId,
        patch: {
          s3Key: img.key,
          thumbnailKey: img.key, // Use same key for thumbnail (StoredImage doesn't have separate thumbnailKey)
          thumbnailUrl: img.thumbnailUrl,
          status: 'completed',
        },
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Modal.com generation failed';

      await this.generationJobsRepo.updateById(jobId, {
        status: 'failed',
        output: {
          error: message,
        },
      });

      const trackedJob = await this.generationJobsRepo.getById(jobId);
      if (trackedJob) {
        await this.imagesRepo.updateById({
          id: imageId,
          userId: trackedJob.userId,
          patch: {
            status: 'failed',
          },
        });
      }
    }
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
    imageId: string;
  }) {
    const {
      jobId,
      externalJobId,
      userId,
      characterId,
      modelId,
      prompt,
      negativePrompt,
      width,
      height,
      seed,
      imageId,
    } = params;

    // Sanitize prompt for strict models like Seedream 4.5
    const sanitizedPrompt = this.sanitizePromptForStrictModels(prompt, modelId);

    try {
      const trackedJob = await this.generationJobsRepo.getById(jobId);

      const out = await this.fal.runFlux(modelId, {
        prompt: sanitizedPrompt,
        negativePrompt,
        width,
        height,
        seed,
        numImages: 1,
      });

      const base64 = await this.fal.downloadToBase64DataUrl(out.imageUrls[0]);

      // Studio outputs should be persisted as DB-backed image assets.
      const { images: stored } = await this.imageStorage.uploadImages(
        [base64],
        {
          userId,
          category: 'gallery',
          jobId: externalJobId,
          characterId,
        }
      );

      const img = stored[0];

      // Update existing image record instead of creating a new one
      const updateData: any = {
        s3Key: img.key,
        thumbnailKey: img.key,
        s3Url: img.url,
        thumbnailUrl: img.thumbnailUrl,
        status: 'completed' as const,
      };

      // Only update fields that might have changed
      if (prompt) updateData.prompt = prompt;
      if (negativePrompt) updateData.negativePrompt = negativePrompt;
      if (seed) updateData.seed = seed.toString();
      if (width) updateData.width = width;
      if (height) updateData.height = height;

      // Get prompt enhancement metadata from tracked job (already fetched above)
      if (trackedJob?.input) {
        const jobInput = trackedJob.input as any;
        if (typeof jobInput.promptEnhance === 'boolean') {
          updateData.promptEnhance = jobInput.promptEnhance;
        }
        if (jobInput.originalPrompt) {
          updateData.originalPrompt = jobInput.originalPrompt;
        }
        if (jobInput.enhancedPrompt) {
          updateData.enhancedPrompt = jobInput.enhancedPrompt;
        }
      }

      await this.imagesRepo.updateById({
        id: imageId,
        userId,
        patch: updateData,
      });

      await this.generationJobsRepo.updateById(jobId, {
        status: 'completed',
        completedAt: new Date(),
        completedCount: 1,
        output: {
          imageUrls: [img.url],
          thumbnailUrls: [img.thumbnailUrl],
          s3Keys: [img.key],
          imageIds: [imageId],
        } as any,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Fal generation failed';

      // Check if it's a content policy violation (422) for strict models
      const isContentPolicyError =
        message.includes('422') ||
        message.includes('content_policy') ||
        message.includes('content checker');
      const isStrictModel =
        modelId.includes('seedream') || modelId.includes('bytedance');

      // Retry with more aggressive sanitization if content policy violation
      if (isContentPolicyError && isStrictModel) {
        try {
          // Remove all potentially problematic terms
          const aggressiveSanitized = sanitizedPrompt
            .replace(
              /\b(ass|butt|breast|boob|chest|bust|nipple|genital)\w*/gi,
              ''
            )
            .replace(/,\s*,/g, ',')
            .replace(/,\s*$/g, '')
            .replace(/^\s*,/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          if (aggressiveSanitized.length > 20) {
            // Only retry if we have enough prompt left
            // Retry with aggressively sanitized prompt
            const retryOut = await this.fal.runFlux(modelId, {
              prompt: aggressiveSanitized,
              negativePrompt,
              width,
              height,
              seed,
              numImages: 1,
            });

            const base64 = await this.fal.downloadToBase64DataUrl(
              retryOut.imageUrls[0]
            );
            const { images: stored } = await this.imageStorage.uploadImages(
              [base64],
              {
                userId,
                category: 'gallery',
                jobId: externalJobId,
                characterId,
              }
            );

            const img = stored[0];
            await this.imagesRepo.updateById({
              id: imageId,
              userId,
              patch: {
                s3Key: img.key,
                thumbnailKey: img.key,
                s3Url: img.url,
                thumbnailUrl: img.thumbnailUrl,
                status: 'completed' as const,
                prompt: sanitizedPrompt, // Store sanitized prompt
              },
            });

            await this.generationJobsRepo.updateById(jobId, {
              status: 'completed',
              completedAt: new Date(),
              completedCount: 1,
              output: {
                imageUrls: [img.url],
                thumbnailUrls: [img.thumbnailUrl],
                s3Keys: [img.key],
                imageIds: [imageId],
              } as any,
            });

            return; // Success on retry
          }
        } catch {
          // Retry also failed, continue to error handling
        }
      }

      // Update image status to failed
      try {
        await this.imagesRepo.updateById({
          id: imageId,
          userId,
          patch: {
            status: 'failed' as const,
            generationError: message,
          },
        });
      } catch (updateError) {
        console.error('Failed to update image status to failed:', updateError);
      }

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
    const sourceImage = await this.imagesRepo.getById({
      id: input.imageId,
      userId: input.userId,
    });
    if (!sourceImage) {
      throw new NotFoundException('Source image not found');
    }

    if (sourceImage.userId !== input.userId) {
      throw new ForbiddenException('You do not have access to this image');
    }

    if (sourceImage.status !== 'completed') {
      throw new BadRequestException(
        'Source image must be completed before upscaling'
      );
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
      throw new BadRequestException(
        'Fal.ai is not configured. Upscaling requires Fal.ai API key.'
      );
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
        // modelId is not in GenerationInput, we'll store it in metadata if needed
        // but for now we just remove it to avoid TS error
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
      const _trackedJob = await this.generationJobsRepo.getById(jobId);

      // Call Fal.ai upscaling API
      const out = await this.fal.runUpscale(modelId, {
        imageUrl: sourceImageUrl,
        scale,
      });

      // Download upscaled image
      const base64 = await this.fal.downloadToBase64DataUrl(out.imageUrls[0]);

      // Upload upscaled image to storage
      const { images: stored } = await this.imageStorage.uploadImages(
        [base64],
        {
          userId,
          category: 'gallery',
          jobId: externalJobId,
          characterId: characterId ?? undefined,
        }
      );

      const img = stored[0];

      // Get source image metadata for reference
      const sourceImage = await this.imagesRepo.getById({
        id: sourceImageId,
        userId,
      });

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

      if (sourceImage?.negativePrompt)
        upscaleImageData.negativePrompt = sourceImage.negativePrompt;
      if (sourceImage?.seed) upscaleImageData.seed = sourceImage.seed;
      if (sourceImage?.width)
        upscaleImageData.width = sourceImage.width * scale;
      if (sourceImage?.height)
        upscaleImageData.height = sourceImage.height * scale;
      if (sourceImage?.scene) upscaleImageData.scene = sourceImage.scene;
      if (sourceImage?.environment)
        upscaleImageData.environment = sourceImage.environment;
      if (sourceImage?.outfit) upscaleImageData.outfit = sourceImage.outfit;
      if (sourceImage?.aspectRatio)
        upscaleImageData.aspectRatio = sourceImage.aspectRatio;
      // qualityMode removed - EP-045

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

  /**
   * Start video generation from character
   * TODO: Implement full video generation pipeline
   */
  async startVideoGeneration(_input: {
    userId: string;
    characterId: string;
    prompt?: string;
    duration: number;
    fps: number;
    aspectRatio?: string;
    nsfw?: boolean;
    seed?: number;
    useLora?: boolean;
  }) {
    return {
      status: 'not_implemented',
      message: 'Video generation is not yet available',
    };
  }

  /**
   * Start face swap edit on existing image or video
   * TODO: Implement face swap pipeline
   */
  async startFaceSwapEdit(_input: {
    userId: string;
    characterId: string;
    sourceImageId?: string;
    sourceVideoId?: string;
    nsfw?: boolean;
    restoreFace?: boolean;
  }) {
    return {
      status: 'not_implemented',
      message: 'Face swap editing is not yet available',
    };
  }
}
