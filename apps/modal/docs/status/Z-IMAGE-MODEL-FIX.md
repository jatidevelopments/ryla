# Z-Image Model Download Fix

> **Date**: 2026-01-28  
> **Issue**: VAE filename incorrect in download function

---

## Issue

**Error**: `404 Client Error` when downloading Z-Image-Turbo VAE model

**Root Cause**: Incorrect VAE filename in `hf_download_z_image()` function
- **Incorrect**: `z-image-turbo-vae.safetensors`
- **Correct**: `ae.safetensors`

---

## Fix Applied

### Updated `apps/modal/image.py`

**Changed**:
```python
# Before (incorrect)
filename="split_files/vae/z-image-turbo-vae.safetensors"

# After (correct)
filename="split_files/vae/ae.safetensors"
```

**Also Added**:
- Symlink both `ae.safetensors` and `z-image-turbo-vae.safetensors` for compatibility
- This ensures workflows using either filename will work

---

## Model Files

### Correct Filenames

| Model | Filename | Location |
|-------|----------|----------|
| Diffusion | `z_image_turbo_bf16.safetensors` | `split_files/diffusion_models/` |
| CLIP | `qwen_3_4b.safetensors` | `split_files/text_encoders/` |
| VAE | `ae.safetensors` | `split_files/vae/` |

### Symlink Structure

After download, models are symlinked to:
- Diffusion: `ComfyUI/models/unet/z_image_turbo_bf16.safetensors`
- CLIP: `ComfyUI/models/text_encoders/qwen_3_4b.safetensors`
- CLIP (alt): `ComfyUI/models/clip/qwen_3_4b.safetensors`
- VAE: `ComfyUI/models/vae/ae.safetensors`
- VAE (alt): `ComfyUI/models/vae/z-image-turbo-vae.safetensors` (symlink to ae.safetensors)

---

## Deployment Status

**New Deployment**: Started with corrected filename

**Log File**: `/tmp/modal_deploy_z_image_fixed.log`

**Expected**: Should complete successfully now

---

## Verification

After deployment, verify models are available:

```bash
# Check if models are symlinked correctly
modal run apps/modal/app.py::list_models
```

Or test the endpoint:

```bash
python3 apps/modal/ryla_client.py z-image-simple \
  --prompt "A beautiful landscape" \
  --output test.jpg
```

---

## References

- HuggingFace: https://huggingface.co/Comfy-Org/z_image_turbo/tree/main/split_files/vae
- Web Search: Confirmed VAE filename is `ae.safetensors`
