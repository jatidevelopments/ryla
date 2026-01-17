/**
 * ComfyUI Job Runner
 *
 * Implementation of RunPodJobRunner that uses a dedicated ComfyUI pod
 * instead of serverless endpoints. Provides instant response (no cold starts).
 *
 * Uses the workflow factory for building optimized ComfyUI workflows:
 * - z-image-danrisi: Optimized workflow with custom samplers (preferred)
 * - z-image-simple: Fallback using built-in ComfyUI nodes
 *
 * @see ADR-003: Use Dedicated ComfyUI Pod Over Serverless
 */

import { RunPodJobRunner, RunPodJobStatus } from './image-generation.service';
import { ComfyUIPodClient, ComfyUIJobResult } from './comfyui-pod-client';
import {
  buildWorkflow,
  getRecommendedWorkflow,
  WorkflowId,
} from '../workflows';
import { BuiltPrompt } from '../prompts';
import type { ComfyUIJobPersistenceService } from './comfyui-job-persistence.service';
import type { JobState } from '../interfaces/comfyui-job-state.interface';

interface PendingJob {
  promptId: string;
  type: 'base_image' | 'face_swap' | 'character_sheet';
  workflow: WorkflowId;
  startedAt: Date;
}

export interface BaseImageInput {
  prompt: string;
  negativePrompt?: string;
  nsfw: boolean;
  seed?: number;
  width?: number;
  height?: number;
  steps?: number;
  cfg?: number;
  workflowId?: WorkflowId;
}

export interface ComfyUIJobRunnerConfig {
  comfyui: ComfyUIPodClient;
  persistenceService?: ComfyUIJobPersistenceService;
}

export class ComfyUIJobRunner implements RunPodJobRunner {
  private comfyui: ComfyUIPodClient;
  private pendingJobs: Map<string, PendingJob> = new Map();
  private availableNodes: string[] = [];
  private persistenceService?: ComfyUIJobPersistenceService;

  constructor(config: ComfyUIJobRunnerConfig | ComfyUIPodClient) {
    // Support both old (ComfyUIPodClient) and new (config object) constructor
    if (config instanceof ComfyUIPodClient) {
      this.comfyui = config;
    } else {
      this.comfyui = config.comfyui;
      this.persistenceService = config.persistenceService;
    }
    this.recoverJobs();
  }

  /**
   * Initialize runner by fetching available nodes from ComfyUI
   * Call this once on startup for optimal workflow selection
   */
  async initialize(): Promise<void> {
    try {
      this.availableNodes = await this.comfyui.getAvailableNodes();
      console.log(`ComfyUIJobRunner initialized with ${this.availableNodes.length} available nodes`);
    } catch (error) {
      console.warn('Failed to fetch available nodes, using default workflow selection');
      this.availableNodes = [];
    }
  }

  /**
   * Submit base image generation job using the workflow factory
   */
  async submitBaseImages(input: {
    prompt: string;
    nsfw: boolean;
    seed?: number;
    useZImage?: boolean;
  }): Promise<string> {
    // Build negative prompt based on NSFW setting
    const negativePrompt = input.nsfw
      ? 'deformed, blurry, bad anatomy, ugly, low quality'
      : 'deformed, blurry, bad anatomy, ugly, low quality, nsfw, nude, naked';

    // Use the new extended method with workflow factory
    return this.submitBaseImageWithWorkflow({
      prompt: input.prompt,
      negativePrompt,
      nsfw: input.nsfw,
      seed: input.seed,
      width: 1024,
      height: 1024,
    });
  }

  /**
   * Submit base image with full workflow control
   * Uses the workflow factory for building optimized workflows
   * @param input - Base image generation input
   * @param onProgress - Optional progress callback (0-100) for real-time updates
   * @returns Prompt ID for tracking
   */
  async submitBaseImageWithWorkflow(
    input: BaseImageInput,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // Select the best workflow based on available nodes
    const workflowId = input.workflowId || getRecommendedWorkflow(this.availableNodes);

    // Build negative prompt based on NSFW setting if not provided
    const negativePrompt = input.negativePrompt ?? (input.nsfw
      ? 'deformed, blurry, bad anatomy, ugly, low quality'
      : 'deformed, blurry, bad anatomy, ugly, low quality, nsfw, nude, naked');

    // Build workflow using the factory
    const workflow = buildWorkflow(workflowId, {
      prompt: input.prompt,
      negativePrompt,
      width: input.width ?? 1024,
      height: input.height ?? 1024,
      steps: input.steps,
      cfg: input.cfg,
      seed: input.seed ?? Math.floor(Math.random() * 1000000),
      filenamePrefix: 'ryla_gen',
    });

    // If progress callback provided, use executeWorkflow (supports WebSocket)
    // Otherwise, use queueWorkflow (async, no progress tracking)
    if (onProgress) {
      // Execute with progress tracking (uses WebSocket if available)
      const result = await this.comfyui.executeWorkflow(workflow, 2000, onProgress);
      const promptId = result.promptId;

      this.pendingJobs.set(promptId, {
        promptId,
        type: 'base_image',
        workflow: workflowId,
        startedAt: new Date(),
      });

      console.log(`Job ${promptId} completed with workflow: ${workflowId}`);
      return promptId;
    }

    // Default: queue workflow (async, no progress tracking)
    const promptId = await this.comfyui.queueWorkflow(workflow);

    this.pendingJobs.set(promptId, {
      promptId,
      type: 'base_image',
      workflow: workflowId,
      startedAt: new Date(),
    });

    // Save job state to Redis if persistence service available
    if (this.persistenceService) {
      const serverUrl = this.comfyui.getBaseUrl();
      await this.persistenceService.saveJobState({
        promptId,
        type: 'image_generation',
        userId: '', // Will be set by caller if needed
        status: 'queued',
        progress: 0,
        startedAt: Date.now(),
        serverUrl,
      });
    }

    console.log(`Job ${promptId} queued with workflow: ${workflowId}`);
    return promptId;
  }

  /**
   * Submit base image using a BuiltPrompt from the prompt library
   */
  async submitFromBuiltPrompt(builtPrompt: BuiltPrompt, options?: {
    seed?: number;
    nsfw?: boolean;
    workflowId?: WorkflowId;
  }): Promise<string> {
    const workflowId = options?.workflowId ||
      (builtPrompt.recommended.workflow as WorkflowId) ||
      getRecommendedWorkflow(this.availableNodes);

    return this.submitBaseImageWithWorkflow({
      prompt: builtPrompt.prompt,
      negativePrompt: builtPrompt.negativePrompt,
      nsfw: options?.nsfw ?? false,
      seed: options?.seed,
      workflowId,
    });
  }

  /**
   * Submit face swap job
   * TODO: Implement face swap workflow when IP-Adapter/PuLID models are ready
   */
  async submitFaceSwap(input: {
    baseImageUrl: string;
    prompt: string;
    nsfw: boolean;
    seed?: number;
  }): Promise<string> {
    // For now, use base image generation with the prompt
    // Face swap requires IP-Adapter FaceID which needs separate workflow
    console.warn('Face swap workflow not yet implemented, using base image generation');

    return this.submitBaseImageWithWorkflow({
      prompt: input.prompt + ', portrait, face close-up',
      nsfw: input.nsfw,
      seed: input.seed,
    });
  }

  /**
   * Submit character sheet generation job
   * TODO: Implement multi-angle generation with ControlNet when ready
   */
  async submitCharacterSheet(input: {
    baseImageUrl: string;
    nsfw: boolean;
    angles?: string[];
  }): Promise<string> {
    // For now, generate a single high-quality portrait
    // Full character sheet requires PuLID + ControlNet which needs separate workflow
    console.warn('Character sheet workflow not yet implemented, using single portrait generation');

    return this.submitBaseImageWithWorkflow({
      prompt: 'Character portrait, professional photography, high quality, detailed, studio lighting',
      nsfw: input.nsfw,
    });
  }

  /**
   * Get job status from ComfyUI
   */
  async getJobStatus(jobId: string): Promise<RunPodJobStatus> {
    try {
      const result = await this.comfyui.getJobStatus(jobId);
      return this.mapComfyUIStatus(result);
    } catch (error) {
      return {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private mapComfyUIStatus(result: ComfyUIJobResult): RunPodJobStatus {
    switch (result.status) {
      case 'queued':
        return { status: 'IN_QUEUE' };
      case 'processing':
        return { status: 'IN_PROGRESS' };
      case 'completed':
        return {
          status: 'COMPLETED',
          output: {
            images: result.images,
            prompt_id: result.promptId,
          },
        };
      case 'failed':
        return {
          status: 'FAILED',
          error: result.error,
        };
      default:
        return { status: 'IN_PROGRESS' };
    }
  }

  /**
   * Health check - verify ComfyUI pod is responsive
   */
  async healthCheck(): Promise<boolean> {
    return this.comfyui.healthCheck();
  }

  /**
   * Get count of pending jobs
   */
  getPendingJobCount(): number {
    return this.pendingJobs.size;
  }

  /**
   * Clean up old pending jobs (older than 10 minutes)
   */
  cleanupStaleJobs(): number {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    let cleaned = 0;

    for (const [id, job] of this.pendingJobs.entries()) {
      if (job.startedAt < tenMinutesAgo) {
        this.pendingJobs.delete(id);
        // Also delete from Redis if persistence service available
        if (this.persistenceService) {
          this.persistenceService.deleteJobState(id).catch((error) => {
            console.warn(`Failed to delete job state for ${id}: ${error}`);
          });
        }
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Recover jobs from Redis on startup
   */
  private async recoverJobs(): Promise<void> {
    if (!this.persistenceService) {
      return;
    }

    try {
      const isAvailable = await this.persistenceService.isAvailable();
      if (!isAvailable) {
        console.warn('Redis not available, skipping job recovery');
        return;
      }

      const recoveredJobs = await this.persistenceService.recoverActiveJobs();
      console.log(`Recovered ${recoveredJobs.length} active jobs from Redis`);

      for (const jobState of recoveredJobs) {
        // Add to pending jobs
        // Map JobState types to PendingJob types (some JobState types like 'image_generation' map to 'base_image')
        let pendingType: 'base_image' | 'face_swap' | 'character_sheet' = 'base_image';
        if (jobState.type === 'face_swap') {
          pendingType = 'face_swap';
        } else if (jobState.type === 'character_sheet') {
          pendingType = 'character_sheet';
        }
        // 'base_image', 'image_generation', 'lora_training' all map to 'base_image'
        
        this.pendingJobs.set(jobState.promptId, {
          promptId: jobState.promptId,
          type: pendingType,
          workflow: 'z-image-simple', // Default workflow, will be updated when job resumes
          startedAt: new Date(jobState.startedAt),
        });

        // TODO: Reconnect WebSocket if EP-039 implemented
        // TODO: Resume progress tracking
      }
    } catch (error) {
      console.error(`Failed to recover jobs: ${error}`);
    }
  }

  /**
   * Update job progress in Redis
   */
  async updateJobProgress(promptId: string, progress: number): Promise<void> {
    if (this.persistenceService) {
      await this.persistenceService.updateJobState(promptId, {
        progress,
        status: 'processing',
      });
    }
  }

  /**
   * Mark job as completed in Redis
   */
  async markJobCompleted(promptId: string): Promise<void> {
    if (this.persistenceService) {
      await this.persistenceService.updateJobState(promptId, {
        status: 'completed',
        progress: 100,
      });
      // Delete after a short delay to allow final status checks
      setTimeout(() => {
        this.persistenceService!.deleteJobState(promptId).catch((error) => {
          console.warn(`Failed to delete completed job state for ${promptId}: ${error}`);
        });
      }, 60000); // Delete after 1 minute
    }
  }

  /**
   * Mark job as failed in Redis
   */
  async markJobFailed(promptId: string, error: string): Promise<void> {
    if (this.persistenceService) {
      await this.persistenceService.updateJobState(promptId, {
        status: 'failed',
      });
      // Delete after a short delay
      setTimeout(() => {
        this.persistenceService!.deleteJobState(promptId).catch((error) => {
          console.warn(`Failed to delete failed job state for ${promptId}: ${error}`);
        });
      }, 60000); // Delete after 1 minute
    }
  }
}

/**
 * Create ComfyUI Job Runner from environment variables
 * Expects COMFYUI_POD_URL to be set
 * Optionally uses Redis for job persistence if REDIS_URL or REDIS_HOST is set
 */
export async function createComfyUIJobRunner(): Promise<ComfyUIJobRunner> {
  const baseUrl = process.env['COMFYUI_POD_URL'];

  if (!baseUrl) {
    throw new Error('COMFYUI_POD_URL environment variable is required');
  }

  const client = new ComfyUIPodClient({ baseUrl });

  // Create persistence service if Redis is available
  let persistenceService;
  try {
    const { createComfyUIJobPersistenceService } = await import('./comfyui-job-persistence.service');
    persistenceService = createComfyUIJobPersistenceService();
    const isAvailable = await persistenceService.isAvailable();
    if (!isAvailable) {
      console.warn('Redis not available, job persistence disabled');
      persistenceService = undefined;
    }
  } catch (error) {
    console.warn('Failed to create job persistence service:', error);
    persistenceService = undefined;
  }

  return new ComfyUIJobRunner({
    comfyui: client,
    persistenceService,
  });
}

