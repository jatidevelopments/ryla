import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoiceTranscriptionService } from './voice-transcription.service';

describe('VoiceTranscriptionService', () => {
  let service: VoiceTranscriptionService;
  let originalEnv: string | undefined;
  let globalFetch: typeof fetch;

  beforeEach(() => {
    service = new VoiceTranscriptionService();
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

  describe('transcribeAudio', () => {
    it('should transcribe audio successfully', async () => {
      process.env.FAL_KEY = 'test-key';
      const mockResponse = {
        text: 'Hello world',
        language: 'en',
        segments: [{ start: 0, end: 1, text: 'Hello world' }],
      };
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify(mockResponse)),
      } as any);

      const audioBuffer = Buffer.from('test audio');
      const result = await service.transcribeAudio(audioBuffer, 'audio/webm');

      expect(result.text).toBe('Hello world');
      expect(result.language).toBe('en');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should throw error when FAL_KEY is not configured', async () => {
      delete process.env.FAL_KEY;
      const audioBuffer = Buffer.from('test audio');

      await expect(service.transcribeAudio(audioBuffer)).rejects.toThrow(
        'FAL_KEY is not configured',
      );
    });

    it('should throw error when API request fails', async () => {
      process.env.FAL_KEY = 'test-key';
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('Bad Request'),
      } as any);

      const audioBuffer = Buffer.from('test audio');

      await expect(service.transcribeAudio(audioBuffer)).rejects.toThrow(
        'Fal transcription failed',
      );
    });
  });

  describe('streamTranscription', () => {
    it('should stream transcription chunks', async () => {
      process.env.FAL_KEY = 'test-key';
      const mockResponse = {
        text: 'Hello world',
        language: 'en',
      };
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify(mockResponse)),
      } as any);

      const audioBuffer = Buffer.from('test audio');
      const chunks: string[] = [];

      for await (const chunk of service.streamTranscription(audioBuffer, 'audio/webm')) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[chunks.length - 1]).toContain('Hello world');
    });

    it('should throw error when FAL_KEY is not configured', async () => {
      delete process.env.FAL_KEY;
      const audioBuffer = Buffer.from('test audio');

      await expect(
        async () => {
          for await (const _ of service.streamTranscription(audioBuffer)) {
            // consume generator
          }
        },
      ).rejects.toThrow('FAL_KEY is not configured');
    });
  });
});
