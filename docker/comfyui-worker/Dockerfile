# RYLA ComfyUI Serverless Worker
# Based on RunPod's official worker-comfyui
# Supports: Z-Image-Turbo, FLUX, and any ComfyUI workflow

FROM runpod/worker-comfyui:5.6.0-base

# Install custom nodes required for Z-Image Danrisi workflow
# - res4lyf: ClownsharKSampler_Beta, Sigmas Rescale
# - controlaltai-nodes: FluxResolutionNode
RUN comfy-node-install res4lyf controlaltai-nodes

# Models are loaded from network volume at /runpod-volume/models/
# No models baked into image - keeps image small and flexible

