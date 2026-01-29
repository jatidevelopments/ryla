/**
 * Image Generation Service Tests
 *
 * Unit tests for image generation business logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageGenerationService } from './image-generation.service';
import type {
  GenerationJobsRepository,
  NotificationsRepository,
} from '@ryla/data';
import type {
  RunPodJobRunner,
  RunPodJobStatus,
} from './image-generation.service';

// Mock repositories
const mockGenerationJobsRepo = {
  createJob: vi.fn(),
  updateById: vi.fn(),
  getById: vi.fn(),
} as unknown as GenerationJobsRepository;

const mockNotificationsRepo = {
  create: vi.fn(),
} as unknown as NotificationsRepository;

// Mock RunPod runner
const mockRunPod: RunPodJobRunner = {
  submitBaseImages: vi.fn(),
  submitFaceSwap: vi.fn(),
  submitCharacterSheet: vi.fn(),
  getJobStatus: vi.fn(),
};

describe('ImageGenerationService', () => {
  let service: ImageGenerationService;

  beforeEach(() => {
    service = new ImageGenerationService(
      mockGenerationJobsRepo,
      mockRunPod,
      mockNotificationsRepo
    );
    vi.clearAllMocks();
  });

  describe('startBaseImages', () => {
    it('should create job and submit to RunPod with correct prompt', async () => {
      const input = {
        userId: 'user-1',
        characterId: 'char-1',
        appearance: {
          gender: 'female' as const,
          style: 'realistic' as const,
          ethnicity: 'caucasian',
          age: 25,
          hairStyle: 'long wavy',
          hairColor: 'blonde',
          eyeColor: 'blue',
          bodyType: 'athletic',
        },
        identity: {
          defaultOutfit: 'casual jeans and t-shirt',
          archetype: 'girl next door',
          personalityTraits: ['friendly', 'outgoing'],
        },
        nsfwEnabled: false,
        seed: 12345,
      };

      const mockJob = {
        id: 'job-1',
        userId: input.userId,
        characterId: input.characterId,
        type: 'character_generation',
        status: 'queued',
        externalJobId: null,
        startedAt: null,
      };

      const mockUpdatedJob = {
        ...mockJob,
        externalJobId: 'runpod-job-123',
        startedAt: new Date(),
      };

      vi.mocked(mockGenerationJobsRepo.createJob).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.submitBaseImages).mockResolvedValue(
        'runpod-job-123'
      );
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue(
        mockUpdatedJob as any
      );

      const result = await service.startBaseImages(input);

      expect(result.jobId).toBe('job-1');
      expect(result.externalJobId).toBe('runpod-job-123');
      expect(result.prompt).toContain('Photo');
      expect(result.prompt).toContain('woman');
      expect(result.prompt).toContain('blonde');
      expect(result.prompt).toContain('casual jeans and t-shirt');
      expect(result.negativePrompt).toBeDefined();

      expect(mockGenerationJobsRepo.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: input.userId,
          characterId: input.characterId,
          type: 'character_generation',
          status: 'queued',
          imageCount: 3,
        })
      );

      expect(mockRunPod.submitBaseImages).toHaveBeenCalledWith({
        prompt: expect.any(String),
        nsfw: false,
        seed: 12345,
        useZImage: undefined,
      });

      expect(mockGenerationJobsRepo.updateById).toHaveBeenCalledWith(
        'job-1',
        expect.objectContaining({
          externalJobId: 'runpod-job-123',
          startedAt: expect.any(Date),
        })
      );
    });

    it('should handle anime style correctly', async () => {
      const input = {
        userId: 'user-1',
        appearance: {
          gender: 'male' as const,
          style: 'anime' as const,
          ethnicity: 'asian',
          age: 20,
          hairStyle: 'spiky',
          hairColor: 'black',
          eyeColor: 'brown',
          bodyType: 'slim',
        },
        identity: {
          defaultOutfit: 'school uniform',
          archetype: 'shonen protagonist',
          personalityTraits: ['determined'],
        },
        nsfwEnabled: false,
      };

      const mockJob = {
        id: 'job-1',
        userId: input.userId,
        type: 'character_generation',
        status: 'queued',
        externalJobId: null,
        startedAt: null,
      };

      vi.mocked(mockGenerationJobsRepo.createJob).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.submitBaseImages).mockResolvedValue(
        'runpod-job-123'
      );
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue({
        ...mockJob,
        externalJobId: 'runpod-job-123',
        startedAt: new Date(),
      } as any);

      const result = await service.startBaseImages(input);

      expect(result.prompt).toContain('Anime illustration');
      expect(result.prompt).toContain('man');
    });

    it('should handle NSFW enabled', async () => {
      const input = {
        userId: 'user-1',
        appearance: {
          gender: 'female' as const,
          style: 'realistic' as const,
          ethnicity: 'caucasian',
          age: 25,
          hairStyle: 'long',
          hairColor: 'brown',
          eyeColor: 'green',
          bodyType: 'curvy',
          breastSize: 'large',
        },
        identity: {
          defaultOutfit: 'bikini',
          archetype: 'beach model',
          personalityTraits: [],
        },
        nsfwEnabled: true,
      };

      const mockJob = {
        id: 'job-1',
        userId: input.userId,
        type: 'character_generation',
        status: 'queued',
        externalJobId: null,
        startedAt: null,
      };

      vi.mocked(mockGenerationJobsRepo.createJob).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.submitBaseImages).mockResolvedValue(
        'runpod-job-123'
      );
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue({
        ...mockJob,
        externalJobId: 'runpod-job-123',
        startedAt: new Date(),
      } as any);

      await service.startBaseImages(input);

      expect(mockRunPod.submitBaseImages).toHaveBeenCalledWith(
        expect.objectContaining({
          nsfw: true,
        })
      );
    });

    it('should handle useZImage option', async () => {
      const input = {
        userId: 'user-1',
        appearance: {
          gender: 'female' as const,
          style: 'realistic' as const,
          ethnicity: 'caucasian',
          age: 25,
          hairStyle: 'long',
          hairColor: 'blonde',
          eyeColor: 'blue',
          bodyType: 'athletic',
        },
        identity: {
          defaultOutfit: 'casual',
          archetype: '',
          personalityTraits: [],
        },
        nsfwEnabled: false,
        useZImage: true,
      };

      const mockJob = {
        id: 'job-1',
        userId: input.userId,
        type: 'character_generation',
        status: 'queued',
        externalJobId: null,
        startedAt: null,
      };

      vi.mocked(mockGenerationJobsRepo.createJob).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.submitBaseImages).mockResolvedValue(
        'runpod-job-123'
      );
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue({
        ...mockJob,
        externalJobId: 'runpod-job-123',
        startedAt: new Date(),
      } as any);

      await service.startBaseImages(input);

      expect(mockRunPod.submitBaseImages).toHaveBeenCalledWith(
        expect.objectContaining({
          useZImage: true,
        })
      );
    });
  });

  describe('startFaceSwap', () => {
    it('should create job and submit face swap to RunPod', async () => {
      const input = {
        userId: 'user-1',
        characterId: 'char-1',
        baseImageUrl: 'https://example.com/image.jpg',
        prompt: 'A beautiful portrait',
        nsfw: false,
        seed: 54321,
      };

      const mockJob = {
        id: 'job-2',
        userId: input.userId,
        characterId: input.characterId,
        type: 'image_generation',
        status: 'queued',
        externalJobId: null,
        startedAt: null,
      };

      const mockUpdatedJob = {
        ...mockJob,
        externalJobId: 'runpod-face-swap-123',
        startedAt: new Date(),
      };

      vi.mocked(mockGenerationJobsRepo.createJob).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.submitFaceSwap).mockResolvedValue(
        'runpod-face-swap-123'
      );
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue(
        mockUpdatedJob as any
      );

      const result = await service.startFaceSwap(input);

      expect(result.jobId).toBe('job-2');
      expect(result.externalJobId).toBe('runpod-face-swap-123');

      expect(mockGenerationJobsRepo.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: input.userId,
          characterId: input.characterId,
          type: 'image_generation',
          status: 'queued',
          imageCount: 1,
        })
      );

      expect(mockRunPod.submitFaceSwap).toHaveBeenCalledWith({
        baseImageUrl: input.baseImageUrl,
        prompt: input.prompt,
        nsfw: input.nsfw,
        seed: input.seed,
      });
    });
  });

  describe('startCharacterSheet', () => {
    it('should create job and submit character sheet to RunPod', async () => {
      const input = {
        userId: 'user-1',
        characterId: 'char-1',
        baseImageUrl: 'https://example.com/base.jpg',
        nsfw: false,
        angles: ['front', 'side', 'back'],
      };

      const mockJob = {
        id: 'job-3',
        userId: input.userId,
        characterId: input.characterId,
        type: 'character_generation',
        status: 'queued',
        externalJobId: null,
        startedAt: null,
      };

      const mockUpdatedJob = {
        ...mockJob,
        externalJobId: 'runpod-sheet-123',
        startedAt: new Date(),
      };

      vi.mocked(mockGenerationJobsRepo.createJob).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.submitCharacterSheet).mockResolvedValue(
        'runpod-sheet-123'
      );
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue(
        mockUpdatedJob as any
      );

      const result = await service.startCharacterSheet(input);

      expect(result.jobId).toBe('job-3');
      expect(result.externalJobId).toBe('runpod-sheet-123');

      expect(mockGenerationJobsRepo.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: input.userId,
          characterId: input.characterId,
          type: 'character_generation',
          status: 'queued',
          imageCount: 10,
        })
      );

      expect(mockRunPod.submitCharacterSheet).toHaveBeenCalledWith({
        baseImageUrl: input.baseImageUrl,
        nsfw: input.nsfw,
        angles: input.angles,
      });
    });

    it('should handle missing angles', async () => {
      const input = {
        userId: 'user-1',
        baseImageUrl: 'https://example.com/base.jpg',
        nsfw: false,
      };

      const mockJob = {
        id: 'job-3',
        userId: input.userId,
        type: 'character_generation',
        status: 'queued',
        externalJobId: null,
        startedAt: null,
      };

      vi.mocked(mockGenerationJobsRepo.createJob).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.submitCharacterSheet).mockResolvedValue(
        'runpod-sheet-123'
      );
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue({
        ...mockJob,
        externalJobId: 'runpod-sheet-123',
        startedAt: new Date(),
      } as any);

      await service.startCharacterSheet(input);

      expect(mockRunPod.submitCharacterSheet).toHaveBeenCalledWith({
        baseImageUrl: input.baseImageUrl,
        nsfw: input.nsfw,
        angles: undefined,
      });
    });
  });

  describe('syncJobStatus', () => {
    it('should sync job status from RunPod', async () => {
      const jobId = 'job-1';
      const mockJob = {
        id: jobId,
        userId: 'user-1',
        externalJobId: 'runpod-123',
        status: 'queued',
      };

      const runpodStatus: RunPodJobStatus = {
        status: 'COMPLETED',
        output: { images: ['url1', 'url2'] },
      };

      const mockUpdatedJob = {
        ...mockJob,
        status: 'completed',
        output: runpodStatus.output,
        completedAt: new Date(),
      };

      vi.mocked(mockGenerationJobsRepo.getById).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.getJobStatus).mockResolvedValue(runpodStatus);
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue(
        mockUpdatedJob as any
      );

      const result = await service.syncJobStatus(jobId);

      expect(result).toEqual(mockUpdatedJob);
      expect(mockRunPod.getJobStatus).toHaveBeenCalledWith('runpod-123');
      expect(mockGenerationJobsRepo.updateById).toHaveBeenCalledWith(
        jobId,
        expect.objectContaining({
          status: 'completed',
          output: runpodStatus.output,
          completedAt: expect.any(Date),
        })
      );
    });

    it('should return null if job not found', async () => {
      vi.mocked(mockGenerationJobsRepo.getById).mockResolvedValue(null);

      const result = await service.syncJobStatus('non-existent');

      expect(result).toBeNull();
      expect(mockRunPod.getJobStatus).not.toHaveBeenCalled();
    });

    it('should return job if no externalJobId', async () => {
      const mockJob = {
        id: 'job-1',
        userId: 'user-1',
        externalJobId: null,
        status: 'queued',
      };

      vi.mocked(mockGenerationJobsRepo.getById).mockResolvedValue(
        mockJob as any
      );

      const result = await service.syncJobStatus('job-1');

      expect(result).toEqual(mockJob);
      expect(mockRunPod.getJobStatus).not.toHaveBeenCalled();
    });

    it('should map RunPod statuses correctly', async () => {
      const statusMappings = [
        { runpod: 'IN_QUEUE', expected: 'queued' },
        { runpod: 'IN_PROGRESS', expected: 'processing' },
        { runpod: 'COMPLETED', expected: 'completed' },
        { runpod: 'FAILED', expected: 'failed' },
        { runpod: 'UNKNOWN', expected: 'processing' }, // default
      ];

      for (const mapping of statusMappings) {
        const mockJob = {
          id: 'job-1',
          userId: 'user-1',
          externalJobId: 'runpod-123',
          status: 'queued',
        };

        vi.mocked(mockGenerationJobsRepo.getById).mockResolvedValue(
          mockJob as any
        );
        vi.mocked(mockRunPod.getJobStatus).mockResolvedValue({
          status: mapping.runpod,
        });
        vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue({
          ...mockJob,
          status: mapping.expected,
        } as any);

        await service.syncJobStatus('job-1');

        expect(mockGenerationJobsRepo.updateById).toHaveBeenCalledWith(
          'job-1',
          expect.objectContaining({
            status: mapping.expected,
          })
        );

        vi.clearAllMocks();
      }
    });

    it('should create notification when job completes', async () => {
      const jobId = 'job-1';
      const mockJob = {
        id: jobId,
        userId: 'user-1',
        characterId: 'char-1',
        externalJobId: 'runpod-123',
        status: 'processing',
        type: 'character_generation',
      };

      const runpodStatus: RunPodJobStatus = {
        status: 'COMPLETED',
        output: { images: ['url1'] },
      };

      vi.mocked(mockGenerationJobsRepo.getById).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.getJobStatus).mockResolvedValue(runpodStatus);
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue({
        ...mockJob,
        status: 'completed',
      } as any);

      await service.syncJobStatus(jobId);

      expect(mockNotificationsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'generation.completed',
          title: 'Generation complete',
          body: 'Your character generation is ready!',
        })
      );
    });

    it('should create notification when job fails', async () => {
      const jobId = 'job-1';
      const mockJob = {
        id: jobId,
        userId: 'user-1',
        externalJobId: 'runpod-123',
        status: 'processing',
        type: 'image_generation',
      };

      const runpodStatus: RunPodJobStatus = {
        status: 'FAILED',
        error: 'Generation failed',
      };

      vi.mocked(mockGenerationJobsRepo.getById).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.getJobStatus).mockResolvedValue(runpodStatus);
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue({
        ...mockJob,
        status: 'failed',
      } as any);

      await service.syncJobStatus(jobId);

      expect(mockNotificationsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'generation.failed',
          title: 'Generation failed',
          body: 'Generation failed',
        })
      );
    });

    it('should not create notification if status unchanged', async () => {
      const jobId = 'job-1';
      const mockJob = {
        id: jobId,
        userId: 'user-1',
        externalJobId: 'runpod-123',
        status: 'completed',
        type: 'character_generation',
      };

      const runpodStatus: RunPodJobStatus = {
        status: 'COMPLETED',
      };

      vi.mocked(mockGenerationJobsRepo.getById).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.getJobStatus).mockResolvedValue(runpodStatus);
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue(
        mockJob as any
      );

      await service.syncJobStatus(jobId);

      expect(mockNotificationsRepo.create).not.toHaveBeenCalled();
    });

    it('should handle missing notificationsRepo gracefully', async () => {
      const serviceWithoutNotifications = new ImageGenerationService(
        mockGenerationJobsRepo,
        mockRunPod
        // No notificationsRepo
      );

      const jobId = 'job-1';
      const mockJob = {
        id: jobId,
        userId: 'user-1',
        externalJobId: 'runpod-123',
        status: 'processing',
        type: 'character_generation',
      };

      const runpodStatus: RunPodJobStatus = {
        status: 'COMPLETED',
      };

      vi.mocked(mockGenerationJobsRepo.getById).mockResolvedValue(
        mockJob as any
      );
      vi.mocked(mockRunPod.getJobStatus).mockResolvedValue(runpodStatus);
      vi.mocked(mockGenerationJobsRepo.updateById).mockResolvedValue({
        ...mockJob,
        status: 'completed',
      } as any);

      // Should not throw
      await expect(
        serviceWithoutNotifications.syncJobStatus(jobId)
      ).resolves.toBeDefined();
    });
  });
});
