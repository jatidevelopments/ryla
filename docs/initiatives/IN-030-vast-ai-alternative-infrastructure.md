# [INITIATIVE] IN-030: Vast.ai Alternative Infrastructure Evaluation

**Status**: Proposed  
**Created**: 2026-01-27  
**Last Updated**: 2026-01-27  
**Owner**: Infrastructure Team  
**Stakeholders**: Infrastructure Team, Engineering Team

---

## Executive Summary

**One-sentence description**: Evaluate and implement Vast.ai as a cost-effective alternative to Modal.com/RunPod for ComfyUI serverless infrastructure, with focus on code reusability and deployment pattern compatibility.

**Business Impact**: **E-CAC** (Cost reduction ~20% cheaper than RunPod), **C-Core Value** (Maintain service quality), **B-Retention** (Reliability improvements)

---

## Why (Business Rationale)

### Problem Statement

RYLA currently uses Modal.com for ComfyUI serverless infrastructure (per ADR-007), which provides excellent Infrastructure as Code and developer experience. However, **Vast.ai offers ~20% cheaper GPU compute** while potentially supporting similar deployment patterns. We need to evaluate if:

1. **Cost savings** can be achieved without sacrificing reliability or DX
2. **Existing Modal deployment code** can be adapted/reused for Vast.ai
3. **Deployment patterns** are compatible (Python SDK, Infrastructure as Code)

### Current State

**Modal.com Setup**:
- ✅ Infrastructure as Code (Python-based, single file deployment)
- ✅ Native GitHub Actions integration (`modal deploy`)
- ✅ Persistent volumes for model storage
- ✅ Well-structured codebase (`apps/modal/` with handlers, utils, config)
- ✅ Deployment scripts and automation
- ⚠️ Cost: ~$1.50-2.00/hr for A10, ~$2.00-3.00/hr for A100

**Deployment Structure**:
```
apps/modal/
├── app.py              # Main Modal app
├── image.py            # Image build configuration
├── config.py           # Volumes, secrets, GPU config
├── handlers/           # Workflow handlers (flux, instantid, etc.)
├── utils/              # ComfyUI utilities
├── scripts/            # Deployment scripts
└── .github/workflows/  # GitHub Actions deployment
```

### Desired State

**Vast.ai Alternative**:
- ✅ Similar Infrastructure as Code approach (Python SDK)
- ✅ Code reusability (adapt existing Modal code structure)
- ✅ Cost savings (~20% cheaper than RunPod, potentially cheaper than Modal)
- ✅ Similar deployment automation (GitHub Actions compatible)
- ✅ Maintain reliability and developer experience

### Business Drivers

- **Revenue Impact**: Lower infrastructure costs improve unit economics
- **Cost Impact**: ~20% cost reduction on GPU compute (estimated $500-1000/month savings at scale)
- **Risk Mitigation**: Diversify infrastructure providers (reduce vendor lock-in)
- **Competitive Advantage**: Lower costs enable more competitive pricing or higher margins
- **User Experience**: Maintain service quality while reducing costs

---

## How (Approach & Strategy)

### Strategy

**Phase 1: Research & Compatibility Analysis**
- Research Vast.ai Python SDK and deployment patterns
- Compare with Modal.com deployment structure
- Identify code reusability opportunities
- Document compatibility gaps

**Phase 2: Proof of Concept**
- Create Vast.ai equivalent of one Modal workflow (e.g., Flux)
- Test deployment automation (GitHub Actions)
- Compare cost, reliability, and DX

**Phase 3: Migration Plan**
- If successful, create migration strategy
- Adapt existing Modal code structure for Vast.ai
- Maintain dual-platform support (Modal + Vast.ai)

### Key Principles

- **Code Reusability**: Maximize reuse of existing Modal code structure
- **Incremental Migration**: Test one workflow before full migration
- **Maintain Quality**: Don't sacrifice reliability for cost savings
- **Dual Support**: Keep Modal as fallback during evaluation

### Phases

1. **Phase 1: Research & Documentation** (Week 1)
   - Research Vast.ai Python SDK
   - Document deployment patterns
   - Compare with Modal structure
   - Identify code adaptation strategy

2. **Phase 2: Proof of Concept** (Week 2-3)
   - Create Vast.ai equivalent of `apps/modal/app.py`
   - Adapt one handler (e.g., Flux)
   - Test deployment and execution
   - Compare costs and reliability

3. **Phase 3: Evaluation & Decision** (Week 4)
   - Cost comparison (per 1000 images)
   - Reliability testing (100+ generations)
   - Developer experience evaluation
   - Decision: proceed or stick with Modal

4. **Phase 4: Migration (If Approved)** (Week 5-8)
   - Adapt all handlers for Vast.ai
   - Update deployment automation
   - Dual-platform support
   - Gradual migration

### Dependencies

- **IN-015**: ComfyUI Workflow-to-API Platform Evaluation (provides context)
- **ADR-007**: Use Modal.com Over RunPod (current decision)
- **EP-005**: Content Studio (uses ComfyUI infrastructure)

### Constraints

- **Must maintain**: Service quality and reliability
- **Must support**: All existing workflows (Flux, InstantID, LoRA, Wan2, SeedVR2)
- **Must preserve**: Developer experience and deployment automation
- **Budget**: Evaluation phase minimal cost, migration TBD

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-01-27
- **Target Completion**: 2026-03-15 (8 weeks)
- **Key Milestones**:
  - **Research Complete**: 2026-02-03 (Week 1)
  - **POC Complete**: 2026-02-17 (Week 3)
  - **Evaluation Complete**: 2026-02-24 (Week 4)
  - **Migration Decision**: 2026-02-24 (Week 4)
  - **Full Migration (if approved)**: 2026-03-15 (Week 8)

### Priority

**Priority Level**: **P1** (High - Cost optimization opportunity)

**Rationale**: 
- Significant cost savings potential (~20% cheaper)
- Low risk evaluation (can test without disrupting production)
- Aligns with MVP principles (cost optimization)

### Resource Requirements

- **Team**: Infrastructure Team (1-2 engineers)
- **Budget**: Evaluation phase ~$50-100 (testing costs), Migration TBD
- **External Dependencies**: Vast.ai account, API access

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Infrastructure Team  
**Role**: Infrastructure Engineering  
**Responsibilities**: 
- Research Vast.ai deployment patterns
- Create POC and evaluate compatibility
- Make migration recommendation

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Infrastructure Team | Engineering | High | Research, POC, evaluation |
| Engineering Team | Engineering | Medium | Code review, testing |
| Product Team | Product | Low | Cost impact validation |

### Teams Involved

- **Infrastructure Team**: Primary execution
- **Engineering Team**: Code review and testing support

### Communication Plan

- **Updates Frequency**: Weekly
- **Update Format**: Status updates in #mvp-ryla-dev
- **Audience**: Infrastructure Team, Engineering Team

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| **Code Reusability** | >70% of Modal code can be adapted | Code comparison analysis | Week 1 |
| **Cost Savings** | 15-20% cheaper than Modal | Cost per 1000 images comparison | Week 3 |
| **Reliability** | >95% success rate (same as Modal) | 100+ generation test | Week 3 |
| **Deployment Time** | <5 minutes (similar to Modal) | Deployment automation test | Week 3 |

### Business Metrics Impact

**Target Metric**: [x] E-CAC [x] C-Core Value [x] B-Retention

**Expected Impact**:
- **E-CAC**: -15-20% infrastructure costs (estimated $500-1000/month at scale)
- **C-Core Value**: Maintain service quality (no degradation)
- **B-Retention**: Maintain reliability (no increase in failures)

### Leading Indicators

- **Week 1**: Research complete, compatibility assessment done
- **Week 2**: POC deployment successful
- **Week 3**: Cost and reliability metrics collected

### Lagging Indicators

- **Cost savings realized** (if migration approved)
- **Service quality maintained** (no degradation)
- **Developer experience preserved** (similar DX to Modal)

---

## Definition of Done

### Initiative Complete When:

- [ ] Research complete (Vast.ai SDK, deployment patterns documented)
- [ ] Code compatibility assessment complete (reusability analysis)
- [ ] POC implemented and tested (one workflow working on Vast.ai)
- [ ] Cost comparison complete (per 1000 images)
- [ ] Reliability testing complete (100+ generations)
- [ ] Developer experience evaluated (DX comparison)
- [ ] Migration decision made (proceed or stick with Modal)
- [ ] Documentation updated (research findings, decision rationale)
- [ ] Stakeholders notified (decision communicated)

### Not Done Criteria

**This initiative is NOT done if:**
- [ ] Research incomplete (missing key information)
- [ ] POC not tested (no validation)
- [ ] Cost comparison missing (no data)
- [ ] Reliability testing incomplete (insufficient sample size)
- [ ] Decision not made (no clear recommendation)

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-005 | Content Studio | Active | `docs/requirements/epics/mvp/EP-005-content-studio.md` |
| EP-026 | LoRA Training | Proposed | `docs/requirements/epics/mvp/EP-026-lora-training.md` |

### Dependencies

- **Blocks**: None (evaluation only)
- **Blocked By**: None
- **Related Initiatives**: 
  - **IN-015**: ComfyUI Workflow-to-API Platform Evaluation (context)
  - **IN-020**: Modal.com MVP Model Implementation (current setup)

### Documentation

- [Modal vs Vast.ai Decision Guide](../../research/infrastructure/MODAL-VS-VAST-AI-DECISION-GUIDE.md) - **Key: When to use each platform**
- [Vast.ai vs Modal/RunPod Comparison](../../research/infrastructure/VAST-AI-VS-MODAL-RUNPOD-COMPARISON.md)
- [Vast.ai ComfyUI Custom Workflows Guide](../../research/infrastructure/VAST-AI-COMFYUI-CUSTOM-WORKFLOWS-GUIDE.md)
- [Vast.ai Code Reusability Analysis](../../research/infrastructure/VAST-AI-CODE-REUSABILITY-ANALYSIS.md) - **Key: Can we reuse Modal code?**
- [Modal vs RunPod Comparison](../../research/infrastructure/MODAL-VS-RUNPOD-COMPARISON.md)
- [ADR-007: Use Modal.com Over RunPod](../../decisions/ADR-007-modal-over-runpod.md)

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| **Vast.ai SDK incompatible with Modal patterns** | Medium | High | Research SDK thoroughly, create POC early |
| **Code reusability lower than expected** | Medium | Medium | Focus on structure reuse, adapt handlers |
| **Reliability issues** | Low | High | Test thoroughly, keep Modal as fallback |
| **Deployment automation gaps** | Medium | Medium | Research GitHub Actions compatibility early |
| **Cost savings not realized** | Low | Low | Verify pricing before migration |

---

## Progress Tracking

### Current Phase

**Phase**: Phase 1 - Research & Documentation  
**Status**: On Track

### Recent Updates

- **2026-01-27**: Initiative created, research phase started

### Next Steps

1. **Research Vast.ai Python SDK**:
   - Install SDK: `pip install vastai-sdk`
   - Review API documentation
   - Compare with Modal patterns

2. **Code Compatibility Analysis**:
   - Map Modal structure to Vast.ai equivalent
   - Identify reusable components
   - Document adaptation requirements

3. **Create POC**:
   - Adapt `apps/modal/app.py` structure for Vast.ai
   - Implement one handler (Flux)
   - Test deployment and execution

---

## Research Findings

### Vast.ai Python SDK

**Installation**:
```bash
pip install vastai-sdk
```

**Basic Usage**:
```python
from vastai_sdk import VastAI

vast_sdk = VastAI(api_key='YOUR_API_KEY')
```

**Key Capabilities**:
- ✅ Python SDK with type hints and IDE support
- ✅ Endpoint management (similar to Modal apps)
- ✅ Worker group management
- ✅ Instance management (launch, start, stop)
- ✅ CLI commands have Python SDK equivalents

### Deployment Pattern Comparison

**Modal.com**:
```python
import modal

app = modal.App(name="ryla-comfyui", image=image)

@app.cls(gpu="L40S", volumes={"/root/models": volume})
class ComfyUI:
    @modal.method()
    def generate_image(self, workflow_json):
        # Handler logic
        pass
```

**Vast.ai (Expected)**:
```python
from vastai_sdk import VastAI

vast_sdk = VastAI(api_key=API_KEY)

# Create endpoint
endpoint = vast_sdk.create_endpoint(
    name="ryla-comfyui",
    template="comfyui",  # Pre-built template
    # Or custom worker
)

# Deploy handler
def generate_image(workflow_json):
    # Handler logic (similar structure)
    pass
```

### Code Reusability Assessment

**Overall Reusability**: **~70%** (weighted average)

**Highly Reusable** (90%+):
- ✅ Handler logic (`handlers/flux.py`, `handlers/instantid.py`, etc.) - **95% reusable**
- ✅ ComfyUI utilities (`utils/comfyui.py`) - **90% reusable**
- ✅ Image utilities (`utils/image_utils.py`) - **100% reusable**
- ✅ Cost tracking (`utils/cost_tracker.py`) - **85% reusable**

**Adaptable** (50-70%):
- ⚠️ Main app structure (`app.py`) - **60% reusable** (different SDK patterns)
- ⚠️ Image build (`image.py`) - **50% reusable** (different container/image approach)
- ⚠️ Config (`config.py`) - **40% reusable** (different volume/secret management)

**Needs Rewrite** (<50%):
- ❌ Deployment scripts - **0% reusable** (different CLI)
- ❌ GitHub Actions workflow - **20% reusable** (different commands)

**See**: [Vast.ai Code Reusability Analysis](../../research/infrastructure/VAST-AI-CODE-REUSABILITY-ANALYSIS.md) for detailed breakdown.

### Compatibility Gaps

1. **Infrastructure as Code**:
   - Modal: Full Python-based IaC
   - Vast.ai: Python SDK available, but may need API calls for some operations

2. **Volumes/Storage**:
   - Modal: `modal.Volume` (persistent storage)
   - Vast.ai: Unknown (needs research)

3. **Secrets Management**:
   - Modal: `modal.Secret` (integrated)
   - Vast.ai: Unknown (needs research)

4. **GitHub Actions**:
   - Modal: Native `modal deploy` command
   - Vast.ai: Unknown (needs research)

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well

[To be documented]

### What Could Be Improved

[To be documented]

### Recommendations for Future Initiatives

[To be documented]

---

## References

- [Vast.ai Python SDK Documentation](https://docs.vast.ai/api-reference/python-sdk-usage)
- [Vast.ai Serverless Documentation](https://docs.vast.ai/documentation/serverless)
- [Vast.ai ComfyUI Template](https://docs.vast.ai/serverless/comfy-ui)
- [Vast.ai vs Modal/RunPod Comparison](../../research/infrastructure/VAST-AI-VS-MODAL-RUNPOD-COMPARISON.md)
- [Vast.ai ComfyUI Custom Workflows Guide](../../research/infrastructure/VAST-AI-COMFYUI-CUSTOM-WORKFLOWS-GUIDE.md)
- [Modal.com Deployment Documentation](../../ops/deployment/modal/README.md)
- [ADR-007: Use Modal.com Over RunPod](../../decisions/ADR-007-modal-over-runpod.md)
- [IN-015: ComfyUI Workflow-to-API Platform Evaluation](./IN-015-comfyui-workflow-api-alternatives.md)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-27
