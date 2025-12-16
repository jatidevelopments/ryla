import { Injectable } from '@nestjs/common';
import { RunPodService } from '../../runpod/services/runpod.service';
import type { RunPodJobRunner, RunPodJobStatus } from '@ryla/business';

@Injectable()
export class RunPodJobRunnerAdapter implements RunPodJobRunner {
  constructor(private readonly runpodService: RunPodService) {}

  async submitBaseImages(input: {
    prompt: string;
    nsfw: boolean;
    seed?: number;
    useZImage?: boolean;
  }): Promise<string> {
    return this.runpodService.generateBaseImages({
      prompt: input.prompt,
      nsfw: input.nsfw,
      seed: input.seed,
      useZImage: input.useZImage,
    });
  }

  async submitFaceSwap(input: {
    baseImageUrl: string;
    prompt: string;
    nsfw: boolean;
    seed?: number;
  }): Promise<string> {
    return this.runpodService.generateFaceSwap({
      baseImageUrl: input.baseImageUrl,
      prompt: input.prompt,
      nsfw: input.nsfw,
      seed: input.seed,
    });
  }

  async submitCharacterSheet(input: {
    baseImageUrl: string;
    nsfw: boolean;
    angles?: string[];
  }): Promise<string> {
    return this.runpodService.generateCharacterSheet({
      baseImageUrl: input.baseImageUrl,
      angles: input.angles,
      nsfw: input.nsfw,
    });
  }

  async getJobStatus(jobId: string): Promise<RunPodJobStatus> {
    const job = await this.runpodService.getJobStatus(jobId);
    return {
      status: job.status,
      output: job.output,
      error: job.error,
    };
  }
}


