/**
 * Socket.io event types for real-time communication
 * Shared between frontend and backend
 */

// Generation status types
export type GenerationStatus = 'queued' | 'processing' | 'completed' | 'failed';

// Generation progress event payload
export interface GenerationProgressPayload {
  jobId: string;
  promptId: string;
  status: GenerationStatus;
  progress: number; // 0-100
  message?: string;
  queuePosition?: number;
}

// Generation complete event payload
export interface GenerationCompletePayload {
  jobId: string;
  promptId: string;
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
  }>;
  characterId: string;
  metadata?: Record<string, unknown>;
}

// Generation error event payload
export interface GenerationErrorPayload {
  jobId: string;
  promptId: string;
  error: string;
  errorCode?: string;
  retryable: boolean;
}

// All socket events from server to client
export interface ServerToClientEvents {
  // Generation events
  'generation:progress': (payload: GenerationProgressPayload) => void;
  'generation:complete': (payload: GenerationCompletePayload) => void;
  'generation:error': (payload: GenerationErrorPayload) => void;
  
  // Connection events
  'connection:established': (payload: { userId: string }) => void;
  
  // Notification events (future)
  'notification:new': (payload: { id: string; type: string; message: string }) => void;
}

// All socket events from client to server
export interface ClientToServerEvents {
  // Subscribe to generation updates
  'generation:subscribe': (promptIds: string[]) => void;
  'generation:unsubscribe': (promptIds: string[]) => void;
  
  // Ping for connection health
  'ping': () => void;
}

// Socket event names as constants
export const SOCKET_EVENTS = {
  // Server -> Client
  GENERATION_PROGRESS: 'generation:progress',
  GENERATION_COMPLETE: 'generation:complete',
  GENERATION_ERROR: 'generation:error',
  CONNECTION_ESTABLISHED: 'connection:established',
  NOTIFICATION_NEW: 'notification:new',
  
  // Client -> Server
  GENERATION_SUBSCRIBE: 'generation:subscribe',
  GENERATION_UNSUBSCRIBE: 'generation:unsubscribe',
  PING: 'ping',
} as const;
