# [EPIC] EP-082: Error Boundary Implementation

**Status**: In Review
**Phase**: P7
**Priority**: P1
**Created**: 2026-02-04
**Last Updated**: 2026-02-04

> **Initiative**: [IN-033: Phoenix/BEAM Patterns Adoption](../../../initiatives/IN-033-phoenix-patterns-adoption.md)
> **Phase**: 3 of 5

## Overview

Implement "let it crash" style error boundaries around AI provider calls (Modal, Replicate, Fal). Errors are caught, logged, and returned as clean `Result<T>` types. Extend existing `ComfyUIErrorHandlerService` patterns to cover all AI providers.

---

## Business Impact

**Target Metric**: C - Core Value, B - Retention, E - CAC

**Hypothesis**: When AI provider errors are contained with structured retry and clean failure states, users experience fewer cryptic errors, operations recover automatically, and debugging is faster.

**Success Criteria**:
- Error containment: **100%** - no unhandled exceptions from AI calls
- Auto-recovery: **>90%** - transient errors recovered with retry
- Error clarity: **100%** - user-friendly error messages
- Debug time: **-50%** - faster issue diagnosis

---

## Features

### F1: Result<T, E> Type

- **Type Definition**:
  - `Success<T>`: `{ success: true, data: T }`
  - `Failure<E>`: `{ success: false, error: E }`
  - `Result<T, E> = Success<T> | Failure<E>`
  - Type guards: `isSuccess(result)`, `isFailure(result)`

- **Error Types**:
  - `TransientError`: Network, timeout, rate limit (retryable)
  - `PermanentError`: Invalid input, auth failure (not retryable)
  - `ProviderError`: AI provider internal error (may be retryable)
  - `UnknownError`: Unexpected error (log and fail)

### F2: AIProviderBoundary

- **Boundary Class**:
  - Wraps AI provider calls with error handling
  - Catches all errors and categorizes them
  - Returns `Result<T>` instead of throwing
  - Logs errors with structured context

- **Error Categorization**:
  - HTTP 429 → `TransientError` (rate limit)
  - HTTP 5xx → `ProviderError` (server error)
  - HTTP 4xx → `PermanentError` (client error)
  - Network error → `TransientError` (retry)
  - Timeout → `TransientError` (retry with longer timeout)

### F3: Retry Logic

- **Retry Configuration**:
  - Max retries: 3 (configurable per provider)
  - Backoff: Exponential (1s, 2s, 4s)
  - Jitter: Random 0-500ms to prevent thundering herd
  - Timeout increase: 1.5x per retry

- **Retry Decisions**:
  - `TransientError` → retry with backoff
  - `ProviderError` → retry once, then fail
  - `PermanentError` → fail immediately
  - Max retries reached → return failure result

### F4: Provider-Specific Handlers

- **ModalBoundary**:
  - Handles Modal-specific error codes
  - Parses Modal error responses
  - Tracks cost on failure (for billing)

- **ReplicateBoundary**:
  - Handles Replicate API errors
  - Manages prediction lifecycle
  - Timeout for long-running predictions

- **FalBoundary**:
  - Handles Fal.ai errors
  - Manages queue-based operations
  - Webhook failure handling

### F5: Structured Logging

- **Error Context**:
  - Provider name, endpoint, method
  - Request ID, user ID, job ID
  - Error type, message, stack
  - Retry count, total duration

- **Log Format**:
  - Structured JSON for log aggregation
  - Correlation IDs for tracing
  - Sensitive data redacted

---

## Acceptance Criteria

### AC1: Result Type
- [ ] `Result<T, E>` type defined in shared library
- [ ] Type guards `isSuccess()` and `isFailure()` implemented
- [ ] Error types defined (Transient, Permanent, Provider, Unknown)
- [ ] All AI provider calls return `Result<T>`

### AC2: AIProviderBoundary
- [ ] `AIProviderBoundary` class implemented
- [ ] All errors caught and categorized
- [ ] No unhandled exceptions from AI calls
- [ ] Errors logged with structured context

### AC3: Retry Logic
- [ ] Retry configuration per provider
- [ ] Exponential backoff with jitter
- [ ] Timeout increase per retry
- [ ] Max retries enforced

### AC4: Provider Integration
- [ ] Modal calls wrapped with boundary
- [ ] Replicate calls wrapped with boundary
- [ ] Fal calls wrapped with boundary
- [ ] Existing ComfyUI error handler integrated

### AC5: Error Messages
- [ ] User-friendly error messages for all failure types
- [ ] Technical details logged but not shown to user
- [ ] Actionable guidance (e.g., "Try again" button)
- [ ] Error codes for support reference

---

## Technical Requirements

### Dependencies

**Existing**:
- `libs/business/src/services/comfyui-error-handler.service.ts` - Reference implementation

**New**:
- None (pure TypeScript implementation)

### Files to Create

```
libs/shared/src/types/result.ts                      # Result<T, E> type
libs/shared/src/types/errors.ts                      # Error type definitions
libs/business/src/boundaries/ai-provider-boundary.ts # Base boundary class
libs/business/src/boundaries/modal-boundary.ts       # Modal-specific boundary
libs/business/src/boundaries/replicate-boundary.ts   # Replicate-specific boundary
libs/business/src/boundaries/fal-boundary.ts         # Fal-specific boundary
libs/business/src/boundaries/index.ts                # Barrel export
```

### Files to Modify

```
libs/business/src/services/modal-client.ts           # Wrap with boundary
libs/business/src/services/replicate-client.ts       # Wrap with boundary
libs/business/src/services/fal-client.ts             # Wrap with boundary
apps/api/src/modules/image/services/*.ts             # Handle Result types
```

### Architecture

```
Service Layer
  │
  └── AIProviderBoundary.run(operation)
        │
        ├── try { operation() }
        │     └── Success → Result.success(data)
        │
        └── catch (error)
              │
              ├── categorize(error)
              ├── shouldRetry(error) → retry with backoff
              └── Failure → Result.failure(error)
```

---

## Non-Goals

- ❌ Circuit breaker pattern (see EP-081 for supervision)
- ❌ Fallback providers (future enhancement)
- ❌ Error analytics dashboard (future enhancement)
- ❌ Custom error pages (frontend concern)

---

## Related Work

### Dependencies
- **EP-081**: Job Supervision Patterns - Supervision uses boundaries for job execution

### Blocks
- **EP-084**: Structured Telemetry - Boundaries emit telemetry events

### Related Initiatives
- **IN-033**: Phoenix/BEAM Patterns Adoption (this is Phase 3)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Error containment | 100% | No unhandled AI call exceptions |
| Auto-recovery | >90% | Transient errors recovered |
| Error clarity | 100% | User-friendly messages |
| Debug time | -50% | Time to diagnose issues |
| Retry success | >70% | Retried operations succeed |

---

## Stories

### ST-082-01: Result Type
Define `Result<T, E>` type and error types.

### ST-082-02: AIProviderBoundary
Implement base boundary class with retry logic.

### ST-082-03: Modal Integration
Wrap Modal client with boundary.

### ST-082-04: Replicate Integration
Wrap Replicate client with boundary.

### ST-082-05: Service Updates
Update generation services to handle Result types.

---

**Created**: 2026-02-04
**Last Updated**: 2026-02-04
