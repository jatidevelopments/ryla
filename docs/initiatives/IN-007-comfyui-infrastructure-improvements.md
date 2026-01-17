# [INITIATIVE] IN-007: ComfyUI Infrastructure Improvements (MDC-Inspired)

**Status**: Proposed  
**Created**: 2026-01-27  
**Last Updated**: 2026-01-27  
**Owner**: Infrastructure Team  
**Stakeholders**: Backend Team, Product Team

---

## Executive Summary

**One-sentence description**: Modernize RYLA's ComfyUI/RunPod infrastructure by adopting proven patterns from MDC, including WebSocket-based real-time progress tracking, Redis persistence for job recovery, and enhanced error handling to support long-running operations like LoRA training.

**Business Impact**: C-Core Value (improved reliability and user experience), B-Retention (better progress visibility reduces user frustration), E-CAC (reduced server load from polling)

---

## Why (Business Rationale)

### Problem Statement

RYLA's current ComfyUI infrastructure uses REST API polling (every 2 seconds) for job status, which has several limitations:

**Key Pain Points**:
- **No real-time progress**: Users see binary status (queued/processing/completed) instead of percentage progress
- **No job recovery**: Server restarts lose active job tracking (critical for 1-1.5 hour LoRA training jobs)
- **High server load**: Constant polling creates unnecessary API requests
- **Poor error handling**: Limited retry logic and error recovery
- **No progress visibility**: Long-running jobs (LoRA training) have no progress feedback
- **Inefficient**: Polling every 2 seconds even when nothing changes

### Current State

- **ComfyUI Integration**: REST API polling via `ComfyUIPodClient.getJobStatus()`
- **Progress Tracking**: Binary status only (queued/processing/completed/failed)
- **Job Persistence**: No persistence layer - jobs lost on server restart
- **Error Handling**: Basic retry logic, no automatic recovery
- **Real-time Updates**: None - users must poll for status
- **WebSocket Support**: Not implemented

### Desired State

- **Real-time Progress**: WebSocket-based progress updates with percentage completion
- **Job Recovery**: Redis persistence for active jobs, automatic recovery on restart
- **Efficient Communication**: WebSocket for real-time, REST polling as fallback
- **Enhanced Error Handling**: Automatic retries, health checks, graceful degradation
- **Progress Visibility**: Node-level progress tracking for long-running operations
- **Production Ready**: Supports 1-1.5 hour LoRA training jobs without data loss

### Business Drivers

- **Revenue Impact**: Better progress visibility improves user satisfaction, reducing churn
- **Cost Impact**: Reduced server load from WebSocket vs polling (lower infrastructure costs)
- **Risk Mitigation**: Job recovery prevents data loss on server restarts (critical for LoRA training)
- **Competitive Advantage**: Real-time progress provides better UX than competitors
- **User Experience**: Progress visibility reduces user anxiety during long operations
- **Technical Debt**: Modernizes infrastructure to support future features (video generation, batch processing)

---

## How (Approach & Strategy)

### Strategy

1. **Adopt MDC's WebSocket Pattern**
   - Implement WebSocket client for ComfyUI connections
   - Listen for `progress_state`, `executed`, `execution_error` events
   - Calculate percentage progress from node execution states
   - Fallback to REST polling if WebSocket fails

2. **Add Redis Persistence Layer**
   - Store active jobs in Redis with TTL
   - Recover jobs on server restart
   - Track job state (promptId, type, userId, status, progress)
   - Support long-running operations (LoRA training: 1-1.5 hours)

3. **Enhance Error Handling**
   - Automatic retry with exponential backoff
   - Health checks before retries
   - Node error detection and reporting
   - Graceful degradation (fallback to polling)

4. **Progress Tracking Enhancement**
   - Calculate progress from node execution counts
   - Support percentage progress (0-100%)
   - Real-time progress updates via WebSocket
   - Progress notifications for long-running jobs

### Key Principles

- **Backward Compatible**: Existing REST polling continues to work as fallback
- **Incremental Rollout**: WebSocket first, then Redis, then enhancements
- **Proven Patterns**: Adopt MDC's battle-tested approach
- **User Experience First**: Real-time progress improves UX significantly
- **Reliability**: Job recovery prevents data loss

### Phases

1. **Phase 1: WebSocket Infrastructure** - Implement WebSocket client, progress tracking - 1-2 weeks
2. **Phase 2: Redis Persistence** - Add Redis storage, job recovery - 1 week
3. **Phase 3: Enhanced Error Handling** - Retry logic, health checks - 1 week
4. **Phase 4: Integration & Testing** - Integrate with existing code, end-to-end testing - 1 week

**Total Timeline**: 4-5 weeks

### Dependencies

- **EP-026**: LoRA Training (needs job recovery for 1-1.5 hour jobs)
- **Redis Infrastructure**: Redis must be available and configured
- **ComfyUI Pod**: ComfyUI pod must support WebSocket connections
- **Existing Infrastructure**: Must work with current `ComfyUIPodClient` and `ComfyUIJobRunner`

### Constraints

- **Backward Compatibility**: Must not break existing image generation workflows
- **Infrastructure**: Requires Redis (may need to add if not present)
- **Testing**: Must test with real ComfyUI pods (not just local)
- **Timeline**: Should complete before EP-026 LoRA training launch

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-02-01 (after EP-026 planning complete)
- **Target Completion**: 2026-03-01
- **Key Milestones**:
  - WebSocket client implemented: 2026-02-15
  - Redis persistence added: 2026-02-22
  - Enhanced error handling: 2026-02-28
  - Integration complete: 2026-03-01

### Priority

**Priority Level**: P1

**Rationale**: 
- Critical for EP-026 LoRA training (1-1.5 hour jobs need recovery)
- Improves user experience significantly (real-time progress)
- Reduces infrastructure costs (less polling)
- Enables future features (video generation, batch processing)

### Resource Requirements

- **Team**: Backend Team (1-2 engineers), Infrastructure Team (Redis setup)
- **Budget**: Minimal (uses existing infrastructure, Redis may need scaling)
- **External Dependencies**: Redis (may need to provision if not available)

---

## Who (Stakeholders & Ownership)

### Initiative Owner
**Name**: Infrastructure Team Lead  
**Role**: Infrastructure Team  
**Responsibilities**: 
- Oversee implementation
- Coordinate with Backend Team
- Ensure Redis infrastructure is ready
- Validate WebSocket implementation

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Backend Team | Development | High | Implement WebSocket client, Redis integration |
| Infrastructure Team | Infrastructure | High | Redis setup, monitoring, scaling |
| Product Team | Product | Medium | UX requirements, progress visibility needs |
| EP-026 Team | LoRA Training | High | Validate job recovery for long-running operations |

### Teams Involved

- **Backend Team**: Primary implementation (WebSocket, Redis, error handling)
- **Infrastructure Team**: Redis provisioning, monitoring, scaling
- **Product Team**: UX requirements, progress visibility design

### Communication Plan

- **Updates Frequency**: Weekly
- **Update Format**: Status update in #mvp-ryla-dev Slack channel
- **Audience**: Backend Team, Infrastructure Team, Product Team, EP-026 stakeholders

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| WebSocket adoption rate | >80% of jobs use WebSocket | Track WebSocket vs polling usage | After Phase 1 |
| Job recovery success rate | >95% of jobs recovered after restart | Test server restart scenarios | After Phase 2 |
| Progress visibility | 100% of long-running jobs show progress | Track progress updates sent | After Phase 1 |
| Error recovery rate | >90% of transient errors auto-recovered | Track retry success rate | After Phase 3 |
| Server load reduction | <50% of previous polling requests | Compare API request counts | After Phase 1 |

### Business Metrics Impact

**Target Metric**: [x] A-Activation [x] B-Retention [x] C-Core Value [ ] D-Conversion [x] E-CAC

**Expected Impact**:
- **C-Core Value**: Better progress visibility improves user satisfaction (+10% satisfaction score)
- **B-Retention**: Reduced frustration from long-running jobs (-5% churn for LoRA training users)
- **E-CAC**: Reduced server load from polling (-30% API requests, lower infrastructure costs)
- **A-Activation**: Better UX may improve activation (indirect impact)

### Leading Indicators

- WebSocket connection success rate >95%
- Redis job persistence working (no lost jobs in testing)
- Progress updates being sent for long-running jobs
- Error retry logic catching and recovering from transient failures

### Lagging Indicators

- User satisfaction with progress visibility (survey/feedback)
- Reduction in support tickets about "stuck" jobs
- Infrastructure cost reduction (lower API request volume)
- Job recovery success in production (after actual server restarts)

---

## Definition of Done

### Initiative Complete When:

- [ ] WebSocket client implemented and tested
- [ ] Redis persistence layer added and tested
- [ ] Job recovery working (tested with server restart)
- [ ] Enhanced error handling implemented
- [ ] Progress tracking showing percentage (0-100%)
- [ ] Backward compatibility maintained (REST polling still works)
- [ ] Integration with EP-026 LoRA training validated
- [ ] Documentation updated (architecture, API docs)
- [ ] Monitoring and alerting configured
- [ ] Success metrics validated

### Not Done Criteria

**This initiative is NOT done if:**

- [ ] Jobs are lost on server restart
- [ ] Progress tracking not working for long-running jobs
- [ ] WebSocket adoption <50% (fallback to polling too often)
- [ ] Error recovery rate <80%
- [ ] Backward compatibility broken
- [ ] Documentation missing or incomplete
- [ ] EP-026 LoRA training cannot use new infrastructure

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-039 | WebSocket-based Real-time Progress Tracking | Proposed | [EP-039](../requirements/epics/mvp/EP-039-websocket-realtime-progress.md) |
| EP-040 | Redis Job Persistence and Recovery | Proposed | [EP-040](../requirements/epics/mvp/EP-040-redis-job-persistence.md) |
| EP-041 | Enhanced Error Handling and Retry Logic | Proposed | [EP-041](../requirements/epics/mvp/EP-041-enhanced-error-handling.md) |
| EP-026 | LoRA Training for Character Consistency | Proposed | [EP-026](../requirements/epics/mvp/EP-026-lora-training.md) |
| EP-005 | Content Studio | Active | [EP-005](../requirements/epics/mvp/EP-005-content-studio.md) |

### Dependencies

- **Blocks**: EP-026 LoRA Training (needs job recovery)
- **Blocked By**: None (can start immediately)
- **Related Initiatives**: 
  - IN-006: LoRA Character Consistency System (needs this infrastructure)

### Documentation

- **MDC Reference**: MDC's `ComfyUIWebSocketService` implementation (external reference)
- **Current Implementation**: `libs/business/src/services/comfyui-pod-client.ts`
- **ADR**: May need ADR for WebSocket vs polling decision
- **Technical Spec**: ComfyUI WebSocket API documentation

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| WebSocket connection failures | Medium | High | Implement REST polling fallback, health checks |
| Redis not available/scalable | Low | High | Verify Redis infrastructure before Phase 2, plan scaling |
| Breaking existing workflows | Medium | High | Maintain backward compatibility, extensive testing |
| ComfyUI WebSocket API changes | Low | Medium | Version pinning, monitor ComfyUI updates |
| Performance issues with WebSocket | Low | Medium | Load testing, connection pooling, monitoring |
| Job recovery edge cases | Medium | Medium | Comprehensive testing, error logging, manual recovery process |

---

## Progress Tracking

### Current Phase

**Phase**: Proposed  
**Status**: Not Started

### Recent Updates

- **2026-01-27**: Initiative created based on MDC pattern analysis

### Next Steps

1. Review initiative with Infrastructure and Backend teams
2. Verify Redis infrastructure availability
3. Create detailed technical specification
4. Begin Phase 1: WebSocket infrastructure implementation

---

## Technical Implementation Details

### WebSocket Client Architecture

```typescript
// New service: ComfyUIWebSocketClient
class ComfyUIWebSocketClient {
  // Connect to ComfyUI WebSocket
  async connect(baseUrl: string): Promise<string>
  
  // Listen for progress updates
  onProgress(promptId: string, handler: (progress: number) => void): void
  
  // Listen for completion
  onCompletion(promptId: string, handler: (result: ComfyUIJobResult) => void): void
  
  // Listen for errors
  onError(promptId: string, handler: (error: string) => void): void
}
```

### Redis Persistence Schema

```typescript
interface JobState {
  promptId: string;
  type: 'image_generation' | 'lora_training' | 'face_swap';
  userId: string;
  characterId?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt: number;
  clientId?: string; // WebSocket client ID
}

// Redis key: `comfyui:job:${promptId}`
// TTL: 7200 seconds (2 hours) for long-running jobs
```

### Integration Points

1. **ComfyUIPodClient**: Add WebSocket support alongside REST API
2. **ComfyUIJobRunner**: Use WebSocket for progress, fallback to polling
3. **StudioGenerationService**: Integrate progress updates for UI
4. **EP-026 LoRA Training**: Use job recovery for long-running operations

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well

- [To be documented]

### What Could Be Improved

- [To be documented]

### Recommendations for Future Initiatives

- [To be documented]

---

## References

- **MDC Implementation**: `/Users/admin/Documents/Projects/MDC/mdc-backend/src/modules/image/services/comfyui-websocket.service.ts`
- **Current RYLA Implementation**: `libs/business/src/services/comfyui-pod-client.ts`
- **ComfyUI WebSocket API**: [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- **EP-026 LoRA Training**: `docs/requirements/epics/mvp/EP-026-lora-training.md`
- **Redis Best Practices**: Redis persistence patterns for job tracking

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-27
