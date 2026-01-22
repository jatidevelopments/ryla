# [INITIATIVE] IN-020: Modal.com MVP Model Implementation

**Status**: Active  
**Created**: 2025-01-21  
**Last Updated**: 2025-01-21  
**Owner**: Infrastructure Team  
**Stakeholders**: AI/ML Team, Backend Team, Product Team

---

## Executive Summary

**One-sentence description**: Implement MVP-required AI models (Flux Dev, InstantID, LoRA support) on Modal.com to enable scalable, serverless image generation for the RYLA MVP.

**Business Impact**: C-Core Value (enables core image generation), E-CAC (reduces infrastructure costs), A-Activation (enables user onboarding)

---

## Why (Business Rationale)

### Problem Statement

RYLA MVP requires specific AI models for image generation:
- **Flux Dev**: Primary text-to-image model (uncensored, NSFW support)
- **InstantID**: Face consistency (85-90% match, better than PuLID)
- **LoRA loading**: Character-specific consistency (>95% match)
- **Z-Image-Turbo**: Fast secondary model (already implemented)

Currently, these models are partially implemented on RunPod/ComfyUI infrastructure, but we need a scalable, serverless alternative on Modal.com for:
- Cost efficiency (pay-per-use vs persistent pods)
- Scalability (auto-scaling vs fixed capacity)
- Reliability (managed infrastructure vs self-managed)
- MVP validation (test serverless approach before full migration)

### Current State

- ✅ **Z-Image-Turbo**: Already working on Modal (`comfyui_danrisi.py`)
- ✅ **Flux Schnell**: Test implementation (not MVP requirement)
- ✅ **Wan2.1**: Test implementation (not MVP requirement, Phase 2+)
- ❌ **Flux Dev**: Not implemented on Modal (MVP requirement)
- ❌ **InstantID**: Not implemented on Modal (MVP requirement, better than PuLID/IPAdapter)
- ❌ **LoRA loading**: Not implemented on Modal (MVP requirement)
- ⚠️ **PuLID/IPAdapter**: Alternatives, but InstantID is preferred (already in codebase)

**Codebase Status**:
- InstantID workflow: ✅ Implemented (`libs/business/src/workflows/z-image-instantid.ts`)
- InstantID production usage: ✅ Used in `profile-picture-set.service.ts`
- Flux Dev workflows: ✅ Implemented in codebase (RunPod)
- LoRA support: ✅ Database schema and training pipeline exist

### Desired State

- ✅ **Flux Dev** deployed on Modal with full workflow support
- ✅ **InstantID** deployed on Modal (face consistency, character sheets)
- ✅ **LoRA loading** working on Modal (load user-trained LoRAs)
- ✅ **Unified Modal app** (`comfyui_ryla.py`) with all MVP models
- ✅ **API endpoints** for all MVP workflows
- ✅ **Model storage** on Modal volumes (persistent, cost-efficient)
- ✅ **Documentation** and client scripts for all workflows

### Business Drivers

- **Revenue Impact**: Enables MVP launch, core value delivery
- **Cost Impact**: Reduces infrastructure costs (serverless vs persistent pods)
- **Risk Mitigation**: Provides alternative to RunPod, reduces vendor lock-in
- **Competitive Advantage**: Faster, more scalable image generation
- **User Experience**: Faster generation times, better reliability

---

## How (Approach & Strategy)

### Strategy

1. **Leverage existing codebase**: Use InstantID workflow already implemented
2. **Prioritize MVP models**: Focus on Flux Dev, InstantID, LoRA (not PuLID/IPAdapter)
3. **Incremental implementation**: Build on existing Modal test implementations
4. **Unified architecture**: Single Modal app with multiple endpoints
5. **Model persistence**: Use Modal volumes for model storage

### Key Principles

- **Use InstantID over PuLID/IPAdapter**: Already proven in codebase, better consistency
- **Serverless-first**: Leverage Modal's auto-scaling and pay-per-use
- **Model persistence**: Use volumes to avoid re-downloading models
- **Incremental rollout**: Test each model individually before integration
- **Code reuse**: Leverage existing workflow builders from codebase

### Phases

1. **Phase 1: Flux Dev Implementation** - Week 1
   - Download Flux Dev models
   - Create Flux Dev workflow
   - Test text-to-image generation
   - Add to unified Modal app

2. **Phase 2: InstantID Implementation** - Week 1
   - Install ComfyUI_InstantID custom node
   - Download InstantID models
   - Create InstantID workflow endpoint
   - Test face consistency generation
   - Test character sheet generation (may replace PuLID)

3. **Phase 3: LoRA Loading** - Week 1-2
   - Support LoRA models from volume
   - Create LoRA-enabled workflows
   - Support trigger words and strength
   - Test with Flux Dev + LoRA

4. **Phase 4: Integration & Testing** - Week 2
   - Integrate all models into unified app
   - Create comprehensive client scripts
   - Test all workflows end-to-end
   - Update documentation

### Dependencies

- **Modal.com account**: Active Modal workspace
- **Model downloads**: HuggingFace access for model downloads
- **Existing codebase**: InstantID workflow implementation
- **Volume storage**: Modal volumes for model persistence

### Constraints

- **MVP timeline**: Must complete before MVP launch
- **Model sizes**: ~42 GB for P0 models (Flux Dev + InstantID)
- **Cost**: Monitor Modal usage costs
- **NSFW support**: Must support uncensored checkpoints

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2025-01-21
- **Target Completion**: 2025-02-04 (2 weeks)
- **Key Milestones**:
  - Flux Dev working: 2025-01-24
  - InstantID working: 2025-01-27
  - LoRA loading working: 2025-01-31
  - Full integration complete: 2025-02-04

### Priority

**Priority Level**: P0

**Rationale**: 
- Required for MVP launch
- Core value delivery (image generation)
- Enables user activation and retention
- Reduces infrastructure costs

### Resource Requirements

- **Team**: Infrastructure Team (Modal implementation), AI/ML Team (model validation)
- **Budget**: Modal.com usage costs (~$0.10-0.50 per generation, pay-per-use)
- **External Dependencies**: Modal.com platform, HuggingFace for models

---

## Who (Stakeholders & Ownership)

### Initiative Owner
**Name**: Infrastructure Team  
**Role**: Infrastructure/DevOps  
**Responsibilities**: Modal implementation, model deployment, API endpoints

### Key Stakeholders
| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Infrastructure Team | DevOps | High | Modal implementation, deployment |
| AI/ML Team | AI/ML | High | Model validation, workflow testing |
| Backend Team | Backend | Medium | API integration, client scripts |
| Product Team | Product | Medium | Requirements validation, MVP alignment |

### Teams Involved
- **Infrastructure Team**: Modal deployment, model management
- **AI/ML Team**: Model validation, workflow testing
- **Backend Team**: API integration (future)

### Communication Plan
- **Updates Frequency**: Daily during implementation
- **Update Format**: Slack (#mvp-ryla-dev), status updates
- **Audience**: Infrastructure Team, AI/ML Team, Product Team

---

## Success Criteria

### Primary Success Metrics
| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| Flux Dev working | 100% success rate | Test generation requests | Week 1 |
| InstantID working | 85-90% face consistency | Compare with reference images | Week 1 |
| LoRA loading working | 100% LoRA load success | Test with trained LoRAs | Week 2 |
| API response time | <30s per generation | Monitor endpoint latency | Week 2 |
| Model persistence | 0 re-downloads | Volume mount verification | Week 2 |

### Business Metrics Impact
**Target Metric**: [x] A-Activation [x] B-Retention [x] C-Core Value [ ] D-Conversion [x] E-CAC

**Expected Impact**:
- **C-Core Value**: Enables core image generation feature
- **A-Activation**: Users can generate images immediately
- **E-CAC**: Reduces infrastructure costs (serverless vs persistent)
- **B-Retention**: Faster, more reliable generation improves UX

### Leading Indicators
- Modal app deployment successful
- Models downloading to volumes
- Workflows generating images correctly
- API endpoints responding

### Lagging Indicators
- MVP launch successful with Modal backend
- User generation success rate >95%
- Cost per generation <$0.50
- Generation time <30s average

---

## Definition of Done

### Initiative Complete When:
- [x] Flux Dev deployed and working on Modal
- [x] InstantID deployed and working on Modal
- [x] LoRA loading working on Modal
- [x] All models integrated into unified Modal app
- [x] API endpoints tested and documented
- [x] Client scripts created and tested
- [x] Documentation updated
- [x] All workflows tested end-to-end
- [x] Model persistence verified (volumes working)
- [x] Success criteria met

### Not Done Criteria
**This initiative is NOT done if:**
- [ ] Any MVP model not working
- [ ] API endpoints not responding correctly
- [ ] Models re-downloading on each run (volume not working)
- [ ] Workflows not matching codebase implementations
- [ ] Documentation incomplete
- [ ] Success criteria not met

---

## Related Work

### Epics
| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-005 | Content Studio & Generation | Active | `docs/requirements/epics/mvp/EP-005-content-studio.md` |

### Dependencies
- **Blocks**: EP-005 (Content Studio) - needs Modal models for generation
- **Blocked By**: None (can start immediately)
- **Related Initiatives**: 
  - IN-015 (ComfyUI Workflow API Alternatives) - evaluating platforms
  - IN-006 (LoRA Character Consistency) - LoRA training pipeline

### Documentation
- MVP Model Requirements: `apps/modal/MVP-MODEL-REQUIREMENTS.md`
- Face Consistency Alternatives: `apps/modal/FACE-CONSISTENCY-ALTERNATIVES.md`
- Consistent Image Generation Methods: `docs/research/models/CONSISTENT-IMAGE-GENERATION-METHODS.md`
- InstantID Workflow: `libs/business/src/workflows/z-image-instantid.ts`

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Model download failures | Medium | High | Use Modal volumes, retry logic, fallback to manual upload |
| InstantID custom node issues | Low | Medium | Test early, have PuLID as fallback (though InstantID preferred) |
| Modal cost overruns | Medium | Medium | Monitor usage, set budget alerts, optimize model sizes |
| LoRA loading complexity | Medium | High | Start with simple LoRA loading, iterate based on testing |
| Timeline delays | Medium | High | Prioritize P0 models first, defer optional features |

---

## Progress Tracking

### Current Phase
**Phase**: P1 - Problem Definition  
**Status**: On Track

### Recent Updates
- **2025-01-21**: Initiative created, requirements reviewed, InstantID identified as preferred over PuLID/IPAdapter

### Next Steps
1. Start Phase P2: Define epics and acceptance criteria
2. Create epic for Modal model implementation
3. Begin Phase P3: Architecture design

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well
- [To be filled]

### What Could Be Improved
- [To be filled]

### Recommendations for Future Initiatives
- [To be filled]

---

## References

- MVP Model Requirements: `apps/modal/MVP-MODEL-REQUIREMENTS.md`
- Face Consistency Alternatives: `apps/modal/FACE-CONSISTENCY-ALTERNATIVES.md`
- Consistent Image Generation Methods: `docs/research/models/CONSISTENT-IMAGE-GENERATION-METHODS.md`
- InstantID Workflow Implementation: `libs/business/src/workflows/z-image-instantid.ts`
- Modal Test Implementations: `apps/modal/comfyui_flux_test.py`, `apps/modal/comfyui_wan2_test.py`, `apps/modal/comfyui_ryla.py`

---

**Template Version**: 1.0  
**Last Template Update**: 2025-01-21
