# Endpoint to App Mapping

**Last Updated**: 2026-02-04  
**Purpose**: Map all Modal endpoints to their corresponding apps

---

## Deployed Apps (8 Total)

| App Name            | Description                                        | GPU           | Status  |
| ------------------- | -------------------------------------------------- | ------------- | ------- |
| `ryla-flux`         | Flux Schnell/Dev + LoRA                            | L40S          | ✅ Live |
| `ryla-instantid`    | Face Consistency (InstantID, PuLID, IP-Adapter)    | L40S          | ✅ Live |
| `ryla-qwen-image`   | Qwen-Image 2512 + Edit/Inpaint + Video Faceswap    | L40S          | ✅ Live |
| `ryla-z-image`      | Z-Image-Turbo T2I                                  | L40S          | ✅ Live |
| `ryla-wan26`        | Wan 2.6 Video                                      | L40S          | ✅ Live |
| `ryla-seedvr2`      | Image Upscaling                                    | L40S          | ✅ Live |
| `ryla-comfyui`      | Monolithic ComfyUI (all workflows)                 | L40S          | ✅ Live |
| `ryla-lora-training`| Combined LoRA Training (Flux, Qwen, Wan)           | A100-80GB/L40S| ✅ Live |

> **Note**: `ryla-qwen-edit` was merged into `ryla-qwen-image` to stay within endpoint limits.
> **Note**: LoRA training apps (Flux, Qwen, Wan) were combined into `ryla-lora-training` to save app slots.

---

## Complete Endpoint Mapping

### Flux Models (`ryla-flux`)

| Endpoint         | Full URL                                                              | Purpose                      |
| ---------------- | --------------------------------------------------------------------- | ---------------------------- |
| `/flux`          | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux`          | Flux Schnell (4 steps, fast) |
| `/flux-dev`      | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev`      | Flux Dev (20 steps, quality) |
| `/flux-dev-lora` | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev-lora` | Flux Dev + custom LoRA       |

### Face Consistency (`ryla-instantid`)

| Endpoint                 | Full URL                                                                           | Purpose                            |
| ------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------- |
| `/sdxl-instantid`        | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-instantid`        | SDXL + InstantID (best face match) |
| `/sdxl-turbo`            | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-turbo`            | SDXL Turbo txt2img (1-4 steps)     |
| `/sdxl-lightning`        | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-lightning`        | SDXL Lightning 4-step              |
| `/flux-pulid`            | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-pulid`            | Flux + PuLID face consistency      |
| `/flux-ipadapter-faceid` | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-ipadapter-faceid` | Flux + XLabs IP-Adapter v2         |

### Qwen Image + Edit (`ryla-qwen-image`)

| Endpoint                   | Full URL                                                                              | Purpose                                |
| -------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------- |
| `/qwen-image-2512`         | `https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512`         | High-quality T2I (50 steps)            |
| `/qwen-image-2512-fast`    | `https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512-fast`    | Fast T2I with Lightning LoRA (4 steps) |
| `/qwen-image-2512-lora`    | `https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512-lora`    | T2I with custom character LoRA         |
| `/video-faceswap`          | `https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run/video-faceswap`          | Video face swap (ReActor)              |
| `/qwen-image-edit-2511`    | `https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-edit-2511`    | Instruction-based editing              |
| `/qwen-image-inpaint-2511` | `https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-inpaint-2511` | Mask-based inpainting                  |

### Z-Image Turbo (`ryla-z-image`)

| Endpoint           | Full URL                                                                   | Purpose                             |
| ------------------ | -------------------------------------------------------------------------- | ----------------------------------- |
| `/z-image-simple`  | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-simple`  | Fast T2I (diffusers pipeline)       |
| `/z-image-danrisi` | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-danrisi` | Same as simple (minimal cold start) |
| `/z-image-lora`    | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-lora`    | T2I with custom character LoRA      |

### Video Generation (`ryla-wan26`)

| Endpoint       | Full URL                                                             | Purpose                        |
| -------------- | -------------------------------------------------------------------- | ------------------------------ |
| `/wan2.6`      | `https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6`      | Text-to-video                  |
| `/wan2.6-r2v`  | `https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-r2v`  | Reference video to video       |
| `/wan2.6-lora` | `https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-lora` | T2V with custom character LoRA |

### Upscaling (`ryla-seedvr2`)

| Endpoint   | Full URL                                                           | Purpose                 |
| ---------- | ------------------------------------------------------------------ | ----------------------- |
| `/seedvr2` | `https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run/seedvr2` | SeedVR2 image upscaling |

### LoRA Training (`ryla-lora-training`)

These are function-only endpoints (no web API). Invoke via Modal SDK:

| Function              | GPU       | Timeout | Purpose                                   |
| --------------------- | --------- | ------- | ----------------------------------------- |
| `train_flux_lora`     | A100-80GB | 2h      | Train Flux character LoRA from images     |
| `train_qwen_lora`     | A100-80GB | 2h      | Train Qwen-Image character LoRA           |
| `train_wan_lora`      | L40S      | 4h      | Train Wan 2.6 video LoRA (1.3B model)     |
| `train_wan_lora_14b`  | A100-80GB | 8h      | Train Wan 2.6 video LoRA (14B model)      |

**Usage Example (Python):**

```python
import modal

# Get the training app
training_app = modal.App.from_name("ryla-lora-training")
train_flux = training_app.functions["train_flux_lora"]

# Trigger training
result = train_flux.remote(
    job_id="job-123",
    image_urls=["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    trigger_word="mychar",
    character_id="char-456",
    config={"max_train_steps": 500}
)
```

---

## Removed Endpoints

| Endpoint             | Reason                       | Alternative           |
| -------------------- | ---------------------------- | --------------------- |
| `/wan2`              | Wan 2.1 model deprecated     | Use `/wan2.6`         |
| `/flux-instantid`    | Architecturally incompatible | Use `/sdxl-instantid` |
| `/z-image-instantid` | Encoder incompatible         | Use `/sdxl-instantid` |
| `/z-image-pulid`     | Encoder incompatible         | Use `/flux-pulid`     |

---

## URL Helper Functions

### Python

```python
ENDPOINT_APP_MAP = {
    # Flux
    "/flux": "ryla-flux",
    "/flux-dev": "ryla-flux",
    "/flux-dev-lora": "ryla-flux",
    # Face Consistency
    "/sdxl-instantid": "ryla-instantid",
    "/sdxl-turbo": "ryla-instantid",
    "/sdxl-lightning": "ryla-instantid",
    "/flux-pulid": "ryla-instantid",
    "/flux-ipadapter-faceid": "ryla-instantid",
    # Qwen Image + Edit (consolidated)
    "/qwen-image-2512": "ryla-qwen-image",
    "/qwen-image-2512-fast": "ryla-qwen-image",
    "/qwen-image-2512-lora": "ryla-qwen-image",
    "/video-faceswap": "ryla-qwen-image",
    "/qwen-image-edit-2511": "ryla-qwen-image",
    "/qwen-image-inpaint-2511": "ryla-qwen-image",
    # Z-Image
    "/z-image-simple": "ryla-z-image",
    "/z-image-danrisi": "ryla-z-image",
    "/z-image-lora": "ryla-z-image",
    # Video
    "/wan2.6": "ryla-wan26",
    "/wan2.6-r2v": "ryla-wan26",
    "/wan2.6-lora": "ryla-wan26",
    # Upscaling
    "/seedvr2": "ryla-seedvr2",
}

def get_endpoint_url(endpoint: str, workspace: str = "ryla") -> str:
    app_name = ENDPOINT_APP_MAP.get(endpoint)
    if not app_name:
        raise ValueError(f"Unknown endpoint: {endpoint}")
    return f"https://{workspace}--{app_name}-comfyui-fastapi-app.modal.run{endpoint}"
```

### TypeScript

```typescript
const ENDPOINT_APP_MAP: Record<string, string> = {
  // Flux
  '/flux': 'ryla-flux',
  '/flux-dev': 'ryla-flux',
  '/flux-dev-lora': 'ryla-flux',
  // Face Consistency
  '/sdxl-instantid': 'ryla-instantid',
  '/sdxl-turbo': 'ryla-instantid',
  '/sdxl-lightning': 'ryla-instantid',
  '/flux-pulid': 'ryla-instantid',
  '/flux-ipadapter-faceid': 'ryla-instantid',
  // Qwen Image + Edit (consolidated)
  '/qwen-image-2512': 'ryla-qwen-image',
  '/qwen-image-2512-fast': 'ryla-qwen-image',
  '/qwen-image-2512-lora': 'ryla-qwen-image',
  '/video-faceswap': 'ryla-qwen-image',
  '/qwen-image-edit-2511': 'ryla-qwen-image',
  '/qwen-image-inpaint-2511': 'ryla-qwen-image',
  // Z-Image
  '/z-image-simple': 'ryla-z-image',
  '/z-image-danrisi': 'ryla-z-image',
  '/z-image-lora': 'ryla-z-image',
  // Video
  '/wan2.6': 'ryla-wan26',
  '/wan2.6-r2v': 'ryla-wan26',
  '/wan2.6-lora': 'ryla-wan26',
  // Upscaling
  '/seedvr2': 'ryla-seedvr2',
};

function getEndpointUrl(endpoint: string, workspace = 'ryla'): string {
  const appName = ENDPOINT_APP_MAP[endpoint];
  if (!appName) throw new Error(`Unknown endpoint: ${endpoint}`);
  return `https://${workspace}--${appName}-comfyui-fastapi-app.modal.run${endpoint}`;
}
```

---

## Recommended Model Usage

| Use Case             | Primary Endpoint        | Fallback          |
| -------------------- | ----------------------- | ----------------- |
| **T2I (Quality)**    | `/qwen-image-2512`      | `/flux-dev`       |
| **T2I (Fast)**       | `/qwen-image-2512-fast` | `/z-image-simple` |
| **Face Consistency** | `/sdxl-instantid`       | `/flux-pulid`     |
| **Video (T2V)**      | `/wan2.6`               | -                 |
| **Video Faceswap**   | `/video-faceswap`       | -                 |
| **Upscaling**        | `/seedvr2`              | -                 |
