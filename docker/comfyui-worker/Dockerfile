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

# Create startup script to link models from network volume to ComfyUI directories
# This handles both /runpod-volume and /workspace mount paths
RUN echo '#!/bin/bash\n\
# Create symlinks so ComfyUI custom loaders can find models\n\
COMFYUI_MODELS="/workspace/runpod-slim/ComfyUI/models"\n\
\n\
# Check both possible mount locations\n\
if [ -d "/runpod-volume/models" ]; then\n\
    SOURCE_BASE="/runpod-volume/models"\n\
elif [ -d "/workspace/models" ]; then\n\
    SOURCE_BASE="/workspace/models"\n\
else\n\
    echo "Warning: Network volume models not found at /runpod-volume/models or /workspace/models"\n\
    exit 0\n\
fi\n\
\n\
# Create symlinks for Z-Image model directories\n\
for dir in diffusion_models text_encoders vae; do\n\
    SOURCE="$SOURCE_BASE/$dir"\n\
    TARGET="$COMFYUI_MODELS/$dir"\n\
    \n\
    if [ -d "$SOURCE" ] && [ ! -e "$TARGET" ]; then\n\
        echo "Creating symlink: $TARGET -> $SOURCE"\n\
        ln -s "$SOURCE" "$TARGET"\n\
    fi\n\
done\n\
' > /startup-link-models.sh && chmod +x /startup-link-models.sh

# Models are loaded from network volume (either /runpod-volume/models/ or /workspace/models/)
# Symlinks created at startup so ComfyUI custom loaders can find them
# No models baked into image - keeps image small and flexible

