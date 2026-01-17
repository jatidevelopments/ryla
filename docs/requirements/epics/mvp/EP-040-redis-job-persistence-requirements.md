# EP-040: Redis Job Persistence and Recovery - Requirements (P1)

**Phase**: P1 - Requirements  
**Epic**: EP-040  
**Initiative**: IN-007  
**Status**: In Progress

---

## Problem Statement

RYLA's current ComfyUI infrastructure has no persistence layer for active jobs. When the server restarts, all active job tracking is lost. This is critical for long-running operations like LoRA training (1-1.5 hours) where server restarts would cause users to lose progress and require manual intervention.

**Current Pain Points**:
- Server restart = lost job tracking
- No recovery mechanism for active jobs
- Users must manually check job status after restart
- Critical for EP-026 LoRA training (1-1.5 hour jobs)

---

## MVP Objective

Implement Redis-based job persistence that enables automatic job recovery after server restarts, ensuring zero data loss for active ComfyUI workflows, especially long-running operations like LoRA training.

**Measurable Goal**: >95% of active jobs recovered successfully after server restart, with recovery completing in <30 seconds.

---

## Business Metric Target

**Target Metric**: C - Core Value, B - Retention

**Rationale**: Job recovery prevents data loss and improves reliability, which is core to platform value. Better reliability reduces user frustration and churn.

---

## Non-Goals (Explicitly Out of Scope)

- ❌ WebSocket implementation (EP-039)
- ❌ Enhanced error retry logic (EP-041)
- ❌ Job queuing system (future enhancement)
- ❌ Distributed job execution (future enhancement)
- ❌ Job scheduling (future enhancement)
- ❌ Progress persistence (handled by EP-039 WebSocket)

---

**Created**: 2026-01-27  
**Last Updated**: 2026-01-27
