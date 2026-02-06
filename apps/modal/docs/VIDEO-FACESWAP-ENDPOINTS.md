# Video Generation & Face Swap Endpoints

**Last Updated**: 2026-02-05  
**Status**: ✅ Production Ready

---

## Summary

RYLA provides video generation and face swap capabilities through three Modal apps:
- **ryla-wan26** - WAN 2.6 text-to-video and image-to-video (best quality, fastest)
- **ryla-wan22-i2v** - WAN 2.2 image-to-video with GGUF models (14B parameter)
- **ryla-qwen-image** - Face swap service (used by video endpoints for face swap)

---

## Endpoints Overview

| Endpoint | App | GPU | Time | Use Case |
|----------|-----|-----|------|----------|
| `/wan2.6` | ryla-wan26 | L40S | ~35s | Text-to-video |
| `/wan2.6-i2v` | ryla-wan26 | L40S | ~35s | Image-to-video (best quality) |
| `/wan2.6-i2v-faceswap` | ryla-wan26 | L40S | ~160s | I2V + face swap |
| `/wan22-i2v` | ryla-wan22-i2v | A100-80GB | ~240s | I2V with 14B GGUF model |
| `/wan22-i2v-faceswap` | ryla-wan22-i2v | A100-80GB | ~425s | I2V + face swap |
| `/image-faceswap` | ryla-qwen-image | L40S | ~10s | Single image face swap |
| `/batch-video-faceswap` | ryla-qwen-image | L40S | ~60-120s | Video face swap (frame by frame) |

---

## Face Swap Architecture

### Problem: OOM with Combined Models
Running video generation models (especially 14B WAN 2.2) and face swap models (ReActor) in the same container causes Out-Of-Memory crashes.

### Solution: Delegated Face Swap
Video endpoints delegate face swapping to the Qwen app:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Face Swap Flow                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Client Request                                                  │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────┐                                            │
│  │ WAN 2.6/2.2 App │                                            │
│  │ (I2V FaceSwap)  │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           │ 1. Generate video (WebP)                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐    HTTP POST     ┌──────────────────────┐  │
│  │ Encode WebP     │ ────────────────▶│ Qwen App             │  │
│  │ as Base64       │                  │ /batch-video-faceswap│  │
│  └────────┬────────┘                  └──────────┬───────────┘  │
│           │                                      │               │
│           │                                      │ 2. Extract    │
│           │                                      │    frames     │
│           │                                      │ 3. Face swap  │
│           │                                      │    each frame │
│           │                                      │ 4. Encode MP4 │
│           │                                      │               │
│           │                  MP4 Response        │               │
│           ◀──────────────────────────────────────┘               │
│           │                                                      │
│           ▼                                                      │
│  Response (MP4 video with swapped face)                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Endpoint Details

### WAN 2.6 Text-to-Video (`/wan2.6`)

**URL**: `https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6`

**Parameters**:
```json
{
  "prompt": "A woman walking in a park",
  "negative_prompt": "blur, low quality",
  "width": 832,
  "height": 480,
  "length": 33,
  "steps": 30,
  "cfg": 6.0,
  "fps": 16,
  "seed": null
}
```

**Response**: WebP animated image

---

### WAN 2.6 Image-to-Video (`/wan2.6-i2v`)

**URL**: `https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-i2v`

**Parameters**:
```json
{
  "prompt": "A woman smiling and looking at camera",
  "reference_image": "data:image/jpeg;base64,...",
  "negative_prompt": "blur, low quality",
  "width": 832,
  "height": 480,
  "length": 33,
  "steps": 30,
  "cfg": 6.0,
  "fps": 16,
  "seed": null
}
```

**Response**: WebP animated image

**Quality Notes**: This is the highest quality video endpoint due to:
- Native ComfyUI I2V path (WanImageToVideo node)
- Full-precision 1.3B model (no quantization)
- Standard VAEDecode

---

### WAN 2.6 I2V + Face Swap (`/wan2.6-i2v-faceswap`)

**URL**: `https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-i2v-faceswap`

**Parameters**:
```json
{
  "prompt": "A woman smiling and looking at camera",
  "reference_image": "data:image/jpeg;base64,...",
  "face_image": "data:image/jpeg;base64,...",
  "negative_prompt": "blur, low quality",
  "width": 832,
  "height": 480,
  "length": 33,
  "steps": 30,
  "cfg": 6.0,
  "fps": 16,
  "restore_face": true,
  "seed": null
}
```

**Response**: MP4 video with face swapped

**Notes**:
- `reference_image` = source image to animate
- `face_image` = face to swap into the video

---

### WAN 2.2 Image-to-Video (`/wan22-i2v`)

**URL**: `https://ryla--ryla-wan22-i2v-comfyui-fastapi-app.modal.run/wan22-i2v`

**Parameters**:
```json
{
  "prompt": "A woman smiling gently",
  "source_image": "data:image/jpeg;base64,...",
  "negative_prompt": "blur, low quality",
  "width": 832,
  "height": 480,
  "num_frames": 33,
  "steps": 30,
  "cfg": 5.0,
  "fps": 16,
  "seed": null
}
```

**Response**: WebP animated image

**Notes**:
- Uses 14B GGUF model (larger, slower, but different style)
- Requires A100-80GB GPU
- Cold start takes 2-3 minutes

---

### WAN 2.2 I2V + Face Swap (`/wan22-i2v-faceswap`)

**URL**: `https://ryla--ryla-wan22-i2v-comfyui-fastapi-app.modal.run/wan22-i2v-faceswap`

**Parameters**:
```json
{
  "prompt": "A woman smiling gently",
  "source_image": "data:image/jpeg;base64,...",
  "face_image": "data:image/jpeg;base64,...",
  "negative_prompt": "blur, low quality",
  "width": 832,
  "height": 480,
  "num_frames": 33,
  "steps": 30,
  "cfg": 5.0,
  "fps": 16,
  "restore_face": true,
  "seed": null
}
```

**Response**: MP4 video with face swapped

**Notes**:
- `source_image` = image to animate
- `face_image` = face to swap in
- Total time ~425s (4min video gen + 3min face swap)

---

## Cold Start Considerations

### WAN 2.6 App
- **Cold start**: ~60s
- **Container keepalive**: 5 minutes
- **Recommendation**: Pre-warm before batch operations

### WAN 2.2 I2V App
- **Cold start**: 2-3 minutes (loads 14B GGUF model)
- **Container keepalive**: 5 minutes
- **Recommendation**: Send health check to warm container before actual requests
- **Warning**: Face swap requests on cold container may timeout

### Qwen App
- **Cold start**: ~60s
- **Container keepalive**: 5 minutes
- **Recommendation**: Usually warm due to other image operations

---

## Testing

### Test Script
```bash
cd /Users/admin/Documents/Projects/RYLA
python3 apps/modal/scripts/test-video-faceswap.py
```

### Test Output Directory
```
apps/modal/test-output/
├── wan26_t2v_*.webp
├── wan26_i2v_*.webp
├── wan26_i2v_faceswap_*.mp4
├── wan22_i2v_*.webp
└── wan22_i2v_faceswap_*.mp4
```

---

## Quality Comparison

| Endpoint | Quality | Speed | Best For |
|----------|---------|-------|----------|
| WAN 2.6 I2V | ⭐⭐⭐⭐⭐ | Fast (~35s) | Production, best quality |
| WAN 2.6 T2V | ⭐⭐⭐⭐ | Fast (~35s) | Text-based generation |
| WAN 2.2 I2V | ⭐⭐⭐ | Slow (~240s) | Different style, 14B model |

**Recommendation**: Use WAN 2.6 I2V for production workloads due to superior quality and speed.

---

## Related Documentation

- **Quality Learnings**: `docs/research/infrastructure/WAN-VIDEO-QUALITY-LEARNINGS.md`
- **Endpoint Integration**: `apps/modal/docs/MODAL-ENDPOINT-INTEGRATION-STATUS.md`
- **Test Script**: `apps/modal/scripts/test-video-faceswap.py`

---

## Handler Files

- WAN 2.6: `apps/modal/handlers/wan26.py`
- WAN 2.2 I2V: `apps/modal/handlers/wan22_i2v.py`
- Qwen (Face Swap): `apps/modal/handlers/qwen_image.py`

---

**Last Updated**: 2026-02-05
