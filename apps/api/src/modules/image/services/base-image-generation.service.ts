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
  createAutoEnhancer,
} from '@ryla/business';
import { CharacterConfig } from '@ryla/data/schema';
import { characterConfigToDNA } from './character-config-to-dna';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ModalJobRunnerAdapter } from './modal-job-runner.adapter';
import { ImageStorageService } from './image-storage.service';
import { FalImageService, type FalFluxModelId } from './fal-image.service';

export interface BaseImageGenerationInput {
  appearance?: {
    gender: 'female' | 'male';
    style: 'realistic' | 'anime';
    ethnicity: string;
    age: number;
    ageRange?: string;
    skinColor?: string;
    eyeColor: string;
    faceShape?: string;
    hairStyle: string;
    hairColor: string;
    bodyType: string;
    assSize?: string;
    breastSize?: string;
    breastType?: string;
    freckles?: string;
    scars?: string;
    beautyMarks?: string;
    piercings?: string;
    tattoos?: string;
  };
  identity?: {
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
  promptInput?: string; // Raw prompt for prompt-based flow
  promptEnhance?: boolean; // Enable AI prompt enhancement
  idempotencyKey?: string; // Prevent duplicate generation (client: hash of userId + input)
}

export interface BaseImageGenerationResult {
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl: string;
    model?: string; // Model/provider that generated this image
  }>;
  jobId: string; // Primary job ID (first of 6)
  workflowUsed: WorkflowId;
  allJobIds?: string[]; // All 6 job IDs for batch polling
}

@Injectable()
export class BaseImageGenerationService {
  private readonly logger = new Logger(BaseImageGenerationService.name);
  // Store external job results with model info for display
  private readonly externalResults = new Map<
    string,
    {
      status: 'queued' | 'in_progress' | 'completed' | 'failed';
      images: Array<{ id: string; url: string; thumbnailUrl: string; s3Key?: string; model?: string }>;
      error?: string;
      createdAt: number;
      model?: string; // Human-friendly model name
    }
  >();
  // Idempotency tracking: key -> { jobIds, createdAt }
  private readonly idempotencyCache = new Map<
    string,
    { jobId: string; allJobIds: string[]; workflowUsed: WorkflowId; createdAt: number }
  >();
  private readonly IDEMPOTENCY_TTL_MS = 10 * 60 * 1000; // 10 minutes

  constructor(
    @Inject(forwardRef(() => ComfyUIJobRunnerAdapter))
    private readonly comfyuiAdapter: ComfyUIJobRunnerAdapter,
    @Inject(forwardRef(() => ModalJobRunnerAdapter))
    private readonly modalAdapter: ModalJobRunnerAdapter,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(forwardRef(() => ImageStorageService))
    private readonly imageStorage: ImageStorageService,
    @Inject(forwardRef(() => FalImageService))
    private readonly fal: FalImageService,
  ) { }

  /**
   * Clean up expired idempotency cache entries
   */
  private cleanIdempotencyCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.idempotencyCache.entries()) {
      if (now - entry.createdAt > this.IDEMPOTENCY_TTL_MS) {
        this.idempotencyCache.delete(key);
      }
    }
  }

  /**
   * Generate base image(s) from wizard config using ComfyUI pod
   * Generates 3 images with different seeds for variety
   */
  async generateBaseImages(
    input: BaseImageGenerationInput,
  ): Promise<BaseImageGenerationResult> {
    // Check for idempotency key - return existing job if still valid
    if (input.idempotencyKey) {
      this.cleanIdempotencyCache();
      const existing = this.idempotencyCache.get(input.idempotencyKey);
      if (existing) {
        this.logger.log(`Returning existing job for idempotency key: ${input.idempotencyKey}`);
        return {
          images: [], // Images will be fetched via polling
          jobId: existing.jobId,
          allJobIds: existing.allJobIds,
          workflowUsed: existing.workflowUsed,
        };
      }
    }

    // Ensure ComfyUI is available
    // Base image generation uses Modal > FAL (never ComfyUI pod or RunPod serverless)
    const useModal = this.modalAdapter.isAvailable();
    const useFal = this.fal.isConfigured();

    if (!useModal && !useFal) {
      throw new Error(
        'Neither Modal.com nor FAL available. Check MODAL_ENDPOINT_URL or FAL_KEY configuration. Base image generation requires Modal.com or FAL (ComfyUI pod/RunPod not supported).',
      );
    }

    let basePrompt: string;
    let negativePrompt: string;
    let _originalPrompt: string | undefined;
    let _enhancedPrompt: string | undefined;
    let _promptEnhance = false;

    // Handle prompt-based flow (raw prompt input)
    if (input.promptInput) {
      basePrompt = input.promptInput.trim();
      _originalPrompt = basePrompt;

      // Add SFW requirements and friendly expression to the prompt
      basePrompt += ', smiling, friendly expression, warm smile, approachable, fully clothed, appropriate attire, professional appearance, modest clothing';

      // Base images are ALWAYS SFW - strong negative prompt
      negativePrompt = 'nude, naked, topless, bottomless, exposed breasts, nipples, genitals, ' +
        'see-through clothing, lingerie, underwear visible, revealing clothing, ' +
        'bikini, swimsuit, intimate wear, sexy clothing, ' +
        'nsfw, adult content, explicit, sexual content, erotic, ' +
        'bad anatomy, deformed, blurry, low quality, watermark, signature';

      // Apply wizard-specific prompt enhancement if enabled
      if (input.promptEnhance !== false) {
        try {
          const enhancer = createAutoEnhancer();

          // Wizard-specific enhancement: Focus on creating unique character from minimal input
          // Use a custom enhancement request that emphasizes character uniqueness
          const enhancementPromise = enhancer.enhance({
            prompt: basePrompt,
            style: 'ultraRealistic',
            strength: 0.85, // Higher strength for wizard - we want significant enhancement for character creation
            focus: ['realism', 'details', 'character'], // Focus on character details
            maxLength: 400,
            isWizard: true, // Flag for wizard-specific enhancement
          }).catch((err) => {
            this.logger.warn('Wizard prompt enhancement failed, using base prompt:', err);
            return null;
          });

          // Race: enhancement vs timeout (1.5 seconds for wizard - more time for character creation)
          const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 1500)
          );

          const enhancementResult = await Promise.race([enhancementPromise, timeoutPromise]);

          // Use enhanced prompt if it completed in time, otherwise use base with quality keywords
          if (enhancementResult && enhancementResult.enhancedPrompt) {
            basePrompt = enhancementResult.enhancedPrompt;
            // Ensure quality keywords are present (add if not already there)
            const lowerPrompt = basePrompt.toLowerCase();
            if (!lowerPrompt.includes('8k') && !lowerPrompt.includes('hyper-realistic') && !lowerPrompt.includes('ultra-detailed')) {
              basePrompt += ', 8K hyper-realistic, ultra-detailed, professional photography, Shot on Fujifilm GFX 100S, sharp focus, high resolution, photorealistic';
            }
            _enhancedPrompt = enhancementResult.enhancedPrompt;
            _promptEnhance = true;
            // Merge negative prompt additions
            if (enhancementResult.negativeAdditions.length > 0) {
              negativePrompt += ', ' + enhancementResult.negativeAdditions.join(', ');
            }
          } else {
            // Enhancement timed out or failed - add quality keywords to base prompt
            basePrompt += ', 8K hyper-realistic, ultra-detailed, professional photography, Shot on Fujifilm GFX 100S, sharp focus, high resolution, photorealistic';
          }
        } catch (err) {
          this.logger.warn('Wizard prompt enhancement failed, using base prompt with quality keywords:', err);
          // Add quality keywords even when enhancement fails
          basePrompt += ', 8K hyper-realistic, ultra-detailed, professional photography, sharp focus, high resolution, photorealistic';
        }
      } else {
        // Enhancement disabled - still add quality keywords for good base images
        basePrompt += ', 8K hyper-realistic, ultra-detailed, professional photography, sharp focus, high resolution, photorealistic';
      }
    } else {
      // Traditional flow: build from appearance/identity
      if (!input.appearance || !input.identity) {
        throw new Error('Either promptInput or appearance+identity must be provided');
      }

      // Convert wizard config to CharacterConfig, then to CharacterDNA
      const characterConfig: CharacterConfig = {
        gender: input.appearance.gender,
        style: input.appearance.style,
        ethnicity: input.appearance.ethnicity,
        age: input.appearance.age,
        ageRange: input.appearance.ageRange,
        skinColor: input.appearance.skinColor,
        eyeColor: input.appearance.eyeColor,
        faceShape: input.appearance.faceShape,
        hairStyle: input.appearance.hairStyle,
        hairColor: input.appearance.hairColor,
        bodyType: input.appearance.bodyType,
        assSize: input.appearance.assSize,
        breastSize: input.appearance.breastSize,
        breastType: input.appearance.breastType,
        freckles: input.appearance.freckles,
        scars: input.appearance.scars,
        beautyMarks: input.appearance.beautyMarks,
        piercings: input.appearance.piercings,
        tattoos: input.appearance.tattoos,
        defaultOutfit: input.identity.defaultOutfit,
        archetype: input.identity.archetype,
        personalityTraits: input.identity.personalityTraits,
        bio: input.identity.bio,
        nsfwEnabled: input.nsfwEnabled,
      };

      // Convert to CharacterDNA using the enhanced converter
      // Use sfwMode: true to EXCLUDE breast size, ass size from the prompt
      // Base images are ALWAYS SFW - we don't want body part descriptions triggering NSFW content
      const characterDNA = characterConfigToDNA(characterConfig, 'Character', { sfwMode: true });

      // Build prompt using PromptBuilder with character DNA
      // Base images are ALWAYS SFW - ensure proper clothing and no nudity
      // Force outfit to be appropriate (never allow nudity/NSFW for base images)
      const outfit = input.identity.defaultOutfit || 'casual';
      const safeOutfit = this.ensureSafeOutfit(outfit);

      const builtPrompt = new PromptBuilder()
        .withCharacter(characterDNA)
        .withTemplate('portrait-selfie-casual') // Default template for base images
        .withOutfit(safeOutfit)
        .withLighting('natural.soft')
        .withExpression('positive.smiling') // Use smiling for more approachable base images
        .withGoldStandard() // Apply professional photography and identity preservation rules
        .addDetails('smiling, warm friendly expression, fully clothed, appropriate attire, professional appearance, modest clothing') // Add smiling and clothing requirement
        .withNegativePrompt(
          // Strong SFW negative prompt for base images - always enforce no nudity
          'nude, naked, topless, bottomless, exposed breasts, nipples, genitals, ' +
          'see-through clothing, lingerie, underwear visible, revealing clothing, ' +
          'bikini, swimsuit, intimate wear, sexy clothing, ' +
          'nsfw, adult content, explicit, sexual content, erotic, ' +
          'bad anatomy, deformed, blurry, low quality, watermark, signature'
        )
        .build();

      basePrompt = builtPrompt.prompt;
      negativePrompt = builtPrompt.negativePrompt;
    }

    this.logger.debug(`Generated prompt: ${basePrompt.substring(0, 100)}...`);

    // Select workflow (use recommended or specified)
    const workflowId = input.workflowId || this.comfyuiAdapter.getRecommendedWorkflow();

    // Speed-first defaults (override per request if needed)
    const width = input.width ?? 1024;
    const height = input.height ?? 1024;
    const steps = input.steps ?? 9;
    const cfg = input.cfg ?? 1.0;

    const baseSeed = input.seed || Math.floor(Math.random() * 1000000);

    // Base images are ALWAYS SFW regardless of nsfwEnabled setting
    // This ensures base images are appropriate for profile pictures and public display
    // Priority: Modal.com > FAL (never ComfyUI pod or RunPod serverless)
    // Hybrid strategy (SFW only): Modal.com /flux-dev + FAL Flux Dev
    const shouldUseModal = this.modalAdapter.isAvailable();
    const shouldUseFal = this.fal.isConfigured();

    if (!shouldUseModal && !shouldUseFal) {
      throw new Error(
        'Neither Modal.com nor FAL available. Check MODAL_ENDPOINT_URL or FAL_KEY configuration. Base image generation requires Modal.com or FAL (ComfyUI pod/RunPod not supported).',
      );
    }

    if (shouldUseModal || shouldUseFal) {
      // Generate 6 base images: 2 per external provider + 2 ComfyUI
      // Priority: Modal.com /flux-dev (if available) > Fal.ai Flux Dev > Fal.ai Seedream
      // This gives users variety from different model architectures
      const imagesPerModel = 2;
      const externalJobIds: string[] = [];
      let seedOffset = 0;

      if (shouldUseModal) {
        // Use Modal.com /flux-dev (2 images)
        for (let i = 0; i < imagesPerModel; i++) {
          const jobId = this.createExternalJobId(`modal:flux-dev:${i}`);
          externalJobIds.push(jobId);
          this.externalResults.set(jobId, {
            status: 'in_progress',
            images: [],
            createdAt: Date.now(),
          });
          const seed = baseSeed + seedOffset;
          void this.runModalBaseImageJob({
            jobId,
            prompt: basePrompt,
            negativePrompt: negativePrompt,
            width,
            height,
            seed,
            userId: 'anonymous',
          });
          seedOffset++;
        }
      }

      if (shouldUseFal) {
        // Use Fal.ai Flux Dev (2 images) - fallback if Modal.com not available
        const falModels: FalFluxModelId[] = shouldUseModal 
          ? ['fal-ai/flux/dev'] // Only Flux Dev if Modal.com is also used
          : ['fal-ai/bytedance/seedream/v4.5/text-to-image', 'fal-ai/flux/dev']; // Both if Modal.com not available
        
        for (let modelIdx = 0; modelIdx < falModels.length; modelIdx++) {
          const modelId = falModels[modelIdx];
          for (let i = 0; i < imagesPerModel; i++) {
            const jobId = this.createExternalJobId(`fal:${modelId}:${i}`);
            externalJobIds.push(jobId);
            this.externalResults.set(jobId, {
              status: 'in_progress',
              images: [],
              createdAt: Date.now(),
            });
            const seed = baseSeed + seedOffset;
            void this.runFalBaseImageJob({
              jobId,
              modelId,
              prompt: basePrompt,
              negativePrompt: negativePrompt,
              width,
              height,
              seed,
              userId: 'anonymous',
            });
            seedOffset++;
          }
        }
      }

      // Only use Modal and FAL - no ComfyUI pod or RunPod serverless
      const allJobIds = [...externalJobIds];
      const providers = [];
      if (shouldUseModal) providers.push('modal(flux-dev)');
      if (shouldUseFal) providers.push('fal');
      this.logger.log(
        `Base images queued: ${providers.join(' + ')} = ${allJobIds.length} total, jobIds=${allJobIds.join(', ')}`,
      );

      return {
        images: [],
        jobId: allJobIds[0],
        workflowUsed: 'flux-dev' as WorkflowId, // Modal uses flux-dev
        allJobIds,
      };
    }

    // Should never reach here - we check for Modal/FAL availability above
    throw new Error(
      'No image generation providers available. Configure MODAL_ENDPOINT_URL or FAL_KEY. ComfyUI pod/RunPod are not supported.',
    );
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
    // Provider priority: Modal > FAL (never ComfyUI/RunPod)
    const useModal = this.modalAdapter.isAvailable() && !input.nsfw;
    const useFal = this.fal.isConfigured() && !input.nsfw;

    if (!useModal && !useFal) {
      throw new Error(
        'Neither Modal.com nor FAL available. Check MODAL_ENDPOINT_URL or FAL_KEY configuration. Note: Character generation requires Modal.com or FAL (ComfyUI/RunPod not supported).',
      );
    }

    // Build prompt
    const builder = new PromptBuilder().withCharacter(input.character);
    if (input.templateId) builder.withTemplate(input.templateId);
    if (input.scene) builder.withScene(input.scene);
    if (input.outfit) builder.withOutfit(input.outfit);
    if (input.lighting) builder.withLighting(input.lighting);
    if (input.expression) builder.withExpression(input.expression);
    builder.withStylePreset('quality');

    const builtPrompt = builder.build();

    if (useModal) {
      // For Modal: Use /flux-dev endpoint
      const jobId = await this.modalAdapter.submitBaseImages({
        prompt: builtPrompt.prompt,
        nsfw: input.nsfw || false,
        seed: input.seed,
      });

      return { jobId, workflowUsed: 'flux-dev' as WorkflowId };
    } else {
      // For FAL: Use FAL Flux Dev
      // Note: FAL doesn't have a direct character DNA method, so we use the prompt
      throw new Error(
        'FAL support for character DNA generation not yet implemented. Please use Modal.com.',
      );
    }
  }

  /**
   * Ensure outfit is safe for base images (always SFW)
   * Replaces NSFW/intimate outfits with safe alternatives
   */
  private ensureSafeOutfit(outfit: string): string {
    const outfitLower = outfit.toLowerCase();

    // List of NSFW/intimate outfits that should be replaced
    const nsfwOutfits = [
      'nude', 'topless', 'bottomless', 'lingerie', 'bikini', 'swimsuit',
      'nightgown', 'teddy', 'babydoll', 'bodysuit', 'chemise', 'slip',
      'see-through', 'wet t-shirt', 'oil covered', 'bed sheets only',
      'towel wrap', 'open robe', 'peek-a-boo', 'micro bikini',
      'pasties', 'thong', 'body paint', 'edible outfit', 'bondage',
      'leather outfit', 'latex', 'corset', 'fishnet', 'garter belt',
      'thigh highs', 'collar', 'pvc outfit', 'harness', 'cage bra'
    ];

    // Check if outfit is NSFW/intimate
    if (nsfwOutfits.some(nsfw => outfitLower.includes(nsfw))) {
      // Replace with safe casual outfit
      this.logger.warn(`Base image generation: Replaced NSFW outfit "${outfit}" with safe "casual" outfit`);
      return 'casual';
    }

    return outfit;
  }

  /**
   * Convert wizard appearance/identity config to CharacterDNA
   * Maps the wizard's detailed config to the simpler CharacterDNA format
   */
  private wizardConfigToCharacterDNA(input: BaseImageGenerationInput): CharacterDNA {
    const { appearance, identity } = input;

    // Build descriptive strings from detailed config
    const hairDesc = appearance ? `${appearance.hairColor} ${appearance.hairStyle} hair` : 'Unknown hair';
    const eyesDesc = appearance ? `${appearance.eyeColor} eyes` : 'Unknown eyes';
    const skinDesc = appearance?.ethnicity?.toLowerCase().includes('asian')
      ? 'fair smooth skin'
      : 'smooth skin with natural complexion';

    return {
      name: 'Character',
      age: `${appearance?.age}-year-old`,
      ethnicity: appearance?.ethnicity || 'Unknown',
      hair: hairDesc,
      eyes: eyesDesc,
      skin: skinDesc,
      bodyType: appearance?.bodyType,
      facialFeatures: identity?.personalityTraits && identity.personalityTraits.length > 0
        ? identity.personalityTraits.join(', ')
        : undefined,
      style: identity && appearance ? `${identity.archetype} ${appearance.style}` : undefined,
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
      // Images already have model field set when stored
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
            model: 'Danrisi', // ComfyUI internal workflow
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
            model: 'Danrisi', // ComfyUI internal workflow
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

  /**
   * Convert Fal model ID to human-friendly display name
   */
  private getFalModelDisplayName(modelId: FalFluxModelId): string {
    const modelNames: Record<string, string> = {
      'fal-ai/flux/schnell': 'Schnell',
      'fal-ai/flux/dev': 'Dev',
      'fal-ai/flux-pro': 'Pro',
      'fal-ai/flux-realism': 'Realism',
      'fal-ai/flux-2': 'FLUX 2',
      'fal-ai/flux-2-pro': 'FLUX 2 Pro',
      'fal-ai/flux-2-max': 'FLUX 2 Max',
      'fal-ai/flux-2/turbo': 'FLUX 2 Turbo',
      'fal-ai/flux-2/flash': 'FLUX 2 Flash',
      'fal-ai/z-image/turbo': 'Z-Image',
      'fal-ai/qwen-image-2512': 'Qwen',
      'fal-ai/bytedance/seedream/v4.5/text-to-image': 'Seedream',
    };
    return modelNames[modelId] || modelId.split('/').pop() || 'Fal';
  }

  /**
   * Sanitize prompt for models with strict content policies (like Seedream 4.5)
   * Removes body part descriptions that trigger content policy violations
   */
  private sanitizePromptForStrictModels(prompt: string, modelId: FalFluxModelId): string {
    // Seedream 4.5 has stricter content filtering - remove body part descriptions
    const isStrictModel = modelId.includes('seedream') || modelId.includes('bytedance');

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

    if (sanitized !== prompt) {
      this.logger.debug(`Sanitized prompt for ${modelId}: removed body part descriptions`);
    }

    return sanitized;
  }

  private async runModalBaseImageJob(params: {
    jobId: string;
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    seed?: number;
    userId: string;
  }) {
    const { jobId, prompt, negativePrompt, width, height, seed, userId } = params;
    const modelName = 'Modal.com Flux Dev';

    try {
      this.logger.log(`Modal base image started jobId=${jobId} model=flux-dev`);
      
      // Submit job to Modal.com
      const externalJobId = await this.modalAdapter.submitBaseImages({
        prompt,
        nsfw: false, // Base images are always SFW
        seed,
      });

      // Poll for result (Modal.com is synchronous, but we use the job runner pattern)
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait
      let jobStatus;
      
      while (attempts < maxAttempts) {
        jobStatus = await this.modalAdapter.getJobStatus(externalJobId);
        
        if (jobStatus.status === 'COMPLETED') {
          break;
        }
        
        if (jobStatus.status === 'FAILED') {
          throw new Error(jobStatus.error || 'Modal.com generation failed');
        }
        
        // Wait 1 second before next poll
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!jobStatus || jobStatus.status !== 'COMPLETED') {
        throw new Error('Modal.com job did not complete in time');
      }

      const output = jobStatus.output as { images?: Array<{ buffer?: Buffer }> };
      if (!output?.images || output.images.length === 0 || !output.images[0].buffer) {
        throw new Error('No image buffer returned from Modal.com');
      }

      // Convert Buffer to base64 data URL
      const imageBuffer = output.images[0].buffer;
      const base64 = imageBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      this.logger.log(`Modal base image uploading jobId=${jobId} model=flux-dev`);
      const { images: stored } = await this.imageStorage.uploadImages([dataUrl], {
        userId,
        category: 'base-images',
        jobId,
      });

      if (!stored || stored.length === 0) {
        throw new Error('Failed to upload image to storage');
      }

      const img = stored[0];
      this.externalResults.set(jobId, {
        status: 'completed',
        images: [
          {
            id: `${jobId}-0`,
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
            s3Key: img.key,
            model: modelName,
          },
        ],
        model: modelName,
        createdAt: Date.now(),
      });

      this.logger.log(`Modal base image completed jobId=${jobId} model=flux-dev url=${img.url}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Modal.com generation failed';
      const stack = e instanceof Error ? e.stack : undefined;

      this.logger.error(`Modal base image failed jobId=${jobId} model=flux-dev: ${message}`, stack);
      this.externalResults.set(jobId, {
        status: 'failed',
        images: [],
        error: message,
        model: modelName,
        createdAt: Date.now(),
      });
    }
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
    const modelName = this.getFalModelDisplayName(modelId);

    // Sanitize prompt for strict models like Seedream 4.5
    const sanitizedPrompt = this.sanitizePromptForStrictModels(prompt, modelId);

    try {
      this.logger.log(`Fal base image started jobId=${jobId} model=${modelId} (${modelName})`);
      const out = await this.fal.runFlux(modelId, {
        prompt: sanitizedPrompt,
        negativePrompt,
        width,
        height,
        seed,
        numImages: 1,
      });

      this.logger.log(`Fal base image got response jobId=${jobId} model=${modelId} images=${out.imageUrls.length}`);

      if (!out.imageUrls || out.imageUrls.length === 0) {
        throw new Error(`No image URLs returned from Fal for ${modelId}`);
      }

      // Download -> base64 data URL -> upload to our storage for stable URLs.
      this.logger.log(`Fal base image downloading jobId=${jobId} model=${modelId} url=${out.imageUrls[0].substring(0, 50)}...`);
      const base64 = await this.fal.downloadToBase64DataUrl(out.imageUrls[0]);

      this.logger.log(`Fal base image uploading jobId=${jobId} model=${modelId}`);
      const { images: stored } = await this.imageStorage.uploadImages([base64], {
        userId,
        category: 'base-images',
        jobId,
      });

      if (!stored || stored.length === 0) {
        throw new Error(`Failed to upload image to storage for ${modelId}`);
      }

      const img = stored[0];
      this.externalResults.set(jobId, {
        status: 'completed',
        images: [
          {
            id: `${jobId}-0`,
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
            s3Key: img.key,
            model: modelName,
          },
        ],
        model: modelName,
        createdAt: Date.now(),
      });

      this.logger.log(`Fal base image completed jobId=${jobId} model=${modelId} (${modelName}) url=${img.url}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Fal generation failed';
      const stack = e instanceof Error ? e.stack : undefined;

      // Check if it's a content policy violation (422) for strict models
      const isContentPolicyError = message.includes('422') || message.includes('content_policy') || message.includes('content checker');
      const isStrictModel = modelId.includes('seedream') || modelId.includes('bytedance');

      if (isContentPolicyError && isStrictModel) {
        this.logger.warn(`Content policy violation for ${modelId}, trying more aggressive sanitization...`);

        // Try again with more aggressive sanitization
        try {
          // Remove all potentially problematic terms
          const aggressiveSanitized = sanitizedPrompt
            .replace(/\b(ass|butt|breast|boob|chest|bust|nipple|genital)\w*/gi, '')
            .replace(/,\s*,/g, ',')
            .replace(/,\s*$/g, '')
            .replace(/^\s*,/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          if (aggressiveSanitized.length > 20) { // Only retry if we have enough prompt left
            this.logger.log(`Retrying ${modelId} with aggressively sanitized prompt`);
            const retryOut = await this.fal.runFlux(modelId, {
              prompt: aggressiveSanitized,
              negativePrompt,
              width,
              height,
              seed,
              numImages: 1,
            });

            if (retryOut.imageUrls && retryOut.imageUrls.length > 0) {
              const base64 = await this.fal.downloadToBase64DataUrl(retryOut.imageUrls[0]);
              const { images: stored } = await this.imageStorage.uploadImages([base64], {
                userId,
                category: 'base-images',
                jobId,
              });

              const img = stored[0];
              this.externalResults.set(jobId, {
                status: 'completed',
                images: [{
                  id: `${jobId}-0`,
                  url: img.url,
                  thumbnailUrl: img.thumbnailUrl,
                  s3Key: img.key,
                  model: modelName,
                }],
                model: modelName,
                createdAt: Date.now(),
              });

              this.logger.log(`Fal base image completed (retry) jobId=${jobId} model=${modelId} (${modelName})`);
              return; // Success on retry
            }
          }
        } catch (retryErr) {
          this.logger.warn(`Retry also failed for ${modelId}: ${retryErr instanceof Error ? retryErr.message : String(retryErr)}`);
        }
      }

      this.logger.error(`Fal base image failed jobId=${jobId} model=${modelId} (${modelName}): ${message}`, stack);
      this.externalResults.set(jobId, {
        status: 'failed',
        images: [],
        error: message,
        model: modelName,
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

