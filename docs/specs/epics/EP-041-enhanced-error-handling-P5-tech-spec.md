# EP-041 (P5) — Enhanced Error Handling: File Plan + Tasks

Working in **PHASE P5 (File plan + tasks)** on **EP-041**.

## Scope (MVP)

- **Automatic retry logic** with exponential backoff
- **Health checks** before retry attempts
- **Error categorization** (transient vs permanent)
- **Graceful degradation** (fallback strategies)

Explicitly out of MVP:
- WebSocket implementation (EP-039)
- Redis persistence (EP-040)
- Circuit breaker pattern (future)
- Rate limiting (future)

---

## Current Reality (Starting Point)

- Basic error handling in ComfyUIPodClient
- No automatic retry for transient errors
- No health checks before requests
- Limited error categorization

---

## File Plan

### New Files

1. **`libs/business/src/services/comfyui-error-handler.service.ts`**
   - Purpose: Error handling and retry logic
   - Exports: `ComfyUIErrorHandlerService` class
   - Responsibilities:
     - Determine if error should be retried
     - Calculate retry delay (exponential backoff)
     - Check server health
     - Categorize errors
     - Get fallback strategies

2. **`libs/business/src/interfaces/comfyui-error.interface.ts`**
   - Purpose: TypeScript interfaces for error handling
   - Exports:
     - `ErrorCategory` enum
     - `RetryState` interface
     - `FallbackStrategy` interface

### Modified Files

3. **`libs/business/src/services/comfyui-pod-client.ts`**
   - Purpose: Add retry logic and health checks
   - Changes:
     - Retry logic on API calls
     - Health checks before requests
     - Error categorization

4. **`libs/business/src/services/comfyui-job-runner.ts`**
   - Purpose: Use error handler for retries
   - Changes:
     - Retry logic on job submission
     - Graceful degradation

---

## Technical Specification

### Dependencies

**No new dependencies required** - uses existing fetch API and error handling

### Environment Variables

- `COMFYUI_MAX_RETRIES` (optional, default: 3)
- `COMFYUI_RETRY_BACKOFF_BASE` (optional, default: 1000ms)

### Logic Flows

#### Flow 1: Retry Logic

```
1. API call fails
   ↓
2. ComfyUIErrorHandler.shouldRetry(error)
   ↓
3. If yes → Calculate retry delay
   ↓
4. Health check before retry
   ↓
5. Retry with exponential backoff
   ↓
6. Max retries reached → Fail
```

#### Flow 2: Error Categorization

```
1. Error occurs
   ↓
2. ComfyUIErrorHandler.categorizeError(error)
   ↓
3. Determine category (transient/permanent/recoverable/fatal)
   ↓
4. Apply appropriate strategy
```

---

## Task Breakdown

### ST-001: Error Handler Service

**Story**: Implement error handler service with retry logic

**Tasks**:
- **TSK-001**: Create `comfyui-error.interface.ts` with error types
- **TSK-002**: Create `ComfyUIErrorHandlerService` class
- **TSK-003**: Implement `shouldRetry()` method
- **TSK-004**: Implement `getRetryDelay()` (exponential backoff)
- **TSK-005**: Implement `categorizeError()` method
- **TSK-006**: Implement `checkHealth()` method
- **TSK-007**: Implement `getFallbackStrategy()` method
- **TSK-008**: Add unit tests

**Acceptance Criteria**:
- ✅ Exponential backoff implemented correctly
- ✅ Max retries configurable (default: 3)
- ✅ Retry only on transient errors
- ✅ Errors categorized correctly

**Dependencies**: None

---

### ST-002: Integration with ComfyUIPodClient

**Story**: Add retry logic to API calls

**Tasks**:
- **TSK-009**: Add ComfyUIErrorHandlerService to ComfyUIPodClient
- **TSK-010**: Add retry logic to `queueWorkflow()`
- **TSK-011**: Add retry logic to `getJobStatus()`
- **TSK-012**: Add health check before retry
- **TSK-013**: Add error categorization
- **TSK-014**: Add integration tests

**Acceptance Criteria**:
- ✅ Retry logic on API calls
- ✅ Health checks before retries
- ✅ Error categorization working
- ✅ Backward compatibility maintained

**Dependencies**: ST-001

---

### ST-003: Graceful Degradation

**Story**: Implement fallback strategies

**Tasks**:
- **TSK-015**: Implement WebSocket → REST fallback
- **TSK-016**: Implement primary → secondary model fallback
- **TSK-017**: Implement optimized → simple workflow fallback
- **TSK-018**: Add degradation logging
- **TSK-019**: Add tests for fallback scenarios

**Acceptance Criteria**:
- ✅ Fallback to REST polling if WebSocket fails
- ✅ Fallback to secondary model if primary fails
- ✅ Fallback workflows available
- ✅ Degradation logged and monitored

**Dependencies**: ST-001, ST-002

---

## Tracking Plan (Analytics Events)

```typescript
// Retry attempted
analytics.capture('comfyui_retry_attempted', {
  promptId: string;
  attempt: number;
  errorType: string;
});

// Retry succeeded
analytics.capture('comfyui_retry_succeeded', {
  promptId: string;
  attempt: number;
  totalRetries: number;
});
```

---

**Created**: 2026-01-27  
**Last Updated**: 2026-01-27
