# LoRa Training For RETA*DS (Wan 2.2) | AI OFM Same Face

> **URL**: https://www.youtube.com/watch?v=WUWGZt2UwO0  
> **Video ID**: WUWGZt2UwO0  
> **Date Added**: 2025-12-17  
> **Duration**: 16:46  
> **Channel**: Filip | AI Influencer Expert  
> **Published**: 10/12/2025

## Summary

Simplified LoRA training tutorial using fal.ai image trainer (easier than DiffusionPipe). Covers complete workflow: base image creation, dataset generation with cDream edit model, training on fal.ai, and conversion for ComfyUI use.

Workflow:
1. Create base image (cDream v4, $0.03/image)
2. Generate dataset (30 images, 70% upper body, 20% portrait, 10% full body)
3. Choose keyword (unique, not in base model)
4. Train on fal.ai (1.2.2 image trainer, no captioning needed)
5. Convert diffusers format to ComfyUI safetensors
6. Test in ComfyUI workflow

## Key Points

- **Simplified Method**: fal.ai easier than DiffusionPipe (no command line)
- **Cost**: $0.03 per dataset image, training cost varies
- **Model Choice**: 1.2.2 most versatile (video + image)
- **Dataset Quality**: Better images = better trained model
- **Conversion Required**: fal.ai outputs diffusers, need ComfyUI format

## Relevance to RYLA

### EP-005 (Content Studio) - Alternative Training Method

This provides a simpler alternative to DiffusionPipe:

1. **User-Friendly**: fal.ai has GUI, no command line
2. **Faster Setup**: Less technical knowledge required
3. **Cost Effective**: $0.03/image for dataset creation
4. **Model Support**: 1.2.2 versatile for video + image
5. **Conversion Pipeline**: RYLA could automate this

### Implementation

- **Training Options**: Offer both DiffusionPipe (advanced) and fal.ai (simple)
- **Dataset Generation**: Integrate cDream edit model for dataset creation
- **Auto-Conversion**: Automate diffusers → ComfyUI conversion
- **Quality Guidance**: Help users select best dataset images

## Tags

#youtube #research #lora-training #fal-ai #simplified #ep-005 #training-pipeline
