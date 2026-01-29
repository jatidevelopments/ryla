import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PromptsService } from './prompts.service';
import { PromptsRepository } from '@ryla/data/repositories';
import { NotFoundException } from '@nestjs/common';

describe('PromptsService', () => {
  let service: PromptsService;
  let mockDb: any;
  let mockPromptsRepository: PromptsRepository;

  beforeEach(() => {
    mockDb = {};
    mockPromptsRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findFavorites: vi.fn(),
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorited: vi.fn(),
      getUsageStats: vi.fn(),
      getTopUsed: vi.fn(),
      trackUsage: vi.fn(),
      create: vi.fn(),
    } as unknown as PromptsRepository;

    service = new PromptsService(mockDb);
    // Replace the repository instance created in constructor
    (service as any).promptsRepository = mockPromptsRepository;
  });

  describe('findAll', () => {
    it('should return all prompts with options', async () => {
      const mockPrompts = [{ id: '1', name: 'Prompt 1' }];
      vi.mocked(mockPromptsRepository.findAll).mockResolvedValue(mockPrompts as any);

      const result = await service.findAll({
        userId: 'user-123',
        category: 'test',
        rating: 'sfw',
        search: 'test',
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual(mockPrompts);
      expect(mockPromptsRepository.findAll).toHaveBeenCalledWith({
        userId: 'user-123',
        category: 'test',
        rating: 'sfw',
        isActive: true,
        isPublic: true,
        search: 'test',
        limit: 10,
        offset: 0,
      });
    });
  });

  describe('findById', () => {
    it('should return prompt when found', async () => {
      const mockPrompt = { id: '1', name: 'Prompt 1' };
      vi.mocked(mockPromptsRepository.findById).mockResolvedValue(mockPrompt as any);

      const result = await service.findById('1');

      expect(result).toEqual(mockPrompt);
      expect(mockPromptsRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when prompt not found', async () => {
      vi.mocked(mockPromptsRepository.findById).mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findFavorites', () => {
    it('should return user favorites', async () => {
      const mockFavorites = [{ id: '1', name: 'Favorite 1' }];
      vi.mocked(mockPromptsRepository.findFavorites).mockResolvedValue(mockFavorites as any);

      const result = await service.findFavorites('user-123');

      expect(result).toEqual(mockFavorites);
      expect(mockPromptsRepository.findFavorites).toHaveBeenCalledWith('user-123');
    });
  });

  describe('addFavorite', () => {
    it('should add favorite and return success', async () => {
      const mockPrompt = { id: '1', name: 'Prompt 1' };
      vi.mocked(mockPromptsRepository.findById).mockResolvedValue(mockPrompt as any);
      vi.mocked(mockPromptsRepository.addFavorite).mockResolvedValue(undefined);

      const result = await service.addFavorite('user-123', '1');

      expect(result).toEqual({ favorited: true });
      expect(mockPromptsRepository.addFavorite).toHaveBeenCalledWith('user-123', '1');
    });

    it('should throw NotFoundException if prompt does not exist', async () => {
      vi.mocked(mockPromptsRepository.findById).mockResolvedValue(null);

      await expect(service.addFavorite('user-123', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite and return false', async () => {
      vi.mocked(mockPromptsRepository.removeFavorite).mockResolvedValue(true);

      const result = await service.removeFavorite('user-123', '1');

      expect(result).toEqual({ favorited: false });
      expect(mockPromptsRepository.removeFavorite).toHaveBeenCalledWith('user-123', '1');
    });

    it('should return true when favorite was not found', async () => {
      vi.mocked(mockPromptsRepository.removeFavorite).mockResolvedValue(false);

      const result = await service.removeFavorite('user-123', '1');

      expect(result).toEqual({ favorited: true });
    });
  });

  describe('isFavorited', () => {
    it('should return true when favorited', async () => {
      vi.mocked(mockPromptsRepository.isFavorited).mockResolvedValue(true);

      const result = await service.isFavorited('user-123', '1');

      expect(result).toEqual({ favorited: true });
    });

    it('should return false when not favorited', async () => {
      vi.mocked(mockPromptsRepository.isFavorited).mockResolvedValue(false);

      const result = await service.isFavorited('user-123', '1');

      expect(result).toEqual({ favorited: false });
    });
  });

  describe('getUsageStats', () => {
    it('should return usage stats', async () => {
      const mockPrompt = { id: '1', name: 'Prompt 1' };
      const mockStats = {
        totalUsage: 10,
        successCount: 8,
        failureCount: 2,
        successRate: 0.8,
        avgGenerationTimeMs: 1000,
        lastUsedAt: new Date(),
      };
      vi.mocked(mockPromptsRepository.findById).mockResolvedValue(mockPrompt as any);
      vi.mocked(mockPromptsRepository.getUsageStats).mockResolvedValue(mockStats as any);

      const result = await service.getUsageStats('1');

      expect(result).toEqual({
        promptId: '1',
        ...mockStats,
      });
    });

    it('should throw NotFoundException if prompt does not exist', async () => {
      vi.mocked(mockPromptsRepository.findById).mockResolvedValue(null);

      await expect(service.getUsageStats('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTopUsed', () => {
    it('should return top used prompts with default limit', async () => {
      const mockPrompts = [{ id: '1', name: 'Prompt 1' }];
      vi.mocked(mockPromptsRepository.getTopUsed).mockResolvedValue(mockPrompts as any);

      const result = await service.getTopUsed();

      expect(result).toEqual(mockPrompts);
      expect(mockPromptsRepository.getTopUsed).toHaveBeenCalledWith(10);
    });

    it('should return top used prompts with custom limit', async () => {
      const mockPrompts = [{ id: '1', name: 'Prompt 1' }];
      vi.mocked(mockPromptsRepository.getTopUsed).mockResolvedValue(mockPrompts as any);

      const result = await service.getTopUsed(5);

      expect(result).toEqual(mockPrompts);
      expect(mockPromptsRepository.getTopUsed).toHaveBeenCalledWith(5);
    });
  });

  describe('trackUsage', () => {
    it('should track prompt usage', async () => {
      const mockUsage = { id: 'usage-1', promptId: '1', success: true };
      vi.mocked(mockPromptsRepository.trackUsage).mockResolvedValue(mockUsage as any);

      const result = await service.trackUsage({
        promptId: '1',
        userId: 'user-123',
        success: true,
      });

      expect(result).toEqual(mockUsage);
      expect(mockPromptsRepository.trackUsage).toHaveBeenCalledWith({
        promptId: '1',
        userId: 'user-123',
        characterId: undefined,
        postId: undefined,
        jobId: undefined,
        scene: undefined,
        environment: undefined,
        outfit: undefined,
        success: true,
        generationTimeMs: undefined,
        errorMessage: undefined,
      });
    });
  });

  describe('create', () => {
    it('should create new prompt', async () => {
      const mockPrompt = { id: '1', name: 'New Prompt' };
      vi.mocked(mockPromptsRepository.create).mockResolvedValue(mockPrompt as any);

      const result = await service.create({
        userId: 'user-123',
        name: 'New Prompt',
        category: 'test',
        rating: 'sfw',
      });

      expect(result).toEqual(mockPrompt);
      expect(mockPromptsRepository.create).toHaveBeenCalledWith({
        createdBy: 'user-123',
        name: 'New Prompt',
        description: undefined,
        category: 'test',
        subcategory: undefined,
        template: undefined,
        negativePrompt: undefined,
        requiredDNA: [],
        tags: [],
        rating: 'sfw',
        recommendedWorkflow: undefined,
        aspectRatio: undefined,
        isSystemPrompt: false,
        isPublic: false,
        isActive: true,
      });
    });
  });
});
