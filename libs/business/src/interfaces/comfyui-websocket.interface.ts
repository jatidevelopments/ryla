/**
 * ComfyUI WebSocket Interface Definitions
 *
 * TypeScript interfaces for ComfyUI WebSocket messages and connection state.
 * Based on MDC's proven implementation patterns.
 *
 * @see EP-039: WebSocket-based Real-time Progress Tracking
 */

import WebSocket from 'ws';

/**
 * Base ComfyUI WebSocket message structure
 */
export interface ComfyUIMessage {
  type: 'status' | 'progress_state' | 'executed' | 'execution_error';
  data: unknown;
}

/**
 * Progress state node data
 * Represents the execution state of a single node in the workflow
 */
export interface ProgressStateNodeData {
  value: number;  // Current progress value
  max: number;    // Maximum progress value
  state: 'running' | 'finished';
  node_id: string;
  prompt_id: string;
  display_node_id: string;
  parent_node_id: string | null;
  real_node_id: string;
}

/**
 * Progress state message data
 * Contains progress information for all nodes in a workflow
 */
export interface ProgressStateMessageData {
  prompt_id: string;
  nodes: Record<string, ProgressStateNodeData>;
}

/**
 * Executed node output
 * Contains output data from a completed node (e.g., images, videos)
 */
export interface ExecutedOutput {
  gifs?: Array<{
    filename: string;
    subfolder: string;
    type: string;
    format?: string;
    frame_rate?: number;
    workflow?: string;
    fullpath?: string;
  }>;
  images?: Array<{
    filename: string;
    subfolder: string;
    type: string;
  }>;
}

/**
 * Executed message data
 * Notification when a specific node has finished execution
 */
export interface ExecutedMessageData {
  node: string;  // Node ID that completed
  display_node?: string;
  prompt_id: string;
  output?: ExecutedOutput;
}

/**
 * Execution error data
 * Error information when workflow execution fails
 */
export interface ExecutionErrorData {
  prompt_id: string;
  exception_type: string;
  exception_message: string;
}

/**
 * ComfyUI WebSocket connection state
 */
export interface ComfyUIConnection {
  ws: WebSocket;
  clientId: string;
  serverUrl: string;
  isConnected: boolean;
  reconnectAttempts: number;
  currentPromptId: string | null;
}

/**
 * Job progress state (in-memory tracking)
 */
export interface JobProgressState {
  promptId: string;
  progress: number;  // 0-100
  status: 'queued' | 'processing' | 'completed' | 'failed';
  lastUpdate: number;  // timestamp
  handlers: {
    progress?: (progress: number) => void;
    completion?: (result: ComfyUIJobResult) => void;
    error?: (error: string) => void;
  };
}

/**
 * ComfyUI job result
 * Matches the interface from comfyui-pod-client for consistency
 */
export interface ComfyUIJobResult {
  promptId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  images?: string[];  // Base64 encoded images
  error?: string;
}
