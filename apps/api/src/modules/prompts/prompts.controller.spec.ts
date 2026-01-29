import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PromptsController } from './prompts.controller';
import { PromptsService } from './services/prompts.service';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';

describe('PromptsController', () => {
  let controller: PromptsController;
  let mockPromptsService: PromptsService;
  let mockUser: IJwtPayload;

  beforeEach(() => {
    mockUser = {
      userId: 'user-123',
      email: 'test@example.com',
    } as IJwtPayload;

    mockPromptsService = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findFavorites: vi.fn(),
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorited: vi.fn(),
      getUsageStats: vi.fn(),
      getTopUsed: vi.fn(),
    } as unknown as PromptsService;

    controller = new PromptsController(mockPromptsService);
  });

  describe('findAll', () => {
    it('should return all prompts', async () => {
      const mockPrompts = [{ id: '1', name: 'Prompt 1' }];
      vi.mocked(mockPromptsService.findAll).mockResolvedValue(mockPrompts as any);

      const result = await controller.findAll(mockUser, {
        category: 'test',
        rating: 'sfw',
        search: 'test',
        limit: 10,
        offset: 0,
      } as any);

      expect(result).toEqual(mockPrompts);
      expect(mockPromptsService.findAll).toHaveBeenCalledWith({
        userId: 'user-123',
        category: 'test',
        rating: 'sfw',
        search: 'test',
        limit: 10,
        offset: 0,
      });
    });
  });

  describe('findById', () => {
    it('should return prompt by ID', async () => {
      const mockPrompt = { id: '1', name: 'Prompt 1' };
      vi.mocked(mockPromptsService.findById).mockResolvedValue(mockPrompt as any);

      const result = await controller.findById('1');

      expect(result).toEqual(mockPrompt);
      expect(mockPromptsService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('getFavorites', () => {
    it('should return user favorites', async () => {
      const mockFavorites = [{ id: '1', name: 'Favorite 1' }];
      vi.mocked(mockPromptsService.findFavorites).mockResolvedValue(mockFavorites as any);

      const result = await controller.getFavorites(mockUser);

      expect(result).toEqual(mockFavorites);
      expect(mockPromptsService.findFavorites).toHaveBeenCalledWith('user-123');
    });
  });

  describe('checkFavorite', () => {
    it('should return favorite status', async () => {
      vi.mocked(mockPromptsService.isFavorited).mockResolvedValue({ favorited: true });

      const result = await controller.checkFavorite(mockUser, '1');

      expect(result).toEqual({ favorited: true });
      expect(mockPromptsService.isFavorited).toHaveBeenCalledWith('user-123', '1');
    });
  });

  describe('addFavorite', () => {
    it('should add favorite', async () => {
      vi.mocked(mockPromptsService.addFavorite).mockResolvedValue({ favorited: true });

      const result = await controller.addFavorite(mockUser, '1');

      expect(result).toEqual({ favorited: true });
      expect(mockPromptsService.addFavorite).toHaveBeenCalledWith('user-123', '1');
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite', async () => {
      vi.mocked(mockPromptsService.removeFavorite).mockResolvedValue({ favorited: false });

      const result = await controller.removeFavorite(mockUser, '1');

      expect(result).toEqual({ favorited: false });
      expect(mockPromptsService.removeFavorite).toHaveBeenCalledWith('user-123', '1');
    });
  });

  describe('getStats', () => {
    it('should return usage stats', async () => {
      const mockStats = {
        promptId: '1',
        totalUsage: 10,
        successCount: 8,
        failureCount: 2,
        successRate: 0.8,
      };
      vi.mocked(mockPromptsService.getUsageStats).mockResolvedValue(mockStats as any);

      const result = await controller.getStats('1');

      expect(result).toEqual(mockStats);
      expect(mockPromptsService.getUsageStats).toHaveBeenCalledWith('1');
    });
  });

  describe('getTopUsed', () => {
    it('should return top used prompts with default limit', async () => {
      const mockPrompts = [{ id: '1', name: 'Prompt 1' }];
      vi.mocked(mockPromptsService.getTopUsed).mockResolvedValue(mockPrompts as any);

      const result = await controller.getTopUsed(undefined);

      expect(result).toEqual(mockPrompts);
      expect(mockPromptsService.getTopUsed).toHaveBeenCalledWith(10);
    });

    it('should return top used prompts with custom limit', async () => {
      const mockPrompts = [{ id: '1', name: 'Prompt 1' }];
      vi.mocked(mockPromptsService.getTopUsed).mockResolvedValue(mockPrompts as any);

      const result = await controller.getTopUsed(5);

      expect(result).toEqual(mockPrompts);
      expect(mockPromptsService.getTopUsed).toHaveBeenCalledWith(5);
    });
  });
});
