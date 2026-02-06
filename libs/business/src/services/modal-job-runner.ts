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
  ModalQwenFaceSwapRequest,
  ModalQwenCharacterSceneRequest,
  ModalVideoFaceSwapRequest,
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
   * Submit Qwen face swap job (RECOMMENDED for face consistency)
   * Uses /qwen-faceswap or /qwen-faceswap-fast endpoint
   *
   * Two-step pipeline:
   * 1. Generate with Qwen-Image 2512 (best quality T2I)
   * 2. Swap face using ReActor with GFPGAN restoration
   */
  async submitQwenFaceSwap(input: {
    referenceImageUrl: string;
    prompt: string;
    nsfw: boolean;
    aspectRatio?: '1:1' | '9:16' | '2:3';
    seed?: number;
    fast?: boolean; // Use fast mode (4 steps, default: false)
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      // Convert referenceImageUrl to base64 data URL if needed
      let referenceImage: string;
      if (input.referenceImageUrl.startsWith('data:')) {
        referenceImage = input.referenceImageUrl;
      } else if (input.referenceImageUrl.startsWith('http')) {
        const response = await fetch(input.referenceImageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const contentType =
          response.headers.get('content-type') || 'image/jpeg';
        referenceImage = `data:${contentType};base64,${base64}`;
      } else {
        throw new Error('Invalid referenceImageUrl format');
      }

      const request: ModalQwenFaceSwapRequest = {
        prompt: input.prompt,
        reference_image: referenceImage,
        negative_prompt: input.nsfw
          ? '低分辨率，低画质，肢体畸形，手指畸形'
          : '低分辨率，低画质，肢体畸形，手指畸形，nsfw, nude, naked',
        seed: input.seed,
        restore_face: true,
      };

      // Use fast or standard endpoint
      const response = input.fast
        ? await this.client.generateQwenFaceSwapFast(request)
        : await this.client.generateQwenFaceSwap(request);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [{ buffer: response.image }],
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
   * Submit Qwen character scene job
   * Uses /qwen-character-scene endpoint (Qwen-Edit based)
   */
  async submitQwenCharacterScene(input: {
    characterImageUrl: string;
    scene: string;
    denoise?: number;
    seed?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      let characterImage: string;
      if (input.characterImageUrl.startsWith('data:')) {
        characterImage = input.characterImageUrl;
      } else if (input.characterImageUrl.startsWith('http')) {
        const response = await fetch(input.characterImageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const contentType =
          response.headers.get('content-type') || 'image/jpeg';
        characterImage = `data:${contentType};base64,${base64}`;
      } else {
        throw new Error('Invalid characterImageUrl format');
      }

      const request: ModalQwenCharacterSceneRequest = {
        character_image: characterImage,
        scene: input.scene,
        denoise: input.denoise ?? 0.7,
        seed: input.seed,
      };

      const response = await this.client.generateQwenCharacterScene(request);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          images: [{ buffer: response.image }],
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
   * Submit video face swap job
   * Uses /video-faceswap endpoint (ReActor-based frame-by-frame)
   *
   * Processes video frame-by-frame:
   * 1. Load source video frames
   * 2. Apply ReActor face swap to each frame
   * 3. Reassemble with original audio
   */
  async submitVideoFaceSwap(input: {
    sourceVideoUrl: string;
    referenceImageUrl: string;
    fps?: number;
    restoreFace?: boolean;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      // Convert source video to base64
      let sourceVideo: string;
      if (input.sourceVideoUrl.startsWith('data:')) {
        sourceVideo = input.sourceVideoUrl;
      } else if (input.sourceVideoUrl.startsWith('http')) {
        const response = await fetch(input.sourceVideoUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const contentType = response.headers.get('content-type') || 'video/mp4';
        sourceVideo = `data:${contentType};base64,${base64}`;
      } else {
        throw new Error('Invalid sourceVideoUrl format');
      }

      // Convert reference image to base64
      let referenceImage: string;
      if (input.referenceImageUrl.startsWith('data:')) {
        referenceImage = input.referenceImageUrl;
      } else if (input.referenceImageUrl.startsWith('http')) {
        const response = await fetch(input.referenceImageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const contentType =
          response.headers.get('content-type') || 'image/jpeg';
        referenceImage = `data:${contentType};base64,${base64}`;
      } else {
        throw new Error('Invalid referenceImageUrl format');
      }

      const request: ModalVideoFaceSwapRequest = {
        source_video: sourceVideo,
        reference_image: referenceImage,
        fps: input.fps ?? 30,
        restore_face: input.restoreFace ?? true,
      };

      const response = await this.client.videoFaceSwap(request);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          video: { buffer: response.image }, // Response contains video buffer
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

  /**
   * Generate image using SDXL + InstantID (best face consistency)
   */
  async generateSDXLInstantID(input: ModalInstantIDRequest): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateSDXLInstantID(input);

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
   * Generate image using Flux + PuLID face consistency
   */
  async generateFluxPuLID(input: ModalPuLIDRequest): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateFluxPuLID(input);

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
   * Generate image using Qwen-Image 2512 with custom character LoRA
   */
  async generateQwenImage2512LoRA(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
    lora_id?: string;
    lora_name?: string;
    lora_strength?: number;
    trigger_word?: string;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateQwenImage2512LoRA(input);

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
   * Generate video using Wan 2.6 text-to-video
   */
  async generateWan26(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    num_frames?: number;
    fps?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateWan26(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          video: {
            buffer: response.image, // Video returned as buffer
          },
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
   * Generate video using Wan 2.6 + LoRA for character consistency
   */
  async generateWan26LoRA(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    num_frames?: number;
    fps?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
    lora_id: string;
    lora_strength?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateWan26LoRA(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          video: {
            buffer: response.image, // Video returned as buffer
          },
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
  // Video I2V Endpoints (WAN 2.6 and WAN 2.2)
  // ============================================================

  /**
   * Generate video from image using WAN 2.6 I2V (best quality)
   */
  async generateWan26I2V(input: {
    prompt: string;
    reference_image: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    length?: number;
    fps?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateWan26I2V(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          video: {
            buffer: response.image,
          },
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
   * Generate video from image + face swap using WAN 2.6
   */
  async generateWan26I2VFaceSwap(input: {
    prompt: string;
    reference_image: string;
    face_image: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    length?: number;
    fps?: number;
    steps?: number;
    cfg?: number;
    restore_face?: boolean;
    seed?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateWan26I2VFaceSwap(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          video: {
            buffer: response.image,
          },
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
   * Generate video from image using WAN 2.2 I2V (14B GGUF model)
   */
  async generateWan22I2V(input: {
    prompt: string;
    source_image: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    num_frames?: number;
    fps?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateWan22I2V(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          video: {
            buffer: response.image,
          },
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
   * Generate video from image + face swap using WAN 2.2
   */
  async generateWan22I2VFaceSwap(input: {
    prompt: string;
    source_image: string;
    face_image: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    num_frames?: number;
    fps?: number;
    steps?: number;
    cfg?: number;
    restore_face?: boolean;
    seed?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateWan22I2VFaceSwap(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          video: {
            buffer: response.image,
          },
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
  // Face Swap Endpoints
  // ============================================================

  /**
   * Single image face swap using ReActor
   */
  async generateImageFaceSwap(input: {
    source_image: string;
    reference_image: string;
    restore_face?: boolean;
    face_restore_visibility?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateImageFaceSwap(input);

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
   * Batch video face swap (frame by frame)
   */
  async generateBatchVideoFaceSwap(input: {
    source_video: string;
    reference_image: string;
    fps?: number;
    restore_face?: boolean;
    face_restore_visibility?: number;
  }): Promise<string> {
    const jobId = `modal_${randomUUID()}`;

    try {
      const response = await this.client.generateBatchVideoFaceSwap(input);

      this.jobs.set(jobId, {
        status: 'COMPLETED',
        output: {
          video: {
            buffer: response.image,
          },
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
