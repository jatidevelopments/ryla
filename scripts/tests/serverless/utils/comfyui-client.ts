/**
 * EP-044: ComfyUI API Client
 *
 * Client for interacting with ComfyUI API on serverless endpoints.
 *
 * @module scripts/tests/serverless/utils/comfyui-client
 */

import type {
  IComfyUIClient,
  ComfyUISystemStats,
  ComfyUINodeInfo,
  TestConfig,
} from '../types';
import { DEFAULT_CONFIG } from '../types';

/**
 * ComfyUI API Client
 *
 * Note: This requires the ComfyUI endpoint URL to be accessible directly,
 * which may not always be the case with serverless endpoints.
 * For dependency verification on serverless, we may need to use the
 * RunPod API to execute a workflow that queries this information.
 */
export class ComfyUIClient implements IComfyUIClient {
  private readonly endpointUrl: string;
  private readonly timeout: number;
  private readonly retries: number;

  constructor(config: TestConfig) {
    if (!config.endpointUrl) {
      throw new Error(
        'endpointUrl is required for ComfyUIClient. ' +
          'For serverless endpoints without direct access, use MockComfyUIClient or ' +
          'query node info through a workflow.'
      );
    }

    this.endpointUrl = config.endpointUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout ?? DEFAULT_CONFIG.timeout;
    this.retries = config.retries ?? DEFAULT_CONFIG.retries;
  }

  /**
   * Make a request with retry logic
   */
  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retries = this.retries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `ComfyUI API error: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on 4xx errors (client errors) except 429 (rate limit)
        if (
          lastError.message.includes('4') &&
          !lastError.message.includes('429') &&
          lastError.message.includes('ComfyUI API error')
        ) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError ?? new Error('Request failed after retries');
  }

  /**
   * Get system stats
   */
  async getSystemStats(): Promise<ComfyUISystemStats> {
    const url = `${this.endpointUrl}/system_stats`;
    return this.fetchWithRetry<ComfyUISystemStats>(url);
  }

  /**
   * Get info for a specific node type
   */
  async getNodeInfo(nodeType: string): Promise<ComfyUINodeInfo | null> {
    try {
      const url = `${this.endpointUrl}/object_info/${nodeType}`;
      const response = await this.fetchWithRetry<Record<string, ComfyUINodeInfo>>(url);
      return response[nodeType] ?? null;
    } catch (error) {
      // Node not found
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get info for all available nodes
   */
  async getObjectInfo(): Promise<Record<string, ComfyUINodeInfo>> {
    const url = `${this.endpointUrl}/object_info`;
    return this.fetchWithRetry<Record<string, ComfyUINodeInfo>>(url);
  }

  /**
   * Check if a node exists
   */
  async nodeExists(nodeType: string): Promise<boolean> {
    const info = await this.getNodeInfo(nodeType);
    return info !== null;
  }

  /**
   * List available models
   *
   * Note: ComfyUI doesn't have a standard API for listing models.
   * This attempts to get the list from the checkpoint loader node input options.
   */
  async listModels(): Promise<string[]> {
    try {
      // Get the CheckpointLoaderSimple node info which lists available models
      const nodeInfo = await this.getNodeInfo('CheckpointLoaderSimple');

      if (!nodeInfo?.input?.required?.ckpt_name) {
        return [];
      }

      const ckptNameInput = nodeInfo.input.required.ckpt_name;

      // The input is typically an array where the first element is the list of options
      if (Array.isArray(ckptNameInput) && Array.isArray(ckptNameInput[0])) {
        return ckptNameInput[0] as string[];
      }

      return [];
    } catch (error) {
      console.warn('Failed to list models:', error);
      return [];
    }
  }

  /**
   * Check if the ComfyUI endpoint is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const stats = await this.getSystemStats();
      return !!stats.system;
    } catch {
      return false;
    }
  }

  /**
   * Get available VAE models
   */
  async listVAEModels(): Promise<string[]> {
    try {
      const nodeInfo = await this.getNodeInfo('VAELoader');

      if (!nodeInfo?.input?.required?.vae_name) {
        return [];
      }

      const vaeNameInput = nodeInfo.input.required.vae_name;

      if (Array.isArray(vaeNameInput) && Array.isArray(vaeNameInput[0])) {
        return vaeNameInput[0] as string[];
      }

      return [];
    } catch (error) {
      console.warn('Failed to list VAE models:', error);
      return [];
    }
  }

  /**
   * Get available LoRA models
   */
  async listLoRAModels(): Promise<string[]> {
    try {
      const nodeInfo = await this.getNodeInfo('LoraLoader');

      if (!nodeInfo?.input?.required?.lora_name) {
        return [];
      }

      const loraNameInput = nodeInfo.input.required.lora_name;

      if (Array.isArray(loraNameInput) && Array.isArray(loraNameInput[0])) {
        return loraNameInput[0] as string[];
      }

      return [];
    } catch (error) {
      console.warn('Failed to list LoRA models:', error);
      return [];
    }
  }
}

/**
 * Create a ComfyUI client from environment variables
 */
export function createComfyUIClientFromEnv(): ComfyUIClient {
  const endpointUrl = process.env.RUNPOD_ENDPOINT_URL;

  if (!endpointUrl) {
    throw new Error('RUNPOD_ENDPOINT_URL environment variable is required');
  }

  return new ComfyUIClient({
    endpointId: 'unused', // Not used for ComfyUI client
    apiKey: 'unused', // Not used for ComfyUI client
    endpointUrl,
  });
}
