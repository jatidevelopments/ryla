import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OutfitPresetsController } from './outfit-presets.controller';
import { OutfitPresetsService } from './outfit-presets.service';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';

describe('OutfitPresetsController', () => {
  let controller: OutfitPresetsController;
  let mockOutfitPresetsService: OutfitPresetsService;
  let mockUser: IJwtPayload;

  beforeEach(() => {
    mockUser = {
      userId: 'user-123',
      email: 'test@example.com',
    } as IJwtPayload;

    mockOutfitPresetsService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as OutfitPresetsService;

    controller = new OutfitPresetsController(mockOutfitPresetsService);
  });

  describe('create', () => {
    it('should create outfit preset', async () => {
      const dto = {
        influencerId: 'char-1',
        name: 'Test Preset',
        composition: {},
      };
      const mockPreset = { id: 'preset-1', ...dto };
      vi.mocked(mockOutfitPresetsService.create).mockResolvedValue(mockPreset as any);

      const result = await controller.create(mockUser, dto as any);

      expect(result).toEqual(mockPreset);
      expect(mockOutfitPresetsService.create).toHaveBeenCalledWith('user-123', dto);
    });
  });

  describe('findAll', () => {
    it('should return all presets for influencer', async () => {
      const mockPresets = [{ id: 'preset-1', name: 'Preset 1' }];
      vi.mocked(mockOutfitPresetsService.findAll).mockResolvedValue(mockPresets as any);

      const result = await controller.findAll(mockUser, 'char-1');

      expect(result).toEqual(mockPresets);
      expect(mockOutfitPresetsService.findAll).toHaveBeenCalledWith('user-123', 'char-1');
    });
  });

  describe('findOne', () => {
    it('should return preset by ID', async () => {
      const mockPreset = { id: 'preset-1', name: 'Preset 1' };
      vi.mocked(mockOutfitPresetsService.findOne).mockResolvedValue(mockPreset as any);

      const result = await controller.findOne(mockUser, 'preset-1');

      expect(result).toEqual(mockPreset);
      expect(mockOutfitPresetsService.findOne).toHaveBeenCalledWith('user-123', 'preset-1');
    });
  });

  describe('update', () => {
    it('should update preset', async () => {
      const dto = { name: 'Updated Name' };
      const mockPreset = { id: 'preset-1', name: 'Updated Name' };
      vi.mocked(mockOutfitPresetsService.update).mockResolvedValue(mockPreset as any);

      const result = await controller.update(mockUser, 'preset-1', dto as any);

      expect(result).toEqual(mockPreset);
      expect(mockOutfitPresetsService.update).toHaveBeenCalledWith('user-123', 'preset-1', dto);
    });
  });

  describe('remove', () => {
    it('should remove preset', async () => {
      vi.mocked(mockOutfitPresetsService.remove).mockResolvedValue({ success: true } as any);

      const result = await controller.remove(mockUser, 'preset-1');

      expect(result).toEqual({ success: true });
      expect(mockOutfitPresetsService.remove).toHaveBeenCalledWith('user-123', 'preset-1');
    });
  });
});
