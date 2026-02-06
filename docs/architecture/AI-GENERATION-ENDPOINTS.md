# AI Generation Endpoints Architecture

**Last Updated**: 2026-02-05  
**Status**: Active  
**Owner**: Platform Team

---

## Overview

RYLA uses multiple AI providers for image and video generation. This document defines the endpoint architecture, capability requirements, and provider selection logic for all generation flows.

## Providers

| Provider | Type | Use Cases | NSFW Support | Reference Image |
|----------|------|-----------|--------------|-----------------|
| **Modal.com** | Self-hosted ComfyUI | Primary for all flows | ✅ Yes | ✅ InstantID/PuLID |
| **Fal.ai** | API-based | SFW with reference images | ❌ No | ✅ PuLID |
| **ComfyUI Pod** | Self-hosted | Legacy NSFW fallback | ✅ Yes | ✅ InstantID |

### Provider Priority

```
SFW Content:     Modal.com > Fal.ai
SFW + Reference: Modal.com > Fal.ai (fal-ai/flux-pulid)
NSFW Content:    Modal.com > ComfyUI Pod
```

---

## Generation Flows

### 1. Base Image Generation (Wizard Step 0)

**Purpose**: Generate 6 initial character appearance options from text description.

| Aspect | Current | Target |
|--------|---------|--------|
| Provider | Modal.com + Fal.ai | Modal.com + Fal.ai |
| Endpoints | `/flux-dev`, `fal-ai/flux/dev`, `fal-ai/seedream/v4.5` | Same |
| Reference Image | ❌ Not supported | ❌ Not needed |
| LoRA | ❌ Not supported | ❌ Not needed |
| NSFW | ❌ Always SFW | ❌ Always SFW |

**Rationale**: Base images are initial character concepts - no character identity exists yet to maintain consistency.

### 2. Profile Picture Generation (Wizard Finalize)

**Purpose**: Generate 7-10 profile pictures with face consistency from selected base image.

| Aspect | Current | Target |
|--------|---------|--------|
| Provider | Modal.com only | Modal.com only |
| Endpoints | Z-Image InstantID workflow | Same |
| Reference Image | ✅ Consistent mode | ✅ Consistent mode |
| LoRA | ❌ Not supported | ❌ Not needed |
| NSFW | ✅ Optional (3 images) | ✅ Optional |

**Rationale**: Profile pictures use InstantID for face consistency with the selected base image.

### 3. Studio Generation

**Purpose**: Generate custom content for existing characters with full control.

| Aspect | Current | Target |
|--------|---------|--------|
| Provider | Modal.com > Fal.ai > ComfyUI | Modal.com > Fal.ai |
| Reference Image | ❌ Not implemented | ✅ Required |
| LoRA | ❌ Not implemented | ✅ Required |
| NSFW | ComfyUI only | Modal.com primary |

**This is the main gap area - Studio needs LoRA and reference image support.**

---

## Modal.com Endpoints

### Text-to-Image (No Reference)

| Endpoint | App | Capabilities | Use Case |
|----------|-----|--------------|----------|
| `/flux` | ryla-flux | Fast T2I (4 steps) | Quick previews |
| `/flux-dev` | ryla-flux | Quality T2I (20 steps) | Base images, general T2I |
| `/qwen-image-2512` | ryla-qwen-image | High quality T2I | Alternative model |
| `/qwen-image-2512-fast` | ryla-qwen-image | Fast T2I (4 steps) | Quick previews |
| `/z-image-simple` | ryla-z-image | Fast T2I | Legacy |
| `/z-image-danrisi` | ryla-z-image | Optimized T2I | Legacy |

### LoRA-Enabled (Character Consistency)

| Endpoint | App | Capabilities | Use Case |
|----------|-----|--------------|----------|
| `/flux-dev-lora` | ryla-flux | Flux + custom LoRA | **Studio with trained LoRA** |
| `/qwen-image-2512-lora` | ryla-qwen-image | Qwen + custom LoRA | **Studio with trained LoRA** |
| `/z-image-lora` | ryla-z-image | Z-Image + custom LoRA | **Studio with trained LoRA** |

### Reference Image (Face Consistency)

| Endpoint | App | Capabilities | Use Case |
|----------|-----|--------------|----------|
| `/sdxl-instantid` | ryla-instantid | SDXL + InstantID | **Studio with reference (recommended)** |
| `/flux-pulid` | ryla-instantid | Flux + PuLID | Studio with reference (alternative) |
| `/flux-ipadapter-faceid` | ryla-instantid | Flux + IP-Adapter | Studio with reference (alternative) |

### Video Generation

| Endpoint | App | Capabilities | Use Case |
|----------|-----|--------------|----------|
| `/wan2.6` | ryla-wan26 | Text-to-video | Video generation |
| `/wan2.6-lora` | ryla-wan26 | T2V + LoRA | Video with character LoRA |
| `/wan2.6-r2v` | ryla-wan26 | Reference-to-video | Video with consistency |

### NSFW-Capable

| Endpoint | NSFW Flag | Notes |
|----------|-----------|-------|
| `/sdxl-instantid` | `nsfw: true` | Recommended for NSFW with face |
| `/flux-dev-lora` | `nsfw: true` | NSFW with LoRA |
| `/z-image-lora` | `nsfw: true` | NSFW with LoRA |
| `/qwen-image-2512-lora` | `nsfw: true` | NSFW with LoRA |

---

## Fal.ai Endpoints

Fal.ai provides fallback endpoints for SFW content when Modal.com is unavailable.

### Text-to-Image (Creating)

| Endpoint ID | UI Model | Capabilities | MVP |
|-------------|----------|--------------|-----|
| `fal-ai/flux/schnell` | flux-schnell | Fast T2I | ✅ |
| `fal-ai/flux/dev` | flux-dev | Quality T2I, LoRA-compatible | ✅ |
| `fal-ai/bytedance/seedream/v4.5/text-to-image` | seedream-45 | High quality T2I | ✅ |
| `fal-ai/z-image/turbo` | z-image-turbo | Fast 6B model | |

### Reference Image (Face Consistency)

| Endpoint ID | UI Model | Capabilities | Use Case |
|-------------|----------|--------------|----------|
| `fal-ai/flux-pulid` | flux-pulid | FLUX + PuLID | **SFW face consistency (recommended)** |
| `fal-ai/pulid` | pulid-standard | PuLID standard | SFW face consistency |

**Note**: These endpoints support `reference_image_url` parameter for face consistency without requiring a trained LoRA.

### Editing

| Endpoint ID | UI Model | Capabilities |
|-------------|----------|--------------|
| `fal-ai/flux-2/edit` | flux-2-edit | Natural language editing |
| `fal-ai/flux-2-pro/edit` | flux-2-pro-edit | Premium editing |
| `fal-ai/qwen-image-edit-2511` | qwen-edit-2511 | Qwen editing |

### Upscaling

| Endpoint ID | UI Model | Capabilities | MVP |
|-------------|----------|--------------|-----|
| `fal-ai/clarity-upscaler` | clarity-upscaler | High fidelity | ✅ |
| `fal-ai/aura-sr` | aura-sr | Fast/cheap | ✅ |
| `fal-ai/seedvr/upscale/image` | seedvr2 | ByteDance upscaler | |
| `fal-ai/topaz/upscale/image` | topaz-upscale | Professional | |

### Image-to-Image (Variations)

| Endpoint ID | UI Model | Capabilities |
|-------------|----------|--------------|
| `fal-ai/flux/dev/image-to-image` | flux-dev-i2i | Transform images |
| `fal-ai/z-image/turbo/image-to-image` | z-image-i2i | Fast I2I |

---

## Studio Generation Logic

### Provider Selection

```typescript
function selectStudioProvider(input: StudioInput): Provider {
  const hasLora = input.useLora && input.loraAvailable;
  const hasReference = !!input.referenceImageUrl;
  
  // LoRA takes priority - Modal.com only
  if (hasLora) {
    return 'modal'; // Use /flux-dev-lora or similar
  }
  
  // NSFW content - Modal.com only
  if (input.nsfw) {
    return 'modal'; // Use Modal.com with nsfw: true
  }
  
  // Reference image for face consistency (SFW)
  if (hasReference) {
    // Both Modal.com and Fal.ai support reference images for SFW
    // Modal.com: /sdxl-instantid, /flux-pulid
    // Fal.ai: fal-ai/flux-pulid, fal-ai/pulid
    return input.modelProvider ?? 'modal';
  }
  
  // Standard SFW T2I - can use any provider
  return input.modelProvider ?? 'modal';
}
```

### Endpoint Selection

```typescript
function selectStudioEndpoint(input: StudioInput, provider: Provider): string {
  const hasLora = input.useLora && input.loraAvailable;
  const hasReference = !!input.referenceImageUrl;
  
  // LoRA endpoints (Modal.com only)
  if (hasLora) {
    if (input.modelPreference === 'qwen') {
      return '/qwen-image-2512-lora';
    }
    return '/flux-dev-lora'; // Default LoRA endpoint
  }
  
  // Reference image endpoints (face consistency)
  if (hasReference) {
    if (provider === 'fal') {
      return 'fal-ai/flux-pulid'; // Fal.ai reference endpoint
    }
    return '/sdxl-instantid'; // Modal.com - best face consistency
  }
  
  // Standard endpoints
  if (provider === 'fal') {
    return input.quality === 'fast' 
      ? 'fal-ai/flux/schnell' 
      : 'fal-ai/flux/dev';
  }
  
  // Modal.com standard
  if (input.quality === 'fast') {
    return '/flux'; // 4 steps
  }
  return '/flux-dev'; // 20 steps
}
```

---

## Required Capabilities by Use Case

### Creating New Content (No Consistency)

- **Requirement**: Text-to-image
- **Endpoints**: `/flux-dev`, `/qwen-image-2512`, Fal.ai models
- **Reference Image**: ❌ Not needed
- **LoRA**: ❌ Not needed

### Maintaining Character Face (Reference)

- **Requirement**: Face consistency with existing image
- **Endpoints**: `/sdxl-instantid`, `/flux-pulid`
- **Reference Image**: ✅ Required
- **LoRA**: ❌ Not used

### Maintaining Character Identity (LoRA)

- **Requirement**: Consistent character across all generations
- **Endpoints**: `/flux-dev-lora`, `/qwen-image-2512-lora`
- **Reference Image**: ❌ Not needed (LoRA encodes identity)
- **LoRA**: ✅ Required (must be trained)

### NSFW Content

- **Requirement**: Adult content generation
- **Endpoints**: Modal.com with `nsfw: true` flag
- **Provider**: Modal.com only (Fal.ai doesn't support NSFW)

---

## Model Registry Requirements

Models in `libs/shared/src/models/registry.ts` must define:

```typescript
interface ModelDefinition {
  // Required for filtering
  capabilities: ModelCapability[];  // What the model can do
  inputType: InputType;             // What input it requires
  supportsNSFW?: boolean;           // NSFW content support
  supportsLoRA?: boolean;           // LoRA training support
  
  // Required for routing
  provider: 'modal' | 'fal';        // Which provider
  backendId: string;                // Endpoint or model ID
}
```

### Capability Types

| Capability | Description | Example Models |
|------------|-------------|----------------|
| `text-to-image` | Generate from text prompt | All T2I models |
| `image-to-image` | Transform existing image | SDXL-InstantID |
| `lora` | Supports custom LoRA | flux-dev-lora |
| `editing` | Inpainting/editing | qwen-image-edit |
| `upscaling` | Resolution enhancement | clarity-upscaler |

### Input Types

| Input Type | Description | Studio Mode |
|------------|-------------|-------------|
| `text` | Text prompt only | Creating |
| `text+image` | Text + reference image | Variations |
| `image` | Image only | Upscaling |
| `text+image+mask` | Editing with mask | Editing |

---

## Implementation Checklist

### Studio Generation Service

- [x] Basic text-to-image (Modal.com + Fal.ai)
- [ ] LoRA endpoint routing (`/flux-dev-lora`)
- [ ] Reference image endpoint routing (`/sdxl-instantid`)
- [ ] NSFW via Modal.com (not ComfyUI-only)
- [ ] Model capability validation

### Studio UI

- [ ] Reference image upload option
- [ ] LoRA toggle when trained
- [ ] Model filtering by capability
- [ ] NSFW model availability

### DTO/API

- [x] `useLora?: boolean` field
- [ ] `referenceImageUrl?: string` field
- [ ] `loraId?: string` field
- [ ] Validation for capability requirements

---

## Related Documentation

- Endpoint Mapping: `apps/modal/ENDPOINT-APP-MAPPING.md`
- Model Registry: `libs/shared/src/models/registry.ts`
- Studio Service: `apps/api/src/modules/image/services/studio-generation.service.ts`
- Modal Handlers: `apps/modal/handlers/`
