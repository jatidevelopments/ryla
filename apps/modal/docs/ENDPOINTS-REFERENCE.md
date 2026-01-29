# Modal.com Endpoints Reference

**Last Updated**: 2026-01-28  
**Base URL**: `https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run`  
**Provider**: Modal.com  
**GPU**: L40S ($0.000694/sec, ~$2.50/hr)

---

## Overview

This document provides comprehensive information about all Modal.com endpoints available in the RYLA platform, including:
- Endpoint paths and methods
- Models used and their sources
- Provider information
- Expected costs
- Status and testing information

**Total Endpoints**: 13

---

## Endpoints

### 1. `/flux-dev` - Flux Dev Text-to-Image

**Status**: ✅ **Working** (Primary MVP Model)  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg` (binary)

**Model**:
- **Name**: Flux Dev (FLUX.1-dev)
- **Provider**: Black Forest Labs
- **Source**: `black-forest-labs/FLUX.1-dev` (HuggingFace)
- **Components**:
  - UNET: `flux1-dev.safetensors` (~12 GB)
  - CLIP: `clip_l.safetensors` (~2 GB)
  - T5: `t5xxl_fp16.safetensors` (~5 GB)
  - VAE: `ae.safetensors` (~1 GB)
- **Total Size**: ~20 GB

**Request**:
```json
{
  "prompt": "string (required)",
  "negative_prompt": "string (optional, default: '')",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 20)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional, random if not provided)"
}
```

**Cost**:
- **Typical Time**: 10-20 seconds
- **Estimated Cost**: $0.007-0.014 per image
- **GPU**: L40S

**Usage**:
- Base image generation
- Studio generation
- Character base images

**Tested**: ✅ Yes (917 KB output)

---

### 2. `/flux` - Flux Schnell Text-to-Image

**Status**: ✅ **Working** (Fast Generation)  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg` (binary)

**Model**:
- **Name**: Flux Schnell
- **Provider**: Black Forest Labs
- **Source**: `Comfy-Org/flux1-schnell` (HuggingFace)
- **File**: `flux1-schnell-fp8.safetensors` (~8 GB)

**Request**:
```json
{
  "prompt": "string (required)",
  "negative_prompt": "string (optional)",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 4)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional)"
}
```

**Cost**:
- **Typical Time**: 3-5 seconds
- **Estimated Cost**: $0.002-0.003 per image
- **GPU**: L40S

**Usage**:
- Fast image generation
- Quick previews
- Low-latency workflows

**Tested**: ✅ Yes (1.6 MB output)

---

### 3. `/flux-ipadapter-faceid` - Flux Dev + IP-Adapter FaceID

**Status**: ✅ **Implemented** (Recommended for Flux Dev Face Consistency)  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg` (binary)

**Model**:
- **Base Model**: Flux Dev (see `/flux-dev` above)
- **Adapter**: XLabs-AI Flux IP-Adapter v2
- **Provider**: XLabs-AI
- **Source**: `XLabs-AI/flux-ip-adapter-v2` (HuggingFace)
- **Components**:
  - IP-Adapter: `ip_adapter.safetensors` (~500 MB)
  - CLIP Vision: `model.safetensors` (OpenAI VIT CLIP large, ~800 MB)
- **Custom Node**: `x-flux-comfyui` (XLabs-AI)
- **Compatibility**: ✅ Fully compatible with Flux Dev (no shape mismatch)

**Request**:
```json
{
  "prompt": "string (required)",
  "reference_image": "string (required, base64 data URL or file path)",
  "negative_prompt": "string (optional, default: '')",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 20)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional)",
  "ipadapter_strength": "float (optional, default: 0.8, range: 0.0-1.0)",
  "face_provider": "string (optional, default: 'CPU', options: 'CPU'|'GPU')"
}
```

**Cost**:
- **Typical Time**: 12-18 seconds
- **Estimated Cost**: $0.008-0.012 per image
- **GPU**: L40S

**Usage**:
- Profile picture generation
- Character face consistency
- Face swap workflows

**Face Consistency**: 80-85% match

**Tested**: ⏳ Pending (requires reference image)

**Notes**:
- ⭐ **Recommended for Flux Dev** (better than InstantID for Flux)
- Avoids ControlNet shape mismatch issues
- Uses IP-Adapter (not ControlNet) for compatibility

---

### 4. `/sdxl-instantid` - SDXL + InstantID Face Consistency

**Status**: ✅ **Implemented and Tested**  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg` (binary)

**Model**:
- **Base Model**: SDXL (Stable Diffusion XL)
- **Provider**: Stability AI
- **Source**: `stabilityai/stable-diffusion-xl-base-1.0` (HuggingFace)
- **Adapter**: InstantID
- **Provider**: InstantX
- **Source**: `InstantX/InstantID` (HuggingFace)
- **Components**:
  - SDXL: `sd_xl_base_1.0.safetensors` (~7 GB)
  - IP-Adapter: `ip-adapter.bin` (~1.69 GB)
  - ControlNet: `diffusion_pytorch_model.safetensors` (~2.50 GB)
  - InsightFace: antelopev2 models (~500 MB)

**Request**:
```json
{
  "prompt": "string (required)",
  "reference_image": "string (required, base64 data URL)",
  "negative_prompt": "string (optional)",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 20)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional)",
  "instantid_strength": "float (optional, default: 0.8)",
  "controlnet_strength": "float (optional, default: 0.8)",
  "face_provider": "string (optional, default: 'CPU')"
}
```

**Cost**:
- **Typical Time**: 15-25 seconds
- **Estimated Cost**: $0.010-0.017 per image
- **GPU**: L40S

**Usage**:
- Face consistency with SDXL
- Profile pictures (alternative to IP-Adapter)
- Character generation

**Face Consistency**: 85-90% match

**Tested**: ✅ Yes

**Notes**:
- ⭐ **Recommended for InstantID workflows**
- Best consistency (85-90%)
- Fully compatible with SDXL

---

### 5. `/flux-instantid` - Flux Dev + InstantID

**Status**: ❌ **Incompatible** (Not Recommended)  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg` (binary)

**Model**:
- **Base Model**: Flux Dev
- **Adapter**: InstantID
- **Issue**: ControlNet shape mismatch error

**Error**: `RuntimeError: mat1 and mat2 shapes cannot be multiplied (1x768 and 2816x1280)`

**Why It Fails**:
- InstantID ControlNet expects T5XXL embeddings (2816 dimensions)
- Flux Dev uses DualCLIP (T5XXL + CLIP-L)
- ApplyInstantID strips T5XXL, leaving only CLIP-L (768 dimensions)
- Result: Shape mismatch

**Recommendation**: Use `/flux-ipadapter-faceid` instead

---

### 6. `/flux-lora` - Flux Dev + LoRA Character Consistency

**Status**: ⏳ **Not Tested** (Requires LoRA File)  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg` (binary)

**Model**:
- **Base Model**: Flux Dev
- **Adapter**: LoRA (Low-Rank Adaptation)
- **Source**: User-trained LoRA files
- **Location**: Modal volume (per character)
- **Format**: `character-{id}.safetensors`
- **Size**: ~50-200 MB per LoRA

**Request**:
```json
{
  "prompt": "string (required)",
  "lora_id": "string (required, LoRA filename)",
  "negative_prompt": "string (optional)",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 20)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional)",
  "lora_strength": "float (optional, default: 0.8)",
  "trigger_word": "string (optional)"
}
```

**Cost**:
- **Typical Time**: 12-18 seconds
- **Estimated Cost**: $0.008-0.012 per image
- **GPU**: L40S

**Usage**:
- Character-specific generation
- High consistency (>95%)
- Requires LoRA training (15-45 minutes, $2-5 per character)

**Tested**: ⏳ Pending (requires LoRA file in Modal volume)

---

### 7. `/wan2` - Wan2.1 Text-to-Video

**Status**: ✅ **Working**  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/webp` (animated) or `video/mp4`

**Model**:
- **Name**: Wan2.1
- **Provider**: Kling AI
- **Source**: Custom ComfyUI workflow
- **Size**: ~20-24 GB VRAM required

**Request**:
```json
{
  "prompt": "string (required)",
  "negative_prompt": "string (optional)",
  "width": "integer (optional, default: 832)",
  "height": "integer (optional, default: 480)",
  "length": "integer (optional, default: 33, frames)",
  "fps": "integer (optional, default: 16)",
  "seed": "integer (optional)"
}
```

**Cost**:
- **Typical Time**: 60-120 seconds
- **Estimated Cost**: $0.042-0.083 per video
- **GPU**: L40S

**Usage**:
- Text-to-video generation
- Animated content
- Video workflows

**Tested**: ✅ Yes (1.1 MB output)

---

### 8. `/seedvr2` - SeedVR2 Realistic Upscaling

**Status**: ⏳ **Not Tested** (Requires Input Image)  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg` (binary)

**Model**:
- **Name**: SeedVR2
- **Provider**: Seed (Stability AI)
- **Source**: Custom ComfyUI workflow
- **Size**: ~12-16 GB VRAM required

**Request**:
```json
{
  "image": "string (required, base64 encoded)",
  "upscale_factor": "integer (optional, default: 2)",
  "seed": "integer (optional)"
}
```

**Cost**:
- **Typical Time**: 30-60 seconds
- **Estimated Cost**: $0.021-0.042 per upscale
- **GPU**: L40S

**Usage**:
- Image upscaling
- Quality enhancement
- High-resolution output

**Tested**: ⏳ Pending (requires input image)

---

### 9. `/workflow` - Custom Workflow Execution

**Status**: ⏳ **Not Tested** (Requires Workflow JSON)  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg`, `image/webp`, or `video/mp4` (depends on workflow)

**Model**: Any (depends on workflow)

**Request**:
```json
{
  "workflow": {
    "1": {
      "class_type": "CheckpointLoaderSimple",
      "inputs": { ... }
    },
    ...
  },
  "prompt": "string (optional, to inject into workflow)"
}
```

**Cost**:
- **Typical Time**: Varies (10-180 seconds)
- **Estimated Cost**: Varies ($0.007-0.125)
- **GPU**: L40S

**Usage**:
- Custom ComfyUI workflows
- Advanced generation pipelines
- Experimental features

**Tested**: ⏳ Pending (requires workflow JSON)

---

### 10. `/z-image-simple` - Z-Image-Turbo Simple

**Status**: ✅ **Implemented**  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg` (binary)

**Model**:
- **Name**: Z-Image-Turbo
- **Provider**: Z-Image (Lumina2)
- **Source**: Modal volume (pre-uploaded)
- **Components**:
  - UNET: `z_image_turbo_bf16.safetensors` (~12.3 GB)
  - CLIP: `qwen_3_4b.safetensors` (~8.0 GB)
  - VAE: `z-image-turbo-vae.safetensors` (~0.3 GB)
- **Total Size**: ~20.6 GB

**Request**:
```json
{
  "prompt": "string (required)",
  "negative_prompt": "string (optional, default: '')",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 9)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional)"
}
```

**Cost**:
- **Typical Time**: 5-10 seconds
- **Estimated Cost**: $0.003-0.007 per image
- **GPU**: L40S

**Usage**:
- Fast text-to-image generation
- No custom nodes required
- Good quality baseline

**Tested**: ⏳ Pending

**Notes**:
- Uses only built-in ComfyUI nodes
- Fastest Z-Image workflow
- No custom node dependencies

---

### 11. `/z-image-danrisi` - Z-Image-Turbo Danrisi (Optimized)

**Status**: ✅ **Implemented**  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg` (binary)

**Model**:
- **Base Model**: Z-Image-Turbo (see `/z-image-simple` above)
- **Optimization**: RES4LYF custom nodes
- **Custom Nodes Required**: RES4LYF (ClownsharKSampler_Beta, Sigmas Rescale, BetaSamplingScheduler)

**Request**:
```json
{
  "prompt": "string (required)",
  "negative_prompt": "string (optional, default: '')",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 20)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional)"
}
```

**Cost**:
- **Typical Time**: 10-20 seconds
- **Estimated Cost**: $0.007-0.014 per image
- **GPU**: L40S

**Usage**:
- Higher quality than simple workflow
- Optimized sampling
- Better detail preservation

**Tested**: ⏳ Pending

**Notes**:
- Requires RES4LYF custom nodes
- Better quality than simple workflow
- Uses optimized sampler

---

### 12. `/z-image-instantid` - Z-Image-Turbo + InstantID

**Status**: ✅ **Implemented**  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg` (binary)

**Model**:
- **Base Model**: Z-Image-Turbo
- **Adapter**: InstantID
- **Provider**: InstantX
- **Components**: Same as `/sdxl-instantid` InstantID components

**Request**:
```json
{
  "prompt": "string (required)",
  "reference_image": "string (required, base64 data URL)",
  "negative_prompt": "string (optional)",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 20)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional)",
  "instantid_strength": "float (optional, default: 0.8)",
  "controlnet_strength": "float (optional, default: 0.8)",
  "face_provider": "string (optional, default: 'CPU')"
}
```

**Cost**:
- **Typical Time**: 15-25 seconds
- **Estimated Cost**: $0.010-0.017 per image
- **GPU**: L40S

**Usage**:
- Face consistency with Z-Image-Turbo
- Profile picture generation
- Character face consistency

**Face Consistency**: 85-90% match

**Tested**: ⏳ Pending (requires reference image)

**Notes**:
- Works with Z-Image-Turbo models
- Better for extreme angles than PuLID
- Requires InstantID custom nodes

---

### 13. `/z-image-pulid` - Z-Image-Turbo + PuLID

**Status**: ✅ **Implemented**  
**Method**: `POST`  
**Content-Type**: `application/json`  
**Response**: `image/jpeg` (binary)

**Model**:
- **Base Model**: Z-Image-Turbo
- **Adapter**: PuLID
- **Provider**: PuLID (IDM-VTON)
- **Components**: PuLID models (pulid_flux_v0.9.1.safetensors, EVA CLIP, InsightFace)

**Request**:
```json
{
  "prompt": "string (required)",
  "reference_image": "string (required, base64 data URL)",
  "negative_prompt": "string (optional)",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 20)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional)",
  "pulid_strength": "float (optional, default: 0.8)",
  "pulid_start": "float (optional, default: 0.0)",
  "pulid_end": "float (optional, default: 1.0)",
  "face_provider": "string (optional, default: 'CPU')"
}
```

**Cost**:
- **Typical Time**: 15-25 seconds
- **Estimated Cost**: $0.010-0.017 per image
- **GPU**: L40S

**Usage**:
- Face consistency with Z-Image-Turbo
- Profile picture generation
- Character face consistency
- Better for multiple reference images

**Face Consistency**: 85-90% match

**Tested**: ⏳ Pending (requires reference image)

**Notes**:
- Works with Z-Image-Turbo models
- Better for multiple reference images
- Requires PuLID custom nodes

---

## Cost Summary

| Endpoint | Typical Time | Cost per Request | GPU |
|----------|-------------|------------------|-----|
| `/flux` | 3-5s | $0.002-0.003 | L40S |
| `/flux-dev` | 10-20s | $0.007-0.014 | L40S |
| `/flux-ipadapter-faceid` | 12-18s | $0.008-0.012 | L40S |
| `/sdxl-instantid` | 15-25s | $0.010-0.017 | L40S |
| `/flux-lora` | 12-18s | $0.008-0.012 | L40S |
| `/z-image-simple` | 5-10s | $0.003-0.007 | L40S |
| `/z-image-danrisi` | 10-20s | $0.007-0.014 | L40S |
| `/z-image-instantid` | 15-25s | $0.010-0.017 | L40S |
| `/z-image-pulid` | 15-25s | $0.010-0.017 | L40S |
| `/wan2` | 60-120s | $0.042-0.083 | L40S |
| `/seedvr2` | 30-60s | $0.021-0.042 | L40S |
| `/workflow` | Varies | Varies | L40S |

| Endpoint | Typical Time | Cost per Request | GPU |
|----------|-------------|------------------|-----|
| `/flux` | 3-5s | $0.002-0.003 | L40S |
| `/flux-dev` | 10-20s | $0.007-0.014 | L40S |
| `/flux-ipadapter-faceid` | 12-18s | $0.008-0.012 | L40S |
| `/sdxl-instantid` | 15-25s | $0.010-0.017 | L40S |
| `/flux-lora` | 12-18s | $0.008-0.012 | L40S |
| `/wan2` | 60-120s | $0.042-0.083 | L40S |
| `/seedvr2` | 30-60s | $0.021-0.042 | L40S |
| `/workflow` | Varies | Varies | L40S |

**GPU Pricing**: L40S = $0.000694/sec (~$2.50/hr)

**Note**: Costs are calculated based on actual execution time. Cold starts may add 5-10 seconds.

---

## Model Sources

### HuggingFace Repositories

| Model | Repository | Files |
|-------|-----------|-------|
| Flux Dev | `black-forest-labs/FLUX.1-dev` | `flux1-dev.safetensors`, `ae.safetensors` |
| Flux Text Encoders | `comfyanonymous/flux_text_encoders` | `clip_l.safetensors`, `t5xxl_fp16.safetensors` |
| Flux Schnell | `Comfy-Org/flux1-schnell` | `flux1-schnell-fp8.safetensors` |
| Flux IP-Adapter | `XLabs-AI/flux-ip-adapter-v2` | `ip_adapter.safetensors` |
| CLIP Vision | `openai/clip-vit-large-patch14` | `model.safetensors` |
| SDXL | `stabilityai/stable-diffusion-xl-base-1.0` | `sd_xl_base_1.0.safetensors` |
| InstantID | `InstantX/InstantID` | `ip-adapter.bin`, `diffusion_pytorch_model.safetensors` |
| Z-Image-Turbo | Modal volume (pre-uploaded) | `z_image_turbo_bf16.safetensors`, `z-image-turbo-vae.safetensors`, `qwen_3_4b.safetensors` |
| PuLID | Modal volume (pre-uploaded) | `pulid_flux_v0.9.1.safetensors` |

### Custom Nodes

| Node | Repository | Purpose |
|------|-----------|---------|
| x-flux-comfyui | `XLabs-AI/x-flux-comfyui` | Flux IP-Adapter support |
| ComfyUI-InstantID | `InstantX/ComfyUI-InstantID` | InstantID support |
| RES4LYF | Custom nodes | Z-Image optimization (ClownsharKSampler_Beta, etc.) |
| PuLID | Custom nodes | PuLID face consistency |
| SeedVR2 | Custom workflow | Video upscaling |

---

## Response Headers

All endpoints return cost tracking information in response headers:

- `X-Cost-USD`: Total cost in USD (e.g., "0.001388")
- `X-Execution-Time-Sec`: Execution time in seconds (e.g., "2.000")
- `X-GPU-Type`: GPU type used (e.g., "L40S")

---

## Status Summary

| Endpoint | Status | Tested | Working |
|----------|--------|--------|---------|
| `/flux` | ✅ Working | ✅ Yes | ✅ Yes |
| `/flux-dev` | ✅ Working | ✅ Yes | ✅ Yes |
| `/flux-ipadapter-faceid` | ✅ Implemented | ⏳ Pending | ⏳ Pending |
| `/sdxl-instantid` | ✅ Implemented | ✅ Yes | ✅ Yes |
| `/flux-instantid` | ❌ Incompatible | ❌ No | ❌ No |
| `/flux-lora` | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| `/z-image-simple` | ✅ Implemented | ⏳ Pending | ⏳ Pending |
| `/z-image-danrisi` | ✅ Implemented | ⏳ Pending | ⏳ Pending |
| `/z-image-instantid` | ✅ Implemented | ⏳ Pending | ⏳ Pending |
| `/z-image-pulid` | ✅ Implemented | ⏳ Pending | ⏳ Pending |
| `/wan2` | ✅ Working | ✅ Yes | ✅ Yes |
| `/seedvr2` | ⏳ Pending | ⏳ Pending | ⏳ Pending |
| `/workflow` | ⏳ Pending | ⏳ Pending | ⏳ Pending |

**Tested**: 4/13 (31%)  
**Working**: 4/4 tested (100%)  
**Implemented**: 10/13 (77%)

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

### For Fast Generation
- **Use**: `/flux` (Flux Schnell)
- **Reason**: Fastest generation (3-5s)
- **Cost**: Lowest cost per image

### For High Quality
- **Use**: `/flux-dev`
- **Reason**: Primary MVP model, best quality
- **Cost**: Moderate ($0.007-0.014)

### For Z-Image-Turbo Generation
- **Use**: `/z-image-simple` (fast) or `/z-image-danrisi` (quality)
- **Reason**: Z-Image-Turbo model, optimized workflows
- **Cost**: $0.003-0.014 per image

### For Z-Image-Turbo Face Consistency
- **Use**: `/z-image-instantid` (extreme angles) or `/z-image-pulid` (multiple refs)
- **Reason**: Face consistency with Z-Image-Turbo
- **Consistency**: 85-90%

---

## Related Documentation

- **Cost Tracking**: `apps/modal/docs/COST-TRACKING.md`
- **Face Consistency**: `apps/modal/docs/FLUX-FACE-CONSISTENCY-SUMMARY.md`
- **IP-Adapter Research**: `apps/modal/docs/FLUX-IPADAPTER-FACEID-RESEARCH.md`
- **Deployment**: `apps/modal/docs/DEPLOYMENT.md`
- **External Dependencies**: `docs/specs/general/EXTERNAL-DEPENDENCIES.md`

---

**Last Updated**: 2026-01-28
