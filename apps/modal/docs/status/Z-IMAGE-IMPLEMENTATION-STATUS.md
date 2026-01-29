# Z-Image Implementation Status

> **Date**: 2026-01-28  
> **Status**: Implementation Complete - Ready for Testing  
> **Endpoints**: `/z-image-simple`, `/z-image-danrisi`, `/z-image-instantid`, `/z-image-pulid`

---

## Implementation Summary

✅ **Complete**: All 4 Z-Image-Turbo workflow variants implemented as dedicated Modal endpoints.

---

## What Was Implemented

### 1. Handler Implementation ✅

- **File**: `apps/modal/handlers/z_image.py`
- **Handler Class**: `ZImageHandler`
- **Workflow Builders**:
  - `build_z_image_simple_workflow()` - Basic workflow (no custom nodes)
  - `build_z_image_danrisi_workflow()` - Optimized workflow (RES4LYF nodes)
  - `build_z_image_instantid_workflow()` - Face consistency with InstantID
  - `build_z_image_pulid_workflow()` - Face consistency with PuLID
- **Implementation Methods**:
  - `_z_image_simple_impl()`
  - `_z_image_danrisi_impl()`
  - `_z_image_instantid_impl()`
  - `_z_image_pulid_impl()`
- **Endpoint Registration**: `setup_z_image_endpoints()`

### 2. Endpoint Registration ✅

- **File**: `apps/modal/app.py`
- **Endpoints Registered**:
  - `/z-image-simple`
  - `/z-image-danrisi`
  - `/z-image-instantid`
  - `/z-image-pulid`

### 3. Client Script Support ✅

- **File**: `apps/modal/ryla_client.py`
- **Subcommands Added**:
  - `z-image-simple` - Basic workflow
  - `z-image-danrisi` - Optimized workflow
  - `z-image-instantid` - Face consistency with InstantID
  - `z-image-pulid` - Face consistency with PuLID
- **Arguments**: Full support for all workflow parameters
- **Documentation**: Updated help text and usage examples

### 4. Model Status ✅

**Z-Image models are already available in Modal volume:**
- ✅ `z_image_turbo_bf16.safetensors` - Diffusion model (~12.3 GB)
- ✅ `z-image-turbo-vae.safetensors` - VAE (~0.3 GB)
- ✅ `qwen_3_4b.safetensors` - CLIP text encoder (~8.0 GB)

**Location**: Modal volume `/root/models/`

**Note**: Models were previously uploaded via `apps/modal/scripts/upload_z_image_models.py`

---

## Workflow Details

### 1. Z-Image Simple (`/z-image-simple`)

**Description**: Basic workflow using only built-in ComfyUI nodes (no custom nodes required).

**Features**:
- Standard KSampler (Euler)
- Simple scheduler
- No custom nodes required
- Fastest setup

**Default Parameters**:
- Steps: 9
- CFG: 1.0
- Size: 1024x1024

**Usage**:
```bash
python3 apps/modal/ryla_client.py z-image-simple \
  --prompt "A beautiful landscape" \
  --output z_image_simple.jpg
```

### 2. Z-Image Danrisi (`/z-image-danrisi`)

**Description**: Optimized workflow using RES4LYF custom nodes for better quality.

**Features**:
- ClownsharKSampler_Beta (optimized sampler)
- BetaSamplingScheduler
- Sigmas Rescale
- Better quality than simple workflow

**Required Custom Nodes**:
- `ClownsharKSampler_Beta`
- `Sigmas Rescale`
- `BetaSamplingScheduler`

**Default Parameters**:
- Steps: 20
- CFG: 1.0
- Size: 1024x1024

**Usage**:
```bash
python3 apps/modal/ryla_client.py z-image-danrisi \
  --prompt "A beautiful landscape" \
  --output z_image_danrisi.jpg
```

### 3. Z-Image InstantID (`/z-image-instantid`)

**Description**: Face consistency workflow using InstantID.

**Features**:
- Face consistency from reference image
- Works with Z-Image-Turbo models
- Better for extreme angles than PuLID

**Required**:
- Reference image (base64 data URL)
- InstantID custom nodes
- InstantID models (ip-adapter.bin, ControlNet, InsightFace)

**Default Parameters**:
- Steps: 20
- CFG: 1.0
- InstantID Strength: 0.8
- ControlNet Strength: 0.8
- Face Provider: CPU

**Usage**:
```bash
python3 apps/modal/ryla_client.py z-image-instantid \
  --prompt "A professional portrait" \
  --reference-image ref.jpg \
  --output z_image_instantid.jpg
```

### 4. Z-Image PuLID (`/z-image-pulid`)

**Description**: Face consistency workflow using PuLID.

**Features**:
- Face consistency from reference image
- Works with Z-Image-Turbo models
- Better for multiple reference images

**Required**:
- Reference image (base64 data URL)
- PuLID custom nodes
- PuLID models (pulid_flux_v0.9.1.safetensors, EVA CLIP, InsightFace)

**Default Parameters**:
- Steps: 20
- CFG: 1.0
- PuLID Strength: 0.8
- PuLID Start: 0.0
- PuLID End: 1.0
- Face Provider: CPU

**Usage**:
```bash
python3 apps/modal/ryla_client.py z-image-pulid \
  --prompt "A professional portrait" \
  --reference-image ref.jpg \
  --output z_image_pulid.jpg
```

---

## API Endpoints

### `/z-image-simple`

```bash
POST https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run/z-image-simple

{
  "prompt": "A beautiful landscape",
  "negative_prompt": "",
  "width": 1024,
  "height": 1024,
  "steps": 9,
  "cfg": 1.0,
  "seed": 42
}
```

### `/z-image-danrisi`

```bash
POST https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run/z-image-danrisi

{
  "prompt": "A beautiful landscape",
  "negative_prompt": "",
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "cfg": 1.0,
  "seed": 42
}
```

### `/z-image-instantid`

```bash
POST https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run/z-image-instantid

{
  "prompt": "A professional portrait",
  "reference_image": "data:image/jpeg;base64,...",
  "negative_prompt": "",
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "cfg": 1.0,
  "seed": 42,
  "instantid_strength": 0.8,
  "controlnet_strength": 0.8,
  "face_provider": "CPU"
}
```

### `/z-image-pulid`

```bash
POST https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run/z-image-pulid

{
  "prompt": "A professional portrait",
  "reference_image": "data:image/jpeg;base64,...",
  "negative_prompt": "",
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "cfg": 1.0,
  "seed": 42,
  "pulid_strength": 0.8,
  "pulid_start": 0.0,
  "pulid_end": 1.0,
  "face_provider": "CPU"
}
```

---

## Custom Nodes Required

### For Danrisi Workflow
- ✅ `RES4LYF` custom nodes:
  - `ClownsharKSampler_Beta`
  - `Sigmas Rescale`
  - `BetaSamplingScheduler`

### For InstantID Workflow
- ✅ `ComfyUI-InstantID` custom nodes:
  - `InsightFaceLoader`
  - `InstantIDModelLoader`
  - `InstantIDControlNetLoader`
  - `ApplyInstantID`

### For PuLID Workflow
- ✅ `ComfyUI-PuLID` custom nodes:
  - `PulidFluxModelLoader`
  - `PulidFluxInsightFaceLoader`
  - `PulidFluxEvaClipLoader`
  - `ApplyPulidFlux`
  - `FixPulidFluxPatch`
- ✅ `RES4LYF` custom nodes (for sampling)

---

## Files Created/Modified

### Created
- `apps/modal/handlers/z_image.py` - Handler implementation (all 4 variants)
- `apps/modal/docs/status/Z-IMAGE-IMPLEMENTATION-STATUS.md` - This file

### Modified
- `apps/modal/app.py` - Registered Z-Image endpoints
- `apps/modal/ryla_client.py` - Added client script support for all 4 variants
- `apps/modal/docs/status/WAN2-Z-IMAGE-STATUS.md` - Updated status

---

## Next Steps

1. ⏳ **Deploy Modal App** - Deploy updated app with Z-Image handlers
2. ⏳ **Test Endpoints** - Test each workflow variant:
   - `/z-image-simple` - Basic workflow
   - `/z-image-danrisi` - Optimized workflow
   - `/z-image-instantid` - Face consistency (requires reference image)
   - `/z-image-pulid` - Face consistency (requires reference image)
3. ⏳ **Verify Custom Nodes** - Ensure all required custom nodes are installed
4. ⏳ **Document Performance** - Document execution time and quality metrics

---

## Comparison with TypeScript Workflows

The Python implementations match the TypeScript workflow builders in `libs/business/src/workflows/`:

| TypeScript Builder | Python Handler | Status |
|-------------------|----------------|--------|
| `buildZImageSimpleWorkflow()` | `build_z_image_simple_workflow()` | ✅ Match |
| `buildZImageDanrisiWorkflow()` | `build_z_image_danrisi_workflow()` | ✅ Match |
| `buildZImageInstantIDWorkflow()` | `build_z_image_instantid_workflow()` | ✅ Match |
| `buildZImagePuLIDWorkflow()` | `build_z_image_pulid_workflow()` | ✅ Match |

---

## References

- TypeScript Workflows: `libs/business/src/workflows/z-image-*.ts`
- Model Upload: `apps/modal/scripts/upload_z_image_models.py`
- Status Document: `apps/modal/docs/status/WAN2-Z-IMAGE-STATUS.md`
- Z-Image Turbo Docs: `apps/modal/docs/README-Z-IMAGE-TURBO.md`
