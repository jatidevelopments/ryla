/**
 * LoRA Training Service
 *
 * Service for managing LoRA training jobs on Modal.com.
 * Uses the Python trigger script to communicate with Modal's function API.
 *
 * Supports multiple model types:
 * - flux: Flux LoRA for image generation (default)
 * - wan: Wan 2.6 LoRA for video generation
 * - wan-14b: Wan 2.6 14B LoRA for high-quality video
 * - qwen: Qwen-Image LoRA for image generation
 *
 * @module @ryla/business
 */

import { spawn } from 'child_process';
import * as path from 'path';
import type { LoraModelsRepository, LoraModelRow } from '@ryla/data';

/**
 * Supported LoRA model types for training
 */
export type LoraModelType = 'flux' | 'wan' | 'wan-14b' | 'qwen';

/**
 * Model type configuration
 */
export const LORA_MODEL_CONFIG: Record<
  LoraModelType,
  {
    baseModel: string;
    mediaType: 'images' | 'videos';
    minMedia: number;
    description: string;
  }
> = {
  flux: {
    baseModel: 'black-forest-labs/FLUX.1-dev',
    mediaType: 'images',
    minMedia: 3,
    description: 'Flux LoRA for high-quality image generation',
  },
  wan: {
    baseModel: 'Wan-AI/Wan2.1-T2V-1.3B-Diffusers',
    mediaType: 'videos',
    minMedia: 3,
    description: 'Wan 2.6 LoRA for video generation (1.3B model)',
  },
  'wan-14b': {
    baseModel: 'Wan-AI/Wan2.1-T2V-14B-Diffusers',
    mediaType: 'videos',
    minMedia: 3,
    description: 'Wan 2.6 LoRA for high-quality video generation (14B model)',
  },
  qwen: {
    baseModel: 'Qwen/Qwen2.5-VL-7B',
    mediaType: 'images',
    minMedia: 5,
    description: 'Qwen-Image LoRA for image generation',
  },
};

export interface LoraTrainingConfig {
  maxTrainSteps?: number;
  rank?: number;
  resolution?: number;
  learningRate?: number;
  trainBatchSize?: number;
  gradientAccumulationSteps?: number;
  seed?: number;
  /** Model size for Wan training: "1.3B" or "14B" */
  modelSize?: string;
  /** Number of frames for video training */
  numFrames?: number;
}

export interface StartTrainingRequest {
  characterId: string;
  userId: string;
  triggerWord: string;
  /** Image URLs for flux/qwen, Video URLs for wan */
  mediaUrls: string[];
  /** Model type for training */
  modelType?: LoraModelType;
  config?: LoraTrainingConfig;
  /** Credits charged for this training (for refund tracking) */
  creditsCharged?: number;
}

/**
 * @deprecated Use StartTrainingRequest with mediaUrls instead
 */
export interface LegacyStartTrainingRequest {
  characterId: string;
  userId: string;
  triggerWord: string;
  imageUrls: string[];
  config?: LoraTrainingConfig;
  creditsCharged?: number;
}

export interface TrainingJobResult {
  status: 'started' | 'training' | 'completed' | 'error';
  jobId?: string;
  loraModelId?: string;
  callId?: string;
  characterId?: string;
  triggerWord?: string;
  /** Number of media items (images or videos) */
  mediaCount?: number;
  /** @deprecated Use mediaCount */
  imageCount?: number;
  /** Model type used for training */
  modelType?: LoraModelType;
  result?: {
    loraPath: string;
    loraFilename: string;
    trainingTimeSeconds: number;
    trainingSteps: number;
  };
  error?: string;
  message?: string;
}

/**
 * LoRA Training Service
 *
 * Manages LoRA training jobs using Modal.com's serverless infrastructure.
 * Optionally persists to database via LoraModelsRepository.
 */
export class LoraTrainingService {
  private scriptPath: string;
  private repository: LoraModelsRepository | null = null;

  // Fallback in-memory cache when no repository is provided
  private jobCache: Map<
    string,
    {
      callId: string;
      characterId: string;
      loraModelId?: string;
      startedAt: Date;
    }
  > = new Map();

  constructor(repository?: LoraModelsRepository) {
    // Path to the Python trigger script
    this.scriptPath = path.resolve(
      __dirname,
      '../../../../apps/modal/scripts/trigger-lora-training.py'
    );
    this.repository = repository ?? null;
  }

  /**
   * Set the repository (for dependency injection)
   */
  setRepository(repository: LoraModelsRepository): void {
    this.repository = repository;
  }

  /**
   * Start a LoRA training job
   *
   * @param request Training request with character info and media
   * @returns Job result with job_id and call_id for tracking
   */
  async startTraining(
    request: StartTrainingRequest | LegacyStartTrainingRequest
  ): Promise<TrainingJobResult> {
    // Handle legacy request format
    const mediaUrls =
      'mediaUrls' in request ? request.mediaUrls : request.imageUrls;
    const modelType: LoraModelType =
      'modelType' in request ? (request.modelType ?? 'flux') : 'flux';

    const { characterId, userId, triggerWord, config, creditsCharged } =
      request;

    const modelConfig = LORA_MODEL_CONFIG[modelType];

    // Validate input
    if (mediaUrls.length < modelConfig.minMedia) {
      return {
        status: 'error',
        modelType,
        error: `At least ${modelConfig.minMedia} ${modelConfig.mediaType} are required for ${modelType} LoRA training`,
      };
    }

    // Create database record if repository is available
    let loraModel: LoraModelRow | undefined;
    if (this.repository) {
      loraModel = await this.repository.create({
        characterId,
        userId,
        type: 'face',
        status: 'pending',
        triggerWord,
        baseModel: modelConfig.baseModel,
        trainingModel: modelType,
        externalProvider: 'modal',
        creditsCharged: creditsCharged ?? null,
        config: {
          baseModel: modelConfig.baseModel,
          triggerWord,
          steps: config?.maxTrainSteps ?? 500,
          learningRate: config?.learningRate ?? 0.0001,
          resolution: config?.resolution ?? 512,
          trainingImages: mediaUrls,
        },
      });
    }

    // Convert config to snake_case for Python
    const pythonConfig: Record<string, unknown> = config
      ? {
          max_train_steps: config.maxTrainSteps,
          rank: config.rank,
          resolution: config.resolution,
          learning_rate: config.learningRate,
          train_batch_size: config.trainBatchSize,
          gradient_accumulation_steps: config.gradientAccumulationSteps,
          seed: config.seed,
          model_size: config.modelSize,
          num_frames: config.numFrames,
        }
      : {};

    // Remove undefined values
    Object.keys(pythonConfig).forEach((key) => {
      if (pythonConfig[key] === undefined) {
        delete pythonConfig[key];
      }
    });

    try {
      const result = await this.runPythonScript('start', [
        `--model-type=${modelType}`,
        `--character-id=${characterId}`,
        `--trigger-word=${triggerWord}`,
        `--media-urls=${JSON.stringify(mediaUrls)}`,
        `--config=${JSON.stringify(pythonConfig)}`,
      ]);

      if (
        result['status'] === 'started' &&
        result['job_id'] &&
        result['call_id']
      ) {
        // Update database record with job info
        if (this.repository && loraModel) {
          await this.repository.updateById(loraModel.id, {
            externalJobId: result['call_id'] as string,
            status: 'training',
            trainingStartedAt: new Date(),
          });
        }

        // Cache the job info (fallback or supplement)
        this.jobCache.set(result['job_id'] as string, {
          callId: result['call_id'] as string,
          characterId: result['character_id'] as string,
          loraModelId: loraModel?.id,
          startedAt: new Date(),
        });
      } else if (this.repository && loraModel) {
        // Training failed to start - mark as failed
        await this.repository.markTrainingFailed(
          loraModel.id,
          (result['error'] as string) || 'Failed to start training'
        );
      }

      const converted = this.convertResult(result);
      if (loraModel) {
        converted.loraModelId = loraModel.id;
      }
      converted.modelType = modelType;
      return converted;
    } catch (error) {
      // Mark as failed in database
      if (this.repository && loraModel) {
        await this.repository.markTrainingFailed(
          loraModel.id,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      return {
        status: 'error',
        loraModelId: loraModel?.id,
        modelType,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get available model types and their requirements
   */
  getModelTypes(): typeof LORA_MODEL_CONFIG {
    return LORA_MODEL_CONFIG;
  }

  /**
   * Check the status of a training job
   *
   * @param jobIdOrCallId Either the job_id, call_id, or loraModelId
   * @returns Current job status
   */
  async getTrainingStatus(jobIdOrCallId: string): Promise<TrainingJobResult> {
    // Try to get call_id from cache if job_id was provided
    let callId = jobIdOrCallId;
    let loraModelId: string | undefined;
    const cachedJob = this.jobCache.get(jobIdOrCallId);

    if (cachedJob) {
      callId = cachedJob.callId;
      loraModelId = cachedJob.loraModelId;
    } else if (this.repository) {
      // Try to find by loraModel ID
      const loraModel = await this.repository.getById(jobIdOrCallId);
      if (loraModel && loraModel.externalJobId) {
        callId = loraModel.externalJobId;
        loraModelId = loraModel.id;
      } else {
        // Try to find by external job ID
        const byExternalId = await this.repository.getByExternalJobId(
          jobIdOrCallId
        );
        if (byExternalId) {
          callId = byExternalId.externalJobId!;
          loraModelId = byExternalId.id;
        }
      }
    }

    try {
      const result = await this.runPythonScript('status', [
        `--call-id=${callId}`,
      ]);

      const converted = this.convertResult(result);

      // Update database if training completed
      if (
        this.repository &&
        loraModelId &&
        converted.status === 'completed' &&
        converted.result
      ) {
        await this.repository.markTrainingCompleted(loraModelId, {
          modelPath: converted.result.loraPath,
          trainingDurationMs: converted.result.trainingTimeSeconds * 1000,
          trainingSteps: converted.result.trainingSteps,
        });
      }

      converted.loraModelId = loraModelId;
      return converted;
    } catch (error) {
      return {
        status: 'error',
        loraModelId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get LoRA model for a character
   */
  async getLoraForCharacter(characterId: string): Promise<LoraModelRow | null> {
    if (!this.repository) {
      return null;
    }
    const model = await this.repository.getReadyByCharacterId(characterId);
    return model ?? null;
  }

  /**
   * Get all LoRA models for a user
   */
  async getLorasForUser(userId: string): Promise<LoraModelRow[]> {
    if (!this.repository) {
      return [];
    }
    return this.repository.getByUserId(userId);
  }

  /**
   * Get a LoRA model by ID
   */
  async getLoraById(loraModelId: string): Promise<LoraModelRow | null> {
    if (!this.repository) {
      return null;
    }
    const model = await this.repository.getById(loraModelId);
    return model ?? null;
  }

  /**
   * Mark a LoRA as failed with refund info
   * Called after credits have been refunded externally
   */
  async markFailedWithRefund(
    loraModelId: string,
    errorMessage: string,
    creditsRefunded: number
  ): Promise<LoraModelRow | null> {
    if (!this.repository) {
      return null;
    }
    const model = await this.repository.markTrainingFailedWithRefund(
      loraModelId,
      errorMessage,
      creditsRefunded
    );
    return model ?? null;
  }

  /**
   * Check if a LoRA needs refund (failed with credits charged but not refunded)
   */
  async needsRefund(loraModelId: string): Promise<{
    needsRefund: boolean;
    creditsToRefund: number;
    userId?: string;
  }> {
    if (!this.repository) {
      return { needsRefund: false, creditsToRefund: 0 };
    }
    const lora = await this.repository.getById(loraModelId);
    if (!lora) {
      return { needsRefund: false, creditsToRefund: 0 };
    }

    const needsRefund =
      lora.status === 'failed' &&
      lora.creditsCharged != null &&
      lora.creditsCharged > 0 &&
      lora.creditsRefunded == null;

    return {
      needsRefund,
      creditsToRefund: needsRefund ? lora.creditsCharged! : 0,
      userId: lora.userId,
    };
  }

  /**
   * Get all tracked training jobs
   */
  getTrackedJobs(): Array<{
    jobId: string;
    callId: string;
    characterId: string;
    startedAt: Date;
  }> {
    return Array.from(this.jobCache.entries()).map(([jobId, info]) => ({
      jobId,
      ...info,
    }));
  }

  /**
   * Run the Python trigger script
   */
  private runPythonScript(
    command: string,
    args: string[]
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const process = spawn('python3', [this.scriptPath, command, ...args]);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      process.on('close', (code: number) => {
        if (code !== 0) {
          try {
            // Try to parse error from stdout (script outputs JSON even on error)
            const result = JSON.parse(stdout.trim());
            resolve(result);
          } catch {
            reject(new Error(stderr || `Process exited with code ${code}`));
          }
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch {
          reject(new Error(`Failed to parse output: ${stdout}`));
        }
      });

      process.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  /**
   * Convert Python snake_case result to TypeScript camelCase
   */
  private convertResult(result: Record<string, unknown>): TrainingJobResult {
    const converted: TrainingJobResult = {
      status: result['status'] as TrainingJobResult['status'],
    };

    if (result['job_id']) converted.jobId = result['job_id'] as string;
    if (result['call_id']) converted.callId = result['call_id'] as string;
    if (result['character_id'])
      converted.characterId = result['character_id'] as string;
    if (result['trigger_word'])
      converted.triggerWord = result['trigger_word'] as string;
    if (result['model_type'])
      converted.modelType = result['model_type'] as LoraModelType;

    // Handle both media_count (new) and image_count (legacy)
    if (result['media_count']) {
      converted.mediaCount = result['media_count'] as number;
      converted.imageCount = result['media_count'] as number; // backward compat
    } else if (result['image_count']) {
      converted.imageCount = result['image_count'] as number;
      converted.mediaCount = result['image_count'] as number;
    }

    if (result['error']) converted.error = result['error'] as string;
    if (result['message']) converted.message = result['message'] as string;

    if (result['result'] && typeof result['result'] === 'object') {
      const r = result['result'] as Record<string, unknown>;
      converted.result = {
        loraPath: r['lora_path'] as string,
        loraFilename: r['lora_filename'] as string,
        trainingTimeSeconds: r['training_time_seconds'] as number,
        trainingSteps: r['training_steps'] as number,
      };
    }

    return converted;
  }
}

/**
 * Singleton instance
 */
let loraTrainingServiceInstance: LoraTrainingService | null = null;

export function getLoraTrainingService(): LoraTrainingService {
  if (!loraTrainingServiceInstance) {
    loraTrainingServiceInstance = new LoraTrainingService();
  }
  return loraTrainingServiceInstance;
}
