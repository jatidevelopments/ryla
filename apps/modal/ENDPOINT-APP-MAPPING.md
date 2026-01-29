# Endpoint to App Mapping

**Date**: 2026-01-29  
**Purpose**: Map endpoints to their corresponding Modal apps

---

## Deployed Apps (8 Total)

| App Name          | Description          | GPU  | Status  |
| ----------------- | -------------------- | ---- | ------- |
| `ryla-qwen-image` | Qwen-Image 2512 T2I  | L40S | ✅ Live |
| `ryla-qwen-edit`  | Qwen-Image Edit 2511 | L40S | ✅ Live |
| `ryla-wan26`      | Wan 2.6 Video        | L40S | ✅ Live |
| `ryla-z-image`    | Z-Image-Turbo T2I    | L40S | ✅ Live |
| `ryla-flux`       | Flux Schnell/Dev     | L40S | ✅ Live |
| `ryla-instantid`  | Face Consistency     | L40S | ✅ Live |
| `ryla-lora`       | LoRA Support         | L40S | ✅ Live |
| `ryla-seedvr2`    | Upscaling            | L40S | ✅ Live |

---

## Complete Endpoint Mapping

### Primary T2I - Qwen-Image (`ryla-qwen-image`)

| Endpoint                | Full URL                                                                           | Purpose                                |
| ----------------------- | ---------------------------------------------------------------------------------- | -------------------------------------- |
| `/qwen-image-2512`      | `https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512`      | High-quality T2I (50 steps)            |
| `/qwen-image-2512-fast` | `https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512-fast` | Fast T2I with Lightning LoRA (4 steps) |
| `/qwen-image-2512-lora` | `https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512-lora` | T2I with custom character LoRA         |

### Image Editing - Qwen-Edit (`ryla-qwen-edit`)

| Endpoint                   | Full URL                                                                             | Purpose                   |
| -------------------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| `/qwen-image-edit-2511`    | `https://ryla--ryla-qwen-edit-comfyui-fastapi-app.modal.run/qwen-image-edit-2511`    | Instruction-based editing |
| `/qwen-image-inpaint-2511` | `https://ryla--ryla-qwen-edit-comfyui-fastapi-app.modal.run/qwen-image-inpaint-2511` | Mask-based inpainting     |

### Video Generation - Wan 2.6 (`ryla-wan26`)

| Endpoint       | Full URL                                                             | Purpose                        |
| -------------- | -------------------------------------------------------------------- | ------------------------------ |
| `/wan2.6`      | `https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6`      | Text-to-video                  |
| `/wan2.6-r2v`  | `https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-r2v`  | Reference video to video       |
| `/wan2.6-lora` | `https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-lora` | T2V with custom character LoRA |

### Z-Image Turbo (`ryla-z-image`)

| Endpoint             | Full URL                                                                     | Purpose                           |
| -------------------- | ---------------------------------------------------------------------------- | --------------------------------- |
| `/z-image-simple`    | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-simple`    | Fast T2I (diffusers pipeline)     |
| `/z-image-danrisi`   | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-danrisi`   | Same as simple (custom nodes N/A) |
| `/z-image-lora`      | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-lora`      | T2I with custom character LoRA    |
| `/z-image-instantid` | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-instantid` | Not supported (returns error)     |
| `/z-image-pulid`     | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-pulid`     | Not supported (returns error)     |

### Flux Models (`ryla-flux`)

| Endpoint    | Full URL                                                         | Purpose             |
| ----------- | ---------------------------------------------------------------- | ------------------- |
| `/flux`     | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux`     | Flux Schnell (fast) |
| `/flux-dev` | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev` | Flux Dev (quality)  |

### Face Consistency - InstantID (`ryla-instantid`)

| Endpoint                 | Full URL                                                                           | Purpose                |
| ------------------------ | ---------------------------------------------------------------------------------- | ---------------------- |
| `/flux-instantid`        | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-instantid`        | Flux + InstantID       |
| `/sdxl-instantid`        | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-instantid`        | SDXL + InstantID       |
| `/flux-ipadapter-faceid` | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-ipadapter-faceid` | IPAdapter FaceID       |
| `/flux-pulid`            | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-pulid`            | PuLID face consistency |

### LoRA Support (`ryla-lora`)

| Endpoint     | Full URL                                                          | Purpose        |
| ------------ | ----------------------------------------------------------------- | -------------- |
| `/flux-lora` | `https://ryla--ryla-lora-comfyui-fastapi-app.modal.run/flux-lora` | Flux with LoRA |

### Upscaling (`ryla-seedvr2`)

| Endpoint   | Full URL                                                           | Purpose           |
| ---------- | ------------------------------------------------------------------ | ----------------- |
| `/seedvr2` | `https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run/seedvr2` | SeedVR2 upscaling |

---

## URL Generation Helper

```python
def get_endpoint_url(endpoint: str, workspace: str = "ryla") -> str:
    """Get the full URL for an endpoint."""
    endpoint_app_map = {
        # Qwen-Image
        "/qwen-image-2512": "ryla-qwen-image",
        "/qwen-image-2512-fast": "ryla-qwen-image",
        "/qwen-image-2512-lora": "ryla-qwen-image",
        # Qwen-Edit
        "/qwen-image-edit-2511": "ryla-qwen-edit",
        "/qwen-image-inpaint-2511": "ryla-qwen-edit",
        # Wan 2.6
        "/wan2.6": "ryla-wan26",
        "/wan2.6-r2v": "ryla-wan26",
        "/wan2.6-lora": "ryla-wan26",
        # Z-Image
        "/z-image-simple": "ryla-z-image",
        "/z-image-danrisi": "ryla-z-image",
        "/z-image-lora": "ryla-z-image",
        "/z-image-instantid": "ryla-z-image",
        "/z-image-pulid": "ryla-z-image",
        # Flux
        "/flux": "ryla-flux",
        "/flux-dev": "ryla-flux",
        # InstantID
        "/flux-instantid": "ryla-instantid",
        "/sdxl-instantid": "ryla-instantid",
        "/flux-ipadapter-faceid": "ryla-instantid",
        "/flux-pulid": "ryla-instantid",
        # LoRA
        "/flux-lora": "ryla-lora",
        # Upscaling
        "/seedvr2": "ryla-seedvr2",
    }

    app_name = endpoint_app_map.get(endpoint)
    if not app_name:
        raise ValueError(f"Unknown endpoint: {endpoint}")

    base_url = f"https://{workspace}--{app_name}-comfyui-fastapi-app.modal.run"
    return f"{base_url}{endpoint}"
```

---

## TypeScript Mapping

```typescript
const ENDPOINT_APP_MAP: Record<string, string> = {
  // Qwen-Image (Primary T2I)
  '/qwen-image-2512': 'ryla-qwen-image',
  '/qwen-image-2512-fast': 'ryla-qwen-image',
  '/qwen-image-2512-lora': 'ryla-qwen-image',
  // Qwen-Edit (Image Editing)
  '/qwen-image-edit-2511': 'ryla-qwen-edit',
  '/qwen-image-inpaint-2511': 'ryla-qwen-edit',
  // Wan 2.6 (Video)
  '/wan2.6': 'ryla-wan26',
  '/wan2.6-r2v': 'ryla-wan26',
  '/wan2.6-lora': 'ryla-wan26',
  // Z-Image (Fast T2I)
  '/z-image-simple': 'ryla-z-image',
  '/z-image-danrisi': 'ryla-z-image',
  '/z-image-lora': 'ryla-z-image',
  // Flux (Quality T2I)
  '/flux': 'ryla-flux',
  '/flux-dev': 'ryla-flux',
  // Face Consistency
  '/flux-instantid': 'ryla-instantid',
  '/sdxl-instantid': 'ryla-instantid',
  '/flux-ipadapter-faceid': 'ryla-instantid',
  '/flux-pulid': 'ryla-instantid',
  // LoRA
  '/flux-lora': 'ryla-lora',
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

| Use Case              | Primary Endpoint           | Fallback          |
| --------------------- | -------------------------- | ----------------- |
| **T2I (Quality)**     | `/qwen-image-2512`         | `/flux-dev`       |
| **T2I (Fast)**        | `/qwen-image-2512-fast`    | `/z-image-simple` |
| **T2I + LoRA (Qwen)** | `/qwen-image-2512-lora`    | `/flux-lora`      |
| **T2I + LoRA (Flux)** | `/flux-lora`               | -                 |
| **T2I + LoRA (Fast)** | `/z-image-lora`            | -                 |
| **Image Editing**     | `/qwen-image-edit-2511`    | -                 |
| **Inpainting**        | `/qwen-image-inpaint-2511` | -                 |
| **Face Consistency**  | `/flux-instantid`          | `/flux-pulid`     |
| **Video (T2V)**       | `/wan2.6`                  | -                 |
| **Video (V2V)**       | `/wan2.6-r2v`              | -                 |
| **Video + LoRA**      | `/wan2.6-lora`             | -                 |
| **Upscaling**         | `/seedvr2`                 | -                 |

---

**Last Updated**: 2026-01-29
