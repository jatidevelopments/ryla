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

### WAN 2.2 Workflows

- `251007_MICKMUMPITZ_WAN-2-2-IMG_SMPL.json` - WAN 2.2 text-to-image generation workflow (sample)
- `251007_MICKMUMPITZ_WAN-2-2-VID_SMPL.json` - WAN 2.2 text-to-video generation workflow (sample)

### CCC Workflows

- `251007_MICKMUMPITZ_CCC_3-6.json` - CCC workflow version 3.6
- `251119_MICKMUMPITZ_CCC_3-7.json` - CCC workflow version 3.7
- `260106_MICKMUMPITZ_CCC_3-8_SMPL.json` - CCC workflow version 3.8 (sample)

## Workflow Formats

**API Format** (ready for `/prompt` endpoint):

- `flux-base-image.json`
- `z-image-turbo-base-image.json`
- `character-sheet.json`
- `face-swap.json`
- `final-generation-lora.json`

**UI Format** (ComfyUI visual editor format):

- All `MICKMUMPITZ_*` workflows
- These can be loaded directly in ComfyUI for visualization
- May need conversion to API format for programmatic use

## Usage

1. **Import to ComfyUI**: Load these JSON files in ComfyUI to visualize workflows
2. **Reference for Code**: Use these as reference when implementing Python handlers
3. **Testing**: Use these workflows for testing in ComfyUI before serverless deployment
4. **Format Conversion**: UI format workflows can be converted to API format using the converter (see `docs/ops/COMFYUI-WORKFLOW-CONVERSION.md`)

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
