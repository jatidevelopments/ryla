/**
 * Instrumented Modal Job Runner
 * 
 * Wraps ModalJobRunner with:
 * - Error boundaries for structured error handling
 * - Telemetry for performance tracking
 * - Metrics collection
 * 
 * Use this in production for better observability.
 */

import { ModalJobRunner, type ModalJobRunnerConfig } from './modal-job-runner';
import { createModalBoundary, type AIProviderBoundary } from '../boundaries/ai-provider-boundary';
import { telemetry, span } from '../telemetry/telemetry';
import { metrics, increment, observe } from '../telemetry/metrics';
import { isSuccess, type Result } from '@ryla/shared';
import type { RunPodJobRunner, RunPodJobStatus } from './image-generation.service';
import type { CategorizedError } from '../boundaries/error-types';

export interface InstrumentedModalConfig extends ModalJobRunnerConfig {
  /** Enable telemetry (default: true) */
  enableTelemetry?: boolean;
  /** Enable error boundary (default: true) */
  enableBoundary?: boolean;
  /** Maximum retries for transient errors */
  maxRetries?: number;
}

export class InstrumentedModalRunner implements RunPodJobRunner {
  private runner: ModalJobRunner;
  private boundary: AIProviderBoundary;
  private enableTelemetry: boolean;
  private enableBoundary: boolean;

  constructor(config: InstrumentedModalConfig) {
    this.runner = new ModalJobRunner(config);
    this.boundary = createModalBoundary({
      maxRetries: config.maxRetries ?? 3,
    });
    this.enableTelemetry = config.enableTelemetry ?? true;
    this.enableBoundary = config.enableBoundary ?? true;
  }

  /**
   * Execute an operation with instrumentation
   */
  private async instrumented<T>(
    operationName: string,
    operation: () => Promise<T>,
    attributes: Record<string, string | number | boolean | undefined> = {}
  ): Promise<T> {
    const fullName = `modal.${operationName}`;

    // Track metrics
    increment('modal.requests.total', 1, { operation: operationName });

    // Execute with telemetry
    const runWithTelemetry = async (): Promise<T> => {
      if (!this.enableTelemetry) {
        return operation();
      }

      return telemetry.span(fullName, attributes, operation);
    };

    // Execute with boundary
    if (!this.enableBoundary) {
      const startTime = Date.now();
      try {
        const result = await runWithTelemetry();
        observe('modal.latency', Date.now() - startTime, { operation: operationName, status: 'success' });
        increment('modal.requests.success', 1, { operation: operationName });
        return result;
      } catch (error) {
        observe('modal.latency', Date.now() - startTime, { operation: operationName, status: 'error' });
        increment('modal.requests.error', 1, { operation: operationName });
        throw error;
      }
    }

    const startTime = Date.now();
    const result = await this.boundary.run(runWithTelemetry);
    
    if (isSuccess(result)) {
      observe('modal.latency', Date.now() - startTime, { operation: operationName, status: 'success' });
      increment('modal.requests.success', 1, { operation: operationName });
      return result.data;
    }

    // Handle failure
    observe('modal.latency', Date.now() - startTime, { operation: operationName, status: 'error' });
    increment('modal.requests.error', 1, { 
      operation: operationName,
      error_category: result.error.category,
    });
    
    throw result.error.originalError;
  }

  // Implement RunPodJobRunner interface with instrumentation

  async submitBaseImages(input: {
    prompt: string;
    nsfw: boolean;
    seed?: number;
    useZImage?: boolean;
  }): Promise<string> {
    return this.instrumented(
      'submitBaseImages',
      () => this.runner.submitBaseImages(input),
      { nsfw: input.nsfw, hasZImage: Boolean(input.useZImage) }
    );
  }

  async submitFaceSwap(input: {
    baseImageUrl: string;
    prompt: string;
    nsfw: boolean;
    seed?: number;
  }): Promise<string> {
    return this.instrumented(
      'submitFaceSwap',
      () => this.runner.submitFaceSwap(input),
      { nsfw: input.nsfw }
    );
  }

  async submitCharacterSheet(input: {
    baseImageUrl: string;
    nsfw: boolean;
    angles?: string[];
  }): Promise<string> {
    return this.instrumented(
      'submitCharacterSheet',
      () => this.runner.submitCharacterSheet(input),
      { nsfw: input.nsfw, angleCount: input.angles?.length }
    );
  }

  async getJobStatus(jobId: string): Promise<RunPodJobStatus> {
    return this.instrumented(
      'getJobStatus',
      () => this.runner.getJobStatus(jobId),
      { jobId }
    );
  }

  async healthCheck(): Promise<boolean> {
    return this.instrumented(
      'healthCheck',
      () => this.runner.healthCheck(),
      {}
    );
  }

  // Forward all other methods with instrumentation
  
  async generateFluxLoRA(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    seed?: number;
    lora_id: string;
    lora_strength?: number;
  }): Promise<string> {
    return this.instrumented(
      'generateFluxLoRA',
      () => this.runner.generateFluxLoRA(input),
      { lora_id: input.lora_id, width: input.width, height: input.height }
    );
  }

  async generateQwenImage2512(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    seed?: number;
  }): Promise<string> {
    return this.instrumented(
      'generateQwenImage2512',
      () => this.runner.generateQwenImage2512(input),
      { width: input.width, height: input.height }
    );
  }

  async generateQwenImage2512Fast(input: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    seed?: number;
  }): Promise<string> {
    return this.instrumented(
      'generateQwenImage2512Fast',
      () => this.runner.generateQwenImage2512Fast(input),
      { width: input.width, height: input.height }
    );
  }

  async submitQwenFaceSwap(input: {
    referenceImageUrl: string;
    prompt: string;
    nsfw: boolean;
    aspectRatio?: '1:1' | '9:16' | '2:3';
    seed?: number;
    fast?: boolean;
  }): Promise<string> {
    return this.instrumented(
      'submitQwenFaceSwap',
      () => this.runner.submitQwenFaceSwap(input),
      { nsfw: input.nsfw, aspectRatio: input.aspectRatio, fast: input.fast }
    );
  }

  async generateFluxPuLID(input: {
    prompt: string;
    reference_image: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
    pulid_strength?: number;
    pulid_start?: number;
    pulid_end?: number;
    face_provider?: 'CPU' | 'GPU';
  }): Promise<string> {
    return this.instrumented(
      'generateFluxPuLID',
      () => this.runner.generateFluxPuLID(input),
      { width: input.width, height: input.height, pulid_strength: input.pulid_strength }
    );
  }

  /**
   * Get boundary metrics
   */
  getBoundaryMetrics() {
    return this.boundary.getMetrics();
  }

  /**
   * Reset boundary metrics
   */
  resetBoundaryMetrics(): void {
    this.boundary.resetMetrics();
  }
}

/**
 * Create an instrumented Modal runner
 */
export function createInstrumentedModalRunner(config: InstrumentedModalConfig): InstrumentedModalRunner {
  return new InstrumentedModalRunner(config);
}
