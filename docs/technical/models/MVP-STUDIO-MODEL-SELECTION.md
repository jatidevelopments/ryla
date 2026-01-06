# MVP Studio Model Selection Proposal

> **Date**: 2025-01-17  
> **Status**: Proposal  
> **Purpose**: Minimal model selection for Studio MVP (1-2 models per capability)

---

## Executive Summary

For MVP, we'll limit Studio to **1-2 models per capability** to reduce complexity and decision fatigue. Models are filtered by:
- **Mode** (creating/editing/upscaling/variations)
- **NSFW capability** (only ComfyUI models support NSFW)

---

## Proposed Model Selection

### Creating Mode (text-to-image)

| Model | Provider | NSFW | Cost | Why |
|-------|----------|------|------|-----|
| **RYLA Soul** | ComfyUI | ✅ | 20 credits | Primary - unlimited, proven, NSFW support |
| **FLUX Schnell** | Fal.ai | ❌ | 0.3 credits/MP | Fast alternative for SFW content |

**Recommendation**: Show both, default to RYLA Soul.

---

### Editing Mode (editing/image-to-image)

| Model | Provider | NSFW | Cost | Why |
|-------|----------|------|------|-----|
| **RYLA Character** | ComfyUI | ✅ | 50 credits | Primary - unlimited, proven, NSFW support |
| **FLUX Dev** | Fal.ai | ❌ | 2.5 credits/MP | Fast alternative for SFW content |

**Recommendation**: Show both, default to RYLA Character.

---

### Upscaling Mode

| Model | Provider | NSFW | Cost | Why |
|-------|----------|------|------|-----|
| **RYLA Soul** | ComfyUI | ✅ | 20 credits | Reuse creating model for upscaling |
| *(Future: dedicated upscaling model)* | - | - | - | Phase 2+ |

**Recommendation**: Show RYLA Soul only (reuse creating model).

---

### Variations Mode (image-to-image)

| Model | Provider | NSFW | Cost | Why |
|-------|----------|------|------|-----|
| **RYLA Character** | ComfyUI | ✅ | 50 credits | Reuse editing model for variations |
| **FLUX Dev** | Fal.ai | ❌ | 2.5 credits/MP | Fast alternative for SFW content |

**Recommendation**: Show both, default to RYLA Character.

---

## NSFW Handling

### Rules

1. **NSFW Toggle in Studio UI**
   - When **enabled**: Only show ComfyUI models (RYLA Soul, RYLA Character)
   - When **disabled**: Show both ComfyUI and Fal.ai models
   - Clear visual indication: "NSFW Content: Enabled/Disabled"

2. **Negative Prompts**
   - **NSFW enabled**: `'deformed, blurry, bad anatomy, ugly, low quality'`
   - **NSFW disabled**: `'deformed, blurry, bad anatomy, ugly, low quality, nsfw, nude, naked'`

3. **Model Filtering**
   - NSFW enabled → Only `provider: 'comfyui'` models
   - NSFW disabled → All models (ComfyUI + Fal.ai)

---

## Implementation Plan

1. ✅ Add `supportsNSFW` flag to model registry
2. ✅ Filter models by NSFW toggle state
3. ✅ Add NSFW toggle to Studio UI
4. ✅ Update negative prompt logic
5. ✅ Limit models shown to MVP selection (1-2 per mode)

---

## Model Registry Updates

### Models to Keep for MVP

**Creating Mode:**
- `ryla-soul` (ComfyUI, NSFW ✅)
- `flux-schnell` (Fal.ai, NSFW ❌)

**Editing Mode:**
- `ryla-character` (ComfyUI, NSFW ✅)
- `flux-dev` (Fal.ai, NSFW ❌)

**Upscaling Mode:**
- `ryla-soul` (ComfyUI, NSFW ✅)

**Variations Mode:**
- `ryla-character` (ComfyUI, NSFW ✅)
- `flux-dev` (Fal.ai, NSFW ❌)

### Models to Hide for MVP

All other models should be hidden from Studio UI but remain in registry for future use.

---

## UI Changes

1. **NSFW Toggle**
   - Location: Studio toolbar (next to mode selector)
   - Visual: Red indicator when enabled, gray when disabled
   - Tooltip: "Enable NSFW content generation (18+). Only available with ComfyUI models."

2. **Model Picker**
   - Show only MVP models (1-2 per mode)
   - Filter by NSFW toggle state
   - Clear labels: "NSFW Supported" badge on ComfyUI models

3. **Warning Messages**
   - When NSFW enabled: "NSFW content generation is enabled. Only ComfyUI models are available."
   - When switching to Fal.ai model with NSFW enabled: Auto-disable NSFW or show warning

---

## Future Enhancements (Phase 2+)

- Add dedicated upscaling models
- Add more Fal.ai models for SFW content
- Model recommendations based on use case
- A/B testing different models


