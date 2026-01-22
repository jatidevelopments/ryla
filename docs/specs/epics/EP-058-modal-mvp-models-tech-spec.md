# EP-058: Modal.com MVP Model Implementation - Technical Spec

**Initiative**: [IN-020](../../initiatives/IN-020-modal-mvp-models.md)  
**Epic**: [EP-058](../../requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md)  
**Status**: P5 - Technical Spec  
**Created**: 2025-01-21

---

## Scope (MVP)

- Flux Dev model deployment on Modal
- InstantID face consistency implementation
- LoRA loading support
- Unified Modal app with all endpoints
- Client scripts for all workflows
- Documentation and testing

**Out of scope (MVP)**:
- Frontend integration (separate epic EP-005)
- Production deployment (P9)
- Model training on Modal (happens on RunPod/AI Toolkit)
- PuLID/IPAdapter (InstantID preferred)

---

## File Plan

### Modal App (apps/modal)

#### Core App File

- **Update** `apps/modal/comfyui_ryla.py`
  - Add Flux Dev model download function
  - Add InstantID model download function
  - Add InstantID custom node installation
  - Add Flux Dev workflow endpoint (`/flux-dev`)
  - Add InstantID workflow endpoint (`/flux-instantid`)
  - Add LoRA workflow endpoint (`/flux-lora`)
  - Update existing `/workflow` endpoint
  - Add model loading from volumes
  - Add LoRA loading logic

#### Workflow JSON Files

- **Add** `apps/modal/workflows/workflow_flux_dev_api.json`
  - Flux Dev base text-to-image workflow
  - Nodes: CheckpointLoaderSimple, CLIPTextEncode, EmptySD3LatentImage, KSampler, VAEDecode, SaveImage

- **Add** `apps/modal/workflows/workflow_flux_instantid_api.json`
  - Flux Dev + InstantID workflow
  - Nodes: Flux Dev nodes + InstantID nodes (InsightFaceLoader, InstantIDModelLoader, InstantIDControlNetLoader, ApplyInstantID)

- **Add** `apps/modal/workflows/workflow_flux_lora_api.json`
  - Flux Dev + LoRA workflow
  - Nodes: Flux Dev nodes + LoraLoader

#### Client Scripts

- **Update** `apps/modal/ryla_client.py`
  - Add `flux-dev` subcommand
  - Add `flux-instantid` subcommand
  - Add `flux-lora` subcommand
  - Update `workflow` subcommand
  - Add reference image handling (base64 encoding)
  - Add LoRA ID handling
  - Improve error handling

#### Documentation

- **Update** `apps/modal/README-RYLA.md`
  - Add Flux Dev endpoint documentation
  - Add InstantID endpoint documentation
  - Add LoRA endpoint documentation
  - Update usage examples
  - Add model information

- **Add** `apps/modal/README-FLUX-DEV.md`
  - Flux Dev specific documentation
  - Model information
  - Usage examples
  - Performance notes

- **Add** `apps/modal/README-INSTANTID.md`
  - InstantID specific documentation
  - Face consistency information
  - Usage examples
  - Comparison with PuLID

---

## Task Breakdown (P6-ready)

### [STORY] ST-058-001: Flux Dev Deployment

**AC**: EP-058 ST-058-001

**Tasks**:

- **[TASK] TSK-058-001-001**: Add Flux Dev model download function
  - Create `hf_download_flux_dev()` function in `comfyui_ryla.py`
  - Download `flux1-dev-fp8.safetensors` (~12 GB)
  - Download `clip_l.safetensors` (~2 GB)
  - Download `t5xxl_fp16.safetensors` (~5 GB)
  - Download `ae.safetensors` (~1 GB)
  - Symlink models to ComfyUI directories
  - Add to image build process

- **[TASK] TSK-058-001-002**: Create Flux Dev workflow JSON
  - Create `workflows/workflow_flux_dev_api.json`
  - Define CheckpointLoaderSimple node (flux1-dev-fp8)
  - Define CLIPTextEncode nodes (positive/negative prompts)
  - Define EmptySD3LatentImage node
  - Define KSampler node
  - Define VAEDecode node
  - Define SaveImage node
  - Test workflow in ComfyUI UI first (optional)

- **[TASK] TSK-058-001-003**: Implement `/flux-dev` endpoint
  - Add `@modal.fastapi_endpoint(method="POST")` decorator
  - Create `flux_dev()` method in `ComfyUI` class
  - Build workflow JSON from request parameters
  - Call `infer()` method
  - Return image/jpeg response
  - Add error handling

- **[TASK] TSK-058-001-004**: Test Flux Dev endpoint
  - Deploy Modal app
  - Test with `ryla_client.py flux-dev`
  - Verify image generation works
  - Verify response time <30s
  - Verify success rate 100% (10+ samples)

---

### [STORY] ST-058-002: InstantID Deployment

**AC**: EP-058 ST-058-002

**Tasks**:

- **[TASK] TSK-058-002-001**: Install ComfyUI_InstantID custom node
  - Add `comfy node install ComfyUI_InstantID` to image build
  - Or use `git clone` method
  - Install dependencies (`pip install -r requirements.txt`)
  - Verify node installation

- **[TASK] TSK-058-002-002**: Add InstantID model download function
  - Create `hf_download_instantid()` function
  - Download `ip-adapter.bin` (~1.69 GB) to `models/instantid/`
  - Download `diffusion_pytorch_model.safetensors` (~2.50 GB) to `models/controlnet/`
  - Download InsightFace antelopev2 models to `models/insightface/models/`
  - Symlink models to ComfyUI directories
  - Add to image build process

- **[TASK] TSK-058-002-003**: Create InstantID workflow JSON
  - Create `workflows/workflow_flux_instantid_api.json`
  - Include Flux Dev nodes
  - Add InsightFaceLoader node
  - Add InstantIDModelLoader node
  - Add InstantIDControlNetLoader node
  - Add LoadImage node (reference image)
  - Add ApplyInstantID node
  - Add ConditioningCombine node
  - Add ControlNetApplyAdvanced node
  - Test workflow in ComfyUI UI first (optional)

- **[TASK] TSK-058-002-004**: Implement `/flux-instantid` endpoint
  - Add `@modal.fastapi_endpoint(method="POST")` decorator
  - Create `flux_instantid()` method
  - Handle reference_image (base64 or file path)
  - Build InstantID workflow JSON
  - Support instantid_strength and controlnet_strength parameters
  - Support face_provider parameter (CPU/GPU)
  - Call `infer()` method
  - Return image/jpeg response
  - Add error handling

- **[TASK] TSK-058-002-005**: Test InstantID endpoint
  - Deploy Modal app
  - Test with `ryla_client.py flux-instantid`
  - Verify face consistency 85-90%
  - Verify response time <30s
  - Test with different reference images
  - Test with different strength values

- **[TASK] TSK-058-002-006**: Test InstantID for character sheets
  - Generate 7-10 variations with same reference image
  - Compare consistency with PuLID (if available)
  - Document results
  - Decide if InstantID can replace PuLID for character sheets

---

### [STORY] ST-058-003: LoRA Loading Support

**AC**: EP-058 ST-058-003

**Tasks**:

- **[TASK] TSK-058-003-001**: Implement LoRA loading from volume
  - Add LoRA directory structure to volume (`/root/models/loras/`)
  - Create function to load LoRA from volume
  - Verify LoRA file exists before loading
  - Handle missing LoRA gracefully (return 404)

- **[TASK] TSK-058-003-002**: Create LoRA workflow JSON
  - Create `workflows/workflow_flux_lora_api.json`
  - Include Flux Dev nodes
  - Add LoraLoader node
  - Connect LoRA to model and CLIP
  - Support trigger words
  - Support LoRA strength parameter

- **[TASK] TSK-058-003-003**: Implement `/flux-lora` endpoint
  - Add `@modal.fastapi_endpoint(method="POST")` decorator
  - Create `flux_lora()` method
  - Validate lora_id parameter
  - Load LoRA from volume
  - Build LoRA workflow JSON
  - Support lora_strength parameter
  - Support trigger_word parameter
  - Call `infer()` method
  - Return image/jpeg response
  - Add error handling (404 if LoRA not found)

- **[TASK] TSK-058-003-004**: Test LoRA loading
  - Upload test LoRA to volume
  - Test with `ryla_client.py flux-lora`
  - Verify LoRA loads successfully
  - Verify character consistency >95%
  - Test with different LoRA strengths
  - Test with trigger words
  - Test error handling (missing LoRA)

---

### [STORY] ST-058-004: Unified App Integration

**AC**: EP-058 ST-058-004

**Tasks**:

- **[TASK] TSK-058-004-001**: Integrate all models into unified app
  - Ensure all model download functions in image build
  - Ensure all custom nodes installed
  - Ensure all endpoints in single `ComfyUI` class
  - Verify volume mounts correct
  - Test all endpoints work together

- **[TASK] TSK-058-004-002**: Update model persistence
  - Verify models persist on volumes (no re-downloads)
  - Test container restart (models should still be there)
  - Document volume management

- **[TASK] TSK-058-004-003**: Update client script
  - Update `ryla_client.py` with all subcommands
  - Add reference image handling (base64 encoding)
  - Add LoRA ID handling
  - Improve error messages
  - Add progress indicators (optional)

- **[TASK] TSK-058-004-004**: Test unified app
  - Deploy complete app
  - Test all endpoints
  - Verify no conflicts between models
  - Verify performance targets met

---

### [STORY] ST-058-005: Documentation and Client Scripts

**AC**: EP-058 ST-058-005

**Tasks**:

- **[TASK] TSK-058-005-001**: Update main README
  - Update `apps/modal/README-RYLA.md`
  - Document all endpoints
  - Add usage examples
  - Add model information
  - Add troubleshooting section

- **[TASK] TSK-058-005-002**: Create Flux Dev documentation
  - Create `apps/modal/README-FLUX-DEV.md`
  - Document model information
  - Document usage examples
  - Document performance notes
  - Document NSFW support

- **[TASK] TSK-058-005-003**: Create InstantID documentation
  - Create `apps/modal/README-INSTANTID.md`
  - Document face consistency information
  - Document usage examples
  - Compare with PuLID
  - Document character sheet generation

- **[TASK] TSK-058-005-004**: Test client scripts
  - Test all subcommands
  - Verify error handling
  - Verify output file saving
  - Add usage examples to README

---

## Implementation Order

### Phase 1: Flux Dev (Week 1, Days 1-2)
1. TSK-058-001-001: Model download
2. TSK-058-001-002: Workflow JSON
3. TSK-058-001-003: Endpoint implementation
4. TSK-058-001-004: Testing

### Phase 2: InstantID (Week 1, Days 3-4)
1. TSK-058-002-001: Custom node installation
2. TSK-058-002-002: Model download
3. TSK-058-002-003: Workflow JSON
4. TSK-058-002-004: Endpoint implementation
5. TSK-058-002-005: Testing
6. TSK-058-002-006: Character sheet testing

### Phase 3: LoRA Loading (Week 1, Day 5 - Week 2, Day 1)
1. TSK-058-003-001: LoRA loading logic
2. TSK-058-003-002: Workflow JSON
3. TSK-058-003-003: Endpoint implementation
4. TSK-058-003-004: Testing

### Phase 4: Integration (Week 2, Days 2-3)
1. TSK-058-004-001: Unified app integration
2. TSK-058-004-002: Model persistence
3. TSK-058-004-003: Client script updates
4. TSK-058-004-004: Unified testing

### Phase 5: Documentation (Week 2, Day 4)
1. TSK-058-005-001: Main README
2. TSK-058-005-002: Flux Dev docs
3. TSK-058-005-003: InstantID docs
4. TSK-058-005-004: Client script testing

---

## Dependencies

### External Dependencies
- Modal.com account and workspace
- HuggingFace access for model downloads
- ComfyUI_InstantID custom node (GitHub)

### Internal Dependencies
- Existing `comfyui_ryla.py` structure
- Existing volume setup (`ryla-models`, `hf-hub-cache`)
- Existing `ryla_client.py` structure
- InstantID workflow implementation (`libs/business/src/workflows/z-image-instantid.ts`) - for reference

### Blocking Dependencies
- None - can start immediately

---

## Testing Strategy

### Unit Testing
- Test model download functions (mock HuggingFace)
- Test workflow JSON building
- Test endpoint parameter validation

### Integration Testing
- Test each endpoint with real Modal deployment
- Test model persistence (restart container)
- Test error handling (missing models, invalid parameters)

### End-to-End Testing
- Test complete workflows (prompt → image)
- Test all endpoints together
- Test client scripts
- Verify performance targets

### Performance Testing
- Measure cold start time (<60s)
- Measure generation time (<30s)
- Measure API response time (<35s)
- Test concurrent requests (5 per container)

---

## Risk Mitigation

### Risk 1: Model Download Failures
**Mitigation**: 
- Use Modal volumes for persistence
- Add retry logic
- Manual upload fallback option

### Risk 2: InstantID Custom Node Issues
**Mitigation**:
- Test early in development
- Have PuLID as fallback (though InstantID preferred)
- Document installation process

### Risk 3: LoRA Loading Complexity
**Mitigation**:
- Start with simple LoRA loading
- Test with known-good LoRAs
- Iterate based on testing

### Risk 4: Timeline Delays
**Mitigation**:
- Prioritize P0 models first (Flux Dev, InstantID)
- Defer optional features if needed
- Test incrementally

---

## Success Criteria Validation

### Technical Success
- [ ] Flux Dev generates images (100% success rate)
- [ ] InstantID maintains 85-90% face consistency
- [ ] LoRA models load successfully (100% load rate)
- [ ] All endpoints accessible via API
- [ ] Model persistence working (no re-downloads)
- [ ] API response time <30s

### Business Success
- [ ] MVP Content Studio can use Modal backend
- [ ] Cost per generation <$0.50
- [ ] Infrastructure redundancy achieved
- [ ] Documentation complete

---

## Next Steps

1. ✅ **P5: Technical Spec** - Complete
2. **P6: Implementation** - Build Modal app with all models
3. **P7: Testing** - Test all workflows end-to-end
4. **P8: Integration** - Integrate with existing codebase
5. **P9: Deployment Prep** - Prepare for production
6. **P10: Production Validation** - Validate in production

---

## References

- Architecture: `docs/architecture/epics/EP-058-modal-mvp-models-architecture.md`
- UI Skeleton: `docs/specs/epics/EP-058-modal-mvp-models-ui-skeleton.md`
- Requirements: `docs/requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md`
- Initiative: `docs/initiatives/IN-020-modal-mvp-models.md`
- Existing Modal App: `apps/modal/comfyui_ryla.py`
- InstantID Workflow: `libs/business/src/workflows/z-image-instantid.ts`
