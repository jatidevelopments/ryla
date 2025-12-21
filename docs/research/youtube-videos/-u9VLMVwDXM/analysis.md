# Z-Image Danrisi Workflow Analysis

> **Source**: https://www.youtube.com/watch?v=-u9VLMVwDXM  
> **Date**: 2025-12-21

## Key Findings

### Model Architecture (Different from Standard Loading)

The workflow reveals that Z-Image-Turbo uses a **split component architecture**, NOT a single checkpoint:

| Component | File | Size | Location |
|-----------|------|------|----------|
| Diffusion Model | `z_image_turbo_bf16.safetensors` | ~12.3 GB | `models/diffusion_models/` |
| Text Encoder | `qwen_3_4b.safetensors` | ~8 GB | `models/text_encoders/` |
| VAE | `ae.safetensors` (renamed) | ~335 MB | `models/vae/` |

**Total: ~21 GB** for Z-Image-Turbo with proper loading.

### ComfyUI Nodes Used

The workflow uses specialized nodes:

1. **UNETLoader** - Loads diffusion model separately
2. **CLIPLoader** - Loads text encoder (Qwen 3 4B) with `lumina2` type
3. **VAELoader** - Loads VAE separately
4. **LoraLoader** - Optional LoRA support
5. **ClownsharKSampler_Beta** - Custom sampler from RES4LYF
6. **BetaSamplingScheduler** - 20 steps, beta sampling
7. **Sigmas Rescale** - Fine-tuning sigma values
8. **FluxResolutionNode** - Resolution control (1024x1024 default)

### Required Custom Nodes

- **RES4LYF** (https://github.com/ClownsharkBatwing/RES4LYF)
  - Provides `ClownsharKSampler_Beta` and `Sigmas Rescale`
- **controlaltai-nodes** - Provides `FluxResolutionNode`

### Sampler Settings

```
sampler: linear/ralston_2s
scheduler: beta
steps: 20
sigmas_rescale: 0.996
cfg_scale: 0.5
```

## Implications for RYLA

### 1. Our Handler is Wrong

Our current `z-image-turbo-handler.py` tries to load Z-Image using `diffusers.ZImagePipeline.from_pretrained()`, but:
- The official distribution uses **separate component files**
- Requires **ComfyUI-style loading** (UNET + CLIP + VAE separately)
- Text encoder is **Qwen 3 4B** with special `lumina2` tokenization

### 2. Options to Fix

**Option A: Use ComfyUI Backend**
- Deploy ComfyUI as the backend
- Load this workflow JSON via API
- Most compatible with community workflows

**Option B: Rewrite Handler for Split Loading**
- Use diffusers `UNet2DConditionModel.from_pretrained()` for UNET
- Use `CLIPTextModel` with Qwen tokenizer
- Custom pipeline assembly
- More complex but more control

**Option C: Use Comfy-Org Repository**
- HuggingFace: `Comfy-Org/z_image_turbo`
- Already has split files in correct structure
- Can potentially use with standard diffusers loading

### 3. Model Download URLs (Verified)

```bash
# Diffusion Model
https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors

# Text Encoder
https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors

# VAE
https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors
```

### 4. LoRA Support

The workflow includes LoRA loading (`nicegirls_Zimage.safetensors`), which means:
- Z-Image-Turbo supports LoRA fine-tuning
- Can train custom character LoRAs on Z-Image base
- Civitai already has Z-Image LoRAs available

## Action Items

- [ ] Update Z-Image handler to use split component loading
- [ ] Download models from `Comfy-Org/z_image_turbo` (verified URLs)
- [ ] Consider deploying ComfyUI as API backend for workflow compatibility
- [ ] Test RES4LYF sampler vs standard samplers for quality comparison
- [ ] Investigate Z-Image LoRA training for character consistency (EP-005)

## Files Saved

- `download_zimage_danrisi_models_script.sh` - Model download script
- `Z-Image_Danrisi_modified_loaders.json` - ComfyUI workflow

## Tags

#research #z-image-turbo #comfyui #workflow #model-architecture #ep-005

