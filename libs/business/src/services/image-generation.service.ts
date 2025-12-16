import type { GenerationJobsRepository, NewGenerationJobRow } from '@ryla/data';

export interface RunPodJobStatus {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | string;
  output?: unknown;
  error?: string;
}

export interface RunPodJobRunner {
  submitBaseImages(input: {
    prompt: string;
    nsfw: boolean;
    seed?: number;
    useZImage?: boolean;
  }): Promise<string>; // returns externalJobId

  submitFaceSwap(input: {
    baseImageUrl: string;
    prompt: string;
    nsfw: boolean;
    seed?: number;
  }): Promise<string>;

  submitCharacterSheet(input: {
    baseImageUrl: string;
    nsfw: boolean;
    angles?: string[];
  }): Promise<string>;

  getJobStatus(jobId: string): Promise<RunPodJobStatus>;
}

export interface WizardAppearanceInput {
  gender: 'female' | 'male';
  style: 'realistic' | 'anime';
  ethnicity: string;
  age: number;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  breastSize?: string;
}

export interface WizardIdentityInput {
  defaultOutfit: string;
  archetype: string;
  personalityTraits: string[];
  bio?: string;
}

export interface StartBaseImagesInput {
  userId: string; // uuid
  characterId?: string; // uuid
  appearance: WizardAppearanceInput;
  identity: WizardIdentityInput;
  nsfwEnabled: boolean;
  seed?: number;
  useZImage?: boolean;
}

export class ImageGenerationService {
  constructor(
    private readonly generationJobsRepo: GenerationJobsRepository,
    private readonly runpod: RunPodJobRunner
  ) {}

  async startBaseImages(input: StartBaseImagesInput) {
    const prompt = this.buildPrompt(input.appearance, input.identity);
    const negativePrompt = this.buildNegativePrompt();

    const job = await this.generationJobsRepo.createJob({
      userId: input.userId,
      characterId: input.characterId,
      type: 'character_generation',
      status: 'queued',
      input: {
        prompt,
        negativePrompt,
        nsfw: input.nsfwEnabled,
        seed: input.seed?.toString(),
        qualityMode: 'draft',
        imageCount: 3,
      },
      imageCount: 3,
      completedCount: 0,
    });

    const externalJobId = await this.runpod.submitBaseImages({
      prompt,
      nsfw: input.nsfwEnabled,
      seed: input.seed,
      useZImage: input.useZImage,
    });

    const updated = await this.generationJobsRepo.updateById(job.id, {
      externalJobId,
      startedAt: new Date(),
    });

    return {
      jobId: updated.id,
      externalJobId: updated.externalJobId,
      prompt,
      negativePrompt,
    };
  }

  async startFaceSwap(input: {
    userId: string;
    characterId?: string;
    baseImageUrl: string;
    prompt: string;
    nsfw: boolean;
    seed?: number;
  }) {
    const job = await this.generationJobsRepo.createJob({
      userId: input.userId,
      characterId: input.characterId,
      type: 'image_generation',
      status: 'queued',
      input: {
        prompt: input.prompt,
        nsfw: input.nsfw,
        seed: input.seed?.toString(),
      },
      imageCount: 1,
      completedCount: 0,
    });

    const externalJobId = await this.runpod.submitFaceSwap({
      baseImageUrl: input.baseImageUrl,
      prompt: input.prompt,
      nsfw: input.nsfw,
      seed: input.seed,
    });

    const updated = await this.generationJobsRepo.updateById(job.id, {
      externalJobId,
      startedAt: new Date(),
    });

    return { jobId: updated.id, externalJobId: updated.externalJobId };
  }

  async startCharacterSheet(input: {
    userId: string;
    characterId?: string;
    baseImageUrl: string;
    nsfw: boolean;
    angles?: string[];
  }) {
    const job = await this.generationJobsRepo.createJob({
      userId: input.userId,
      characterId: input.characterId,
      type: 'character_generation',
      status: 'queued',
      input: {
        nsfw: input.nsfw,
        imageCount: 10,
      },
      imageCount: 10,
      completedCount: 0,
    });

    const externalJobId = await this.runpod.submitCharacterSheet({
      baseImageUrl: input.baseImageUrl,
      nsfw: input.nsfw,
      angles: input.angles,
    });

    const updated = await this.generationJobsRepo.updateById(job.id, {
      externalJobId,
      startedAt: new Date(),
    });

    return { jobId: updated.id, externalJobId: updated.externalJobId };
  }

  async syncJobStatus(jobId: string) {
    const job = await this.generationJobsRepo.getById(jobId);
    if (!job) {
      return null;
    }
    if (!job.externalJobId) {
      return job;
    }

    const status = await this.runpod.getJobStatus(job.externalJobId);
    const mapped = this.mapRunPodStatus(status.status);

    // Only write output/error when available
    const patch: Partial<NewGenerationJobRow> = {
      status: mapped,
    };

    if (status.error) patch.error = status.error;
    if (status.output) patch.output = status.output;

    if (mapped === 'completed' || mapped === 'failed' || mapped === 'cancelled') {
      patch.completedAt = new Date();
    }

    const updated = await this.generationJobsRepo.updateById(jobId, patch);
    return updated;
  }

  private mapRunPodStatus(runpodStatus: string): NonNullable<NewGenerationJobRow['status']> {
    switch (runpodStatus) {
      case 'IN_QUEUE':
        return 'queued';
      case 'IN_PROGRESS':
        return 'processing';
      case 'COMPLETED':
        return 'completed';
      case 'FAILED':
        return 'failed';
      default:
        return 'processing';
    }
  }

  private buildPrompt(appearance: WizardAppearanceInput, identity: WizardIdentityInput) {
    const style = appearance.style === 'realistic' ? 'Photo' : 'Anime illustration';
    const gender = appearance.gender === 'female' ? 'woman' : 'man';
    const hair = `${appearance.hairColor} ${appearance.hairStyle} hair`;
    const eyes = `${appearance.eyeColor} eyes`;
    const body = `${appearance.bodyType} body type`;

    let prompt = `${style} of a ${appearance.age} year old ${appearance.ethnicity} ${gender}, `;
    prompt += `${hair}, ${eyes}, ${body}, `;
    prompt += `wearing ${identity.defaultOutfit}, `;
    prompt += `professional photography, high quality, detailed, `;
    prompt += `8k, best quality, masterpiece`;

    if (identity.archetype) prompt += `, ${identity.archetype} style`;
    if (identity.personalityTraits?.length) {
      prompt += `, ${identity.personalityTraits.join(', ')}`;
    }

    return prompt;
  }

  private buildNegativePrompt() {
    return `deformed, blurry, bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, poorly drawn hands, bad fingers, extra fingers, missing fingers, low quality, worst quality, jpeg artifacts, watermark, signature`;
  }
}


