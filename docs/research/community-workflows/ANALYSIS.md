# Community ComfyUI Workflows Analysis

Analysis of 16 workflows from the Instara community for potential MVP use.

## Quick Summary

| Category | Workflows | MVP Relevance | Priority |
|----------|-----------|---------------|----------|
| **Image Generation (T2I)** | 1GIRL V3, InstagirlMix T2I | ⭐⭐⭐ High | P1 |
| **Image-to-Video (I2V)** | InstagirlMix I2V, Wan-animate | ⭐⭐ Medium | P2 |
| **Talking Head (Audio)** | InfiniteTalk I2V/V2V | ⭐ Low | P3 |
| **Video Processing** | Interpolate Upscale, SeedVR2 | ⭐ Low | P4 |

---

## Category 1: Image Generation (T2I) — **MVP RELEVANT**

### 1GIRL (STAND-ALONE) V3

**Purpose**: Generate high-quality female portraits (influencer-style)

**Models Required**:
- `qwen_image_bf16.safetensors` (diffusion) — 12GB
- `qwen_2.5_vl_7b.safetensors` (text encoder) — 7.5GB
- `qwen_image_vae.safetensors` (VAE) — ~300MB
- `1GIRL_QWEN_V3.safetensors` (LoRA) — ~1GB

**Custom Nodes**:
- `RES4LYF` — ClownsharKSampler_Beta, ModelSamplingAuraFlow
- `comfy-image-saver` — Seed Generator

**Key Parameters**:
- Resolution: 1440×1920 (portrait)
- Sampler: ClownsharKSampler_Beta with `beta57` scheduler
- Steps: 50
- CFG: 0.5

**MVP Fit**: ⭐⭐⭐ **HIGH**
- Great for base image generation (EP-005)
- High quality female portraits = core RYLA use case
- Same architecture as Z-Image (Qwen-based)

**Estimated Model Size**: ~21GB additional

---

### InstagirlMix T2I FP16 V1

**Purpose**: Alternative T2I using Wan 2.2 models with multiple LoRAs

**Models Required**:
- `wan2.2_t2v_high_noise_14B_fp16.safetensors`
- `wan2.2_t2v_low_noise_14B_fp16.safetensors`
- `umt5_xxl_fp8_e4m3fn_scaled.safetensors` (CLIP)
- `Wan2_1_VAE_bf16.safetensors`
- Multiple LoRAs: `WAN2.2_HighNoise_InstagirlMix_V1`, `WAN2.2_LowNoise_InstagirlMix_V1`, `l3n0v0`, etc.

**Custom Nodes**:
- `comfyui-kjnodes` — TorchCompileModelWanVideoV2, PathchSageAttentionKJ
- `comfy-image-saver`

**Key Parameters**:
- Two-stage sampling (high noise → low noise)
- Steps: 12 total (4 high, 8 low)
- Resolution: 960×1280

**MVP Fit**: ⭐⭐ **MEDIUM**
- More complex than 1GIRL
- Requires Wan 2.2 14B models (~28GB each)
- Better for video generation starting point

---

## Category 2: Image-to-Video (I2V) — **Future Feature**

### InstagirlMix I2V Fast V1

**Purpose**: Convert static image to short video (5 seconds)

**Models Required**:
- `wan2.2_i2v_high_noise_14B_fp8_scaled.safetensors`
- `wan2.2_i2v_low_noise_14B_fp8_scaled.safetensors`
- `umt5_xxl_fp8_e4m3fn_scaled.safetensors`
- `Wan2_1_VAE_bf16.safetensors`
- `Wan21_T2V_14B_lightx2v_cfg_step_distill_lora_rank32.safetensors`

**Key Features**:
- Two-stage KSampler (high noise → low noise)
- TorchCompile + SageAttention for speed
- 121 frames at 24fps = ~5 seconds

**MVP Fit**: ⭐⭐ **MEDIUM** (for Phase 2)
- Great for "bring photos to life" feature
- Requires significant GPU (24GB+)
- Could be premium feature

---

### Wan-animate V1

**Purpose**: Another I2V workflow variant

**MVP Fit**: ⭐ **LOW** — Similar to above, less documented

---

## Category 3: Talking Head / Audio-Driven — **Not MVP**

### InfiniteTalk I2V 720p V3

**Purpose**: Generate video from image + audio (lip sync)

**Models Required**:
- `wan2.1_i2v_720p_14B_bf16.safetensors` (~28GB)
- `Wan2_1-InfiniTetalk-Single_fp16.safetensors`
- `lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors`
- `MelBandRoformer_fp16.safetensors` (vocal separator)
- `wav2vec2-chinese-base_fp16.safetensors`
- `clip_vision_h.safetensors`

**Custom Nodes**:
- `ComfyUI-WanVideoWrapper` — Full video generation pipeline
- `ComfyUI-MelBandRoFormer` — Audio separation
- `comfyui-kjnodes`

**MVP Fit**: ⭐ **LOW**
- Very complex workflow
- Massive model requirements (~50GB+)
- Not core MVP scope

---

### InfiniteTalk SONG V2V / V2V 720P

**Purpose**: Lip-sync existing video to new audio

**MVP Fit**: ⭐ **LOW** — Same issues as above

---

## Category 4: Video Processing — **Not MVP**

### INTERPOLATE UPSCALE V2

**Purpose**: Upscale video resolution + frame interpolation

**Models**:
- `rife47.pth` (frame interpolation)
- `seedvr2_ema_7b_fp16.safetensors` (upscaling)

**Custom Nodes**:
- `comfyui-frame-interpolation` — RIFE VFI
- `ComfyUI-SeedVR2_VideoUpscaler`
- `comfyui-videohelpersuite`
- `comfyui-easy-use`

**MVP Fit**: ⭐ **LOW**
- Post-processing, not generation
- Nice to have after core features work

---

## MVP Recommendation

### Phase 1: Core Image Generation
Use **Z-Image-Turbo** (already working) + consider adding **1GIRL** for variety:

```
Current:
✅ Z-Image-Turbo (21GB) — Fast, good quality

Consider Adding:
⭐ 1GIRL V3 (~21GB additional) — Higher quality portraits
```

### Phase 2: Expanded Features
Add I2V for "bring photos to life":

```
⭐ InstagirlMix I2V Fast — Image to 5-second video
```

### Phase 3: Premium Features
Audio-driven features for engagement:

```
⭐ InfiniteTalk — Talking avatars (requires 48GB+ VRAM)
```

---

## Model Storage Impact

| Scenario | Additional Storage | Total Network Volume |
|----------|-------------------|---------------------|
| Current (Z-Image only) | 0 | ~21GB |
| + 1GIRL V3 | +21GB | ~42GB |
| + I2V Fast | +30GB | ~72GB |
| + InfiniteTalk | +50GB | ~122GB |

**Recommendation**: Start with current setup, add 1GIRL only if quality insufficient.

---

## Technical Blockers

### Custom Nodes Required

| Workflow | Required Nodes | Already Installed? |
|----------|----------------|-------------------|
| 1GIRL V3 | res4lyf | ✅ Yes |
| InstagirlMix T2I | comfyui-kjnodes | ❌ No |
| I2V Fast | comfyui-kjnodes | ❌ No |
| InfiniteTalk | ComfyUI-WanVideoWrapper, MelBandRoFormer | ❌ No |

### VRAM Requirements

| Workflow | Min VRAM | Recommended |
|----------|----------|-------------|
| Z-Image-Turbo | 16GB | 24GB |
| 1GIRL V3 | 16GB | 24GB |
| I2V Fast | 24GB | 48GB |
| InfiniteTalk | 48GB | 80GB |

---

## Conclusion

**For MVP (EP-005)**:
1. ✅ Keep Z-Image-Turbo as primary — already working
2. ⏳ Add 1GIRL V3 only if portrait quality is insufficient
3. ❌ Skip all video workflows for now

**Decision**: Current setup is sufficient for MVP. These workflows are valuable for future phases but add complexity without immediate value.

