import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authModule from '../auth';
import {
  generateStudioImages,
  inpaintEdit,
  getComfyUIResults,
  getCharacterImages,
  likeImage,
  deleteImage,
} from './studio';
import type { GenerateStudioImagesInput, InpaintEditInput, ComfyUIJobResult, ApiImageRow } from './studio';

// Mock auth module
vi.mock('../auth', () => ({
  authFetch: vi.fn(),
}));

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

describe('studio API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateStudioImages', () => {
    it('should generate studio images with string outfit', async () => {
      const mockResponse = {
        workflowId: 'workflow-123',
        jobs: [
          { jobId: 'job-123', promptId: 'prompt-123' },
        ],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const input: GenerateStudioImagesInput = {
        characterId: 'char-123',
        scene: 'cozy-at-home',
        environment: 'indoor',
        outfit: 'casual',
        aspectRatio: '16:9',
        count: 1,
        nsfw: false,
      };

      const result = await generateStudioImages(input);
      expect(result).toEqual(mockResponse);
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/image/generate/studio`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should generate studio images with outfit composition', async () => {
      const mockResponse = {
        workflowId: 'workflow-123',
        jobs: [
          { jobId: 'job-123', promptId: 'prompt-123' },
        ],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const input: GenerateStudioImagesInput = {
        characterId: 'char-123',
        scene: 'cozy-at-home',
        environment: 'indoor',
        outfit: {
          top: 't-shirt',
          bottom: 'jeans',
          shoes: 'sneakers',
        },
        aspectRatio: '16:9',
        count: 1,
        nsfw: false,
      };

      const result = await generateStudioImages(input);
      expect(result).toEqual(mockResponse);
    });

    it('should convert cozy-at-home to cozy_home', async () => {
      const mockResponse = {
        workflowId: 'workflow-123',
        jobs: [
          { jobId: 'job-123', promptId: 'prompt-123' },
        ],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const input: GenerateStudioImagesInput = {
        characterId: 'char-123',
        scene: 'cozy-at-home',
        environment: 'indoor',
        outfit: 'casual',
        aspectRatio: '16:9',
        count: 1,
        nsfw: false,
      };

      await generateStudioImages(input);

      const callArgs = vi.mocked(authModule.authFetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.scene).toBe('cozy_home');
    });

    it('should convert kebab-case to snake_case for scene and environment', async () => {
      const mockResponse = {
        workflowId: 'workflow-123',
        jobs: [
          { jobId: 'job-123', promptId: 'prompt-123' },
        ],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const input: GenerateStudioImagesInput = {
        characterId: 'char-123',
        scene: 'beach-sunset',
        environment: 'outdoor-natural',
        outfit: 'casual',
        aspectRatio: '16:9',
        count: 1,
        nsfw: false,
      };

      await generateStudioImages(input);

      const callArgs = vi.mocked(authModule.authFetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.scene).toBe('beach_sunset');
      expect(body.environment).toBe('outdoor_natural');
    });

    it('should handle error response', async () => {
      const mockError = {
        message: 'Insufficient credits',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      const input: GenerateStudioImagesInput = {
        characterId: 'char-123',
        scene: 'beach',
        environment: 'outdoor',
        outfit: 'casual',
        aspectRatio: '16:9',
        count: 1,
        nsfw: false,
      };

      await expect(generateStudioImages(input)).rejects.toThrow('Insufficient credits');
    });
  });

  describe('inpaintEdit', () => {
    it('should start inpaint edit successfully', async () => {
      const mockResponse = {
        jobId: 'job-123',
        promptId: 'prompt-123',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const input: InpaintEditInput = {
        characterId: 'char-123',
        sourceImageId: 'img-123',
        prompt: 'Add sunglasses',
        maskedImageBase64Png: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      };

      const result = await inpaintEdit(input);
      expect(result).toEqual(mockResponse);
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/image/edit/inpaint`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle error response', async () => {
      const mockError = {
        messages: ['Invalid mask image'],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      const input: InpaintEditInput = {
        characterId: 'char-123',
        sourceImageId: 'img-123',
        prompt: 'Add sunglasses',
        maskedImageBase64Png: 'invalid',
      };

      await expect(inpaintEdit(input)).rejects.toThrow('Invalid mask image');
    });
  });

  describe('getComfyUIResults', () => {
    it('should get ComfyUI results', async () => {
      const mockResult: ComfyUIJobResult = {
        status: 'completed',
        images: [
          {
            id: 'img-123',
            url: 'https://example.com/img.jpg',
            thumbnailUrl: 'https://example.com/img-thumb.jpg',
            s3Key: 'images/img-123.jpg',
          },
        ],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await getComfyUIResults('prompt-123');
      expect(result).toEqual(mockResult);
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/image/comfyui/prompt-123/results`
      );
    });

    it('should handle error response', async () => {
      const mockError = {
        message: 'Job not found',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      await expect(getComfyUIResults('prompt-123')).rejects.toThrow('Job not found');
    });
  });

  describe('getCharacterImages', () => {
    it('should get character images', async () => {
      const mockImages: ApiImageRow[] = [
        {
          id: 'img-123',
          characterId: 'char-123',
          s3Url: 'https://example.com/img.jpg',
          thumbnailUrl: 'https://example.com/img-thumb.jpg',
          prompt: 'A beautiful scene',
          scene: 'beach',
          environment: 'outdoor',
          aspectRatio: '16:9',
          status: 'completed',
          createdAt: '2024-01-01T00:00:00Z',
          liked: false,
          nsfw: false,
        },
      ];

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => ({ images: mockImages }),
      } as Response);

      const result = await getCharacterImages('char-123');
      expect(result).toEqual(mockImages);
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/image-gallery/characters/char-123/images`
      );
    });

    it('should return empty array if images field is missing', async () => {
      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      const result = await getCharacterImages('char-123');
      expect(result).toEqual([]);
    });

    it('should handle error response', async () => {
      const mockError = {
        message: 'Character not found',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      await expect(getCharacterImages('char-123')).rejects.toThrow('Character not found');
    });
  });

  describe('likeImage', () => {
    it('should like image successfully', async () => {
      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => ({ liked: true }),
      } as Response);

      const result = await likeImage('img-123');
      expect(result).toEqual({ liked: true });
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/image-gallery/images/img-123/like`,
        { method: 'POST' }
      );
    });

    it('should handle false liked response', async () => {
      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => ({ liked: false }),
      } as Response);

      const result = await likeImage('img-123');
      expect(result).toEqual({ liked: false });
    });

    it('should handle missing liked field', async () => {
      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      const result = await likeImage('img-123');
      expect(result).toEqual({ liked: false });
    });

    it('should handle error response', async () => {
      const mockError = {
        message: 'Image not found',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      await expect(likeImage('img-123')).rejects.toThrow('Image not found');
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
      } as Response);

      await deleteImage('img-123');
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/image-gallery/images/img-123`,
        { method: 'DELETE' }
      );
    });

    it('should handle error response', async () => {
      const mockError = {
        messages: ['Image not found'],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      await expect(deleteImage('img-123')).rejects.toThrow('Image not found');
    });
  });
});
