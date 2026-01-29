# Modal Endpoint Integration Status

**Last Updated**: 2026-01-28  
**Status**: Implementation In Progress

---

## Summary

This document tracks the integration of Modal.com endpoints into RYLA services, replacing ComfyUI pod usage where appropriate.

---

## Documentation Updates ✅

### Completed
- ✅ **ENDPOINTS-REFERENCE.md** - Comprehensive documentation with all 13 endpoints
  - Added Z-Image endpoints (4 new: simple, danrisi, instantid, pulid)
  - Includes models, providers, costs, status
  - Updated cost summary table
  - Added recommendations section

- ✅ **ENDPOINTS-OVERVIEW.md** - Quick reference updated
  - Added all Z-Image endpoints
  - Updated status table
  - Added recommendations

- ✅ **MODAL-ENDPOINT-MIGRATION-PLAN.md** - Migration strategy document
  - Identifies services needing migration
  - Implementation steps for each service
  - Testing checklist

---

## Modal Endpoint Implementation ✅

### New Endpoints Added to ModalClient

- ✅ `/flux-ipadapter-faceid` - Flux Dev + IP-Adapter FaceID
- ✅ `/sdxl-instantid` - SDXL + InstantID
- ✅ `/z-image-simple` - Z-Image-Turbo Simple
- ✅ `/z-image-danrisi` - Z-Image-Turbo Danrisi
- ✅ `/z-image-instantid` - Z-Image-Turbo + InstantID
- ✅ `/z-image-pulid` - Z-Image-Turbo + PuLID

### New Methods Added to ModalJobRunner

- ✅ `generateZImageSimple()` - Z-Image-Turbo Simple generation
- ✅ `generateZImageDanrisi()` - Z-Image-Turbo Danrisi generation
- ✅ `generateZImageInstantID()` - Z-Image-Turbo + InstantID
- ✅ `generateZImagePuLID()` - Z-Image-Turbo + PuLID
- ✅ `generateFluxIPAdapterFaceID()` - Flux Dev + IP-Adapter FaceID
- ✅ `submitFaceSwap()` - **UPDATED** - Now uses `/flux-ipadapter-faceid` ✅

### Workflow Detection ✅

- ✅ Created `modal-workflow-detector.ts` - Detects workflow type from JSON
- ✅ Extracts parameters (prompt, dimensions, reference image, etc.)
- ✅ Routes to appropriate Modal endpoint

### ModalJobRunnerAdapter Updates ✅

- ✅ Added `queueWorkflow()` method - Detects workflow type and routes to Modal endpoints
- ✅ Supports Z-Image workflows (simple, danrisi, instantid, pulid)
- ✅ Supports Flux workflows (flux-dev, flux-ipadapter-faceid)
- ✅ Falls back to error for unknown workflows (suggests ComfyUI)

---

## Service Integration Status

### ProfilePictureSetService ✅ **IMPLEMENTED**

**Status**: ✅ Modal endpoints integrated

**Changes**:
- ✅ Added `ModalJobRunnerAdapter` injection
- ✅ Updated `generateProfilePictureSet()` to use Modal when available
- ✅ Updated `regenerateProfilePicture()` to use Modal when available
- ✅ Reference image handling:
  - Modal: Converts to base64 data URL
  - ComfyUI: Uploads to input folder (existing behavior)
- ✅ Updated `getJobResult()` to detect adapter from jobId format

**Endpoints Used**:
- Fast mode: `/z-image-simple` or `/z-image-danrisi` (based on workflowId)
- Consistent mode: `/z-image-instantid` or `/z-image-pulid` (with reference image)

**Testing**: ⏳ Pending

---

### BaseImageGenerationService ✅ **PARTIALLY IMPLEMENTED**

**Status**: ✅ Base images use Modal, character DNA generation updated

**Changes**:
- ✅ Already using Modal for base images (`submitBaseImages()`)
- ✅ Updated `generateFromCharacterDNA()` to use Modal `/flux-dev` endpoint
- ✅ Builds prompt using PromptBuilder
- ✅ Falls back to ComfyUI if Modal not available

**Endpoints Used**:
- Base images: `/flux-dev` (already working)
- Character DNA: `/flux-dev` (newly implemented)

**Testing**: ⏳ Pending

---

### StudioGenerationService ✅ **IMPLEMENTED**

**Status**: ✅ Modal endpoints integrated for workflows

**Changes**:
- ✅ Updated workflow-based generation to use Modal when available
- ✅ Uses `queueWorkflow()` which automatically detects workflow type
- ✅ Routes to appropriate Modal endpoint based on workflow detection
- ✅ Falls back to ComfyUI if Modal not available or NSFW content
- ✅ Tracks `externalProvider` correctly ('modal' vs 'comfyui')

**Endpoints Used**:
- Workflow-based: Auto-detected and routed to appropriate Modal endpoint
- Base images: `/flux-dev` (already working)

**Testing**: ⏳ Pending

---

## Flux-IPAdapter-FaceID Status ✅

**Status**: ✅ **IMPLEMENTED AND READY**

**Implementation**:
- ✅ Handler: `apps/modal/handlers/ipadapter_faceid.py`
- ✅ Endpoint: `/flux-ipadapter-faceid`
- ✅ Workflow: `workflows/flux-ipadapter-faceid.json`
- ✅ Models: XLabs-AI Flux IP-Adapter v2 + CLIP Vision
- ✅ Custom Node: x-flux-comfyui (installed)
- ✅ Registered in `app.py`

**Parameter Notes**:
- Parameter name `"ipadatper"` (typo) is **intentional** - matches the ComfyUI node
- Parameter `"ip_scale"` (not "weight") is correct for ApplyFluxIPAdapter

**Should Work Now**: ✅ Yes - All components are in place

**Testing**: ⏳ Pending (requires reference image test)

---

## Endpoint Summary

### Total Endpoints: 13

| # | Endpoint | Status | Use Case |
|---|----------|--------|----------|
| 1 | `/flux-dev` | ✅ Working | Base images, studio, character gen |
| 2 | `/flux` | ✅ Working | Fast generation |
| 3 | `/flux-ipadapter-faceid` | ✅ Implemented | Profile pics, face consistency (Flux) |
| 4 | `/sdxl-instantid` | ✅ Tested | Profile pics, face consistency (SDXL) |
| 5 | `/flux-instantid` | ❌ Incompatible | Not recommended |
| 6 | `/flux-lora` | ⏳ Pending | Character consistency (requires LoRA) |
| 7 | `/z-image-simple` | ✅ Implemented | Fast Z-Image generation |
| 8 | `/z-image-danrisi` | ✅ Implemented | Quality Z-Image generation |
| 9 | `/z-image-instantid` | ✅ Implemented | Z-Image face consistency |
| 10 | `/z-image-pulid` | ✅ Implemented | Z-Image face consistency |
| 11 | `/wan2` | ✅ Working | Text-to-video |
| 12 | `/seedvr2` | ⏳ Pending | Image upscaling |
| 13 | `/workflow` | ⏳ Pending | Custom workflows |

---

## Integration Status by Service

| Service | Modal Integration | Status | Notes |
|---------|------------------|--------|-------|
| **ProfilePictureSetService** | ✅ Complete | ✅ Implemented | Uses Modal for all profile picture generation |
| **BaseImageGenerationService** | ✅ Complete | ✅ Implemented | Uses Modal for base images and character DNA |
| **StudioGenerationService** | ✅ Complete | ✅ Implemented | Uses Modal for base images and workflows |
| **CharacterSheetService** | ❌ Not Started | ⏳ Pending | Not yet migrated (lower priority) |
| **InpaintEditService** | ❌ Not Started | ⏳ Pending | Not yet migrated (lower priority) |

---

## Next Steps

### High Priority
1. ⏳ **Test Profile Picture Generation** - Verify Modal endpoints work end-to-end
2. ⏳ **Test flux-ipadapter-faceid** - Verify face consistency works (should work now)
3. ⏳ **Test Studio Generation** - Verify workflow-based generation works with Modal

### Medium Priority
4. ⏳ **Test Character Generation** - Verify character DNA → image works
5. ⏳ **Add Error Handling** - Better fallback logic
6. ⏳ **Add Monitoring** - Track Modal vs ComfyUI usage

### Lower Priority
7. ⏳ **CharacterSheetService Migration** - If needed
8. ⏳ **InpaintEditService Migration** - If needed

---

## Testing Checklist

### Profile Pictures
- [ ] SFW profile pictures generate with Modal
- [ ] NSFW profile pictures generate (if supported)
- [ ] Face consistency works (80-85% for IP-Adapter, 85-90% for InstantID)
- [ ] Multiple positions generate correctly
- [ ] Cost tracking works

### Character Generation
- [ ] Character DNA → image generation works with Modal
- [ ] Face consistency works when base image provided
- [ ] Cost tracking works

### Studio Generation
- [ ] All workflow types work with Modal
- [ ] Face consistency works for studio images
- [ ] NSFW handling works correctly

### flux-ipadapter-faceid
- [ ] Endpoint responds correctly
- [ ] Face consistency works (80-85% match)
- [ ] No shape mismatch errors
- [ ] Cost tracking works

---

## Known Issues

1. **Workflow Detection**: The workflow detector may not perfectly identify all workflow types. May need refinement based on testing.

2. **Reference Image Handling**: Modal endpoints require base64 data URLs, while ComfyUI uses filenames. This is handled, but may need optimization.

3. **NSFW Support**: Modal endpoints may not support NSFW content. Need to verify and handle fallback to ComfyUI if needed.

---

## Related Documentation

- **Endpoint Reference**: `apps/modal/docs/ENDPOINTS-REFERENCE.md`
- **Migration Plan**: `apps/modal/docs/MODAL-ENDPOINT-MIGRATION-PLAN.md`
- **Face Consistency**: `apps/modal/docs/FLUX-FACE-CONSISTENCY-SUMMARY.md`
- **Z-Image Status**: `apps/modal/docs/status/Z-IMAGE-IMPLEMENTATION-STATUS.md`

---

**Last Updated**: 2026-01-28
