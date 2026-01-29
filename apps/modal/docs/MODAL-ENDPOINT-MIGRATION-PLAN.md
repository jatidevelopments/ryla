# Modal Endpoint Migration Plan

**Last Updated**: 2026-01-28  
**Status**: Planning Phase

---

## Overview

This document identifies where Modal.com endpoints should replace ComfyUI pod usage for:
- Character generation
- Profile picture generation
- Studio generation

---

## Current State

### Services Using ComfyUI Pod (Need Migration)

1. **Profile Picture Generation** (`ProfilePictureSetService`)
   - **Current**: Uses `ComfyUIJobRunnerAdapter`
   - **Location**: `apps/api/src/modules/image/services/profile-picture-set.service.ts`
   - **Usage**: Generates 7-10 profile pictures from base image
   - **Workflows**: Uses Z-Image workflows (z-image-danrisi, z-image-simple, z-image-pulid)

2. **Character Generation** (`BaseImageGenerationService`)
   - **Current**: Uses `ComfyUIJobRunnerAdapter` for character DNA generation
   - **Location**: `apps/api/src/modules/image/services/base-image-generation.service.ts`
   - **Usage**: Generates base images from character DNA
   - **Workflows**: Uses Flux Dev workflows

3. **Studio Generation** (`StudioGenerationService`)
   - **Current**: Uses Modal for base images, but ComfyUI for workflows
   - **Location**: `apps/api/src/modules/image/services/studio-generation.service.ts`
   - **Usage**: Generates studio images with character consistency
   - **Workflows**: Uses various workflows (Flux Dev, Z-Image, etc.)

---

## Modal Endpoints Available

### Face Consistency Endpoints

| Endpoint | Model | Face Consistency | Status | Use Case |
|----------|-------|------------------|--------|----------|
| `/flux-ipadapter-faceid` | Flux Dev + IP-Adapter v2 | 80-85% | ✅ Implemented | Profile pictures, character gen (Flux) |
| `/sdxl-instantid` | SDXL + InstantID | 85-90% | ✅ Tested | Profile pictures, character gen (SDXL) |
| `/z-image-instantid` | Z-Image-Turbo + InstantID | 85-90% | ✅ Implemented | Profile pictures, character gen (Z-Image) |
| `/z-image-pulid` | Z-Image-Turbo + PuLID | 85-90% | ✅ Implemented | Profile pictures, character gen (Z-Image) |

### Base Image Generation

| Endpoint | Model | Status | Use Case |
|----------|-------|--------|----------|
| `/flux-dev` | Flux Dev | ✅ Working | Base images, studio generation |
| `/flux` | Flux Schnell | ✅ Working | Fast base images |
| `/z-image-simple` | Z-Image-Turbo | ✅ Implemented | Base images (fast) |
| `/z-image-danrisi` | Z-Image-Turbo | ✅ Implemented | Base images (quality) |

---

## Migration Plan

### Phase 1: Profile Picture Generation

**Service**: `ProfilePictureSetService`  
**Current**: Uses `ComfyUIJobRunnerAdapter.queueWorkflow()`  
**Target**: Use Modal endpoints directly

**Endpoints to Use**:
- **SFW Profile Pictures**: `/z-image-pulid` or `/z-image-instantid` (with reference image)
- **NSFW Profile Pictures**: Keep ComfyUI (self-hosted) or use `/z-image-pulid` if NSFW is supported

**Implementation Steps**:
1. Add `ModalJobRunnerAdapter` injection to `ProfilePictureSetService`
2. Replace `comfyuiAdapter.queueWorkflow()` with Modal endpoint calls
3. Map workflow types to Modal endpoints:
   - `z-image-danrisi` → `/z-image-danrisi`
   - `z-image-simple` → `/z-image-simple`
   - `z-image-pulid` → `/z-image-pulid`
   - `z-image-instantid` → `/z-image-instantid`
4. Update `ModalJobRunner` to support these endpoints
5. Handle reference image upload (base64 → Modal endpoint)

**Files to Modify**:
- `apps/api/src/modules/image/services/profile-picture-set.service.ts`
- `libs/business/src/services/modal-job-runner.ts`
- `apps/api/src/modules/image/image.module.ts`

---

### Phase 2: Character Generation

**Service**: `BaseImageGenerationService`  
**Current**: Uses `ComfyUIJobRunnerAdapter.generateFromCharacterDNA()`  
**Target**: Use Modal endpoints for character DNA generation

**Endpoints to Use**:
- **Base Images**: `/flux-dev` (primary) or `/flux` (fast)
- **Character with Face**: `/flux-ipadapter-faceid` (if base image provided)

**Implementation Steps**:
1. Add `ModalJobRunnerAdapter` injection to `BaseImageGenerationService`
2. Replace `comfyuiAdapter.generateFromCharacterDNA()` with Modal endpoint calls
3. Use `/flux-dev` for character DNA → image generation
4. If base image exists, use `/flux-ipadapter-faceid` for face consistency

**Files to Modify**:
- `apps/api/src/modules/image/services/base-image-generation.service.ts`
- `libs/business/src/services/modal-job-runner.ts`

---

### Phase 3: Studio Generation

**Service**: `StudioGenerationService`  
**Current**: Uses Modal for base images, ComfyUI for workflows  
**Target**: Use Modal endpoints for all generation

**Endpoints to Use**:
- **Base Studio Images**: `/flux-dev` (already using)
- **Studio with Face Consistency**: `/flux-ipadapter-faceid` or `/z-image-pulid`
- **Z-Image Workflows**: `/z-image-danrisi` or `/z-image-simple`

**Implementation Steps**:
1. Update workflow selection to prefer Modal endpoints
2. Map workflow IDs to Modal endpoints:
   - `flux-dev` → `/flux-dev`
   - `z-image-danrisi` → `/z-image-danrisi`
   - `z-image-simple` → `/z-image-simple`
   - `z-image-pulid` → `/z-image-pulid`
3. Use `/flux-ipadapter-faceid` for face consistency workflows

**Files to Modify**:
- `apps/api/src/modules/image/services/studio-generation.service.ts`
- `libs/business/src/services/modal-job-runner.ts`

---

## ModalJobRunner Updates Needed

### Add New Methods

```typescript
// In libs/business/src/services/modal-job-runner.ts

/**
 * Generate image using Z-Image-Turbo Simple
 */
async generateZImageSimple(input: {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg?: number;
  seed?: number;
}): Promise<string>

/**
 * Generate image using Z-Image-Turbo Danrisi
 */
async generateZImageDanrisi(input: {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg?: number;
  seed?: number;
}): Promise<string>

/**
 * Generate image using Z-Image-Turbo + InstantID
 */
async generateZImageInstantID(input: {
  prompt: string;
  referenceImage: string; // base64 data URL
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg?: number;
  seed?: number;
  instantidStrength?: number;
  controlnetStrength?: number;
  faceProvider?: 'CPU' | 'GPU';
}): Promise<string>

/**
 * Generate image using Z-Image-Turbo + PuLID
 */
async generateZImagePuLID(input: {
  prompt: string;
  referenceImage: string; // base64 data URL
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg?: number;
  seed?: number;
  pulidStrength?: number;
  pulidStart?: number;
  pulidEnd?: number;
  faceProvider?: 'CPU' | 'GPU';
}): Promise<string>

/**
 * Generate image using Flux Dev + IP-Adapter FaceID
 */
async generateFluxIPAdapterFaceID(input: {
  prompt: string;
  referenceImage: string; // base64 data URL
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg?: number;
  seed?: number;
  ipadapterStrength?: number;
  faceProvider?: 'CPU' | 'GPU';
}): Promise<string>
```

### Update ModalClient

Add methods to `libs/business/src/services/modal-client.ts`:

```typescript
async generateZImageSimple(input: ZImageRequest): Promise<ModalResponse>
async generateZImageDanrisi(input: ZImageRequest): Promise<ModalResponse>
async generateZImageInstantID(input: ZImageInstantIDRequest): Promise<ModalResponse>
async generateZImagePuLID(input: ZImagePuLIDRequest): Promise<ModalResponse>
async generateFluxIPAdapterFaceID(input: FluxIPAdapterFaceIDRequest): Promise<ModalResponse>
```

---

## Implementation Priority

### High Priority (Profile Pictures)
1. ✅ **Update ModalJobRunner** - Add Z-Image and IP-Adapter FaceID methods
2. ✅ **Update ProfilePictureSetService** - Use Modal endpoints instead of ComfyUI
3. ✅ **Test Profile Picture Generation** - Verify face consistency works

### Medium Priority (Character Generation)
4. ✅ **Update BaseImageGenerationService** - Use Modal endpoints for character DNA
5. ✅ **Test Character Generation** - Verify character images generate correctly

### Lower Priority (Studio Generation)
6. ✅ **Update StudioGenerationService** - Use Modal endpoints for all workflows
7. ✅ **Test Studio Generation** - Verify all workflow types work

---

## Testing Checklist

### Profile Pictures
- [ ] SFW profile pictures generate with face consistency
- [ ] NSFW profile pictures generate (if supported)
- [ ] Multiple positions generate correctly
- [ ] Face consistency matches base image (80-85% for IP-Adapter, 85-90% for InstantID/PuLID)
- [ ] Cost tracking works correctly

### Character Generation
- [ ] Character DNA → image generation works
- [ ] Face consistency works when base image provided
- [ ] Multiple characters generate correctly
- [ ] Cost tracking works correctly

### Studio Generation
- [ ] All workflow types work (Flux Dev, Z-Image, etc.)
- [ ] Face consistency works for studio images
- [ ] NSFW handling works correctly
- [ ] Cost tracking works correctly

---

## Rollback Plan

If Modal endpoints fail:
1. Keep ComfyUI adapter as fallback
2. Add feature flag to toggle between Modal and ComfyUI
3. Monitor error rates and automatically fallback if Modal fails

---

## Related Documentation

- **Endpoint Reference**: `apps/modal/docs/ENDPOINTS-REFERENCE.md`
- **Face Consistency**: `apps/modal/docs/FLUX-FACE-CONSISTENCY-SUMMARY.md`
- **Z-Image Status**: `apps/modal/docs/status/Z-IMAGE-IMPLEMENTATION-STATUS.md`
- **Modal Client**: `libs/business/src/services/modal-client.ts`
- **Modal Job Runner**: `libs/business/src/services/modal-job-runner.ts`

---

**Last Updated**: 2026-01-28
