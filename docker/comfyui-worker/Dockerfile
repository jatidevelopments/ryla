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
# Check multiple ComfyUI locations\n\
for COMFYUI_BASE in "/workspace/runpod-slim/ComfyUI" "/comfyui" "/workspace/ComfyUI"; do\n\
    if [ -d "$COMFYUI_BASE" ]; then\n\
        COMFYUI_MODELS="$COMFYUI_BASE/models"\n\
        echo "Found ComfyUI at: $COMFYUI_BASE"\n\
        \n\
        # Check both possible mount locations\n\
        if [ -d "/runpod-volume/models" ]; then\n\
            SOURCE_BASE="/runpod-volume/models"\n\
        elif [ -d "/workspace/models" ]; then\n\
            SOURCE_BASE="/workspace/models"\n\
        else\n\
            echo "Warning: Network volume models not found at /runpod-volume/models or /workspace/models"\n\
            continue\n\
        fi\n\
        \n\
        echo "Source models directory: $SOURCE_BASE"\n\
        \n\
        # Create symlinks for common model directories\n\
        # diffusion_models, text_encoders, vae: for Z-Image loaders\n\
        # checkpoints, loras, controlnet: for general workflows\n\
        for dir in checkpoints diffusion_models text_encoders vae loras controlnet unet clip; do\n\
            SOURCE="$SOURCE_BASE/$dir"\n\
            TARGET="$COMFYUI_MODELS/$dir"\n\
            \n\
            if [ -d "$SOURCE" ]; then\n\
                # If target is already a symlink, remove it to be sure\n\
                if [ -L "$TARGET" ]; then\n\
                    rm "$TARGET"\n\
                # If target is a directory, move it to a backup if not empty, otherwise remove\n\
                elif [ -d "$TARGET" ]; then\n\
                    if [ -z "$(ls -A "$TARGET")" ]; then\n\
                        rmdir "$TARGET"\n\
                    else\n\
                        echo "Warning: $TARGET is a non-empty directory. Renaming to ${TARGET}.bak"\n\
                        mv "$TARGET" "${TARGET}.bak"\n\
                    fi\n\
                fi\n\
                \n\
                echo "Linking: $TARGET -> $SOURCE"\n\
                ln -sf "$SOURCE" "$TARGET"\n\
            else\n\
                echo "Source $SOURCE not found on volume (skipping)"\n\
            fi\n\
        done\n\
        \n\
        echo "Final model directory structure in ComfyUI:"\n\
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
