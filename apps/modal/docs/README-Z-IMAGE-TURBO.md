# RYLA ComfyUI Z-Image-Turbo - Modal Implementation

Simple ComfyUI workflow for Z-Image-Turbo on Modal.com (no custom nodes required).

## ⚠️ Current Status: **NOT WORKING - Use Danrisi Workflow Instead**

**Status**: RES4LYF custom nodes are not being detected by ComfyUI, preventing the optimized workflow from running.

**Issue**: The nodes (`Sigmas Rescale`, `ClownsharKSampler_Beta`) are installed and registered, but ComfyUI cannot find them when the workflow is submitted. This is the same issue that was solved in the Danrisi workflow.

## What's Working

- ✅ ComfyUI installed and configured
- ✅ ComfyUI Manager installed (for custom node management)
- ✅ RES4LYF custom nodes installed (files present)
- ✅ Models loaded from Modal volume
- ✅ Basic image generation working (with standard KSampler)
- ✅ Images returned as base64-encoded data

## What's Not Working

- ❌ RES4LYF nodes not detected by ComfyUI (`Sigmas Rescale`, `ClownsharKSampler_Beta`)
- ❌ Using standard `KSampler` instead of optimized `ClownsharKSampler_Beta`
- ❌ Image quality is lower than expected (due to wrong sampling method)

## Recommended Solution

**Use the Danrisi workflow instead** (`comfyui_danrisi.py`), which:
- ✅ Has working RES4LYF node detection (same nodes, but properly loaded)
- ✅ Uses optimized `ClownsharKSampler_Beta` + `BetaSamplingScheduler` + `Sigmas Rescale`
- ✅ Produces higher quality images
- ✅ Already tested and working
- ✅ Uses the exact same node names and workflow structure

```bash
# Use Danrisi workflow instead (it works!)
modal run apps/modal/comfyui_danrisi.py::test_workflow
```

**Note**: The Danrisi workflow uses the exact same node names (`Sigmas Rescale`, `ClownsharKSampler_Beta`) and the same workflow structure. The difference is in how ComfyUI detects and loads the nodes - the Danrisi workflow has this working correctly.

## Test Results (Current Implementation)

```bash
✅ Workflow test successful! (but using wrong sampler)
📸 Generated 1 image(s)
   Image 1: z_image_turbo_00001_.png
   💾 Saved to: z_image_turbo_test_1.png
```

**Note**: The image was generated successfully, but quality is suboptimal because it's using standard `KSampler` instead of the optimized Danrisi sampling method.

## Key Differences from Danrisi Workflow

| Feature | Z-Image-Turbo (Simple) | Danrisi (Complex) |
|---------|------------------------|-------------------|
| Custom Nodes | ❌ None required | ✅ RES4LYF, controlaltai-nodes |
| Sampler | Standard KSampler | ClownsharKSampler_Beta |
| Setup Complexity | Low | High |
| Steps | 9 (default) | 20 (configurable) |
| CFG Scale | 0.0 (turbo) | 1.0 (danrisi) |

## Prerequisites

1. **Modal Account**: You have a Modal account ✅
2. **Modal CLI**: Install and authenticate
   ```bash
   pip install modal
   modal token new
   ```
3. **Models**: Upload Z-Image-Turbo models to volume (shared with Danrisi workflow)

## Setup

### Step 1: Authenticate with Modal

```bash
# Install Modal CLI
pip install modal

# Authenticate (will open browser)
modal token new

# Verify authentication
modal app list
```

### Step 2: Upload Models (if not already done)

The models are shared with the Danrisi workflow. If you've already uploaded models for `comfyui_danrisi.py`, you can skip this step.

```bash
# Check existing models
modal run apps/modal/comfyui_z_image_turbo.py::list_models

# If models are missing, upload them:
# (See apps/modal/upload_z_image_models.py for automated upload)
```

**Required Models** (same as Danrisi):
- `checkpoints/z_image_turbo_bf16.safetensors` (diffusion model)
- `clip/qwen_3_4b.safetensors` (text encoder)
- `vae/z-image-turbo-vae.safetensors` (VAE)

### Step 3: Deploy

```bash
# Deploy the app
modal deploy apps/modal/comfyui_z_image_turbo.py

# Verify deployment
modal app list
```

### Step 4: Test

```bash
# Test the workflow
modal run apps/modal/comfyui_z_image_turbo.py::test_workflow
```

## Usage

### From Python Code

```python
import modal

# Get the function
generate_image = modal.Function.lookup(
    "ryla-comfyui-z-image-turbo",
    "generate_image"
)

# Generate image
result = generate_image.remote(
    prompt="A beautiful landscape with mountains and a lake",
    negative_prompt="deformed, blurry, bad anatomy",
    width=1024,
    height=1024,
    steps=9,  # Z-Image-Turbo default
    cfg=0.0,  # Turbo models use 0.0
    seed=42,
)

if result["status"] == "success":
    images = result["images"]
    # images[0]["data"] contains base64-encoded image
```

### From HTTP Endpoint

After deployment, Modal provides an HTTP endpoint:

```bash
# Get endpoint URL
modal app show ryla-comfyui-z-image-turbo

# Call via HTTP
curl -X POST https://<workspace>--ryla-comfyui-z-image-turbo-generate-image.modal.run \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful landscape",
    "width": 1024,
    "height": 1024,
    "steps": 9,
    "cfg": 0.0
  }'
```

### From Your API

```typescript
// In your API or business logic
const response = await fetch(
  "https://<workspace>--ryla-comfyui-z-image-turbo-generate-image.modal.run",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "A beautiful landscape",
      negative_prompt: "deformed, blurry",
      width: 1024,
      height: 1024,
      steps: 9,
      cfg: 0.0,
      seed: 42,
    }),
  }
);

const result = await response.json();
if (result.status === "success") {
  const imageBase64 = result.images[0].data;
  // Use base64 image
}
```

## Workflow Details

The simple workflow uses these standard ComfyUI nodes:

1. **UNETLoader** - Loads `z_image_turbo_bf16.safetensors`
2. **CLIPLoader** - Loads `qwen_3_4b.safetensors` (Lumina2 type)
3. **VAELoader** - Loads `z-image-turbo-vae.safetensors`
4. **CLIPTextEncode** - Encodes positive and negative prompts
5. **ConditioningZeroOut** - Zeros out negative conditioning
6. **EmptySD3LatentImage** - Creates empty latent image
7. **KSampler** - Standard Euler sampler (no custom nodes)
8. **VAEDecode** - Decodes latent to image
9. **SaveImage** - Saves final image

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | **required** | Text prompt for image generation |
| `negative_prompt` | string | `"deformed, blurry..."` | Negative prompt |
| `width` | int | `1024` | Image width |
| `height` | int | `1024` | Image height |
| `steps` | int | `9` | Inference steps (Z-Image-Turbo uses 9) |
| `cfg` | float | `0.0` | CFG scale (turbo models use 0.0) |
| `seed` | int | `random` | Random seed for reproducibility |

## Cost

- **GPU Time**: ~$2-3/hr for A100 (pay per second)
- **Volume Storage**: Included (shared with Danrisi workflow)
- **Per Image**: ~$0.001-0.002 (faster than Danrisi due to fewer steps)

## Troubleshooting

### Models Not Found

```bash
# Check models in volume
modal run apps/modal/comfyui_z_image_turbo.py::list_models

# If missing, upload models (see apps/modal/upload_z_image_models.py)
```

### Server Startup Issues

```bash
# View app logs
modal app logs ryla-comfyui-z-image-turbo

# Check deployment status
modal app show ryla-comfyui-z-image-turbo
```

### Workflow Errors

The simple workflow should work out of the box with standard ComfyUI. If you see node errors:

1. Check that models are uploaded correctly
2. Verify ComfyUI cloned successfully (check logs)
3. Ensure models match expected filenames

## When to Use This vs Danrisi

**Use Z-Image-Turbo (Simple)** when:
- ✅ You want fast setup and deployment
- ✅ You don't need advanced sampling (ClownsharKSampler_Beta)
- ✅ You want simpler maintenance
- ✅ You're okay with standard KSampler quality

**Use Danrisi (Complex)** when:
- ✅ You need advanced sampling techniques
- ✅ You want optimized quality with custom nodes
- ✅ You're willing to manage custom node dependencies

## Next Steps

1. ✅ **Deploy**: `modal deploy apps/modal/comfyui_z_image_turbo.py`
2. ✅ **Test**: `modal run apps/modal/comfyui_z_image_turbo.py::test_workflow`
3. ✅ **Integrate**: Add to your API/business logic
4. ✅ **Monitor**: Set up logging and monitoring

## References

- [Modal Documentation](https://modal.com/docs)
- [ComfyUI API](https://github.com/comfyanonymous/ComfyUI/wiki/API)
- [Z-Image-Turbo Workflow](../../workflows/z-image-turbo-base-image.json)
- [Danrisi Workflow](./comfyui_danrisi.py) (complex version)
- [Modal Comprehensive Guide](../../docs/research/infrastructure/MODAL-COMPREHENSIVE-GUIDE.md)
