# WAN2 and Z-Image Status

> **Date**: 2026-01-28  
> **Status**: WAN2 ✅ Implemented | Z-Image ⚠️ Needs Implementation

---

## WAN2 (Wan2.1 Text-to-Video) ✅

### Status: **Implemented and Working**

- **Handler**: `apps/modal/handlers/wan2.py`
- **Endpoint**: `/wan2`
- **Status**: ✅ Tested and working
- **Model**: Wan2.1 T2V (1.3B FP16)
- **Output**: Animated WEBP video

### Implementation Details

- ✅ Handler class: `Wan2Handler`
- ✅ Workflow builder: `build_wan2_workflow()`
- ✅ Endpoint registered in `apps/modal/app.py`
- ✅ Client script support: `ryla_client.py wan2`
- ✅ Model download: `hf_download_wan2()` in `image.py`
- ✅ Cost tracking: Integrated

### Usage

```bash
# Client script
python3 apps/modal/ryla_client.py wan2 \
  --prompt "A cat walking" \
  --output test_wan2.webp \
  --width 832 \
  --height 480 \
  --length 33 \
  --fps 16 \
  --steps 30 \
  --cfg 6
```

### API Endpoint

```bash
POST https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run/wan2

{
  "prompt": "A cat walking",
  "negative_prompt": "",
  "width": 832,
  "height": 480,
  "length": 33,
  "fps": 16,
  "steps": 30,
  "cfg": 6,
  "seed": 42
}
```

### Workflow Files

- **API Format**: `libs/comfyui-workflows-api/video/wan2.1/native/wan2.1_t2v.api.json`
- **UI Format**: `libs/comfyui-workflows/video/wan2.1/native/wan2.1_t2v.json`
- **Modal Workflow**: `apps/modal/workflows/workflow_wan2_api.json`

### Model Requirements

- **Model**: `wan2.1_t2v_1.3B_fp16.safetensors`
- **Location**: `ComfyUI/models/diffusion_models/`
- **Source**: HuggingFace `numz/Wan2.1`
- **Size**: ~1.3 GB

### Cost

- **Typical Time**: 60-120 seconds
- **Estimated Cost**: $0.042-0.083 per video
- **GPU**: L40S

---

## Z-Image (Z-Image-Turbo) ⚠️

### Status: **Not Currently Implemented as Dedicated Modal Endpoint**

### What Exists

#### 1. TypeScript Workflow Builders ✅

Located in `libs/business/src/workflows/`:

- **`z-image-simple.ts`** - Basic workflow (no custom nodes)
- **`z-image-danrisi.ts`** - Optimized workflow (RES4LYF custom nodes)
- **`z-image-instantid.ts`** - Face consistency with InstantID
- **`z-image-pulid.ts`** - Face consistency with PuLID

**Status**: ✅ Working workflow builders (TypeScript)

**Usage**: These are used by the business layer to generate ComfyUI workflows, but need to be called via the generic `/workflow` endpoint.

#### 2. Archived Modal Implementations 📦

Located in `apps/modal/archive/`:

- **`comfyui_danrisi.py`** - Standalone Modal app for Z-Image Danrisi workflow
- **`comfyui_z_image_turbo.py`** - Standalone Modal app for Z-Image-Turbo

**Status**: ⚠️ Archived (not integrated into main app)

**Note**: These were separate Modal apps, not integrated into the main `ryla-comfyui` app.

#### 3. RunPod Handler ✅

Located in `handlers/z-image-turbo-handler.py`:

- **Status**: ✅ Working (for RunPod serverless)
- **Usage**: RunPod-specific implementation

#### 4. Workflow JSON Files ✅

- **`workflows/z-image-turbo-base-image.json`** - Base image workflow
- Various test workflows in `docs/research/workflows/`

### What's Missing

#### ❌ Dedicated Modal Handler

**No handler in `apps/modal/handlers/` for Z-Image workflows.**

Current options:
1. **Use generic `/workflow` endpoint** - Pass Z-Image workflow JSON directly
2. **Create dedicated handler** - Similar to `wan2.py`, `flux.py`, etc.

### Recommended Implementation

#### Option 1: Use Generic `/workflow` Endpoint (Current)

**How it works:**
1. Use TypeScript workflow builders (`libs/business/src/workflows/z-image-*.ts`)
2. Generate workflow JSON
3. Send to `/workflow` endpoint

**Pros:**
- ✅ Already works
- ✅ No new code needed
- ✅ Flexible (any workflow)

**Cons:**
- ❌ Less convenient (need to generate workflow JSON first)
- ❌ No dedicated endpoint documentation
- ❌ No client script support

#### Option 2: Create Dedicated Z-Image Handler (Recommended)

**Implementation Plan:**

1. **Create `apps/modal/handlers/z_image.py`**:
   ```python
   class ZImageHandler:
       def _z_image_simple_impl(self, item: dict) -> Response:
           # Use z-image-simple.ts workflow
       
       def _z_image_danrisi_impl(self, item: dict) -> Response:
           # Use z-image-danrisi.ts workflow
       
       def _z_image_instantid_impl(self, item: dict) -> Response:
           # Use z-image-instantid.ts workflow
       
       def _z_image_pulid_impl(self, item: dict) -> Response:
           # Use z-image-pulid.ts workflow
   ```

2. **Register endpoints**:
   - `/z-image-simple`
   - `/z-image-danrisi`
   - `/z-image-instantid`
   - `/z-image-pulid`

3. **Add client script support**:
   ```bash
   python3 apps/modal/ryla_client.py z-image-simple --prompt "..."
   python3 apps/modal/ryla_client.py z-image-danrisi --prompt "..."
   python3 apps/modal/ryla_client.py z-image-instantid --prompt "..." --reference-image "..."
   python3 apps/modal/ryla_client.py z-image-pulid --prompt "..." --reference-image "..."
   ```

4. **Model requirements**:
   - ✅ Already downloaded: `z_image_turbo_bf16.safetensors`
   - ✅ Already downloaded: `z-image-turbo-vae.safetensors`
   - ✅ Already downloaded: `qwen_3_4b.safetensors` (CLIP)

### Model Status

**Z-Image models are already available:**

- ✅ `z_image_turbo_bf16.safetensors` - Diffusion model (~11.46 GB)
- ✅ `z-image-turbo-vae.safetensors` - VAE (~0.31 GB)
- ✅ `qwen_3_4b.safetensors` - CLIP text encoder

**Location**: Modal volume `/root/models/`

### Custom Nodes Required

**For Danrisi workflow:**
- ✅ `RES4LYF` custom nodes (for `ClownsharKSampler_Beta`, `Sigmas Rescale`)
- ⚠️ **Note**: Previous documentation indicated node detection issues, but Danrisi workflow should work

**For Simple workflow:**
- ✅ No custom nodes required (uses standard ComfyUI nodes)

---

## Comparison

| Feature | WAN2 | Z-Image |
|---------|------|---------|
| **Status** | ✅ Implemented | ⚠️ Needs Implementation |
| **Handler** | ✅ `handlers/wan2.py` | ❌ None (use `/workflow`) |
| **Endpoint** | ✅ `/wan2` | ⚠️ `/workflow` (generic) |
| **Client Script** | ✅ `ryla_client.py wan2` | ❌ Not available |
| **Workflow Builders** | ✅ Python | ✅ TypeScript |
| **Models** | ✅ Downloaded | ✅ Downloaded |
| **Documentation** | ✅ Complete | ⚠️ Partial |

---

## Recommendations

### For WAN2
- ✅ **Status**: Complete, no action needed
- ✅ **Testing**: Already tested and working

### For Z-Image
- ⚠️ **Current**: Use `/workflow` endpoint with TypeScript workflow builders
- ✅ **Recommended**: Create dedicated handler (`apps/modal/handlers/z_image.py`)
- ✅ **Benefits**:
  - Dedicated endpoints (`/z-image-simple`, `/z-image-danrisi`, etc.)
  - Client script support
  - Better documentation
  - Consistent with other handlers (flux, wan2, instantid)

---

## Next Steps

1. **WAN2**: ✅ No action needed (already working)

2. **Z-Image**: 
   - [x] Create `apps/modal/handlers/z_image.py` ✅
   - [x] Register endpoints in `apps/modal/app.py` ✅
   - [x] Add client script support in `ryla_client.py` ✅
   - [ ] Verify models are available (check Modal volume)
   - [ ] Test each workflow variant
   - [ ] Update documentation

---

## Related Files

### WAN2
- Handler: `apps/modal/handlers/wan2.py`
- Model Download: `apps/modal/image.py` (function `hf_download_wan2`)
- Client: `apps/modal/ryla_client.py` (subcommand `wan2`)
- Workflows: `libs/comfyui-workflows-api/video/wan2.1/`

### Z-Image
- Workflow Builders: `libs/business/src/workflows/z-image-*.ts`
- Archived: `apps/modal/archive/comfyui_danrisi.py`, `comfyui_z_image_turbo.py`
- RunPod Handler: `handlers/z-image-turbo-handler.py`
- Workflow JSON: `workflows/z-image-turbo-base-image.json`
- Documentation: `apps/modal/docs/README-Z-IMAGE-TURBO.md`
