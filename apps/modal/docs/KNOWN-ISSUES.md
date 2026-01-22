# Known Issues - EP-058 Modal MVP Models

## Flux Dev Text Encoder Download

**Status**: 🔴 **BLOCKING**  
**Priority**: High (MVP primary model)

### Issue

Flux Dev text encoders (`clip_l.safetensors`, `t5xxl_fp16.safetensors`) cannot be found in the expected HuggingFace repos:

- ❌ `black-forest-labs/FLUX.1-dev` - No text_encoder/ or text_encoders/ directory
- ❌ `black-forest-labs/FLUX.1` - Repository not found

### Expected Behavior

ComfyUI workflows expect these files in `models/text_encoders/`:
- `clip_l.safetensors`
- `t5xxl_fp16.safetensors`

### Possible Solutions

1. **Check if text encoders are shared with Flux Schnell**
   - Flux Schnell might use the same text encoders
   - Check if we can reuse Flux Schnell's text encoders

2. **Find separate text encoder repo**
   - Text encoders might be in a separate HuggingFace repo
   - Research: `black-forest-labs/flux-text-encoders` or similar

3. **Use snapshot_download to explore repo structure**
   - Download entire FLUX.1-dev repo and inspect structure
   - Find actual location of text encoder files

4. **Check ComfyUI documentation**
   - Verify correct repo/paths for Flux Dev components
   - May need different model loading approach

### Workaround

For now, Flux Dev endpoints are disabled. We can:
- ✅ Test Flux Schnell (working)
- ✅ Test InstantID (after fixing model paths)
- ✅ Test LoRA (after uploading LoRA files)
- ⏳ Test Flux Dev (blocked by text encoder issue)

### Next Steps

1. Research Flux Dev model structure on HuggingFace
2. Check ComfyUI community/forums for correct paths
3. Try downloading entire repo and inspecting structure
4. Consider using Flux Schnell text encoders if compatible

---

## InstantID ControlNet Model Path

**Status**: 🟡 **IN PROGRESS**  
**Priority**: High (MVP face consistency)

### Issue

InstantID ControlNet model path may be incorrect. The install scripts show multiple possible URLs to try.

### Current Implementation

Tries root path first, then fallback to alternative repo:
```python
# Primary: InstantX/InstantID/diffusion_pytorch_model.safetensors
# Fallback: lllyasviel/control_v11p_sd15_instantid/diffusion_pytorch_model.safetensors
```

### Status

- ✅ IP-Adapter path: Correct (`ip-adapter.bin` in root)
- ⏳ ControlNet path: Testing with fallback logic

---

## LoRA Model Upload

**Status**: 🟡 **PENDING**  
**Priority**: Medium (MVP character consistency)

### Issue

LoRA endpoint requires LoRA files to be uploaded to Modal volume.

### Solution

1. Upload LoRA files to Modal volume: `/root/models/loras/`
2. Or download from HuggingFace during image build
3. Test with sample LoRA file

### Next Steps

1. Create script to upload LoRA files to Modal volume
2. Or add LoRA download function (if available on HuggingFace)
3. Test with a known working LoRA

---

## Summary

| Issue | Status | Priority | Impact |
|-------|--------|----------|--------|
| Flux Dev Text Encoders | 🔴 Blocking | High | MVP primary model |
| InstantID ControlNet | 🟡 In Progress | High | MVP face consistency |
| LoRA Upload | 🟡 Pending | Medium | MVP character consistency |

---

## Testing Status

- ✅ Flux Schnell: Working (100% success, 2.9s avg)
- ⏳ Flux Dev: Blocked by text encoder issue
- ⏳ InstantID: Model paths being tested
- ⏳ LoRA: Requires file upload
- ✅ Wan2.1: Deployed (not tested yet)
- ✅ Custom Workflow: Deployed (not tested yet)
