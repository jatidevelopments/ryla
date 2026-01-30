# LoRA Workflow Guide

**Last Updated**: 2026-01-29  
**Status**: Active  
**Related**: EP-058 (Modal MVP Models)

---

## Overview

This document describes how LoRA (Low-Rank Adaptation) works across RYLA's AI models, including training, loading, and inference patterns.

## LoRA Support Matrix

| Model                | Training Tool       | Loading Support                  | Endpoint                | Status     |
| -------------------- | ------------------- | -------------------------------- | ----------------------- | ---------- |
| **Qwen-Image 2512**  | AI Toolkit (Ostris) | ✅ ComfyUI `LoraLoaderModelOnly` | `/qwen-image-2512-lora` | ✅ Live    |
| **Wan 2.6 Video**    | Musubi Tuner        | ✅ ComfyUI `LoraLoaderModelOnly` | `/wan2.6-lora`          | ✅ Live    |
| **Z-Image Turbo**    | AI Toolkit (Ostris) | ✅ Diffusers `load_lora_weights` | `/z-image-lora`         | ✅ Live    |
| **Flux Dev/Schnell** | AI Toolkit (Ostris) | ✅ ComfyUI `LoraLoaderModelOnly` | `/flux-lora`            | ✅ Live    |
| **Qwen-Image Edit**  | AI Toolkit (Ostris) | ✅ Supported                     | `/qwen-image-edit-lora` | 🔜 Planned |

---

## Endpoint Reference

### `/qwen-image-2512-lora` - High-Quality T2I with LoRA

**Best for**: High-quality character-consistent images

**Request Parameters**:

```json
{
  "prompt": "a woman in a red dress, professional photo",
  "lora_id": "abc123", // Auto-prefixed to "character-abc123.safetensors"
  "lora_name": "my-lora.safetensors", // Alternative: direct filename
  "lora_strength": 1.0, // Default: 1.0 (range: 0.0-2.0)
  "trigger_word": "ohwx woman", // Optional: prepended to prompt
  "width": 1328, // Default: 1328
  "height": 1328, // Default: 1328
  "steps": 50, // Default: 50
  "cfg": 4.0, // Default: 4.0
  "seed": 12345, // Optional
  "negative_prompt": "bad quality"
}
```

**Response**: `image/png` with cost headers

**Optimal Settings**:

- Steps: 50 (quality) or 25 (balanced)
- CFG: 4.0
- LoRA Strength: 0.8-1.2

---

### `/wan2.6-lora` - Video with Character LoRA

**Best for**: Character-consistent video generation

**Request Parameters**:

```json
{
  "prompt": "a woman walking on the beach",
  "lora_id": "abc123", // Auto-prefixed to "character-abc123.safetensors"
  "lora_name": "my-lora.safetensors", // Alternative: direct filename
  "lora_strength": 1.0, // Default: 1.0 (typical: 1.0-2.0 for video)
  "trigger_word": "ohwx woman", // Optional: prepended to prompt
  "width": 832, // Default: 832
  "height": 480, // Default: 480
  "length": 33, // Default: 33 frames
  "steps": 30, // Default: 30
  "cfg": 6.0, // Default: 6.0
  "fps": 16, // Default: 16
  "seed": 12345, // Optional
  "negative_prompt": ""
}
```

**Response**: `image/webp` (animated) with cost headers

**Optimal Settings**:

- Steps: 30
- CFG: 6.0
- LoRA Strength: 1.0-2.0 (higher than image models)
- Frames: 33-65

**Notes**:

- WAN LoRAs typically require higher strength than image LoRAs
- LoRAs trained with Musubi Tuner work best

---

### `/z-image-lora` - Fast T2I with LoRA

**Best for**: Quick character-consistent image generation

**Request Parameters**:

```json
{
  "prompt": "a woman smiling, portrait photo",
  "lora_id": "abc123", // Auto-prefixed to "character-abc123.safetensors"
  "lora_name": "my-lora.safetensors", // Alternative: direct filename
  "lora_strength": 1.0, // Default: 1.0
  "trigger_word": "ohwx woman", // Optional: prepended to prompt
  "width": 1024, // Default: 1024
  "height": 1024, // Default: 1024
  "steps": 8, // Default: 8 (optimal for Z-Image + LoRA)
  "guidance_scale": 4.5, // Default: 4.5 (optimal for LoRA)
  "seed": 12345, // Optional
  "negative_prompt": ""
}
```

**Response**: `image/jpeg` with cost headers

**Optimal Settings**:

- Steps: 8 (Z-Image Turbo is fast)
- Guidance Scale: 4.5 (higher than base model's 0.0)
- LoRA Strength: 1.0

**Notes**:

- Uses diffusers pipeline with `load_lora_weights()`
- Faster than Qwen but slightly lower quality
- LoRAs trained with AI Toolkit v2 adapter recommended

---

### `/flux-lora` - Flux with LoRA

**Best for**: Standard Flux model with character LoRA

**Request Parameters**:

```json
{
  "prompt": "a woman in a garden",
  "lora_id": "abc123", // Auto-prefixed to "character-abc123.safetensors"
  "lora_name": "my-lora.safetensors", // Alternative: direct filename
  "lora_strength": 1.0, // Default: 1.0
  "trigger_word": "ohwx woman", // Optional
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "cfg": 3.5,
  "seed": 12345,
  "negative_prompt": ""
}
```

**Response**: `image/png` with cost headers

---

## LoRA File Management

### File Location

LoRAs are stored on the Modal volume at:

```
/root/models/loras/
├── character-abc123.safetensors    # Character LoRA (lora_id format)
├── my-custom-lora.safetensors      # Custom LoRA (lora_name format)
└── ...
```

### Naming Convention

| Parameter   | Format                       | Example                        |
| ----------- | ---------------------------- | ------------------------------ |
| `lora_id`   | `character-{id}.safetensors` | `character-abc123.safetensors` |
| `lora_name` | Direct filename              | `my-custom-lora.safetensors`   |

**Best Practice**: Use `lora_id` for character LoRAs linked to database records.

### Symlinking

At runtime, LoRAs are symlinked from the volume to ComfyUI's loras directory:

```
/root/models/loras/my-lora.safetensors
   ↓ (symlink)
/root/comfy/ComfyUI/models/loras/my-lora.safetensors
```

This is handled automatically by each endpoint handler.

---

## LoRA Training

### Recommended Tools

| Model         | Training Tool       | Notes                                |
| ------------- | ------------------- | ------------------------------------ |
| Qwen-Image    | AI Toolkit (Ostris) | Full precision saves recommended     |
| Z-Image Turbo | AI Toolkit (Ostris) | Use v2 adapter, 1024x1024 resolution |
| Wan 2.6       | Musubi Tuner        | Video-specific LoRA training         |
| Flux          | AI Toolkit (Ostris) | Standard Flux LoRA training          |

### Training Best Practices

**Z-Image Turbo** (based on community research):

- Resolution: 1024x1024
- Learning Rate: 0.0001 (critical - higher destroys quality)
- Steps: 2000-3000 (3000 sweet spot)
- Rank/Alpha: 8-16 (16 for complex characters)
- Optimizer: AdamW8Bit
- Dataset: 10-30 high-quality captioned images
- Adapter: `ostris/zimage_turbo_training_adapter_v2`

**Qwen-Image 2512**:

- Resolution: 1328x1328 (native)
- Steps: 2000-4000
- Rank: 16-32
- Use AI Toolkit with Qwen support

**Qwen-Image Edit 2511**:

- Supports LoRA training with AI Toolkit (Ostris)
- Also available on FAL.ai Trainer API
- Key benefits: Character consistency during editing, better identity preservation
- Training similar to Qwen-Image 2512
- Endpoint `/qwen-image-edit-lora` planned for future implementation

**Wan 2.6 Video**:

- Use Musubi Tuner for video LoRAs
- Higher learning rate than image models
- Video dataset with consistent character

### Training Infrastructure

**Primary: Modal.com (RYLA Production)**

LoRA training runs on Modal.com using the `ryla-lora-training` app:

- **GPU**: A100-80GB
- **Training time**: 3-10 minutes (500 steps)
- **Cost**: ~$0.50-2.00 per LoRA
- **Location**: `/root/models/loras/` on `ryla-models` volume

**Usage from backend**:

```python
from modal import Function

train_fn = Function.from_name("ryla-lora-training", "train_lora")
call = train_fn.spawn(
    job_id="lora-character123-abc",
    image_urls=["https://...img1.jpg", "https://...img2.jpg", "https://...img3.jpg"],
    trigger_word="mycharacter",
    character_id="character123",
    config={"max_train_steps": 500, "rank": 16, "resolution": 512}
)
result = call.get()  # Blocking, or poll for status
```

**Alternative: RunPod with AI Toolkit**

- GPU: RTX 4090 or A100 (24GB+ VRAM)
- Training time: 30min - 2hrs depending on steps
- Cost: ~$2-5 per LoRA

See: `docs/research/models/LORA-TRAINING-RESEARCH.md` for detailed training setup.

---

## Workflow Implementation Details

### ComfyUI Approach (Qwen, Wan, Flux)

Uses `LoraLoaderModelOnly` node:

```python
workflow = {
    # Load base model
    "1": {
        "class_type": "UNETLoader",
        "inputs": {"unet_name": "model.safetensors"}
    },
    # Apply LoRA (model only, no CLIP)
    "2": {
        "class_type": "LoraLoaderModelOnly",
        "inputs": {
            "model": ["1", 0],
            "lora_name": "character-abc123.safetensors",
            "strength_model": 1.0
        }
    },
    # Continue with LoRA-modified model
    "3": {
        "class_type": "KSampler",
        "inputs": {
            "model": ["2", 0],  # Use LoRA-modified model
            ...
        }
    }
}
```

### Diffusers Approach (Z-Image)

Uses `load_lora_weights()` method:

```python
from modelscope import ZImagePipeline

pipe = ZImagePipeline.from_pretrained("model_dir")
pipe.to("cuda")

# Load LoRA
pipe.load_lora_weights("/root/models/loras/my-lora.safetensors")
pipe.fuse_lora(lora_scale=1.0)

# Generate
output = pipe(prompt="...", num_inference_steps=8, guidance_scale=4.5)

# Unload LoRA (restore base model)
pipe.unfuse_lora()
pipe.unload_lora_weights()
```

---

## Error Handling

### Common Errors

| Error                              | Cause                    | Solution                               |
| ---------------------------------- | ------------------------ | -------------------------------------- |
| `lora_id or lora_name is required` | Missing LoRA parameter   | Provide `lora_id` or `lora_name`       |
| `LoRA not found: ...`              | File doesn't exist       | Upload LoRA to `/root/models/loras/`   |
| `Failed to load LoRA`              | Incompatible LoRA format | Ensure LoRA matches model architecture |
| Blurry/distorted output            | LoRA strength too high   | Reduce `lora_strength` to 0.7-0.9      |

### Validation Flow

1. Check `lora_id` or `lora_name` provided
2. Construct filename (auto-prefix for `lora_id`)
3. Check volume path exists
4. Symlink to ComfyUI if needed
5. Validate file exists before workflow execution

---

## Cost Comparison

| Endpoint                | Steps | Approx. Time | Est. Cost per Image |
| ----------------------- | ----- | ------------ | ------------------- |
| `/qwen-image-2512-lora` | 50    | 15-20s       | ~$0.02              |
| `/z-image-lora`         | 8     | 3-5s         | ~$0.005             |
| `/flux-lora`            | 20    | 8-12s        | ~$0.01              |
| `/wan2.6-lora`          | 30    | 45-60s       | ~$0.05              |

---

## Related Documentation

- [RYLA Ideal Model Stack](RYLA-IDEAL-MODEL-STACK.md)
- [Model Registry](MODEL-REGISTRY.md)
- [EP-058 Modal MVP Models](../../requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md)
- [Endpoint App Mapping](../../../apps/modal/ENDPOINT-APP-MAPPING.md)
