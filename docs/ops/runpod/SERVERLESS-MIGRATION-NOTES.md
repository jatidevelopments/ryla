# Serverless Migration Notes

**Date**: 2026-01-27  
**Status**: Planning  
**Related**: [ADR-006: Use RunPod Serverless Over Dedicated Pods](../../decisions/ADR-006-runpod-serverless-over-dedicated-pods.md)

---

## Overview

This document tracks the migration from dedicated ComfyUI pods to RunPod serverless endpoints, including implications for recent infrastructure work.

---

## Impact on Recent Work

### EP-039: WebSocket Real-time Progress Tracking

**Status**: ⚠️ **Needs Review**

**Current Implementation**:
- WebSocket client for dedicated ComfyUI pod
- Real-time progress tracking via WebSocket connection
- Fallback to REST polling

**Serverless Implications**:
- Serverless endpoints may not support WebSocket connections
- Need to verify RunPod serverless WebSocket support
- May need to use REST polling only for serverless
- Progress tracking via job status polling instead

**Action Items**:
- [ ] Verify RunPod serverless WebSocket support
- [ ] Update `ComfyUIWebSocketClient` for serverless compatibility
- [ ] Implement REST-based progress tracking for serverless
- [ ] Test with serverless endpoints

---

### EP-040: Redis Job Persistence and Recovery

**Status**: ✅ **Still Applicable**

**Current Implementation**:
- Redis job state persistence
- Job recovery on server restart
- State management (save, update, delete)

**Serverless Implications**:
- **Still needed** for job recovery
- Serverless workers can restart/scale, so job persistence is critical
- Redis persistence ensures jobs aren't lost during worker restarts
- Recovery mechanism still valuable

**Action Items**:
- [ ] Verify Redis persistence works with serverless endpoints
- [ ] Test job recovery with serverless worker restarts
- [ ] Update documentation for serverless context

---

### EP-041: Enhanced Error Handling and Retry Logic

**Status**: ✅ **Still Applicable**

**Current Implementation**:
- Exponential backoff retry logic
- Error categorization
- Health checks before retries
- Fallback strategies

**Serverless Implications**:
- **Still needed** for serverless reliability
- Cold starts may require longer timeouts
- Retry logic important for serverless failures
- Health checks may need adjustment for serverless endpoints

**Action Items**:
- [ ] Adjust retry timeouts for cold starts (~2 minutes)
- [ ] Update health check logic for serverless endpoints
- [ ] Test error handling with serverless failures
- [ ] Document serverless-specific error scenarios

---

## Migration Checklist

### Phase 1: Infrastructure Setup

- [ ] Create RunPod network volume (`ryla-models-shared`)
- [ ] Pre-load all required models on network volume
- [ ] Create serverless endpoints:
  - [ ] Image inference endpoint (ComfyUI worker)
  - [ ] LoRA training endpoint (AI Toolkit worker)
  - [ ] Special tasks endpoint (face swap, character sheets)
- [ ] Configure endpoints to use Secure Cloud
- [ ] Mount network volume to all endpoints
- [ ] Test endpoint connectivity

### Phase 2: Code Migration

- [ ] Update `ComfyUIPodClient` → `ComfyUIServerlessClient`
- [ ] Replace pod API calls with serverless endpoint calls
- [ ] Update `ComfyUIJobRunner` for serverless endpoints
- [ ] Update `ComfyUIJobRunnerAdapter` for serverless
- [ ] Review WebSocket support (EP-039)
- [ ] Verify Redis persistence (EP-040)
- [ ] Update error handling for cold starts (EP-041)
- [ ] Update retry logic for serverless timeouts

### Phase 3: Testing

- [ ] Test image generation with serverless endpoints
- [ ] Test LoRA training with serverless endpoints
- [ ] Test cold start handling
- [ ] Test job recovery with Redis persistence
- [ ] Test error handling and retries
- [ ] Load testing for traffic spikes
- [ ] Monitor cold start frequency

### Phase 4: Documentation

- [ ] Update ADR-003 status (superseded)
- [ ] Update ADR-006 with implementation details
- [ ] Update RunPod setup documentation
- [ ] Update ComfyUI integration documentation
- [ ] Document serverless endpoint configuration
- [ ] Document cold start mitigation strategies

---

## Key Considerations

### Cold Start Handling

**Problem**: Serverless cold starts can take up to ~2 minutes.

**Mitigation**:
- Use shared storage (network volumes) for models
- Pre-load models on network volume
- Consider warm workers (min workers > 0) for critical endpoints
- Implement proper timeout handling in client code

**Code Changes**:
- Update `ComfyUIPodClient` timeout for cold starts
- Add cold start detection and user messaging
- Implement progress tracking during cold start

### WebSocket Support

**Question**: Do RunPod serverless endpoints support WebSocket?

**Investigation Needed**:
- Check RunPod serverless WebSocket documentation
- Test WebSocket connection to serverless endpoints
- If not supported, use REST polling for progress

**Fallback**:
- REST polling for job status
- Progress updates via status polling
- May need to adjust polling frequency

### Redis Persistence

**Status**: Still needed and applicable.

**Why**:
- Serverless workers can restart/scale
- Jobs need to persist across worker restarts
- Recovery mechanism ensures no job loss

**No Changes Needed**:
- Current Redis persistence implementation works
- Just need to verify with serverless endpoints

---

## Cost Comparison

### Dedicated Pod (Current)

- RTX 4090: $0.69/hr
- 24/7 operation: ~$500/month
- **Plus**: Operational time (monitoring, restarts)

### Serverless (Target)

- Pay per request: ~$0.01-0.02 per image
- No idle costs
- Automatic scaling
- **Slightly higher per-request cost**, but:
  - No operational overhead
  - Better reliability
  - Automatic scaling

---

## Timeline

**Phase 1** (Infrastructure): 1-2 weeks
- Network volume setup
- Serverless endpoint creation
- Model pre-loading

**Phase 2** (Code Migration): 2-3 weeks
- Update client code
- Test with serverless endpoints
- Verify all features work

**Phase 3** (Testing): 1-2 weeks
- Comprehensive testing
- Load testing
- Monitoring setup

**Phase 4** (Documentation): 1 week
- Update all documentation
- Create migration guides

**Total**: 5-8 weeks

---

## Risks and Mitigations

### Risk 1: Cold Start User Experience

**Risk**: Users wait up to 2 minutes for cold start.

**Mitigation**:
- Use shared storage to minimize cold start time
- Implement proper timeout and messaging
- Consider warm workers for critical paths
- Show progress/status during cold start

### Risk 2: WebSocket Not Supported

**Risk**: Serverless endpoints may not support WebSocket.

**Mitigation**:
- Verify WebSocket support early
- Implement REST polling fallback
- Update EP-039 implementation if needed

### Risk 3: Cost Overruns

**Risk**: Serverless costs higher than expected.

**Mitigation**:
- Monitor usage patterns
- Optimize endpoint configuration
- Use Community Cloud for non-critical workloads
- Set up cost alerts

---

## Related Documentation

- [ADR-006: Use RunPod Serverless Over Dedicated Pods](../../decisions/ADR-006-runpod-serverless-over-dedicated-pods.md)
- [Maxim's Feedback: Serverless Strategy](./MAXIM-FEEDBACK-SERVERLESS.md)
- [EP-039: WebSocket Real-time Progress](../specs/epics/EP-039-websocket-realtime-progress-P5-tech-spec.md)
- [EP-040: Redis Job Persistence](../specs/epics/EP-040-redis-job-persistence-P5-tech-spec.md)
- [EP-041: Enhanced Error Handling](../specs/epics/EP-041-enhanced-error-handling-P5-tech-spec.md)

---

**Status**: ⏳ Planning - Migration to begin after infrastructure setup
