# RYLA ComfyUI Serverless Worker
# Based on RunPod's official worker-comfyui
# Supports: Z-Image-Turbo, FLUX, and any ComfyUI workflow

FROM runpod/worker-comfyui:5.6.0-base

# Install custom nodes required for Z-Image Danrisi workflow
# - res4lyf: ClownsharKSampler_Beta, Sigmas Rescale
# - controlaltai-nodes: FluxResolutionNode
RUN comfy-node-install res4lyf controlaltai-nodes

# Install workflow UI JSON -> API prompt JSON converter endpoint
# Provides: POST /workflow/convert on the ComfyUI server
# Repo: https://github.com/SethRobinson/comfyui-workflow-to-api-converter-endpoint
#
# Notes:
# - Location of ComfyUI in this image is typically /workspace/ComfyUI
# - We install via git clone into custom_nodes
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/* && \
    cd /workspace/ComfyUI/custom_nodes && \
    git clone https://github.com/SethRobinson/comfyui-workflow-to-api-converter-endpoint.git && \
    if [ -f comfyui-workflow-to-api-converter-endpoint/requirements.txt ]; then \
      pip install -r comfyui-workflow-to-api-converter-endpoint/requirements.txt ; \
    fi

# Models are loaded from network volume at /runpod-volume/models/
# No models baked into image - keeps image small and flexible

