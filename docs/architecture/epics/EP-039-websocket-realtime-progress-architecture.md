# EP-039: WebSocket-based Real-time Progress Tracking - Architecture

**Phase**: P3 - Architecture & API Design  
**Epic**: EP-039  
**Initiative**: IN-007  
**Status**: In Progress

---

## 1. Functional Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (apps/api)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Image Generation Service Layer                    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  StudioGenerationService                        │    │  │
│  │  │  ┌───────────────────────────────────────────┐  │    │  │
│  │  │  │  startStudioGeneration()                  │  │    │  │
│  │  │  │  → ComfyUIJobRunner.submitBaseImage()     │  │    │  │
│  │  │  └───────────────────────────────────────────┘  │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  ComfyUIJobRunner                                │    │  │
│  │  │  ┌───────────────────────────────────────────┐  │    │  │
│  │  │  │  submitBaseImage()                         │  │    │  │
│  │  │  │  → ComfyUIPodClient.executeWorkflow()     │  │    │  │
│  │  │  └───────────────────────────────────────────┘  │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Business Logic Layer (@ryla/business)              │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  ComfyUIPodClient (enhanced)                     │    │  │
│  │  │  ┌───────────────────────────────────────────┐  │    │  │
│  │  │  │  executeWorkflow() [enhanced]              │  │    │  │
│  │  │  │  ├── Try WebSocket first                  │  │    │  │
│  │  │  │  └── Fallback to REST polling             │  │    │  │
│  │  │  │                                            │  │    │  │
│  │  │  │  executeWorkflowWithWebSocket() [new]     │  │    │  │
│  │  │  │  └── Uses ComfyUIWebSocketClient          │  │    │  │
│  │  │  └───────────────────────────────────────────┘  │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  ComfyUIWebSocketClient (new)                    │    │  │
│  │  │  ┌───────────────────────────────────────────┐  │    │  │
│  │  │  │  connect(baseUrl) → clientId              │  │    │  │
│  │  │  │  onProgress(promptId, handler)            │  │    │  │
│  │  │  │  onCompletion(promptId, handler)         │  │    │  │
│  │  │  │  onError(promptId, handler)              │  │    │  │
│  │  │  │  disconnect(clientId)                    │  │    │  │
│  │  │  └───────────────────────────────────────────┘  │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         External: ComfyUI Pod (RunPod)                    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  WebSocket: ws://pod-url/ws?clientId=uuid       │    │  │
│  │  │  ├── progress_state events                      │    │  │
│  │  │  ├── executed events                            │    │  │
│  │  │  ├── execution_error events                     │    │  │
│  │  │  └── status events                              │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  REST API: https://pod-url/prompt                │    │  │
│  │  │  ├── POST /prompt (queue workflow)              │    │  │
│  │  │  └── GET /history/{id} (poll status)            │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (apps/web)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Studio Page / Generation Status                        │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  ProgressBar Component                           │    │  │
│  │  │  ├── progress: 0-100%                            │    │  │
│  │  │  ├── status: "Processing... 45%"                  │    │  │
│  │  │  └── estimatedTimeRemaining                       │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

- **Backward Compatible**: Existing REST polling continues to work as fallback
- **Dual-Mode Execution**: WebSocket primary, REST fallback
- **Progressive Enhancement**: WebSocket enhances but doesn't break existing flows
- **Real-time Updates**: Progress updates pushed immediately via WebSocket
- **Graceful Degradation**: Automatic fallback to REST if WebSocket fails

---

## 2. Data Model

### WebSocket Connection State

```typescript
interface ComfyUIConnection {
  ws: WebSocket;
  clientId: string;
  serverUrl: string;
  isConnected: boolean;
  reconnectAttempts: number;
  currentPromptId: string | null;
}
```

### WebSocket Message Types

```typescript
// Base message structure
interface ComfyUIMessage {
  type: 'status' | 'progress_state' | 'executed' | 'execution_error';
  data: unknown;
}

// Progress state message
interface ProgressStateMessageData {
  prompt_id: string;
  nodes: Record<string, {
    value: number;  // Current progress value
    max: number;    // Max progress value
  }>;
}

// Executed message
interface ExecutedMessageData {
  node: string;     // Node ID that completed
  prompt_id: string;
  output?: ExecutedOutput;
}

// Execution error message
interface ExecutionErrorData {
  prompt_id: string;
  exception_type: string;
  exception_message: string;
}
```

### Progress Calculation

```typescript
interface ProgressCalculation {
  totalMax: number;      // Sum of all node max values
  totalValue: number;     // Sum of all node current values
  progress: number;       // 0-100 percentage
  nodes: Record<string, NodeProgress>;
}

interface NodeProgress {
  value: number;
  max: number;
  percentage: number;
}
```

### Job Progress State (in-memory)

```typescript
interface JobProgressState {
  promptId: string;
  progress: number;           // 0-100
  status: 'queued' | 'processing' | 'completed' | 'failed';
  lastUpdate: number;          // timestamp
  handlers: {
    progress?: (progress: number) => void;
    completion?: (result: ComfyUIJobResult) => void;
    error?: (error: string) => void;
  };
}
```

---

## 3. API Contracts

### ComfyUIWebSocketClient API

```typescript
class ComfyUIWebSocketClient {
  /**
   * Connect to ComfyUI WebSocket server
   * @param serverUrl - Base URL of ComfyUI server
   * @param clientId - Optional client ID (generated if not provided)
   * @returns Client ID for this connection
   */
  async connect(serverUrl: string, clientId?: string): Promise<string>;

  /**
   * Register progress handler for a prompt
   * @param promptId - Prompt ID to track
   * @param handler - Callback function (progress: 0-100)
   */
  onProgress(promptId: string, handler: (progress: number) => void): void;

  /**
   * Register completion handler for a prompt
   * @param promptId - Prompt ID to track
   * @param handler - Callback function with job result
   */
  onCompletion(
    promptId: string,
    handler: (result: ComfyUIJobResult) => void
  ): void;

  /**
   * Register error handler for a prompt
   * @param promptId - Prompt ID to track
   * @param handler - Callback function with error message
   */
  onError(promptId: string, handler: (error: string) => void): void;

  /**
   * Disconnect WebSocket connection
   * @param clientId - Client ID to disconnect
   */
  disconnect(clientId: string): void;
}
```

### ComfyUIPodClient Enhanced API

```typescript
class ComfyUIPodClient {
  // Existing methods (unchanged)
  async queueWorkflow(workflow: ComfyUIWorkflow): Promise<string>;
  async getJobStatus(promptId: string): Promise<ComfyUIJobResult>;
  async executeWorkflow(workflow: ComfyUIWorkflow): Promise<ComfyUIJobResult>;

  // New method: WebSocket-based execution
  /**
   * Execute workflow with WebSocket progress tracking
   * @param workflow - ComfyUI workflow JSON
   * @param onProgress - Optional progress callback (0-100)
   * @returns Job result with images
   */
  async executeWorkflowWithWebSocket(
    workflow: ComfyUIWorkflow,
    onProgress?: (progress: number) => void
  ): Promise<ComfyUIJobResult>;

  // Enhanced: Existing method now tries WebSocket first
  /**
   * Execute workflow (enhanced - tries WebSocket, falls back to polling)
   * @param workflow - ComfyUI workflow JSON
   * @param onProgress - Optional progress callback (0-100)
   * @returns Job result with images
   */
  async executeWorkflow(
    workflow: ComfyUIWorkflow,
    onProgress?: (progress: number) => void
  ): Promise<ComfyUIJobResult>;
}
```

### Frontend Progress API (Future - Phase 4)

```typescript
// Server-Sent Events or WebSocket for frontend
interface ProgressUpdate {
  promptId: string;
  progress: number;        // 0-100
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedTimeRemaining?: number;  // seconds
}

// API endpoint (future)
GET /api/image/comfyui/:promptId/progress
// Returns: ProgressUpdate (SSE stream or WebSocket)
```

---

## 4. Component Architecture

### Backend Components

```
libs/business/src/services/
├── comfyui-websocket-client.ts (NEW)
│   ├── ComfyUIWebSocketClient class
│   ├── Connection management
│   ├── Message parsing
│   └── Progress calculation
│
├── comfyui-pod-client.ts (MODIFY)
│   ├── Enhanced executeWorkflow() (tries WebSocket)
│   ├── New executeWorkflowWithWebSocket()
│   └── Health check before WebSocket attempt
│
└── comfyui-job-runner.ts (MODIFY)
    └── Use WebSocket client when available

libs/business/src/interfaces/
└── comfyui-websocket.interface.ts (NEW)
    ├── ComfyUIMessage
    ├── ProgressStateMessageData
    ├── ExecutedMessageData
    └── ExecutionErrorData
```

### Frontend Components (Future - Phase 4)

```
apps/web/components/
└── generation/
    └── ProgressBar.tsx (NEW)
        ├── progress: 0-100
        ├── status text
        └── estimated time
```

---

## 5. Event Schema (PostHog Analytics)

### WebSocket Events

```typescript
// WebSocket connection events
{
  event: 'comfyui_websocket_connected',
  properties: {
    clientId: string;
    serverUrl: string;
    connectionTime: number;  // milliseconds
  }
}

{
  event: 'comfyui_websocket_disconnected',
  properties: {
    clientId: string;
    reason: string;
    duration: number;  // seconds
  }
}

{
  event: 'comfyui_websocket_fallback',
  properties: {
    promptId: string;
    reason: 'connection_failed' | 'timeout' | 'error';
    fallbackMethod: 'rest_polling';
  }
}

// Progress tracking events
{
  event: 'comfyui_progress_update',
  properties: {
    promptId: string;
    progress: number;  // 0-100
    jobType: 'image_generation' | 'lora_training' | 'face_swap';
  }
}

// Job execution events
{
  event: 'comfyui_job_websocket_completed',
  properties: {
    promptId: string;
    duration: number;  // seconds
    progressUpdates: number;  // count of progress events
    method: 'websocket';
  }
}

{
  event: 'comfyui_job_websocket_failed',
  properties: {
    promptId: string;
    error: string;
    method: 'websocket';
  }
}
```

---

## 6. Funnel Definitions

### WebSocket Adoption Funnel

```
1. Job Submitted
   ↓
2. WebSocket Attempt
   ↓
3. WebSocket Connected (or Fallback to REST)
   ↓
4. Progress Updates Received
   ↓
5. Job Completed
```

**Metrics**:
- WebSocket connection success rate
- Fallback to REST rate
- Progress update delivery rate
- Job completion rate (WebSocket vs REST)

---

## 7. Integration Points

### With Existing Services

1. **ComfyUIJobRunner**:
   - Uses `ComfyUIPodClient.executeWorkflow()` (enhanced)
   - Automatically gets WebSocket progress if available
   - Falls back to REST polling transparently

2. **StudioGenerationService**:
   - No changes required (uses ComfyUIJobRunner)
   - Can optionally pass progress callback

3. **ComfyUIResultsService**:
   - Can use WebSocket progress for status updates
   - Polling still works as fallback

### With Future Epics

1. **EP-040 (Redis Persistence)**:
   - Can store WebSocket progress in Redis
   - Recover WebSocket connections on restart

2. **EP-041 (Error Handling)**:
   - WebSocket errors trigger retry logic
   - Health checks before WebSocket attempts

---

## 8. Error Handling

### WebSocket Connection Errors

```typescript
// Connection timeout
if (connectionTimeout) {
  fallbackToREST();
  log('websocket_connection_timeout');
}

// Connection failure
if (connectionFailed) {
  fallbackToREST();
  log('websocket_connection_failed', { error });
}

// Reconnection attempts
if (reconnectAttempts >= MAX_RECONNECT) {
  fallbackToREST();
  log('websocket_max_reconnect_exceeded');
}
```

### Message Parsing Errors

```typescript
// Invalid message format
try {
  const message = JSON.parse(data);
} catch (error) {
  log('websocket_invalid_message', { error, data });
  // Continue listening, don't break connection
}
```

### Progress Calculation Errors

```typescript
// Division by zero or invalid progress
if (totalMax === 0 || isNaN(progress)) {
  log('websocket_invalid_progress', { nodes });
  // Return last known progress or 0
  return lastProgress || 0;
}
```

---

## 9. Performance Considerations

### Connection Pooling

- One WebSocket connection per ComfyUI server
- Reuse connections for multiple jobs
- Connection lifecycle management

### Progress Update Throttling

- Throttle progress updates to max 1 per second
- Batch multiple node updates
- Store latest progress for recovery

### Memory Management

- Clean up handlers after job completion
- Remove completed jobs from tracking
- Limit concurrent WebSocket connections

---

## 10. Testing Strategy

### Unit Tests

- WebSocket client connection logic
- Message parsing and validation
- Progress calculation
- Error handling

### Integration Tests

- WebSocket connection to real ComfyUI pod
- Progress tracking end-to-end
- Fallback to REST polling
- Error recovery

### Performance Tests

- WebSocket connection time
- Progress update latency
- Memory usage with multiple connections
- Concurrent job handling

---

**Created**: 2026-01-27  
**Last Updated**: 2026-01-27  
**Status**: P3 Complete - Ready for P4 (UI Skeleton)
