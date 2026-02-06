'use client';

import * as React from 'react';
import { useSocket } from '../socket-context';
import type {
  GenerationProgressPayload,
  GenerationCompletePayload,
  GenerationErrorPayload,
  GenerationStatus,
  SOCKET_EVENTS,
} from '@ryla/shared';

interface GenerationState {
  status: GenerationStatus;
  progress: number;
  message?: string;
  queuePosition?: number;
  result?: GenerationCompletePayload;
  error?: GenerationErrorPayload;
}

interface UseGenerationSocketOptions {
  onProgress?: (payload: GenerationProgressPayload) => void;
  onComplete?: (payload: GenerationCompletePayload) => void;
  onError?: (payload: GenerationErrorPayload) => void;
}

interface UseGenerationSocketReturn {
  /** Current generation states by promptId */
  generations: Map<string, GenerationState>;
  /** Whether socket is connected */
  isConnected: boolean;
  /** Subscribe to generation updates for specific promptIds */
  subscribe: (promptIds: string[]) => void;
  /** Unsubscribe from generation updates */
  unsubscribe: (promptIds: string[]) => void;
  /** Get state for a specific promptId */
  getState: (promptId: string) => GenerationState | undefined;
}

/**
 * Hook for subscribing to real-time generation updates via WebSocket
 * 
 * @example
 * ```tsx
 * const { generations, subscribe, isConnected } = useGenerationSocket({
 *   onComplete: (payload) => {
 *     console.log('Generation complete:', payload);
 *   },
 * });
 * 
 * // Subscribe when starting generation
 * const handleGenerate = async () => {
 *   const { promptId } = await startGeneration();
 *   subscribe([promptId]);
 * };
 * ```
 */
export function useGenerationSocket(
  options: UseGenerationSocketOptions = {}
): UseGenerationSocketReturn {
  const { socket, isConnected } = useSocket();
  const { onProgress, onComplete, onError } = options;
  
  const [generations, setGenerations] = React.useState<Map<string, GenerationState>>(
    new Map()
  );
  
  // Keep track of subscribed promptIds
  const subscribedIds = React.useRef<Set<string>>(new Set());

  // Handle progress updates
  React.useEffect(() => {
    if (!socket) return;

    const handleProgress = (payload: GenerationProgressPayload) => {
      setGenerations((prev) => {
        const next = new Map(prev);
        next.set(payload.promptId, {
          status: payload.status,
          progress: payload.progress,
          message: payload.message,
          queuePosition: payload.queuePosition,
        });
        return next;
      });
      onProgress?.(payload);
    };

    const handleComplete = (payload: GenerationCompletePayload) => {
      setGenerations((prev) => {
        const next = new Map(prev);
        next.set(payload.promptId, {
          status: 'completed',
          progress: 100,
          result: payload,
        });
        return next;
      });
      onComplete?.(payload);
      
      // Auto-unsubscribe on completion
      subscribedIds.current.delete(payload.promptId);
    };

    const handleError = (payload: GenerationErrorPayload) => {
      setGenerations((prev) => {
        const next = new Map(prev);
        next.set(payload.promptId, {
          status: 'failed',
          progress: 0,
          error: payload,
        });
        return next;
      });
      onError?.(payload);
      
      // Auto-unsubscribe on error
      subscribedIds.current.delete(payload.promptId);
    };

    socket.on('generation:progress', handleProgress);
    socket.on('generation:complete', handleComplete);
    socket.on('generation:error', handleError);

    return () => {
      socket.off('generation:progress', handleProgress);
      socket.off('generation:complete', handleComplete);
      socket.off('generation:error', handleError);
    };
  }, [socket, onProgress, onComplete, onError]);

  // Subscribe to specific promptIds
  const subscribe = React.useCallback(
    (promptIds: string[]) => {
      if (!socket) return;
      
      const newIds = promptIds.filter((id) => !subscribedIds.current.has(id));
      if (newIds.length === 0) return;
      
      newIds.forEach((id) => subscribedIds.current.add(id));
      socket.emit('generation:subscribe', newIds);
      
      // Initialize state for new subscriptions
      setGenerations((prev) => {
        const next = new Map(prev);
        newIds.forEach((id) => {
          if (!next.has(id)) {
            next.set(id, { status: 'queued', progress: 0 });
          }
        });
        return next;
      });
    },
    [socket]
  );

  // Unsubscribe from specific promptIds
  const unsubscribe = React.useCallback(
    (promptIds: string[]) => {
      if (!socket) return;
      
      promptIds.forEach((id) => subscribedIds.current.delete(id));
      socket.emit('generation:unsubscribe', promptIds);
      
      // Clean up state
      setGenerations((prev) => {
        const next = new Map(prev);
        promptIds.forEach((id) => next.delete(id));
        return next;
      });
    },
    [socket]
  );

  // Get state for a specific promptId
  const getState = React.useCallback(
    (promptId: string) => generations.get(promptId),
    [generations]
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (socket && subscribedIds.current.size > 0) {
        socket.emit('generation:unsubscribe', Array.from(subscribedIds.current));
      }
    };
  }, [socket]);

  return {
    generations,
    isConnected,
    subscribe,
    unsubscribe,
    getState,
  };
}

/**
 * Hook for a single generation's status
 * Simpler API when tracking just one generation
 */
export function useSingleGenerationSocket(
  promptId: string | null,
  options: UseGenerationSocketOptions = {}
): GenerationState & { isConnected: boolean } {
  const { generations, isConnected, subscribe, unsubscribe } = useGenerationSocket(options);
  
  // Subscribe when promptId changes
  React.useEffect(() => {
    if (!promptId) return;
    
    subscribe([promptId]);
    
    return () => {
      unsubscribe([promptId]);
    };
  }, [promptId, subscribe, unsubscribe]);

  const state = promptId ? generations.get(promptId) : undefined;
  
  return {
    status: state?.status || 'queued',
    progress: state?.progress || 0,
    message: state?.message,
    queuePosition: state?.queuePosition,
    result: state?.result,
    error: state?.error,
    isConnected,
  };
}
