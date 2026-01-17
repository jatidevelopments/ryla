# ADR-006: Use RunPod Serverless Over Dedicated Pods for ComfyUI

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Maxim (Technical Advisor), Development Team  
**Supersedes**: [ADR-003: Use Dedicated ComfyUI Pod Over Serverless](./ADR-003-comfyui-pod-over-serverless.md)  
**Epic**: EP-005 (Content Studio), EP-026 (LoRA Training), IN-007 (ComfyUI Infrastructure Improvements)

---

## Context

RYLA currently uses dedicated ComfyUI pods for image generation (per ADR-003). After production experience and feedback from Maxim, we've identified significant operational challenges with dedicated pod management:

### Problems with Dedicated Pods

1. **Manual Instance Management**
   - Exhausting and time-consuming manual pod start/stop
   - Constant monitoring required
   - No automatic scaling

2. **Reliability Issues**
   - Instances often fail unexpectedly
   - Run slower than expected
   - Community GPUs especially unreliable
   - Frequent unavailability

3. **Operational Overhead**
   - Constant firefighting: scaling, restarts, night alerts
   - Traffic spikes cause failures
   - Single point of failure
   - Requires 24/7 monitoring

4. **Cost vs. Value**
   - Fixed cost even during idle periods
   - Manual management time not accounted for
   - Operational burden outweighs cost savings

### Serverless Benefits

1. **Automatic Scaling**
   - Handles traffic spikes automatically
   - Scales up and down based on demand
   - No manual intervention needed

2. **Operational Simplicity**
   - Fewer operational headaches
   - No manual pod management
   - Automatic recovery from failures

3. **Cost Efficiency**
   - Pay only for what you use
   - No idle costs
   - Slightly higher per-request cost, but worth it for stability

4. **Cold Start Mitigation**
   - Cold starts can take up to ~2 minutes
   - **Mitigated via shared storage** (RunPod network volumes)
   - Models pre-loaded on shared storage, not re-downloaded

---

## Decision

**Use RunPod Serverless Endpoints for all ComfyUI workloads instead of dedicated pods.**

### Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   RYLA API      │────▶│  RunPod Serverless   │────▶│  Network Volume │
│   (apps/api)    │     │  Endpoints           │     │  (shared models)│
└─────────────────┘     └──────────────────────┘     └─────────────────┘
        │                         │
        │  HTTP POST              │  Load models
        │  /run                   │  from volume
        │                         │
        ▼                         ▼
   Workflow JSON ───────▶ ComfyUI Worker ───────▶ Base64 image
```

### Key Points

1. **Multiple Serverless Endpoints**
   - LoRA training endpoint
   - Image inference endpoint (different models)
   - Special task endpoints (face swap, character sheets, etc.)

2. **Shared Storage Strategy**
   - Use RunPod network volumes for model storage
   - Models pre-loaded on shared storage
   - **Avoid downloading from external storage/social platforms** (too slow)
   - Shared storage eliminates re-downloading on cold starts

3. **Cloud Selection**
   - **Secure Cloud** recommended (more reliable)
   - **Community Cloud** is cheaper but much less reliable
   - For production stability, use Secure Cloud

4. **Serverless from Day One**
   - Recommended for RYLA and similar products
   - Better long-term scalability
   - Reduces operational burden

---

## Rationale

### Why Serverless Over Dedicated Pods?

| Factor | Dedicated Pods | Serverless |
|--------|----------------|------------|
| **Operational Overhead** | High (manual management) ❌ | Low (automatic) ✅ |
| **Reliability** | Low (frequent failures) ❌ | High (auto-recovery) ✅ |
| **Scaling** | Manual ❌ | Automatic ✅ |
| **Cost (idle)** | Fixed cost always ❌ | Pay per use ✅ |
| **Cold Starts** | 0s ✅ | ~2 min (mitigated) ⚠️ |
| **Traffic Spikes** | Manual scaling ❌ | Auto-scaling ✅ |
| **Night Alerts** | Frequent ❌ | Rare ✅ |

### Cold Start Mitigation

**Problem**: Serverless cold starts can take up to ~2 minutes.

**Solution**: Use shared storage (RunPod network volumes)
- Models pre-loaded on network volume
- No re-downloading on cold start
- Significantly reduces cold start time
- Models persist across worker restarts

**Best Practice**: 
- ✅ Use RunPod network volumes for model storage
- ❌ Don't download from external storage/social platforms (too slow)

### Cost Analysis

**Dedicated Pod (RTX 4090)**:
- $0.69/hr × 24 hrs/day = $16.56/day
- Monthly: ~$500/month
- **Plus**: Operational time (monitoring, restarts, scaling)

**Serverless (RTX 4090)**:
- Pay per request: ~$0.01-0.02 per image
- No idle costs
- **Slightly higher per-request cost**, but:
  - No operational overhead
  - Automatic scaling
  - Better reliability
  - **Worth it for stability and time saved**

---

## Consequences

### Positive

- ✅ **Automatic Scaling**: Handles traffic spikes without manual intervention
- ✅ **Operational Simplicity**: No manual pod management
- ✅ **Better Reliability**: Auto-recovery from failures
- ✅ **Cost Efficiency**: Pay only for what you use
- ✅ **Multiple Endpoints**: Separate endpoints for different workloads
- ✅ **Shared Storage**: Models persist across workers

### Negative

- ❌ **Cold Starts**: Up to ~2 minutes (mitigated with shared storage)
- ❌ **Slightly Higher Cost**: Per-request cost higher than dedicated pod hourly rate
- ❌ **Less Control**: Can't manually restart/configure individual workers

### Mitigations

1. **Cold Starts**: 
   - Use RunPod network volumes for model storage
   - Pre-load models on shared storage
   - Consider warm workers for critical paths (future optimization)

2. **Cost**: 
   - Monitor usage patterns
   - Optimize endpoint configuration
   - Use Community Cloud for non-critical workloads (if acceptable reliability)

3. **Control**: 
   - Use RunPod API for monitoring
   - Implement health checks and retries
   - Add fallback mechanisms

---

## Implementation Plan

### Phase 1: Infrastructure Setup

1. **Create Network Volume**
   - Name: `ryla-models-shared`
   - Size: 200GB+ (for all models)
   - Data Center: US-OR-1 (or preferred location)
   - Pre-load all required models

2. **Create Serverless Endpoints**
   - **Image Generation Endpoint**: ComfyUI worker for image inference
   - **LoRA Training Endpoint**: AI Toolkit worker for LoRA training
   - **Special Tasks Endpoint**: Face swap, character sheets, etc.

3. **Configure Endpoints**
   - Use Secure Cloud (more reliable)
   - Mount network volume to all endpoints
   - Configure worker scaling (min 0, max based on expected load)

### Phase 2: Migration from Dedicated Pods

1. **Update ComfyUIJobRunner**
   - Replace pod client with serverless endpoint client
   - Update API calls to use serverless endpoints
   - Add retry logic for cold starts

2. **Update Workflow Execution**
   - Send workflows to serverless endpoints
   - Handle cold start delays gracefully
   - Implement progress tracking (if supported)

3. **Update Error Handling**
   - Handle serverless-specific errors
   - Implement retry logic with exponential backoff
   - Add monitoring and alerting

### Phase 3: Optimization

1. **Warm Workers** (if needed)
   - Configure min workers > 0 for critical endpoints
   - Balance cost vs. cold start time

2. **Monitoring**
   - Track cold start frequency
   - Monitor endpoint health
   - Alert on failures

3. **Cost Optimization**
   - Analyze usage patterns
   - Optimize endpoint configuration
   - Consider Community Cloud for non-critical workloads

---

## Alternatives Considered

### 1. Keep Dedicated Pods with Better Management

Add automation, monitoring, and auto-restart scripts.

**Rejected because**: 
- Still requires manual intervention
- Doesn't solve reliability issues
- Operational burden remains high
- Doesn't handle traffic spikes automatically

### 2. Hybrid Approach (Dedicated + Serverless)

Use dedicated pods for base load, serverless for overflow.

**Rejected because**:
- Adds complexity
- Still requires pod management
- Maxim's feedback: "Serverless from day one"

### 3. Other Platforms (Replicate, Modal, etc.)

Use managed inference platforms.

**Rejected because**:
- Less control over models and workflows
- Vendor lock-in
- Higher per-image cost at scale
- RunPod already integrated

---

## Related Decisions

- **Supersedes**: [ADR-003: Use Dedicated ComfyUI Pod Over Serverless](./ADR-003-comfyui-pod-over-serverless.md)
- **Related**: [ADR-001: Database Architecture](./ADR-001-database-architecture.md)
- **Related**: [IN-007: ComfyUI Infrastructure Improvements](../../initiatives/IN-007-comfyui-infrastructure-improvements.md)

---

## References

- [RunPod Serverless Documentation](https://docs.runpod.io/serverless)
- [RunPod Network Volumes](https://docs.runpod.io/serverless/network-volumes)
- [ComfyUI Worker Template](https://github.com/runpod-workers/worker-comfyui)
- Maxim's Feedback (2026-01-27 meeting)

---

## Notes

### Key Learnings from Maxim

1. **Manual instance management is exhausting, unreliable, and time-consuming**
2. **Instances often fail, run slower than expected, or are unavailable** (especially community GPUs)
3. **Constant firefighting**: scaling, restarts, night alerts, traffic spikes
4. **Serverless handles scaling automatically** (up/down), fewer operational headaches
5. **Slightly higher cost, but worth it for stability and time saved**
6. **Cold starts can take up to ~2 minutes, but mitigated via shared storage**
7. **Use shared storage to avoid re-downloading models on every cold start**
8. **Downloading from external storage/social platforms is too slow**
9. **Community cloud is cheaper but much less reliable than secure cloud**
10. **Serverless is recommended from day one for RYLA and similar products**
11. **Multiple serverless endpoints expected**: LoRA training, image inference for different models, special tasks

---

**Status**: ✅ Accepted - Migration to serverless recommended
