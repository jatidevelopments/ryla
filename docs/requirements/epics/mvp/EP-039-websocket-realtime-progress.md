# [EPIC] EP-039: WebSocket-based Real-time Progress Tracking

**Status**: Completed
**Phase**: P6
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


> **Initiative**: [IN-007: ComfyUI Infrastructure Improvements (MDC-Inspired)](../../../initiatives/IN-007-comfyui-infrastructure-improvements.md)  
> **Status**: Proposed

## Overview

Implement WebSocket-based real-time progress tracking for ComfyUI workflows, replacing REST API polling with efficient WebSocket connections. Provides percentage progress updates (0-100%) calculated from node execution states, significantly improving user experience for long-running operations like LoRA training.

> **Inspiration**: Based on MDC's proven `ComfyUIWebSocketService` implementation

---

## Business Impact

**Target Metric**: C - Core Value, B - Retention, E - CAC

**Hypothesis**: When users see real-time progress updates instead of binary status, they experience less anxiety during long operations (1-1.5 hour LoRA training) and have better understanding of job status, leading to improved satisfaction and retention.

**Success Criteria**:
- WebSocket adoption rate: **>80%** of jobs use WebSocket (vs polling fallback)
- Progress visibility: **100%** of long-running jobs show percentage progress
- Server load reduction: **<50%** of previous polling requests
- User satisfaction: **>85%** of users prefer progress visibility (survey)

---

## Features

### F1: WebSocket Client Implementation

- **WebSocket Connection**:
  - Connect to ComfyUI WebSocket endpoint (`ws://baseUrl/ws?clientId=uuid`)
  - Generate unique client ID per connection
  - Handle connection lifecycle (connect, disconnect, reconnect)
  - Connection timeout: 10 seconds
  - Max reconnection attempts: 3 with 5-second delay

- **Message Handling**:
  - Listen for `progress_state` events (node execution progress)
  - Listen for `executed` events (node completion)
  - Listen for `execution_error` events (workflow errors)
  - Listen for `status` events (connection status, queue info)
  - Parse and validate message format

- **Progress Calculation**:
  - Calculate percentage from node execution states
  - Total max: Sum of all node max values
  - Current value: Sum of all node current values
  - Progress = (current / max) * 100
  - Round to nearest integer (0-100%)

### F2: Integration with Existing ComfyUI Client

- **Backward Compatibility**:
  - Existing REST polling continues to work
  - WebSocket as primary, REST as fallback
  - Automatic fallback if WebSocket fails
  - No breaking changes to existing code

- **Dual-Mode Execution**:
  - Try WebSocket first
  - Fallback to REST polling if WebSocket unavailable
  - Health check before attempting WebSocket
  - Log which method is used for monitoring

- **API Integration**:
  - Extend `ComfyUIPodClient` with WebSocket support
  - New method: `executeWorkflowWithWebSocket(workflow)`
  - Existing method: `executeWorkflow(workflow)` - uses WebSocket if available
  - Progress callbacks for real-time updates

### F3: Progress Event Handlers

- **Progress Handler**:
  - Callback: `onProgress(promptId, progress: number)`
  - Emits progress updates (0-100%) in real-time
  - Throttle updates (max 1 per second) to avoid spam
  - Store latest progress for recovery

- **Completion Handler**:
  - Callback: `onCompletion(promptId, result: ComfyUIJobResult)`
  - Triggered when workflow completes successfully
  - Returns job result with images/outputs
  - Cleanup WebSocket handlers

- **Error Handler**:
  - Callback: `onError(promptId, error: string)`
  - Triggered on execution errors or node errors
  - Provides detailed error messages
  - Cleanup WebSocket handlers

### F4: Progress Updates to Frontend

- **Real-time Progress API**:
  - WebSocket or Server-Sent Events (SSE) for frontend
  - Progress updates pushed to connected clients
  - Support multiple clients per job (user + admin)
  - Progress format: `{ promptId, progress: 0-100, status }`

- **UI Integration**:
  - Progress bar component (0-100%)
  - Status text: "Processing... 45%"
  - Estimated time remaining (if calculable)
  - Visual feedback for long-running jobs

---

## Acceptance Criteria

### AC1: WebSocket Connection
- ✅ WebSocket client connects to ComfyUI server successfully
- ✅ Client ID generated and used for connection
- ✅ Connection timeout handled gracefully (10 seconds)
- ✅ Reconnection logic works (3 attempts, 5-second delay)

### AC2: Progress Tracking
- ✅ Progress calculated from `progress_state` messages
- ✅ Percentage progress (0-100%) calculated correctly
- ✅ Progress updates emitted in real-time
- ✅ Progress throttled to max 1 update per second

### AC3: Event Handling
- ✅ `progress_state` events processed correctly
- ✅ `executed` events trigger completion handler
- ✅ `execution_error` events trigger error handler
- ✅ `status` events logged for monitoring

### AC4: Backward Compatibility
- ✅ Existing REST polling still works
- ✅ Automatic fallback to REST if WebSocket fails
- ✅ No breaking changes to `ComfyUIPodClient` API
- ✅ Health check before WebSocket attempt

### AC5: Integration
- ✅ WebSocket integrated with `ComfyUIPodClient`
- ✅ `ComfyUIJobRunner` uses WebSocket when available
- ✅ Progress updates available to frontend
- ✅ Works with existing image generation workflows

### AC6: Error Handling
- ✅ WebSocket connection errors handled gracefully
- ✅ Fallback to REST polling on WebSocket failure
- ✅ Node errors detected and reported
- ✅ Execution errors trigger error handlers

---

## Technical Requirements

### Dependencies
- **WebSocket Library**: `ws` (Node.js) or native WebSocket support
- **ComfyUI Version**: Must support WebSocket API (standard ComfyUI feature)
- **Existing Code**: `libs/business/src/services/comfyui-pod-client.ts`

### Files to Create/Modify
- **New**: `libs/business/src/services/comfyui-websocket-client.ts`
- **Modify**: `libs/business/src/services/comfyui-pod-client.ts`
- **Modify**: `libs/business/src/services/comfyui-job-runner.ts`
- **New**: `libs/business/src/interfaces/comfyui-websocket.interface.ts`

### Architecture
```
ComfyUIWebSocketClient (new)
  ├── connect(baseUrl) → clientId
  ├── onProgress(promptId, handler)
  ├── onCompletion(promptId, handler)
  └── onError(promptId, handler)

ComfyUIPodClient (extend)
  ├── executeWorkflowWithWebSocket() [new]
  └── executeWorkflow() [enhanced - uses WebSocket if available]

ComfyUIJobRunner (integrate)
  └── Uses WebSocket client for progress tracking
```

---

## Non-Goals

- ❌ Redis persistence (separate epic: EP-040)
- ❌ Enhanced error retry logic (separate epic: EP-041)
- ❌ Job recovery on server restart (EP-040)
- ❌ Progress persistence across restarts (EP-040)
- ❌ Multiple WebSocket connections per job (future enhancement)

---

## Related Work

### Dependencies
- **EP-026**: LoRA Training (needs progress tracking for 1-1.5 hour jobs)
- **EP-005**: Content Studio (can use progress updates for image generation)

### Blocks
- **EP-040**: Redis Job Persistence (can use WebSocket progress for recovery)

### Related Epics
- **EP-040**: Redis Job Persistence and Recovery
- **EP-041**: Enhanced Error Handling and Retry Logic

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| WebSocket adoption | >80% | Track WebSocket vs polling usage |
| Progress visibility | 100% | All long-running jobs show progress |
| Server load reduction | <50% | Compare API request counts |
| Connection success rate | >95% | WebSocket connection success rate |
| User satisfaction | >85% | Survey users on progress visibility |

---

**Created**: 2026-01-27  
**Last Updated**: 2026-01-27
