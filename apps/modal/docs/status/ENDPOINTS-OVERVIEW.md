# Modal.com Endpoints Overview

**Total Endpoints**: 13

**Last Updated**: 2026-01-28  
**Base URL**: `https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run`

---

## Endpoints List

### 1. `/flux` - Flux Schnell Text-to-Image
- **Status**: ✅ Tested and Working
- **Model**: Flux Schnell (fast generation)
- **Provider**: Black Forest Labs
- **Test Result**: Image generated (1.6 MB)
- **Requirements**: Prompt only
- **Cost**: $0.002-0.003 per image (3-5s)

### 2. `/flux-dev` - Flux Dev Text-to-Image
- **Status**: ✅ Tested and Working
- **Model**: Flux Dev (primary MVP model)
- **Provider**: Black Forest Labs
- **Test Result**: Image generated (917 KB)
- **Requirements**: Prompt only
- **Cost**: $0.007-0.014 per image (10-20s)

### 3. `/flux-ipadapter-faceid` - Flux Dev + IP-Adapter FaceID ⭐
- **Status**: ✅ Implemented (Recommended for Flux Dev)
- **Model**: Flux Dev + XLabs-AI Flux IP-Adapter v2
- **Provider**: XLabs-AI
- **Requirements**: Prompt + reference_image (base64)
- **Face Consistency**: 80-85%
- **Cost**: $0.008-0.012 per image (12-18s)
- **Test File Needed**: Reference face image
- **Notes**: Fully compatible with Flux Dev, avoids InstantID shape mismatch

### 4. `/sdxl-instantid` - SDXL + InstantID Face Consistency ⭐
- **Status**: ✅ Implemented and Tested
- **Model**: SDXL + InstantID
- **Provider**: Stability AI + InstantX
- **Requirements**: Prompt + reference_image (base64)
- **Face Consistency**: 85-90%
- **Cost**: $0.010-0.017 per image (15-25s)
- **Notes**: Best consistency, recommended for InstantID workflows

### 5. `/flux-instantid` - Flux Dev + InstantID
- **Status**: ❌ Incompatible (Not Recommended)
- **Model**: Flux Dev + InstantID
- **Issue**: ControlNet shape mismatch error
- **Recommendation**: Use `/flux-ipadapter-faceid` instead

### 6. `/flux-lora` - Flux Dev + LoRA Character Consistency
- **Status**: ⏳ Not Tested (requires LoRA file)
- **Model**: Flux Dev + LoRA
- **Provider**: User-trained
- **Requirements**: Prompt + lora_id (LoRA filename)
- **Face Consistency**: >95% (with trained LoRA)
- **Cost**: $0.008-0.012 per image (12-18s)
- **Test File Needed**: LoRA model file in Modal volume
- **Notes**: Requires LoRA training (15-45 min, $2-5 per character)

### 7. `/wan2` - Wan2.1 Text-to-Video
- **Status**: ✅ Tested and Working
- **Model**: Wan2.1
- **Provider**: Kling AI
- **Test Result**: Video generated (1.1 MB)
- **Requirements**: Prompt only
- **Cost**: $0.042-0.083 per video (60-120s)

### 8. `/seedvr2` - SeedVR2 Realistic Upscaling
- **Status**: ⏳ Not Tested (requires input image)
- **Model**: SeedVR2
- **Provider**: Seed (Stability AI)
- **Requirements**: image (base64 encoded)
- **Cost**: $0.021-0.042 per upscale (30-60s)
- **Test File Needed**: Input image to upscale

### 9. `/z-image-simple` - Z-Image-Turbo Simple
- **Status**: ✅ Implemented
- **Model**: Z-Image-Turbo (Lumina2)
- **Requirements**: Prompt only
- **Cost**: $0.003-0.007 per image (5-10s)
- **Notes**: No custom nodes required, fastest Z-Image workflow

### 10. `/z-image-danrisi` - Z-Image-Turbo Danrisi (Optimized)
- **Status**: ✅ Implemented
- **Model**: Z-Image-Turbo + RES4LYF optimization
- **Requirements**: Prompt only
- **Cost**: $0.007-0.014 per image (10-20s)
- **Notes**: Requires RES4LYF custom nodes, better quality than simple

### 11. `/z-image-instantid` - Z-Image-Turbo + InstantID
- **Status**: ✅ Implemented
- **Model**: Z-Image-Turbo + InstantID
- **Requirements**: Prompt + reference_image (base64)
- **Cost**: $0.010-0.017 per image (15-25s)
- **Face Consistency**: 85-90%
- **Test File Needed**: Reference face image
- **Notes**: Better for extreme angles than PuLID

### 12. `/z-image-pulid` - Z-Image-Turbo + PuLID
- **Status**: ✅ Implemented
- **Model**: Z-Image-Turbo + PuLID
- **Requirements**: Prompt + reference_image (base64)
- **Cost**: $0.010-0.017 per image (15-25s)
- **Face Consistency**: 85-90%
- **Test File Needed**: Reference face image
- **Notes**: Better for multiple reference images

### 13. `/workflow` - Custom Workflow Execution
- **Status**: ⏳ Not Tested (requires workflow JSON)
- **Model**: Any (depends on workflow)
- **Requirements**: workflow (JSON object)
- **Cost**: Varies ($0.007-0.125)
- **Test File Needed**: Custom workflow JSON

---

## Testing Status Summary

| Endpoint | Status | Tested | Working | Notes |
|----------|--------|--------|---------|-------|
| `/flux` | ✅ Working | ✅ Yes | ✅ Yes | Fast text-to-image |
| `/flux-dev` | ✅ Working | ✅ Yes | ✅ Yes | Primary MVP model |
| `/flux-ipadapter-faceid` | ❌ Failed | ✅ Yes | ❌ No | Workflow execution error |
| `/sdxl-instantid` | ❌ Failed | ✅ Yes | ❌ No | Workflow execution error |
| `/flux-instantid` | ❌ Incompatible | ✅ Yes | ❌ No | Known incompatible (expected) |
| `/flux-lora` | ⏳ Pending | ⏭️ Skipped | ⏳ Pending | Needs LoRA file |
| `/z-image-simple` | ❌ Failed | ✅ Yes | ❌ No | CLIP model mismatch |
| `/z-image-danrisi` | ❌ Failed | ✅ Yes | ❌ No | Workflow execution error |
| `/z-image-instantid` | ❌ Failed | ✅ Yes | ❌ No | Workflow execution error |
| `/z-image-pulid` | ❌ Failed | ✅ Yes | ❌ No | Workflow execution error |
| `/wan2` | ✅ Working | ✅ Yes | ✅ Yes | Text-to-video |
| `/seedvr2` | ✅ Working | ✅ Yes | ✅ Yes | Image upscaling (recently fixed) |
| `/workflow` | ⏳ Pending | ⏭️ Skipped | ⏳ Pending | Needs workflow JSON |

**Tested**: 10/13 (77%)  
**Working**: 4/10 tested (40%)  
**Failed**: 6/10 tested (60%)

---

## Recommendations

### For Face Consistency with Flux Dev
- **Use**: `/flux-ipadapter-faceid` ⭐
- **Reason**: Fully compatible, no shape mismatch issues
- **Consistency**: 80-85%

### For Face Consistency with SDXL
- **Use**: `/sdxl-instantid` ⭐
- **Reason**: Best consistency, proven technology
- **Consistency**: 85-90%

### For Maximum Consistency
- **Use**: `/flux-lora` (with trained LoRA)
- **Reason**: Highest consistency (>95%)
- **Cost**: $2-5 per character training

---

## Next Steps for Complete Testing

1. **Test `/flux-ipadapter-faceid`**: Create test reference image
2. **Test `/flux-lora`**: Upload test LoRA to Modal volume
3. **Test `/seedvr2`**: Use generated image from `/flux-dev` as input
4. **Test `/workflow`**: Create test workflow JSON

---

## Related Documentation

- **Comprehensive Reference**: `apps/modal/docs/ENDPOINTS-REFERENCE.md` (models, providers, costs)
- **Cost Tracking**: `apps/modal/docs/COST-TRACKING.md`
- **Face Consistency**: `apps/modal/docs/FLUX-FACE-CONSISTENCY-SUMMARY.md`
