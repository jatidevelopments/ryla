import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authModule from '../auth';
import {
  createOutfitPreset,
  getOutfitPresets,
  getOutfitPreset,
  updateOutfitPreset,
  deleteOutfitPreset,
} from './outfit-presets';
import type { OutfitPreset, CreateOutfitPresetInput, UpdateOutfitPresetInput } from './outfit-presets';

// Mock auth module
vi.mock('../auth', () => ({
  authFetch: vi.fn(),
}));

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

describe('outfit-presets API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOutfitPreset', () => {
    it('should create outfit preset successfully', async () => {
      const mockPreset: OutfitPreset = {
        id: 'preset-123',
        influencerId: 'inf-123',
        userId: 'user-123',
        name: 'Casual Outfit',
        description: 'A casual outfit',
        composition: {
          top: 't-shirt',
          bottom: 'jeans',
          shoes: 'sneakers',
        },
        isDefault: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockPreset,
      } as Response);

      const input: CreateOutfitPresetInput = {
        influencerId: 'inf-123',
        name: 'Casual Outfit',
        description: 'A casual outfit',
        composition: {
          top: 't-shirt',
          bottom: 'jeans',
          shoes: 'sneakers',
        },
      };

      const result = await createOutfitPreset(input);
      expect(result).toEqual(mockPreset);
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/outfit-presets`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle error response with message', async () => {
      const mockError = {
        message: 'Failed to create preset',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      const input: CreateOutfitPresetInput = {
        influencerId: 'inf-123',
        name: 'Casual Outfit',
        composition: {
          top: 't-shirt',
          bottom: 'jeans',
          shoes: 'sneakers',
        },
      };

      await expect(createOutfitPreset(input)).rejects.toThrow('Failed to create preset');
    });

    it('should handle error response with messages array', async () => {
      const mockError = {
        messages: ['Validation failed', 'Name is required'],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      const input: CreateOutfitPresetInput = {
        influencerId: 'inf-123',
        name: '',
        composition: {
          top: 't-shirt',
          bottom: 'jeans',
          shoes: 'sneakers',
        },
      };

      await expect(createOutfitPreset(input)).rejects.toThrow('Validation failed');
    });
  });

  describe('getOutfitPresets', () => {
    it('should get outfit presets for influencer', async () => {
      const mockPresets: OutfitPreset[] = [
        {
          id: 'preset-123',
          influencerId: 'inf-123',
          userId: 'user-123',
          name: 'Casual Outfit',
          composition: {
            top: 't-shirt',
            bottom: 'jeans',
            shoes: 'sneakers',
          },
          isDefault: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockPresets,
      } as Response);

      const result = await getOutfitPresets('inf-123');
      expect(result).toEqual(mockPresets);
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/outfit-presets/influencer/inf-123`,
        { method: 'GET' }
      );
    });

    it('should handle error response', async () => {
      const mockError = {
        message: 'Failed to fetch presets',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      await expect(getOutfitPresets('inf-123')).rejects.toThrow('Failed to fetch presets');
    });
  });

  describe('getOutfitPreset', () => {
    it('should get single outfit preset', async () => {
      const mockPreset: OutfitPreset = {
        id: 'preset-123',
        influencerId: 'inf-123',
        userId: 'user-123',
        name: 'Casual Outfit',
        composition: {
          top: 't-shirt',
          bottom: 'jeans',
          shoes: 'sneakers',
        },
        isDefault: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockPreset,
      } as Response);

      const result = await getOutfitPreset('preset-123');
      expect(result).toEqual(mockPreset);
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/outfit-presets/preset-123`,
        { method: 'GET' }
      );
    });
  });

  describe('updateOutfitPreset', () => {
    it('should update outfit preset successfully', async () => {
      const mockPreset: OutfitPreset = {
        id: 'preset-123',
        influencerId: 'inf-123',
        userId: 'user-123',
        name: 'Updated Outfit',
        composition: {
          top: 'hoodie',
          bottom: 'jeans',
          shoes: 'sneakers',
        },
        isDefault: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockPreset,
      } as Response);

      const input: UpdateOutfitPresetInput = {
        name: 'Updated Outfit',
        isDefault: true,
      };

      const result = await updateOutfitPreset('preset-123', input);
      expect(result).toEqual(mockPreset);
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/outfit-presets/preset-123`,
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle error response', async () => {
      const mockError = {
        message: 'Failed to update preset',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      const input: UpdateOutfitPresetInput = {
        name: 'Updated Outfit',
      };

      await expect(updateOutfitPreset('preset-123', input)).rejects.toThrow('Failed to update preset');
    });
  });

  describe('deleteOutfitPreset', () => {
    it('should delete outfit preset successfully', async () => {
      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
      } as Response);

      await deleteOutfitPreset('preset-123');
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/outfit-presets/preset-123`,
        { method: 'DELETE' }
      );
    });

    it('should handle error response', async () => {
      const mockError = {
        message: 'Failed to delete preset',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      await expect(deleteOutfitPreset('preset-123')).rejects.toThrow('Failed to delete preset');
    });
  });
});
