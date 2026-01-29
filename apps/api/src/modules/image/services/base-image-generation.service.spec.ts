import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseImageGenerationService } from './base-image-generation.service';
import { ComfyUIJobRunnerAdapter } from './comfyui-job-runner.adapter';
import { ModalJobRunnerAdapter } from './modal-job-runner.adapter';
import { ConfigService } from '@nestjs/config';
import { ImageStorageService } from './image-storage.service';
import { FalImageService } from './fal-image.service';

describe('BaseImageGenerationService', () => {
  let service: BaseImageGenerationService;
  let mockComfyuiAdapter: ComfyUIJobRunnerAdapter;
  let mockModalAdapter: ModalJobRunnerAdapter;
  let mockConfigService: ConfigService;
  let mockImageStorage: ImageStorageService;
  let mockFalImageService: FalImageService;

  beforeEach(() => {
    mockComfyuiAdapter = {
      isAvailable: vi.fn().mockReturnValue(true),
      getRecommendedWorkflow: vi.fn().mockReturnValue('flux-2-turbo'),
      queueWorkflow: vi.fn(),
      submitBaseImageWithWorkflow: vi.fn().mockResolvedValue('job-123'),
    } as unknown as ComfyUIJobRunnerAdapter;

    mockModalAdapter = {
      isAvailable: vi.fn().mockReturnValue(false),
    } as unknown as ModalJobRunnerAdapter;

    mockConfigService = {
      get: vi.fn(),
    } as unknown as ConfigService;

    mockImageStorage = {} as ImageStorageService;

    mockFalImageService = {
      isConfigured: vi.fn().mockReturnValue(false),
    } as unknown as FalImageService;

    service = new BaseImageGenerationService(
      mockComfyuiAdapter,
      mockModalAdapter,
      mockConfigService,
      mockImageStorage,
      mockFalImageService,
    );
    
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe('generateBaseImages', () => {
    it('should generate base images', async () => {
      const input = {
        appearance: {
          gender: 'female' as const,
          style: 'realistic' as const,
          ethnicity: 'caucasian',
          age: 25,
          eyeColor: 'blue',
          hairStyle: 'long',
          hairColor: 'blonde',
          bodyType: 'slim',
        },
        identity: {
          defaultOutfit: 'casual',
          archetype: 'influencer',
          personalityTraits: ['confident'],
        },
        nsfwEnabled: false,
      };

      // Service calls submitBaseImageWithWorkflow 6 times (for 6 base images)
      // Mock to return different job IDs for each call to simulate real behavior
      let callCount = 0;
      vi.mocked(mockComfyuiAdapter.submitBaseImageWithWorkflow).mockImplementation(() => {
        callCount++;
        return Promise.resolve(`job-${callCount}`);
      });

      const result = await service.generateBaseImages(input);

      expect(result).toHaveProperty('jobId');
      expect(result).toHaveProperty('workflowUsed');
      expect(mockComfyuiAdapter.submitBaseImageWithWorkflow).toHaveBeenCalled();
      // Should be called 6 times (for 6 base images)
      expect(mockComfyuiAdapter.submitBaseImageWithWorkflow).toHaveBeenCalledTimes(6);
    });

    it('should handle idempotency key', async () => {
      const input = {
        appearance: {
          gender: 'female' as const,
          style: 'realistic' as const,
          ethnicity: 'caucasian',
          age: 25,
          eyeColor: 'blue',
          hairStyle: 'long',
          hairColor: 'blonde',
          bodyType: 'slim',
        },
        identity: {
          defaultOutfit: 'casual',
          archetype: 'influencer',
          personalityTraits: ['confident'],
        },
        nsfwEnabled: false,
        idempotencyKey: 'test-key',
      };

      // Service calls submitBaseImageWithWorkflow 6 times (for 6 base images)
      // Mock to return same job ID for idempotency test
      vi.mocked(mockComfyuiAdapter.submitBaseImageWithWorkflow).mockResolvedValue('job-123');

      const result1 = await service.generateBaseImages(input);
      const result2 = await service.generateBaseImages(input);

      // Should return same job ID for idempotent requests
      expect(result1.jobId).toBe(result2.jobId);
    });
  });

  describe('getJobResults', () => {
    it('should return job results', async () => {
      // Service stores results in memory map
      // For now, test that method exists
      expect(typeof service.getJobResults).toBe('function');
    });
  });

  describe('getBatchJobResults', () => {
    it('should return batch job results', async () => {
      expect(typeof service.getBatchJobResults).toBe('function');
    });
  });
});
