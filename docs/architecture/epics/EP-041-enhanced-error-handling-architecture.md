# EP-041: Enhanced Error Handling and Retry Logic - Architecture (P3)

**Phase**: P3 - Architecture & API Design  
**Epic**: EP-041  
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
│  │         ComfyUIJobRunner                                  │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  submitBaseImage()                                │    │  │
│  │  │  → ComfyUIErrorHandler.shouldRetry()             │    │  │
│  │  │  → Retry with exponential backoff                │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         ComfyUIErrorHandlerService (new)                   │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  shouldRetry(error) → boolean                    │    │  │
│  │  │  getRetryDelay(attempt) → number                 │    │  │
│  │  │  checkHealth(serverUrl) → boolean                 │    │  │
│  │  │  categorizeError(error) → ErrorCategory           │    │  │
│  │  │  getFallbackStrategy(error) → FallbackStrategy   │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         ComfyUIPodClient (enhanced)                       │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  Retry logic on API calls                       │    │  │
│  │  │  Health checks before requests                   │    │  │
│  │  │  Error categorization                            │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Model

### Error Categories

```typescript
enum ErrorCategory {
  TRANSIENT = 'transient',      // Network, timeout, 5xx - should retry
  PERMANENT = 'permanent',      // 4xx, validation - don't retry
  RECOVERABLE = 'recoverable',  // Node timeout - can retry
  FATAL = 'fatal',              // Workflow validation - don't retry
}
```

### Retry State

```typescript
interface RetryState {
  attempt: number;
  maxAttempts: number;
  lastError: Error;
  nextRetryAt: number;  // timestamp
}
```

### Fallback Strategy

```typescript
interface FallbackStrategy {
  method: 'websocket_to_rest' | 'primary_to_secondary' | 'optimized_to_simple';
  reason: string;
}
```

---

## 3. API Contracts

### ComfyUIErrorHandlerService API

```typescript
class ComfyUIErrorHandlerService {
  /**
   * Determine if error should be retried
   */
  shouldRetry(error: Error): boolean;

  /**
   * Get retry delay for attempt number (exponential backoff)
   */
  getRetryDelay(attempt: number): number;

  /**
   * Check ComfyUI server health
   */
  async checkHealth(serverUrl: string): Promise<boolean>;

  /**
   * Categorize error type
   */
  categorizeError(error: Error): ErrorCategory;

  /**
   * Get fallback strategy for error
   */
  getFallbackStrategy(error: Error): FallbackStrategy | null;
}
```

---

## 4. Component Architecture

```
libs/business/src/services/
├── comfyui-error-handler.service.ts (NEW)
│   ├── ComfyUIErrorHandlerService class
│   ├── Retry logic
│   ├── Health checks
│   └── Error categorization
│
└── comfyui-pod-client.ts (MODIFY)
    ├── Retry logic on API calls
    ├── Health checks before requests
    └── Error categorization
```

---

## 5. Event Schema (PostHog Analytics)

```typescript
// Retry attempted
{
  event: 'comfyui_retry_attempted',
  properties: {
    promptId: string;
    attempt: number;
    errorType: string;
  }
}

// Retry succeeded
{
  event: 'comfyui_retry_succeeded',
  properties: {
    promptId: string;
    attempt: number;
    totalRetries: number;
  }
}
```

---

**Created**: 2026-01-27  
**Last Updated**: 2026-01-27
