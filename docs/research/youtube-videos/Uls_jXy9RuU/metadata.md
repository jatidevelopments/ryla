# Create CONSISTENT CHARACTERS from INPUT IMAGE with FLUX (ComfyUI Tutorial)

> **URL**: https://www.youtube.com/watch?v=Uls_jXy9RuU > **Video ID**: Uls_jXy9RuU
> **Date Added**: 2025-12-08
> **Duration**: 23:14
> **Channel**: Mickmumpitz
> **Published**: November 1, 2024

## Summary

Advanced ComfyUI workflow tutorial for creating consistent characters from a single input image. The workflow uses PuLID (extracts facial structure) and ControlNet (character sheet format) to generate characters from multiple angles, emotions, and lighting conditions automatically. Includes LoRA training setup using FluxGym.

### Workflow Features:

- **Input Image → Character Sheet**: Automatically generates character from multiple angles
- **PuLID Integration**: Extracts facial structure for consistency
- **ControlNet**: Uses character sheet format (OpenPose) for pose control
- **Automated Generation**: Emotions, lighting conditions, example images
- **LoRA Training**: Complete setup with FluxGym

### Three Versions:

1. **Flux Dev Version**: Full quality, resource-intensive
2. **Flux GGF Version**: Faster, quantized models (Q4, Q6)
3. **SDXL Version**: Older but still effective, faster generation

## Key Points

- **PuLID Strength**: 95% for realistic, 80% for stylized (Pixar characters)
- **Character Sheet Format**: Uses OpenPose format for pose control
- **Automated Workflow**: Generates emotions, lighting, poses automatically
- **Captioning**: Use Joy Caption Alpha for detailed character descriptions
- **LoRA Training**: FluxGym setup, 24GB VRAM minimum (12GB works but slower)
- **Trigger Words**: Important for LoRA activation in prompts
- **Style LoRAs**: Can load style LoRAs into workflow (Disney, Pixel, etc.)

## Relevance to RYLA

Highly relevant for **EP-005 (Content Studio)** character generation:

### Technical Implementation:

- **Character Sheet Workflow**: Automated generation from single image
- **PuLID Integration**: How to maintain face consistency
- **ControlNet Setup**: Pose and angle control
- **LoRA Training Pipeline**: Complete workflow from generation to training

### Workflow Insights:

- **Single Image Input**: Can generate full character sheet from one face image
- **Automated Variations**: Emotions, lighting, poses generated automatically
- **Training Data Quality**: Use best images (full body, emotions, lighting tests)
- **Captioning Strategy**: Add perspective, lighting, emotions to captions

### Advanced Features:

- **Style Transfer**: Can apply different styles (Disney, Pixel, etc.)
- **Upscaling**: Built-in upscaling for quality
- **Noise Injection**: Adds detail to cloth and hair
- **Multiple Versions**: Fast (GGF) vs Quality (Dev) options

## Tags

#youtube #research #comfyui #flux #pulid #controlnet #lora-training #character-sheet #consistent-characters #content-studio #ep-005
