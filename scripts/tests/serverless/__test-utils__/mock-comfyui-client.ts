/**
 * EP-044: Mock ComfyUI Client
 *
 * Mock implementation of ComfyUI client for local testing.
 *
 * @module scripts/tests/serverless/__test-utils__/mock-comfyui-client
 */

import type {
  IComfyUIClient,
  ComfyUISystemStats,
  ComfyUINodeInfo,
  MockComfyUIResponses,
} from '../types';

/**
 * Default mock system stats
 */
const DEFAULT_SYSTEM_STATS: ComfyUISystemStats = {
  system: {
    os: 'posix',
    python_version: '3.10.12',
    embedded_python: false,
  },
  devices: [
    {
      name: 'NVIDIA A100-SXM4-80GB',
      type: 'cuda',
      index: 0,
      vram_total: 85899345920,
      vram_free: 80000000000,
      torch_vram_total: 85899345920,
      torch_vram_free: 80000000000,
    },
  ],
};

/**
 * Default mock node info for common nodes
 */
const DEFAULT_NODE_INFO: Record<string, ComfyUINodeInfo> = {
  CheckpointLoaderSimple: {
    input: {
      required: {
        ckpt_name: [
          [
            'z_image_turbo_bf16.safetensors',
            'qwen_3_4b.safetensors',
            'sd_xl_base_1.0.safetensors',
            'flux1-dev-fp8.safetensors',
          ],
        ],
      },
    },
    output: ['MODEL', 'CLIP', 'VAE'],
    output_name: ['MODEL', 'CLIP', 'VAE'],
    name: 'CheckpointLoaderSimple',
    display_name: 'Load Checkpoint',
    category: 'loaders',
  },
  KSampler: {
    input: {
      required: {
        model: ['MODEL'],
        seed: ['INT', { default: 0, min: 0, max: 18446744073709551615 }],
        steps: ['INT', { default: 20, min: 1, max: 10000 }],
        cfg: ['FLOAT', { default: 8.0, min: 0.0, max: 100.0 }],
        sampler_name: [['euler', 'euler_ancestral', 'dpmpp_2m', 'dpmpp_sde']],
        scheduler: [['normal', 'karras', 'exponential', 'sgm_uniform']],
        positive: ['CONDITIONING'],
        negative: ['CONDITIONING'],
        latent_image: ['LATENT'],
        denoise: ['FLOAT', { default: 1.0, min: 0.0, max: 1.0 }],
      },
    },
    output: ['LATENT'],
    output_name: ['LATENT'],
    name: 'KSampler',
    display_name: 'KSampler',
    category: 'sampling',
  },
  CLIPTextEncode: {
    input: {
      required: {
        text: ['STRING', { multiline: true }],
        clip: ['CLIP'],
      },
    },
    output: ['CONDITIONING'],
    output_name: ['CONDITIONING'],
    name: 'CLIPTextEncode',
    display_name: 'CLIP Text Encode (Prompt)',
    category: 'conditioning',
  },
  VAEDecode: {
    input: {
      required: {
        samples: ['LATENT'],
        vae: ['VAE'],
      },
    },
    output: ['IMAGE'],
    output_name: ['IMAGE'],
    name: 'VAEDecode',
    display_name: 'VAE Decode',
    category: 'latent',
  },
  SaveImage: {
    input: {
      required: {
        images: ['IMAGE'],
        filename_prefix: ['STRING', { default: 'ComfyUI' }],
      },
    },
    output: [],
    output_name: [],
    name: 'SaveImage',
    display_name: 'Save Image',
    category: 'image',
  },
  // Denrisi workflow nodes (res4lyf)
  ClownsharKSampler_Beta: {
    input: {
      required: {
        model: ['MODEL'],
        seed: ['INT', { default: 0 }],
        steps: ['INT', { default: 20 }],
      },
    },
    output: ['LATENT'],
    output_name: ['LATENT'],
    name: 'ClownsharKSampler_Beta',
    display_name: 'ClownsharK Sampler Beta',
    category: 'sampling/custom',
  },
  'Sigmas Rescale': {
    input: {
      required: {
        sigmas: ['SIGMAS'],
        rescale_factor: ['FLOAT', { default: 1.0 }],
      },
    },
    output: ['SIGMAS'],
    output_name: ['SIGMAS'],
    name: 'Sigmas Rescale',
    display_name: 'Sigmas Rescale',
    category: 'sampling/sigmas',
  },
  BetaSamplingScheduler: {
    input: {
      required: {
        model: ['MODEL'],
        steps: ['INT', { default: 20 }],
      },
    },
    output: ['SIGMAS'],
    output_name: ['SIGMAS'],
    name: 'BetaSamplingScheduler',
    display_name: 'Beta Sampling Scheduler',
    category: 'sampling/schedulers',
  },
  VAELoader: {
    input: {
      required: {
        vae_name: [
          ['z-image-turbo-vae.safetensors', 'vae-ft-mse-840000-ema-pruned.safetensors'],
        ],
      },
    },
    output: ['VAE'],
    output_name: ['VAE'],
    name: 'VAELoader',
    display_name: 'Load VAE',
    category: 'loaders',
  },
  LoraLoader: {
    input: {
      required: {
        model: ['MODEL'],
        clip: ['CLIP'],
        lora_name: [['character_lora.safetensors', 'style_lora.safetensors']],
        strength_model: ['FLOAT', { default: 1.0 }],
        strength_clip: ['FLOAT', { default: 1.0 }],
      },
    },
    output: ['MODEL', 'CLIP'],
    output_name: ['MODEL', 'CLIP'],
    name: 'LoraLoader',
    display_name: 'Load LoRA',
    category: 'loaders',
  },
};

/**
 * Mock ComfyUI Client for local testing
 */
export class MockComfyUIClient implements IComfyUIClient {
  private readonly mockResponses: Required<MockComfyUIResponses>;
  private nodeOverrides: Map<string, ComfyUINodeInfo | null> = new Map();

  /**
   * Call history for verification in tests
   */
  public callHistory: {
    method: string;
    args: unknown[];
    timestamp: number;
  }[] = [];

  constructor(mockResponses?: MockComfyUIResponses) {
    this.mockResponses = {
      systemStats: mockResponses?.systemStats ?? DEFAULT_SYSTEM_STATS,
      nodeInfo: mockResponses?.nodeInfo ?? DEFAULT_NODE_INFO,
      modelList: mockResponses?.modelList ?? [
        'z_image_turbo_bf16.safetensors',
        'qwen_3_4b.safetensors',
        'z-image-turbo-vae.safetensors',
        'sd_xl_base_1.0.safetensors',
        'flux1-dev-fp8.safetensors',
      ],
      objectInfo: mockResponses?.objectInfo ?? DEFAULT_NODE_INFO,
    };
  }

  /**
   * Record a method call for test verification
   */
  private recordCall(method: string, ...args: unknown[]): void {
    this.callHistory.push({
      method,
      args,
      timestamp: Date.now(),
    });
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(ms = 10): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get system stats (mock)
   */
  async getSystemStats(): Promise<ComfyUISystemStats> {
    this.recordCall('getSystemStats');
    await this.simulateDelay();
    return this.mockResponses.systemStats;
  }

  /**
   * Get node info (mock)
   */
  async getNodeInfo(nodeType: string): Promise<ComfyUINodeInfo | null> {
    this.recordCall('getNodeInfo', nodeType);
    await this.simulateDelay();

    // Check for override
    if (this.nodeOverrides.has(nodeType)) {
      return this.nodeOverrides.get(nodeType) ?? null;
    }

    // Check mock responses
    return this.mockResponses.nodeInfo[nodeType] ?? null;
  }

  /**
   * Get all object info (mock)
   */
  async getObjectInfo(): Promise<Record<string, ComfyUINodeInfo>> {
    this.recordCall('getObjectInfo');
    await this.simulateDelay();
    return this.mockResponses.objectInfo;
  }

  /**
   * Check if node exists (mock)
   */
  async nodeExists(nodeType: string): Promise<boolean> {
    this.recordCall('nodeExists', nodeType);
    const info = await this.getNodeInfo(nodeType);
    return info !== null;
  }

  /**
   * List available models (mock)
   */
  async listModels(): Promise<string[]> {
    this.recordCall('listModels');
    await this.simulateDelay();
    return this.mockResponses.modelList;
  }

  // =========================================================================
  // Test Helpers
  // =========================================================================

  /**
   * Set node info override
   */
  setNodeInfo(nodeType: string, info: ComfyUINodeInfo | null): void {
    this.nodeOverrides.set(nodeType, info);
  }

  /**
   * Remove a node (simulate missing node)
   */
  removeNode(nodeType: string): void {
    this.nodeOverrides.set(nodeType, null);
  }

  /**
   * Add a node
   */
  addNode(nodeType: string, info: ComfyUINodeInfo): void {
    this.mockResponses.nodeInfo[nodeType] = info;
  }

  /**
   * Clear node overrides
   */
  clearNodeOverrides(): void {
    this.nodeOverrides.clear();
  }

  /**
   * Clear call history
   */
  clearCallHistory(): void {
    this.callHistory = [];
  }

  /**
   * Reset the mock client
   */
  reset(): void {
    this.nodeOverrides.clear();
    this.callHistory = [];
  }

  /**
   * Get nodes that were queried
   */
  getQueriedNodes(): string[] {
    return this.callHistory
      .filter((call) => call.method === 'getNodeInfo' || call.method === 'nodeExists')
      .map((call) => call.args[0] as string);
  }
}

/**
 * Create mock responses for different test scenarios
 */
export const MockComfyUIScenarios = {
  /**
   * Standard ComfyUI installation with common nodes
   */
  standard(): MockComfyUIResponses {
    return {
      systemStats: DEFAULT_SYSTEM_STATS,
      nodeInfo: DEFAULT_NODE_INFO,
      modelList: [
        'z_image_turbo_bf16.safetensors',
        'sd_xl_base_1.0.safetensors',
        'flux1-dev-fp8.safetensors',
      ],
    };
  },

  /**
   * Denrisi workflow setup with res4lyf nodes
   */
  denrisi(): MockComfyUIResponses {
    return {
      systemStats: DEFAULT_SYSTEM_STATS,
      nodeInfo: {
        ...DEFAULT_NODE_INFO,
        ClownsharKSampler_Beta: DEFAULT_NODE_INFO.ClownsharKSampler_Beta,
        'Sigmas Rescale': DEFAULT_NODE_INFO['Sigmas Rescale'],
        BetaSamplingScheduler: DEFAULT_NODE_INFO.BetaSamplingScheduler,
      },
      modelList: [
        'z_image_turbo_bf16.safetensors',
        'qwen_3_4b.safetensors',
        'z-image-turbo-vae.safetensors',
      ],
    };
  },

  /**
   * Missing nodes scenario
   */
  missingNodes(missingNodes: string[]): MockComfyUIResponses {
    const nodeInfo = { ...DEFAULT_NODE_INFO };
    for (const node of missingNodes) {
      delete nodeInfo[node];
    }
    return {
      systemStats: DEFAULT_SYSTEM_STATS,
      nodeInfo,
      modelList: ['z_image_turbo_bf16.safetensors'],
    };
  },

  /**
   * Empty installation (no custom nodes)
   */
  minimal(): MockComfyUIResponses {
    return {
      systemStats: DEFAULT_SYSTEM_STATS,
      nodeInfo: {
        CheckpointLoaderSimple: DEFAULT_NODE_INFO.CheckpointLoaderSimple,
        KSampler: DEFAULT_NODE_INFO.KSampler,
        CLIPTextEncode: DEFAULT_NODE_INFO.CLIPTextEncode,
        VAEDecode: DEFAULT_NODE_INFO.VAEDecode,
        SaveImage: DEFAULT_NODE_INFO.SaveImage,
      },
      modelList: [],
    };
  },

  /**
   * Endpoint unavailable
   */
  unavailable(): MockComfyUIResponses {
    return {
      systemStats: {
        system: { os: 'unknown', python_version: 'unknown' },
        devices: [],
      },
      nodeInfo: {},
      modelList: [],
    };
  },
};
