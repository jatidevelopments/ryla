import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CharacterService } from './character.service';
import { CharacterCacheService } from './character-cache.service';
import { CharacterRepository } from '@ryla/data';

describe('CharacterService', () => {
  let service: CharacterService;
  let mockCharacterCacheService: CharacterCacheService;
  let mockCharacterRepository: CharacterRepository;

  beforeEach(() => {
    mockCharacterCacheService = {} as CharacterCacheService;
    mockCharacterRepository = {
      findAll: vi.fn(),
    } as unknown as CharacterRepository;

    service = new CharacterService(mockCharacterCacheService, mockCharacterRepository);
  });

  describe('findAll', () => {
    it('should return all characters for user', async () => {
      const userId = 'user-123';
      const mockCharacters = [
        { id: 'char-1', name: 'Character 1' },
        { id: 'char-2', name: 'Character 2' },
      ];
      vi.mocked(mockCharacterRepository.findAll).mockResolvedValue(mockCharacters as any);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockCharacters);
      expect(mockCharacterRepository.findAll).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when user has no characters', async () => {
      const userId = 'user-123';
      vi.mocked(mockCharacterRepository.findAll).mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
      expect(mockCharacterRepository.findAll).toHaveBeenCalledWith(userId);
    });
  });
});
