# ComfyUI Workflows

This directory contains exported ComfyUI workflow JSON files for reference and conversion to Python code.

## Workflow Files

### Base Image Generation
- `flux-base-image.json` - Flux Dev base image generation (3 variations)
- `z-image-turbo-base-image.json` - Z-Image-Turbo base image generation

### Face Consistency
- `face-swap.json` - IPAdapter FaceID face swap workflow
- `character-sheet.json` - PuLID + ControlNet character sheet generation

### Final Generation
- `final-generation-lora.json` - Final generation with LoRA model

## Usage

1. **Import to ComfyUI**: Load these JSON files in ComfyUI to visualize workflows
2. **Reference for Code**: Use these as reference when implementing Python handlers
3. **Testing**: Use these workflows for testing in ComfyUI before serverless deployment

## Exporting Workflows

In ComfyUI:
1. Build workflow visually
2. Click "Save" (or Ctrl+S)
3. Save JSON file to this directory
4. Name descriptively (e.g., `flux-base-image.json`)

## Converting to Python

These workflows can be converted to Python code using:
- `libs/business/src/services/comfyui-workflow-builder.ts` - TypeScript workflow builder
- Or implement directly in Python handlers based on workflow structure

