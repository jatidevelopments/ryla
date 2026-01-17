# EP-039 (P5) — WebSocket Real-time Progress: File Plan + Tasks

Working in **PHASE P5 (File plan + tasks)** on **EP-039**.

## Scope (MVP)

- **WebSocket client** for ComfyUI connections
- **Real-time progress tracking** (0-100%) from node execution states
- **Backward compatible** with existing REST polling
- **Automatic fallback** to REST if WebSocket fails
- **Progress callbacks** for real-time updates

Explicitly out of MVP:
- Redis persistence (EP-040)
- Enhanced error retry logic (EP-041)
- Frontend progress UI components (minimal - can be added later)
- Multiple WebSocket connections per job

---

## Current Reality (Starting Point)

- `ComfyUIPodClient` uses REST API polling (`/history/{id}`) every 2 seconds
- `ComfyUIJobRunner` uses `ComfyUIPodClient.executeWorkflow()` which polls
- No real-time progress updates
- Binary status only (queued/processing/completed/failed)
- ComfyUI pod supports WebSocket API (standard feature)

---

## File Plan

### New Files

1. **`libs/business/src/services/comfyui-websocket-client.ts`**
   - Purpose: WebSocket client for ComfyUI connections
   - Exports: `ComfyUIWebSocketClient` class
   - Responsibilities:
     - WebSocket connection management
     - Message parsing and validation
     - Progress calculation from node states
     - Event handler registration
     - Reconnection logic

2. **`libs/business/src/interfaces/comfyui-websocket.interface.ts`**
   - Purpose: TypeScript interfaces for WebSocket messages
   - Exports:
     - `ComfyUIMessage`
     - `ProgressStateMessageData`
     - `ExecutedMessageData`
     - `ExecutionErrorData`
     - `ComfyUIConnection`
     - `JobProgressState`

### Modified Files

3. **`libs/business/src/services/comfyui-pod-client.ts`**
   - Purpose: Enhance existing client with WebSocket support
   - Changes:
     - Add `ComfyUIWebSocketClient` dependency (optional)
     - Add `executeWorkflowWithWebSocket()` method
     - Enhance `executeWorkflow()` to try WebSocket first, fallback to polling
     - Add health check before WebSocket attempt
   - Backward compatibility: All existing methods unchanged

4. **`libs/business/src/services/comfyui-job-runner.ts`**
   - Purpose: Use WebSocket when available
   - Changes:
     - Use enhanced `ComfyUIPodClient.executeWorkflow()` (automatically uses WebSocket)
     - Optional: Pass progress callback if needed
   - Backward compatibility: No breaking changes

5. **`libs/business/src/services/image-generation.service.ts`** (if exists)
   - Purpose: Update `RunPodJobRunner` interface if needed
   - Changes: Add optional progress callback parameter

---

## Technical Specification

### Dependencies

**New Dependencies:**
- `ws` (Node.js WebSocket library) - `^8.16.0`
- No other new dependencies required

**Existing Dependencies:**
- `uuid` (for client ID generation) - already in use
- `@ryla/shared` (for types/utilities)

### Environment Variables

No new environment variables required. Uses existing ComfyUI pod URL configuration.

### Logic Flows

#### Flow 1: WebSocket Connection

```
1. ComfyUIPodClient.executeWorkflow(workflow)
   ↓
2. Check if WebSocket client available
   ↓
3. Try WebSocket connection
   ├─ Success → Use WebSocket
   └─ Failure → Fallback to REST polling
```

#### Flow 2: Progress Tracking

```
1. WebSocket receives progress_state message
   ↓
2. Parse node execution states
   ↓
3. Calculate progress: (totalValue / totalMax) * 100
   ↓
4. Throttle to max 1 update per second
   ↓
5. Call progress handler callback
```

#### Flow 3: Job Completion

```
1. WebSocket receives executed message (node 63 = VideoCombine)
   ↓
2. Parse output data
   ↓
3. Call completion handler
   ↓
4. Cleanup handlers and connection
```

#### Flow 4: Error Handling

```
1. WebSocket receives execution_error message
   ↓
2. Parse error details
   ↓
3. Call error handler
   ↓
4. Cleanup handlers
   ↓
5. Fallback to REST polling if needed
```

---

## Task Breakdown

### ST-001: WebSocket Client Implementation

**Story**: Implement `ComfyUIWebSocketClient` class with connection management

**Tasks**:
- **TSK-001**: Create `comfyui-websocket.interface.ts` with all TypeScript interfaces
- **TSK-002**: Implement `ComfyUIWebSocketClient.connect()` method
- **TSK-003**: Implement WebSocket message parsing (`handleMessage()`)
- **TSK-004**: Implement progress calculation from `progress_state` messages
- **TSK-005**: Implement event handler registration (`onProgress`, `onCompletion`, `onError`)
- **TSK-006**: Implement reconnection logic (3 attempts, 5-second delay)
- **TSK-007**: Add connection timeout handling (10 seconds)
- **TSK-008**: Add unit tests for WebSocket client

**Acceptance Criteria**:
- ✅ WebSocket connects to ComfyUI server successfully
- ✅ Client ID generated and used for connection
- ✅ Connection timeout handled gracefully
- ✅ Reconnection logic works (3 attempts, 5-second delay)
- ✅ Progress calculated correctly from node states
- ✅ Event handlers registered and called correctly

**Dependencies**: None (can start immediately)

---

### ST-002: Integration with ComfyUIPodClient

**Story**: Enhance `ComfyUIPodClient` to use WebSocket when available

**Tasks**:
- **TSK-009**: Add `ComfyUIWebSocketClient` as optional dependency to `ComfyUIPodClient`
- **TSK-010**: Implement `executeWorkflowWithWebSocket()` method
- **TSK-011**: Enhance `executeWorkflow()` to try WebSocket first, fallback to REST
- **TSK-012**: Add health check before WebSocket attempt
- **TSK-013**: Add logging for WebSocket vs REST usage
- **TSK-014**: Add integration tests for dual-mode execution

**Acceptance Criteria**:
- ✅ `executeWorkflowWithWebSocket()` uses WebSocket for execution
- ✅ `executeWorkflow()` tries WebSocket, falls back to REST
- ✅ Health check performed before WebSocket attempt
- ✅ Backward compatibility maintained (existing code still works)
- ✅ Logging shows which method is used

**Dependencies**: ST-001 (needs WebSocket client)

---

### ST-003: Progress Update Integration

**Story**: Integrate progress updates with job runner and services

**Tasks**:
- **TSK-015**: Update `ComfyUIJobRunner` to use enhanced `ComfyUIPodClient`
- **TSK-016**: Add optional progress callback parameter to job submission methods
- **TSK-017**: Update `StudioGenerationService` to handle progress updates (if needed)
- **TSK-018**: Add progress throttling (max 1 update per second)
- **TSK-019**: Add integration tests for progress tracking

**Acceptance Criteria**:
- ✅ `ComfyUIJobRunner` uses WebSocket when available
- ✅ Progress callbacks work correctly
- ✅ Progress updates throttled appropriately
- ✅ Works with existing image generation workflows

**Dependencies**: ST-002 (needs enhanced ComfyUIPodClient)

---

### ST-004: Error Handling and Fallback

**Story**: Implement graceful error handling and REST fallback

**Tasks**:
- **TSK-020**: Handle WebSocket connection errors gracefully
- **TSK-021**: Implement automatic fallback to REST polling on WebSocket failure
- **TSK-022**: Handle node errors from ComfyUI responses
- **TSK-023**: Add error logging and monitoring
- **TSK-024**: Add tests for error scenarios

**Acceptance Criteria**:
- ✅ WebSocket connection errors handled gracefully
- ✅ Automatic fallback to REST polling on failure
- ✅ Node errors detected and reported
- ✅ Execution errors trigger error handlers
- ✅ Error logging provides useful debugging info

**Dependencies**: ST-001, ST-002

---

## Tracking Plan (Analytics Events)

### WebSocket Connection Events

```typescript
// When WebSocket connects successfully
analytics.capture('comfyui_websocket_connected', {
  clientId: string;
  serverUrl: string;
  connectionTime: number;  // milliseconds
});

// When WebSocket disconnects
analytics.capture('comfyui_websocket_disconnected', {
  clientId: string;
  reason: string;
  duration: number;  // seconds
});

// When fallback to REST occurs
analytics.capture('comfyui_websocket_fallback', {
  promptId: string;
  reason: 'connection_failed' | 'timeout' | 'error';
  fallbackMethod: 'rest_polling';
});
```

### Progress Tracking Events

```typescript
// Progress update (throttled to max 1 per second)
analytics.capture('comfyui_progress_update', {
  promptId: string;
  progress: number;  // 0-100
  jobType: 'image_generation' | 'lora_training' | 'face_swap';
});
```

### Job Execution Events

```typescript
// Job completed via WebSocket
analytics.capture('comfyui_job_websocket_completed', {
  promptId: string;
  duration: number;  // seconds
  progressUpdates: number;  // count
  method: 'websocket';
});

// Job failed via WebSocket
analytics.capture('comfyui_job_websocket_failed', {
  promptId: string;
  error: string;
  method: 'websocket';
});
```

---

## Implementation Order

1. **ST-001**: WebSocket Client Implementation (foundation)
2. **ST-002**: Integration with ComfyUIPodClient (core functionality)
3. **ST-003**: Progress Update Integration (user-facing feature)
4. **ST-004**: Error Handling and Fallback (reliability)

**Estimated Timeline**: 1-2 weeks

---

## Testing Strategy

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

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| WebSocket connection failures | Medium | High | Automatic fallback to REST polling |
| ComfyUI WebSocket API changes | Low | Medium | Version pinning, monitor ComfyUI updates |
| Performance issues | Low | Medium | Connection pooling, throttling |
| Breaking existing code | Low | High | Extensive testing, backward compatibility |

---

**Created**: 2026-01-27  
**Last Updated**: 2026-01-27  
**Status**: P5 Complete - Ready for P6 (Implementation)
