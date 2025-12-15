# Qwen Image LoRA Workflow with ControlNet & Face Detailer

> **URL**: https://www.youtube.com/watch?v=s1HBkfBMcho
> **Video ID**: s1HBkfBMcho
> **Date Added**: 2025-12-10
> **Duration**: 9:11
> **Tags**: [qwen-image, lora-training, controlnet, face-detailer, depth-map, character-consistency]

## Summary

Advanced Qwen Image workflow tutorial showing how to use trained Qwen LoRAs with ControlNet for pose control, depth maps for realism, and face detailer for quality. Demonstrates improved workflow that uses reference images with depth and face detailing for higher realism and precision.

## Key Points

### Qwen Image Model
- **Base Model**: Qwen Image Q8 GUV (quantized, optimized for performance)
- **LoRA Support**: ✅ Can train and use LoRAs
- **Quality**: Extremely good skin quality, excellent facial consistency
- **Workflow**: Simple - upload LoRA, attach to LoRA loader stack node

### Improved Workflow Features

**ControlNet Integration**:
- **Instant X Qwen Image ControlNet**: Follows pose of reference image
- **Depth Model**: Increases accuracy with reference image
- **Result**: Better pose following than previous workflows

**Depth and Face Detailer Chain**:
- **Depth Map**: Grayscale representation of distance
- **Purpose**: Understand and refine 3D structure, lighting, depth perception
- **Face Detailer**: Final step that fixes face errors
- **Model**: Uses character LoRA for face detailer (maintains consistency)

**Two-Pass Sampling**:
- **First Pass**: Base render from prompts
- **Second Pass**: Cleanup and detail addition
- **Result**: Higher quality, more detailed images

### Workflow Components

1. **Base Model**: Qwen Image Q8 GUV
2. **LoRA Stack**: One Girl Qwen v3, Nice Girls LoRA, Samsung Chem LoRA
3. **ControlNet**: Instant X Qwen Image ControlNet (pose control)
4. **Depth Model**: For 3D structure understanding
5. **Face Detailer**: Final face refinement
6. **Text Encoder**: For prompt understanding

### Quality Results

- **Skin Quality**: Extremely good
- **Facial Consistency**: Excellent
- **Realism**: Hyperrealistic images
- **Text on Clothes**: Really good at putting text on clothes
- **Flexibility**: Can change hairstyle, body type, add tattoos even if not in training

### Use Cases

- **Base Portrait Generation**: Can create base portrait for AI influencer
- **Character Consistency**: Excellent facial consistency throughout images
- **Instagram Content**: High quality images suitable for Instagram
- **Pose Control**: Can follow reference image poses accurately

## Relevance to RYLA

### EP-001 (Influencer Wizard) - High Priority

**Base Image Generation**:
- ✅ Qwen Image can generate hyperrealistic base images
- ✅ Quality is excellent for foundation images
- ✅ Can use Qwen Image Q8 GUV (quantized, faster)

### EP-005 (Content Studio) - High Priority

**Character Consistency**:
- ✅ Qwen Image LoRA training works
- ✅ Excellent facial consistency (shown in video)
- ✅ Can use ControlNet for pose control
- ✅ Face detailer maintains consistency

**Workflow Improvements**:
- ✅ Depth maps for better 3D structure
- ✅ Two-pass sampling for higher quality
- ✅ Face detailer for final refinement

### LoRA Training

- ✅ Qwen Image supports LoRA training
- ✅ Can train on character images
- ✅ Results show excellent consistency
- ⚠️ Need to verify NSFW support

## Technical Details

### Workflow Structure

```
Base Model (Qwen Image Q8 GUV)
  ↓
LoRA Stack (One Girl Qwen v3, Nice Girls, Samsung Chem)
  ↓
Text Encoder
  ↓
ControlNet (Instant X Qwen Image) - Pose Control
  ↓
Depth Model - 3D Structure
  ↓
First Sampler (Base Render)
  ↓
Second Sampler (Cleanup & Detail)
  ↓
Face Detailer (with Character LoRA)
  ↓
Final Image
```

### Settings

- **Steps**: 50 steps (full quality, takes longer)
- **Model**: Qwen Image Q8 GUV (quantized)
- **LoRA Stack**: Multiple LoRAs can be combined
- **ControlNet**: Instant X Qwen Image (for pose)
- **Depth**: For 3D structure understanding

## Comparison with Other Models

| Feature | Qwen Image | Flux Dev | Z-Image-Turbo |
|---------|------------|----------|---------------|
| **LoRA Training** | ✅ Works | ✅ Works | ✅ Works |
| **Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Skin Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Facial Consistency** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **ControlNet** | ✅ Works | ✅ Works | ✅ Works |
| **NSFW Support** | ❓ Unknown | ✅ Yes | ❓ Unknown |
| **Speed** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cost** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Next Steps

1. **Test Qwen Image** for base image generation
2. **Verify NSFW support** for Qwen Image
3. **Test Qwen Image LoRA training** on RunPod
4. **Compare quality** vs Flux Dev for base images
5. **Test ControlNet integration** with Qwen Image

## Related Resources

- **Qwen Image**: https://qwenimages.com/
- **CivitAI LoRAs**: One Girl Qwen v3, Nice Girls LoRA, Samsung Chem LoRA
- **RunPod Template**: Available for members (mentioned in video)

## Tags

#youtube #research #qwen-image #lora-training #controlnet #face-detailer #character-consistency #content-studio #ep-001 #ep-005

