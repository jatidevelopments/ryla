/**
 * Modal.com HTTP Client
 *
 * Client for calling Modal.com FastAPI endpoints for AI generation.
 * Endpoints are split across multiple Modal apps for better scaling.
 *
 * Modal.com endpoints return images/videos directly as binary data with cost tracking headers.
 *
 * @see apps/modal/ENDPOINT-APP-MAPPING.md for endpoint-to-app mapping
 */

/**
 * Endpoint to Modal app mapping.
 * Each endpoint is served by a specific Modal app.
 */
const ENDPOINT_APP_MAP: Record<string, string> = {
  // Flux (ryla-flux)
  '/flux': 'ryla-flux',
  '/flux-dev': 'ryla-flux',
  '/flux-dev-lora': 'ryla-flux',
  // Face Consistency (ryla-instantid)
  '/sdxl-instantid': 'ryla-instantid',
  '/sdxl-turbo': 'ryla-instantid',
  '/sdxl-lightning': 'ryla-instantid',
  '/flux-pulid': 'ryla-instantid',
  '/flux-ipadapter-faceid': 'ryla-instantid',
  // Qwen Image (ryla-qwen-image)
  '/qwen-image-2512': 'ryla-qwen-image',
  '/qwen-image-2512-fast': 'ryla-qwen-image',
  '/qwen-image-2512-lora': 'ryla-qwen-image',
  '/qwen-faceswap': 'ryla-qwen-image',
  '/qwen-faceswap-fast': 'ryla-qwen-image',
  '/qwen-character-scene': 'ryla-qwen-image',
  '/video-faceswap': 'ryla-qwen-image',
  // Qwen Edit (ryla-qwen-edit)
  '/qwen-image-edit-2511': 'ryla-qwen-edit',
  '/qwen-image-inpaint-2511': 'ryla-qwen-edit',
  // Z-Image (ryla-z-image)
  '/z-image-simple': 'ryla-z-image',
  '/z-image-danrisi': 'ryla-z-image',
  '/z-image-lora': 'ryla-z-image',
  // Video (ryla-wan26)
  '/wan2.6': 'ryla-wan26',
  '/wan2.6-r2v': 'ryla-wan26',
  '/wan2.6-lora': 'ryla-wan26',
  // Upscaling (ryla-seedvr2)
  '/seedvr2': 'ryla-seedvr2',
  // LoRA (ryla-lora) - legacy, prefer app-specific LoRA endpoints
  '/flux-lora': 'ryla-lora',
  // Workflow (legacy - use specific endpoints instead)
  '/workflow': 'ryla-flux',
};

export interface ModalClientConfig {
  /** Base endpoint URL (deprecated - use workspace instead) */
  endpointUrl?: string;
  /** Modal workspace name (e.g., 'ryla') - used to construct app URLs */
  workspace?: string;
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

export interface ModalQwenImageRequest extends Record<string, unknown> {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg?: number;
  seed?: number;
}

export interface ModalQwenImageLoRARequest extends ModalQwenImageRequest {
  lora_id?: string; // Auto-prefixed to "character-{id}.safetensors"
  lora_name?: string; // Direct filename (alternative to lora_id)
  lora_strength?: number;
  trigger_word?: string;
}

export interface ModalQwenEditRequest extends Record<string, unknown> {
  source_image: string; // base64 data URL
  instruction: string;
  steps?: number;
  cfg?: number;
  seed?: number;
  denoise?: number;
}

export interface ModalQwenInpaintRequest extends Record<string, unknown> {
  source_image: string; // base64 data URL
  mask_image: string; // base64 data URL (white = edit area)
  prompt: string;
  steps?: number;
  cfg?: number;
  seed?: number;
}

export interface ModalWan26Request extends Record<string, unknown> {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_frames?: number;
  fps?: number;
  steps?: number;
  cfg?: number;
  seed?: number;
}

export interface ModalWan26R2VRequest extends ModalWan26Request {
  reference_video: string; // base64 data URL
}

export interface ModalQwenFaceSwapRequest extends Record<string, unknown> {
  prompt: string;
  reference_image: string; // base64 data URL of face to use
  negative_prompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  restore_face?: boolean; // Apply GFPGAN face restoration (default: true)
}

export interface ModalQwenCharacterSceneRequest
  extends Record<string, unknown> {
  character_image: string; // base64 data URL of character reference
  scene: string; // Description of target scene
  steps?: number;
  cfg?: number;
  seed?: number;
  denoise?: number; // 0.0-1.0, lower = more preservation (default: 0.7)
}

export interface ModalVideoFaceSwapRequest extends Record<string, unknown> {
  source_video: string; // base64 data URL of source video
  reference_image: string; // base64 data URL of face to swap in
  fps?: number; // Output FPS (default: 30)
  restore_face?: boolean; // Apply GFPGAN restoration (default: true)
  face_restore_visibility?: number; // Face restore blend 0-1 (default: 1.0)
  codeformer_weight?: number; // CodeFormer weight (default: 0.5)
}

export interface ModalResponse {
  image: Buffer;
  contentType: string;
  costUsd?: number;
  executionTimeSec?: number;
  gpuType?: string;
}

export class ModalClient {
  private workspace: string;
  private legacyEndpointUrl: string | null;
  private timeout: number;

  constructor(config: ModalClientConfig) {
    // Support both legacy endpointUrl and new workspace-based routing
    if (config.workspace) {
      this.workspace = config.workspace;
      this.legacyEndpointUrl = null;
    } else if (config.endpointUrl) {
      // Extract workspace from legacy URL or use as fallback
      const match = config.endpointUrl.match(/https:\/\/([^-]+)--/);
      this.workspace = match ? match[1] : 'ryla';
      this.legacyEndpointUrl = config.endpointUrl.replace(/\/$/, '');
    } else {
      this.workspace = 'ryla';
      this.legacyEndpointUrl = null;
    }
    this.timeout = config.timeout || 180000; // 3 minutes default
  }

  /**
   * Get the full URL for an endpoint, using app-specific routing
   */
  private getEndpointUrl(path: string): string {
    const appName = ENDPOINT_APP_MAP[path];
    if (appName) {
      return `https://${this.workspace}--${appName}-comfyui-fastapi-app.modal.run${path}`;
    }
    // Fallback to legacy URL for unknown endpoints
    if (this.legacyEndpointUrl) {
      return `${this.legacyEndpointUrl}${path}`;
    }
    // Default to flux app for unknown endpoints
    return `https://${this.workspace}--ryla-flux-comfyui-fastapi-app.modal.run${path}`;
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
   * @deprecated Use generateWan26() instead - Wan 2.1 has been removed
   */
  async generateWan2(input: ModalFluxRequest): Promise<ModalResponse> {
    console.warn('generateWan2 is deprecated - use generateWan26 instead');
    return this.generateWan26(input as ModalWan26Request);
  }

  // ============================================================
  // Qwen-Image Models (Modal.com - Primary MVP Models)
  // ============================================================

  /**
   * Generate image using Qwen-Image 2512 (high-quality, 50 steps)
   */
  async generateQwenImage2512(
    input: ModalQwenImageRequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/qwen-image-2512', input);
  }

  /**
   * Generate image using Qwen-Image 2512 Fast (4 steps with Lightning LoRA)
   */
  async generateQwenImage2512Fast(
    input: ModalQwenImageRequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/qwen-image-2512-fast', input);
  }

  /**
   * Generate image using Qwen-Image 2512 with custom character LoRA
   *
   * @param input.lora_id - Character LoRA ID (auto-prefixed to "character-{id}.safetensors")
   * @param input.lora_name - Direct LoRA filename (alternative to lora_id)
   * @param input.lora_strength - LoRA strength (default: 1.0)
   * @param input.trigger_word - Trigger word to prepend to prompt
   */
  async generateQwenImage2512LoRA(
    input: ModalQwenImageLoRARequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/qwen-image-2512-lora', input);
  }

  /**
   * Edit image using Qwen-Image Edit 2511 (instruction-based)
   */
  async editQwenImage2511(input: ModalQwenEditRequest): Promise<ModalResponse> {
    return this.callEndpoint('/qwen-image-edit-2511', input);
  }

  /**
   * Inpaint image using Qwen-Image Inpaint 2511 (mask-based)
   */
  async inpaintQwenImage2511(
    input: ModalQwenInpaintRequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/qwen-image-inpaint-2511', input);
  }

  // ============================================================
  // Wan 2.6 Video Models (Modal.com - Primary Video Models)
  // ============================================================

  /**
   * Generate video using Wan 2.6 (text-to-video)
   */
  async generateWan26(input: ModalWan26Request): Promise<ModalResponse> {
    return this.callEndpoint('/wan2.6', input);
  }

  /**
   * Generate video using Wan 2.6 R2V (reference-to-video for character consistency)
   */
  async generateWan26R2V(input: ModalWan26R2VRequest): Promise<ModalResponse> {
    return this.callEndpoint('/wan2.6-r2v', input);
  }

  // ============================================================
  // Face Consistency (ReActor-based)
  // ============================================================

  /**
   * Generate image with face swap using Qwen-Image 2512 + ReActor
   *
   * Two-step pipeline:
   * 1. Generate high-quality image with Qwen-Image 2512
   * 2. Swap face using ReActor with GFPGAN restoration
   *
   * @param input.reference_image - Base64 data URL of face to use
   * @param input.restore_face - Apply GFPGAN face restoration (default: true)
   */
  async generateQwenFaceSwap(
    input: ModalQwenFaceSwapRequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/qwen-faceswap', input);
  }

  /**
   * Fast face swap using Qwen-Image 2512 (4 steps) + ReActor
   *
   * Same as generateQwenFaceSwap but ~10x faster (Lightning LoRA)
   */
  async generateQwenFaceSwapFast(
    input: ModalQwenFaceSwapRequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/qwen-faceswap-fast', input);
  }

  /**
   * Place character in new scene using Qwen-Edit
   *
   * Uses Qwen-Edit's native character consistency to edit
   * a character image into a new scene while preserving identity.
   *
   * @param input.character_image - Base64 data URL of character reference
   * @param input.scene - Description of target scene
   * @param input.denoise - Preservation strength (lower = more preservation)
   */
  async generateQwenCharacterScene(
    input: ModalQwenCharacterSceneRequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/qwen-character-scene', input);
  }

  /**
   * Apply face swap to video using ReActor
   *
   * Processes video frame-by-frame:
   * 1. Load source video frames
   * 2. Apply ReActor face swap to each frame
   * 3. Reassemble with original audio
   *
   * @param input.source_video - Base64 data URL of source video
   * @param input.reference_image - Base64 data URL of face to swap in
   * @param input.fps - Output FPS (default: 30)
   * @param input.restore_face - Apply GFPGAN face restoration (default: true)
   */
  async videoFaceSwap(
    input: ModalVideoFaceSwapRequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/video-faceswap', input);
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
   * Generate image using SDXL + InstantID (best face consistency)
   */
  async generateSDXLInstantID(
    input: ModalInstantIDRequest
  ): Promise<ModalResponse> {
    return this.callEndpoint('/sdxl-instantid', input);
  }

  /**
   * Generate image using SDXL Turbo (fast, 1-4 steps)
   */
  async generateSDXLTurbo(input: ModalFluxRequest): Promise<ModalResponse> {
    return this.callEndpoint('/sdxl-turbo', input);
  }

  /**
   * Generate image using SDXL Lightning (fast, 4 steps)
   */
  async generateSDXLLightning(input: ModalFluxRequest): Promise<ModalResponse> {
    return this.callEndpoint('/sdxl-lightning', input);
  }

  /**
   * Generate image using Flux Dev + LoRA
   */
  async generateFluxDevLoRA(input: ModalLoRARequest): Promise<ModalResponse> {
    return this.callEndpoint('/flux-dev-lora', input);
  }

  /**
   * Generate video using Wan 2.6 + LoRA
   */
  async generateWan26LoRA(
    input: ModalWan26Request & { lora_id: string; lora_strength?: number }
  ): Promise<ModalResponse> {
    return this.callEndpoint('/wan2.6-lora', input);
  }

  /**
   * Upscale image using SeedVR2
   */
  async upscaleSeedVR2(input: {
    image: string;
    scale?: number;
  }): Promise<ModalResponse> {
    return this.callEndpoint('/seedvr2', input);
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
   * @deprecated Z-Image + InstantID is not supported (encoder incompatibility)
   * Use generateSDXLInstantID() for face consistency instead
   */
  async generateZImageInstantID(
    _input: ModalInstantIDRequest
  ): Promise<ModalResponse> {
    throw new Error(
      'Z-Image + InstantID is not supported due to encoder incompatibility. Use generateSDXLInstantID() instead.'
    );
  }

  /**
   * @deprecated Z-Image + PuLID is not supported (encoder incompatibility)
   * Use generateFluxPuLID() for face consistency instead
   */
  async generateZImagePuLID(_input: ModalPuLIDRequest): Promise<ModalResponse> {
    throw new Error(
      'Z-Image + PuLID is not supported due to encoder incompatibility. Use generateFluxPuLID() instead.'
    );
  }

  /**
   * Generate image using Z-Image-Turbo + LoRA
   */
  async generateZImageLoRA(input: ModalLoRARequest): Promise<ModalResponse> {
    return this.callEndpoint('/z-image-lora', input);
  }

  /**
   * Generate image using Flux + PuLID face consistency
   */
  async generateFluxPuLID(input: ModalPuLIDRequest): Promise<ModalResponse> {
    return this.callEndpoint('/flux-pulid', input);
  }

  /**
   * Execute custom workflow
   */
  async executeWorkflow(input: ModalWorkflowRequest): Promise<ModalResponse> {
    return this.callEndpoint('/workflow', input);
  }

  /**
   * Generic endpoint caller with app-specific routing
   */
  private async callEndpoint(
    path: string,
    body: Record<string, unknown>
  ): Promise<ModalResponse> {
    const url = this.getEndpointUrl(path);
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
      // Try health endpoint on flux app
      const healthUrl = `https://${this.workspace}--ryla-flux-comfyui-fastapi-app.modal.run/health`;
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(10000), // 10 second timeout for health check (cold start)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get the workspace being used
   */
  getWorkspace(): string {
    return this.workspace;
  }
}
