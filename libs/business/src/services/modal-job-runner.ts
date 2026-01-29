/**
 * Modal.com Job Runner
 *
 * Implementation of RunPodJobRunner that uses Modal.com FastAPI endpoints.
 * Modal.com endpoints return images synchronously, so we store results immediately
 * and return job IDs for status polling.
 *
 * @see Modal.com endpoints: /flux-dev, /flux, /wan2, /workflow, /flux-lora
 */

import { RunPodJobRunner, RunPodJobStatus } from './image-generation.service';
import {
  ModalClient,
  ModalFluxRequest,
  ModalLoRARequest,
  ModalIPAdapterFaceIDRequest,
  ModalInstantIDRequest,
  ModalPuLIDRequest,
} from './modal-client';
import { randomUUID } from 'crypto';

interface StoredJob {
  status: 'COMPLETED' | 'FAILED';
  output?: {
    images?: Array<{ url?: string; base64?: string; buffer?: Buffer }>;
    video?: { url?: string; base64?: string; buffer?: Buffer };
  };
  error?: string;
  createdAt: Date;
}

export interface ModalJobRunnerConfig {
  endpointUrl: string;
  timeout?: number;
}

export class ModalJobRunner implements RunPodJobRunner {
  private client: ModalClient;
  private jobs: Map<string, StoredJob> = new Map();

  constructor(config: ModalJobRunnerConfig) {
    this.client = new ModalClient({
      endpointUrl: config.endpointUrl,
      timeout: config.timeout,
    });
  }

  /**
   * Submit base image generation job
   * Uses /flux-dev endpoint (primary MVP model)
   */
  async submitBaseImages(input: {
    prompt: string;
    nsfw: boolean;
    seed?: number;
    useZImage?: boolean;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    // Build request
    const request: ModalFluxRequest = {
      prompt: input.prompt,
      negative_prompt: input.nsfw
        ? 'deformed, blurry, bad anatomy, ugly, low quality'
        : 'deformed, blurry, bad anatomy, ugly, low quality, nsfw, nude, naked',
      width: 1024,
      height: 1024,
      steps: 20,
      cfg: 3.5,
      seed: input.seed,
    };

    // Execute immediately (Modal.com is synchronous)
    try {
      const response = await this.client.generateFluxDev(request);

      // Store result
      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      // Store error
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Submit face swap job
   * Uses /flux-ipadapter-faceid endpoint (recommended for Flux Dev)
   * Falls back to /sdxl-instantid if needed
   */
  async submitFaceSwap(input: {
    baseImageUrl: string;
    prompt: string;
    nsfw: boolean;
    seed?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      // Convert baseImageUrl to base64 data URL if needed
      let referenceImage: string;
      if (input.baseImageUrl.startsWith('data:')) {
        referenceImage = input.baseImageUrl;
      } else if (input.baseImageUrl.startsWith('http')) {
        // Fetch image and convert to base64
        const response = await fetch(input.baseImageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const contentType =
          response.headers.get('content-type') || 'image/jpeg';
        referenceImage = `data:${contentType};base64,${base64}`;
      } else {
        throw new Error(
          'Invalid baseImageUrl format. Expected data URL or HTTP URL.'
        );
      }

      // Use /flux-ipadapter-faceid (recommended for Flux Dev)
      const request: ModalIPAdapterFaceIDRequest = {
        prompt: input.prompt,
        reference_image: referenceImage,
        negative_prompt: input.nsfw
          ? 'deformed, blurry, bad anatomy, ugly, low quality'
          : 'deformed, blurry, bad anatomy, ugly, low quality, nsfw, nude, naked',
        width: 1024,
        height: 1024,
        steps: 20,
        cfg: 1.0,
        seed: input.seed,
        ipadapter_strength: 0.8,
        face_provider: 'CPU',
      };

      const response = await this.client.generateFluxIPAdapterFaceID(request);

      // Store result
      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Submit character sheet job
   * Uses /workflow endpoint with custom workflow for multiple angles
   */
  async submitCharacterSheet(_input: {
    baseImageUrl: string;
    nsfw: boolean;
    angles?: string[];
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    // Character sheet requires multiple images from different angles
    // Use /workflow endpoint with a custom workflow
    try {
      // For now, generate a single image
      // TODO: Implement multi-angle workflow when needed
      // TODO: Implement multi-angle workflow when needed
      // const workflow = { ... };

      this.jobs.set(jobId, {
        status: 'FAILED',
        error:
          'Character sheet generation via Modal.com workflow not yet implemented',
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Get job status
   * Returns stored result from synchronous execution
   */
  async getJobStatus(jobId: string): Promise<RunPodJobStatus> {
    const job = this.jobs.get(jobId);

    if (!job) {
      return {
        status: 'FAILED',
        error: 'Job not found',
      };
    }

    // Convert stored job to RunPodJobStatus format
    const status: RunPodJobStatus = {
      status: job.status,
      output: job.output,
      error: job.error,
    };

    // Clean up old jobs (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, storedJob] of this.jobs.entries()) {
      if (storedJob.createdAt.getTime() < oneHourAgo) {
        this.jobs.delete(id);
      }
    }

    return status;
  }

  /**
   * Generate image using Flux Schnell (fast generation)
   */
  async generateFlux(input: ModalFluxRequest): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateFlux(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Generate image using Flux Dev + LoRA
   */
  async generateFluxLoRA(input: ModalLoRARequest): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateFluxLoRA(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Generate image using Z-Image-Turbo Simple
   */
  async generateZImageSimple(input: ModalFluxRequest): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateZImageSimple(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Generate image using Z-Image-Turbo Danrisi
   */
  async generateZImageDanrisi(input: ModalFluxRequest): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateZImageDanrisi(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Generate image using Z-Image-Turbo + InstantID
   */
  async generateZImageInstantID(input: ModalInstantIDRequest): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateZImageInstantID(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Generate image using Z-Image-Turbo + PuLID
   */
  async generateZImagePuLID(input: ModalPuLIDRequest): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateZImagePuLID(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Generate image using Flux Dev + IP-Adapter FaceID
   */
  async generateFluxIPAdapterFaceID(
    input: ModalIPAdapterFaceIDRequest
  ): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateFluxIPAdapterFaceID(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  // ============================================================
  // Qwen-Image Models (Modal.com - Apache 2.0, supports NSFW)
  // ============================================================

  /**
   * Generate image using Qwen-Image 2512 (high-quality, 50 steps)
   */
  async generateQwenImage2512(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateQwenImage2512(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Generate image using Qwen-Image 2512 Fast (4 steps with Lightning LoRA)
   */
  async generateQwenImage2512Fast(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateQwenImage2512Fast(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Edit image using Qwen-Image Edit 2511 (instruction-based)
   */
  async editQwenImage2511(input: {
    source_image: string;
    instruction: string;
    steps?: number;
    cfg?: number;
    seed?: number;
    denoise?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.editQwenImage2511(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Inpaint image using Qwen-Image Inpaint 2511 (mask-based)
   */
  async inpaintQwenImage2511(input: {
    source_image: string;
    mask_image: string;
    prompt: string;
    steps?: number;
    cfg?: number;
    seed?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.inpaintQwenImage2511(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [
            {
              buffer: response.image,
            },
          ],
        },
        createdAt: new Date(),
      });

      return jobId;
    } catch (error) {
      this.jobs.set(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return this.client.healthCheck();
  }
}
