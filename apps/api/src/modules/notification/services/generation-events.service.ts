import { Injectable, Optional } from '@nestjs/common';
import { NotificationGateway } from '../notification.gateway';
import type {
  GenerationStatus,
  GenerationProgressPayload,
  GenerationCompletePayload,
  GenerationErrorPayload,
} from '@ryla/shared';

/**
 * Service for emitting generation-related WebSocket events
 *
 * Wraps NotificationGateway with typed methods for generation events.
 * Inject this into generation services to push real-time updates.
 * Gateway is optional so callers do not crash when WebSocket is unavailable.
 */
@Injectable()
export class GenerationEventsService {
  constructor(
    @Optional() private readonly gateway: NotificationGateway | undefined,
  ) {}

  /**
   * Emit progress update for a generation job
   */
  emitProgress(
    userId: string | number,
    promptId: string,
    status: GenerationStatus,
    progress: number,
    options?: {
      jobId?: string;
      message?: string;
      queuePosition?: number;
    }
  ): void {
    if (!this.gateway) return;
    const payload: GenerationProgressPayload = {
      jobId: options?.jobId || promptId,
      promptId,
      status,
      progress: Math.min(100, Math.max(0, Math.round(progress))),
      message: options?.message,
      queuePosition: options?.queuePosition,
    };
    this.gateway.emitGenerationProgress(userId, payload);
  }

  /**
   * Emit completion event for a generation job
   */
  emitComplete(
    userId: string | number,
    promptId: string,
    characterId: string,
    images: Array<{
      id: string;
      url: string;
      thumbnailUrl?: string;
    }>,
    options?: {
      jobId?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    if (!this.gateway) return;
    const payload: GenerationCompletePayload = {
      jobId: options?.jobId || promptId,
      promptId,
      characterId,
      images,
      metadata: options?.metadata,
    };
    this.gateway.emitGenerationComplete(userId, payload);
  }

  /**
   * Emit error event for a generation job
   */
  emitError(
    userId: string | number,
    promptId: string,
    error: string,
    options?: {
      jobId?: string;
      errorCode?: string;
      retryable?: boolean;
    }
  ): void {
    if (!this.gateway) return;
    const payload: GenerationErrorPayload = {
      jobId: options?.jobId || promptId,
      promptId,
      error,
      errorCode: options?.errorCode,
      retryable: options?.retryable ?? false,
    };
    this.gateway.emitGenerationError(userId, payload);
  }

  /**
   * Emit queued status for a new generation job
   */
  emitQueued(
    userId: string | number,
    promptId: string,
    queuePosition?: number
  ): void {
    this.emitProgress(userId, promptId, 'queued', 0, {
      queuePosition,
      message: queuePosition 
        ? `Queued at position ${queuePosition}`
        : 'Job queued for processing',
    });
  }

  /**
   * Emit processing started for a generation job
   */
  emitProcessingStarted(
    userId: string | number,
    promptId: string,
    message?: string
  ): void {
    this.emitProgress(userId, promptId, 'processing', 15, {
      message: message || 'Processing started',
    });
  }
}
