# Qwen-Image Face Consistency Options

> Research summary: Methods to achieve face consistency with Qwen-Image 2512

**Date**: January 2026  
**Status**: Research Complete

---

## Executive Summary

IPAdapter with Qwen-Image 2512 is **experimental and produces weak face consistency** because IPAdapter was designed for SD/SDXL/Flux architectures. However, there are **3 better alternatives**:

| Method | Quality | Speed | Complexity | Recommended |
|---|---|---|---|---|
| **Qwen-Edit Multi-Image** | High | Medium | Low | ⭐ Best |
| **ReActor Face Swap** | High | Fast | Medium | ⭐ Great |
| **LoRA Training** | Highest | Slow (train) | High | For production |

---

## Option 1: Qwen-Edit Multi-Image Conditioning ⭐ RECOMMENDED

**This is what the PuLID developers recommend as a replacement for face consistency!**

### How It Works

Qwen-Image-Edit-2511 has **built-in character consistency**. The workflow:

1. **Reference Image**: Provide a face/character reference
2. **Edit Instruction**: Describe the scene change
3. **Output**: Same face in new scene

### Workflow

```
Reference Face Image → Qwen-Edit-2511 → "Put this person at a beach" → Same face, new scene
```

### Advantages

- ✅ Native to Qwen ecosystem (same architecture)
- ✅ Built-in character consistency (designed for this)
- ✅ Works with multi-person group photos
- ✅ Preserves identity, pose, lighting
- ✅ Already deployed (`ryla-qwen-edit`)

### Limitations

- ⚠️ Requires source image (can't generate from scratch)
- ⚠️ Editing, not pure text-to-image

### API Usage

```bash
POST /qwen-image-edit-2511
{
  "source_image": "data:image/jpeg;base64,...",  # Face reference
  "instruction": "Put this person at a beach with sunset",
  "denoise": 0.7,  # Lower = keep more of original
  "steps": 50
}
```

### Research Sources

- [NextDiffusion Tutorial](https://www.nextdiffusion.ai/tutorials/consistent-outfit-changes-with-multi-qwen-image-edit-2511-in-comfyui)
- [MimicPC Workflow](https://www.mimicpc.com/workflows/qwen-edit-2509-consistent-faces)
- [ComfyUI Blog](https://blog.comfy.org/p/qwen-image-edit-2511-and-qwen-image)

---

## Option 2: ReActor Face Swap (Post-Processing) ⭐ RECOMMENDED

### How It Works

1. Generate image with Qwen-Image 2512 (best quality T2I)
2. Apply ReActor to swap the generated face with reference face
3. Result: Qwen quality + reference face

### Workflow

```
Text Prompt → Qwen-Image-2512 → Generated Image → ReActor Face Swap → Final Image with Reference Face
```

### Advantages

- ✅ Works with ANY model (Qwen, Flux, SDXL, etc.)
- ✅ Very high quality face matching
- ✅ Fast post-processing
- ✅ Separate concerns (generation vs. face)
- ✅ Gender-based face detection
- ✅ Built-in face restoration

### Limitations

- ⚠️ Two-step process (slightly slower total)
- ⚠️ Requires ReActor custom node
- ⚠️ Face swap artifacts possible in extreme poses

### Implementation Required

Need to add ReActor to the Modal image and create endpoint:

```python
# Proposed workflow
# 1. Generate with Qwen-Image 2512
qwen_output = generate_with_qwen(prompt)

# 2. Apply ReActor face swap
final_output = reactor_face_swap(
    source_image=qwen_output,
    face_reference=reference_face,
    restore_face=True
)
```

### Research Sources

- [ComfyUI-ReActor GitHub](https://github.com/Gourieff/ComfyUI-ReActor)
- [RunComfy ReActor Workflow](https://runcomfy.com/comfyui-workflows/comfyui-reactor-workflow-fast-face-swap)

---

## Option 3: LoRA Training (Most Reliable for Production)

### How It Works

1. Train a LoRA on reference face images (10-20 images)
2. Use trained LoRA during generation
3. Every generated image has the trained face

### Workflow

```
Training Images → LoRA Training → LoRA File
Text Prompt + LoRA → Qwen-Image-2512-LoRA → Image with Trained Face
```

### Advantages

- ✅ Most reliable face consistency
- ✅ Works with pure text-to-image (no reference needed at runtime)
- ✅ Already supported in Qwen-Image endpoints
- ✅ One-time training, unlimited generation

### Limitations

- ⚠️ Requires training time (30-60 min per character)
- ⚠️ Need 10-20 high quality reference images
- ⚠️ Training cost

### API Usage (Already Available)

```bash
POST /qwen-image-2512-lora
{
  "prompt": "A woman at a beach with sunset",
  "lora_id": "character-abc123",  # Pre-trained LoRA
  "lora_strength": 1.0,
  "trigger_word": "ohwx woman"
}
```

---

## Comparison Matrix

| Feature | IPAdapter (Experimental) | Qwen-Edit | ReActor | LoRA |
|---|---|---|---|---|
| **Face Match Accuracy** | ⚠️ Weak | ✅ High | ✅ High | ✅✅ Highest |
| **Pure T2I** | ✅ Yes | ❌ No (needs source) | ⚠️ Two-step | ✅ Yes |
| **Speed** | Fast | Medium | Fast | Fast (after training) |
| **Setup Complexity** | Low | Low | Medium | High |
| **Works with Qwen** | ⚠️ Partial | ✅ Native | ✅ Post-process | ✅ Native |
| **Multi-person** | ❌ No | ✅ Yes | ✅ Yes | ⚠️ One per LoRA |

---

## Recommended Implementation Path

### Phase 1: Quick Win (This Week)

**Add ReActor face swap endpoint:**

1. Install ReActor in Modal image
2. Create `/qwen-image-2512-faceswap` endpoint
3. Pipeline: Qwen T2I → ReActor swap

This gives immediate face consistency with Qwen's best quality model.

### Phase 2: Native Solution (Next Sprint)

**Implement Qwen-Edit multi-image workflow:**

1. Create `/qwen-character-scene` endpoint
2. Accept reference image + scene description
3. Uses Qwen-Edit's native character consistency

### Phase 3: Production (Ongoing)

**LoRA training pipeline:**

Already available via `/qwen-image-2512-lora`

---

## Technical Implementation Notes

### ReActor Installation

Add to Modal image:

```python
# Install ReActor custom node
.run_commands(
    "cd /root/comfy/ComfyUI/custom_nodes && "
    "git clone https://github.com/Gourieff/ComfyUI-ReActor.git"
)
.run_commands(
    "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-ReActor && "
    "pip install -r requirements.txt && "
    "pip install insightface onnxruntime-gpu"
)
```

Download required models:

```python
# inswapper_128.onnx - Face swap model
# GFPGANv1.4.pth - Face restoration
# retinaface_resnet50 - Face detection
```

### ReActor Workflow

```json
{
  "1": {
    "class_type": "LoadImage",
    "inputs": { "image": "generated_image.jpg" }
  },
  "2": {
    "class_type": "LoadImage", 
    "inputs": { "image": "face_reference.jpg" }
  },
  "3": {
    "class_type": "ReActorFaceSwap",
    "inputs": {
      "source_image": ["1", 0],
      "input_image": ["2", 0],
      "face_restore": "GFPGANv1.4.pth",
      "face_restore_visibility": 1.0,
      "swap_model": "inswapper_128.onnx"
    }
  }
}
```

---

## Implementation Status (Updated January 2026)

### ReActor Face Swap - IMPLEMENTED ✅

**Endpoints now available:**
- `/qwen-faceswap` - High quality (50 steps) + ReActor face swap
- `/qwen-faceswap-fast` - Fast mode (4 steps) + ReActor face swap

**Verified Results:**
- ✅ Face consistency confirmed across 3 different scenes (office, cafe, beach)
- ✅ Strong face matching between reference and generated images  
- ✅ Works with both standard and fast generation modes
- ✅ GFPGAN face restoration integrated

**Request Example:**
```json
POST /qwen-faceswap-fast
{
  "prompt": "A professional woman in a modern office",
  "reference_image": "data:image/jpeg;base64,...",
  "aspect_ratio": "9:16",
  "restore_face": true
}
```

### Qwen-Edit Character Scene - IMPLEMENTED ✅

**Endpoint:** `/qwen-character-scene` (on ryla-qwen-edit app)

Uses Qwen-Edit's native character consistency for scene changes. Preserves clothing and general appearance but with some face variation (editing, not face swap).

**Request Example:**
```json
POST /qwen-character-scene
{
  "character_image": "data:image/jpeg;base64,...",
  "scene": "Put this person at a tropical beach with sunset",
  "denoise": 0.7
}
```

**Best for:** Outfit/style consistency with natural scene edits

### LoRA Training Pipeline - IMPROVED ✅

**Improvements in v2:**
- Automatic face detection and cropping (MediaPipe)
- Better default hyperparameters (rank 32, cosine scheduler, 1024px)
- Progress webhook callbacks
- Higher resolution training
- Warmup steps for better convergence

**Usage:**
```python
from modal import Function
train_fn = Function.from_name("ryla-lora-training", "train_lora")
result = train_fn.remote(
    job_id="job-123",
    image_urls=["url1", "url2", ...],
    trigger_word="ohwx person",
    character_id="my-character",
    webhook_url="https://my-backend/webhook",
)
```

---

## Conclusion

**Don't use IPAdapter with Qwen-Image 2512** - it doesn't work well due to architecture differences.

Instead:

1. **For editing existing images**: Use Qwen-Edit 2511 (native support)
2. **For T2I with face swap**: Use `/qwen-faceswap` or `/qwen-faceswap-fast` ✅ IMPLEMENTED
3. **For production characters**: Train LoRAs

The ReActor face swap pipeline is now **live and working** with Qwen-Image 2512.

---

## Related Documentation

- [AI Generation Explainer](./AI-GENERATION-EXPLAINER.md)
- [ComfyUI Improvement Proposals](./COMFYUI-IMPROVEMENT-PROPOSALS.md)
- [IN-034: Infrastructure Maturity](../initiatives/IN-034-comfyui-infrastructure-maturity.md)

---

*Last updated: January 2026*
