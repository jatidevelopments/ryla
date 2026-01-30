/**
 * LoRA Training Service
 *
 * Service for managing LoRA training jobs on Modal.com.
 * Uses the Python trigger script to communicate with Modal's function API.
 *
 * @module @ryla/business
 */

import { spawn } from 'child_process';
import * as path from 'path';
import type { LoraModelsRepository, LoraModelRow } from '@ryla/data';

export interface LoraTrainingConfig {
  maxTrainSteps?: number;
  rank?: number;
  resolution?: number;
  learningRate?: number;
  trainBatchSize?: number;
  gradientAccumulationSteps?: number;
  seed?: number;
}

export interface StartTrainingRequest {
  characterId: string;
  userId: string;
  triggerWord: string;
  imageUrls: string[];
  config?: LoraTrainingConfig;
}

export interface TrainingJobResult {
  status: 'started' | 'training' | 'completed' | 'error';
  jobId?: string;
  loraModelId?: string;
  callId?: string;
  characterId?: string;
  triggerWord?: string;
  imageCount?: number;
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
   * @param request Training request with character info and images
   * @returns Job result with job_id and call_id for tracking
   */
  async startTraining(
    request: StartTrainingRequest
  ): Promise<TrainingJobResult> {
    const { characterId, userId, triggerWord, imageUrls, config } = request;

    // Validate input
    if (imageUrls.length < 3) {
      return {
        status: 'error',
        error: 'At least 3 images are required for LoRA training',
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
        baseModel: 'black-forest-labs/FLUX.1-dev',
        externalProvider: 'modal',
        config: {
          baseModel: 'black-forest-labs/FLUX.1-dev',
          triggerWord,
          steps: config?.maxTrainSteps ?? 500,
          learningRate: config?.learningRate ?? 0.0001,
          resolution: config?.resolution ?? 512,
          trainingImages: imageUrls,
        },
      });
    }

    // Convert config to snake_case for Python
    const pythonConfig = config
      ? {
          max_train_steps: config.maxTrainSteps,
          rank: config.rank,
          resolution: config.resolution,
          learning_rate: config.learningRate,
          train_batch_size: config.trainBatchSize,
          gradient_accumulation_steps: config.gradientAccumulationSteps,
          seed: config.seed,
        }
      : {};

    // Remove undefined values
    Object.keys(pythonConfig).forEach((key) => {
      if (pythonConfig[key as keyof typeof pythonConfig] === undefined) {
        delete pythonConfig[key as keyof typeof pythonConfig];
      }
    });

    try {
      const result = await this.runPythonScript('start', [
        `--character-id=${characterId}`,
        `--trigger-word=${triggerWord}`,
        `--image-urls=${JSON.stringify(imageUrls)}`,
        `--config=${JSON.stringify(pythonConfig)}`,
      ]);

      if (result.status === 'started' && result.job_id && result.call_id) {
        // Update database record with job info
        if (this.repository && loraModel) {
          await this.repository.updateById(loraModel.id, {
            externalJobId: result.call_id as string,
            status: 'training',
            trainingStartedAt: new Date(),
          });
        }

        // Cache the job info (fallback or supplement)
        this.jobCache.set(result.job_id as string, {
          callId: result.call_id as string,
          characterId: result.character_id as string,
          loraModelId: loraModel?.id,
          startedAt: new Date(),
        });
      } else if (this.repository && loraModel) {
        // Training failed to start - mark as failed
        await this.repository.markTrainingFailed(
          loraModel.id,
          (result.error as string) || 'Failed to start training'
        );
      }

      const converted = this.convertResult(result);
      if (loraModel) {
        converted.loraModelId = loraModel.id;
      }
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
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
      status: result.status as TrainingJobResult['status'],
    };

    if (result.job_id) converted.jobId = result.job_id as string;
    if (result.call_id) converted.callId = result.call_id as string;
    if (result.character_id)
      converted.characterId = result.character_id as string;
    if (result.trigger_word)
      converted.triggerWord = result.trigger_word as string;
    if (result.image_count) converted.imageCount = result.image_count as number;
    if (result.error) converted.error = result.error as string;
    if (result.message) converted.message = result.message as string;

    if (result.result && typeof result.result === 'object') {
      const r = result.result as Record<string, unknown>;
      converted.result = {
        loraPath: r.lora_path as string,
        loraFilename: r.lora_filename as string,
        trainingTimeSeconds: r.training_time_seconds as number,
        trainingSteps: r.training_steps as number,
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
