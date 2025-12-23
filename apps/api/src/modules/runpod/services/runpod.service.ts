import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RunPodClient } from '@ryla/business';

export interface BaseImageGenerationInput {
  prompt: string;
  nsfw: boolean;
  seed?: number;
  useZImage?: boolean; // Use Z-Image-Turbo instead of Flux 2 Dev
}

export interface FaceSwapInput {
  baseImageUrl: string;
  prompt: string;
  nsfw: boolean;
  seed?: number;
}

export interface FinalGenerationInput {
  prompt: string;
  loraPath: string;
  nsfw: boolean;
  seed?: number;
  useZImage?: boolean; // Use Z-Image-Turbo instead of Flux 2 Dev
}

export interface CharacterSheetInput {
  baseImageUrl: string;
  angles?: string[];
  nsfw: boolean;
}

@Injectable()
export class RunPodService {
  private client: RunPodClient | null = null;
  private fluxEndpointId: string;
  private zImageEndpointId: string;

  constructor(@Inject(ConfigService) private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RUNPOD_API_KEY');
    if (!apiKey) {
      this.fluxEndpointId = '';
      this.zImageEndpointId = '';
      return;
    }

    this.client = new RunPodClient({
      apiKey,
    });

    // Get endpoint IDs from config
    this.fluxEndpointId =
      this.configService.get<string>('RUNPOD_ENDPOINT_FLUX_DEV') || '';
    this.zImageEndpointId =
      this.configService.get<string>('RUNPOD_ENDPOINT_Z_IMAGE_TURBO') || '';
  }

  /**
   * Execute a job on a serverless endpoint
   */
  async runJob(endpointId: string, input: unknown): Promise<string> {
    if (!this.client) {
      throw new Error('RunPod client not initialized. Set RUNPOD_API_KEY environment variable.');
    }
    if (!endpointId) {
      throw new Error('RunPod endpoint ID is required');
    }
    const job = await this.client.runJob(endpointId, input);
    return job.id;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string) {
    if (!this.client) {
      throw new Error('RunPod client not initialized. Set RUNPOD_API_KEY environment variable.');
    }
    return this.client.getJobStatus(jobId);
  }

  /**
   * List all pods
   */
  async listPods() {
    if (!this.client) {
      throw new Error('RunPod client not initialized. Set RUNPOD_API_KEY environment variable.');
    }
    return this.client.listPods();
  }

  /**
   * Get pod details
   */
  async getPod(podId: string) {
    if (!this.client) {
      throw new Error('RunPod client not initialized. Set RUNPOD_API_KEY environment variable.');
    }
    return this.client.getPod(podId);
  }

  /**
   * List serverless endpoints
   */
  async listEndpoints() {
    if (!this.client) {
      throw new Error('RunPod client not initialized. Set RUNPOD_API_KEY environment variable.');
    }
    return this.client.listEndpoints();
  }

  /**
   * Generate base images (3 variations)
   */
  async generateBaseImages(input: BaseImageGenerationInput): Promise<string> {
    const endpointId = input.useZImage
      ? this.zImageEndpointId
      : this.fluxEndpointId;

    if (!endpointId) {
      throw new Error(
        `Endpoint ID not configured for ${input.useZImage ? 'Z-Image-Turbo' : 'Flux 2 Dev'}`,
      );
    }

    return this.runJob(endpointId, {
      task_type: 'base_image',
      prompt: input.prompt,
      nsfw: input.nsfw,
      seed: input.seed ?? -1,
    });
  }

  /**
   * Generate image with face swap (IPAdapter FaceID)
   */
  async generateFaceSwap(input: FaceSwapInput): Promise<string> {
    if (!this.fluxEndpointId) {
      throw new Error('Flux 2 Dev endpoint ID not configured');
    }

    return this.runJob(this.fluxEndpointId, {
      task_type: 'face_swap',
      base_image_url: input.baseImageUrl,
      prompt: input.prompt,
      nsfw: input.nsfw,
      seed: input.seed ?? -1,
    });
  }

  /**
   * Generate final image with LoRA
   */
  async generateFinal(input: FinalGenerationInput): Promise<string> {
    const endpointId = input.useZImage
      ? this.zImageEndpointId
      : this.fluxEndpointId;

    if (!endpointId) {
      throw new Error(
        `Endpoint ID not configured for ${input.useZImage ? 'Z-Image-Turbo' : 'Flux 2 Dev'}`,
      );
    }

    return this.runJob(endpointId, {
      task_type: 'final_gen',
      prompt: input.prompt,
      lora_path: input.loraPath,
      nsfw: input.nsfw,
      seed: input.seed ?? -1,
    });
  }

  /**
   * Generate character sheet (7-10 images with PuLID + ControlNet)
   */
  async generateCharacterSheet(
    input: CharacterSheetInput,
  ): Promise<string> {
    if (!this.fluxEndpointId) {
      throw new Error('Flux 2 Dev endpoint ID not configured');
    }

    return this.runJob(this.fluxEndpointId, {
      task_type: 'character_sheet',
      base_image_url: input.baseImageUrl,
      angles: input.angles ?? ['front', 'side', '3/4', 'back'],
      nsfw: input.nsfw,
    });
  }
}

