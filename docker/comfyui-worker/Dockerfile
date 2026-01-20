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
# 0. Diagnostics: Check mounts and volume visibility\n\
echo "[DIAG] Checking system mounts:"\n\
mount | grep -E "runpod|workspace" || echo "No runpod/workspace mounts found in mount output"\n\
echo "[DIAG] Disk usage:"\n\
df -h\n\
\n\
# Check multiple ComfyUI locations\n\
for COMFYUI_BASE in "/workspace/runpod-slim/ComfyUI" "/comfyui" "/workspace/ComfyUI"; do\n\
    if [ -d "$COMFYUI_BASE" ]; then\n\
        COMFYUI_MODELS="$COMFYUI_BASE/models"\n\
        echo "[INFO] Found ComfyUI models dir at: $COMFYUI_MODELS"\n\
        \n\
        # Check all possible model source locations\n\
        # Priority: /runpod-volume/models > /workspace/models > /runpod-volume (root)\n\
        SOURCE_BASE=""\n\
        if [ -d "/runpod-volume/models" ]; then\n\
            SOURCE_BASE="/runpod-volume/models"\n\
        elif [ -d "/workspace/models" ]; then\n\
            SOURCE_BASE="/workspace/models"\n\
        elif [ -d "/runpod-volume" ] && [ "$(ls -A /runpod-volume)" ]; then\n\
            SOURCE_BASE="/runpod-volume"\n\
        fi\n\
        \n\
        if [ -z "$SOURCE_BASE" ]; then\n\
            echo "[WARN] No model source found at /runpod-volume or /workspace/models"\n\
            echo "Listing root directories for context:"\n\
            ls -F /\n\
            continue\n\
        fi\n\
        \n\
        echo "[INFO] Using source models directory: $SOURCE_BASE"\n\
        echo "[DIAG] Source directory content (brief):"\n\
        ls -F "$SOURCE_BASE"\n\
        \n\
        # 1. Link standard subdirectories\n\
        # Include all common ComfyUI model types\n\
        for dir in checkpoints diffusion_models text_encoders vae loras controlnet unet clip embeddings upscale_models style_models clip_vision configs diffusers; do\n\
            SOURCE="$SOURCE_BASE/$dir"\n\
            TARGET="$COMFYUI_MODELS/$dir"\n\
            \n\
            if [ -d "$SOURCE" ]; then\n\
                echo "[LINK] Processing $dir..."\n\
                # If target exists and is not a symlink, handle it\n\
                if [ -d "$TARGET" ] && [ ! -L "$TARGET" ]; then\n\
                    if [ -z "$(ls -A "$TARGET")" ]; then\n\
                        echo "  Target $dir is empty directory, removing to link."\n\
                        rmdir "$TARGET"\n\
                    else\n\
                        echo "  [WARN] Target $dir is NOT empty. Renaming existing to ${dir}.bak"\n\
                        mv "$TARGET" "${TARGET}.bak"\n\
                    fi\n\
                fi\n\
                \n\
                if [ ! -e "$TARGET" ]; then\n\
                    echo "  Linking: $TARGET -> $SOURCE"\n\
                    ln -sf "$SOURCE" "$TARGET"\n\
                else\n\
                    echo "  [INFO] Target $TARGET already exists, skipping."\n\
                fi\n\
            fi\n\
        done\n\
        \n\
        # 2. Check for flat structure (models in root) and link to checkpoints/\n\
        # This is a fallback for volumes that just have files in the root\n\
        mkdir -p "$COMFYUI_MODELS/checkpoints"\n\
        echo "[INFO] Checking for models in source root for flat structure fallback..."\n\
        find "$SOURCE_BASE" -maxdepth 1 -type f \( -name "*.safetensors" -o -name "*.ckpt" -o -name "*.bin" -o -name "*.pth" \) | while read model; do\n\
            filename=$(basename "$model")\n\
            # Logic: If it looks like a checkpoint but isnit in a linked folder, put it in standard checkpoints/\n\
            if [ ! -e "$COMFYUI_MODELS/checkpoints/$filename" ]; then\n\
                echo "  Linking flat model: $filename -> $COMFYUI_MODELS/checkpoints/"\n\
                ln -sf "$model" "$COMFYUI_MODELS/checkpoints/$filename"\n\
            fi\n\
        done\n\
        \n\
        # 3. Recursive discovery for critical models if standard links missed them\n\
        # This handles volumes where models are buried deep or in non-standard folders\n\
        echo "[INFO] --- Critical Model Discovery (Deep Search) ---"\n\
        CRITICAL_CHECKPOINTS=("z_image_turbo_bf16.safetensors" "flux1-dev.safetensors")\n\
        CRITICAL_TEXT_ENCODERS=("qwen_3_4b.safetensors")\n\
        \n\
        # Link missing checkpoints\n\
        for model in "${CRITICAL_CHECKPOINTS[@]}"; do\n\
            if [ ! -e "$COMFYUI_MODELS/checkpoints/$model" ]; then\n\
                echo "  Searching for $model..."\n\
                MATCH=$(find "$SOURCE_BASE" -name "$model" -print -quit)\n\
                if [ -n "$MATCH" ]; then\n\
                    echo "  [FOUND] $model at $MATCH. Linking to checkpoints/"\n\
                    ln -sf "$MATCH" "$COMFYUI_MODELS/checkpoints/$model"\n\
                fi\n\
            fi\n\
        done\n\
        \n\
        # Link missing text encoders\n\
        mkdir -p "$COMFYUI_MODELS/clip"\n\
        for model in "${CRITICAL_TEXT_ENCODERS[@]}"; do\n\
            if [ ! -e "$COMFYUI_MODELS/clip/$model" ] && [ ! -e "$COMFYUI_MODELS/text_encoders/$model" ]; then\n\
                echo "  Searching for $model..."\n\
                MATCH=$(find "$SOURCE_BASE" -name "$model" -print -quit)\n\
                if [ -n "$MATCH" ]; then\n\
                    echo "  [FOUND] $model at $MATCH. Linking to clip/"\n\
                    ln -sf "$MATCH" "$COMFYUI_MODELS/clip/$model"\n\
                fi\n\
            fi\n\
        done\n\
        \n\
        echo "[SUCCESS] Model symlinking complete for $COMFYUI_BASE"\n\
        echo "Final model listing (ComfyUI view):"\n\
        ls -l "$COMFYUI_MODELS"/\n\
    fi\n\
done\n\
' > /startup-link-models.sh && chmod +x /startup-link-models.sh

# Create wrapper entrypoint that runs our startup script before the base image entrypoint
RUN echo '#!/bin/bash\n\
echo "=== RYLA ComfyUI Worker Startup ==="\n\
echo "Running model symlink script..."\n\
/startup-link-models.sh || echo "Warning: Symlink script exited with error"\n\
\n\
echo "Starting ComfyUI handler..."\n\
if [ $# -gt 0 ]; then\n\
    echo "Executing provided command: $@"\n\
    exec "$@"\n\
elif [ -f "/start.sh" ]; then\n\
    echo "Executing /start.sh"\n\
    exec /start.sh\n\
elif [ -f "/handler.py" ]; then\n\
    echo "Executing python3 -u /handler.py"\n\
    exec python3 -u /handler.py\n\
else\n\
    echo "Error: No entrypoint found!"\n\
    ls -la /\n\
    exit 1\n\
fi\n\
' > /entrypoint-wrapper.sh && chmod +x /entrypoint-wrapper.sh

# Override entrypoint to use our wrapper
# The base image CMD will be passed as arguments to our wrapper
ENTRYPOINT ["/entrypoint-wrapper.sh"]

# Models are loaded from network volume (either /runpod-volume/models/ or /workspace/models/)
# Symlinks created at startup so ComfyUI custom loaders can find them
# No models baked into image - keeps image small and flexible
