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
  triggerWord: string;
  imageUrls: string[];
  config?: LoraTrainingConfig;
}

export interface TrainingJobResult {
  status: 'started' | 'training' | 'completed' | 'error';
  jobId?: string;
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
 */
export class LoraTrainingService {
  private scriptPath: string;
  private jobCache: Map<
    string,
    { callId: string; characterId: string; startedAt: Date }
  > = new Map();

  constructor() {
    // Path to the Python trigger script
    this.scriptPath = path.resolve(
      __dirname,
      '../../../../apps/modal/scripts/trigger-lora-training.py'
    );
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
    const { characterId, triggerWord, imageUrls, config } = request;

    // Validate input
    if (imageUrls.length < 3) {
      return {
        status: 'error',
        error: 'At least 3 images are required for LoRA training',
      };
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
        // Cache the job info
        this.jobCache.set(result.job_id, {
          callId: result.call_id,
          characterId: result.character_id,
          startedAt: new Date(),
        });
      }

      return this.convertResult(result);
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check the status of a training job
   *
   * @param jobIdOrCallId Either the job_id or call_id
   * @returns Current job status
   */
  async getTrainingStatus(jobIdOrCallId: string): Promise<TrainingJobResult> {
    // Try to get call_id from cache if job_id was provided
    let callId = jobIdOrCallId;
    const cachedJob = this.jobCache.get(jobIdOrCallId);
    if (cachedJob) {
      callId = cachedJob.callId;
    }

    try {
      const result = await this.runPythonScript('status', [
        `--call-id=${callId}`,
      ]);

      return this.convertResult(result);
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
