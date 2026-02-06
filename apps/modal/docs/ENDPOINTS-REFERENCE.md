# Modal.com Endpoints Reference

**Last Updated**: 2026-02-05  
**Provider**: Modal.com  
**GPU**: L40S ($0.000542/sec), A100-80GB ($0.00167/sec)  
**Total Endpoints**: 27

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
| **Video T2V**  | `/wan2.6`, `/wan2.6-lora`, `/wan2.6-r2v`                             | ryla-wan26                  |
| **Video I2V**  | `/wan2.6-i2v`, `/wan2.6-i2v-faceswap`, `/wan22-i2v`, `/wan22-i2v-faceswap` | ryla-wan26, ryla-wan22-i2v |
| **Face Swap**  | `/image-faceswap`, `/batch-video-faceswap`, `/video-faceswap`        | ryla-qwen-image             |
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
**Time**: ~35s | **Cost**: $0.019  
**App**: ryla-wan26 | **GPU**: L40S

```json
{
  "prompt": "string (required)",
  "negative_prompt": "string (optional)",
  "width": 832,
  "height": 480,
  "length": 33,
  "fps": 16,
  "steps": 30,
  "cfg": 6.0,
  "seed": "integer (optional)"
}
```

### `/wan2.6-i2v` - Wan 2.6 Image-to-Video

**Status**: ✅ Working  
**Time**: ~35s | **Cost**: $0.019  
**App**: ryla-wan26 | **GPU**: L40S  
**Quality**: ⭐⭐⭐⭐⭐ Best video quality

```json
{
  "prompt": "string (required)",
  "reference_image": "string (required, base64 data URL)",
  "negative_prompt": "string (optional)",
  "width": 832,
  "height": 480,
  "length": 33,
  "fps": 16,
  "steps": 30,
  "cfg": 6.0,
  "seed": "integer (optional)"
}
```

**Note**: Uses native WanImageToVideo node with full-precision 1.3B model. Best quality video endpoint.

### `/wan2.6-i2v-faceswap` - Wan 2.6 I2V + Face Swap

**Status**: ✅ Working  
**Time**: ~160s | **Cost**: $0.087  
**App**: ryla-wan26 → ryla-qwen-image | **GPU**: L40S

```json
{
  "prompt": "string (required)",
  "reference_image": "string (required, base64 data URL - source image to animate)",
  "face_image": "string (required, base64 data URL - face to swap in)",
  "negative_prompt": "string (optional)",
  "width": 832,
  "height": 480,
  "length": 33,
  "fps": 16,
  "steps": 30,
  "cfg": 6.0,
  "restore_face": true,
  "seed": "integer (optional)"
}
```

**Response**: MP4 video with face swapped

**Note**: Two-phase process - generates video with WAN 2.6 I2V, then delegates face swap to Qwen app's `/batch-video-faceswap`.

### `/wan2.6-lora` - Wan 2.6 + LoRA

**Status**: ✅ Working  
**Time**: ~47s | **Cost**: $0.025  
**App**: ryla-wan26 | **GPU**: L40S

```json
{
  "prompt": "string (required)",
  "lora_id": "string (required)",
  "lora_strength": 0.8,
  "width": 832,
  "height": 480,
  "length": 33,
  "fps": 16,
  "steps": 30,
  "cfg": 6.0,
  "seed": "integer (optional)"
}
```

### `/wan22-i2v` - WAN 2.2 Image-to-Video (GGUF)

**Status**: ✅ Working  
**Time**: ~240s | **Cost**: $0.130  
**App**: ryla-wan22-i2v | **GPU**: A100-80GB

```json
{
  "prompt": "string (required)",
  "source_image": "string (required, base64 data URL)",
  "negative_prompt": "string (optional)",
  "width": 832,
  "height": 480,
  "num_frames": 33,
  "fps": 16,
  "steps": 30,
  "cfg": 5.0,
  "seed": "integer (optional)"
}
```

**Response**: WebP animated image

**Note**: Uses 14B GGUF model. Slower but different visual style. Cold start takes 2-3 minutes.

### `/wan22-i2v-faceswap` - WAN 2.2 I2V + Face Swap

**Status**: ✅ Working  
**Time**: ~425s | **Cost**: $0.230  
**App**: ryla-wan22-i2v → ryla-qwen-image | **GPU**: A100-80GB

```json
{
  "prompt": "string (required)",
  "source_image": "string (required, base64 data URL - image to animate)",
  "face_image": "string (required, base64 data URL - face to swap in)",
  "negative_prompt": "string (optional)",
  "width": 832,
  "height": 480,
  "num_frames": 33,
  "fps": 16,
  "steps": 30,
  "cfg": 5.0,
  "restore_face": true,
  "seed": "integer (optional)"
}
```

**Response**: MP4 video with face swapped

**Note**: Two-phase process. Requires warm container - cold start may timeout.

### `/image-faceswap` - Single Image Face Swap

**Status**: ✅ Working  
**Time**: ~10s | **Cost**: $0.005  
**App**: ryla-qwen-image | **GPU**: L40S

```json
{
  "source_image": "string (required, base64 data URL - image to modify)",
  "reference_image": "string (required, base64 data URL - face to swap in)",
  "restore_face": true,
  "face_restore_visibility": 1.0
}
```

**Response**: PNG image with face swapped

### `/batch-video-faceswap` - Batch Video Face Swap

**Status**: ✅ Working  
**Time**: ~60-120s | **Cost**: $0.033-0.065  
**App**: ryla-qwen-image | **GPU**: L40S

```json
{
  "source_video": "string (required, base64 data URL - MP4 or WebP)",
  "reference_image": "string (required, base64 data URL - face to swap in)",
  "fps": 16,
  "restore_face": true,
  "face_restore_visibility": 1.0
}
```

**Response**: MP4 video with face swapped in all frames

**Note**: Processes video frame-by-frame. Supports both MP4 and animated WebP input.

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
