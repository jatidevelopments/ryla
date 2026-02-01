# RunPod Serverless Handlers

Python handlers for RunPod serverless endpoints.

## Handlers

### `flux-dev-handler.py`
Main handler for Flux Dev model. Supports:
- Base image generation (3 variations)
- Face swap (IPAdapter FaceID)
- Final generation (with LoRA)
- Character sheet generation (PuLID + ControlNet)

### `z-image-turbo-handler.py`
Handler for Z-Image-Turbo model. Supports:
- Base image generation (fast, 8-9 steps)
- Final generation (with LoRA, if supported)
- NSFW testing (logs results)

## Usage

These handlers are packaged into Docker images and deployed as RunPod serverless endpoints.

See `docs/technical/infrastructure/runpod/RUNPOD-SERVERLESS-DEPLOYMENT.md` for deployment instructions.

## Dependencies

- `runpod` - RunPod Python SDK
- `diffusers` - HuggingFace Diffusers library
- `torch` - PyTorch
- `transformers` - HuggingFace Transformers
- `pillow` - Image processing

All dependencies are installed in the Docker images.

