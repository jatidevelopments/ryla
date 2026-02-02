# Modal.com Endpoints Reference

**Last Updated**: 2026-02-02  
**Provider**: Modal.com  
**GPU**: L40S ($0.000542/sec, ~$1.95/hr)  
**Total Endpoints**: 21

---

## Quick Reference

| Category       | Endpoints                                                            | App                         |
| -------------- | -------------------------------------------------------------------- | --------------------------- |
| **Flux**       | `/flux`, `/flux-dev`, `/flux-dev-lora`                               | ryla-flux                   |
| **SDXL**       | `/sdxl-turbo`, `/sdxl-lightning`                                     | ryla-instantid              |
| **Face**       | `/sdxl-instantid`, `/flux-pulid`, `/flux-ipadapter-faceid`           | ryla-instantid              |
| **Qwen Image** | `/qwen-image-2512`, `/qwen-image-2512-fast`, `/qwen-image-2512-lora` | ryla-qwen-image             |
| **Qwen Edit**  | `/qwen-image-edit-2511`, `/qwen-image-inpaint-2511`                  | ryla-qwen-edit              |
| **Z-Image**    | `/z-image-simple`, `/z-image-danrisi`, `/z-image-lora`               | ryla-z-image                |
| **Video**      | `/wan2.6`, `/wan2.6-r2v`, `/wan2.6-lora`, `/video-faceswap`          | ryla-wan26, ryla-qwen-image |
| **Upscaling**  | `/seedvr2`                                                           | ryla-seedvr2                |

---

## Endpoints

### `/flux` - Flux Schnell Text-to-Image

**Status**: ✅ Working  
**Time**: ~29s | **Cost**: $0.016

```json
{
  "prompt": "string (required)",
  "negative_prompt": "string (optional)",
  "width": 1024,
  "height": 1024,
  "steps": 4,
  "cfg": 1.0,
  "seed": "integer (optional)"
}
```

### `/flux-dev` - Flux Dev Text-to-Image

**Status**: ✅ Working  
**Time**: ~37s | **Cost**: $0.020

```json
{
  "prompt": "string (required)",
  "negative_prompt": "string (optional)",
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "cfg": 1.0,
  "seed": "integer (optional)"
}
```

### `/flux-dev-lora` - Flux Dev + LoRA

**Status**: ✅ Working  
**Time**: ~60s | **Cost**: $0.033

```json
{
  "prompt": "string (required)",
  "lora_id": "string (required)",
  "lora_strength": 0.8,
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "seed": "integer (optional)"
}
```

### `/sdxl-instantid` - SDXL + InstantID Face Consistency

**Status**: ✅ Working  
**Time**: ~29s | **Cost**: $0.016  
**Face Match**: 85-90%

```json
{
  "prompt": "string (required)",
  "reference_image": "string (required, base64 data URL)",
  "sdxl_checkpoint": "sd_xl_base_1.0.safetensors",
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "cfg": 5.0,
  "instantid_strength": 0.8,
  "controlnet_strength": 0.8,
  "seed": "integer (optional)"
}
```

**Checkpoint options**:

- `sd_xl_base_1.0.safetensors` (default)
- `RealVisXL_V4.0.safetensors`
- `Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors`

### `/sdxl-turbo` - SDXL Turbo Fast

**Status**: ✅ Working  
**Time**: ~45s | **Cost**: $0.024

```json
{
  "prompt": "string (required)",
  "width": 1024,
  "height": 1024,
  "steps": 4,
  "cfg": 0.0,
  "seed": "integer (optional)"
}
```

### `/sdxl-lightning` - SDXL Lightning 4-Step

**Status**: ✅ Working  
**Time**: ~66s | **Cost**: $0.036

```json
{
  "prompt": "string (required)",
  "width": 1024,
  "height": 1024,
  "steps": 4,
  "cfg": 1.0,
  "seed": "integer (optional)"
}
```

### `/flux-pulid` - Flux + PuLID Face Consistency

**Status**: ✅ Working  
**Time**: ~83s | **Cost**: $0.045  
**Face Match**: 80-85%

```json
{
  "prompt": "string (required)",
  "reference_image": "string (required, base64 data URL)",
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "cfg": 1.0,
  "pulid_strength": 0.8,
  "seed": "integer (optional)"
}
```

### `/flux-ipadapter-faceid` - Flux + IP-Adapter

**Status**: ✅ Working  
**Time**: ~60s | **Cost**: $0.033  
**Face Match**: 75-80%

```json
{
  "prompt": "string (required)",
  "reference_image": "string (required, base64 data URL)",
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "cfg": 3.5,
  "ipadapter_strength": 0.8,
  "seed": "integer (optional)"
}
```

### `/qwen-image-2512` - Qwen Image High Quality

**Status**: ✅ Working  
**Time**: ~103s | **Cost**: $0.056

```json
{
  "prompt": "string (required)",
  "width": 1328,
  "height": 1328,
  "steps": 50,
  "cfg": 4.0,
  "seed": "integer (optional)"
}
```

### `/qwen-image-2512-fast` - Qwen Image Fast

**Status**: ✅ Working  
**Time**: ~73s | **Cost**: $0.040

```json
{
  "prompt": "string (required)",
  "width": 1328,
  "height": 1328,
  "steps": 4,
  "cfg": 1.0,
  "seed": "integer (optional)"
}
```

### `/qwen-image-2512-lora` - Qwen Image + LoRA

**Status**: ✅ Working  
**Time**: ~143s | **Cost**: $0.078

```json
{
  "prompt": "string (required)",
  "lora_id": "string (required)",
  "lora_strength": 0.8,
  "width": 1328,
  "height": 1328,
  "steps": 50,
  "cfg": 4.0,
  "seed": "integer (optional)"
}
```

### `/video-faceswap` - Video Face Swap

**Status**: ✅ Working  
**Time**: ~85s | **Cost**: $0.046

```json
{
  "source_video": "string (required, base64 MP4)",
  "reference_image": "string (required, base64 face image)",
  "fps": 24,
  "restore_face": true,
  "face_restore_visibility": 1.0
}
```

**Note**: Requires MP4 video input (animated WEBP not supported)

### `/z-image-simple` - Z-Image Turbo

**Status**: ✅ Working  
**Time**: ~51s | **Cost**: $0.028

```json
{
  "prompt": "string (required)",
  "width": 1024,
  "height": 1024,
  "steps": 4,
  "cfg": 0.0,
  "seed": "integer (optional)"
}
```

### `/z-image-danrisi` - Z-Image (Minimal Cold Start)

**Status**: ✅ Working  
**Time**: ~6s | **Cost**: $0.003

```json
{
  "prompt": "string (required)",
  "width": 1024,
  "height": 1024,
  "steps": 4,
  "cfg": 1.0,
  "seed": "integer (optional)"
}
```

### `/z-image-lora` - Z-Image + LoRA

**Status**: ✅ Working  
**Time**: ~29s | **Cost**: $0.016

```json
{
  "prompt": "string (required)",
  "lora_id": "string (required)",
  "lora_strength": 0.8,
  "width": 1024,
  "height": 1024,
  "steps": 8,
  "cfg": 4.5,
  "seed": "integer (optional)"
}
```

### `/wan2.6` - Wan 2.6 Text-to-Video

**Status**: ✅ Working  
**Time**: ~29s | **Cost**: $0.016

```json
{
  "prompt": "string (required)",
  "width": 480,
  "height": 480,
  "length": 17,
  "fps": 16,
  "steps": 20,
  "cfg": 5.0,
  "seed": "integer (optional)"
}
```

### `/wan2.6-lora` - Wan 2.6 + LoRA

**Status**: ✅ Working  
**Time**: ~47s | **Cost**: $0.025

```json
{
  "prompt": "string (required)",
  "lora_id": "string (required)",
  "lora_strength": 0.8,
  "width": 480,
  "height": 480,
  "length": 17,
  "fps": 16,
  "steps": 30,
  "cfg": 5.0,
  "seed": "integer (optional)"
}
```

### `/wan2.6-r2v` - Wan 2.6 Reference-to-Video

**Status**: ⏸️ Untested (requires reference videos)

```json
{
  "prompt": "string (required)",
  "reference_videos": ["base64 video array"],
  "width": 480,
  "height": 480,
  "length": 17,
  "fps": 16,
  "steps": 30,
  "cfg": 5.0,
  "seed": "integer (optional)"
}
```

### `/seedvr2` - SeedVR2 Image Upscaling

**Status**: ✅ Working  
**Time**: ~208s | **Cost**: $0.113

```json
{
  "image": "string (required, base64 data URL)",
  "scale": 2
}
```

---

## Response Headers

All endpoints return cost tracking in headers:

```
X-Cost-USD: 0.016541
X-Execution-Time-Sec: 30.500
X-GPU-Type: L40S
X-Model: flux-dev
X-Steps: 20
```

---

## Removed Endpoints

| Endpoint             | Reason               | Alternative       |
| -------------------- | -------------------- | ----------------- |
| `/wan2`              | Wan 2.1 deprecated   | `/wan2.6`         |
| `/flux-instantid`    | Shape mismatch       | `/sdxl-instantid` |
| `/z-image-instantid` | Encoder incompatible | `/sdxl-instantid` |
| `/z-image-pulid`     | Encoder incompatible | `/flux-pulid`     |

---

## Related Documentation

- Endpoint Mapping: `apps/modal/ENDPOINT-APP-MAPPING.md`
- Cost Report: `docs/technical/infrastructure/MODAL-ENDPOINT-COST-REPORT.md`
- Benchmark Results: `apps/modal/docs/status/BENCHMARK-RESULTS.md`
