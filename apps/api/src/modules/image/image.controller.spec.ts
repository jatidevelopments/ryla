import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageController } from './image.controller';
import { ImageGenerationService } from '@ryla/business';
import { BaseImageGenerationService } from './services/base-image-generation.service';
import { ComfyUIJobRunnerAdapter } from './services/comfyui-job-runner.adapter';
import { InpaintEditService } from './services/inpaint-edit.service';
import { StudioGenerationService } from './services/studio-generation.service';
import { ComfyUIResultsService } from './services/comfyui-results.service';
import { CreditManagementService } from '../credits/services/credit-management.service';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';

describe('ImageController', () => {
  let controller: ImageController;
  let mockImageGenerationService: ImageGenerationService;
  let mockBaseImageService: BaseImageGenerationService;
  let mockComfyuiAdapter: ComfyUIJobRunnerAdapter;
  let mockInpaintEditService: InpaintEditService;
  let mockStudioGenerationService: StudioGenerationService;
  let mockComfyuiResultsService: ComfyUIResultsService;
  let mockCreditService: CreditManagementService;
  let mockUser: IJwtPayload;

  beforeEach(() => {
    mockUser = {
      userId: 'user-123',
      email: 'test@example.com',
    } as IJwtPayload;

    mockImageGenerationService = {
      startFaceSwap: vi.fn(),
    } as unknown as ImageGenerationService;

    mockBaseImageService = {
      generateBaseImages: vi.fn(),
    } as unknown as BaseImageGenerationService;

    mockComfyuiAdapter = {} as ComfyUIJobRunnerAdapter;

    mockInpaintEditService = {
      inpaintEdit: vi.fn(),
    } as unknown as InpaintEditService;

    mockStudioGenerationService = {
      generateStudioImages: vi.fn(),
    } as unknown as StudioGenerationService;

    mockComfyuiResultsService = {
      getJobResult: vi.fn(),
    } as unknown as ComfyUIResultsService;

    mockCreditService = {
      deductCredits: vi.fn(),
    } as unknown as CreditManagementService;

    controller = new ImageController(
      mockImageGenerationService,
      mockBaseImageService,
      mockComfyuiAdapter,
      mockInpaintEditService,
      mockStudioGenerationService,
      mockComfyuiResultsService,
      mockCreditService,
    );
  });

  describe('generateBaseImages', () => {
    it('should generate base images', async () => {
      const dto = {
        appearance: {},
        identity: {},
        nsfwEnabled: false,
      };
      const mockResult = {
        jobId: 'job-123',
        workflowUsed: 'workflow-1',
      };
      vi.mocked(mockBaseImageService.generateBaseImages).mockResolvedValue(mockResult as any);

      const result = await controller.generateBaseImages(mockUser, dto as any);

      expect(result.jobId).toBe('job-123');
      expect(result.userId).toBe('user-123');
      expect(result.workflowUsed).toBe('workflow-1');
      expect(result.status).toBe('queued');
    });
  });

  describe('generateFaceSwap', () => {
    it('should generate face swap', async () => {
      const dto = {
        sourceImageUrl: 'https://example.com/source.jpg',
        targetImageUrl: 'https://example.com/target.jpg',
      };
      const mockResult = { jobId: 'job-123' };
      vi.mocked(mockImageGenerationService.startFaceSwap).mockResolvedValue(mockResult as any);

      const result = await controller.generateFaceSwap(mockUser, dto as any);

      expect(result).toEqual(mockResult);
      expect(mockImageGenerationService.startFaceSwap).toHaveBeenCalledWith({
        ...dto,
        userId: 'user-123',
      });
    });
  });
});
