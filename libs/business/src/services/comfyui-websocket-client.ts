/**
 * ComfyUI WebSocket Client
 *
 * WebSocket client for real-time progress tracking with ComfyUI servers.
 * Provides percentage progress updates (0-100%) calculated from node execution states.
 *
 * Architecture:
 *   RYLA API → WebSocket → ComfyUI Pod → Real-time progress updates
 *
 * Based on MDC's proven ComfyUIWebSocketService implementation.
 *
 * @see EP-039: WebSocket-based Real-time Progress Tracking
 * @see IN-007: ComfyUI Infrastructure Improvements
 */

import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import type {
  ComfyUIConnection,
  ComfyUIMessage,
  ProgressStateMessageData,
  ExecutedMessageData,
  ExecutionErrorData,
  ComfyUIJobResult,
} from '../interfaces/comfyui-websocket.interface';

export interface ComfyUIWebSocketConfig {
  /** Base URL of the ComfyUI server (e.g., "https://xyz-8188.proxy.runpod.net") */
  serverUrl: string;
  /** Connection timeout in milliseconds (default: 10000 = 10 seconds) */
  connectionTimeout?: number;
  /** Max reconnection attempts (default: 3) */
  maxReconnectAttempts?: number;
  /** Reconnection delay in milliseconds (default: 5000 = 5 seconds) */
  reconnectDelay?: number;
}

export class ComfyUIWebSocketClient {
  private connections: Map<string, ComfyUIConnection> = new Map();
  private progressHandlers: Map<string, (progress: number) => void> = new Map();
  private completionHandlers: Map<string, (result: ComfyUIJobResult) => void> = new Map();
  private errorHandlers: Map<string, (error: string) => void> = new Map();
  private progressState: Map<string, number> = new Map(); // promptId -> last progress (0-100)

  private readonly MAX_RECONNECT_ATTEMPTS: number;
  private readonly RECONNECT_DELAY: number;
  private readonly CONNECTION_TIMEOUT: number;

  constructor(config?: ComfyUIWebSocketConfig) {
    this.MAX_RECONNECT_ATTEMPTS = config?.maxReconnectAttempts ?? 3;
    this.RECONNECT_DELAY = config?.reconnectDelay ?? 5000;
    this.CONNECTION_TIMEOUT = config?.connectionTimeout ?? 10000;
  }

  /**
   * Connect to ComfyUI WebSocket server
   * @param serverUrl - Base URL of ComfyUI server
   * @param clientId - Optional client ID (generated if not provided)
   * @returns Client ID for this connection
   */
  async connect(serverUrl: string, clientId?: string): Promise<string> {
    const normalizedUrl = serverUrl.replace(/\/+$/, ''); // Remove trailing slashes
    const id = clientId || uuidv4();

    // Check if already connected
    const existing = this.connections.get(id);
    if (existing && existing.isConnected) {
      console.log(`Already connected to ${normalizedUrl} with client ID: ${id}`);
      return id;
    }

    // Convert HTTP URL to WebSocket URL
    const wsUrl = normalizedUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');
    const fullWsUrl = `${wsUrl}/ws?clientId=${id}`;

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(fullWsUrl);

        const connection: ComfyUIConnection = {
          ws,
          clientId: id,
          serverUrl: normalizedUrl,
          isConnected: false,
          reconnectAttempts: 0,
          currentPromptId: null,
        };

        ws.on('open', () => {
          console.log(`WebSocket connected to ${normalizedUrl} (Client ID: ${id})`);
          connection.isConnected = true;
          connection.reconnectAttempts = 0;
          this.connections.set(id, connection);
          resolve(id);
        });

        ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(id, data);
        });

        ws.on('error', (error: Error) => {
          console.error(
            `WebSocket error for ${normalizedUrl} (Client ID: ${id}): ${error.message}`
          );
          connection.isConnected = false;
          // Don't reject here - let close handler handle reconnection
        });

        ws.on('close', () => {
          console.log(`WebSocket closed for ${normalizedUrl} (Client ID: ${id})`);
          connection.isConnected = false;
          this.handleReconnect(id, connection);
        });

        // Set timeout for connection
        setTimeout(() => {
          if (!connection.isConnected) {
            ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, this.CONNECTION_TIMEOUT);
      } catch (error) {
        console.error(`Failed to create WebSocket connection: ${error}`);
        reject(error);
      }
    });
  }

  /**
   * Register progress handler for a prompt
   * @param promptId - Prompt ID to track
   * @param handler - Callback function (progress: 0-100)
   */
  onProgress(promptId: string, handler: (progress: number) => void): void {
    this.progressHandlers.set(promptId, handler);
  }

  /**
   * Register completion handler for a prompt
   * @param promptId - Prompt ID to track
   * @param handler - Callback function with job result
   */
  onCompletion(
    promptId: string,
    handler: (result: ComfyUIJobResult) => void
  ): void {
    this.completionHandlers.set(promptId, handler);
  }

  /**
   * Register error handler for a prompt
   * @param promptId - Prompt ID to track
   * @param handler - Callback function with error message
   */
  onError(promptId: string, handler: (error: string) => void): void {
    this.errorHandlers.set(promptId, handler);
  }

  /**
   * Disconnect WebSocket connection
   * @param clientId - Client ID to disconnect
   */
  disconnect(clientId: string): void {
    const connection = this.connections.get(clientId);
    if (connection) {
      connection.ws.close();
      this.connections.delete(clientId);
      console.log(`Disconnected client: ${clientId}`);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(clientId: string, data: WebSocket.Data): void {
    try {
      const message: ComfyUIMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'status':
          this.handleStatusMessage(clientId, message.data);
          break;
        case 'progress_state':
          this.handleProgressMessage(clientId, message.data as ProgressStateMessageData);
          break;
        case 'executed':
          this.handleExecutedMessage(clientId, message.data as ExecutedMessageData);
          break;
        case 'execution_error':
          this.handleExecutionError(clientId, message.data as ExecutionErrorData);
          break;
        default:
          console.debug(`Received message type: ${message.type} (Client ID: ${clientId})`);
      }
    } catch (error) {
      console.error(`Failed to parse WebSocket message: ${error}`);
    }
  }

  /**
   * Handle status messages (connection status, queue info)
   */
  private handleStatusMessage(clientId: string, data: unknown): void {
    console.debug(`Status update (Client ID: ${clientId}): ${JSON.stringify(data)}`);
  }

  /**
   * Handle progress state messages
   * Calculates overall progress based on all nodes
   */
  private handleProgressMessage(
    clientId: string,
    data: ProgressStateMessageData
  ): void {
    const { prompt_id, nodes } = data;

    // Check if progress handler exists
    const handler = this.progressHandlers.get(prompt_id);
    if (!handler) return;

    // Calculate total progress
    let totalMax = 0;
    let totalValue = 0;

    for (const nodeData of Object.values(nodes)) {
      totalMax += nodeData.max;
      totalValue += nodeData.value;
    }

    // Calculate overall progress percentage
    const progress = totalMax > 0 ? Math.round((totalValue / totalMax) * 100) : 0;
    const clampedProgress = Math.min(100, Math.max(0, progress));

    // Throttle updates (max 1 per second)
    const lastProgress = this.progressState.get(prompt_id);
    const now = Date.now();
    const lastUpdate = this.progressState.get(`${prompt_id}_timestamp`) || 0;

    if (clampedProgress !== lastProgress || now - lastUpdate >= 1000) {
      this.progressState.set(prompt_id, clampedProgress);
      this.progressState.set(`${prompt_id}_timestamp`, now);
      handler(clampedProgress);
    }
  }

  /**
   * Handle executed messages (when a node completes)
   * Note: WebSocket signals completion, but images are fetched via REST API
   * by the caller (ComfyUIPodClient) to avoid circular dependencies.
   */
  private async handleExecutedMessage(
    clientId: string,
    data: ExecutedMessageData
  ): Promise<void> {
    const { node, prompt_id, output } = data;

    console.log(`Node ${node} executed (Client ID: ${clientId}, Prompt: ${prompt_id})`);

    // Signal completion when output node executes (has images/gifs)
    // The actual image download happens in ComfyUIPodClient.getJobStatus()
    if (output && (output.images || output.gifs)) {
      const handler = this.completionHandlers.get(prompt_id);
      if (handler) {
        // Signal completion - images will be fetched by ComfyUIPodClient.getJobStatus()
        const result: ComfyUIJobResult = {
          promptId: prompt_id,
          status: 'completed',
          // Images will be fetched by caller using getJobStatus()
        };

        await handler(result);
        this.cleanupHandlers(prompt_id);
      }
    }
  }

  /**
   * Handle execution errors
   */
  private async handleExecutionError(
    clientId: string,
    data: ExecutionErrorData
  ): Promise<void> {
    const { prompt_id, exception_type, exception_message } = data;

    console.error(
      `Execution error (Client ID: ${clientId}, Prompt: ${prompt_id}): ${exception_type} - ${exception_message}`
    );

    const errorMessage = `${exception_type}: ${exception_message}`;
    const handler = this.errorHandlers.get(prompt_id);

    if (handler) {
      try {
        await handler(errorMessage);
      } catch (handlerError) {
        console.error(`Error in error handler: ${handlerError}`);
      }
      this.cleanupHandlers(prompt_id);
    } else {
      // If no handler registered, still cleanup to prevent memory leaks
      this.cleanupHandlers(prompt_id);
    }
  }

  /**
   * Handle reconnection logic
   */
  private async handleReconnect(
    clientId: string,
    connection: ComfyUIConnection
  ): Promise<void> {
    if (connection.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.warn(
        `Max reconnection attempts reached for ${connection.serverUrl} (Client ID: ${clientId})`
      );
      this.connections.delete(clientId);
      return;
    }

    connection.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${connection.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}) to ${connection.serverUrl}...`
    );

    await new Promise((resolve) => setTimeout(resolve, this.RECONNECT_DELAY));

    try {
      await this.connect(connection.serverUrl, clientId);
    } catch (error) {
      console.error(`Reconnection failed: ${error}`);
    }
  }

  /**
   * Cleanup handlers for a prompt
   */
  private cleanupHandlers(promptId: string): void {
    this.progressHandlers.delete(promptId);
    this.completionHandlers.delete(promptId);
    this.errorHandlers.delete(promptId);
    this.progressState.delete(promptId);
    this.progressState.delete(`${promptId}_timestamp`);
  }
}
