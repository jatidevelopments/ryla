# EP-040 (P5) — Redis Job Persistence: File Plan + Tasks

Working in **PHASE P5 (File plan + tasks)** on **EP-040**.

## Scope (MVP)

- **Redis job state storage** for active ComfyUI workflows
- **Job recovery** on server restart
- **State management** (save, update, delete, query)
- **Integration** with ComfyUIJobRunner

Explicitly out of MVP:
- WebSocket implementation (EP-039)
- Enhanced error retry logic (EP-041)
- Job queuing system (future)
- Distributed job execution (future)

---

## Current Reality (Starting Point)

- No persistence layer for active jobs
- Server restart = lost job tracking
- Jobs tracked only in-memory (`ComfyUIJobRunner.pendingJobs`)
- No recovery mechanism

---

## File Plan

### New Files

1. **`libs/business/src/services/comfyui-job-persistence.service.ts`**
   - Purpose: Redis operations for job state
   - Exports: `ComfyUIJobPersistenceService` class
   - Responsibilities:
     - Save/update/delete job state in Redis
     - Recover active jobs on startup
     - Cleanup stale jobs
     - Query job state

2. **`libs/business/src/interfaces/comfyui-job-state.interface.ts`**
   - Purpose: TypeScript interfaces for job state
   - Exports: `JobState` interface

### Modified Files

3. **`libs/business/src/services/comfyui-job-runner.ts`**
   - Purpose: Integrate Redis persistence
   - Changes:
     - Save job state on job start
     - Update job state on progress/status changes
     - Recover jobs on initialization
     - Delete job state on completion/failure

---

## Technical Specification

### Dependencies

**New Dependencies:**
- Redis client (check if already available in project)
- If not: `ioredis` or `redis` package

**Existing Dependencies:**
- `@ryla/shared` (for types/utilities)

### Environment Variables

- `REDIS_URL` or `REDIS_HOST`, `REDIS_PORT` (if Redis not already configured)

### Logic Flows

#### Flow 1: Save Job State

```
1. ComfyUIJobRunner.submitBaseImage()
   ↓
2. ComfyUIJobPersistenceService.saveJobState()
   ↓
3. Store in Redis with TTL (2 hours)
```

#### Flow 2: Job Recovery

```
1. Server startup
   ↓
2. ComfyUIJobPersistenceService.recoverActiveJobs()
   ↓
3. Scan Redis for active jobs
   ↓
4. Filter by age (< 10 minutes)
   ↓
5. Reconnect WebSocket (if EP-039 done)
   ↓
6. Resume progress tracking
```

---

## Task Breakdown

### ST-001: Redis Job State Storage

**Story**: Implement Redis storage for job state

**Tasks**:
- **TSK-001**: Create `comfyui-job-state.interface.ts` with JobState interface
- **TSK-002**: Create `ComfyUIJobPersistenceService` class
- **TSK-003**: Implement `saveJobState()` method
- **TSK-004**: Implement `updateJobState()` method
- **TSK-005**: Implement `getJobState()` method
- **TSK-006**: Implement `deleteJobState()` method
- **TSK-007**: Add TTL support (2 hours for long jobs)
- **TSK-008**: Add unit tests for Redis operations

**Acceptance Criteria**:
- ✅ Job state saved to Redis on job start
- ✅ Job state updated on progress/status changes
- ✅ Job state deleted on completion/failure
- ✅ TTL set correctly (2 hours)

**Dependencies**: Redis must be available

---

### ST-002: Job Recovery on Server Restart

**Story**: Recover active jobs from Redis on server startup

**Tasks**:
- **TSK-009**: Implement `recoverActiveJobs()` method
- **TSK-010**: Filter jobs by age (skip >10 minutes)
- **TSK-011**: Reconnect WebSocket for recovered jobs (if EP-039 done)
- **TSK-012**: Resume progress tracking
- **TSK-013**: Update database records
- **TSK-014**: Add recovery tests

**Acceptance Criteria**:
- ✅ Active jobs recovered on server restart
- ✅ Old jobs (>10 minutes) skipped
- ✅ WebSocket reconnected (if EP-039 done)
- ✅ Progress tracking resumed

**Dependencies**: ST-001, EP-039 (optional)

---

### ST-003: Integration with ComfyUIJobRunner

**Story**: Integrate Redis persistence with job runner

**Tasks**:
- **TSK-015**: Add ComfyUIJobPersistenceService to ComfyUIJobRunner
- **TSK-016**: Save job state on job start
- **TSK-017**: Update job state on progress (if EP-039 done)
- **TSK-018**: Delete job state on completion/failure
- **TSK-019**: Call recoverActiveJobs() on initialization
- **TSK-020**: Add integration tests

**Acceptance Criteria**:
- ✅ Job state saved on job start
- ✅ Job state updated on progress
- ✅ Job state deleted on completion
- ✅ Jobs recovered on initialization

**Dependencies**: ST-001, ST-002

---

## Tracking Plan (Analytics Events)

```typescript
// Job state saved
analytics.capture('comfyui_job_state_saved', {
  promptId: string;
  jobType: string;
  userId: string;
});

// Job recovered
analytics.capture('comfyui_job_recovered', {
  promptId: string;
  jobAge: number;  // seconds
  recoveryTime: number;  // milliseconds
});
```

---

**Created**: 2026-01-27  
**Last Updated**: 2026-01-27
