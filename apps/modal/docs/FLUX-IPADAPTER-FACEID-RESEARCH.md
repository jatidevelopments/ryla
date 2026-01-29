# Flux 1 + IP-Adapter FaceID Research & Implementation

> **Date**: 2026-01-28  
> **Status**: Research Complete - Implementation In Progress  
> **Purpose**: Research and implement Flux-compatible face consistency solutions

---

## Executive Summary

**Finding**: **XLabs-AI Flux IP-Adapter v2** is specifically designed for FLUX.1-dev and provides face consistency without the ControlNet shape mismatch issues that InstantID has.

**Recommendation**: Implement **XLabs-AI Flux IP-Adapter v2** for Flux Dev face consistency workflows.

---

## Problem Statement

**Current Issue**: InstantID's ControlNet is incompatible with Flux Dev due to:
- InstantID ControlNet expects T5XXL embeddings (2816 dimensions)
- Flux Dev uses DualCLIP (T5XXL + CLIP-L)
- ApplyInstantID strips T5XXL, leaving only CLIP-L (768 dimensions)
- Result: Shape mismatch error

**Solution**: Use IP-Adapter FaceID specifically designed for Flux models.

---

## Available Solutions

### 1. XLabs-AI Flux IP-Adapter v2 ⭐⭐⭐⭐⭐ (Recommended)

**Status**: ✅ **Specifically designed for FLUX.1-dev**

**Repository**: 
- Model: https://huggingface.co/XLabs-AI/flux-ip-adapter-v2
- ComfyUI Nodes: https://github.com/XLabs-AI/x-flux-comfyui

**Advantages**:
- ✅ **Designed specifically for FLUX.1-dev** (not SDXL/1.5)
- ✅ **No ControlNet shape mismatch** (uses IP-Adapter, not ControlNet)
- ✅ **Trained at 512x512 (150k steps) and 1024x1024 (350k steps)**
- ✅ **Refined training for consistency**
- ✅ **Better facial feature generation**
- ✅ **Faster processing** than v1
- ✅ **Custom ComfyUI nodes** (`Flux Load IPAdapter`, `Apply Flux IPAdapter`)
- ✅ **Example workflows** provided in repository

**Models Needed**:
- `flux-ip-adapter-v2.safetensors` - IP-Adapter checkpoint
- `model.safetensors` - CLIP-L vision model (from OpenAI VIT CLIP large)
- Location: `ComfyUI/models/xlabs/ipadapters/` and `ComfyUI/models/clip_vision/`

**Custom Node**: `x-flux-comfyui`
- Install: `git clone https://github.com/XLabs-AI/x-flux-comfyui.git` into `ComfyUI/custom_nodes/`
- Run: `python setup.py` from the x-flux-comfyui directory

**Implementation Priority**: **HIGH** - Primary solution for Flux Dev face consistency

---

### 2. Shakker-Labs ComfyUI-IPAdapter-Flux ⭐⭐⭐⭐ (Alternative)

**Status**: ⚠️ **Community implementation**

**Repository**: https://github.com/Shakker-Labs/ComfyUI-IPAdapter-Flux

**Advantages**:
- ✅ Community-maintained
- ✅ 460+ stars on GitHub
- ✅ Includes workflow files

**Disadvantages**:
- ⚠️ Less official than XLabs-AI
- ⚠️ May not have same level of training refinement

**Implementation Priority**: **MEDIUM** - Fallback if XLabs-AI doesn't work

---

### 3. Standard IP-Adapter FaceID (Not Recommended)

**Status**: ❌ **Designed for SDXL/1.5, not Flux**

**Why Not Recommended**:
- Designed for single CLIP models (SDXL/1.5)
- May have compatibility issues with Flux's DualCLIP architecture
- XLabs-AI version is specifically optimized for Flux

**Implementation Priority**: **LOW** - Use XLabs-AI instead

---

## Comparison Matrix

| Solution | Flux Compatibility | Consistency | Setup | Status | Recommendation |
|----------|-------------------|-------------|-------|--------|----------------|
| **XLabs-AI Flux IP-Adapter v2** | ✅ Designed for Flux | ⭐⭐⭐⭐⭐ | Medium | ✅ Available | ⭐ **USE THIS** |
| **Shakker-Labs IP-Adapter-Flux** | ✅ Works with Flux | ⭐⭐⭐⭐ | Medium | ✅ Available | Alternative |
| **InstantID** | ❌ Incompatible | ⭐⭐⭐⭐ | Medium | ✅ Available | Use with SDXL only |
| **Standard IP-Adapter FaceID** | ⚠️ Unknown | ⭐⭐⭐ | Low | ✅ Available | Not recommended |

---

## Implementation Plan

### Phase 1: Research & Setup ✅

1. ✅ Research available Flux-compatible IP-Adapter solutions
2. ✅ Identify XLabs-AI as primary solution
3. ✅ Document findings

### Phase 2: Model & Node Installation

1. **Install Custom Node**:
   ```bash
   cd /root/comfy/ComfyUI/custom_nodes
   git clone https://github.com/XLabs-AI/x-flux-comfyui.git
   cd x-flux-comfyui
   python setup.py
   ```

2. **Download Models**:
   - IP-Adapter: `flux-ip-adapter-v2.safetensors` from HuggingFace
   - CLIP Vision: `model.safetensors` (OpenAI VIT CLIP large)
   - Place in: `ComfyUI/models/xlabs/ipadapters/` and `ComfyUI/models/clip_vision/`

### Phase 3: Workflow Implementation

1. **Create Workflow Builder**:
   - Location: `apps/modal/handlers/ipadapter_faceid.py`
   - Function: `build_flux_ipadapter_faceid_workflow()`
   - Based on: `workflows/flux-base-image.json` + XLabs-AI IP-Adapter nodes

2. **Workflow Structure**:
   ```
   Flux Dev Loaders (UNET, DualCLIP, VAE)
   ↓
   Load Reference Image
   ↓
   Load CLIP Vision (for IP-Adapter)
   ↓
   Flux Load IPAdapter (XLabs-AI node)
   ↓
   Apply Flux IPAdapter (XLabs-AI node)
   ↓
   CLIPTextEncode (positive/negative)
   ↓
   EmptySD3LatentImage
   ↓
   KSampler
   ↓
   VAEDecode
   ↓
   SaveImage
   ```

3. **Add Workflow to Repository**:
   - Location: `workflows/flux-ipadapter-faceid.json`
   - Make it publicly available

### Phase 4: Endpoint Implementation

1. **Create Handler**:
   - Location: `apps/modal/handlers/ipadapter_faceid.py`
   - Method: `_flux_ipadapter_faceid_impl()`
   - Endpoint: `/flux-ipadapter-faceid`

2. **Register Endpoint**:
   - Update: `apps/modal/app.py`
   - Add: `setup_ipadapter_faceid_endpoints()`

3. **Update Client Script**:
   - Add: `flux-ipadapter-faceid` subcommand
   - Location: `apps/modal/ryla_client.py`

### Phase 5: Testing

1. Test with reference image
2. Verify face consistency (target: 80-85%)
3. Compare with SDXL InstantID results
4. Document performance metrics

---

## Workflow Structure

### Node Types (XLabs-AI)

1. **Flux Load IPAdapter**:
   - Inputs: `ipadapter_file` (path to flux-ip-adapter-v2.safetensors)
   - Outputs: IP-Adapter model

2. **Apply Flux IPAdapter**:
   - Inputs:
     - `model` (Flux UNET model)
     - `ipadapter` (from Flux Load IPAdapter)
     - `image` (reference image)
     - `clip_vision` (CLIP vision model)
     - `weight` (strength, 0.0-1.0)
     - `weight_type` (optional)
   - Outputs: Modified model

### Integration with Flux Dev

```python
{
    # Flux Dev loaders
    "1": UNETLoader("flux1-dev.safetensors"),
    "2": DualCLIPLoader("clip_l.safetensors", "t5xxl_fp16.safetensors"),
    "3": VAELoader("ae.safetensors"),
    
    # Reference image
    "4": LoadImage(reference_image),
    
    # CLIP Vision (for IP-Adapter)
    "5": CLIPVisionLoader("model.safetensors"),  # OpenAI VIT CLIP large
    
    # XLabs-AI IP-Adapter nodes
    "6": FluxLoadIPAdapter("ip_adapter.safetensors"),  # Actual filename
    "7": ApplyFluxIPAdapter(
        model=["1", 0],
        ipadapter=["6", 0],
        image=["4", 0],
        clip_vision=["5", 0],
        weight=0.8
    ),
    
    # Text encoding
    "8": CLIPTextEncode(prompt, clip=["2", 0]),
    "9": CLIPTextEncode(negative_prompt, clip=["2", 0]),
    
    # Generation
    "10": EmptySD3LatentImage(width, height),
    "11": KSampler(
        model=["7", 0],  # Use IP-Adapter modified model
        positive=["8", 0],
        negative=["9", 0],
        latent=["10", 0]
    ),
    "12": VAEDecode(samples=["11", 0], vae=["3", 0]),
    "13": SaveImage(images=["12", 0])
}
```

---

## Model Requirements

### Required Models

1. **Flux IP-Adapter v2**:
   - File: `ip_adapter.safetensors` (actual filename in repository)
   - Source: https://huggingface.co/XLabs-AI/flux-ip-adapter-v2
   - Size: ~1.06 GB
   - Location: `ComfyUI/models/xlabs/ipadapters/`

2. **CLIP Vision Model**:
   - File: `model.safetensors` (OpenAI VIT CLIP large)
   - Source: OpenAI CLIP-L vision model
   - Size: ~500MB (estimated)
   - Location: `ComfyUI/models/clip_vision/`

### Download Commands

```python
# In image.py
def hf_download_flux_ipadapter():
    """Download XLabs-AI Flux IP-Adapter v2."""
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    # Download IP-Adapter (actual filename is ip_adapter.safetensors)
    ipadapter_model = hf_hub_download(
        repo_id="XLabs-AI/flux-ip-adapter-v2",
        filename="ip_adapter.safetensors",  # Actual filename in repository
        cache_dir="/cache",
        token=token,
    )
    
    # Download CLIP Vision (OpenAI VIT CLIP large)
    clip_vision_model = hf_hub_download(
        repo_id="openai/clip-vit-large-patch14",
        filename="model.safetensors",  # Verify actual filename
        cache_dir="/cache",
        token=token,
    )
    
    # Symlink to ComfyUI directories
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/xlabs/ipadapters && "
        f"ln -s {ipadapter_model} {comfy_dir}/models/xlabs/ipadapters/flux-ip-adapter-v2.safetensors",
        shell=True,
        check=True,
    )
    
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/clip_vision && "
        f"ln -s {clip_vision_model} {comfy_dir}/models/clip_vision/model.safetensors",
        shell=True,
        check=True,
    )
```

---

## Expected Results

### Face Consistency

- **Target**: 80-85% face match (similar to IP-Adapter FaceID Plus)
- **Comparison**:
  - InstantID (SDXL): 85-90%
  - IP-Adapter FaceID (Flux): 80-85% (expected)
  - PuLID: 80%

### Performance

- **Speed**: Fast (similar to standard IP-Adapter)
- **Quality**: High (trained specifically for Flux)
- **Compatibility**: ✅ Full Flux Dev compatibility

---

## Next Steps

1. ✅ Research complete
2. ✅ Install XLabs-AI custom node in Modal image build
3. ✅ Download Flux IP-Adapter v2 model (function added)
4. ✅ Download CLIP Vision model (function added)
5. ✅ Create workflow builder (`build_flux_ipadapter_faceid_workflow()`)
6. ✅ Implement endpoint (`/flux-ipadapter-faceid`)
7. ✅ Add workflow to repository (`workflows/flux-ipadapter-faceid.json`)
8. ✅ Update client script (`flux-ipadapter-faceid` subcommand)
9. ⏳ Test with reference image (after deployment)
10. ⏳ Document usage in workflows README

---

## References

- XLabs-AI Flux IP-Adapter v2: https://huggingface.co/XLabs-AI/flux-ip-adapter-v2
- ComfyUI Custom Nodes: https://github.com/XLabs-AI/x-flux-comfyui
- Face Consistency Alternatives: `apps/modal/docs/FACE-CONSISTENCY-ALTERNATIVES.md`
- InstantID Compatibility Issues: `apps/modal/docs/status/ENDPOINT-FIXES-STATUS.md`
