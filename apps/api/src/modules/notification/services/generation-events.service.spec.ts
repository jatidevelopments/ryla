import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerationEventsService } from './generation-events.service';
import { NotificationGateway } from '../notification.gateway';
import type {
  GenerationProgressPayload,
  GenerationCompletePayload,
  GenerationErrorPayload,
} from '@ryla/shared';

describe('GenerationEventsService', () => {
  let service: GenerationEventsService;
  let mockGateway: {
    emitGenerationProgress: ReturnType<typeof vi.fn>;
    emitGenerationComplete: ReturnType<typeof vi.fn>;
    emitGenerationError: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockGateway = {
      emitGenerationProgress: vi.fn(),
      emitGenerationComplete: vi.fn(),
      emitGenerationError: vi.fn(),
    };
    service = new GenerationEventsService(mockGateway as any);
  });

  describe('emitProgress', () => {
    it('should emit progress event with correct payload', () => {
      service.emitProgress('user-123', 'prompt-456', 'processing', 50);

      expect(mockGateway.emitGenerationProgress).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          promptId: 'prompt-456',
          status: 'processing',
          progress: 50,
        })
      );
    });

    it('should clamp progress to 0-100 range', () => {
      service.emitProgress('user-123', 'prompt-456', 'processing', 150);
      expect(mockGateway.emitGenerationProgress).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ progress: 100 })
      );

      service.emitProgress('user-123', 'prompt-456', 'processing', -10);
      expect(mockGateway.emitGenerationProgress).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ progress: 0 })
      );
    });

    it('should include optional parameters', () => {
      service.emitProgress('user-123', 'prompt-456', 'queued', 0, {
        jobId: 'job-789',
        message: 'Waiting in queue',
        queuePosition: 3,
      });

      expect(mockGateway.emitGenerationProgress).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          jobId: 'job-789',
          message: 'Waiting in queue',
          queuePosition: 3,
        })
      );
    });
  });

  describe('emitComplete', () => {
    it('should emit complete event with images', () => {
      const images = [
        { id: 'img-1', url: 'https://example.com/1.jpg', thumbnailUrl: 'https://example.com/1-thumb.jpg' },
        { id: 'img-2', url: 'https://example.com/2.jpg' },
      ];

      service.emitComplete('user-123', 'prompt-456', 'char-789', images);

      expect(mockGateway.emitGenerationComplete).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          promptId: 'prompt-456',
          characterId: 'char-789',
          images,
        })
      );
    });

    it('should include optional metadata', () => {
      service.emitComplete('user-123', 'prompt-456', 'char-789', [], {
        jobId: 'job-xyz',
        metadata: { model: 'flux-dev', steps: 30 },
      });

      expect(mockGateway.emitGenerationComplete).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          jobId: 'job-xyz',
          metadata: { model: 'flux-dev', steps: 30 },
        })
      );
    });
  });

  describe('emitError', () => {
    it('should emit error event with message', () => {
      service.emitError('user-123', 'prompt-456', 'Generation failed: GPU timeout');

      expect(mockGateway.emitGenerationError).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          promptId: 'prompt-456',
          error: 'Generation failed: GPU timeout',
          retryable: false,
        })
      );
    });

    it('should mark error as retryable when specified', () => {
      service.emitError('user-123', 'prompt-456', 'Temporary failure', {
        retryable: true,
        errorCode: 'TEMP_FAILURE',
      });

      expect(mockGateway.emitGenerationError).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          retryable: true,
          errorCode: 'TEMP_FAILURE',
        })
      );
    });
  });

  describe('emitQueued', () => {
    it('should emit queued status with position', () => {
      service.emitQueued('user-123', 'prompt-456', 5);

      expect(mockGateway.emitGenerationProgress).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          status: 'queued',
          progress: 0,
          queuePosition: 5,
          message: 'Queued at position 5',
        })
      );
    });

    it('should emit queued status without position', () => {
      service.emitQueued('user-123', 'prompt-456');

      expect(mockGateway.emitGenerationProgress).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          status: 'queued',
          progress: 0,
          message: 'Job queued for processing',
        })
      );
    });
  });

  describe('emitProcessingStarted', () => {
    it('should emit processing started status', () => {
      service.emitProcessingStarted('user-123', 'prompt-456');

      expect(mockGateway.emitGenerationProgress).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          status: 'processing',
          progress: 15,
          message: 'Processing started',
        })
      );
    });

    it('should use custom message when provided', () => {
      service.emitProcessingStarted('user-123', 'prompt-456', 'Generating your image...');

      expect(mockGateway.emitGenerationProgress).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          message: 'Generating your image...',
        })
      );
    });
  });
});
