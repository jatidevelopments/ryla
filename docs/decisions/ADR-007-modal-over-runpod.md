# ADR-007: Use Modal.com Over RunPod for ComfyUI Serverless Infrastructure

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Infrastructure Team, Development Team  
**Supersedes**: [ADR-006: Use RunPod Serverless Over Dedicated Pods](./ADR-006-runpod-serverless-over-dedicated-pods.md)  
**Epic**: EP-005 (Content Studio), EP-026 (LoRA Training), IN-015 (ComfyUI Workflow-to-API Platform Evaluation)

---

## Context

RYLA migrated from dedicated pods to RunPod serverless endpoints (per ADR-006) to address operational overhead and reliability issues. However, after production experience, RunPod serverless has introduced new critical problems that are blocking production workflows:

### Critical Problems with RunPod Serverless

1. **Frequent Worker Crashes**
   - Workers crash frequently, requiring constant resetting and manual intervention
   - Jobs fail unexpectedly without clear error messages
   - No automatic recovery from crashes
   - Production workflows blocked by unreliable infrastructure

2. **Workers Not Spinning Up**
   - Jobs stuck in `IN_QUEUE` state indefinitely
   - Workers fail to start on demand (even with `minWorkers=0`)
   - Endpoint accessible but workers unavailable
   - Critical blocker: Endpoint `pwqwwai0hlhtw9` experiencing persistent worker spin-up failures

3. **Complex Setup & Deployment**
   - Requires manual Docker image creation, endpoint configuration, network volume management
   - Multiple files to manage: Dockerfiles, handler scripts, requirements.txt, templates
   - Endpoint configuration separate from code (UI-based)
   - Network volume attachment requires manual steps
   - New workflows require 2-4 hours of setup time

4. **No Native GitHub Actions Integration**
   - Requires custom scripts or MCP server for CI/CD
   - No `modal deploy` equivalent - must build Docker images, push to registry, update endpoints manually
   - Deployment process not version-controlled
   - High engineering time spent on infrastructure vs. product features

5. **Poor MCP/AI Agent Integration**
   - RunPod setup is "frustrating for AI agents to configure end-to-end"
   - Complex API structure makes automation difficult
   - Requires deep infrastructure knowledge
   - Not suitable for AI agent-driven development workflows

6. **Operational Overhead**
   - Constant troubleshooting of worker issues
   - Manual endpoint management and monitoring
   - Cold start issues requiring manual intervention
   - High engineering time on infrastructure maintenance

7. **Reliability Issues Blocking Production**
   - Current endpoint experiencing persistent failures
   - Testing framework (EP-044) complete but cannot validate workflows due to endpoint unavailability
   - Production launch blocked by infrastructure reliability

### Research & Evaluation

**IN-015: ComfyUI Workflow-to-API Platform Evaluation** was initiated to evaluate alternatives:
- Tested RunComfy, ViewComfy, Modal, Baseten, and other cloud hosting solutions
- Comprehensive cost analysis, reliability testing, and developer experience evaluation
- **Modal.com emerged as the best long-term solution** for RYLA's needs

---

## Decision

**Migrate all ComfyUI serverless infrastructure from RunPod to Modal.com.**

### Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   RYLA API      │────▶│  Modal.com Functions  │────▶│  Modal Volume   │
│   (apps/api)    │     │  (FastAPI Endpoints) │     │  (shared models)│
└─────────────────┘     └──────────────────────┘     └─────────────────┘
        │                         │
        │  HTTP POST              │  Load models
        │  /workflow              │  from volume
        │                         │
        ▼                         ▼
   Workflow JSON ───────▶ ComfyUI Function ───────▶ Base64 image
```

### Key Points

1. **Infrastructure as Code**
   - Single Python file (`apps/modal/comfyui_ryla.py`) defines entire infrastructure
   - Version controlled in repository
   - Easy to review, test, and modify
   - No separate Dockerfiles, templates, or endpoint configurations

2. **Native GitHub Actions Integration**
   - `modal deploy` command for one-command deployment
   - Automatic deployments on push to main branch
   - No custom scripts or MCP server needed
   - CI/CD pipeline simplified

3. **Persistent Storage**
   - `modal.Volume` for model storage (equivalent to RunPod network volumes)
   - Volume operations via Python API (upload/download models programmatically)
   - No manual UI steps required
   - Models persist across function invocations

4. **Better Developer Experience**
   - Test functions locally with `modal run`
   - Better debugging experience
   - Standard REST API (MCP/AI agent ready)
   - Focus on workflows, not infrastructure

5. **Improved Reliability**
   - More reliable worker spin-up
   - Better error handling and recovery
   - Automatic scaling (scale-to-zero)
   - Production-ready infrastructure

---

## Rationale

### Why Modal Over RunPod?

| Factor | RunPod Serverless | Modal.com |
|--------|------------------|-----------|
| **Worker Reliability** | ❌ Frequent crashes, workers not spinning up | ✅ Reliable worker spin-up |
| **Setup Complexity** | ❌ High (Dockerfiles, templates, endpoints) | ✅ Low (single Python file) |
| **GitHub Actions** | ❌ Custom scripts/MCP required | ✅ Native (`modal deploy`) |
| **Infrastructure as Code** | ⚠️ Partial (Dockerfiles, but UI config) | ✅ Full (Python, version controlled) |
| **Developer Experience** | ❌ Complex, high learning curve | ✅ Simple, Python-based |
| **MCP/AI Agent Integration** | ❌ Frustrating, complex API | ✅ Standard REST API |
| **Deployment Time** | ❌ 2-4 hours per workflow | ✅ < 5 minutes per workflow |
| **Operational Overhead** | ❌ High (constant troubleshooting) | ✅ Low (automated) |
| **Cost** | $ (cheapest per execution) | $–$$ (slightly more, but worth it) |
| **Volume Storage** | ⚠️ Separate charge (~$14/month for 200GB) | ✅ Included (no separate charge) |

### Cost Analysis

**RunPod (Current)**:
- Network Volume: ~$0.07/GB/month (200GB = ~$14/month)
- GPU Time: RTX 4090 ~$0.25-0.4/hr, A100 ~$1.8/hr
- Per Image (SDXL): 
  - RTX 3090/4090: $0.0006-0.0016 (cheapest option)
  - A100: $0.001-0.002
- **Plus**: High operational overhead (engineering time)

**Modal.com**:
- Volume Storage: Included (no separate charge)
- GPU Time: A10 ~$1.50-2.00/hr, A100 ~$2.00-3.00/hr
- Per Image (SDXL): 
  - A10: $0.002-0.004
  - A100: ~$0.001-0.002 (similar to RunPod A100)
- **But**: Lower operational overhead, better reliability, faster deployment

**Cost Comparison**:
- **RunPod RTX 3090/4090 vs Modal A10**: Modal is ~2-3x more expensive per image
- **RunPod A100 vs Modal A100**: Modal is similar or slightly more expensive (~1-2x)
- **However**: RunPod requires $14/month for volume storage (200GB), Modal includes it
- **Total Cost**: When including volume storage, Modal A100 is competitive with RunPod A100

**Verdict**: Modal's A100 pricing is competitive with RunPod A100 when accounting for included volume storage. Modal A10 is more expensive than RunPod's cheapest RTX option, but:
- ✅ No separate volume storage cost ($14/month savings)
- ✅ Better developer experience (saves engineering time)
- ✅ Native GitHub Actions (no custom scripts)
- ✅ More reliable (fewer production incidents)
- ✅ Faster workflow deployment (hours → minutes)

**Total Cost of Ownership**: Modal is more cost-effective when accounting for engineering time saved and included volume storage.

### Reliability Comparison

**RunPod Issues**:
- Workers crash frequently
- Workers not spinning up (jobs stuck in queue)
- Endpoint `pwqwwai0hlhtw9` experiencing persistent failures
- Blocking production workflows
- Testing framework complete but cannot validate due to endpoint unavailability

**Modal Benefits**:
- More reliable worker spin-up
- Better error handling
- Automatic recovery from failures
- Production-ready infrastructure
- Standard REST API for better integration

---

## Consequences

### Positive

- ✅ **Infrastructure as Code**: Single Python file, version controlled, easy to review
- ✅ **Native GitHub Actions**: One-command deployment, automatic CI/CD
- ✅ **Better Reliability**: More reliable worker spin-up, fewer crashes
- ✅ **Faster Deployment**: New workflows deployable in minutes, not hours
- ✅ **Better Developer Experience**: Focus on workflows, not infrastructure
- ✅ **MCP/AI Agent Ready**: Standard REST API, easy automation
- ✅ **Lower Operational Overhead**: Less time on infrastructure, more on product features
- ✅ **Volume Storage Included**: No separate storage costs
- ✅ **Local Testing**: Test functions locally before deploying

### Negative

- ❌ **Slightly Higher Cost**: ~2-3x more expensive per execution
- ❌ **Learning Curve**: Need to learn Modal Python API (but simpler than RunPod)
- ❌ **Migration Effort**: Must migrate existing workflows and update API integration
- ❌ **Platform Lock-in**: Moving to Modal-specific infrastructure

### Risks

- **Migration Complexity** → Mitigation: Incremental migration, test each workflow before full cutover
- **Cost Overruns** → Mitigation: Monitor usage closely, optimize function configurations
- **Learning Curve** → Mitigation: Modal Python API is simpler than RunPod Docker setup
- **Platform Lock-in** → Mitigation: Modal uses standard REST APIs, easier to migrate if needed

---

## Implementation Plan

### Phase 1: Modal Infrastructure Setup (Week 1)

1. **Create Modal App**
   - Set up `apps/modal/comfyui_ryla.py` with unified workflow endpoint
   - Define Modal image with ComfyUI and custom nodes
   - Configure `modal.Volume` for model storage

2. **Upload Models to Volume**
   - Migrate models from RunPod network volume to Modal volume
   - Verify all models accessible

3. **Set Up GitHub Actions**
   - Create `.github/workflows/deploy-modal.yml`
   - Configure `MODAL_TOKEN_ID` and `MODAL_TOKEN_SECRET` secrets
   - Test automatic deployment

### Phase 2: API Integration Update (Week 1-2)

1. **Update ComfyUI Service**
   - Replace RunPod API calls with Modal API calls
   - Update endpoint URLs and authentication
   - Test with existing workflows

2. **Update Workflow Execution**
   - Modify `ComfyUIJobRunner` to use Modal endpoints
   - Update error handling for Modal-specific errors
   - Implement retry logic

### Phase 3: Workflow Migration (Week 2-3)

1. **Migrate Core Workflows**
   - Flux Schnell (text-to-image)
   - Z-Image-Turbo Danrisi (text-to-image with custom nodes)
   - Wan2.1 (text-to-video)

2. **Validate Each Workflow**
   - Test with real workflows
   - Verify image/video generation works
   - Performance benchmarking

### Phase 4: Deprecate RunPod (Week 3-4)

1. **Update Documentation**
   - Mark RunPod setup as deprecated
   - Update all references to Modal
   - Create migration guide

2. **Remove RunPod Infrastructure**
   - Archive RunPod endpoints
   - Remove RunPod-specific code
   - Clean up unused files

---

## Alternatives Considered

### 1. Fix RunPod Issues

Continue with RunPod but invest in fixing worker reliability and setup complexity.

**Rejected because**:
- Workers not spinning up is a platform-level issue, not easily fixable
- Complex setup requires significant engineering time to improve
- No native GitHub Actions integration (requires custom solutions)
- Poor MCP/AI agent integration (architectural limitation)
- Operational overhead remains high even with fixes

### 2. Use RunComfy or ViewComfy

Use turnkey ComfyUI hosting platforms for faster deployment.

**Rejected because**:
- Less control over infrastructure
- Vendor lock-in to proprietary platforms
- May not support all custom nodes/models
- Modal provides better long-term flexibility

### 3. Hybrid Approach (RunPod + Modal)

Use RunPod for some workflows, Modal for others.

**Rejected because**:
- Adds complexity (managing two platforms)
- Doesn't solve RunPod reliability issues
- Higher operational overhead
- Better to standardize on one platform

### 4. Other Cloud Hosting (AWS SageMaker, GCP Vertex AI)

Use enterprise cloud platforms for ComfyUI.

**Rejected because**:
- Much higher setup complexity (very high learning curve)
- More expensive
- Overkill for RYLA's needs
- Modal provides better developer experience

---

## Related Decisions

- **Supersedes**: [ADR-006: Use RunPod Serverless Over Dedicated Pods](./ADR-006-runpod-serverless-over-dedicated-pods.md)
- **Related**: [ADR-003: Use Dedicated ComfyUI Pod Over Serverless](./ADR-003-comfyui-pod-over-serverless.md) (superseded by ADR-006, now superseded by this)
- **Related**: [IN-015: ComfyUI Workflow-to-API Platform Evaluation](../../initiatives/IN-015-comfyui-workflow-api-alternatives.md)
- **Related**: [IN-019: Automated ComfyUI Workflow Analyzer](../../initiatives/IN-019-automated-workflow-analyzer.md)

---

## References

- [Modal vs RunPod Comparison](../../research/infrastructure/MODAL-VS-RUNPOD-COMPARISON.md)
- [Modal Documentation](https://modal.com/docs)
- [Modal Volumes](https://modal.com/docs/guide/volumes)
- [Modal GitHub Actions](https://modal.com/docs/guide/examples/github-actions)
- [IN-015: ComfyUI Workflow-to-API Platform Evaluation](../../initiatives/IN-015-comfyui-workflow-api-alternatives.md)
- [Current RunPod Work Status](../../ops/runpod/CURRENT-WORK-STATUS.md)
- [RunPod Endpoint Worker Fix Guide](../../ops/runpod/ENDPOINT-WORKER-FIX-GUIDE.md)

---

## Notes

### Key Learnings from RunPod Experience

1. **Worker Reliability is Critical**: Frequent crashes and workers not spinning up blocked production
2. **Setup Complexity Matters**: 2-4 hours per workflow is too slow for rapid iteration
3. **Infrastructure as Code is Essential**: Version-controlled infrastructure is easier to manage
4. **Native CI/CD Integration Saves Time**: Custom scripts add complexity and maintenance burden
5. **Developer Experience Impacts Velocity**: Time spent on infrastructure is time not spent on product features
6. **MCP/AI Agent Integration is Important**: Standard REST APIs enable automation and AI agent workflows
7. **Total Cost of Ownership**: Slightly higher per-execution cost is worth it for better reliability and lower operational overhead

### Migration Checklist

- [ ] Create Modal app with unified workflow endpoint
- [ ] Migrate models from RunPod volume to Modal volume
- [ ] Set up GitHub Actions for automatic deployment
- [ ] Update API integration to use Modal endpoints
- [ ] Migrate core workflows (Flux, Z-Image, Wan2.1)
- [ ] Validate all workflows work correctly
- [ ] Update documentation and mark RunPod as deprecated
- [ ] Archive RunPod endpoints and clean up code

---

**Status**: ✅ Accepted - Migration to Modal.com approved
