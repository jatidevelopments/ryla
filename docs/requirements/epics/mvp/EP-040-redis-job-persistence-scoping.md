# EP-040: Redis Job Persistence and Recovery - Scoping (P2)

**Phase**: P2 - Scoping  
**Epic**: EP-040  
**Initiative**: IN-007  
**Status**: In Progress

---

## Feature List

### F1: Redis Job State Storage
- Store active job state in Redis with TTL
- Job state schema (promptId, type, userId, status, progress, timestamps)
- Atomic operations for state updates
- Automatic cleanup of stale jobs

### F2: Job Recovery on Server Restart
- Scan Redis for active jobs on startup
- Filter jobs by age (skip jobs older than 10 minutes)
- Reconnect WebSocket connections (if EP-039 implemented)
- Resume progress tracking for recovered jobs
- Update database records

### F3: Job State Management
- Save job state on job start
- Update job state on progress/status changes
- Delete job state on completion/failure
- Query job state by promptId, userId, type

### F4: Integration with Existing Services
- Integrate with ComfyUIJobRunner
- Integrate with database records
- Maintain consistency between Redis and DB
- Support WebSocket progress (EP-039)

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
- ✅ Integrated with ComfyUIJobRunner
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

## Analytics Acceptance Criteria

### Events to Track

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

// Recovery failure
analytics.capture('comfyui_job_recovery_failed', {
  promptId: string;
  reason: string;
});
```

---

## Non-MVP Items

- Job queuing system
- Distributed job execution
- Job scheduling
- Advanced job state queries
- Job state history/audit log

---

**Created**: 2026-01-27  
**Last Updated**: 2026-01-27
