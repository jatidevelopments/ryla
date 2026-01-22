# EP-058: Modal.com MVP Model Implementation - Requirements

**Initiative**: [IN-020](./../../../initiatives/IN-020-modal-mvp-models.md)  
**Status**: P1 - Requirements  
**Created**: 2025-01-21  
**Last Updated**: 2025-01-21

---

## Problem Statement

RYLA MVP requires specific AI models (Flux Dev, InstantID, LoRA support) for scalable image generation, but these models are not yet implemented on Modal.com. Currently, we have test implementations (Flux Schnell, Wan2.1) and Z-Image-Turbo working, but we need the MVP-required models to enable the core Content Studio feature (EP-005). Without these models on Modal, we cannot provide serverless, scalable image generation as an alternative to RunPod infrastructure.

**Who has this problem**: 
- Infrastructure team needs scalable, cost-efficient model deployment
- Backend team needs API endpoints for image generation
- Product team needs MVP launch capability

**Why it matters**: 
- MVP launch depends on working image generation
- Serverless approach reduces costs vs persistent pods
- Provides infrastructure redundancy (Modal + RunPod)

---

## MVP Objective

Deploy Flux Dev, InstantID, and LoRA loading support on Modal.com as a unified serverless application, enabling scalable image generation with face consistency and character-specific models. All models must be accessible via API endpoints with <30s response time and >95% success rate.

**Measurable outcomes**:
- Flux Dev text-to-image generation working via API
- InstantID face consistency (85-90% match) working via API
- LoRA models loading and working with Flux Dev
- All models integrated into unified Modal app (`comfyui_ryla.py`)
- API endpoints documented and tested

---

## Non-Goals

**Explicitly out of scope for this epic**:
- Video generation (Wan2.1) - Phase 2+, already tested
- PuLID implementation - InstantID is preferred (already in codebase)
- IPAdapter FaceID - InstantID is preferred (already in codebase)
- Flux Inpaint - Optional P1 feature, defer if needed
- Model training on Modal - LoRA training happens on RunPod/AI Toolkit
- Frontend integration - Separate epic (EP-005)
- Production deployment - This is implementation, deployment is separate

---

## Business Metric

**Target Metrics**:
- [x] **C - Core Value**: Enables core image generation feature
- [x] **E - CAC**: Reduces infrastructure costs (serverless vs persistent)
- [x] **A - Activation**: Users can generate images immediately
- [ ] **B - Retention**: (Indirect - faster generation improves UX)
- [ ] **D - Conversion**: (Indirect - enables paid features)

**Primary Metric**: **C - Core Value**

---

## Hypothesis

When we deploy MVP-required models (Flux Dev, InstantID, LoRA) on Modal.com, we will enable scalable image generation, measured by:
- API endpoint success rate >95%
- Average generation time <30s
- Cost per generation <$0.50
- All MVP workflows working end-to-end

This validates that Modal.com is a viable serverless alternative to RunPod for MVP launch.

---

## Success Criteria

### Technical Success
- [ ] Flux Dev generates images successfully (100% success rate in testing)
- [ ] InstantID maintains 85-90% face consistency (validated vs reference images)
- [ ] LoRA models load and work with Flux Dev (100% load success rate)
- [ ] All models accessible via unified API endpoints
- [ ] Model persistence working (no re-downloads, volumes mounted correctly)
- [ ] API response time <30s per generation (average)

### Business Success
- [ ] MVP Content Studio (EP-005) can use Modal backend
- [ ] Cost per generation <$0.50 (pay-per-use model)
- [ ] Infrastructure redundancy achieved (Modal + RunPod)
- [ ] Documentation complete for API usage

---

## Constraints

- **Timeline**: Must complete before MVP launch (2 weeks target)
- **Model sizes**: ~42 GB for P0 models (Flux Dev + InstantID + LoRA support)
- **Cost**: Monitor Modal usage, stay within budget
- **GPU Requirements**: Optimize GPU allocation per model (see [GPU Requirements](../../specs/modal/GPU-REQUIREMENTS.md))
  - Flux Schnell: T4 ($0.59/hr) - 70% cost savings
  - Flux Dev: L40S ($1.95/hr) - Primary model, needs quality
  - InstantID: A10 ($1.10/hr) - 44% cost savings
  - LoRA: T4 ($0.59/hr) - 70% cost savings
  - Wan2.1: L40S ($1.95/hr) - Video needs memory
  - SeedVR2: A10 ($1.10/hr) - 44% cost savings
- **NSFW support**: Must support uncensored checkpoints (Flux Dev uncensored)
- **Compatibility**: Must work with existing codebase workflows
- **Serverless**: Must leverage Modal's auto-scaling (no persistent pods)

---

## Dependencies

### Required Before Start
- ✅ Modal.com account active
- ✅ HuggingFace access for model downloads
- ✅ Existing test implementations (Flux Schnell, Z-Image-Turbo) as reference
- ✅ InstantID workflow implementation in codebase (`libs/business/src/workflows/z-image-instantid.ts`)

### Blocks
- **EP-005 (Content Studio)**: Needs Modal models for generation
- **Future epics**: Any epic requiring image generation

### Blocked By
- None (can start immediately)

---

## Open Questions

### Technical Questions
- [x] What GPU type is optimal for Flux Dev on Modal? (L40S recommended - see [GPU Requirements](../../specs/modal/GPU-REQUIREMENTS.md))
- [ ] Can InstantID work for character sheet generation? (Test vs PuLID)
- [ ] How to handle LoRA model uploads to Modal volumes? (Manual vs automated)
- [ ] What's the optimal volume size for model storage?
- [ ] Test GPU requirements for each model (T4 for lightweight, A10 for medium, L40S for heavy)

### Business Questions
- [ ] What's the acceptable cost per generation? (Target: <$0.50)
- [ ] Should we implement PuLID as fallback if InstantID doesn't work for character sheets?
- [ ] When should we migrate from RunPod to Modal? (After MVP validation?)

### Process Questions
- [ ] How to handle model versioning on Modal?
- [ ] How to monitor Modal costs and usage?
- [ ] What's the rollback plan if Modal doesn't work?

---

---

## P2: Scoping

### Features

#### F1: Flux Dev Model Implementation
- Download Flux Dev models (diffusion, CLIP, T5, VAE)
- Create Flux Dev text-to-image workflow
- Support NSFW (uncensored checkpoint)
- Integrate into unified Modal app

#### F2: InstantID Face Consistency Implementation
- Install ComfyUI_InstantID custom node
- Download InstantID models (IP-Adapter, ControlNet, InsightFace)
- Create InstantID workflow endpoint
- Support face consistency generation (85-90% match)
- Test for character sheet generation (may replace PuLID)

#### F3: LoRA Loading Support
- Support LoRA models from Modal volume
- Create LoRA-enabled workflows (Flux Dev + LoRA)
- Support trigger words and strength control
- Test with user-trained LoRAs

#### F4: Unified Modal App Integration
- Integrate all models into `comfyui_ryla.py`
- Create unified API endpoints
- Support model persistence via volumes
- Document all endpoints

#### F5: Client Scripts & Documentation
- Create client scripts for all workflows
- Document API usage
- Create testing examples
- Update README with usage instructions

---

### User Stories

#### ST-058-001: As a developer, I want Flux Dev deployed on Modal

**Acceptance Criteria**:
- [ ] Flux Dev models downloaded to Modal volume (~20 GB)
- [ ] Flux Dev text-to-image workflow working
- [ ] API endpoint `/flux-dev` responding correctly
- [ ] Generates images with 100% success rate (10+ test samples)
- [ ] Supports NSFW (uncensored checkpoint)
- [ ] Response time <30s per generation

**Analytics AC**:
- [ ] Event `modal_flux_dev_generation_requested` fires on API call
- [ ] Event `modal_flux_dev_generation_completed` fires on success
- [ ] Event `modal_flux_dev_generation_failed` fires on error

---

#### ST-058-002: As a developer, I want InstantID deployed on Modal

**Acceptance Criteria**:
- [ ] ComfyUI_InstantID custom node installed
- [ ] InstantID models downloaded (~4 GB: IP-Adapter, ControlNet, InsightFace)
- [ ] InstantID workflow endpoint `/flux-instantid` working
- [ ] Face consistency 85-90% match (validated vs reference images)
- [ ] Works with Flux Dev and Z-Image-Turbo
- [ ] Response time <30s per generation

**Analytics AC**:
- [ ] Event `modal_instantid_generation_requested` fires on API call
- [ ] Event `modal_instantid_generation_completed` fires on success
- [ ] Event `modal_instantid_face_consistency_measured` fires with consistency score

---

#### ST-058-003: As a developer, I want LoRA loading working on Modal

**Acceptance Criteria**:
- [ ] LoRA models can be loaded from Modal volume
- [ ] LoRA-enabled workflow `/flux-lora` working
- [ ] Supports trigger words
- [ ] Supports LoRA strength control (0.0-1.0)
- [ ] Works with Flux Dev
- [ ] 100% LoRA load success rate (test with 5+ LoRAs)

**Analytics AC**:
- [ ] Event `modal_lora_loaded` fires on successful LoRA load
- [ ] Event `modal_lora_generation_completed` fires on success
- [ ] Event `modal_lora_load_failed` fires on error

---

#### ST-058-004: As a developer, I want all models integrated into unified Modal app

**Acceptance Criteria**:
- [ ] All models in single `comfyui_ryla.py` app
- [ ] Unified API endpoints working
- [ ] Model persistence via volumes (no re-downloads)
- [ ] All endpoints documented
- [ ] Client scripts working for all endpoints

**Analytics AC**:
- [ ] Event `modal_app_deployed` fires on deployment
- [ ] Event `modal_model_loaded` fires on model load (with model name)

---

#### ST-058-005: As a developer, I want comprehensive documentation and client scripts

**Acceptance Criteria**:
- [ ] README updated with all endpoints
- [ ] Client scripts created for all workflows
- [ ] Usage examples provided
- [ ] API documentation complete
- [ ] Testing instructions included

**Analytics AC**:
- [ ] N/A (documentation only)

---

### Non-MVP Items

**Explicitly out of scope**:
- Video generation (Wan2.1) - Phase 2+, already tested
- PuLID implementation - InstantID preferred
- IPAdapter FaceID - InstantID preferred
- Flux Inpaint - Optional P1, defer if needed
- Frontend integration - Separate epic (EP-005)
- Production deployment - Separate phase (P9)

---

## Next Steps

1. ✅ **P1: Requirements** - Complete
2. ✅ **P2: Scoping** - Complete
3. **P3: Architecture** - Design Modal app structure, API endpoints, model storage
4. **P4: UI Skeleton** - N/A (backend-only, but document API contracts)
5. **P5: Technical Spec** - Detailed implementation plan
6. **P6: Implementation** - Build Modal app with all models
7. **P7: Testing** - Test all workflows end-to-end
8. **P8: Integration** - Integrate with existing codebase
9. **P9: Deployment Prep** - Prepare for production deployment
10. **P10: Production Validation** - Validate in production environment

---

## References

- Initiative: `docs/initiatives/IN-020-modal-mvp-models.md`
- MVP Model Requirements: `apps/modal/MVP-MODEL-REQUIREMENTS.md`
- Face Consistency Alternatives: `apps/modal/FACE-CONSISTENCY-ALTERNATIVES.md`
- InstantID Workflow: `libs/business/src/workflows/z-image-instantid.ts`
- Existing Modal Tests: `apps/modal/comfyui_flux_test.py`, `apps/modal/comfyui_ryla.py`
- Content Studio Epic: `docs/requirements/epics/mvp/EP-005-content-studio.md`
