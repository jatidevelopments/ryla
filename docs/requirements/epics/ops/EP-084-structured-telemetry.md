# [EPIC] EP-084: Structured Telemetry Implementation

**Status**: In Review
**Phase**: P7
**Priority**: P2
**Created**: 2026-02-04
**Last Updated**: 2026-02-04

> **Initiative**: [IN-033: Phoenix/BEAM Patterns Adoption](../../../initiatives/IN-033-phoenix-patterns-adoption.md)
> **Phase**: 5 of 5

## Overview

Implement structured telemetry for all critical operations. Add spans, metrics, and structured logging. Inspired by Phoenix's built-in telemetry system. Provides observability for AI provider calls, database operations, and API endpoints.

---

## Business Impact

**Target Metric**: C - Core Value, E - CAC

**Hypothesis**: When all operations have structured telemetry, debugging is faster, performance issues are detected proactively, and cost attribution is accurate.

**Success Criteria**:
- Observability coverage: **100%** of critical paths
- Debug time: **-60%** time to diagnose issues
- Performance detection: **<5min** to detect regression
- Cost accuracy: **>95%** accurate cost attribution

---

## Features

### F1: Telemetry Core

- **Span API**:
  - `telemetry.span(name, attributes, fn)` - Wraps operation with timing
  - Automatic duration calculation
  - Success/failure status
  - Nested spans for call hierarchy

- **Event API**:
  - `telemetry.emit(event, attributes)` - Fire-and-forget event
  - Async handlers (don't block operation)
  - Event batching for efficiency

### F2: AI Provider Telemetry

- **Span Attributes**:
  - Provider name (modal, replicate, fal, comfyui)
  - Operation type (generate, train, upscale)
  - Model name
  - Input parameters (sanitized)
  - Duration, status, error

- **Metrics**:
  - Request count by provider/operation
  - Latency distribution (p50, p95, p99)
  - Error rate by provider
  - Cost per operation

### F3: Database Telemetry

- **Query Spans**:
  - Table name, operation type (select, insert, update)
  - Duration, row count
  - Connection pool utilization
  - Slow query detection (>100ms)

- **Drizzle Integration**:
  - Wrap Drizzle queries with telemetry
  - Log slow queries
  - Track query patterns

### F4: API Telemetry

- **Request Spans**:
  - Route, method, status code
  - Duration, request size, response size
  - User ID, correlation ID
  - Error details

- **tRPC Integration**:
  - Enhance existing tRPC timing (currently basic)
  - Add span hierarchy
  - Track procedure-level metrics

### F5: Metrics Export

- **Export Formats**:
  - Structured JSON logs (for log aggregation)
  - OpenTelemetry format (optional)
  - Prometheus metrics (optional)

- **Destinations**:
  - Console (development)
  - Log files (production)
  - External services (future: Grafana, Datadog)

---

## Acceptance Criteria

### AC1: Telemetry Core
- [ ] `telemetry.span()` API implemented
- [ ] `telemetry.emit()` API implemented
- [ ] Automatic duration tracking
- [ ] Nested spans supported

### AC2: AI Provider Coverage
- [ ] Modal calls have telemetry
- [ ] Replicate calls have telemetry
- [ ] ComfyUI calls have telemetry
- [ ] Fal calls have telemetry

### AC3: Database Coverage
- [ ] Drizzle queries have telemetry
- [ ] Slow queries logged (>100ms)
- [ ] Connection pool metrics tracked
- [ ] Query patterns observable

### AC4: API Coverage
- [ ] HTTP requests have telemetry
- [ ] tRPC procedures have telemetry
- [ ] Error details captured
- [ ] Correlation IDs propagated

### AC5: Export
- [ ] Structured JSON logs in production
- [ ] Console output in development
- [ ] Metrics aggregation working
- [ ] No performance impact (<1% overhead)

---

## Technical Requirements

### Dependencies

**Existing**:
- Basic timing in `logger.interceptor.ts` and `trpc.ts`
- Modal cost tracking headers

**New (Optional)**:
- `@opentelemetry/api` - Standard telemetry API
- `@opentelemetry/sdk-node` - Node.js SDK
- `prom-client` - Prometheus metrics

### Files to Create

```
libs/shared/src/telemetry/telemetry.ts               # Core telemetry API
libs/shared/src/telemetry/span.ts                    # Span implementation
libs/shared/src/telemetry/metrics.ts                 # Metrics collection
libs/shared/src/telemetry/exporters/json-exporter.ts # JSON log export
libs/business/src/telemetry/ai-provider-telemetry.ts # AI provider instrumentation
apps/api/src/common/interceptors/telemetry.interceptor.ts # HTTP telemetry
```

### Files to Modify

```
libs/business/src/boundaries/*.ts                    # Add telemetry spans
libs/business/src/services/*.ts                      # Add telemetry spans
libs/data/src/repositories/*.ts                      # Add query telemetry
libs/trpc/src/trpc.ts                               # Enhance with spans
apps/api/src/common/interceptors/logger.interceptor.ts # Integrate telemetry
```

### Architecture

```
Request
  │
  └── telemetry.span("http.request")
        │
        └── telemetry.span("trpc.procedure")
              │
              ├── telemetry.span("db.query")
              │
              └── telemetry.span("ai.provider.call")
                    │
                    └── metrics.increment("ai.requests")

Exporter
  │
  ├── Console (dev)
  └── JSON Log (prod)
```

---

## Non-Goals

- ❌ Real-time dashboards (future enhancement)
- ❌ Distributed tracing across services (single service for now)
- ❌ Custom visualization tools (use existing tools)
- ❌ Log storage/retention (infrastructure concern)

---

## Related Work

### Dependencies
- **EP-082**: Error Boundary Implementation - Boundaries emit telemetry

### Blocks
- None (enables future observability features)

### Related Initiatives
- **IN-033**: Phoenix/BEAM Patterns Adoption (this is Phase 5)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Coverage | 100% | Critical paths instrumented |
| Debug time | -60% | Time to diagnose issues |
| Detection time | <5min | Regression detection |
| Overhead | <1% | Performance impact |
| Cost accuracy | >95% | Attribution accuracy |

---

## Stories

### ST-084-01: Telemetry Core
Implement `telemetry.span()` and `telemetry.emit()` APIs.

### ST-084-02: AI Provider Instrumentation
Add telemetry to all AI provider calls.

### ST-084-03: Database Instrumentation
Add telemetry to Drizzle queries.

### ST-084-04: API Instrumentation
Enhance HTTP and tRPC telemetry.

### ST-084-05: Metrics Export
Implement structured JSON log export.

---

**Created**: 2026-02-04
**Last Updated**: 2026-02-04
