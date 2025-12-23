/**
 * ComfyUI Pod Client
 *
 * Direct HTTP client for ComfyUI running on a dedicated RunPod pod.
 * Replaces serverless endpoints for instant response times (no cold starts).
 *
 * Architecture:
 *   RYLA API → ComfyUI Pod API → GPU generates image → Return to RYLA
 *
 * ComfyUI API endpoints used:
 *   POST /prompt     - Queue a workflow
 *   GET /history/{id} - Check job status and get outputs
 *   GET /view        - Download generated images
 *
 * @see ADR-003: Use Dedicated ComfyUI Pod Over Serverless
 */

import { ComfyUIWorkflow } from './comfyui-workflow-builder';

export interface ComfyUIPodConfig {
  /** Base URL of the ComfyUI pod (e.g., https://xyz-8188.proxy.runpod.net) */
  baseUrl: string;
  /** Optional timeout in milliseconds (default: 120000 = 2 minutes) */
  timeout?: number;
}

export interface ComfyUIPromptResponse {
  prompt_id: string;
  number: number;
  node_errors: Record<string, unknown>;
}

export interface ComfyUIHistoryItem {
  prompt: [number, string, unknown, unknown, unknown];
  outputs: Record<
    string,
    {
      images?: Array<{
        filename: string;
        subfolder: string;
        type: string;
      }>;
    }
  >;
  status: {
    status_str: 'success' | 'error';
    completed: boolean;
    messages: Array<[string, unknown]>;
  };
}

export interface ComfyUIJobResult {
  promptId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  images?: string[]; // Base64 encoded images
  error?: string;
}

export class ComfyUIPodClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: ComfyUIPodConfig) {
    // Remove trailing slash
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.timeout = config.timeout ?? 120000;
  }

  /**
   * Queue a workflow for execution
   * @param workflow - ComfyUI workflow JSON
   * @returns Prompt ID for tracking
   */
  async queueWorkflow(workflow: ComfyUIWorkflow): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: workflow }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ComfyUI queue error: ${response.status} - ${error}`);
      }

      const data = (await response.json()) as ComfyUIPromptResponse;

      if (Object.keys(data.node_errors || {}).length > 0) {
        throw new Error(
          `ComfyUI node errors: ${JSON.stringify(data.node_errors)}`
        );
      }

      return data.prompt_id;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get the status of a queued job
   * @param promptId - The prompt ID returned from queueWorkflow
   */
  async getJobStatus(promptId: string): Promise<ComfyUIJobResult> {
    const response = await fetch(`${this.baseUrl}/history/${promptId}`);

    if (!response.ok) {
      // Job not found in history yet = still processing
      if (response.status === 404) {
        return { promptId, status: 'processing' };
      }
      throw new Error(`ComfyUI history error: ${response.statusText}`);
    }

    const history = (await response.json()) as Record<string, ComfyUIHistoryItem>;
    const item = history[promptId];

    if (!item) {
      return { promptId, status: 'queued' };
    }

    if (!item.status.completed) {
      return { promptId, status: 'processing' };
    }

    if (item.status.status_str === 'error') {
      const errorMsg = item.status.messages
        .map(([type, data]) => `${type}: ${JSON.stringify(data)}`)
        .join('; ');
      return { promptId, status: 'failed', error: errorMsg };
    }

    // Extract images from outputs
    const images: string[] = [];
    for (const nodeOutput of Object.values(item.outputs)) {
      if (nodeOutput.images) {
        for (const img of nodeOutput.images) {
          const imageData = await this.downloadImage(
            img.filename,
            img.subfolder,
            img.type
          );
          images.push(imageData);
        }
      }
    }

    return { promptId, status: 'completed', images };
  }

  /**
   * Download an image from ComfyUI and return as base64
   */
  private async downloadImage(
    filename: string,
    subfolder: string,
    type: string
  ): Promise<string> {
    const params = new URLSearchParams({
      filename,
      subfolder,
      type,
    });

    const response = await fetch(`${this.baseUrl}/view?${params}`);

    if (!response.ok) {
      throw new Error(`ComfyUI image download error: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Queue workflow and wait for completion
   * Polls every 2 seconds until complete or timeout
   * @param workflow - ComfyUI workflow JSON
   * @param pollIntervalMs - How often to poll (default: 2000ms)
   * @returns Completed job result with images
   */
  async executeWorkflow(
    workflow: ComfyUIWorkflow,
    pollIntervalMs = 2000
  ): Promise<ComfyUIJobResult> {
    const promptId = await this.queueWorkflow(workflow);
    const startTime = Date.now();

    while (Date.now() - startTime < this.timeout) {
      const result = await this.getJobStatus(promptId);

      if (result.status === 'completed' || result.status === 'failed') {
        return result;
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    return {
      promptId,
      status: 'failed',
      error: `Timeout after ${this.timeout}ms`,
    };
  }

  /**
   * Health check - verify pod is running and responsive
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/system_stats`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get all available node types on the pod
   * Used for workflow compatibility checking
   */
  async getAvailableNodes(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/object_info`, {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Failed to get object_info: ${response.statusText}`);
      }

      const data = (await response.json()) as Record<string, unknown>;
      return Object.keys(data);
    } catch (error) {
      console.warn('Failed to fetch available nodes:', error);
      return [];
    }
  }

  /**
   * Get available models on the pod
   */
  async getModels(): Promise<{
    checkpoints: string[];
    loras: string[];
    vaes: string[];
    diffusion: string[];
    textEncoders: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/object_info/CheckpointLoaderSimple`);
    
    if (!response.ok) {
      throw new Error(`Failed to get models: ${response.statusText}`);
    }
    
    const data = await response.json();
    const checkpoints = data.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] || [];
    
    // Get LoRAs
    const loraResponse = await fetch(`${this.baseUrl}/object_info/LoraLoader`);
    const loraData = await loraResponse.json();
    const loras = loraData.LoraLoader?.input?.required?.lora_name?.[0] || [];
    
    // Get VAEs
    const vaeResponse = await fetch(`${this.baseUrl}/object_info/VAELoader`);
    const vaeData = await vaeResponse.json();
    const vaes = vaeData.VAELoader?.input?.required?.vae_name?.[0] || [];

    // Get diffusion models (UNETs)
    const unetResponse = await fetch(`${this.baseUrl}/object_info/UNETLoader`);
    const unetData = await unetResponse.json();
    const diffusion = unetData.UNETLoader?.input?.required?.unet_name?.[0] || [];

    // Get text encoders (CLIPs)
    const clipResponse = await fetch(`${this.baseUrl}/object_info/CLIPLoader`);
    const clipData = await clipResponse.json();
    const textEncoders = clipData.CLIPLoader?.input?.required?.clip_name?.[0] || [];
    
    return { checkpoints, loras, vaes, diffusion, textEncoders };
  }
}

/**
 * Create ComfyUI Pod client from environment variables
 * Expects COMFYUI_POD_URL to be set
 */
export function createComfyUIPodClient(): ComfyUIPodClient {
  const baseUrl = process.env['COMFYUI_POD_URL'];

  if (!baseUrl) {
    throw new Error('COMFYUI_POD_URL environment variable is required');
  }

  return new ComfyUIPodClient({ baseUrl });
}

