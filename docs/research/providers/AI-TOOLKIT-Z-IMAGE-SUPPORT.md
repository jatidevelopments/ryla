# AI Toolkit - Z-Image Turbo LoRA Training Support

> **Date**: 2025-01-27  
> **Status**: ✅ Confirmed Support

## Overview

**AI Toolkit supports Z-Image Turbo LoRA training** ✅

This is excellent news for RYLA since we're already using Z-Image-Turbo for image generation. We can train character-specific LoRAs for Z-Image using the same tool.

## Training Details

### Hardware Requirements

- **RTX 5090**: ~1 hour for 3,000 steps
- **RTX 4090**: ~90 minutes for 3,000 steps
- **Consumer-grade GPUs**: Feasible (not requiring enterprise hardware)

### Dataset Requirements

- **Optimal**: 5-15 carefully curated images
- **Resolution**: 1024×1024 recommended
- **Quality**: High-quality, diverse images (different angles, lighting, backgrounds)
- **Format**: Images + caption text files (same as other models)

### Training Parameters

Based on research:
- **Steps**: 2,000-3,000 steps
- **Learning Rate**: ~0.0001
- **Batch Size**: Typically 1
- **Training Adapter**: Z-Image Turbo specific adapter required

## Tutorial Resources

### Video Tutorial

**Title**: "How to Train a Z-Image-Turbo LoRA with AI Toolkit"  
**Creator**: Ostris AI  
**URL**: https://www.youtube.com/watch?v=Kmve1_jiDpQ

### Written Guide

**Source**: Prompting Pixels  
**URL**: https://www.promptingpixels.com/tutorial/z-image-turbo-lora-training

## Integration with RYLA

### Current Z-Image Usage

We're already using Z-Image-Turbo for:
- Base image generation
- Fast image generation (6-7s per image)
- Serverless endpoint deployment

### Benefits of Z-Image LoRA Training

1. **Character Consistency**: Train LoRAs for consistent character generation
2. **Speed**: Z-Image is faster than Flux (6-7s vs 10-15s)
3. **Cost**: Lower generation costs
4. **Unified Model**: Use same model for both base generation and LoRA-enhanced generation

### Training Workflow

1. **Character Sheet Generation**: Generate 7-10 character images (already in our flow)
2. **Dataset Preparation**: Curate best images, add captions
3. **LoRA Training**: Use AI Toolkit to train Z-Image LoRA
4. **Integration**: Use trained LoRA in Z-Image generation workflow

## Configuration Example

Based on AI Toolkit structure, Z-Image training config would look like:

```yaml
model:
  name: "z-image-turbo"  # or specific model path
  training_adapter: "z-image-turbo-adapter"  # Required adapter

dataset:
  path: "/path/to/character/dataset"
  trigger_word: "character_name"

network:
  type: "lora"
  linear: 128
  linear_alpha: 128

training:
  steps: 2000-3000
  batch_size: 1
  learning_rate: 0.0001
  resolution: 1024  # Z-Image works well at 1024x1024
```

## Comparison: Z-Image vs Flux LoRA Training

| Aspect | Z-Image Turbo | Flux Dev |
|--------|---------------|----------|
| **Training Time** | ~1 hour (RTX 5090) | ~1.5 hours |
| **Dataset Size** | 5-15 images | 7-10 images |
| **Generation Speed** | 6-7s per image | 10-15s per image |
| **Cost** | Lower | Higher |
| **Quality** | High | Very High |
| **NSFW Support** | ⚠️ Needs verification | ✅ Confirmed |

## Action Items for RYLA

### High Priority

- [ ] **Verify Z-Image LoRA Training**: Test training a Z-Image LoRA with AI Toolkit
- [ ] **Check NSFW Support**: Verify if Z-Image LoRAs support NSFW content
- [ ] **Compare Quality**: Test Z-Image LoRA vs Flux LoRA quality
- [ ] **Update Training Service**: Add Z-Image as base model option

### Medium Priority

- [ ] **Optimize Dataset Size**: Test with 5-15 images (vs 7-10 for Flux)
- [ ] **Speed Comparison**: Measure actual training times
- [ ] **Cost Analysis**: Compare Z-Image vs Flux training costs

## References

- **AI Toolkit GitHub**: https://github.com/ostris/ai-toolkit
- **Video Tutorial**: https://www.youtube.com/watch?v=Kmve1_jiDpQ
- **Written Guide**: https://www.promptingpixels.com/tutorial/z-image-turbo-lora-training
- **Our Z-Image Research**: [Z-Image Turbo Model Research](../models/z-image-turbo-model.md)

## Notes

- Z-Image Turbo training requires a specific training adapter (mentioned in tutorials)
- Training is efficient - can achieve good results with smaller datasets
- Faster training time makes it cost-effective for experimentation
- May be a good alternative to Flux for faster iteration cycles

