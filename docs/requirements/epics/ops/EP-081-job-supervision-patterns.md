# [EPIC] EP-081: Job Supervision Patterns

**Status**: In Review
**Phase**: P7
**Priority**: P2
**Created**: 2026-02-04
**Last Updated**: 2026-02-04

> **Initiative**: [IN-033: Phoenix/BEAM Patterns Adoption](../../../initiatives/IN-033-phoenix-patterns-adoption.md)
> **Phase**: 2 of 5

## Overview

Implement Erlang/OTP-style supervision patterns for job processing. Jobs run in isolated units with automatic restart on failure. One job's failure doesn't affect other jobs. Uses existing BullMQ infrastructure (installed but unused) with supervision wrappers.

---

## Business Impact

**Target Metric**: C - Core Value, B - Retention, E - CAC

**Hypothesis**: When job failures are isolated and auto-recovered, users experience fewer "stuck" generations, support tickets decrease, and system reliability improves.

**Success Criteria**:
- Job failure isolation: **100%** - no cascading failures
- Auto-recovery rate: **>95%** - transient failures recovered automatically
- MTTR: **<30s** - time to recover from transient failure
- Support tickets: **-50%** - fewer "stuck generation" reports

---

## Features

### F1: BullMQ Queue Setup

- **Queue Configuration**:
  - Create `GenerationQueue` for image/video jobs
  - Configure retry strategies (exponential backoff)
  - Set job timeout and stalled job handling
  - Use existing Redis connection

- **Worker Configuration**:
  - Isolated workers per job type
  - Concurrency limits (prevent overload)
  - Graceful shutdown handling
  - Health checks for workers

### F2: Supervision Pattern

- **JobSupervisor Class**:
  - Monitors job execution
  - Catches failures and decides: retry, escalate, or fail
  - Logs all supervision events
  - Implements restart strategies

- **Restart Strategies**:
  - `one-for-one`: Restart only failed job
  - `exponential-backoff`: Increasing delay between retries
  - `circuit-breaker`: Stop retries after N failures in time window
  - `fallback`: Try alternative provider on repeated failure

### F3: Job Isolation

- **Process Isolation**:
  - Each job runs in isolated context
  - Job state not shared between jobs
  - Memory limits per job
  - Timeout enforcement

- **Failure Containment**:
  - One job's error doesn't affect queue
  - Failed job marked and logged
  - Other jobs continue processing
  - Queue health monitored

### F4: Auto-Recovery

- **Transient Failure Recovery**:
  - Network errors → auto-retry with backoff
  - Provider timeout → retry with longer timeout
  - Rate limiting → wait and retry
  - Pod unavailable → try different pod

- **Permanent Failure Handling**:
  - Max retries reached → mark as failed
  - Invalid input → fail immediately (no retry)
  - Provider error → notify user, offer retry button

### F5: Monitoring & Metrics

- **Supervision Metrics**:
  - Jobs started, completed, failed, retried
  - Average retry count per job type
  - Recovery rate by failure type
  - Time in queue, processing time

- **Alerting**:
  - High failure rate alert
  - Queue backup alert
  - Worker health alert
  - Circuit breaker triggered alert

---

## Acceptance Criteria

### AC1: BullMQ Setup
- [ ] BullMQ queues configured for generation jobs
- [ ] Workers process jobs with concurrency limits
- [ ] Jobs have timeout and retry configuration
- [ ] Queue uses existing Redis connection

### AC2: Supervision
- [ ] `JobSupervisor` class implemented
- [ ] Restart strategies configurable per job type
- [ ] Circuit breaker prevents retry storms
- [ ] Fallback to alternative provider supported

### AC3: Isolation
- [ ] Jobs run in isolated context
- [ ] One job failure doesn't affect others
- [ ] Memory limits enforced
- [ ] Timeouts enforced

### AC4: Recovery
- [ ] Transient failures auto-recovered
- [ ] >95% recovery rate for network errors
- [ ] Permanent failures fail gracefully
- [ ] User notified of final failure state

### AC5: Metrics
- [ ] Job metrics tracked (started, completed, failed)
- [ ] Retry metrics tracked
- [ ] Queue health dashboard available
- [ ] Alerts configured for high failure rate

---

## Technical Requirements

### Dependencies

**Existing (unused)**:
- `bull` - Job queue (already installed)
- `@nestjs/bull` - NestJS integration (already installed)

**New**:
- `@bull-board/api` - Queue monitoring UI (optional)

### Files to Create

```
libs/business/src/queues/generation.queue.ts         # Queue definition
libs/business/src/queues/generation.processor.ts     # Job processor
libs/business/src/supervision/job-supervisor.ts      # Supervision logic
libs/business/src/supervision/restart-strategies.ts  # Restart strategy implementations
libs/business/src/supervision/circuit-breaker.ts     # Circuit breaker pattern
apps/api/src/modules/queue/queue.module.ts           # NestJS queue module
```

### Files to Modify

```
apps/api/src/modules/app.module.ts                   # Import QueueModule
apps/api/src/modules/image/services/*.ts             # Use queue instead of direct calls
libs/business/src/services/modal-job-runner.ts       # Integrate with supervisor
libs/business/src/services/comfyui-job-runner.ts     # Integrate with supervisor
```

### Architecture

```
JobSupervisor
  ├── monitors job execution
  ├── catches failures
  └── applies restart strategy
        ↓
GenerationQueue (BullMQ)
  ├── job isolation
  ├── retry handling
  └── concurrency control
        ↓
GenerationProcessor
  ├── executes job logic
  └── calls AI providers
        ↓
Modal / ComfyUI / Replicate
```

---

## Non-Goals

- ❌ Distributed supervision across servers (single-server supervision for now)
- ❌ Custom job scheduler (use BullMQ built-in)
- ❌ Multi-queue dependencies (future enhancement)
- ❌ Job priority queues (future enhancement)

---

## Related Work

### Dependencies
- **EP-080**: WebSocket Status Streaming - Emit job status via WebSocket
- **EP-040**: Redis Job Persistence - Redis already configured

### Blocks
- **EP-082**: Error Boundary Implementation - Uses supervision for AI calls
- **EP-083**: Backpressure Queue - Builds on queue infrastructure

### Related Initiatives
- **IN-033**: Phoenix/BEAM Patterns Adoption (this is Phase 2)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Job isolation | 100% | No cascading failures in logs |
| Auto-recovery | >95% | Transient failures recovered |
| MTTR | <30s | Time from failure to recovery |
| Support tickets | -50% | "Stuck generation" reports |
| Queue health | >99% | Queue availability |

---

## Stories

### ST-081-01: BullMQ Queue Setup
Configure BullMQ queues for generation jobs.

### ST-081-02: Job Supervisor
Implement `JobSupervisor` class with restart strategies.

### ST-081-03: Circuit Breaker
Implement circuit breaker to prevent retry storms.

### ST-081-04: Service Integration
Migrate generation services to use supervised queue.

### ST-081-05: Metrics & Monitoring
Add job metrics and queue health monitoring.

---

**Created**: 2026-02-04
**Last Updated**: 2026-02-04
