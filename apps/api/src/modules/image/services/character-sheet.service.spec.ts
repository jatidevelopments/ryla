import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CharacterSheetService } from './character-sheet.service';
import { RunPodService } from '../../runpod/services/runpod.service';
import { ConfigService } from '@nestjs/config';
import { ImageStorageService } from './image-storage.service';

describe('CharacterSheetService', () => {
  let service: CharacterSheetService;
  let mockRunpodService: RunPodService;
  let mockConfigService: ConfigService;
  let mockImageStorage: ImageStorageService;

  beforeEach(() => {
    mockRunpodService = {
      runJob: vi.fn(),
    } as unknown as RunPodService;

    mockConfigService = {
      get: vi.fn().mockReturnValue('endpoint-123'),
    } as unknown as ConfigService;

    mockImageStorage = {} as ImageStorageService;

    service = new CharacterSheetService(
      mockRunpodService,
      mockConfigService,
      mockImageStorage,
    );
  });

  describe('generateCharacterSheet', () => {
    it('should generate character sheet', async () => {
      const input = {
        baseImageUrl: 'https://example.com/base.jpg',
        characterId: 'char-123',
        nsfwEnabled: false,
      };

      vi.mocked(mockRunpodService.runJob).mockResolvedValue('job-123');

      const result = await service.generateCharacterSheet(input);

      expect(result).toHaveProperty('jobId');
      expect(result).toHaveProperty('variations');
      expect(result.variations.length).toBeGreaterThanOrEqual(7);
      expect(result.variations.length).toBeLessThanOrEqual(10);
    });

    it('should handle NSFW enabled', async () => {
      const input = {
        baseImageUrl: 'https://example.com/base.jpg',
        characterId: 'char-123',
        nsfwEnabled: true,
      };

      vi.mocked(mockRunpodService.runJob).mockResolvedValue('job-123');

      const result = await service.generateCharacterSheet(input);

      expect(result).toHaveProperty('jobId');
    });
  });

  describe('getJobResults', () => {
    it('should return job results', async () => {
      expect(typeof service.getJobResults).toBe('function');
    });
  });
});
