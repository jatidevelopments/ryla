# IN-039: Modal Endpoint Optimization Plan

**Status**: Active  
**Created**: 2026-02-04  
**Updated**: 2026-02-04  
**Author**: AI Assistant  
**Related**: IN-038 (RunComfy Integration), EP-079 (Modal Playground)

---

## Executive Summary

Analyze our existing 8 Modal split apps (20+ endpoints) against the RunComfy workflow shortlist to identify gaps, optimization opportunities, and business value improvements for RYLA.

---

## 1. Current State: Modal Split Apps

| App | Endpoints/Functions | Use Cases | Status |
|-----|---------------------|-----------|--------|
| `ryla-flux` | 3 | T2I (fast/quality/LoRA) | ✅ Working |
| `ryla-instantid` | 5 | Face consistency (InstantID, PuLID, IPAdapter) | ✅ Working |
| `ryla-qwen-image` | 6 | T2I, Edit, Inpaint, Video Faceswap | ✅ Working |
| `ryla-z-image` | 3 | T2I (fast/LoRA) | ✅ Working |
| `ryla-wan26` | 3 | Video T2V, R2V, LoRA | ✅ Working |
| `ryla-seedvr2` | 1 | Upscaling | ✅ Working |
| `ryla-comfyui` | - | Monolithic (all workflows) | ✅ Working |
| `ryla-lora-training` | 4 | LoRA training (Flux, Qwen, Wan) | ✅ **Deployed** |
| **TOTAL** | **25+** | | 8 apps / 10 max |

---

## 2. RunComfy Shortlist: RYLA Use Cases

| # | Use Case | Required | RunComfy Workflow |
|---|----------|----------|-------------------|
| 1 | T2I (quality) | ✅ | FLUX Art Image / Qwen |
| 2 | T2I (fast) | ✅ | SDXL Turbo / Z-Image |
| 3 | Face consistency | ✅ | IPAdapter FaceID Plus / InstantID / PuLID |
| 4 | Image editing (inpaint/outpaint) | ✅ | Flux Klein Editing |
| 5 | Video T2V | ✅ | Hunyuan 1.5 / Wan 2.6 / SVD |
| 6 | Video I2V | ⚠️ | SVD + FreeU / LivePortrait |
| 7 | Upscaling | ✅ | ControlNet Tile + 4x UltraSharp / SeedVR2 |
| 8 | LoRA training | ⚠️ | Flux LoRA Training |
| 9 | Face swap | ✅ | ReActor (already in qwen-image) |

---

## 3. Gap Analysis: Modal vs RunComfy

### ✅ Well Covered (Modal has good coverage)

| Use Case | Modal Endpoint | Quality | Notes |
|----------|---------------|---------|-------|
| T2I (fast) | `/flux`, `/z-image-simple`, `/qwen-image-2512-fast` | ⭐⭐⭐ | Multiple fast options |
| T2I (quality) | `/flux-dev`, `/qwen-image-2512` | ⭐⭐⭐ | Good quality outputs |
| Face consistency | `/sdxl-instantid`, `/flux-pulid`, `/flux-ipadapter-faceid` | ⭐⭐⭐ | Strong coverage |
| Video T2V | `/wan2.6` | ⭐⭐ | Works but Hunyuan may be better |
| Upscaling | `/seedvr2` | ⭐⭐ | Good but ControlNet Tile is more flexible |
| Face swap | `/video-faceswap` | ⭐⭐ | ReActor in qwen-image |

### ⚠️ Gaps / Improvements Needed

| Use Case | Gap | Improvement | Business Value |
|----------|-----|-------------|----------------|
| **Video I2V** | No image-to-video | Add SVD/LivePortrait | Animate character images → videos |
| **Upscaling (quality)** | SeedVR2 only | Add ControlNet Tile + 4x UltraSharp | Higher quality upscales |
| **Image editing** | Qwen edit works but limited | Add Flux Klein editing | Better inpaint/outpaint/remove |
| **Video T2V (quality)** | Wan 2.6 is good | Add Hunyuan 1.5 as alternative | Better quality video |

### ✅ LoRA Training (NOW DEPLOYED)

All LoRA training apps have been **combined into a single app** (`ryla-lora-training`) and deployed:

| Function | Model | GPU | Timeout | Status |
|----------|-------|-----|---------|--------|
| `train_flux_lora` | Flux Dev | A100-80GB | 2h | ✅ Deployed |
| `train_qwen_lora` | Qwen-Image | A100-80GB | 2h | ✅ Deployed |
| `train_wan_lora` | Wan 2.6 (1.3B) | L40S | 4h | ✅ Deployed |
| `train_wan_lora_14b` | Wan 2.6 (14B) | A100-80GB | 8h | ✅ Deployed |

**Usage:** See `apps/modal/apps/lora-training/app.py` for function signatures and examples.

---

## 4. Improvement Plan: Prioritized Actions

### Phase 1: Quick Wins (Low effort, High value)

| Action | App | Effort | Business Value | Priority |
|--------|-----|--------|----------------|----------|
| **Test existing endpoints** | All | Low | Validate current capabilities | P0 |
| **Document endpoint quality** | All | Low | Know what we have | P0 |
| **Fix any broken endpoints** | All | Medium | Ensure reliability | P0 |

### Phase 2: High-Value Additions

| Action | New App/Endpoint | Effort | Business Value | Priority |
|--------|------------------|--------|----------------|----------|
| **Add Video I2V (SVD)** | `ryla-svd` or add to `ryla-wan26` | Medium | Animate character images | P1 |
| **Add ControlNet Tile Upscaling** | Add to `ryla-seedvr2` | Medium | Better upscaling quality | P1 |
| **Add Hunyuan Video 1.5** | `ryla-hunyuan` | High | Better quality video | P2 |

### Phase 3: Advanced Features

| Action | New App/Endpoint | Effort | Business Value | Priority |
|--------|------------------|--------|----------------|----------|
| ~~**Productionize LoRA Training**~~ | `ryla-lora-training` | ~~High~~ | ~~User-trained characters~~ | ✅ **DONE** |
| **Add Flux Klein Editing** | Add to `ryla-qwen-image` | Medium | Better editing | P2 |
| **Add LivePortrait** | New app | Medium | Animate portraits | P3 |

---

## 5. Endpoint Quality Assessment Tasks

Before adding new features, assess what we have:

### Task List: Test Each Endpoint

```
[ ] Test ryla-flux
    [ ] /flux - Flux Schnell (4 steps)
    [ ] /flux-dev - Flux Dev (20 steps)
    [ ] /flux-dev-lora - With LoRA

[ ] Test ryla-instantid
    [ ] /sdxl-instantid - Face consistency
    [ ] /flux-pulid - PuLID face
    [ ] /flux-ipadapter-faceid - IPAdapter

[ ] Test ryla-qwen-image
    [ ] /qwen-image-2512 - Quality T2I
    [ ] /qwen-image-2512-fast - Fast T2I
    [ ] /qwen-image-edit-2511 - Editing
    [ ] /qwen-image-inpaint-2511 - Inpainting
    [ ] /video-faceswap - Face swap

[ ] Test ryla-z-image
    [ ] /z-image-simple - Fast T2I
    [ ] /z-image-lora - With LoRA

[ ] Test ryla-wan26
    [ ] /wan2.6 - Text to video
    [ ] /wan2.6-r2v - Reference video
    [ ] /wan2.6-lora - With LoRA

[ ] Test ryla-seedvr2
    [ ] /seedvr2 - Upscaling
```

### Quality Metrics per Endpoint

For each endpoint, evaluate:

1. **Cold start time**: How long to start from cold?
2. **Inference time**: How long per request when warm?
3. **Output quality**: Rate 1-5 stars
4. **Reliability**: % success rate
5. **NSFW capability**: Yes/No
6. **Cost per image/video**: Estimated GPU cost

---

## 6. Business Value Mapping

### RYLA Core Features → Endpoints

| RYLA Feature | Primary Endpoint | Backup | Status |
|--------------|-----------------|--------|--------|
| **Character Creation** | `/flux-dev` or `/qwen-image-2512` | `/z-image-simple` | ✅ Covered |
| **Face Consistency** | `/sdxl-instantid` | `/flux-pulid` | ✅ Covered |
| **Studio Generation** | `/flux` | `/qwen-image-2512-fast` | ✅ Covered |
| **Image Editing** | `/qwen-image-edit-2511` | - | ⚠️ Needs testing |
| **Video Creation** | `/wan2.6` | - | ⚠️ Only T2V |
| **Upscaling** | `/seedvr2` | - | ✅ Covered |
| **Custom LoRA** | `/flux-dev-lora` | - | ⚠️ Needs training flow |

### Revenue Impact Matrix

| Improvement | User Impact | Revenue Potential | Effort |
|-------------|-------------|-------------------|--------|
| Video I2V | Create videos from character images | High | Medium |
| Better upscaling | Higher quality exports | Medium | Low |
| LoRA training | Personalized characters | Very High | High |
| Hunyuan Video | Better quality videos | Medium | High |
| Flux Klein | Better editing | Low | Medium |

---

## 7. Recommended Next Steps

### Immediate (This Week)

1. **Run endpoint health check**: Test all 21 endpoints, document results
2. **Identify broken endpoints**: Fix any that don't work
3. **Document quality baseline**: Rate each endpoint's output quality

### Short-term (Next 2 Weeks)

4. **Add Video I2V (SVD)**: High business value, medium effort
5. **Improve upscaling**: Add ControlNet Tile + 4x UltraSharp option

### Medium-term (Next Month)

6. **Add Hunyuan Video 1.5**: Better quality video generation
7. ~~**Productionize LoRA training**~~: ✅ **DONE** - Combined and deployed as `ryla-lora-training`

---

## 8. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Working endpoints | ? | 21/21 (100%) |
| Average cold start | ? | < 60 seconds |
| Average inference time | ? | < 30 seconds |
| Success rate | ? | > 95% |
| Use case coverage | 7/9 | 9/9 (100%) |

---

## Appendix: Endpoint URLs for Testing

```bash
# Flux
curl -X POST https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cat", "width": 512, "height": 512, "steps": 4}'

# InstantID
curl -X POST https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-instantid \
  -H "Content-Type: application/json" \
  -d '{"prompt": "portrait", "face_image": "base64..."}'

# Qwen Image
curl -X POST https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a woman", "width": 1024, "height": 1024}'

# Z-Image
curl -X POST https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-simple \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a landscape"}'

# Wan Video
curl -X POST https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a woman walking"}'

# Upscaling
curl -X POST https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run/seedvr2 \
  -H "Content-Type: application/json" \
  -d '{"image": "base64..."}'
```

---

## Related Documents

- [RYLA-RUNCOMFY-ONLY-SHORTLIST.md](../research/infrastructure/RYLA-RUNCOMFY-ONLY-SHORTLIST.md)
- [ENDPOINT-APP-MAPPING.md](../../apps/modal/ENDPOINT-APP-MAPPING.md)
- [IN-038: RunComfy Integration](./IN-038-runcomfy-workflow-catalog-integration.md)
