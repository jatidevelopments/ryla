# Train Z-Image-Turbo LoRA with AI Toolkit

> **URL**: https://www.youtube.com/watch?v=Kmve1_jiDpQ
> **Video ID**: Kmve1_jiDpQ
> **Date Added**: 2025-12-10
> **Duration**: 27:22
> **Channel**: Ostris
> **Tags**: [z-image, lora-training, ai-toolkit, runpod, training-adapter, turbo-model]

## Summary

Comprehensive tutorial on training Z-Image-Turbo LoRAs using **AI Toolkit** (https://github.com/ostris/ai-toolkit). The video demonstrates how to train LoRAs on Z-Image-Turbo (a distilled model) using a special training adapter that prevents the distillation from breaking down during training. Shows training on RunPod with practical examples.

## Key Points

### AI Toolkit Overview

- **Repository**: https://github.com/ostris/ai-toolkit
- **Purpose**: Ultimate training toolkit for fine-tuning diffusion models
- **Supports**: Flux Dev, Flux Schnell, Z-Image-Turbo, SDXL, SD 1.5, and more
- **Features**: 
  - Built-in UI for training
  - RunPod integration
  - Modal integration
  - Training adapters for turbo/distilled models

### Z-Image-Turbo Training Challenge

**Problem**: Z-Image-Turbo is a **distilled model** (8-step, no CFG)
- If you train it directly, the distillation breaks down
- Model reverts to needing 20-50 steps + CFG (loses turbo speed)
- After 500 steps, artifacts appear, quality degrades

**Solution**: **Training Adapter** (built into AI Toolkit)
- Pre-trained LoRA that "breaks down" the distillation
- Apply adapter → train on top → remove adapter after training
- Result: LoRA trained on turbo model without breaking distillation
- Maintains 8-step, no-CFG generation speed

### Training Adapter Details

- **Location**: Built into AI Toolkit (auto-downloads)
- **Version**: Currently V1, V2 coming (longer training, better quality)
- **How it works**:
  1. Generate dataset with Z-Image-Turbo
  2. Train adapter LoRA on that dataset (breaks down distillation)
  3. Apply adapter to model
  4. Train your LoRA on top (learns your concept/character)
  5. Remove adapter when done
  6. Result: Your LoRA on turbo model (fast generation)

### Training Settings (Z-Image-Turbo)

- **Steps**: 3,000 (default, works well)
- **Learning Rate**: 1e-4 (max, don't go higher - 2e-4 explodes model)
- **Sample Steps**: 8 (turbo model default)
- **CFG**: 1 (no CFG needed for turbo)
- **VRAM**: 17GB (BF16, no quantization), can go lower with quantization
- **Iteration Speed**: ~1.3 seconds per iteration (very fast!)

### Advanced Features

**Differential Guidance** (Experimental):
- Amplifies difference between current and target
- Helps model learn faster, better generalization
- Guidance scale: 3 (recommended)
- Optional but recommended

**Time Step Bias**:
- **Balanced**: Default, good for most cases
- **High Noise**: For drastic style changes (e.g., realism → children's drawings)
- **Low Noise**: For fine details, textures

### Training Performance

- **Speed**: 1.27 seconds per iteration (with training adapter)
- **VRAM**: 17GB (BF16, no quantization)
- **Can run on**: 16GB VRAM cards (with quantization)
- **Training Time**: ~3,000 steps in reasonable time (very fast)

### Character vs Style Training

**Character Training**:
- Use **balanced** time step bias
- Trains faster than style
- Works great with Z-Image-Turbo

**Style Training**:
- Use **high noise** bias for drastic changes
- May need more steps
- Example: Realism → Children's drawings (shown in video)

### RunPod Integration

- **Template**: AI Toolkit has official RunPod pod template
- **GPU**: RTX 5090 used in video (for speed), RTX 3090 works fine
- **Setup**: Can do locally or on RunPod
- **Cost**: Pay-per-use on RunPod

### ComfyUI Support

- LoRAs trained with AI Toolkit work in ComfyUI
- Day-one support (some initial weight issues, quickly fixed)
- Load LoRA normally in ComfyUI workflows

## Relevance to RYLA

**CRITICAL FINDING**: AI Toolkit is the **recommended tool** for training Z-Image-Turbo LoRAs!

### EP-005 (Content Studio) - High Priority

**Why AI Toolkit**:
1. ✅ **Built-in Z-Image-Turbo support** (with training adapter)
2. ✅ **RunPod integration** (official template)
3. ✅ **UI available** (easier than command-line)
4. ✅ **Supports both Flux and Z-Image** (flexibility)
5. ✅ **Fast training** (1.3s per iteration)
6. ✅ **Low VRAM** (17GB, can go lower)

**Comparison with Current Plan**:
- **Current Plan**: Use `flux-dev-lora-trainer` template on RunPod
- **Better Option**: Use **AI Toolkit** (supports both Flux and Z-Image-Turbo)

### Implementation Recommendations

1. **Use AI Toolkit** for LoRA training (instead of flux-dev-lora-trainer)
   - Supports both Flux Dev and Z-Image-Turbo
   - Has training adapter for Z-Image-Turbo built-in
   - Works on RunPod (official template)
   - Has UI for easier training

2. **Training Workflow**:
   - Character sheets → Upload to AI Toolkit
   - Configure training (3,000 steps, 1e-4 LR)
   - Train on RunPod using AI Toolkit template
   - Download trained LoRA
   - Use in ComfyUI for generation

3. **Cost**: Similar to flux-dev-lora-trainer (~$2-3 per character)

### Advantages Over flux-dev-lora-trainer

| Feature | AI Toolkit | flux-dev-lora-trainer |
|---------|------------|----------------------|
| **Z-Image-Turbo Support** | ✅ Built-in | ❌ Flux only |
| **Training Adapter** | ✅ Auto-downloads | ❌ N/A |
| **UI** | ✅ Available | ❌ Command-line only |
| **Flux Support** | ✅ Yes | ✅ Yes |
| **RunPod Template** | ✅ Official | ✅ Available |
| **Flexibility** | ✅ Multiple models | ⚠️ Flux only |

## Next Steps

1. **Research AI Toolkit RunPod Template**: Check official template details
2. **Test AI Toolkit**: Set up on RunPod, test Z-Image-Turbo LoRA training
3. **Compare with flux-dev-lora-trainer**: Test both, choose best option
4. **Update Implementation Plan**: Consider AI Toolkit as primary training tool
5. **Document Integration**: How to integrate AI Toolkit with RYLA backend

## Related Resources

- **AI Toolkit GitHub**: https://github.com/ostris/ai-toolkit
- **RunPod Template**: Official AI Toolkit template (link in video description)
- **Training Adapter**: Built into AI Toolkit (auto-downloads)
- **Z-Image-Turbo Model**: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo

## Tags

#youtube #research #z-image #lora-training #ai-toolkit #runpod #training-adapter #turbo-model #content-studio #ep-005

