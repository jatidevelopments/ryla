# EP-058: Modal MVP Models - Implementation Status

**Initiative**: [IN-020](../../docs/initiatives/IN-020-modal-mvp-models.md)  
**Epic**: [EP-058](../../docs/requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md)  
**Status**: P6 - Implementation (In Progress)  
**Date**: 2025-01-21

---

## Implementation Summary

### ✅ Completed

#### 1. Flux Dev Model Download
- ✅ Added `hf_download_flux_dev()` function
- ✅ Downloads Flux Dev checkpoint (`flux1-dev.safetensors`)
- ✅ Downloads CLIP encoder (`clip_l.safetensors`)
- ✅ Downloads T5 encoder (`t5xxl_fp16.safetensors`)
- ✅ Downloads VAE (`ae.safetensors`)
- ✅ Symlinks models to ComfyUI directories
- ✅ Integrated into image build process

#### 2. InstantID Model Download & Custom Node
- ✅ Added `hf_download_instantid()` function
- ✅ Downloads InstantID IP-Adapter (`ip-adapter.bin`)
- ✅ Downloads InstantID ControlNet (`diffusion_pytorch_model.safetensors`)
- ✅ Installs ComfyUI_InstantID custom node
- ✅ Creates InsightFace directory structure
- ✅ Integrated into image build process

#### 3. API Endpoints
- ✅ `/flux-dev` - Flux Dev text-to-image endpoint
- ✅ `/flux-instantid` - Flux Dev + InstantID face consistency endpoint
- ✅ `/flux-lora` - Flux Dev + LoRA character generation endpoint
- ✅ All endpoints include error handling
- ✅ All endpoints return image/jpeg responses

#### 4. Client Script Updates
- ✅ Added `flux-dev` subcommand
- ✅ Added `flux-instantid` subcommand (with reference image support)
- ✅ Added `flux-lora` subcommand (with LoRA ID support)
- ✅ Updated endpoint URL building
- ✅ Added base64 image encoding for InstantID

#### 5. LoRA Loading Support
- ✅ LoRA path checking (volume + ComfyUI directory)
- ✅ Automatic symlinking from volume to ComfyUI directory
- ✅ LoRA workflow with trigger word support
- ✅ LoRA strength control

---

## Implementation Details

### Model Downloads

**Flux Dev Models** (~20 GB total):
- `flux1-dev.safetensors` → `models/checkpoints/`
- `clip_l.safetensors` → `models/clip/`
- `t5xxl_fp16.safetensors` → `models/text_encoders/`
- `ae.safetensors` → `models/vae/`

**InstantID Models** (~4.7 GB total):
- `ip-adapter.bin` → `models/instantid/`
- `diffusion_pytorch_model.safetensors` → `models/controlnet/`
- InsightFace models (auto-downloaded by node)

### Workflow Structures

**Flux Dev Workflow**:
- Uses `CheckpointLoaderSimple` (may need adjustment to `DualCLIPLoader` if checkpoint doesn't include encoders)
- Standard Flux workflow: CheckpointLoader → CLIPTextEncode → EmptySD3LatentImage → KSampler → VAEDecode → SaveImage

**InstantID Workflow**:
- Flux Dev base + InstantID nodes
- InsightFaceLoader → InstantIDModelLoader → InstantIDControlNetLoader
- LoadImage (reference) → ApplyInstantID → ConditioningCombine → ControlNetApplyAdvanced

**LoRA Workflow**:
- Flux Dev base + LoraLoader
- Supports trigger words and strength control

---

## Testing Required

### Before Deployment

1. **Model Downloads**:
   - [ ] Verify Flux Dev models download correctly
   - [ ] Verify InstantID models download correctly
   - [ ] Verify models persist on volumes (no re-downloads)

2. **Custom Node Installation**:
   - [ ] Verify ComfyUI_InstantID installs correctly
   - [ ] Verify InstantID nodes are available in ComfyUI

3. **Endpoints**:
   - [ ] Test `/flux-dev` endpoint (10+ samples, 100% success rate)
   - [ ] Test `/flux-instantid` endpoint (face consistency 85-90%)
   - [ ] Test `/flux-lora` endpoint (LoRA loading works)
   - [ ] Verify response times <30s

4. **Client Scripts**:
   - [ ] Test all subcommands
   - [ ] Verify reference image encoding works
   - [ ] Verify error handling

---

## Known Issues / Potential Adjustments

### 1. Flux Dev Workflow Format
**Issue**: Using `CheckpointLoaderSimple` may not work if Flux Dev checkpoint doesn't include CLIP/T5 encoders.

**Solution**: If needed, switch to:
- `UNETLoader` for model
- `DualCLIPLoader` for CLIP + T5
- `VAELoader` for VAE

**Status**: To be tested during deployment

### 2. InsightFace Models
**Issue**: InsightFace models may need manual download or different approach.

**Solution**: InstantID node should auto-download, but we may need to pre-download them.

**Status**: To be tested during deployment

### 3. LoRA Directory Structure
**Issue**: LoRA models need to be in ComfyUI's loras directory.

**Solution**: Automatic symlinking implemented, but may need volume mount adjustment.

**Status**: To be tested during deployment

---

## Next Steps

1. **Deploy to Modal**:
   ```bash
   modal deploy apps/modal/comfyui_ryla.py
   ```

2. **Test Each Endpoint**:
   ```bash
   # Test Flux Dev
   python apps/modal/ryla_client.py flux-dev \
     --prompt "A beautiful landscape" \
     --output test_flux_dev.jpg
   
   # Test InstantID
   python apps/modal/ryla_client.py flux-instantid \
     --prompt "A portrait in a studio" \
     --reference-image reference.jpg \
     --output test_instantid.jpg
   
   # Test LoRA (requires LoRA uploaded to volume first)
   python apps/modal/ryla_client.py flux-lora \
     --prompt "A character" \
     --lora-id 123 \
     --output test_lora.jpg
   ```

3. **Verify Performance**:
   - Cold start <60s
   - Generation time <30s
   - Success rate >95%

4. **Fix Any Issues**:
   - Adjust workflows if needed
   - Fix model paths if needed
   - Update documentation

---

## Files Modified

- ✅ `apps/modal/comfyui_ryla.py` - Added Flux Dev, InstantID, LoRA support
- ✅ `apps/modal/ryla_client.py` - Added new subcommands

## Files Created

- ✅ `apps/modal/IMPLEMENTATION-STATUS.md` - This file

---

## Phase Status

- ✅ **P1-P5**: Complete (Requirements, Scoping, Architecture, UI Skeleton, Technical Spec)
- 🔄 **P6**: In Progress (Implementation)
- ⏳ **P7**: Pending (Testing)
- ⏳ **P8**: Pending (Integration)
- ⏳ **P9**: Pending (Deployment Prep)
- ⏳ **P10**: Pending (Production Validation)

---

## References

- Epic Requirements: `docs/requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md`
- Architecture: `docs/architecture/epics/EP-058-modal-mvp-models-architecture.md`
- Technical Spec: `docs/specs/epics/EP-058-modal-mvp-models-tech-spec.md`
- Initiative: `docs/initiatives/IN-020-modal-mvp-models.md`
