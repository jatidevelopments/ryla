/**
 * ComfyUI Job Runner Adapter
 *
 * NestJS injectable adapter for ComfyUIJobRunner.
 * Uses the dedicated ComfyUI pod for instant image generation (no cold starts).
 * Integrates with the workflow factory and prompt library.
 *
 * @see ADR-003: Use Dedicated ComfyUI Pod Over Serverless
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  ComfyUIPodClient,
  ComfyUIJobRunner,
  PromptBuilder,
  getRecommendedWorkflow,
  WorkflowId,
  CharacterDNA,
  BuiltPrompt,
} from '@ryla/business';
import type { RunPodJobRunner, RunPodJobStatus } from '@ryla/business';

export interface GenerateFromDNAInput {
  character: CharacterDNA;
  templateId?: string;
  scene?: string;
  outfit?: string;
  lighting?: string;
  expression?: string;
  nsfw?: boolean;
  seed?: number;
  workflowId?: WorkflowId;
}

@Injectable()
export class ComfyUIJobRunnerAdapter implements RunPodJobRunner, OnModuleInit {
  private readonly logger = new Logger(ComfyUIJobRunnerAdapter.name);
  private client: ComfyUIPodClient | null = null;
  private runner: ComfyUIJobRunner | null = null;
  private availableNodes: string[] = [];
  private isInitialized = false;

  async onModuleInit() {
    // Use process.env directly to avoid ConfigService DI timing issues
    const podUrl = process.env['COMFYUI_POD_URL'];

    if (!podUrl) {
      this.logger.warn(
        'COMFYUI_POD_URL not configured - ComfyUI image generation disabled',
      );
      return;
    }

    try {
      this.client = new ComfyUIPodClient({ baseUrl: podUrl });
      this.runner = new ComfyUIJobRunner(this.client);

      // Initialize runner with available nodes for optimal workflow selection
      await this.runner.initialize();
      this.availableNodes = await this.client.getAvailableNodes();
      this.isInitialized = true;

      this.logger.log(
        `ComfyUI pod initialized: ${podUrl} (${this.availableNodes.length} nodes available)`,
      );

      // Log recommended workflow
      const recommended = getRecommendedWorkflow(this.availableNodes);
      this.logger.log(`Recommended workflow: ${recommended}`);
    } catch (error) {
      this.logger.error('Failed to initialize ComfyUI pod:', error);
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.runner) {
      throw new Error('ComfyUI pod not initialized. Check COMFYUI_POD_URL configuration.');
    }
  }

  /**
   * Submit base image generation (RunPodJobRunner interface)
   */
  async submitBaseImages(input: {
    prompt: string;
    nsfw: boolean;
    seed?: number;
    useZImage?: boolean;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.submitBaseImages(input);
  }

  /**
   * Submit base image with full workflow control
   */
  async submitBaseImageWithWorkflow(input: {
    prompt: string;
    negativePrompt?: string;
    nsfw: boolean;
    seed?: number;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
    workflowId?: WorkflowId;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.submitBaseImageWithWorkflow(input);
  }

  /**
   * Generate image from character DNA using the prompt library
   * This is the main method for character-based generation
   */
  async generateFromCharacterDNA(input: GenerateFromDNAInput): Promise<string> {
    this.ensureInitialized();

    // Build prompt using PromptBuilder
    const builder = new PromptBuilder().withCharacter(input.character);

    if (input.templateId) {
      builder.withTemplate(input.templateId);
    }
    if (input.scene) {
      builder.withScene(input.scene);
    }
    if (input.outfit) {
      builder.withOutfit(input.outfit);
    }
    if (input.lighting) {
      builder.withLighting(input.lighting);
    }
    if (input.expression) {
      builder.withExpression(input.expression);
    }

    // Add quality modifiers
    builder.withStylePreset('quality');

    const builtPrompt = builder.build();

    // Submit using the built prompt
    return this.runner!.submitFromBuiltPrompt(builtPrompt, {
      seed: input.seed,
      nsfw: input.nsfw,
      workflowId: input.workflowId,
    });
  }

  /**
   * Generate image from a pre-built prompt
   */
  async generateFromBuiltPrompt(
    builtPrompt: BuiltPrompt,
    options?: {
      seed?: number;
      nsfw?: boolean;
      workflowId?: WorkflowId;
    },
  ): Promise<string> {
    this.ensureInitialized();
    return this.runner!.submitFromBuiltPrompt(builtPrompt, options);
  }

  /**
   * Submit face swap job (RunPodJobRunner interface)
   */
  async submitFaceSwap(input: {
    baseImageUrl: string;
    prompt: string;
    nsfw: boolean;
    seed?: number;
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.submitFaceSwap(input);
  }

  /**
   * Submit character sheet job (RunPodJobRunner interface)
   */
  async submitCharacterSheet(input: {
    baseImageUrl: string;
    nsfw: boolean;
    angles?: string[];
  }): Promise<string> {
    this.ensureInitialized();
    return this.runner!.submitCharacterSheet(input);
  }

  /**
   * Get job status (RunPodJobRunner interface)
   */
  async getJobStatus(jobId: string): Promise<RunPodJobStatus> {
    this.ensureInitialized();
    return this.runner!.getJobStatus(jobId);
  }

  /**
   * Health check - verify pod is running
   */
  async healthCheck(): Promise<boolean> {
    if (!this.client) return false;
    return this.client.healthCheck();
  }

  /**
   * Get available models on the pod
   */
  async getAvailableModels() {
    if (!this.client) return null;
    return this.client.getModels();
  }

  /**
   * Get the recommended workflow based on available nodes
   */
  getRecommendedWorkflow(): WorkflowId {
    return getRecommendedWorkflow(this.availableNodes);
  }

  /**
   * Queue a workflow directly (for custom workflows like PuLID)
   */
  async queueWorkflow(workflow: any): Promise<string> {
    this.ensureInitialized();
    if (!this.client) {
      throw new Error('ComfyUI client not initialized');
    }
    return this.client.queueWorkflow(workflow);
  }

  /**
   * Upload an image to ComfyUI's input folder
   */
  async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
    this.ensureInitialized();
    if (!this.client) {
      throw new Error('ComfyUI client not initialized');
    }
    return this.client.uploadImage(imageBuffer, filename);
  }

  /**
   * Get available nodes (for workflow compatibility checking)
   */
  async getAvailableNodes(): Promise<string[]> {
    if (!this.client) return [];
    return this.client.getAvailableNodes();
  }

  /**
   * Check if ComfyUI is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }
}

