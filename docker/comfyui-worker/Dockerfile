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
# - Base image has ComfyUI at /comfyui (based on comfy-node-install output)
# - We check multiple possible locations to be safe
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/* && \
    for COMFYUI_DIR in /comfyui /workspace/ComfyUI /workspace/runpod-slim/ComfyUI; do \
        if [ -d "$COMFYUI_DIR" ]; then \
            echo "Found ComfyUI at: $COMFYUI_DIR"; \
            cd "$COMFYUI_DIR/custom_nodes" && \
            git clone https://github.com/SethRobinson/comfyui-workflow-to-api-converter-endpoint.git && \
            if [ -f comfyui-workflow-to-api-converter-endpoint/requirements.txt ]; then \
                pip install -r comfyui-workflow-to-api-converter-endpoint/requirements.txt; \
            fi && \
            break; \
        fi; \
    done

# Create startup script to link models from network volume to ComfyUI directories
# This handles both /runpod-volume and /workspace mount paths
RUN echo '#!/bin/bash\n\
# Create symlinks so ComfyUI custom loaders can find models\n\
echo "=== RYLA ComfyUI Model Symlink Script ==="\n\
\n\
# Check multiple ComfyUI locations\n\
for COMFYUI_BASE in "/workspace/runpod-slim/ComfyUI" "/comfyui" "/workspace/ComfyUI"; do\n\
    if [ -d "$COMFYUI_BASE" ]; then\n\
        COMFYUI_MODELS="$COMFYUI_BASE/models"\n\
        echo "Found ComfyUI models dir at: $COMFYUI_MODELS"\n\
        \n\
        # Check both possible mount locations\n\
        if [ -d "/runpod-volume/models" ]; then\n\
            SOURCE_BASE="/runpod-volume/models"\n\
        elif [ -d "/workspace/models" ]; then\n\
            SOURCE_BASE="/workspace/models"\n\
        elif [ -d "/runpod-volume" ]; then\n\
            SOURCE_BASE="/runpod-volume"\n\
        else\n\
            echo "Warning: Network volume not found at /runpod-volume/models, /workspace/models, or /runpod-volume"\n\
            ls -la / 2>/dev/null\n\
            continue\n\
        fi\n\
        \n\
        echo "Source models directory: $SOURCE_BASE"\n\
        ls -la "$SOURCE_BASE"\n\
        \n\
        # 1. Link subdirectories if they exist\n\
        for dir in checkpoints diffusion_models text_encoders vae loras controlnet unet clip; do\n\
            SOURCE="$SOURCE_BASE/$dir"\n\
            TARGET="$COMFYUI_MODELS/$dir"\n\
            \n\
            if [ -d "$SOURCE" ]; then\n\
                if [ -L "$TARGET" ]; then rm "$TARGET"; fi\n\
                if [ -d "$TARGET" ] && [ -z "$(ls -A "$TARGET")" ]; then rmdir "$TARGET"; fi\n\
                if [ ! -e "$TARGET" ]; then\n\
                    echo "Linking: $TARGET -> $SOURCE"\n\
                    ln -sf "$SOURCE" "$TARGET"\n\
                fi\n\
            fi\n\
        done\n\
        \n\
        # 2. Check for flat structure (models in root) and link to checkpoints/\n\
        if [ -d "$SOURCE_BASE" ]; then\n\
            # Create checkpoints dir if missing\n\
            mkdir -p "$COMFYUI_MODELS/checkpoints"\n\
            \n\
            # Link all .safetensors and .ckpt from root to checkpoints/\n\
            # Only if they donit already exist in any linked subdir\n\
            find "$SOURCE_BASE" -maxdepth 1 -type f \( -name "*.safetensors" -o -name "*.ckpt" \) | while read model; do\n\
                filename=$(basename "$model")\n\
                if [ ! -e "$COMFYUI_MODELS/checkpoints/$filename" ]; then\n\
                    echo "Linking root model $filename to checkpoints/"\n\
                    ln -sf "$model" "$COMFYUI_MODELS/checkpoints/$filename"\n\
                fi\n\
            done\n\
        fi\n\
        \n\
        echo "Final model listing (ComfyUI view):"\n\
        ls -lR "$COMFYUI_MODELS"\n\
    fi\n\
done\n\
' > /startup-link-models.sh && chmod +x /startup-link-models.sh

# Create wrapper entrypoint that runs our startup script before the base image entrypoint
# The base image entrypoint is typically /start.sh or similar
RUN echo '#!/bin/bash\n\
set -e\n\
echo "=== RYLA ComfyUI Worker Startup ==="\n\
echo "Running model symlink script..."\n\
/startup-link-models.sh\n\
echo "Starting ComfyUI worker..."\n\
exec "$@"\n\
' > /entrypoint-wrapper.sh && chmod +x /entrypoint-wrapper.sh

# Override entrypoint to use our wrapper
# The base image CMD will be passed as arguments to our wrapper
ENTRYPOINT ["/entrypoint-wrapper.sh"]

# Models are loaded from network volume (either /runpod-volume/models/ or /workspace/models/)
# Symlinks created at startup so ComfyUI custom loaders can find them
# No models baked into image - keeps image small and flexible
