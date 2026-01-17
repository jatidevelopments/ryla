# [EPIC] EP-041: Enhanced Error Handling and Retry Logic

> **Initiative**: [IN-007: ComfyUI Infrastructure Improvements (MDC-Inspired)](../../../initiatives/IN-007-comfyui-infrastructure-improvements.md)  
> **Status**: Proposed

## Overview

Implement enhanced error handling and automatic retry logic for ComfyUI workflows, including exponential backoff, health checks, node error detection, and graceful degradation. Improves reliability and reduces manual intervention for transient failures.

> **Inspiration**: Based on MDC's error handling patterns with retry logic and health checks

---

## Business Impact

**Target Metric**: C - Core Value, B - Retention

**Hypothesis**: When transient errors are automatically retried with intelligent backoff and health checks, job success rates increase and users experience fewer failures, leading to improved satisfaction and retention.

**Success Criteria**:
- Error recovery rate: **>90%** of transient errors auto-recovered
- Job success rate: **>98%** (up from current baseline)
- Manual intervention: **<5%** of jobs require manual intervention
- User-reported errors: **-50%** reduction in error-related support tickets

---

## Features

### F1: Automatic Retry Logic

- **Retry Strategy**:
  - Exponential backoff: 1s, 2s, 4s, 8s, 16s
  - Max retries: 3 attempts (configurable)
  - Retry only on transient errors (network, timeout, 5xx)
  - Don't retry on permanent errors (4xx, validation errors)

- **Retry Conditions**:
  - Network errors (connection timeout, DNS failure)
  - HTTP 5xx errors (server errors)
  - HTTP 503 (service unavailable)
  - Timeout errors
  - WebSocket connection failures

- **Retry Implementation**:
  - Retry at job submission level
  - Retry at workflow execution level
  - Retry at individual API call level
  - Log all retry attempts

### F2: Health Checks

- **Pre-Retry Health Check**:
  - Check ComfyUI server health before retry
  - Verify WebSocket connection (if EP-039 implemented)
  - Check server response time
  - Skip retry if server is down

- **Health Check Endpoints**:
  - `GET /health` - Basic health check
  - `GET /system_stats` - System resource check
  - WebSocket ping/pong (if WebSocket available)
  - Response time threshold: <2 seconds

- **Health Check Integration**:
  - Health check before job submission
  - Health check before retry attempts
  - Health check on service initialization
  - Cache health status (TTL: 30 seconds)

### F3: Node Error Detection

- **Node Error Detection**:
  - Parse `node_errors` from ComfyUI response
  - Identify specific node failures
  - Categorize errors (missing model, missing node, validation error)
  - Provide detailed error messages

- **Error Categorization**:
  - **Transient**: Missing model (can retry after model load)
  - **Permanent**: Invalid workflow, missing node
  - **Recoverable**: Node timeout (can retry)
  - **Fatal**: Workflow validation error (don't retry)

- **Error Reporting**:
  - Detailed error messages to users
  - Error logging for debugging
  - Error metrics for monitoring
  - Alert on frequent errors

### F4: Graceful Degradation

- **Fallback Strategies**:
  - WebSocket → REST polling (if WebSocket fails)
  - Primary model → Secondary model (if primary fails)
  - Optimized workflow → Simple workflow (if optimized fails)
  - Current pod → Backup pod (if available)

- **Degradation Logic**:
  - Try primary method first
  - Fallback to secondary method on failure
  - Log degradation events
  - Monitor degradation frequency

- **User Communication**:
  - Inform users of fallback (if visible)
  - Don't expose technical details
  - Maintain same user experience
  - Log for internal monitoring

### F5: Error Monitoring and Alerting

- **Error Tracking**:
  - Track error types and frequencies
  - Track retry success rates
  - Track error recovery times
  - Track degradation events

- **Alerting**:
  - Alert on error rate spikes (>10% failure rate)
  - Alert on retry exhaustion (all retries failed)
  - Alert on health check failures
  - Alert on node error patterns

- **Metrics**:
  - Error rate by type
  - Retry success rate
  - Average retry attempts
  - Health check success rate

---

## Acceptance Criteria

### AC1: Retry Logic
- ✅ Exponential backoff implemented correctly
- ✅ Max retries configurable (default: 3)
- ✅ Retry only on transient errors
- ✅ Don't retry on permanent errors

### AC2: Health Checks
- ✅ Health check before retry attempts
- ✅ Health check before job submission
- ✅ Health check response time <2 seconds
- ✅ Health status cached (TTL: 30 seconds)

### AC3: Node Error Detection
- ✅ Node errors parsed from ComfyUI response
- ✅ Errors categorized correctly (transient vs permanent)
- ✅ Detailed error messages provided
- ✅ Error reporting integrated

### AC4: Graceful Degradation
- ✅ Fallback to REST polling if WebSocket fails
- ✅ Fallback to secondary model if primary fails
- ✅ Fallback workflows available
- ✅ Degradation logged and monitored

### AC5: Error Monitoring
- ✅ Error types tracked and logged
- ✅ Retry success rates tracked
- ✅ Alerts configured for error spikes
- ✅ Metrics available for monitoring

### AC6: Integration
- ✅ Integrated with `ComfyUIJobRunner`
- ✅ Integrated with `ComfyUIPodClient`
- ✅ Works with WebSocket (EP-039)
- ✅ Works with Redis persistence (EP-040)

---

## Technical Requirements

### Dependencies
- **Existing Code**: `libs/business/src/services/comfyui-pod-client.ts`
- **Existing Code**: `libs/business/src/services/comfyui-job-runner.ts`
- **EP-039**: WebSocket client (optional - for WebSocket health checks)
- **EP-040**: Redis persistence (optional - for retry state)

### Files to Create/Modify
- **New**: `libs/business/src/services/comfyui-error-handler.service.ts`
- **Modify**: `libs/business/src/services/comfyui-pod-client.ts`
- **Modify**: `libs/business/src/services/comfyui-job-runner.ts`
- **New**: `libs/business/src/interfaces/comfyui-error.interface.ts`

### Architecture
```
ComfyUIErrorHandlerService (new)
  ├── shouldRetry(error) → boolean
  ├── getRetryDelay(attempt) → number
  ├── checkHealth(serverUrl) → boolean
  ├── categorizeError(error) → ErrorCategory
  └── getFallbackStrategy(error) → FallbackStrategy

ComfyUIPodClient (enhance)
  ├── Retry logic on API calls
  ├── Health checks before requests
  └── Error categorization

ComfyUIJobRunner (enhance)
  ├── Retry logic on job submission
  └── Graceful degradation
```

---

## Non-Goals

- ❌ WebSocket implementation (separate epic: EP-039)
- ❌ Redis persistence (separate epic: EP-040)
- ❌ Circuit breaker pattern (future enhancement)
- ❌ Rate limiting (future enhancement)
- ❌ Job queuing system (future enhancement)

---

## Related Work

### Dependencies
- **EP-039**: WebSocket Real-time Progress (optional - for WebSocket health checks)
- **EP-040**: Redis Job Persistence (optional - for retry state)

### Blocks
- None (can be implemented independently)

### Related Epics
- **EP-039**: WebSocket-based Real-time Progress Tracking
- **EP-040**: Redis Job Persistence and Recovery

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Error recovery rate | >90% | Track retry success rate |
| Job success rate | >98% | Compare to baseline |
| Manual intervention | <5% | Track manual fixes |
| Error tickets | -50% | Compare support tickets |
| Average retry attempts | <2 | Track retry frequency |

---

**Created**: 2026-01-27  
**Last Updated**: 2026-01-27
