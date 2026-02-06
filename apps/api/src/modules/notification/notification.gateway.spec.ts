import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationGateway } from './notification.gateway';
import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '@ryla/shared';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  let mockServer: {
    to: ReturnType<typeof vi.fn>;
    emit: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    gateway = new NotificationGateway();
    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    (gateway as any).server = mockServer;
  });

  describe('handleConnection', () => {
    it('should join user room when userId is provided', () => {
      const mockClient = {
        id: 'socket-123',
        handshake: { query: { userId: '456' } },
        join: vi.fn(),
        emit: vi.fn(),
      } as unknown as Socket;

      gateway.handleConnection(mockClient);

      expect(mockClient.join).toHaveBeenCalledWith('user-456');
      expect(mockClient.emit).toHaveBeenCalledWith(
        SOCKET_EVENTS.CONNECTION_ESTABLISHED,
        { userId: '456' }
      );
    });

    it('should handle connection without userId', () => {
      const mockClient = {
        id: 'socket-123',
        handshake: { query: {} },
        join: vi.fn(),
        emit: vi.fn(),
      } as unknown as Socket;

      gateway.handleConnection(mockClient);

      expect(mockClient.join).not.toHaveBeenCalled();
      expect(mockClient.emit).not.toHaveBeenCalled();
    });

    it('should support user-id query param format', () => {
      const mockClient = {
        id: 'socket-123',
        handshake: { query: { 'user-id': '789' } },
        join: vi.fn(),
        emit: vi.fn(),
      } as unknown as Socket;

      gateway.handleConnection(mockClient);

      expect(mockClient.join).toHaveBeenCalledWith('user-789');
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up user subscriptions on disconnect', () => {
      const mockClient = { id: 'socket-123' } as unknown as Socket;
      
      // Add some subscriptions first
      (gateway as any).userSubscriptions.set('socket-123', new Set(['prompt-1', 'prompt-2']));
      
      gateway.handleDisconnect(mockClient);

      expect((gateway as any).userSubscriptions.has('socket-123')).toBe(false);
    });
  });

  describe('handleGenerationSubscribe', () => {
    it('should track subscriptions for client', () => {
      const mockClient = { id: 'socket-123' } as unknown as Socket;

      gateway.handleGenerationSubscribe(mockClient, ['prompt-1', 'prompt-2']);

      const subs = (gateway as any).userSubscriptions.get('socket-123');
      expect(subs).toBeDefined();
      expect(subs.has('prompt-1')).toBe(true);
      expect(subs.has('prompt-2')).toBe(true);
    });

    it('should add to existing subscriptions', () => {
      const mockClient = { id: 'socket-123' } as unknown as Socket;
      (gateway as any).userSubscriptions.set('socket-123', new Set(['prompt-0']));

      gateway.handleGenerationSubscribe(mockClient, ['prompt-1']);

      const subs = (gateway as any).userSubscriptions.get('socket-123');
      expect(subs.has('prompt-0')).toBe(true);
      expect(subs.has('prompt-1')).toBe(true);
    });
  });

  describe('handleGenerationUnsubscribe', () => {
    it('should remove subscriptions for client', () => {
      const mockClient = { id: 'socket-123' } as unknown as Socket;
      (gateway as any).userSubscriptions.set('socket-123', new Set(['prompt-1', 'prompt-2', 'prompt-3']));

      gateway.handleGenerationUnsubscribe(mockClient, ['prompt-1', 'prompt-2']);

      const subs = (gateway as any).userSubscriptions.get('socket-123');
      expect(subs.has('prompt-1')).toBe(false);
      expect(subs.has('prompt-2')).toBe(false);
      expect(subs.has('prompt-3')).toBe(true);
    });
  });

  describe('emitGenerationProgress', () => {
    it('should emit progress event to user room', () => {
      const payload = {
        jobId: 'job-123',
        promptId: 'prompt-456',
        status: 'processing' as const,
        progress: 50,
      };

      gateway.emitGenerationProgress('user-123', payload);

      expect(mockServer.to).toHaveBeenCalledWith('user-user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        SOCKET_EVENTS.GENERATION_PROGRESS,
        payload
      );
    });
  });

  describe('emitGenerationComplete', () => {
    it('should emit complete event to user room', () => {
      const payload = {
        jobId: 'job-123',
        promptId: 'prompt-456',
        characterId: 'char-789',
        images: [{ id: 'img-1', url: 'https://example.com/1.jpg' }],
      };

      gateway.emitGenerationComplete('user-123', payload);

      expect(mockServer.to).toHaveBeenCalledWith('user-user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        SOCKET_EVENTS.GENERATION_COMPLETE,
        payload
      );
    });
  });

  describe('emitGenerationError', () => {
    it('should emit error event to user room', () => {
      const payload = {
        jobId: 'job-123',
        promptId: 'prompt-456',
        error: 'Generation failed',
        retryable: true,
      };

      gateway.emitGenerationError('user-123', payload);

      expect(mockServer.to).toHaveBeenCalledWith('user-user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        SOCKET_EVENTS.GENERATION_ERROR,
        payload
      );
    });
  });

  describe('sendToUser', () => {
    it('should emit event to specific user room', () => {
      gateway.sendToUser(123, 'custom-event', { data: 'test' });

      expect(mockServer.to).toHaveBeenCalledWith('user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('custom-event', { data: 'test' });
    });
  });
});
