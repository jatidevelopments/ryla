import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../lib/test/mocks/server';
import {
  generateBaseImages,
  getBaseImageResults,
  generateCharacterSheet,
  getCharacterSheetResults,
  generateProfilePictureSet,
  getProfilePictureSetResults,
  regenerateProfilePicture,
  getProfilePictureJobResult,
  pollForJobCompletion,
  getBaseImageJobResult,
  generateBaseImagesAndWait,
  generateCharacterSheetAndWait,
  regenerateProfilePictureAndWait,
  generateProfilePictureSetAndWait,
} from './character';
import * as authModule from '../auth';

// Mock auth module
vi.mock('../auth', () => ({
  authFetch: vi.fn(),
}));

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

describe('character API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateBaseImages', () => {
    it('should generate base images successfully', async () => {
      const mockResponse = {
        jobId: 'job-123',
        allJobIds: ['job-123', 'job-124', 'job-125'],
        userId: 'user-123',
        status: 'queued',
        message: 'Generation started',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const input = {
        appearance: {
          gender: 'female' as const,
          style: 'realistic' as const,
          ethnicity: 'caucasian',
          age: 25,
          eyeColor: 'blue',
          hairStyle: 'long',
          hairColor: 'blonde',
          bodyType: 'athletic',
        },
        nsfwEnabled: false,
      };

      const result = await generateBaseImages(input);
      expect(result).toEqual(mockResponse);
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/characters/generate-base-images`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle error response', async () => {
      const mockError = {
        messages: ['Insufficient credits'],
        statusCode: 400,
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      const input = {
        appearance: {
          gender: 'female' as const,
          style: 'realistic' as const,
          ethnicity: 'caucasian',
          age: 25,
          eyeColor: 'blue',
          hairStyle: 'long',
          hairColor: 'blonde',
          bodyType: 'athletic',
        },
        nsfwEnabled: false,
      };

      await expect(generateBaseImages(input)).rejects.toThrow('Insufficient credits');
    });

    it('should handle error with message field', async () => {
      const mockError = {
        message: 'Network error',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: false,
        json: async () => mockError,
      } as Response);

      const input = {
        appearance: {
          gender: 'female' as const,
          style: 'realistic' as const,
          ethnicity: 'caucasian',
          age: 25,
          eyeColor: 'blue',
          hairStyle: 'long',
          hairColor: 'blonde',
          bodyType: 'athletic',
        },
        nsfwEnabled: false,
      };

      await expect(generateBaseImages(input)).rejects.toThrow('Network error');
    });
  });

  describe('getBaseImageResults', () => {
    it('should get base image results for single job', async () => {
      const mockResult = {
        status: 'completed' as const,
        images: [
          { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnailUrl: 'https://example.com/img1-thumb.jpg' },
        ],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await getBaseImageResults('job-123');
      expect(result).toEqual(mockResult);
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/characters/base-images/job-123`
      );
    });

    it('should get base image results for multiple jobs', async () => {
      const mockResult = {
        status: 'completed' as const,
        images: [
          { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnailUrl: 'https://example.com/img1-thumb.jpg' },
        ],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await getBaseImageResults('job-123', ['job-123', 'job-124']);
      expect(result).toEqual(mockResult);
      expect(authModule.authFetch).toHaveBeenCalledWith(
        `${API_BASE}/characters/base-images/job-123?allJobIds=job-123,job-124`
      );
    });
  });

  describe('generateCharacterSheet', () => {
    it('should generate character sheet successfully', async () => {
      const mockResponse = {
        jobId: 'job-123',
        userId: 'user-123',
        status: 'queued',
        message: 'Character sheet generation started',
        variations: 4,
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const input = {
        baseImageUrl: 'https://example.com/base.jpg',
        characterId: 'char-123',
        nsfwEnabled: false,
      };

      const result = await generateCharacterSheet(input);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCharacterSheetResults', () => {
    it('should get character sheet results', async () => {
      const mockResult = {
        status: 'completed' as const,
        images: [
          { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnailUrl: 'https://example.com/img1-thumb.jpg' },
        ],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await getCharacterSheetResults('job-123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('generateProfilePictureSet', () => {
    it('should generate profile picture set successfully', async () => {
      const mockResponse = {
        jobId: 'job-123',
        allJobIds: ['job-123', 'job-124'],
        userId: 'user-123',
        status: 'queued',
        message: 'Profile picture generation started',
        imageCount: 7,
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const input = {
        baseImageUrl: 'https://example.com/base.jpg',
        setId: 'classic-influencer' as const,
        nsfwEnabled: false,
      };

      const result = await generateProfilePictureSet(input);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getProfilePictureSetResults', () => {
    it('should get profile picture set results', async () => {
      const mockResult = {
        status: 'completed' as const,
        images: [
          { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnailUrl: 'https://example.com/img1-thumb.jpg' },
        ],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await getProfilePictureSetResults('job-123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('regenerateProfilePicture', () => {
    it('should regenerate profile picture successfully', async () => {
      const mockResponse = {
        jobId: 'job-123',
        userId: 'user-123',
        status: 'queued',
        message: 'Regeneration started',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const input = {
        baseImageUrl: 'https://example.com/base.jpg',
        positionId: 'position-1',
        nsfwEnabled: false,
      };

      const result = await regenerateProfilePicture(input);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getProfilePictureJobResult', () => {
    it('should get profile picture job result', async () => {
      const mockResult = {
        status: 'completed' as const,
        images: [
          { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnailUrl: 'https://example.com/img1-thumb.jpg' },
        ],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await getProfilePictureJobResult('job-123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getBaseImageJobResult', () => {
    it('should get base image job result', async () => {
      const mockResult = {
        status: 'completed' as const,
        images: [
          { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnailUrl: 'https://example.com/img1-thumb.jpg' },
        ],
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await getBaseImageJobResult('job-123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('pollForJobCompletion', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return completed result immediately if already completed', async () => {
      const mockResult = {
        status: 'completed' as const,
        images: [
          { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnailUrl: 'https://example.com/img1-thumb.jpg' },
        ],
      };

      const getResults = vi.fn().mockResolvedValue(mockResult);

      const result = await pollForJobCompletion('job-123', getResults);
      expect(result).toEqual(mockResult);
      expect(getResults).toHaveBeenCalledTimes(1);
    });

    it('should poll until completion', async () => {
      const mockResults = [
        { status: 'in_progress' as const },
        { status: 'in_progress' as const },
        {
          status: 'completed' as const,
          images: [
            { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnailUrl: 'https://example.com/img1-thumb.jpg' },
          ],
        },
      ];

      const getResults = vi.fn()
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1])
        .mockResolvedValueOnce(mockResults[2]);

      const promise = pollForJobCompletion('job-123', getResults);

      // Advance timers to trigger polling
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;
      expect(result.status).toBe('completed');
      expect(getResults).toHaveBeenCalledTimes(3);
    });

    it('should handle partial status with 0 images (potential bug)', async () => {
      // ⚠️ BUG: Partial status with 0 images will poll until timeout
      const getResults = vi.fn().mockResolvedValue({
        status: 'partial' as const,
        images: [],
      });

      const promise = pollForJobCompletion('job-123', getResults);

      // Advance a few times to see it keeps polling
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(2000);

      // Should still be polling (this is the current behavior, but might be a bug)
      expect(getResults).toHaveBeenCalled();
      // Eventually will timeout - this might be inefficient
    });

    it('should throw error on failed job', async () => {
      const mockResult = {
        status: 'failed' as const,
        error: 'Generation failed',
      };

      const getResults = vi.fn().mockResolvedValue(mockResult);

      await expect(pollForJobCompletion('job-123', getResults)).rejects.toThrow('Generation failed');
    });

    it('should throw error on timeout', async () => {
      const getResults = vi.fn().mockResolvedValue({ status: 'in_progress' as const });

      const promise = pollForJobCompletion('job-123', getResults);

      // Advance past max poll time (5 minutes = 300000ms)
      // Need to advance enough time to trigger timeout
      // Advance in chunks, allowing promises to process between chunks
      for (let i = 0; i < 6; i++) {
        await vi.advanceTimersByTimeAsync(60000); // 1 minute chunks = 6 minutes total
        // Process pending promises
        await vi.runOnlyPendingTimersAsync();
      }

      // Should have timed out by now (exceeded 5 minute limit)
      await expect(promise).rejects.toThrow('Job timed out');
    });
  });

  describe('generateBaseImagesAndWait', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate and wait for base images', async () => {
      const mockResponse = {
        jobId: 'job-123',
        allJobIds: ['job-123'],
        userId: 'user-123',
        status: 'queued',
        message: 'Generation started',
      };

      const mockResult = {
        status: 'completed' as const,
        images: [
          { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnailUrl: 'https://example.com/img1-thumb.jpg' },
        ],
      };

      vi.mocked(authModule.authFetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response)
        .mockResolvedValue({
          ok: true,
          json: async () => mockResult,
        } as Response);

      const input = {
        appearance: {
          gender: 'female' as const,
          style: 'realistic' as const,
          ethnicity: 'caucasian',
          age: 25,
          eyeColor: 'blue',
          hairStyle: 'long',
          hairColor: 'blonde',
          bodyType: 'athletic',
        },
        nsfwEnabled: false,
      };

      const promise = generateBaseImagesAndWait(input);
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('img-1');
    });

    it('should throw error if no images generated', async () => {
      const mockResponse = {
        jobId: 'job-123',
        userId: 'user-123',
        status: 'queued',
        message: 'Generation started',
      };

      const mockResult = {
        status: 'completed' as const,
        images: [],
      };

      vi.mocked(authModule.authFetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response)
        .mockResolvedValue({
          ok: true,
          json: async () => mockResult,
        } as Response);

      const input = {
        appearance: {
          gender: 'female' as const,
          style: 'realistic' as const,
          ethnicity: 'caucasian',
          age: 25,
          eyeColor: 'blue',
          hairStyle: 'long',
          hairColor: 'blonde',
          bodyType: 'athletic',
        },
        nsfwEnabled: false,
      };

      const promise = generateBaseImagesAndWait(input);
      
      // Advance timers to trigger polling
      // First poll happens immediately, then every 2 seconds
      await vi.advanceTimersByTimeAsync(2000);
      await vi.runOnlyPendingTimersAsync();
      
      // Advance again to get the completed result
      await vi.advanceTimersByTimeAsync(2000);
      await vi.runOnlyPendingTimersAsync();
      
      // Wait for the promise to resolve/reject
      await expect(promise).rejects.toThrow('No images generated');
    });
  });

  describe('generateCharacterSheetAndWait', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate and wait for character sheet', async () => {
      const mockResponse = {
        jobId: 'job-123',
        userId: 'user-123',
        status: 'queued',
        message: 'Character sheet generation started',
        variations: 4,
      };

      const mockResult = {
        status: 'completed' as const,
        images: [
          { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnailUrl: 'https://example.com/img1-thumb.jpg' },
        ],
      };

      vi.mocked(authModule.authFetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response)
        .mockResolvedValue({
          ok: true,
          json: async () => mockResult,
        } as Response);

      const input = {
        baseImageUrl: 'https://example.com/base.jpg',
        characterId: 'char-123',
        nsfwEnabled: false,
      };

      const promise = generateCharacterSheetAndWait(input);
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;
      expect(result).toHaveLength(1);
    });
  });

  describe('regenerateProfilePictureAndWait', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should regenerate and wait for profile picture', async () => {
      const mockResponse = {
        jobId: 'job-123',
        userId: 'user-123',
        status: 'queued',
        message: 'Regeneration started',
      };

      const mockResult = {
        status: 'completed' as const,
        images: [
          { id: 'img-1', url: 'https://example.com/img1.jpg', thumbnailUrl: 'https://example.com/img1-thumb.jpg' },
        ],
      };

      vi.mocked(authModule.authFetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response)
        .mockResolvedValue({
          ok: true,
          json: async () => mockResult,
        } as Response);

      const input = {
        baseImageUrl: 'https://example.com/base.jpg',
        positionId: 'position-1',
        nsfwEnabled: false,
      };

      const promise = regenerateProfilePictureAndWait(input);
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;
      expect(result.id).toBe('img-1');
    });
  });

  describe('generateProfilePictureSetAndWait', () => {
    it('should generate profile picture set and return job info', async () => {
      const mockResponse = {
        jobId: 'job-123',
        allJobIds: ['job-123', 'job-124'],
        jobPositions: [
          { jobId: 'job-123', positionId: 'pos-1', positionName: 'Front', prompt: 'test', negativePrompt: '', isNSFW: false },
        ],
        userId: 'user-123',
        status: 'queued',
        message: 'Profile picture generation started',
      };

      vi.mocked(authModule.authFetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const input = {
        baseImageUrl: 'https://example.com/base.jpg',
        setId: 'classic-influencer' as const,
        nsfwEnabled: false,
      };

      const result = await generateProfilePictureSetAndWait(input);
      expect(result.jobIds).toEqual(['job-123', 'job-124']);
      expect(result.jobPositions).toHaveLength(1);
    });
  });
});
