/**
 * EP-044: Model Validator
 *
 * Validates that required models are available on the ComfyUI endpoint.
 *
 * @module scripts/tests/serverless/validators/model-validator
 */

import type { IComfyUIClient, ModelVerificationResult } from '../types';

/**
 * Model types and their corresponding loader nodes
 */
const MODEL_LOADERS: Record<string, string> = {
  checkpoint: 'CheckpointLoaderSimple',
  vae: 'VAELoader',
  lora: 'LoraLoader',
  clip: 'CLIPLoader',
  controlnet: 'ControlNetLoader',
  upscale: 'UpscaleModelLoader',
};

/**
 * Model Validator
 *
 * Verifies that required models are available on the endpoint.
 */
export class ModelValidator {
  private readonly client: IComfyUIClient;
  private modelCache: Map<string, string[]> = new Map();

  constructor(client: IComfyUIClient) {
    this.client = client;
  }

  /**
   * Get available models of a specific type
   */
  private async getAvailableModels(modelType: string): Promise<string[]> {
    // Check cache first
    if (this.modelCache.has(modelType)) {
      return this.modelCache.get(modelType)!;
    }

    const loaderNode = MODEL_LOADERS[modelType];
    if (!loaderNode) {
      return [];
    }

    try {
      const nodeInfo = await this.client.getNodeInfo(loaderNode);
      if (!nodeInfo?.input?.required) {
        return [];
      }

      // Find the model name input field
      const modelFields = ['ckpt_name', 'vae_name', 'lora_name', 'clip_name', 'model_name'];
      for (const field of modelFields) {
        const fieldValue = nodeInfo.input.required[field];
        if (Array.isArray(fieldValue) && Array.isArray(fieldValue[0])) {
          const models = fieldValue[0] as string[];
          this.modelCache.set(modelType, models);
          return models;
        }
      }

      return [];
    } catch (error) {
      console.warn(`Failed to get ${modelType} models:`, error);
      return [];
    }
  }

  /**
   * Verify a single model exists
   */
  async verifyModel(
    modelName: string,
    modelType = 'checkpoint'
  ): Promise<ModelVerificationResult> {
    try {
      const availableModels = await this.getAvailableModels(modelType);

      // Check exact match
      if (availableModels.includes(modelName)) {
        return {
          name: modelName,
          exists: true,
          path: modelName,
        };
      }

      // Check partial match (in case of path differences)
      const partialMatch = availableModels.find(
        (m) => m.includes(modelName) || modelName.includes(m)
      );

      if (partialMatch) {
        return {
          name: modelName,
          exists: true,
          path: partialMatch,
        };
      }

      return {
        name: modelName,
        exists: false,
        error: `Model '${modelName}' not found in ${modelType} models`,
      };
    } catch (error) {
      return {
        name: modelName,
        exists: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Verify multiple models exist
   */
  async verifyModels(
    models: { name: string; type?: string }[]
  ): Promise<ModelVerificationResult[]> {
    const results = await Promise.all(
      models.map((model) => this.verifyModel(model.name, model.type ?? 'checkpoint'))
    );
    return results;
  }

  /**
   * Get all available checkpoint models
   */
  async listCheckpointModels(): Promise<string[]> {
    return this.client.listModels();
  }

  /**
   * Check if all required models are available
   */
  async allModelsAvailable(
    models: { name: string; type?: string }[]
  ): Promise<boolean> {
    const results = await this.verifyModels(models);
    return results.every((result) => result.exists);
  }

  /**
   * Get list of missing models
   */
  async getMissingModels(
    models: { name: string; type?: string }[]
  ): Promise<string[]> {
    const results = await this.verifyModels(models);
    return results.filter((result) => !result.exists).map((result) => result.name);
  }

  /**
   * Verify Denrisi workflow models specifically
   */
  async verifyDenrisiModels(): Promise<ModelVerificationResult[]> {
    const denrisiModels = [
      { name: 'z_image_turbo_bf16.safetensors', type: 'checkpoint' },
      { name: 'qwen_3_4b.safetensors', type: 'checkpoint' },
      { name: 'z-image-turbo-vae.safetensors', type: 'vae' },
    ];

    return this.verifyModels(denrisiModels);
  }

  /**
   * Clear the model cache
   */
  clearCache(): void {
    this.modelCache.clear();
  }
}

/**
 * Create a summary of model verification results
 */
export function summarizeModelVerification(
  results: ModelVerificationResult[]
): {
  total: number;
  available: number;
  missing: number;
  allAvailable: boolean;
  missingModels: string[];
} {
  const available = results.filter((r) => r.exists).length;
  const missing = results.filter((r) => !r.exists);

  return {
    total: results.length,
    available,
    missing: missing.length,
    allAvailable: missing.length === 0,
    missingModels: missing.map((r) => r.name),
  };
}

/**
 * Infer model type from model name
 */
export function inferModelType(modelName: string): string {
  const lowerName = modelName.toLowerCase();

  if (lowerName.includes('vae')) {
    return 'vae';
  }
  if (lowerName.includes('lora')) {
    return 'lora';
  }
  if (lowerName.includes('controlnet')) {
    return 'controlnet';
  }
  if (lowerName.includes('upscale') || lowerName.includes('esrgan')) {
    return 'upscale';
  }
  if (lowerName.includes('clip')) {
    return 'clip';
  }

  // Default to checkpoint
  return 'checkpoint';
}
