/**
 * Modal.com Job Runner Adapter
 *
 * NestJS injectable adapter for ModalJobRunner.
 * Uses Modal.com FastAPI endpoints for AI generation.
 *
 * @see Modal.com endpoints: /flux-dev, /flux, /wan2, /workflow, /flux-lora
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ModalJobRunner, detectWorkflowType, type ComfyUIWorkflow } from '@ryla/business';
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
        'MODAL_ENDPOINT_URL or MODAL_WORKSPACE not configured - Modal.com image generation disabled',
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
        'Modal.com endpoint not initialized. Check MODAL_ENDPOINT_URL or MODAL_WORKSPACE configuration.',
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
        if (!detected.parameters.referenceImage) {
          throw new Error('Z-Image InstantID workflow requires reference image');
        }

        // Convert reference image to base64 if it's a filename
        let referenceImage = detected.parameters.referenceImage;
        if (!referenceImage.startsWith('data:')) {
          // Assume it's a filename - would need to fetch from ComfyUI input folder
          // For now, throw error - this should be handled by the service
          throw new Error('Reference image must be base64 data URL for Modal endpoints');
        }

        return this.runner!.generateZImageInstantID({
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
        if (!detected.parameters.referenceImage) {
          throw new Error('Z-Image PuLID workflow requires reference image');
        }

        let referenceImage = detected.parameters.referenceImage;
        if (!referenceImage.startsWith('data:')) {
          throw new Error('Reference image must be base64 data URL for Modal endpoints');
        }

        return this.runner!.generateZImagePuLID({
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
          throw new Error('Flux IP-Adapter FaceID workflow requires reference image');
        }

        let referenceImage = detected.parameters.referenceImage;
        if (!referenceImage.startsWith('data:')) {
          throw new Error('Reference image must be base64 data URL for Modal endpoints');
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
        throw new Error(`Workflow type ${detected.type} not yet supported via Modal endpoints. Use ComfyUI adapter instead.`);
      }
    }
  }
}
