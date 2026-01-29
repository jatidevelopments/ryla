import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CharacterController } from './character.controller';
import { CharacterService } from './services/character.service';
import { BaseImageGenerationService } from '../image/services/base-image-generation.service';
import { CharacterSheetService } from '../image/services/character-sheet.service';
import { ProfilePictureSetService } from '../image/services/profile-picture-set.service';
import { CreditManagementService } from '../credits/services/credit-management.service';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';

describe('CharacterController', () => {
  let controller: CharacterController;
  let mockCharacterService: CharacterService;
  let mockBaseImageGenerationService: BaseImageGenerationService;
  let mockCharacterSheetService: CharacterSheetService;
  let mockProfilePictureSetService: ProfilePictureSetService;
  let mockCreditService: CreditManagementService;
  let mockDb: any;
  let mockUser: IJwtPayload;

  beforeEach(() => {
    mockUser = {
      userId: 'user-123',
      email: 'test@example.com',
    } as IJwtPayload;

    mockDb = {
      query: {
        characters: {
          findFirst: vi.fn(),
        },
      },
    };

    mockCharacterService = {
      findAll: vi.fn(),
    } as unknown as CharacterService;

    mockBaseImageGenerationService = {
      generateBaseImages: vi.fn(),
      getJobResults: vi.fn(),
      getBatchJobResults: vi.fn(),
    } as unknown as BaseImageGenerationService;

    mockCharacterSheetService = {
      generateCharacterSheet: vi.fn(),
      getJobResults: vi.fn(),
    } as unknown as CharacterSheetService;

    mockProfilePictureSetService = {
      generateProfilePictureSet: vi.fn(),
      regenerateProfilePicture: vi.fn(),
      getJobResult: vi.fn(),
    } as unknown as ProfilePictureSetService;

    mockCreditService = {
      deductCredits: vi.fn(),
      deductCreditsRaw: vi.fn(),
    } as unknown as CreditManagementService;

    controller = new CharacterController(
      mockDb,
      mockCharacterService,
      mockBaseImageGenerationService,
      mockCharacterSheetService,
      mockProfilePictureSetService,
      mockCreditService,
    );
  });

  describe('getMyCharacters', () => {
    it('should return user characters', async () => {
      const mockCharacters = [{ id: 'char-1', name: 'Character 1' }];
      vi.mocked(mockCharacterService.findAll).mockResolvedValue(mockCharacters as any);

      const result = await controller.getMyCharacters(mockUser);

      expect(result).toEqual(mockCharacters);
      expect(mockCharacterService.findAll).toHaveBeenCalledWith('user-123');
    });
  });

  describe('generateBaseImages', () => {
    it('should generate base images with credit deduction', async () => {
      const dto = {
        appearance: {},
        identity: {},
        nsfwEnabled: false,
      };
      const mockResult = { jobId: 'job-123', allJobIds: ['job-123'] };
      const mockCreditResult = { creditsDeducted: 80, balanceAfter: 920 };

      vi.mocked(mockCreditService.deductCredits).mockResolvedValue(mockCreditResult as any);
      vi.mocked(mockBaseImageGenerationService.generateBaseImages).mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.generateBaseImages(mockUser, dto as any);

      expect(result.jobId).toBe('job-123');
      expect(result.creditsDeducted).toBe(80);
      expect(mockCreditService.deductCredits).toHaveBeenCalled();
    });

    it('should skip credit deduction when skipCreditDeduction is true', async () => {
      const dto = {
        appearance: {},
        identity: {},
        skipCreditDeduction: true,
      };
      const mockResult = { jobId: 'job-123' };

      vi.mocked(mockBaseImageGenerationService.generateBaseImages).mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.generateBaseImages(mockUser, dto as any);

      expect(result.creditSkipped).toBe(true);
      expect(mockCreditService.deductCredits).not.toHaveBeenCalled();
    });
  });

  describe('getBaseImageResults', () => {
    it('should get single job results', async () => {
      const mockResults = {
        status: 'completed',
        images: [{ id: 'img-1', url: 'https://example.com/img.jpg' }],
      };
      vi.mocked(mockBaseImageGenerationService.getJobResults).mockResolvedValue(
        mockResults as any,
      );

      const result = await controller.getBaseImageResults(mockUser, 'job-123', undefined);

      expect(result.status).toBe('completed');
      expect(mockBaseImageGenerationService.getJobResults).toHaveBeenCalledWith(
        'job-123',
        'user-123',
      );
    });

    it('should get batch job results', async () => {
      const mockResults = {
        status: 'completed',
        images: [{ id: 'img-1' }],
      };
      vi.mocked(mockBaseImageGenerationService.getBatchJobResults).mockResolvedValue(
        mockResults as any,
      );

      const result = await controller.getBaseImageResults(
        mockUser,
        'job-123',
        'job-123,job-124',
      );

      expect(result.status).toBe('completed');
      expect(mockBaseImageGenerationService.getBatchJobResults).toHaveBeenCalled();
    });
  });

  describe('generateCharacterSheet', () => {
    it('should generate character sheet', async () => {
      const dto = {
        baseImageUrl: 'https://example.com/base.jpg',
        characterId: 'char-123',
        nsfwEnabled: false,
      };
      const mockResult = { jobId: 'job-123', variations: 7 };
      const mockCreditResult = { creditsDeducted: 200, balanceAfter: 800 };

      vi.mocked(mockCreditService.deductCredits).mockResolvedValue(mockCreditResult as any);
      vi.mocked(mockCharacterSheetService.generateCharacterSheet).mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.generateCharacterSheet(mockUser, dto as any);

      expect(result.jobId).toBe('job-123');
      expect(result.creditsDeducted).toBe(200);
      expect(mockCreditService.deductCredits).toHaveBeenCalled();
    });
  });

  describe('generateProfilePictureSet', () => {
    it('should generate profile picture set', async () => {
      const dto = {
        baseImageUrl: 'https://example.com/base.jpg',
        characterId: 'char-123',
        setId: 'classic',
        nsfwEnabled: false,
      };
      const mockResult = { jobId: 'job-123', allJobIds: ['job-123'] };
      const mockCreditResult = { creditsDeducted: 200, balanceAfter: 800 };

      vi.mocked(mockDb.query.characters.findFirst).mockResolvedValue({
        config: {},
        name: 'Test Character',
      });
      vi.mocked(mockCreditService.deductCredits).mockResolvedValue(mockCreditResult as any);
      vi.mocked(mockProfilePictureSetService.generateProfilePictureSet).mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.generateProfilePictureSet(mockUser, dto as any);

      expect(result.jobId).toBe('job-123');
      expect(result.creditsDeducted).toBe(200);
    });
  });
});
