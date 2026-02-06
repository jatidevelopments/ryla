# [INITIATIVE] IN-033: Phoenix/BEAM Patterns Adoption for TypeScript Stack

**Status**: Proposed  
**Created**: 2026-01-29  
**Last Updated**: 2026-02-04  
**Owner**: Engineering Team  
**Stakeholders**: Infrastructure Team, Product Team

---

## Executive Summary

**One-sentence description**: Adopt battle-tested architectural patterns from Phoenix/Elixir/BEAM ecosystem into RYLA's TypeScript stack to improve real-time capabilities, fault tolerance, and system resilience.

**Business Impact**: C-Core Value (reliable generation), B-Retention (consistent experience), E-CAC (reduced operational overhead)

---

## Why (Business Rationale)

### Problem Statement

RYLA's current architecture uses polling for generation status, has basic job retry logic, and lacks structured error isolation. This leads to:
- Unnecessary API calls (polling every 2-5 seconds)
- Cascading failures when AI providers have issues
- Poor user experience during high load
- Operational burden debugging interconnected failures

### Current State

| Aspect | Current Implementation | Pain Points |
|--------|----------------------|-------------|
| **Status Updates** | Polling (React Query) | Wasteful API calls, delayed updates |
| **Job Orchestration** | Basic BullMQ queues | Limited isolation, manual retry logic |
| **Error Handling** | Try/catch per operation | Errors can cascade, no structured recovery |
| **Backpressure** | None | System degrades poorly under load |
| **Real-time** | Limited WebSocket use | Most features use polling instead |

### Desired State

| Aspect | Target Implementation | Benefits |
|--------|----------------------|----------|
| **Status Updates** | WebSocket push (Socket.io/native) | Instant updates, reduced server load |
| **Job Orchestration** | Supervision patterns with BullMQ | Isolated failures, auto-recovery |
| **Error Handling** | "Let it crash" with boundaries | Contained failures, self-healing |
| **Backpressure** | Queue-based flow control | Graceful degradation under load |
| **Real-time** | WebSocket-first architecture | Responsive UX, lower latency |

### Business Drivers

- **Revenue Impact**: Faster, more reliable generation → higher conversion and retention
- **Cost Impact**: Reduced polling → lower API/infrastructure costs
- **Risk Mitigation**: Isolated failures → fewer outages, faster recovery
- **Competitive Advantage**: Real-time experience matches premium tools
- **User Experience**: Instant feedback, reliable generation, no "stuck" states

---

## How (Approach & Strategy)

### Strategy

Learn from Phoenix/BEAM's proven patterns and implement TypeScript equivalents:

1. **Real-time First**: Replace polling with WebSocket push wherever possible
2. **Supervision Trees**: Implement job isolation and recovery patterns
3. **Actor Model Thinking**: Isolated workers with message passing
4. **Backpressure**: Queue-based flow control for AI generation
5. **"Let It Crash"**: Error boundaries and automatic recovery

### Key Principles

- **Incremental Adoption**: Each pattern can be adopted independently
- **No Stack Rewrite**: Patterns are implemented in TypeScript, not Elixir
- **Production Proven**: Only adopt patterns with clear production value
- **Measurable Impact**: Each pattern must show measurable improvement

### Phoenix Patterns to Adopt

#### 1. Channels → WebSocket Status Streaming

**Phoenix Pattern**: Channels provide real-time bidirectional communication with presence tracking.

**TypeScript Implementation**:
```typescript
// Instead of polling every 2 seconds
const { data } = useQuery({ queryKey: ['generation', id], refetchInterval: 2000 });

// Push updates via WebSocket
const { status, progress } = useGenerationSocket(id);
```

**Apply to**:
- Generation status updates (image/video)
- Studio real-time feedback
- Admin dashboard live metrics

#### 2. Supervision Trees → Job Isolation

**Phoenix Pattern**: Supervisors monitor child processes and restart them on failure without affecting siblings.

**TypeScript Implementation**:
```typescript
// Supervisor pattern with BullMQ
class GenerationSupervisor {
  private workers: Map<string, Worker>;
  
  async supervise(jobId: string) {
    try {
      await this.runJob(jobId);
    } catch (error) {
      // Isolated failure - only this job affected
      await this.handleFailure(jobId, error);
      // Auto-restart with backoff
      await this.restart(jobId);
    }
  }
}
```

**Apply to**:
- Modal/Replicate API calls
- Image processing pipeline
- Webhook handlers

#### 3. GenServer → Stateful Workers

**Phoenix Pattern**: GenServers maintain state and handle messages sequentially.

**TypeScript Implementation**:
```typescript
// Stateful worker for generation session
class GenerationSession {
  private state: SessionState;
  private queue: AsyncQueue;
  
  async handle(message: Message): Promise<Response> {
    // Process messages sequentially
    return this.queue.add(() => this.process(message));
  }
}
```

**Apply to**:
- Long-running generation sessions
- User session state
- Rate limiting state

#### 4. "Let It Crash" → Error Boundaries

**Phoenix Pattern**: Instead of defensive programming, let processes crash and restart cleanly.

**TypeScript Implementation**:
```typescript
// Error boundary for generation pipeline
class GenerationBoundary {
  async run<T>(operation: () => Promise<T>): Promise<Result<T>> {
    try {
      return { success: true, data: await operation() };
    } catch (error) {
      // Log, notify, and return clean failure
      await this.handleCrash(error);
      return { success: false, error: this.sanitize(error) };
    }
  }
}
```

**Apply to**:
- AI provider calls (Modal, Replicate)
- External API integrations
- Image processing steps

#### 5. Backpressure → Queue-Based Flow Control

**Phoenix Pattern**: Broadway and Flow provide backpressure-aware data processing.

**TypeScript Implementation**:
```typescript
// Backpressure-aware queue
class BackpressureQueue {
  private maxConcurrent = 10;
  private active = 0;
  
  async add<T>(job: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      await this.waitForCapacity();
    }
    this.active++;
    try {
      return await job();
    } finally {
      this.active--;
    }
  }
}
```

**Apply to**:
- Generation queue (prevent overload)
- Webhook processing
- Batch operations

#### 6. Telemetry → Structured Observability

**Phoenix Pattern**: Built-in telemetry with structured events and metrics.

**TypeScript Implementation**:
```typescript
// Structured telemetry for all operations
const telemetry = {
  span: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = Date.now();
    try {
      const result = await fn();
      emit({ name, duration: Date.now() - start, status: 'success' });
      return result;
    } catch (error) {
      emit({ name, duration: Date.now() - start, status: 'error', error });
      throw error;
    }
  }
};
```

**Apply to**:
- All AI provider calls
- Database operations
- API endpoints

### Phases

1. **Phase 1: WebSocket Foundation** - Implement WebSocket infrastructure for status updates
2. **Phase 2: Job Supervision** - Add supervision patterns to BullMQ jobs
3. **Phase 3: Error Isolation** - Implement error boundaries and recovery
4. **Phase 4: Backpressure** - Add flow control to generation pipeline
5. **Phase 5: Telemetry** - Structured observability across all services

### Dependencies

- Socket.io or native WebSocket implementation
- **Redis adapter for Socket.io** (`@socket.io/redis-adapter`) - Required for multi-server support
- BullMQ for job orchestration (already in use)
- OpenTelemetry for observability (optional enhancement)

### Constraints

- Must maintain backward compatibility with existing clients
- No breaking changes to existing APIs
- Incremental rollout with feature flags
- Must work with current Vercel/Fly.io infrastructure
- **Multi-server requirement**: WebSocket events must broadcast across all API server instances via Redis pub/sub

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: TBD (after current initiatives stabilize)
- **Target Completion**: Incremental over multiple quarters
- **Key Milestones**:
  - WebSocket infrastructure: 2-3 weeks
  - Job supervision patterns: 2-3 weeks
  - Error isolation: 1-2 weeks
  - Backpressure: 1-2 weeks
  - Telemetry: 1-2 weeks

### Priority

**Priority Level**: P2

**Rationale**: Important for long-term reliability and UX, but not blocking current MVP features. Should be implemented incrementally alongside feature work.

### Resource Requirements

- **Team**: 1-2 backend engineers
- **Budget**: Minimal (infrastructure patterns, no new services)
- **External Dependencies**: None (all patterns implemented in-house)

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Engineering Team  
**Role**: Backend Architecture  
**Responsibilities**: Pattern design, implementation, documentation

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Engineering | Backend | High | Implementation, testing |
| Product | UX | Medium | Validate UX improvements |
| Infrastructure | DevOps | Medium | Deployment, monitoring |

### Teams Involved

- **Engineering**: Pattern implementation
- **Product**: UX validation
- **Infrastructure**: Observability and deployment

### Communication Plan

- **Updates Frequency**: Per-phase completion
- **Update Format**: Technical doc + demo
- **Audience**: Engineering team

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| Polling reduction | -80% | API call count | Phase 1 |
| Status update latency | <500ms | Time from event to UI | Phase 1 |
| Job failure isolation | 100% | No cascading failures | Phase 2 |
| Error recovery rate | >95% | Auto-recovered vs manual | Phase 3 |
| Queue overload prevention | 0 drops | Generation queue metrics | Phase 4 |

### Business Metrics Impact

**Target Metric**: [x] C-Core Value [x] B-Retention [x] E-CAC

**Expected Impact**:
- C-Core Value: Faster, more reliable generation experience
- B-Retention: Fewer "stuck" states, consistent UX
- E-CAC: Reduced infrastructure costs from polling

### Leading Indicators

- Reduced API call volume (polling → WebSocket)
- Faster detection of generation failures
- Cleaner error logs (isolated, not cascading)

### Lagging Indicators

- Improved user satisfaction scores
- Reduced support tickets for "stuck" generations
- Lower infrastructure costs

---

## Definition of Done

### Initiative Complete When:

- [ ] WebSocket status streaming implemented for generation
- [ ] Job supervision patterns in production
- [ ] Error boundaries around all AI provider calls
- [ ] Backpressure on generation queue
- [ ] Telemetry for all critical paths
- [ ] Documentation for each pattern
- [ ] Metrics validated

### Not Done Criteria

**This initiative is NOT done if:**
- [ ] Polling still primary for status updates
- [ ] Failures still cascade across jobs
- [ ] No structured error recovery
- [ ] System still degrades poorly under load
- [ ] No observability on critical paths

---

## Related Work

### Epics

| Epic | Name | Phase | Status | Link |
|------|------|-------|--------|------|
| EP-080 | WebSocket Status Streaming to Frontend | 1 | Proposed | [EP-080](../requirements/epics/ops/EP-080-websocket-status-streaming.md) |
| EP-081 | Job Supervision Patterns | 2 | Proposed | [EP-081](../requirements/epics/ops/EP-081-job-supervision-patterns.md) |
| EP-082 | Error Boundary Implementation | 3 | Proposed | [EP-082](../requirements/epics/ops/EP-082-error-boundary-implementation.md) |
| EP-083 | Backpressure Queue Implementation | 4 | Proposed | [EP-083](../requirements/epics/ops/EP-083-backpressure-queue.md) |
| EP-084 | Structured Telemetry Implementation | 5 | Proposed | [EP-084](../requirements/epics/ops/EP-084-structured-telemetry.md) |

### Dependencies

- **Blocks**: Future real-time features (collaboration, presence)
- **Blocked By**: Nothing (can start anytime)
- **Related Initiatives**: IN-020 (Modal MVP), IN-024 (Modal Code Organization)

### Documentation

- Phoenix Framework Docs: https://www.phoenixframework.org/
- Elixir Supervision: https://elixir-lang.org/getting-started/mix-otp/supervisor-and-application.html
- BEAM Resilience Patterns: https://ferd.ca/the-zen-of-erlang.html

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| WebSocket complexity | Medium | Medium | Start with Socket.io for ease, migrate later if needed |
| Team unfamiliarity with patterns | Medium | Low | Document patterns clearly, pair programming |
| Overhead of new patterns | Low | Medium | Measure before/after, rollback if negative impact |
| Integration with existing code | Medium | Medium | Feature flags, incremental rollout |

---

## Progress Tracking

### Current Phase

**Phase**: P7 (Testing)  
**Status**: In Review

### Recent Updates

- **2026-02-04**: All 5 epics implemented and tested (143 tests passing)
  - EP-080: WebSocket Status Streaming (Redis adapter, frontend hooks, backend events)
  - EP-081: Job Supervision Patterns (JobSupervisor, CircuitBreaker, Result<T> type)
  - EP-082: Error Boundary Implementation (AIProviderBoundary, typed errors)
  - EP-083: Backpressure Queue (priority queue, flow control)
  - EP-084: Structured Telemetry (spans, metrics, JSON export)
- **2026-02-04**: Created epics EP-080 through EP-084 for all 5 phases
- **2026-02-04**: Added Redis adapter requirement for multi-server WebSocket support
- **2026-01-29**: Initiative created based on Phoenix/BEAM pattern analysis

### Next Steps

1. **P8 Integration**: Integrate patterns with existing generation services
2. **P9 Deployment**: Deploy to staging environment
3. **P10 Validation**: Measure polling reduction, error recovery rate

---

## Technical Reference

### Phoenix Patterns Summary

| Phoenix Concept | TypeScript Equivalent | RYLA Use Case |
|----------------|----------------------|---------------|
| **Channels** | Socket.io / WebSocket | Generation status, real-time UI |
| **LiveView** | React Server Components + streaming | Server-driven UI updates |
| **GenServer** | Stateful class + async queue | Session management |
| **Supervisor** | Job isolation + auto-restart | BullMQ job supervision |
| **Task** | Promise + structured concurrency | Parallel operations |
| **Broadway** | Backpressure queue | Generation pipeline |
| **Telemetry** | OpenTelemetry / custom | Observability |

### Implementation Priority

Based on impact vs effort:

1. **High Impact, Moderate Effort**: WebSocket status streaming
2. **High Impact, Low Effort**: Error boundaries around AI calls
3. **Medium Impact, Moderate Effort**: Job supervision patterns
4. **Medium Impact, Low Effort**: Structured telemetry
5. **Medium Impact, High Effort**: Backpressure queue

### Code Examples Repository

Create `libs/phoenix-patterns/` with:
- `supervisor.ts` - Supervision pattern utilities
- `boundary.ts` - Error boundary utilities
- `backpressure.ts` - Flow control utilities
- `telemetry.ts` - Structured observability

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well
- TBD

### What Could Be Improved
- TBD

### Recommendations for Future Initiatives
- TBD

---

## References

- [Phoenix Framework](https://www.phoenixframework.org/)
- [Elixir Getting Started](https://elixir-lang.org/getting-started/introduction.html)
- [The Zen of Erlang](https://ferd.ca/the-zen-of-erlang.html)
- [Designing for Scalability with Erlang/OTP](https://www.oreilly.com/library/view/designing-for-scalability/9781449361556/)
- [Phoenix Channels Guide](https://hexdocs.pm/phoenix/channels.html)
- [Broadway for Data Processing](https://github.com/dashbitco/broadway)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-29
