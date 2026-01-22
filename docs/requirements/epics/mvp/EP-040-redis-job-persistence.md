# [EPIC] EP-040: Redis Job Persistence and Recovery

**Status**: Completed
**Phase**: P3
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


> **Initiative**: [IN-007: ComfyUI Infrastructure Improvements (MDC-Inspired)](../../../initiatives/IN-007-comfyui-infrastructure-improvements.md)  
> **Status**: Proposed

## Overview

Implement Redis-based job persistence for ComfyUI workflows, enabling job recovery after server restarts. Critical for long-running operations like LoRA training (1-1.5 hours) where server restarts would otherwise lose job progress.

> **Inspiration**: Based on MDC's Redis persistence pattern with TTL and recovery logic

---

## Business Impact

**Target Metric**: C - Core Value, B - Retention

**Hypothesis**: When jobs are persisted and recoverable after server restarts, users don't lose progress on long-running operations (LoRA training), significantly improving reliability and user trust.

**Success Criteria**:
- Job recovery success rate: **>95%** of jobs recovered after server restart
- Zero data loss: **0%** of active jobs lost on restart
- Recovery time: **<30 seconds** to recover all active jobs
- User trust: **>90%** of users confident jobs won't be lost (survey)

---

## Features

### F1: Redis Job State Storage

- **Job State Schema**:
  ```typescript
  interface JobState {
    promptId: string;
    type: 'image_generation' | 'lora_training' | 'face_swap';
    userId: string;
    characterId?: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number; // 0-100
    startedAt: number; // timestamp
    clientId?: string; // WebSocket client ID
    serverUrl: string; // ComfyUI server URL
  }
  ```

- **Redis Storage**:
  - Key format: `comfyui:job:${promptId}`
  - TTL: 7200 seconds (2 hours) for long-running jobs
  - JSON serialization for complex data
  - Atomic operations for updates

- **Storage Operations**:
  - Save job state on job start
  - Update job state on progress/status change
  - Delete job state on completion/failure
  - Batch operations for efficiency

### F2: Job Recovery on Server Restart

- **Recovery Process**:
  - On server startup, scan Redis for active jobs
  - Filter jobs by age (skip jobs older than 10 minutes)
  - Reconnect WebSocket connections (if EP-039 implemented)
  - Resume progress tracking for each job
  - Update job status in database

- **Recovery Logic**:
  - Check job age (skip if too old)
  - Verify ComfyUI server is still available
  - Reconnect WebSocket or start polling
  - Resume progress tracking
  - Handle edge cases (job completed during restart)

- **Recovery Monitoring**:
  - Log recovery attempts and results
  - Track recovery success rate
  - Alert on recovery failures
  - Metrics for recovery performance

### F3: Job State Management

- **State Updates**:
  - Update Redis on every progress change
  - Update Redis on status changes
  - Atomic updates to prevent race conditions
  - Batch updates for efficiency

- **State Cleanup**:
  - Delete job state on completion
  - Delete job state on failure
  - TTL-based cleanup for stale jobs
  - Manual cleanup for orphaned jobs

- **State Queries**:
  - Get job state by promptId
  - List all active jobs for a user
  - List all active jobs (admin)
  - Query jobs by type/status

### F4: Integration with Existing Services

- **ComfyUIJobRunner Integration**:
  - Save job state on job submission
  - Update job state on progress
  - Update job state on completion/failure
  - Recover jobs on service initialization

- **Database Integration**:
  - Sync job state with database records
  - Update database on recovery
  - Maintain consistency between Redis and DB
  - Handle conflicts (Redis vs DB state)

---

## Acceptance Criteria

### AC1: Redis Storage
- ✅ Job state saved to Redis on job start
- ✅ Job state updated on progress/status changes
- ✅ Job state deleted on completion/failure
- ✅ TTL set correctly (2 hours for long jobs)

### AC2: Job Recovery
- ✅ Active jobs recovered on server restart
- ✅ Old jobs (>10 minutes) skipped during recovery
- ✅ WebSocket reconnected for recovered jobs (if EP-039 done)
- ✅ Progress tracking resumed for recovered jobs

### AC3: State Management
- ✅ Job state updates are atomic
- ✅ No race conditions in state updates
- ✅ Stale jobs cleaned up automatically
- ✅ Orphaned jobs can be manually cleaned

### AC4: Integration
- ✅ Integrated with `ComfyUIJobRunner`
- ✅ Integrated with database records
- ✅ No breaking changes to existing code
- ✅ Works with WebSocket progress (EP-039)

### AC5: Error Handling
- ✅ Redis connection errors handled gracefully
- ✅ Recovery failures logged and alerted
- ✅ Fallback behavior if Redis unavailable
- ✅ Data consistency maintained

### AC6: Performance
- ✅ Recovery completes in <30 seconds
- ✅ Redis operations don't block main thread
- ✅ Batch operations for efficiency
- ✅ Minimal performance impact on job execution

---

## Technical Requirements

### Dependencies
- **Redis**: Must be available and configured
- **Redis Client**: `ioredis` or similar (Node.js)
- **Existing Code**: `libs/business/src/services/comfyui-job-runner.ts`
- **EP-039**: WebSocket client (optional but recommended)

### Files to Create/Modify
- **New**: `libs/business/src/services/comfyui-job-persistence.service.ts`
- **Modify**: `libs/business/src/services/comfyui-job-runner.ts`
- **New**: `libs/business/src/interfaces/comfyui-job-state.interface.ts`
- **Modify**: Database schema (if needed for job tracking)

### Architecture
```
ComfyUIJobPersistenceService (new)
  ├── saveJobState(jobState)
  ├── updateJobState(promptId, updates)
  ├── getJobState(promptId)
  ├── deleteJobState(promptId)
  ├── recoverActiveJobs()
  └── cleanupStaleJobs()

ComfyUIJobRunner (integrate)
  ├── Save state on job start
  ├── Update state on progress
  └── Recover jobs on initialization
```

---

## Non-Goals

- ❌ WebSocket implementation (separate epic: EP-039)
- ❌ Enhanced error retry logic (separate epic: EP-041)
- ❌ Job queuing system (future enhancement)
- ❌ Distributed job execution (future enhancement)
- ❌ Job scheduling (future enhancement)

---

## Related Work

### Dependencies
- **EP-026**: LoRA Training (critical - needs job recovery for 1-1.5 hour jobs)
- **EP-039**: WebSocket Real-time Progress (recommended - improves recovery)

### Blocks
- **EP-041**: Enhanced Error Handling (can use persisted state for retries)

### Related Epics
- **EP-039**: WebSocket-based Real-time Progress Tracking
- **EP-041**: Enhanced Error Handling and Retry Logic

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Job recovery success | >95% | Test server restart scenarios |
| Zero data loss | 0% | Track lost jobs on restart |
| Recovery time | <30 seconds | Measure recovery duration |
| Redis availability | >99.9% | Monitor Redis uptime |
| User trust | >90% | Survey users on reliability |

---

**Created**: 2026-01-27  
**Last Updated**: 2026-01-27
