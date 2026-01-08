/**
 * AI Toolkit Client
 * 
 * Client for interacting with AI Toolkit (Ostris) running on RunPod.
 * AI Toolkit uses Gradio for its web interface, which automatically exposes API endpoints.
 * 
 * Official Repository: https://github.com/ostris/ai-toolkit
 * Based on: https://www.youtube.com/watch?v=PhiPASFYBmk
 * 
 * Note: This client uses Gradio's standard API endpoints. The actual endpoint structure
 * should be discovered by accessing the Gradio UI's /docs endpoint or via browser DevTools.
 */

export interface AIToolkitDataset {
  id: string;
  name: string;
  imageCount: number;
  createdAt: string;
}

export interface AIToolkitTrainingJob {
  id: string;
  name: string;
  status: 'pending' | 'training' | 'completed' | 'failed';
  progress?: number; // 0-100
  currentStep?: number;
  totalSteps?: number;
  samples?: Array<{
    step: number;
    imageUrl: string;
  }>;
  error?: string;
}

export interface CreateDatasetInput {
  name: string;
  imageUrls: string[]; // URLs to images (S3 signed URLs)
}

export interface CreateTrainingJobInput {
  datasetId: string;
  name: string;
  baseModel: 'one-2.1' | 'one-2.2' | 'flux' | 'z-image-turbo' | 'sdxl' | 'sd-1.5';
  triggerWord: string;
  steps?: number;
  checkpointInterval?: number; // Steps between checkpoints
  learningRate?: number;
  resolution?: number; // 512 for One models (low VRAM)
  lowVRAM?: boolean;
  sampleInterval?: number; // Steps between sample generation
  samplePrompts?: string[]; // Prompts for sample generation
}

export interface LoRADownload {
  version: string; // e.g., 'final', '500', '1000'
  downloadUrl: string;
  fileSize: number;
}

export class AIToolkitClient {
  private baseUrl: string;
  private password: string;
  private sessionToken?: string;

  constructor(config: {
    baseUrl: string; // e.g., 'https://<pod-id>-<port>.runpod.net'
    password: string;
  }) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.password = config.password;
  }

  /**
   * Authenticate with AI Toolkit
   * 
   * Gradio typically uses password protection via the UI, but API endpoints
   * may require different authentication. This needs to be verified when
   * accessing the actual Gradio instance.
   * 
   * Options:
   * 1. Gradio may expose API without auth (if password only protects UI)
   * 2. May need to use Gradio's built-in auth mechanism
   * 3. May need session cookies from UI login
   */
  private async authenticate(): Promise<void> {
    if (this.sessionToken) {
      return; // Already authenticated
    }

    // TODO: Verify actual authentication mechanism
    // Check Gradio API docs at /docs endpoint
    // May need to:
    // - Use session cookies from UI login
    // - Use Gradio's built-in auth
    // - Or API may be unprotected if password only protects UI
    
    // Placeholder - needs verification
    const response = await fetch(`${this.baseUrl}/api/`, {
      method: 'GET',
    });

    if (!response.ok && response.status === 401) {
      // If auth required, implement based on actual Gradio setup
      throw new Error('Authentication required - check Gradio API docs');
    }

    // For now, assume API is accessible (password may only protect UI)
    this.sessionToken = 'authenticated';
  }

  /**
   * Create a new dataset
   */
  async createDataset(input: CreateDatasetInput): Promise<AIToolkitDataset> {
    await this.authenticate();

    // Upload images to AI Toolkit
    // Implementation depends on actual API
    // May need to download images from URLs and upload to AI Toolkit
    
    const response = await fetch(`${this.baseUrl}/api/datasets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sessionToken}`,
      },
      body: JSON.stringify({
        name: input.name,
        imageUrls: input.imageUrls,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create dataset: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get dataset details
   */
  async getDataset(datasetId: string): Promise<AIToolkitDataset> {
    await this.authenticate();

    const response = await fetch(`${this.baseUrl}/api/datasets/${datasetId}`, {
      headers: {
        Authorization: `Bearer ${this.sessionToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get dataset: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a training job
   */
  async createTrainingJob(
    input: CreateTrainingJobInput
  ): Promise<AIToolkitTrainingJob> {
    await this.authenticate();

    const response = await fetch(`${this.baseUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sessionToken}`,
      },
      body: JSON.stringify({
        datasetId: input.datasetId,
        name: input.name,
        baseModel: input.baseModel,
        triggerWord: input.triggerWord,
        steps: input.steps ?? 2000,
        checkpointInterval: input.checkpointInterval ?? 500,
        learningRate: input.learningRate ?? 0.0001,
        resolution: input.resolution ?? 512,
        lowVRAM: input.lowVRAM ?? true,
        sampleInterval: input.sampleInterval ?? 500,
        samplePrompts: input.samplePrompts ?? [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create training job: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get training job status
   */
  async getJobStatus(jobId: string): Promise<AIToolkitTrainingJob> {
    await this.authenticate();

    const response = await fetch(`${this.baseUrl}/api/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${this.sessionToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List available LoRA versions for a completed job
   */
  async listLoRAVersions(jobId: string): Promise<LoRADownload[]> {
    await this.authenticate();

    const response = await fetch(
      `${this.baseUrl}/api/jobs/${jobId}/loras`,
      {
        headers: {
          Authorization: `Bearer ${this.sessionToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list LoRA versions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Download a trained LoRA file
   */
  async downloadLoRA(
    jobId: string,
    version: string = 'final'
  ): Promise<Buffer> {
    await this.authenticate();

    const response = await fetch(
      `${this.baseUrl}/api/jobs/${jobId}/loras/${version}/download`,
      {
        headers: {
          Authorization: `Bearer ${this.sessionToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download LoRA: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Health check - verify AI Toolkit is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

