# ADR-003: Use Dedicated ComfyUI Pod Over Serverless for Image Generation

**Status**: Accepted  
**Date**: 2025-12-21  
**Deciders**: Development Team  
**Epic**: EP-005 (Content Studio)

## Context

We need to run AI image generation (Z-Image-Turbo, FLUX, future models) for the RYLA MVP. RunPod offers two deployment options:

1. **Serverless Endpoints**: Scale to zero, pay-per-use
2. **Dedicated Pods**: Always-on, fixed hourly rate

Initial implementation attempted serverless with custom Python handlers, but encountered:
- Complex model loading for Z-Image-Turbo's split-component architecture
- Worker crashes due to incorrect diffusers API usage
- 30-60 second cold starts breaking user experience

## Decision

**Use a dedicated ComfyUI pod for image generation instead of serverless endpoints.**

### Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   RYLA API      │────▶│  ComfyUI Pod         │────▶│  Network Volume │
│   (apps/api)    │     │  (always-on)         │     │  (shared models)│
└─────────────────┘     └──────────────────────┘     └─────────────────┘
        │                         │
        │  HTTP POST              │  Load models
        │  /prompt                │  from volume
        │                         │
        ▼                         ▼
   Workflow JSON ───────▶ ComfyUI processes ───────▶ Base64 image
```

### Key Points

1. **ComfyUI as the execution engine** — not custom Python handlers
2. **Any workflow works** — export from ComfyUI UI, send via API
3. **Single pod serves all models** — Z-Image, FLUX, future models
4. **Network volume shared** — same models for pod testing and future serverless overflow

## Rationale

### Why Not Serverless?

| Factor | Serverless | Dedicated Pod |
|--------|------------|---------------|
| Cold start | 30-60s ❌ | 0s ✅ |
| UX impact | Users wait, abandon ❌ | Instant response ✅ |
| Complexity | Custom handlers per model ❌ | ComfyUI handles all ✅ |
| Model loading | Must implement in Python ❌ | ComfyUI native ✅ |
| Workflow compat | Limited ❌ | Full ComfyUI ✅ |

### Why ComfyUI Over Custom Handlers?

1. **Community-maintained** — nodes for every model, updated frequently
2. **Visual workflow builder** — design in UI, export to API
3. **Complex pipelines** — face swap, LoRA, ControlNet work out of box
4. **No code changes** — new workflow = new JSON, no deployment

### Cost Analysis

```
Dedicated Pod (RTX 4090):
- $0.69/hr × 12 hrs/day = $8.28/day
- Monthly (12hr/day): ~$250/month
- Monthly (24hr/day): ~$500/month

For MVP validation:
- Acceptable cost for guaranteed UX
- Can optimize later with usage patterns
```

## Consequences

### Positive

- ✅ Zero cold starts — instant image generation
- ✅ Any ComfyUI workflow works via API
- ✅ Single codebase for all models
- ✅ Visual workflow development in ComfyUI UI
- ✅ Network volume shared with future serverless (if needed)

### Negative

- ❌ Fixed cost even during idle periods
- ❌ Manual pod management (start/stop)
- ❌ Single point of failure (one pod)

### Mitigations

1. **Idle cost**: Stop pod during off-hours, automate with scripts
2. **Management**: Add health checks, auto-restart on failure
3. **SPOF**: For production scale, add serverless overflow with warm workers

## Alternatives Considered

### 1. Serverless with Min Workers = 1

Keep one worker always warm to avoid cold starts.

**Rejected because**: Still requires custom handlers or ComfyUI worker image. Pod is simpler and we already have it running.

### 2. Custom Python Handlers (Diffusers)

Write Python handlers that load models directly.

**Rejected because**: 
- Z-Image-Turbo uses split-component architecture not well-supported by diffusers
- Requires reimplementing what ComfyUI already does
- New models require new handler code

### 3. Replicate/Modal/Other Platforms

Use managed inference platforms.

**Rejected because**:
- Less control over models and workflows
- Higher per-image cost at scale
- Vendor lock-in

## Implementation

### Phase 1: MVP (Now)

1. Use existing ComfyUI pod at `workspace/runpod-slim/ComfyUI`
2. Models on network volume (already configured)
3. RYLA API calls ComfyUI `/prompt` endpoint
4. Manual pod start/stop as needed

### Phase 2: Production Hardening

1. Health check endpoint in RYLA API
2. Auto-restart script for pod failures
3. Monitoring and alerting

### Phase 3: Scale (Future)

1. Add serverless overflow for traffic spikes
2. Use same network volume (symlink already configured)
3. ComfyUI worker image ready in GHCR

## Related Decisions

- ADR-001: RunPod as GPU infrastructure provider
- ADR-002: Network volume for model storage

## References

- [RunPod Pods vs Serverless](https://docs.runpod.io/)
- [ComfyUI API Documentation](https://github.com/comfyanonymous/ComfyUI)
- [worker-comfyui (for future serverless)](https://github.com/runpod-workers/worker-comfyui)
- [Z-Image Danrisi Workflow](/docs/research/youtube-videos/-u9VLMVwDXM/)

