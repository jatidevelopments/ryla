import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VoiceTranscriptionController } from './voice-transcription.controller';
import { VoiceTranscriptionService } from './services/voice-transcription.service';

describe('VoiceTranscriptionController', () => {
  let controller: VoiceTranscriptionController;
  let mockVoiceTranscriptionService: VoiceTranscriptionService;

  beforeEach(() => {
    mockVoiceTranscriptionService = {
      transcribeAudio: vi.fn(),
      streamTranscription: vi.fn(),
    } as unknown as VoiceTranscriptionService;

    controller = new VoiceTranscriptionController(mockVoiceTranscriptionService);
  });

  describe('transcribe', () => {
    it('should transcribe audio file', async () => {
      const mockFile = {
        buffer: Buffer.from('test audio'),
        mimetype: 'audio/webm',
      } as Express.Multer.File;
      const mockResult = {
        text: 'Hello world',
        language: 'en',
        segments: [],
      };
      vi.mocked(mockVoiceTranscriptionService.transcribeAudio).mockResolvedValue(mockResult);

      const result = await controller.transcribe(mockFile, 'audio/webm');

      expect(result.text).toBe('Hello world');
      expect(mockVoiceTranscriptionService.transcribeAudio).toHaveBeenCalledWith(
        mockFile.buffer,
        'audio/webm',
      );
    });

    it('should use file mimetype when format not provided', async () => {
      const mockFile = {
        buffer: Buffer.from('test audio'),
        mimetype: 'audio/mp4',
      } as Express.Multer.File;
      vi.mocked(mockVoiceTranscriptionService.transcribeAudio).mockResolvedValue({
        text: 'test',
      } as any);

      await controller.transcribe(mockFile, undefined);

      expect(mockVoiceTranscriptionService.transcribeAudio).toHaveBeenCalledWith(
        mockFile.buffer,
        'audio/mp4',
      );
    });

    it('should throw error when audio file is missing', async () => {
      await expect(controller.transcribe(null as any, undefined)).rejects.toThrow(
        'Audio file is required',
      );
    });
  });

  describe('transcribeStream', () => {
    it('should stream transcription', async () => {
      const mockFile = {
        buffer: Buffer.from('test audio'),
        mimetype: 'audio/webm',
      } as Express.Multer.File;
      const mockResponse = {
        write: vi.fn(),
        end: vi.fn(),
        setHeader: vi.fn(),
      } as any;

      async function* mockGenerator() {
        yield 'Hello';
        yield 'Hello world';
      }
      vi.mocked(mockVoiceTranscriptionService.streamTranscription).mockReturnValue(
        mockGenerator() as any,
      );

      await controller.transcribeStream(mockFile, 'audio/webm', mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockVoiceTranscriptionService.streamTranscription).toHaveBeenCalled();
    });

    it('should handle errors in stream', async () => {
      const mockFile = {
        buffer: Buffer.from('test audio'),
        mimetype: 'audio/webm',
      } as Express.Multer.File;
      const mockResponse = {
        write: vi.fn(),
        end: vi.fn(),
        setHeader: vi.fn(),
      } as any;

      async function* errorGenerator() {
        throw new Error('Transcription failed');
      }
      vi.mocked(mockVoiceTranscriptionService.streamTranscription).mockReturnValue(
        errorGenerator() as any,
      );

      await controller.transcribeStream(mockFile, 'audio/webm', mockResponse);

      expect(mockResponse.write).toHaveBeenCalled();
      expect(mockResponse.end).toHaveBeenCalled();
    });
  });
});
