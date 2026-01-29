# Comprehensive Modal Endpoint Test Results

**Test Date**: 2026-01-28  
**Test Method**: Automated systematic testing  
**Base URL**: `https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run`

---

## Executive Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ **Working** | 4 | 31% |
| ❌ **Failed** | 6 | 46% |
| ⏭️ **Skipped** | 2 | 15% |
| ⚠️ **Expected Fail** | 1 | 8% |

**Success Rate**: 4/10 testable endpoints (40%)

---

## ✅ Working Endpoints (4/13)

### 1. `/flux` - Flux Schnell Text-to-Image ✅

**Status**: ✅ **Working**  
**Test Result**: Image generated successfully  
**Response Time**: 18.8s  
**Output Size**: 1.6 MB  
**Requirements**: Prompt only

**Test Command**:
```bash
python apps/modal/ryla_client.py flux \
  --prompt "A beautiful landscape with mountains and a lake" \
  --output test_flux.jpg
```

**Notes**: Fast text-to-image generation, working perfectly.

---

### 2. `/flux-dev` - Flux Dev Text-to-Image ✅

**Status**: ✅ **Working**  
**Test Result**: Image generated successfully  
**Response Time**: 62.5s  
**Output Size**: 1.2 MB  
**Requirements**: Prompt only

**Test Command**:
```bash
python apps/modal/ryla_client.py flux-dev \
  --prompt "A detailed portrait of a person" \
  --output test_flux_dev.jpg
```

**Notes**: Primary MVP model, working correctly. Slower than Flux Schnell but higher quality.

---

### 3. `/wan2` - Wan2.1 Text-to-Video ✅

**Status**: ✅ **Working**  
**Test Result**: Video generated successfully  
**Response Time**: 19.8s  
**Output Size**: 713 KB  
**Requirements**: Prompt only

**Test Command**:
```bash
python apps/modal/ryla_client.py wan2 \
  --prompt "A beautiful landscape animation" \
  --output test_wan2.webp
```

**Notes**: Text-to-video generation working correctly.

---

### 4. `/seedvr2` - SeedVR2 Realistic Upscaling ✅

**Status**: ✅ **Working** (Recently Fixed)  
**Test Result**: Image upscaled successfully  
**Response Time**: 35.5s  
**Output Size**: 1.7 MB  
**Requirements**: Input image (base64)

**Test Command**:
```bash
python apps/modal/ryla_client.py seedvr2 \
  --image test_image.jpg \
  --output upscaled.png \
  --resolution 1080
```

**Notes**: 
- ✅ Recently fixed parameter type conversion issue
- ✅ Handles string "fixed" → converts to 1080
- ✅ Custom resolution working
- ✅ Production ready

---

## ❌ Failed Endpoints (6/13)

### 5. `/flux-ipadapter-faceid` - Flux Dev + IP-Adapter FaceID ❌

**Status**: ❌ **Failed**  
**Error**: HTTP 503 - Workflow execution error  
**Issue**: Workflow failed at unknown node

**Error Details**:
```
Workflow failed at node unknown (unknown)
Execution error during workflow execution
```

**Possible Causes**:
- Custom node not loading properly
- Model file missing or incorrect path
- Workflow structure issue

**Next Steps**:
- Check Modal logs for detailed error
- Verify XLabs-AI custom nodes are loaded
- Verify IP-Adapter model files are present

---

### 6. `/sdxl-instantid` - SDXL + InstantID ❌

**Status**: ❌ **Failed**  
**Error**: HTTP 503 - Workflow execution error  
**Issue**: Workflow failed during execution

**Error Details**:
```
Workflow failed at node unknown (unknown)
Execution error during workflow execution
```

**Possible Causes**:
- InstantID nodes not loading
- SDXL model not found
- Face detection failing

**Next Steps**:
- Check if InstantID nodes are available
- Verify SDXL model is downloaded
- Check InsightFace models are present

---

### 7. `/flux-instantid` - Flux Dev + InstantID ⚠️

**Status**: ⚠️ **Expected Failure** (Known Incompatible)  
**Error**: HTTP 503 - Workflow execution error  
**Issue**: ControlNet shape mismatch (documented)

**Notes**: 
- This is a **known incompatibility** - Flux Dev's dual CLIP architecture doesn't work with InstantID's ControlNet
- **Recommendation**: Use `/flux-ipadapter-faceid` or `/sdxl-instantid` instead

---

### 8. `/z-image-simple` - Z-Image-Turbo Simple ❌

**Status**: ❌ **Failed**  
**Error**: HTTP 500 - CLIPLoader error  
**Issue**: Model size mismatch

**Error Details**:
```
Error(s) in loading state_dict for Llama2:
size mismatch for model.embed_tokens.weight
```

**Possible Causes**:
- Wrong CLIP model file (`qwen_3_4b.safetensors`)
- Model file corrupted or incomplete
- Model version mismatch

**Next Steps**:
- Verify `qwen_3_4b.safetensors` is correct file
- Check model file size and integrity
- Re-download model if needed

---

### 9. `/z-image-danrisi` - Z-Image-Turbo Danrisi ❌

**Status**: ❌ **Failed**  
**Error**: HTTP 500 - Workflow execution error  
**Issue**: Unknown error during execution

**Error Details**:
```
Error running workflow
An unknown error occurred
```

**Possible Causes**:
- RES4LYF custom nodes not loading
- Workflow structure issue
- Model loading problem

**Next Steps**:
- Check if RES4LYF nodes are available
- Verify workflow structure
- Check Modal logs for details

---

### 10. `/z-image-instantid` - Z-Image-Turbo + InstantID ❌

**Status**: ❌ **Failed**  
**Error**: HTTP 500 - Workflow execution error  
**Issue**: Unknown error during execution

**Error Details**:
```
Error running workflow
An unknown error occurred
```

**Possible Causes**:
- InstantID nodes not loading
- Z-Image model issue
- Workflow structure problem

**Next Steps**:
- Check InstantID nodes availability
- Verify Z-Image models are correct
- Check workflow structure

---

### 11. `/z-image-pulid` - Z-Image-Turbo + PuLID ❌

**Status**: ❌ **Failed**  
**Error**: HTTP 500 - Workflow execution error  
**Issue**: Unknown error during execution

**Error Details**:
```
Error running workflow
An unknown error occurred
```

**Possible Causes**:
- PuLID custom nodes not loading
- Z-Image model issue
- Workflow structure problem

**Next Steps**:
- Check PuLID nodes availability
- Verify Z-Image models are correct
- Check workflow structure

---

## ⏭️ Skipped Endpoints (2/13)

### 12. `/flux-lora` - Flux Dev + LoRA ⏭️

**Status**: ⏭️ **Skipped** (Requires LoRA File)  
**Reason**: Requires LoRA model file uploaded to Modal volume  
**Requirements**: LoRA `.safetensors` file in `/root/models/loras/`

**To Test**:
1. Upload LoRA file to Modal volume
2. Test with `--lora-id` parameter

---

### 13. `/workflow` - Custom Workflow Execution ⏭️

**Status**: ⏭️ **Skipped** (Requires Workflow JSON)  
**Reason**: Requires valid ComfyUI workflow JSON  
**Requirements**: Complete workflow JSON with all nodes defined

**To Test**:
1. Create test workflow JSON
2. Test with workflow file

---

## Issues Summary

### Critical Issues

1. **Z-Image Endpoints** (4 endpoints failing)
   - All Z-Image endpoints failing with model loading errors
   - Likely issue: CLIP model file (`qwen_3_4b.safetensors`) size mismatch
   - **Action**: Verify and re-download Z-Image models

2. **Face Consistency Endpoints** (2 endpoints failing)
   - `/flux-ipadapter-faceid` - Workflow execution error
   - `/sdxl-instantid` - Workflow execution error
   - **Action**: Check custom nodes and model availability

### Known Issues

1. **`/flux-instantid`** - Documented as incompatible (expected failure)

---

## Recommendations

### Immediate Actions

1. **Fix Z-Image Models**:
   - Verify `qwen_3_4b.safetensors` file integrity
   - Re-download if corrupted
   - Check model file paths in workflow

2. **Debug Face Consistency Endpoints**:
   - Check Modal logs for detailed errors
   - Verify custom nodes are loading
   - Verify model files are present

3. **Test LoRA Endpoint**:
   - Upload test LoRA file to Modal volume
   - Test endpoint with actual LoRA

### Working Endpoints (Use These)

For **text-to-image**:
- ✅ `/flux` - Fast generation
- ✅ `/flux-dev` - High quality (MVP primary)

For **text-to-video**:
- ✅ `/wan2` - Video generation

For **upscaling**:
- ✅ `/seedvr2` - Image upscaling

---

## Test Files Generated

| File | Size | Endpoint |
|------|------|----------|
| `test_flux.jpg` | 1.6 MB | `/flux` |
| `test_flux_dev.jpg` | 1.2 MB | `/flux-dev` |
| `test_wan2.webp` | 713 KB | `/wan2` |
| `test_seedvr2.png` | 1.7 MB | `/seedvr2` |

---

## Next Steps

1. **Debug Z-Image endpoints** - Fix CLIP model loading issue
2. **Debug face consistency endpoints** - Check custom nodes and models
3. **Test LoRA endpoint** - Upload test LoRA file
4. **Test workflow endpoint** - Create test workflow JSON
5. **Monitor working endpoints** - Ensure they stay working

---

**Test Completed**: 2026-01-28  
**Test Script**: `apps/modal/scripts/test-all-endpoints.py`  
**Results File**: `apps/modal/docs/status/ENDPOINT-TEST-RESULTS.json`
