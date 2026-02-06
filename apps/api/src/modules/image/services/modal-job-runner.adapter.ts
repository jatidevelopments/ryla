/**
 * Modal.com Job Runner Adapter
 *
 * NestJS injectable adapter for ModalJobRunner.
 * Uses Modal.com FastAPI endpoints for AI generation.
 *
 * @see Modal.com endpoints: /flux-dev, /flux, /wan2, /workflow, /flux-lora
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  ModalJobRunner,
  detectWorkflowType,
  type ComfyUIWorkflow,
} from '@ryla/business';
import type { RunPodJobRunner, RunPodJobStatus } from '@ryla/business';

@Injectable()
export class ModalJobRunnerAdapter implements RunPodJobRunner, OnModuleInit {
  private readonly logger = new Logger(ModalJobRunnerAdapter.name);
  private runner: ModalJobRunner | null = null;
  private isInitialized = false;

  async onModuleInit() {
    // Use process.env directly to avoid ConfigService DI timing issues
    const endpointUrl = process.env['MODAL_ENDPOINT_URL'];
    const workspace = process.env['MODAL_WORKSPACE'];

    // Construct endpoint URL from workspace if not provided directly
    let finalEndpointUrl = endpointUrl;
    if (!finalEndpointUrl && workspace) {
      finalEndpointUrl = `https://${workspace}--ryla-comfyui-comfyui-fastapi-app.modal.run`;
    }

    if (!finalEndpointUrl) {
      this.logger.warn(
        'MODAL_ENDPOINT_URL or MODAL_WORKSPACE not configured - Modal.com image generation disabled'
      );
      return;
    }

    try {
      this.runner = new ModalJobRunner({
        endpointUrl: finalEndpointUrl,
        timeout: 180000, // 3 minutes
      });

      // Test connection
      const isHealthy = await this.runner.healthCheck();
      if (!isHealthy) {
        this.logger.warn('Modal.com endpoint health check failed');
        return;
      }

      this.isInitialized = true;
      this.logger.log(`Modal.com endpoint initialized: ${finalEndpointUrl}`);
    } catch (error) {
      this.logger.error('Failed to initialize Modal.com endpoint:', error);
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.runner) {
      throw new Error(
        'Modal.com endpoint not initialized. Check MODAL_ENDPOINT_URL or MODAL_WORKSPACE configuration.'
      );
    }
  }

  /**
   * Submit base image generation (RunPodJobRunner interface)
   */
  async submitBaseImages(input: {
    prompt: string;
    nsfw: boolean;
    seed?: number;
    useZImage?: boolean;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.submitBaseImages(input);
  }

  /**
   * Submit face swap job (RunPodJobRunner interface)
   */
  async submitFaceSwap(input: {
    baseImageUrl: string;
    prompt: string;
    nsfw: boolean;
    seed?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.submitFaceSwap(input);
  }

  /**
   * Submit character sheet job (RunPodJobRunner interface)
   */
  async submitCharacterSheet(input: {
    baseImageUrl: string;
    nsfw: boolean;
    angles?: string[];
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.submitCharacterSheet(input);
  }

  /**
   * Get job status (RunPodJobRunner interface)
   */
  async getJobStatus(jobId: string): Promise<RunPodJobStatus> {
    this.ensureInitialized();
    return this.runner!.getJobStatus(jobId);
  }

  /**
   * Submit Qwen-Image generation (supports NSFW)
   * Uses Qwen-Image 2512 models on Modal.com
   */
  async submitQwenImage(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    seed?: number;
    fast?: boolean; // Use fast endpoint with Lightning LoRA
  }): Promise<string> {
    this.ensureInitialized();

    // Route to appropriate Qwen endpoint
    if (input.fast) {
      return this.runner!.generateQwenImage2512Fast({
        prompt: input.prompt,
        negative_prompt: input.negative_prompt,
        width: input.width,
        height: input.height,
        seed: input.seed,
      });
    }

    return this.runner!.generateQwenImage2512({
      prompt: input.prompt,
      negative_prompt: input.negative_prompt,
      width: input.width,
      height: input.height,
      seed: input.seed,
    });
  }

  /**
   * Submit Qwen-Image generation with custom LoRA
   * Uses trained character LoRA for >95% face consistency
   */
  async submitQwenImageLora(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    seed?: number;
    lora_id: string;
    lora_strength?: number;
    trigger_word?: string;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.generateQwenImage2512LoRA({
      prompt: input.prompt,
      negative_prompt: input.negative_prompt,
      width: input.width,
      height: input.height,
      seed: input.seed,
      lora_id: input.lora_id,
      lora_strength: input.lora_strength ?? 1.0,
      trigger_word: input.trigger_word,
    });
  }

  /**
   * Submit Flux generation with custom LoRA
   * Uses trained character LoRA for >95% face consistency
   */
  async submitFluxLora(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    seed?: number;
    lora_id: string;
    lora_strength?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.generateFluxLoRA({
      prompt: input.prompt,
      negative_prompt: input.negative_prompt,
      width: input.width ?? 1024,
      height: input.height ?? 1024,
      seed: input.seed,
      lora_id: input.lora_id,
      lora_strength: input.lora_strength ?? 1.0,
    });
  }

  /**
   * Submit Qwen-Image Edit (instruction-based editing)
   */
  async submitQwenEdit(input: {
    source_image: string;
    instruction: string;
    steps?: number;
    cfg?: number;
    seed?: number;
    denoise?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.editQwenImage2511(input);
  }

  /**
   * Submit Qwen-Image Inpaint (mask-based inpainting)
   */
  async submitQwenInpaint(input: {
    source_image: string;
    mask_image: string;
    prompt: string;
    steps?: number;
    cfg?: number;
    seed?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.inpaintQwenImage2511(input);
  }

  /**
   * Submit Qwen face swap (RECOMMENDED for face consistency with Qwen)
   *
   * Two-step pipeline:
   * 1. Generate with Qwen-Image 2512 (best quality)
   * 2. Swap face using ReActor with GFPGAN restoration
   */
  async submitQwenFaceSwap(input: {
    referenceImageUrl: string;
    prompt: string;
    nsfw: boolean;
    aspectRatio?: '1:1' | '9:16' | '2:3';
    seed?: number;
    fast?: boolean;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.submitQwenFaceSwap(input);
  }

  /**
   * Submit Qwen character scene (Qwen-Edit based)
   */
  async submitQwenCharacterScene(input: {
    characterImageUrl: string;
    scene: string;
    denoise?: number;
    seed?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.submitQwenCharacterScene(input);
  }

  /**
   * Submit video generation using Wan 2.6
   * Uses /wan2.6 or /wan2.6-lora endpoint via Modal.com
   */
  async submitVideoGeneration(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    num_frames?: number;
    fps?: number;
    seed?: number;
    lora_id?: string;
    lora_strength?: number;
  }): Promise<string> {
    this.ensureInitialized();

    if (input.lora_id) {
      return this.runner!.generateWan26LoRA({
        prompt: input.prompt,
        negative_prompt: input.negative_prompt,
        width: input.width,
        height: input.height,
        num_frames: input.num_frames,
        fps: input.fps,
        seed: input.seed,
        lora_id: input.lora_id,
        lora_strength: input.lora_strength,
      });
    }

    return this.runner!.generateWan26({
      prompt: input.prompt,
      negative_prompt: input.negative_prompt,
      width: input.width,
      height: input.height,
      num_frames: input.num_frames,
      fps: input.fps,
      seed: input.seed,
    });
  }

  /**
   * Submit video face swap job
   * Uses /video-faceswap endpoint (ReActor-based frame-by-frame)
   *
   * Processes video frame-by-frame:
   * 1. Load source video frames
   * 2. Apply ReActor face swap to each frame
   * 3. Reassemble with original audio
   *
   * Note: Processing time depends on video length (~1-2 seconds per frame)
   */
  async submitVideoFaceSwap(input: {
    sourceVideoUrl: string;
    referenceImageUrl: string;
    fps?: number;
    restoreFace?: boolean;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.submitVideoFaceSwap(input);
  }

  // ============================================================
  // Video I2V Endpoints (WAN 2.6 and WAN 2.2)
  // ============================================================

  /**
   * Generate video from image using WAN 2.6 I2V (best quality)
   * Uses native WanImageToVideo node with full-precision 1.3B model
   */
  async submitWan26I2V(input: {
    prompt: string;
    referenceImageUrl: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    length?: number;
    fps?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.generateWan26I2V({
      prompt: input.prompt,
      reference_image: input.referenceImageUrl,
      negative_prompt: input.negativePrompt,
      width: input.width ?? 832,
      height: input.height ?? 480,
      length: input.length ?? 33,
      fps: input.fps ?? 16,
      steps: input.steps ?? 30,
      cfg: input.cfg ?? 6.0,
      seed: input.seed,
    });
  }

  /**
   * Generate video from image + face swap using WAN 2.6
   * Two-phase: I2V → delegate face swap to Qwen app
   */
  async submitWan26I2VFaceSwap(input: {
    prompt: string;
    referenceImageUrl: string;
    faceImageUrl: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    length?: number;
    fps?: number;
    steps?: number;
    cfg?: number;
    restoreFace?: boolean;
    seed?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.generateWan26I2VFaceSwap({
      prompt: input.prompt,
      reference_image: input.referenceImageUrl,
      face_image: input.faceImageUrl,
      negative_prompt: input.negativePrompt,
      width: input.width ?? 832,
      height: input.height ?? 480,
      length: input.length ?? 33,
      fps: input.fps ?? 16,
      steps: input.steps ?? 30,
      cfg: input.cfg ?? 6.0,
      restore_face: input.restoreFace ?? true,
      seed: input.seed,
    });
  }

  /**
   * Generate video from image using WAN 2.2 I2V (14B GGUF model)
   * Slower but different visual style. Cold start takes 2-3 minutes.
   */
  async submitWan22I2V(input: {
    prompt: string;
    sourceImageUrl: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    numFrames?: number;
    fps?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.generateWan22I2V({
      prompt: input.prompt,
      source_image: input.sourceImageUrl,
      negative_prompt: input.negativePrompt,
      width: input.width ?? 832,
      height: input.height ?? 480,
      num_frames: input.numFrames ?? 33,
      fps: input.fps ?? 16,
      steps: input.steps ?? 30,
      cfg: input.cfg ?? 5.0,
      seed: input.seed,
    });
  }

  /**
   * Generate video from image + face swap using WAN 2.2
   * Two-phase: I2V → delegate face swap to Qwen app
   * Requires warm container - cold start may timeout
   */
  async submitWan22I2VFaceSwap(input: {
    prompt: string;
    sourceImageUrl: string;
    faceImageUrl: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    numFrames?: number;
    fps?: number;
    steps?: number;
    cfg?: number;
    restoreFace?: boolean;
    seed?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.generateWan22I2VFaceSwap({
      prompt: input.prompt,
      source_image: input.sourceImageUrl,
      face_image: input.faceImageUrl,
      negative_prompt: input.negativePrompt,
      width: input.width ?? 832,
      height: input.height ?? 480,
      num_frames: input.numFrames ?? 33,
      fps: input.fps ?? 16,
      steps: input.steps ?? 30,
      cfg: input.cfg ?? 5.0,
      restore_face: input.restoreFace ?? true,
      seed: input.seed,
    });
  }

  // ============================================================
  // Face Swap Endpoints
  // ============================================================

  /**
   * Single image face swap using ReActor
   */
  async submitImageFaceSwap(input: {
    sourceImageUrl: string;
    referenceImageUrl: string;
    restoreFace?: boolean;
    faceRestoreVisibility?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.generateImageFaceSwap({
      source_image: input.sourceImageUrl,
      reference_image: input.referenceImageUrl,
      restore_face: input.restoreFace ?? true,
      face_restore_visibility: input.faceRestoreVisibility ?? 1.0,
    });
  }

  /**
   * Batch video face swap (frame by frame)
   * Supports MP4 and animated WebP input
   */
  async submitBatchVideoFaceSwap(input: {
    sourceVideoUrl: string;
    referenceImageUrl: string;
    fps?: number;
    restoreFace?: boolean;
    faceRestoreVisibility?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.generateBatchVideoFaceSwap({
      source_video: input.sourceVideoUrl,
      reference_image: input.referenceImageUrl,
      fps: input.fps ?? 16,
      restore_face: input.restoreFace ?? true,
      face_restore_visibility: input.faceRestoreVisibility ?? 1.0,
    });
  }

  /**
   * Health check - verify endpoint is available
   */
  async healthCheck(): Promise<boolean> {
    if (!this.runner) return false;
    return this.runner.healthCheck();
  }

  /**
   * Check if Modal.com is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Queue a workflow - detects workflow type and routes to appropriate Modal endpoint
   * This allows ProfilePictureSetService and other services to use Modal endpoints
   */
  async queueWorkflow(workflow: ComfyUIWorkflow): Promise<string> {
    this.ensureInitialized();

    const detected = detectWorkflowType(workflow);

    this.logger.log(`Detected workflow type: ${detected.type}`);

    // Route to appropriate Modal endpoint based on detected type
    switch (detected.type) {
      case 'z-image-simple': {
        return this.runner!.generateZImageSimple({
          prompt: detected.parameters.prompt || '',
          negative_prompt: detected.parameters.negativePrompt,
          width: detected.parameters.width,
          height: detected.parameters.height,
          steps: detected.parameters.steps,
          cfg: detected.parameters.cfg,
          seed: detected.parameters.seed,
        });
      }

      case 'z-image-danrisi': {
        return this.runner!.generateZImageDanrisi({
          prompt: detected.parameters.prompt || '',
          negative_prompt: detected.parameters.negativePrompt,
          width: detected.parameters.width,
          height: detected.parameters.height,
          steps: detected.parameters.steps,
          cfg: detected.parameters.cfg,
          seed: detected.parameters.seed,
        });
      }

      case 'z-image-instantid': {
        // Z-Image + InstantID is not supported - route to SDXL InstantID instead
        this.logger.warn(
          'Z-Image InstantID not supported, using SDXL InstantID instead'
        );
        if (!detected.parameters.referenceImage) {
          throw new Error('InstantID workflow requires reference image');
        }

        let referenceImage = detected.parameters.referenceImage;
        if (!referenceImage.startsWith('data:')) {
          throw new Error(
            'Reference image must be base64 data URL for Modal endpoints'
          );
        }

        return this.runner!.generateSDXLInstantID({
          prompt: detected.parameters.prompt || '',
          reference_image: referenceImage,
          negative_prompt: detected.parameters.negativePrompt,
          width: detected.parameters.width,
          height: detected.parameters.height,
          steps: detected.parameters.steps,
          cfg: detected.parameters.cfg,
          seed: detected.parameters.seed,
          instantid_strength: detected.parameters.instantidStrength,
          controlnet_strength: detected.parameters.controlnetStrength,
          face_provider: detected.parameters.faceProvider,
        });
      }

      case 'z-image-pulid': {
        // Z-Image + PuLID is not supported - route to Flux PuLID instead
        this.logger.warn(
          'Z-Image PuLID not supported, using Flux PuLID instead'
        );
        if (!detected.parameters.referenceImage) {
          throw new Error('PuLID workflow requires reference image');
        }

        let referenceImage = detected.parameters.referenceImage;
        if (!referenceImage.startsWith('data:')) {
          throw new Error(
            'Reference image must be base64 data URL for Modal endpoints'
          );
        }

        return this.runner!.generateFluxPuLID({
          prompt: detected.parameters.prompt || '',
          reference_image: referenceImage,
          negative_prompt: detected.parameters.negativePrompt,
          width: detected.parameters.width,
          height: detected.parameters.height,
          steps: detected.parameters.steps,
          cfg: detected.parameters.cfg,
          seed: detected.parameters.seed,
          pulid_strength: detected.parameters.pulidStrength,
          pulid_start: detected.parameters.pulidStart,
          pulid_end: detected.parameters.pulidEnd,
          face_provider: detected.parameters.faceProvider,
        });
      }

      case 'flux-ipadapter-faceid': {
        if (!detected.parameters.referenceImage) {
          throw new Error(
            'Flux IP-Adapter FaceID workflow requires reference image'
          );
        }

        let referenceImage = detected.parameters.referenceImage;
        if (!referenceImage.startsWith('data:')) {
          throw new Error(
            'Reference image must be base64 data URL for Modal endpoints'
          );
        }

        return this.runner!.generateFluxIPAdapterFaceID({
          prompt: detected.parameters.prompt || '',
          reference_image: referenceImage,
          negative_prompt: detected.parameters.negativePrompt,
          width: detected.parameters.width,
          height: detected.parameters.height,
          steps: detected.parameters.steps,
          cfg: detected.parameters.cfg,
          seed: detected.parameters.seed,
          ipadapter_strength: detected.parameters.ipadapterStrength,
          face_provider: detected.parameters.faceProvider,
        });
      }

      case 'flux-dev': {
        return this.runner!.submitBaseImages({
          prompt: detected.parameters.prompt || '',
          nsfw: false, // Base images are always SFW
          seed: detected.parameters.seed,
        });
      }

      default: {
        // Fallback: use /workflow endpoint for unknown workflows
        this.logger.warn(`Unknown workflow type, using /workflow endpoint`);
        // ModalJobRunner doesn't have executeWorkflow yet, would need to add it
        throw new Error(
          `Workflow type ${detected.type} not yet supported via Modal endpoints. Use ComfyUI adapter instead.`
        );
      }
    }
  }
}
