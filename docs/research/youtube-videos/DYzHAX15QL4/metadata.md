# Z-Image Turbo Model Tutorial: LoRA Training & ControlNet

> **URL**: https://www.youtube.com/watch?v=DYzHAX15QL4
> **Video ID**: DYzHAX15QL4
> **Date Added**: 2025-12-10
> **Duration**: 21:31
> **Channel**: [To be identified]
> **Tags**: [z-image, lora-training, controlnet, comfyui, character-consistency, realistic-images]

## Summary

Comprehensive tutorial on using Z-Image-Turbo model in ComfyUI, including **successful LoRA training for character consistency**. The creator demonstrates that Z-Image-Turbo works well with LoRA training, ControlNet for pose control, and produces high-quality realistic images in 6-7 seconds.

## Key Points

### Model Specifications
- **6B parameter model** (Z-Image-Turbo)
- **BF16 version**: Recommended for quality (16GB+ VRAM)
- **FP8 version**: Smaller, works on 12GB VRAM, but can have lower quality
- **All-in-one model**: Includes CLIP and VAE in checkpoint (easier setup)
- **Split version**: Separate CLIP and VAE (more control, same results)

### Performance
- **Generation Speed**: 6-7 seconds per image
- **Steps**: 8-9 steps (no point going over 9, can make image worse)
- **CFG**: 1 (no negative prompt needed, faster)
- **Quality**: Very realistic, photorealistic results
- **Resolution**: Works well up to Full HD (1920x1080), larger sizes can get diffused/smooth

### LoRA Training (PROVEN WORKING ✅)
- **Platform**: Trained on Fowl website (cloud training)
- **Training Images**: 15 images of character (minimum 10 required)
- **Training Steps**: 1,000 steps (default, worked well)
- **Cost**: $2.26 for 1,000 steps with 15 images
- **Training Time**: 15-20 minutes
- **Result**: **Character consistency works well!**
  - Can change outfits ✅
  - Can change environments ✅
  - Can change hair color ✅
  - Can change poses ✅
  - Maintains character identity ✅

### ControlNet Support
- **Canny ControlNet**: Works for maintaining illustration consistency
- **Depth ControlNet**: Works for depth-based control
- **DW Preprocessor**: Works for pose skeleton control (OpenPose-like)
- **Strength**: 0.6-0.8 recommended (1.0 too strong)

### Character Consistency Results
- **First LoRA test**: Trained on 15 images of woman with white hair, green eyes
- **Trigger words**: Used unique name (replaced letters with numbers)
- **Consistency**: Very good - character maintained across different:
  - Outfits
  - Environments
  - Poses
  - Sizes (tested Full HD)
  - Art styles (pencil drawing worked, watercolor less so)
- **LoRA Strength**: Can adjust (0.8 worked better for style changes)

### Quality & Settings
- **Best Results**: 6-9 steps, CFG 1, specific samplers/schedulers
- **Size Impact**: Larger sizes (>Full HD) can get desaturated/diffused look
- **Prompt**: Can use long detailed prompts (like Flux)
- **Variation**: Seed variation doesn't do much, need to adjust prompt more
- **Tendency**: Generates Asian women more often (can add nationality to prompt)

## Relevance to RYLA

**CRITICAL FINDING**: Z-Image-Turbo **DOES work with LoRA training** for character consistency!

### EP-005 (Content Studio) - High Priority

**LoRA Training Proven**:
- ✅ LoRA training works on cloud (Fowl website, similar to RunPod)
- ✅ Character consistency achieved (tested with 15 images, 1000 steps)
- ✅ Cost: $2.26 per character (comparable to Flux LoRA)
- ✅ Training time: 15-20 minutes (faster than Flux ~45 min)
- ✅ Character maintains identity across outfits, poses, environments

**Speed Advantage**:
- 6-7 seconds per image (vs 10-15s for Flux)
- 8-9 steps (vs 20+ for Flux)
- Lower compute costs per generation

**ControlNet for Poses**:
- ✅ DW Preprocessor works for pose control
- ✅ Can maintain character consistency with different poses
- ✅ Natural pose variation possible

**Quality**:
- Very realistic, photorealistic results
- Works well for portraits
- Can handle Full HD resolution

### Comparison with Flux Dev

| Feature | Z-Image-Turbo | Flux Dev |
|---------|---------------|----------|
| **LoRA Training** | ✅ Works (proven) | ✅ Works (proven) |
| **Training Cost** | $2.26 (15 images, 1000 steps) | ~$3-5 (7 images, 700 steps) |
| **Training Time** | 15-20 min | ~45 min |
| **Generation Speed** | 6-7 seconds | 10-15 seconds |
| **Steps** | 8-9 | 20+ |
| **VRAM** | 16GB (BF16) / 12GB (FP8) | 24GB+ |
| **ControlNet** | ✅ Works | ✅ Works |
| **Character Consistency** | ✅ Good (proven) | ✅ Excellent |
| **NSFW Support** | ❓ Unknown | ✅ Uncensored available |
| **Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### Implementation Considerations

**Advantages of Z-Image-Turbo**:
1. **Faster generation** (6-7s vs 10-15s)
2. **Faster LoRA training** (15-20 min vs 45 min)
3. **Lower VRAM requirements** (16GB vs 24GB)
4. **Lower compute costs** (fewer steps)
5. **LoRA training proven** (this video)

**Unknown/Concerns**:
1. **NSFW support**: Not mentioned in video - need to verify
2. **Character consistency**: Good but may not be as strong as Flux LoRA
3. **Community support**: Less established than Flux
4. **Training platform**: Used Fowl website, need to verify RunPod compatibility

## Next Steps

1. **Test Z-Image-Turbo LoRA training** on RunPod (verify compatibility)
2. **Test NSFW generation** (verify uncensored support)
3. **Compare character consistency** vs Flux LoRA (side-by-side test)
4. **Benchmark generation speed** vs Flux in production environment
5. **Test ControlNet pose control** with Z-Image-Turbo + LoRA
6. **Cost analysis**: Compare total cost (training + generation) vs Flux

## Related Resources

### Z-Image Models

- **HuggingFace (Official)**: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- **HuggingFace (SeeSee21)**: https://huggingface.co/SeeSee21/Z-Image-Turbo
- **ModelScope**: https://www.modelscope.cn/models/Tongyi-MAI/Z-Image-Turbo/
- **GitHub**: https://github.com/Tongyi-MAI/Z-Image

### ControlNet

- **Z-Image ControlNet (Alibaba PAI)**: https://huggingface.co/alibaba-pai/Z-Image-ControlNet

### LoRA Training

- **Fal.ai Z-Image LoRA Trainer**: https://fal.ai/models/fal-ai/z-image-lora-trainer
- **Fowl Website**: Cloud LoRA training platform (mentioned in video)

## Tags

#youtube #research #z-image #lora-training #controlnet #comfyui #character-consistency #realistic-images #content-studio #ep-005

