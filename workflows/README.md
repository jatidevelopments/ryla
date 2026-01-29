# ComfyUI Workflows

This directory contains exported ComfyUI workflow JSON files for reference and conversion to Python code.

## Workflow Files

### Base Image Generation

- `flux-base-image.json` - Flux Dev base image generation (3 variations)
- `z-image-turbo-base-image.json` - Z-Image-Turbo base image generation

### Face Consistency

- `flux-ipadapter-faceid.json` - ⭐ **Flux Dev + IP-Adapter FaceID** (Recommended for Flux Dev)
  - Uses XLabs-AI Flux IP-Adapter v2, specifically designed for FLUX.1-dev
  - Fully compatible with Flux Dev's dual CLIP architecture
  - No ControlNet shape mismatch issues
  - Endpoint: `/flux-ipadapter-faceid`
- `face-swap.json` - IPAdapter FaceID face swap workflow (Flux Schnell, legacy)
- `character-sheet.json` - PuLID + ControlNet character sheet generation

### Final Generation

- `final-generation-lora.json` - Final generation with LoRA model

### Image Upscaling

- `seedvr2.json` - SeedVR2 realistic upscaling workflow for images and videos
  - Supports single image or batch processing from directory
  - Uses SeedVR2 DiT model (`seedvr2_ema_7b_fp16.safetensors`) and VAE (`ema_vae_fp16.safetensors`)
  - Includes before/after comparison view
  - Optimized for RTX 5090 (38 seconds per image)
  - Includes GPU memory cleanup nodes for batch processing

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
- `flux-ipadapter-faceid.json` - ⭐ Flux Dev + IP-Adapter FaceID (endpoint: `/flux-ipadapter-faceid`)
- `z-image-turbo-base-image.json`
- `qwen-image-2512-base.json` - ⭐ Qwen Image 2512 (needs conversion to API format)
- `character-sheet.json`
- `face-swap.json`
- `final-generation-lora.json`

**UI Format** (ComfyUI visual editor format):

- All `MICKMUMPITZ_*` workflows
- `seedvr2.json` - SeedVR2 upscaling workflow
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

## Workflow Development Tools

### ComfyUI-Copilot 🤖

**ComfyUI-Copilot** is an AI-powered assistant that can help with workflow development:

- **Generate Workflows**: Create workflows from natural language descriptions
- **Debug Workflows**: Automatically detect and fix errors in workflows
- **Optimize Workflows**: Rewrite and optimize existing workflows
- **Parameter Tuning**: Batch test parameter combinations with visual comparison
- **Node Discovery**: Find the right nodes and models for your needs

**See**: `docs/technical/infrastructure/comfyui/COMFYUI-COPILOT.md` for full documentation

**Usage**:
1. Install ComfyUI-Copilot in your ComfyUI `custom_nodes/` directory
2. Generate or import workflows using natural language
3. Debug and optimize workflows before converting to TypeScript
4. Export optimized workflows to this directory for reference
