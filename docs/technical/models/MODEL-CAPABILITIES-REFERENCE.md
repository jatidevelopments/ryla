# Model Capabilities Reference

> **Single Source of Truth**: `libs/shared/src/models/registry.ts`

This document provides a quick reference for all models organized by capability, input/output types, and use cases.

---

## Capability Overview

| Capability | Description | Input Type | Output Type | Use Case |
|------------|-------------|------------|-------------|----------|
| **text-to-image** | Generate image from text | `text` | `image` | Creating new images |
| **image-to-image** | Transform existing image | `text+image` | `image` | Style transfer, variations |
| **editing** | Edit/inpaint parts of image | `text+image` or `text+image+mask` | `image` | Inpainting, object replacement |
| **upscaling** | Increase image resolution | `image` | `image` | Enhance quality |
| **image-to-video** | Generate video from image | `text+image` | `video` | Animate images |
| **text-to-video** | Generate video from text | `text` | `video` | Create videos |
| **face-swap** | Swap faces in images | `text+image` | `image` | Face replacement |
| **background-removal** | Remove backgrounds | `image` | `image` | Isolate subjects |
| **style-transfer** | Transfer artistic style | `text+image` | `image` | Apply styles |

---

## Models by Capability

### Text-to-Image Models

**ComfyUI (Self-hosted):**
- `ryla-soul` - Ultra-Realistic Fashion Visuals (20 credits)
- `comfyui-default` - On-server generation (20 credits)

**FLUX Models:**
- `flux-schnell` - Fast generation (0.3 credits)
- `flux-dev` - High quality (2.5 credits)
- `flux-2` - Enhanced realism (1.2 credits)
- `flux-2-max` - Maximum quality (7 credits)
- `flux-2-turbo` - Fast FLUX 2 (0.8 credits)
- `flux-2-flash` - Ultra-fast (0.5 credits)

**Other Models:**
- `z-image-turbo` - Instant portraits (0.5 credits)
- `seedream-45` - ByteDance 4K model (4 credits)
- `gpt-image` - Versatile AI (0.1 credits)
- `imagen4` - Google quality (4 credits)
- `ideogram-v2` - Typography-focused (8 credits)
- `stable-diffusion-35` - MMDiT model (6.5 credits)
- And 15+ more...

### Image-to-Image Models

- `ryla-face-swap` - Face swapping (20 credits)
- `ryla-character` - Character swapping (50 credits)
- `flux-dev-i2i` - Transform images (2.5 credits)
- `z-image-i2i` - Image transformation (0.5 credits)
- `vidu-q2` - Text-to-image with reference (3 credits)

### Editing Models

**FLUX Editing:**
- `flux-2-edit` - Natural language editing (1.2 credits)
- `flux-2-pro-edit` - Premium editing (3 credits)
- `flux-2-max-edit` - Advanced editing (7 credits)
- `flux-2-flex-edit` - Multi-reference editing (6 credits)
- `flux-2-turbo-edit` - Fast editing (0.8 credits)
- `flux-2-flash-edit` - Ultra-fast editing (0.5 credits)

**Other Editing:**
- `seedream-40` - ByteDance editing (4 credits)
- `qwen-edit-2509` - Superior text editing (2 credits)
- `qwen-edit-2511` - Qwen editing (2 credits)
- `kling-image` - Reference control editing (3 credits)
- `reve` - Advanced editing (3 credits)
- `longcat-edit` - Multilingual editing (2 credits)
- `gpt-image-edit` - GPT editing (0.1 credits)
- `nano-banana-edit` - Google editing (4 credits)
- `gemini-3-pro-edit` - Gemini editing (4 credits)

### Upscaling Models

- `clarity-upscaler` - High fidelity upscaling (2 credits)
- `aura-sr` - AuraSR upscaling (1 credit)
- `crystal-upscaler` - Facial detail upscaling (2 credits)
- `seedvr2` - SeedVR2 upscaling (3 credits)
- `topaz-upscale` - Topaz enhancer (2 credits)

### Image-to-Video Models

- `wan-i2v` - Wan 2.1 image-to-video (5 credits/sec)
- `kling-i2v` - Kling 1.6 Pro (8 credits/sec)
- `veo2-i2v` - Veo 2 (10 credits/sec)
- `wan-pro-i2v` - Wan Pro 1080p (12 credits/sec)

---

## Input/Output Type Matrix

### Input: `text`
**Output: `image`**
- All text-to-image models
- Use case: Creating new images from scratch

**Output: `video`**
- Text-to-video models (future)

### Input: `text+image`
**Output: `image`**
- Image-to-image models
- Editing models (natural language)
- Use case: Transform or edit existing images

**Output: `video`**
- Image-to-video models
- Use case: Animate static images

### Input: `text+image+mask`
**Output: `image`**
- Advanced editing models
- Inpainting models
- Use case: Precise region editing

### Input: `image`
**Output: `image`**
- Upscaling models
- Background removal models
- Style transfer models
- Use case: Process existing images

### Input: `image+mask`
**Output: `image`**
- Inpainting models
- Use case: Edit specific masked regions

---

## Studio Use Cases

### Creating New Images
**Models:** All `text-to-image` capability
**Input:** Text prompt
**Output:** Image(s)
**Example Models:** `ryla-soul`, `flux-schnell`, `flux-2-max`

### Editing Existing Images
**Models:** All `editing` capability
**Input:** Text prompt + image (optionally + mask)
**Output:** Edited image
**Example Models:** `flux-2-edit`, `qwen-edit-2509`, `reve`

### Transforming Images
**Models:** All `image-to-image` capability
**Input:** Text prompt + reference image
**Output:** Transformed image
**Example Models:** `flux-dev-i2i`, `z-image-i2i`, `ryla-character`

### Upscaling Images
**Models:** All `upscaling` capability
**Input:** Image
**Output:** Higher resolution image
**Example Models:** `clarity-upscaler`, `seedvr2`, `crystal-upscaler`

### Creating Videos
**Models:** All `image-to-video` capability
**Input:** Text prompt + image
**Output:** Video
**Example Models:** `wan-i2v`, `kling-i2v`, `veo2-i2v`

---

## Helper Functions

```typescript
import {
  getModelsByCapability,
  getModelsByInputType,
  getModelsByOutputType,
  modelSupportsCapability,
} from '@ryla/shared';

// Get all editing models
const editingModels = getModelsByCapability('editing');

// Get models that accept image input
const imageInputModels = getModelsByInputType('text+image');

// Get models that output video
const videoModels = getModelsByOutputType('video');

// Check if model supports editing
if (modelSupportsCapability('flux-2-pro', 'editing')) {
  // Show editing UI
}
```

---

## Pricing Reference

### ComfyUI Models
- Fixed pricing via feature system
- `studio_fast`: 20 credits
- `studio_standard`: 50 credits

### Fal.ai Models
- Dynamic pricing based on image size
- Formula: `Credits = ceil(USD_Cost × 100)`
- Scales with megapixels for per-MP models
- Fixed cost for per-image models

**Example Costs (1024×1024 = 1MP):**
- Fast: 0.3-0.5 credits (`flux-schnell`, `flux-2-flash`)
- Standard: 1-3 credits (`flux-2`, `flux-2-pro`)
- Premium: 4-8 credits (`imagen4`, `ideogram-v2`)
- Maximum: 7+ credits (`flux-2-max`)

---

## References

- **Registry**: `libs/shared/src/models/registry.ts`
- **Pricing**: `apps/api/src/modules/image/services/fal-image.service.ts`
- **Documentation**: `docs/technical/MODEL-REGISTRY.md`

