/**
 * Modal.com HTTP Client
 *
 * Client for calling Modal.com FastAPI endpoints for AI generation.
 * Handles all Modal.com endpoints: /flux-dev, /flux, /wan2, /workflow, /flux-lora
 *
 * Modal.com endpoints return images/videos directly as binary data with cost tracking headers.
 */

export interface ModalClientConfig {
  endpointUrl: string;
  timeout?: number;
}

export interface ModalFluxRequest extends Record<string, unknown> {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg?: number;
  seed?: number;
}

export interface ModalLoRARequest extends ModalFluxRequest {
  lora_id: string;
  lora_strength?: number;
  trigger_word?: string;
}

export interface ModalFaceConsistencyRequest extends ModalFluxRequest {
  reference_image: string; // base64 data URL
  face_provider?: 'CPU' | 'GPU';
}

export interface ModalIPAdapterFaceIDRequest
  extends ModalFaceConsistencyRequest {
  ipadapter_strength?: number;
}

export interface ModalInstantIDRequest extends ModalFaceConsistencyRequest {
  instantid_strength?: number;
  controlnet_strength?: number;
}

export interface ModalPuLIDRequest extends ModalFaceConsistencyRequest {
  pulid_strength?: number;
  pulid_start?: number;
  pulid_end?: number;
}

export interface ModalWorkflowRequest extends Record<string, unknown> {
  workflow: Record<string, unknown>;
}

export interface ModalResponse {
  image: Buffer;
  contentType: string;
  costUsd?: number;
  executionTimeSec?: number;
  gpuType?: string;
}

export class ModalClient {
  private endpointUrl: string;
  private timeout: number;

  constructor(config: ModalClientConfig) {
    this.endpointUrl = config.endpointUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 180000; // 3 minutes default
  }

  /**
   * Generate image using Flux Dev (primary MVP model)
   */
  async generateFluxDev(input: ModalFluxRequest): Promise<ModalResponse> {
    return this.callEndpoint('/flux-dev', input);
  }

  /**
   * Generate image using Flux Schnell (fast generation)
   */
  async generateFlux(input: ModalFluxRequest): Promise<ModalResponse> {
    return this.callEndpoint('/flux', input);
  }

  /**
   * Generate image using Flux Dev + LoRA
   */
  async generateFluxLoRA(input: ModalLoRARequest): Promise<ModalResponse> {
    return this.callEndpoint('/flux-lora', input);
  }

  /**
   * Generate video using Wan2.1
   */
  async generateWan2(input: ModalFluxRequest): Promise<ModalResponse> {
    return this.callEndpoint('/wan2', input);
  }

  /**
   * Generate image using Flux Dev + IP-Adapter FaceID
   */
  async generateFluxIPAdapterFaceID(
    input: ModalIPAdapterFaceIDRequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/flux-ipadapter-faceid', input);
  }

  /**
   * Generate image using SDXL + InstantID
   */
  async generateSDXLInstantID(
    input: ModalInstantIDRequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/sdxl-instantid', input);
  }

  /**
   * Generate image using Z-Image-Turbo Simple
   */
  async generateZImageSimple(input: ModalFluxRequest): Promise<ModalResponse> {
    return this.callEndpoint('/z-image-simple', input);
  }

  /**
   * Generate image using Z-Image-Turbo Danrisi
   */
  async generateZImageDanrisi(input: ModalFluxRequest): Promise<ModalResponse> {
    return this.callEndpoint('/z-image-danrisi', input);
  }

  /**
   * Generate image using Z-Image-Turbo + InstantID
   */
  async generateZImageInstantID(
    input: ModalInstantIDRequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/z-image-instantid', input);
  }

  /**
   * Generate image using Z-Image-Turbo + PuLID
   */
  async generateZImagePuLID(input: ModalPuLIDRequest): Promise<ModalResponse> {
    return this.callEndpoint('/z-image-pulid', input);
  }

  /**
   * Execute custom workflow
   */
  async executeWorkflow(input: ModalWorkflowRequest): Promise<ModalResponse> {
    return this.callEndpoint('/workflow', input);
  }

  /**
   * Generic endpoint caller
   */
  private async callEndpoint(
    path: string,
    body: Record<string, unknown>
  ): Promise<ModalResponse> {
    const url = `${this.endpointUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(
          `Modal.com API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      // Modal.com returns images/videos as binary data
      const imageBuffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // Parse cost tracking headers
      const costUsd = response.headers.get('x-cost-usd')
        ? parseFloat(response.headers.get('x-cost-usd')!)
        : undefined;
      const executionTimeSec = response.headers.get('x-execution-time-sec')
        ? parseFloat(response.headers.get('x-execution-time-sec')!)
        : undefined;
      const gpuType = response.headers.get('x-gpu-type') || undefined;

      return {
        image: imageBuffer,
        contentType,
        costUsd,
        executionTimeSec,
        gpuType,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Modal.com request timeout (${path})`);
      }
      throw error;
    }
  }

  /**
   * Check if Modal.com endpoint is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try a minimal request to /flux-dev endpoint
      // Modal.com doesn't have a dedicated health endpoint, so we'll just check connectivity
      await fetch(`${this.endpointUrl}/flux-dev`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test' }),
        signal: AbortSignal.timeout(5000), // 5 second timeout for health check
      });
      // Any response (even error) means endpoint is reachable
      return true;
    } catch {
      return false;
    }
  }
}
