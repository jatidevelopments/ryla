# [EPIC] EP-083: Backpressure Queue Implementation

**Status**: In Review
**Phase**: P7
**Priority**: P2
**Created**: 2026-02-04
**Last Updated**: 2026-02-04

> **Initiative**: [IN-033: Phoenix/BEAM Patterns Adoption](../../../initiatives/IN-033-phoenix-patterns-adoption.md)
> **Phase**: 4 of 5

## Overview

Implement backpressure-aware queue for AI generation requests. Prevents system overload by limiting concurrent operations and gracefully queuing excess requests. Inspired by Elixir's Broadway pattern for data processing.

---

## Business Impact

**Target Metric**: C - Core Value, B - Retention, E - CAC

**Hypothesis**: When the system gracefully handles load spikes instead of degrading, users experience consistent performance and fewer timeouts during high-traffic periods.

**Success Criteria**:
- Queue overload prevention: **0** dropped requests
- Graceful degradation: **<5s** queue wait during peak
- System stability: **0** OOM or timeout crashes under load
- Cost efficiency: **-20%** over-provisioning reduction

---

## Features

### F1: Backpressure Queue

- **Queue Configuration**:
  - Max concurrent jobs: Configurable per provider
  - Queue capacity: Max pending jobs before rejection
  - Queue timeout: Max time in queue before timeout
  - Priority levels: Paid users > free users

- **Flow Control**:
  - Accept request if under capacity
  - Queue request if at capacity
  - Reject with 429 if queue full
  - Provide queue position to user

### F2: Concurrency Control

- **Per-Provider Limits**:
  - Modal: 10 concurrent (GPU availability)
  - Replicate: 20 concurrent (API limits)
  - ComfyUI: 5 per pod (memory limits)
  - Fal: 15 concurrent (API limits)

- **Dynamic Adjustment**:
  - Reduce concurrency on error rate spike
  - Increase concurrency on sustained low usage
  - Provider health affects limits
  - Manual override for emergencies

### F3: Queue Position & ETA

- **Position Tracking**:
  - Track position in queue
  - Estimate wait time based on average processing
  - Push updates via WebSocket (EP-080)
  - Show "Queued: #5, ~30s wait"

- **Priority Queue**:
  - Pro users: Higher priority
  - Retry jobs: Lower priority (prevent retry storm)
  - Configurable priority rules

### F4: Graceful Rejection

- **429 Response**:
  - Return `Retry-After` header
  - User-friendly message: "High demand, try again in 30s"
  - Queue full event logged
  - Frontend shows queue status

- **Load Shedding**:
  - Drop lowest priority jobs first
  - Notify user of drop with reason
  - Log dropped jobs for analysis

### F5: Monitoring & Alerts

- **Queue Metrics**:
  - Queue depth over time
  - Wait time distribution
  - Rejection rate
  - Concurrency utilization

- **Alerts**:
  - Queue depth > 80% capacity
  - Rejection rate > 5%
  - Average wait time > 10s
  - Provider at max concurrency for > 5min

---

## Acceptance Criteria

### AC1: Queue Setup
- [ ] `BackpressureQueue` class implemented
- [ ] Configurable concurrency limits per provider
- [ ] Queue capacity limits enforced
- [ ] Queue timeout handled

### AC2: Flow Control
- [ ] Requests queued when at capacity
- [ ] Requests rejected with 429 when queue full
- [ ] `Retry-After` header included in rejection
- [ ] Queue position returned to client

### AC3: Priority
- [ ] Priority levels implemented (pro > free)
- [ ] Retry jobs have lower priority
- [ ] Priority respected in queue ordering
- [ ] Priority configurable

### AC4: Metrics
- [ ] Queue depth tracked
- [ ] Wait time tracked
- [ ] Rejection rate tracked
- [ ] Alerts configured

### AC5: Integration
- [ ] Generation services use backpressure queue
- [ ] WebSocket emits queue position (EP-080)
- [ ] Frontend shows queue status
- [ ] No dropped requests under normal load

---

## Technical Requirements

### Dependencies

**Existing**:
- BullMQ (from EP-081) - Queue infrastructure
- Redis - Queue storage

**New**:
- None (builds on EP-081 queue infrastructure)

### Files to Create

```
libs/business/src/queues/backpressure-queue.ts       # Backpressure logic
libs/business/src/queues/priority-calculator.ts      # Priority calculation
libs/business/src/queues/queue-metrics.ts            # Queue metrics collection
apps/api/src/modules/queue/queue-status.controller.ts # Queue status endpoint
```

### Files to Modify

```
libs/business/src/queues/generation.queue.ts         # Add backpressure
libs/business/src/queues/generation.processor.ts     # Respect concurrency
apps/api/src/modules/image/services/*.ts             # Use backpressure queue
apps/web/hooks/use-generation-socket.ts              # Handle queue position
```

### Architecture

```
Request
  │
  └── BackpressureQueue.enqueue(job, priority)
        │
        ├── if (concurrent < max) → process immediately
        │
        ├── if (queueDepth < capacity) → add to queue
        │     └── return queue position
        │
        └── if (queueFull) → reject with 429
              └── Retry-After: <seconds>
```

---

## Non-Goals

- ❌ Cross-region load balancing (infrastructure concern)
- ❌ Cost-based scheduling (future enhancement)
- ❌ Predictive scaling (future enhancement)
- ❌ Multi-queue dependencies (future enhancement)

---

## Related Work

### Dependencies
- **EP-080**: WebSocket Status Streaming - Emit queue position updates
- **EP-081**: Job Supervision Patterns - Queue infrastructure

### Blocks
- None

### Related Initiatives
- **IN-033**: Phoenix/BEAM Patterns Adoption (this is Phase 4)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dropped requests | 0 | Under normal load |
| Queue wait | <5s | 95th percentile during peak |
| System stability | 0 crashes | OOM or timeout under load |
| Rejection rate | <1% | Normal operation |
| User experience | >90% | Satisfaction with queue feedback |

---

## Stories

### ST-083-01: Backpressure Queue
Implement `BackpressureQueue` class with flow control.

### ST-083-02: Concurrency Limits
Configure per-provider concurrency limits.

### ST-083-03: Priority Queue
Implement priority levels for job ordering.

### ST-083-04: Queue Status API
Create endpoint and WebSocket events for queue status.

### ST-083-05: Frontend Integration
Show queue position and ETA in generation UI.

---

**Created**: 2026-02-04
**Last Updated**: 2026-02-04
