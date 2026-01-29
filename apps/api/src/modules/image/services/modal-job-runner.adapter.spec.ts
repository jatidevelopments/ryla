/**
 * Modal.com Job Runner Adapter Tests
 *
 * Unit tests for ModalJobRunnerAdapter NestJS adapter.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModalJobRunnerAdapter } from './modal-job-runner.adapter';
import { ModalJobRunner } from '@ryla/business';

// Mock ModalJobRunner
vi.mock('@ryla/business', async () => {
  const actual = await vi.importActual('@ryla/business');
  return {
    ...actual,
    ModalJobRunner: vi.fn().mockImplementation(function(this: any) {
      // Return the mock runner instance when called with 'new'
      return mockRunnerInstance;
    }),
  };
});

// Store mock runner instance outside so it can be accessed by the mock
let mockRunnerInstance: {
  submitBaseImages: ReturnType<typeof vi.fn>;
  submitFaceSwap: ReturnType<typeof vi.fn>;
  submitCharacterSheet: ReturnType<typeof vi.fn>;
  getJobStatus: ReturnType<typeof vi.fn>;
  healthCheck: ReturnType<typeof vi.fn>;
};

describe('ModalJobRunnerAdapter', () => {
  let adapter: ModalJobRunnerAdapter;
  let mockRunner: {
    submitBaseImages: ReturnType<typeof vi.fn>;
    submitFaceSwap: ReturnType<typeof vi.fn>;
    submitCharacterSheet: ReturnType<typeof vi.fn>;
    getJobStatus: ReturnType<typeof vi.fn>;
    healthCheck: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    mockRunner = {
      submitBaseImages: vi.fn(),
      submitFaceSwap: vi.fn(),
      submitCharacterSheet: vi.fn(),
      getJobStatus: vi.fn(),
      healthCheck: vi.fn(),
    };

    // Set the global mock runner instance
    mockRunnerInstance = mockRunner;

    // Reset the mock implementation
    (ModalJobRunner as any).mockImplementation(function(this: any) {
      return mockRunnerInstance;
    });

    // Clear env vars before each test
    delete process.env.MODAL_ENDPOINT_URL;
    delete process.env.MODAL_WORKSPACE;

    adapter = new ModalJobRunnerAdapter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.MODAL_ENDPOINT_URL;
    delete process.env.MODAL_WORKSPACE;
  });

  describe('onModuleInit', () => {
    it('should initialize when MODAL_ENDPOINT_URL is set', async () => {
      process.env.MODAL_ENDPOINT_URL = 'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run';
      mockRunner.healthCheck.mockResolvedValue(true);

      await adapter.onModuleInit();

      expect(ModalJobRunner).toHaveBeenCalledWith({
        endpointUrl: 'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run',
        timeout: 180000,
      });
      expect(adapter.isAvailable()).toBe(true);
    });

    it('should initialize when MODAL_WORKSPACE is set', async () => {
      process.env.MODAL_WORKSPACE = 'test-workspace';
      mockRunner.healthCheck.mockResolvedValue(true);

      await adapter.onModuleInit();

      expect(ModalJobRunner).toHaveBeenCalledWith({
        endpointUrl: 'https://test-workspace--ryla-comfyui-comfyui-fastapi-app.modal.run',
        timeout: 180000,
      });
      expect(adapter.isAvailable()).toBe(true);
    });

    it('should not initialize when neither env var is set', async () => {
      await adapter.onModuleInit();

      expect(ModalJobRunner).not.toHaveBeenCalled();
      expect(adapter.isAvailable()).toBe(false);
    });

    it('should not initialize when health check fails', async () => {
      process.env.MODAL_ENDPOINT_URL = 'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run';
      mockRunner.healthCheck.mockResolvedValue(false);

      await adapter.onModuleInit();

      expect(adapter.isAvailable()).toBe(false);
    });

    it('should handle initialization errors gracefully', async () => {
      process.env.MODAL_ENDPOINT_URL = 'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run';
      mockRunner.healthCheck.mockRejectedValue(new Error('Connection failed'));

      await adapter.onModuleInit();

      expect(adapter.isAvailable()).toBe(false);
    });
  });

  describe('submitBaseImages', () => {
    it('should delegate to runner when initialized', async () => {
      process.env.MODAL_ENDPOINT_URL = 'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run';
      mockRunner.healthCheck.mockResolvedValue(true);
      mockRunner.submitBaseImages.mockResolvedValue('job-123');

      await adapter.onModuleInit();

      const result = await adapter.submitBaseImages({
        prompt: 'test prompt',
        nsfw: false,
        seed: 42,
      });

      expect(result).toBe('job-123');
      expect(mockRunner.submitBaseImages).toHaveBeenCalledWith({
        prompt: 'test prompt',
        nsfw: false,
        seed: 42,
      });
    });

    it('should throw error when not initialized', async () => {
      await expect(
        adapter.submitBaseImages({
          prompt: 'test prompt',
          nsfw: false,
        }),
      ).rejects.toThrow('Modal.com endpoint not initialized');
    });
  });

  describe('getJobStatus', () => {
    it('should delegate to runner when initialized', async () => {
      process.env.MODAL_ENDPOINT_URL = 'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run';
      mockRunner.healthCheck.mockResolvedValue(true);
      mockRunner.getJobStatus.mockResolvedValue({
        status: 'COMPLETED',
        output: { images: [] },
      });

      await adapter.onModuleInit();

      const result = await adapter.getJobStatus('job-123');

      expect(result.status).toBe('COMPLETED');
      expect(mockRunner.getJobStatus).toHaveBeenCalledWith('job-123');
    });

    it('should throw error when not initialized', async () => {
      await expect(adapter.getJobStatus('job-123')).rejects.toThrow(
        'Modal.com endpoint not initialized',
      );
    });
  });

  describe('healthCheck', () => {
    it('should return false when not initialized', async () => {
      const result = await adapter.healthCheck();
      expect(result).toBe(false);
    });

    it('should delegate to runner when initialized', async () => {
      process.env.MODAL_ENDPOINT_URL = 'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run';
      mockRunner.healthCheck.mockResolvedValue(true);

      await adapter.onModuleInit();

      const result = await adapter.healthCheck();
      expect(result).toBe(true);
      expect(mockRunner.healthCheck).toHaveBeenCalled();
    });
  });

  describe('isAvailable', () => {
    it('should return false when not initialized', () => {
      expect(adapter.isAvailable()).toBe(false);
    });

    it('should return true when initialized', async () => {
      process.env.MODAL_ENDPOINT_URL = 'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run';
      mockRunner.healthCheck.mockResolvedValue(true);

      await adapter.onModuleInit();

      expect(adapter.isAvailable()).toBe(true);
    });
  });
});
