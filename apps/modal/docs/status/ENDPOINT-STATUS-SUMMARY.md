# Modal Endpoint Status Summary

**Last Tested**: 2026-01-28  
**Test Method**: Automated comprehensive testing  
**Base URL**: `https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run`

---

## Quick Status

| Status | Count | Endpoints |
|--------|-------|-----------|
| ✅ **Working** | **4** | `/flux`, `/flux-dev`, `/wan2`, `/seedvr2` |
| ❌ **Failed** | **6** | Face consistency (2), Z-Image (4) |
| ⏭️ **Skipped** | **2** | `/flux-lora`, `/workflow` |
| ⚠️ **Expected Fail** | **1** | `/flux-instantid` (known incompatible) |

**Success Rate**: 4/10 testable = **40%**

---

## ✅ Working Endpoints (4)

### 1. `/flux` - Flux Schnell ✅
- **Status**: ✅ Working
- **Response Time**: ~19s
- **Output**: 1.6 MB image
- **Use Case**: Fast text-to-image generation

### 2. `/flux-dev` - Flux Dev ✅
- **Status**: ✅ Working
- **Response Time**: ~63s
- **Output**: 1.2 MB image
- **Use Case**: High-quality text-to-image (MVP primary model)

### 3. `/wan2` - Wan2.1 Video ✅
- **Status**: ✅ Working
- **Response Time**: ~20s
- **Output**: 713 KB video
- **Use Case**: Text-to-video generation

### 4. `/seedvr2` - SeedVR2 Upscaling ✅
- **Status**: ✅ Working (Recently Fixed)
- **Response Time**: ~36s
- **Output**: 1.7 MB upscaled image
- **Use Case**: Realistic image upscaling
- **Note**: Fixed parameter type conversion issue

---

## ❌ Failed Endpoints (6)

### Face Consistency Endpoints (2 failed)

#### 5. `/flux-ipadapter-faceid` ❌
- **Error**: HTTP 503 - Workflow execution error
- **Issue**: Workflow failed at unknown node
- **Action Needed**: Check XLabs-AI custom nodes and IP-Adapter models

#### 6. `/sdxl-instantid` ❌
- **Error**: HTTP 503 - Workflow execution error
- **Issue**: Workflow failed during execution
- **Action Needed**: Check InstantID nodes and SDXL model

#### 7. `/flux-instantid` ⚠️
- **Status**: Expected Failure (Known Incompatible)
- **Reason**: ControlNet shape mismatch with Flux Dev
- **Recommendation**: Use `/flux-ipadapter-faceid` or `/sdxl-instantid` instead

### Z-Image Endpoints (4 failed)

#### 8. `/z-image-simple` ❌
- **Error**: HTTP 500 - CLIPLoader model size mismatch
- **Issue**: `Error(s) in loading state_dict for Llama2: size mismatch for model.embed_tokens.weight`
- **Root Cause**: Wrong or corrupted `qwen_3_4b.safetensors` file
- **Action Needed**: Verify and re-download Z-Image CLIP model

#### 9. `/z-image-danrisi` ❌
- **Error**: HTTP 500 - Unknown error
- **Issue**: Workflow execution failed immediately
- **Action Needed**: Check RES4LYF nodes and workflow structure

#### 10. `/z-image-instantid` ❌
- **Error**: HTTP 500 - Unknown error
- **Issue**: Workflow execution failed immediately
- **Action Needed**: Check InstantID nodes and Z-Image models

#### 11. `/z-image-pulid` ❌
- **Error**: HTTP 500 - Unknown error
- **Issue**: Workflow execution failed immediately
- **Action Needed**: Check PuLID nodes and Z-Image models

---

## ⏭️ Skipped Endpoints (2)

### 12. `/flux-lora` ⏭️
- **Reason**: Requires LoRA file in Modal volume
- **To Test**: Upload LoRA `.safetensors` file to `/root/models/loras/`

### 13. `/workflow` ⏭️
- **Reason**: Requires valid ComfyUI workflow JSON
- **To Test**: Create test workflow JSON file

---

## Critical Issues

### Issue 1: Z-Image CLIP Model Mismatch

**Affected**: All 4 Z-Image endpoints  
**Error**: `size mismatch for model.embed_tokens.weight`  
**Root Cause**: `qwen_3_4b.safetensors` file is wrong or corrupted

**Fix Required**:
1. Verify correct model file from HuggingFace
2. Re-download `qwen_3_4b.safetensors`
3. Check file integrity and size
4. Verify symlinks are correct

### Issue 2: Face Consistency Workflows Failing

**Affected**: `/flux-ipadapter-faceid`, `/sdxl-instantid`  
**Error**: Workflow execution error at unknown nodes

**Fix Required**:
1. Check Modal logs for detailed node errors
2. Verify custom nodes are loading (XLabs-AI, InstantID)
3. Verify model files are present and correct
4. Check workflow structure matches ComfyUI version

---

## Recommendations

### Use These Endpoints (Working)

**For Text-to-Image**:
- ✅ `/flux` - Fast generation (~19s)
- ✅ `/flux-dev` - High quality (~63s)

**For Video**:
- ✅ `/wan2` - Text-to-video (~20s)

**For Upscaling**:
- ✅ `/seedvr2` - Image upscaling (~36s)

### Fix These First (High Priority)

1. **Z-Image CLIP Model** - Fixes 4 endpoints at once
2. **Face Consistency Nodes** - Fixes 2 endpoints

---

## Test Results File

- **JSON Results**: `apps/modal/docs/status/ENDPOINT-TEST-RESULTS.json`
- **Detailed Report**: `apps/modal/docs/status/COMPREHENSIVE-ENDPOINT-TEST-RESULTS.md`
- **Test Script**: `apps/modal/scripts/test-all-endpoints.py`

---

**Last Updated**: 2026-01-28  
**Next Test**: After fixes are applied
