import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RunPodService } from '../../runpod/services/runpod.service';
import { createBaseImageWorkflow } from '@ryla/business';

export interface BaseImageGenerationInput {
  appearance: {
    gender: 'female' | 'male';
    style: 'realistic' | 'anime';
    ethnicity: string;
    age: number;
    hairStyle: string;
    hairColor: string;
    eyeColor: string;
    bodyType: string;
    breastSize?: string;
  };
  identity: {
    defaultOutfit: string;
    archetype: string;
    personalityTraits: string[];
    bio?: string;
  };
  nsfwEnabled: boolean;
}

export interface BaseImageGenerationResult {
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl: string;
  }>;
  jobId: string;
}

@Injectable()
export class BaseImageGenerationService {
  private readonly runpodEndpointId: string;

  constructor(
    private readonly runpodService: RunPodService,
    private readonly configService: ConfigService,
  ) {
    // TODO: Get from config or environment
    this.runpodEndpointId =
      this.configService.get<string>('RUNPOD_ENDPOINT_IMAGE_GENERATION') || '';
  }

  /**
   * Generate 3 base image options from wizard config
   */
  async generateBaseImages(
    input: BaseImageGenerationInput,
  ): Promise<BaseImageGenerationResult> {
    // Build prompt from wizard config
    const prompt = this.buildPrompt(input);
    const negativePrompt = this.buildNegativePrompt(input);

    // Build ComfyUI workflow for base image generation
    const workflow = this.buildBaseImageWorkflow(
      prompt,
      negativePrompt,
      input.nsfwEnabled,
    );

    // Execute on RunPod serverless endpoint
    const jobId = await this.runpodService.runJob(
      this.runpodEndpointId,
      {
        workflow,
        count: 3, // Generate 3 variations
      },
    );

    // Return job ID - caller will poll for results
    return {
      images: [], // Will be populated when job completes
      jobId,
    };
  }

  /**
   * Build prompt from wizard config
   */
  private buildPrompt(input: BaseImageGenerationInput): string {
    const { appearance, identity } = input;

    const style = appearance.style === 'realistic' ? 'Photo' : 'Anime illustration';
    const gender = appearance.gender === 'female' ? 'woman' : 'man';
    const age = appearance.age;
    const ethnicity = appearance.ethnicity;
    const hair = `${appearance.hairColor} ${appearance.hairStyle} hair`;
    const eyes = `${appearance.eyeColor} eyes`;
    const body = `${appearance.bodyType} body type`;
    const outfit = identity.defaultOutfit;

    let prompt = `${style} of a ${age} year old ${ethnicity} ${gender}, `;
    prompt += `${hair}, ${eyes}, ${body}, `;
    prompt += `wearing ${outfit}, `;
    prompt += `professional photography, high quality, detailed, `;
    prompt += `8k, best quality, masterpiece`;

    // Add archetype influence
    if (identity.archetype) {
      prompt += `, ${identity.archetype} style`;
    }

    // Add personality traits
    if (identity.personalityTraits.length > 0) {
      prompt += `, ${identity.personalityTraits.join(', ')}`;
    }

    return prompt;
  }

  /**
   * Build negative prompt
   */
  private buildNegativePrompt(input: BaseImageGenerationInput): string {
    return `deformed, blurry, bad anatomy, disfigured, poorly drawn face, 
      mutation, mutated, extra limb, ugly, poorly drawn hands, 
      bad fingers, extra fingers, missing fingers, low quality, 
      worst quality, jpeg artifacts, watermark, signature`;
  }

  /**
   * Build ComfyUI workflow JSON for base image generation
   */
  private buildBaseImageWorkflow(
    prompt: string,
    negativePrompt: string,
    nsfwEnabled: boolean,
  ) {
    // Model selection (uncensored if NSFW enabled)
    const modelName = nsfwEnabled
      ? 'flux1-dev-uncensored.safetensors'
      : 'flux1-dev.safetensors';

    // Use helper function from workflow builder
    return createBaseImageWorkflow(
      prompt,
      negativePrompt,
      modelName,
      1024, // width
      1024, // height
      20, // steps
      7.0, // cfg
      -1 // seed (random)
    );
  }

  /**
   * Check job status and get results
   */
  async getJobResults(jobId: string) {
    const status = await this.runpodService.getJobStatus(jobId);

    if (status.status === 'COMPLETED' && status.output) {
      // Parse output and return image URLs
      // Format depends on RunPod endpoint response
      return {
        status: 'completed',
        images: status.output as Array<{ url: string; thumbnailUrl: string }>,
      };
    }

    return {
      status: status.status.toLowerCase(),
      images: [],
    };
  }
}

