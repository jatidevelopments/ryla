import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  FalImageService,
  calculateFalModelCost,
  calculateFalModelCredits,
  getAllFalModelIds,
} from './fal-image.service';
import type { FalFluxModelId } from './fal-image.service';

describe('FalImageService', () => {
  let service: FalImageService;
  let originalEnv: string | undefined;
  let globalFetch: typeof fetch;

  beforeEach(() => {
    service = new FalImageService();
    globalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = globalFetch;
    if (originalEnv) {
      process.env.FAL_KEY = originalEnv;
    } else {
      delete process.env.FAL_KEY;
    }
    vi.restoreAllMocks();
  });

  describe('isConfigured', () => {
    it('should return true when FAL_KEY is set', () => {
      process.env.FAL_KEY = 'test-key';
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when FAL_KEY is not set', () => {
      delete process.env.FAL_KEY;
      expect(service.isConfigured()).toBe(false);
    });
  });

  describe('downloadToBase64DataUrl', () => {
    it('should download image and convert to base64 data URL', async () => {
      const mockImageBuffer = Buffer.from('fake-image-data');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('image/png'),
        },
        arrayBuffer: vi.fn().mockResolvedValue(mockImageBuffer.buffer),
      } as any);

      const result = await service.downloadToBase64DataUrl('https://example.com/image.png');

      expect(result).toContain('data:image/png;base64,');
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/image.png');
    });

    it('should throw error when download fails', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as any);

      await expect(
        service.downloadToBase64DataUrl('https://example.com/image.png'),
      ).rejects.toThrow('Failed to download image');
    });
  });
});

describe('calculateFalModelCost', () => {
  it('should calculate cost for per-megapixel model', () => {
    const modelId = 'fal-ai/flux/dev' as FalFluxModelId;
    const width = 1024;
    const height = 1024;
    const numImages = 1;

    const cost = calculateFalModelCost(modelId, width, height, numImages);

    expect(cost).toBeGreaterThan(0);
  });

  it('should calculate cost for per-image model', () => {
    const modelId = 'fal-ai/flux-pro/v1.1-ultra' as FalFluxModelId;
    const width = 1024;
    const height = 1024;
    const numImages = 1;

    const cost = calculateFalModelCost(modelId, width, height, numImages);

    expect(cost).toBeGreaterThan(0);
  });
});

describe('calculateFalModelCredits', () => {
  it('should calculate credits from cost', () => {
    const modelId = 'fal-ai/flux/dev' as FalFluxModelId;
    const width = 1024;
    const height = 1024;
    const numImages = 1;

    const credits = calculateFalModelCredits(modelId, width, height, numImages);

    expect(credits).toBeGreaterThan(0);
    expect(Number.isInteger(credits)).toBe(true);
  });
});

describe('getAllFalModelIds', () => {
  it('should return array of all model IDs', () => {
    const modelIds = getAllFalModelIds();

    expect(Array.isArray(modelIds)).toBe(true);
    expect(modelIds.length).toBeGreaterThan(0);
    expect(modelIds[0]).toContain('fal-ai/');
  });
});
