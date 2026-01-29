# Z-Image Endpoints Testing Guide

> **Date**: 2026-01-28  
> **Status**: Ready for Testing

---

## Prerequisites

1. ✅ Modal app deployed with Z-Image handlers
2. ✅ Z-Image models available in Modal volume:
   - `z_image_turbo_bf16.safetensors`
   - `z-image-turbo-vae.safetensors`
   - `qwen_3_4b.safetensors`
3. ✅ Custom nodes installed (for Danrisi, InstantID, PuLID workflows)

---

## Test Commands

### 1. Z-Image Simple (No Custom Nodes Required)

**Test Command**:
```bash
cd /Users/admin/Documents/Projects/RYLA
python3 apps/modal/ryla_client.py z-image-simple \
  --prompt "A beautiful landscape with mountains and a lake, photorealistic, high quality" \
  --output z_image_simple_test.jpg \
  --steps 9 \
  --cfg 1.0
```

**Expected**:
- ✅ Image generated successfully
- ✅ No custom node errors
- ✅ Fast generation (~5-10 seconds)

**Troubleshooting**:
- If "UNETLoader" error: Models not found in volume
- If "CLIPLoader" error: Check `qwen_3_4b.safetensors` is in volume
- If timeout: Check Modal app is deployed and running

---

### 2. Z-Image Danrisi (Requires RES4LYF Nodes)

**Test Command**:
```bash
cd /Users/admin/Documents/Projects/RYLA
python3 apps/modal/ryla_client.py z-image-danrisi \
  --prompt "A beautiful landscape with mountains and a lake, photorealistic, high quality" \
  --output z_image_danrisi_test.jpg \
  --steps 20 \
  --cfg 1.0
```

**Expected**:
- ✅ Image generated successfully
- ✅ Better quality than simple workflow
- ✅ Uses ClownsharKSampler_Beta

**Troubleshooting**:
- If "ClownsharKSampler_Beta" error: RES4LYF custom nodes not installed
- If "BetaSamplingScheduler" error: RES4LYF custom nodes not installed
- If "Sigmas Rescale" error: RES4LYF custom nodes not installed

**Custom Nodes Required**:
- `ClownsharKSampler_Beta`
- `BetaSamplingScheduler`
- `Sigmas Rescale`

---

### 3. Z-Image InstantID (Requires InstantID Nodes + Reference Image)

**Test Command**:
```bash
cd /Users/admin/Documents/Projects/RYLA
python3 apps/modal/ryla_client.py z-image-instantid \
  --prompt "A professional AI influencer portrait, high quality, detailed face, studio lighting" \
  --reference-image ai_influencer_hq.png \
  --output z_image_instantid_test.jpg \
  --steps 20 \
  --cfg 1.0 \
  --instantid-strength 0.8 \
  --controlnet-strength 0.8 \
  --face-provider CPU
```

**Expected**:
- ✅ Image generated with face consistency
- ✅ Face matches reference image (~85-90% consistency)
- ✅ Works with Z-Image-Turbo models

**Troubleshooting**:
- If "InsightFaceLoader" error: InstantID custom nodes not installed
- If "InstantIDModelLoader" error: InstantID models not found
- If "reference_image required" error: Check image file path
- If face not detected: Try different reference image or adjust strength

**Custom Nodes Required**:
- `InsightFaceLoader`
- `InstantIDModelLoader`
- `InstantIDControlNetLoader`
- `ApplyInstantID`

**Models Required**:
- `ip-adapter.bin` (InstantID IP-Adapter)
- `diffusion_pytorch_model.safetensors` (InstantID ControlNet)
- InsightFace models (antelopev2)

---

### 4. Z-Image PuLID (Requires PuLID Nodes + Reference Image)

**Test Command**:
```bash
cd /Users/admin/Documents/Projects/RYLA
python3 apps/modal/ryla_client.py z-image-pulid \
  --prompt "A professional AI influencer portrait, high quality, detailed face, studio lighting" \
  --reference-image ai_influencer_hq.png \
  --output z_image_pulid_test.jpg \
  --steps 20 \
  --cfg 1.0 \
  --pulid-strength 0.8 \
  --pulid-start 0.0 \
  --pulid-end 1.0 \
  --face-provider CPU
```

**Expected**:
- ✅ Image generated with face consistency
- ✅ Face matches reference image (~80-85% consistency)
- ✅ Uses PuLID + Danrisi sampling

**Troubleshooting**:
- If "PulidFluxModelLoader" error: PuLID custom nodes not installed
- If "pulid_flux_v0.9.1.safetensors" error: PuLID model not found
- If "reference_image required" error: Check image file path
- If face not detected: Try different reference image or adjust strength

**Custom Nodes Required**:
- `PulidFluxModelLoader`
- `PulidFluxInsightFaceLoader`
- `PulidFluxEvaClipLoader`
- `ApplyPulidFlux`
- `FixPulidFluxPatch`
- RES4LYF nodes (for sampling)

**Models Required**:
- `pulid_flux_v0.9.1.safetensors` (PuLID model)
- `eva02_clip_l_14_plus.safetensors` (EVA CLIP)
- InsightFace models (antelopev2)

---

## Testing Checklist

### Basic Functionality
- [ ] `/z-image-simple` endpoint responds
- [ ] `/z-image-danrisi` endpoint responds
- [ ] `/z-image-instantid` endpoint responds
- [ ] `/z-image-pulid` endpoint responds

### Simple Workflow
- [ ] Generates image successfully
- [ ] Returns JPEG image
- [ ] Cost headers present
- [ ] Execution time reasonable (< 30s)

### Danrisi Workflow
- [ ] Generates image successfully
- [ ] Uses optimized sampler
- [ ] Quality better than simple
- [ ] No custom node errors

### InstantID Workflow
- [ ] Accepts reference image
- [ ] Generates image with face consistency
- [ ] Face matches reference (~85-90%)
- [ ] No InstantID node errors

### PuLID Workflow
- [ ] Accepts reference image
- [ ] Generates image with face consistency
- [ ] Face matches reference (~80-85%)
- [ ] No PuLID node errors

---

## Expected Results

### Performance Metrics

| Endpoint | Expected Time | Expected Cost | Quality |
|----------|--------------|---------------|---------|
| `/z-image-simple` | 5-10s | $0.003-0.007 | Good |
| `/z-image-danrisi` | 10-20s | $0.007-0.014 | Better |
| `/z-image-instantid` | 15-25s | $0.010-0.017 | Excellent (face) |
| `/z-image-pulid` | 15-25s | $0.010-0.017 | Excellent (face) |

### Face Consistency

| Method | Consistency | Best For |
|--------|------------|----------|
| InstantID | 85-90% | Single image, extreme angles |
| PuLID | 80-85% | Multiple images, better generalization |

---

## Common Errors and Solutions

### Error: "UNETLoader: Model not found"
**Solution**: Verify Z-Image models are in Modal volume:
```bash
modal run apps/modal/app.py::list_models
```

### Error: "Custom node not found"
**Solution**: Check custom nodes are installed in image build:
- RES4LYF: `apps/modal/image.py` should install `ComfyUI-res4lyf`
- InstantID: `apps/modal/image.py` should install `ComfyUI_InstantID`
- PuLID: `apps/modal/image.py` should install `ComfyUI_PuLID`

### Error: "Reference image required"
**Solution**: Ensure `--reference-image` argument points to valid file

### Error: "Face not detected"
**Solution**: 
- Try different reference image
- Ensure face is clearly visible
- Adjust `instantid_strength` or `pulid_strength`
- Try `--face-provider GPU` (if available)

---

## Next Steps After Testing

1. ✅ Document any issues found
2. ✅ Compare quality between workflows
3. ✅ Measure performance metrics
4. ✅ Update documentation with results
5. ✅ Optimize if needed

---

## References

- Implementation: `apps/modal/handlers/z_image.py`
- Status: `apps/modal/docs/status/Z-IMAGE-IMPLEMENTATION-STATUS.md`
- TypeScript Workflows: `libs/business/src/workflows/z-image-*.ts`
