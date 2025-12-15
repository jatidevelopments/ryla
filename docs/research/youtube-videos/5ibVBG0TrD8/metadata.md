# Create Lifelike AI Videos of Yourself - Consistent Characters

> **URL**: https://www.youtube.com/watch?v=5ibVBG0TrD8 > **Video ID**: 5ibVBG0TrD8
> **Date Added**: 2025-12-08
> **Duration**: 10:59
> **Channel**: Futurepedia
> **Published**: December 2, 2024

## Summary

Tutorial covering three methods for creating videos with consistent characters, comparing ease of use and results. Methods range from single-image approaches to full LoRA training, with practical examples and cost estimates.

### Three Methods Covered:

1. **Flux PuLID (Easiest)**: Single image → consistent character generation

   - Uses Replicate (flux-pulid)
   - Costs ~$0.02 per generation (45 generations per dollar)
   - Works from single image, no training needed
   - Best for quick character generation

2. **Flux LoRA Training (Most Consistent)**: Train custom LoRA from multiple images

   - Uses Replicate (osiris flux-dev-lora-trainer)
   - Training: $3-5, takes ~20 minutes
   - Generation: Very cheap after training
   - Requires 10+ photos, creates trigger word
   - Best face consistency, but can have "face bleed" with multiple people

3. **Kling AI Custom Model (Newest)**: Train from videos
   - Requires Pro Plan subscription
   - Needs 10-30 videos (5-15 seconds each)
   - Training takes ~2 hours, uses credits
   - Best for video-first workflows

## Key Points

- **Flux PuLID**: Best for single-image workflows, very cheap, fast results
- **LoRA Training**: Best consistency, requires training upfront, cost-effective long-term
- **Face Bleed Issue**: When prompting multiple people, LoRA characteristics can appear on other faces
- **Video Generation**: Use Kling, Runway, Luma, or Minimax for image-to-video
- **Character Sheets**: Useful for training - generate character from multiple angles
- **iPhone HDR**: Turn off HDR when recording training videos for Kling AI

## Relevance to RYLA

Critical for **EP-005 (Content Studio)** and character generation:

### Model Selection:

- **Flux PuLID**: Good for quick character tests, single image workflows
- **LoRA Training**: Best for production - consistent characters, cost-effective
- **Kling Custom Model**: If we add video generation features

### Implementation Insights:

- **Training Cost**: LoRA training is one-time cost ($3-5), then very cheap to generate
- **Training Data**: 10+ photos minimum, character sheets work well
- **Face Consistency**: LoRA provides best results but requires training
- **Workflow**: Generate images → train LoRA → generate consistent images → animate to video

### Technical Considerations:

- **Face Bleed**: Need to handle when generating scenes with multiple characters
- **Character Sheets**: Useful workflow for creating training data
- **Cost Structure**: One-time training vs per-generation costs

## Tags

#youtube #research #consistent-characters #flux #pulid #lora-training #kling-ai #text-to-image #content-studio #ep-005
