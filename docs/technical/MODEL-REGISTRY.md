# Model Registry - Single Source of Truth

## Overview

The Model Registry is the **single source of truth** for all image generation models, their pricing, and how they map between frontend UI and backend API.

---

## Location

**Primary Source of Truth:**
```
libs/shared/src/models/registry.ts
```

This file defines:
- All available models (UI IDs, names, descriptions)
- Provider mapping (ComfyUI vs Fal.ai)
- Backend model ID mapping
- Estimated credit costs
- Pricing information (for Fal models)

---

## Structure

### Model Definition

Each model has:
- **`uiId`**: Frontend UI identifier (what users see in Studio)
- **`name`**: Display name
- **`description`**: Short description
- **`icon`**: Icon identifier for UI
- **`provider`**: `'comfyui'` or `'fal'`
- **`backendId`**: Backend model ID (FalModelId or SelfHostedModelId)
- **`capabilities`**: Array of what the model can do (see below)
- **`inputType`**: Required input type (see below)
- **`outputType`**: Output type (see below)
- **`estimatedCredits1MP`**: Estimated credits for 1024×1024 image
- **`pricingInfo`**: Pricing details (for Fal models)

### Capabilities

Models can support one or more capabilities:
- **`text-to-image`**: Generate image from text prompt
- **`image-to-image`**: Transform existing image
- **`editing`**: Edit/inpaint parts of image
- **`upscaling`**: Increase image resolution
- **`image-to-video`**: Generate video from image
- **`text-to-video`**: Generate video from text
- **`video-to-video`**: Transform video
- **`face-swap`**: Swap faces in images
- **`background-removal`**: Remove backgrounds
- **`style-transfer`**: Transfer artistic style

### Input Types

- **`text`**: Text prompt only
- **`text+image`**: Text prompt + reference image
- **`text+image+mask`**: Text prompt + image + mask for editing
- **`image`**: Image only (for upscaling, style transfer)
- **`image+mask`**: Image + mask (for inpainting)
- **`video`**: Video input
- **`text+video`**: Text + video (for video editing)

### Output Types

- **`image`**: Single or multiple images
- **`video`**: Video output
- **`image+layers`**: Image with RGBA layers

### Example

```typescript
'flux-schnell': {
  uiId: 'flux-schnell',
  name: 'FLUX Schnell',
  description: 'Fast text-to-image generation',
  icon: 'flux',
  provider: 'fal',
  backendId: 'fal-ai/flux/schnell',
  capabilities: ['text-to-image'],
  inputType: 'text',
  outputType: 'image',
  estimatedCredits1MP: 0.3,
  pricingInfo: {
    costPerMegapixel: 0.003,
  },
}
```

---

## Usage

### Frontend

```typescript
import { 
  MODEL_REGISTRY, 
  getAllModels, 
  getModelDefinition,
  getModelsByCapability,
  getModelsByInputType,
  modelSupportsCapability
} from '@ryla/shared';

// Get all models for dropdown
const models = getAllModels();

// Get models by capability (e.g., for editing tab)
const editingModels = getModelsByCapability('editing');

// Get models that accept image input (for image-to-image)
const i2iModels = getModelsByInputType('text+image');

// Get specific model
const model = getModelDefinition('flux-schnell');

// Check if model supports capability
if (modelSupportsCapability('flux-2-pro', 'editing')) {
  // Show editing UI
}

// Calculate estimated credits
import { calculateModelCredits } from '@ryla/shared';
const credits = calculateModelCredits('flux-schnell', 1024, 1024);
```

### Backend

```typescript
import { getBackendModelId } from '@ryla/shared';

// Convert UI model ID to backend model ID
const backendId = getBackendModelId('flux-schnell');
// Returns: 'fal-ai/flux/schnell'
```

---

## Pricing Sources

### ComfyUI Models (Self-hosted)

Pricing is defined in:
```
libs/shared/src/credits/pricing.ts
```

Uses fixed feature pricing:
- `studio_fast`: 20 credits
- `studio_standard`: 50 credits

### Fal.ai Models (External API)

**Pricing Source:**
```
apps/api/src/modules/image/services/fal-image.service.ts
```

Contains:
- `FAL_MODEL_PRICING`: Complete pricing map for all 70+ Fal models
- `calculateFalModelCost()`: Calculate USD cost
- `calculateFalModelCredits()`: Calculate credits (USD × 100)

**Pricing Structure:**
- **Per megapixel**: Scales with image size
- **Per image**: Fixed cost
- **Per processed megapixel**: For editing models

**Credit Calculation:**
```
Credits = ceil(USD_Cost × 100)
```

Where USD cost is:
- Per MP: `costPerMegapixel × megapixels`
- Per image: `costPerImage`
- Per processed MP: `costPerProcessedMegapixel × megapixels`

---

## Model Categories by Capability

### Text-to-Image Models
Models that generate images from text prompts:
- `ryla-soul`, `comfyui-default` → ComfyUI
- `flux-schnell`, `flux-dev`, `flux-2`, `flux-2-max`, `flux-2-turbo`, `flux-2-flash`
- `z-image-turbo`
- `seedream-45`, `gpt-image`, `imagen4`, `ideogram-v2`, `stable-diffusion-35`
- And 15+ more...

### Image-to-Image Models
Models that transform existing images:
- `ryla-face-swap`, `ryla-character` → ComfyUI
- `flux-dev-i2i`, `z-image-i2i`
- `vidu-q2`

### Editing Models
Models that edit/inpaint parts of images:
- `flux-2-edit`, `flux-2-pro-edit`, `flux-2-max-edit`, `flux-2-flex-edit`
- `flux-2-turbo-edit`, `flux-2-flash-edit`
- `seedream-40`, `qwen-edit-2509`, `qwen-edit-2511`
- `kling-image`, `reve`, `longcat-edit`
- `gpt-image-edit`, `nano-banana-edit`, `gemini-3-pro-edit`

### Upscaling Models
Models that increase image resolution:
- `clarity-upscaler`, `aura-sr`, `crystal-upscaler`
- `seedvr2`, `topaz-upscale`

### Image-to-Video Models
Models that generate videos from images:
- `wan-i2v`, `kling-i2v`, `veo2-i2v`, `wan-pro-i2v`

### Face Swap Models
Models specialized for face swapping:
- `ryla-face-swap` → ComfyUI

### Multi-Capability Models
Models that support multiple capabilities:
- `flux-2-pro`: text-to-image + editing
- `flux-2-flex`: text-to-image + editing
- `seedream-45`: text-to-image + editing
- `gpt-image`: text-to-image + editing

---

## Adding New Models

1. **Add to Model Registry** (`libs/shared/src/models/registry.ts`):
   ```typescript
   'new-model-id': {
     uiId: 'new-model-id',
     name: 'New Model',
     description: 'Model description',
     icon: 'flux',
     provider: 'fal',
     backendId: 'fal-ai/new-model',
     capabilities: ['text-to-image'], // Required: what it can do
     inputType: 'text', // Required: what input it needs
     outputType: 'image', // Required: what it outputs
     estimatedCredits1MP: 2,
     pricingInfo: {
       costPerMegapixel: 0.02,
     },
   }
   ```

2. **Add to UIModelId type** (in same file):
   ```typescript
   export type UIModelId =
     | 'existing-models'
     | 'new-model-id'; // Add here
   ```

2. **Add to Fal Pricing** (if Fal model):
   - Add to `FAL_MODEL_PRICING` in `apps/api/src/modules/image/services/fal-image.service.ts`
   - Add to `FalFluxModelId` type

3. **Update Frontend** (if needed):
   - Update `AI_MODELS` in `apps/web/components/studio/generation/types.ts` to use registry

---

## Related Files

| File | Purpose |
|------|---------|
| `libs/shared/src/models/registry.ts` | **Single source of truth** - Model definitions |
| `apps/api/src/modules/image/services/fal-image.service.ts` | Fal.ai pricing and calculation |
| `libs/shared/src/credits/pricing.ts` | ComfyUI feature pricing |
| `apps/web/components/studio/generation/types.ts` | Frontend UI model list (should use registry) |

---

## Migration Status

**Current State:**
- ✅ Model registry created
- ✅ Pricing documented
- ⚠️ Frontend still uses hardcoded `AI_MODELS` array
- ⚠️ Old Studio page uses hardcoded dropdown

**Next Steps:**
1. Update frontend to use `MODEL_REGISTRY` instead of `AI_MODELS`
2. Update Studio page to use registry
3. Remove duplicate model definitions

---

## Credit Cost Examples

### For 1024×1024 (1MP) image:

| Model | Credits | USD Cost |
|-------|---------|----------|
| RYLA Soul (ComfyUI) | 20 | $0.001 |
| FLUX Schnell | 0.3 | $0.003 |
| FLUX Dev | 2.5 | $0.025 |
| FLUX 2 Max | 7 | $0.07 |
| Imagen 4 | 4 | $0.04 |

### For 832×1472 (9:16, 1.22MP) image:

Credits scale proportionally:
- FLUX Schnell: 0.3 × 1.22 = **0.37 credits**
- FLUX Dev: 2.5 × 1.22 = **3.05 credits**

---

## References

- Credit System: `docs/technical/CREDIT-SYSTEM.md`
- Credit Pricing: `docs/technical/CREDIT-COST-MARGIN-ANALYSIS.md`
- Fal.ai Pricing: `apps/api/src/modules/image/services/fal-image.service.ts`

