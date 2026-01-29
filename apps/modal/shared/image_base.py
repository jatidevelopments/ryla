"""
Base Modal image build configuration.

Contains shared ComfyUI setup and base image that all apps extend.
Workflow-specific model downloads are in individual app image.py files.
"""

import modal
from pathlib import Path

# Constants
PYTHON_VERSION = "3.11"
COMFYUI_VERSION = "0.3.71"  # Stable version
FASTAPI_VERSION = "0.115.4"
COMFY_CLI_VERSION = "1.5.3"
# Cache buster: lldacing PuLID Flux (attn_mask fixed) - v3

# Base image with ComfyUI and shared utilities
base_image = (
    modal.Image.debian_slim(python_version=PYTHON_VERSION)
    .apt_install(["git", "wget", "curl", "libgl1", "libglib2.0-0"])  # libGL for OpenCV/cv2
    .uv_pip_install(f"fastapi[standard]=={FASTAPI_VERSION}")
    .uv_pip_install(f"comfy-cli=={COMFY_CLI_VERSION}")
    # Add utils directory - USE ORIGINAL utils from apps/modal/utils (same as original working app)
    # This includes __init__.py to make it a proper Python package
    .add_local_dir("apps/modal/utils", "/root/utils", copy=True)
    # Add shared config (for run_function imports)
    .add_local_file("apps/modal/shared/config.py", "/root/config.py", copy=True)
    # Add image_base.py itself to /root/shared/ for imports from app image.py files
    .add_local_file("apps/modal/shared/image_base.py", "/root/shared/image_base.py", copy=True)
    # Install ComfyUI
    .run_commands(
        f"comfy --skip-prompt install --fast-deps --nvidia --version {COMFYUI_VERSION}"
    )
    # Install common custom nodes (used by multiple workflows)
    # InstantID custom node
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "if [ -d ComfyUI_InstantID ]; then cd ComfyUI_InstantID && git pull; else git clone https://github.com/cubiq/ComfyUI_InstantID.git ComfyUI_InstantID; fi"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI_InstantID && "
        "uv pip install --system opencv-python-headless insightface onnxruntime onnxruntime-gpu && "
        "(if [ -f requirements.txt ]; then uv pip install --system -r requirements.txt; fi) && "
        "echo '✅ InstantID dependencies installed'"
    )
    # Verify InstantID node structure
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI_InstantID && "
        "if [ -f nodes.py ] || [ -f __init__.py ]; then "
        "    echo '✅ InstantID custom node files found'; "
        "    python3 -c 'import sys; sys.path.insert(0, \"/root/comfy/ComfyUI\"); from custom_nodes.ComfyUI_InstantID import nodes; print(\"✅ InstantID node importable\")' || echo '⚠️  InstantID node import failed (may still work at runtime)'; "
        "else "
        "    echo '❌ InstantID custom node files not found'; "
        "    exit 1; "
        "fi"
    )
    # Install XLabs-AI x-flux-comfyui custom node (for Flux IP-Adapter)
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "if [ -d x-flux-comfyui ]; then cd x-flux-comfyui && git pull; else git clone https://github.com/XLabs-AI/x-flux-comfyui.git x-flux-comfyui; fi"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/x-flux-comfyui && "
        "python3 setup.py && "
        "echo '✅ XLabs-AI x-flux-comfyui installed'"
    )
    # Install SeedVR2 custom node
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler.git ComfyUI-SeedVR2_VideoUpscaler || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-SeedVR2_VideoUpscaler && "
        "(if [ -f requirements.txt ]; then uv pip install --system -r requirements.txt; else echo 'No requirements.txt'; fi) || echo 'SeedVR2 requirements install failed (may still work)'"
    )
    # Install ComfyUI-Easy-Use (workflow converter)
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/yolain/ComfyUI-Easy-Use.git ComfyUI-Easy-Use || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-Easy-Use && "
        "(pip install -r requirements.txt || true) || echo 'No requirements.txt'"
    )
    # Install workflow converter plugin
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/SethRobinson/comfyui-workflow-to-api-converter-endpoint.git comfyui-workflow-to-api-converter-endpoint || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/comfyui-workflow-to-api-converter-endpoint && "
        "(pip install -r requirements.txt || true) || echo 'No requirements.txt'"
    )
    # Install Z-Image-Turbo custom node (for Z-Image workflows)
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/tpc2233/ComfyUI-Z-Image-Turbo.git ComfyUI-Z-Image-Turbo || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-Z-Image-Turbo && "
        "pip install modelscope || true && "
        "(if [ -f requirements.txt ]; then pip install -r requirements.txt; fi) || true && "
        "echo '✅ Z-Image-Turbo custom node installed'"
    )
    # Install PuLID Flux for face consistency (lldacing version - fixes attn_mask issues)
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/lldacing/ComfyUI_PuLID_Flux_ll.git ComfyUI_PuLID_Flux_ll || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI_PuLID_Flux_ll && "
        "pip install -r requirements.txt && "
        "pip install facenet-pytorch --no-deps && "
        "echo '✅ PuLID Flux (lldacing) custom node installed'"
    )
    # Install Shakker-Labs IP-Adapter Flux (alternative to x-flux)
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/Shakker-Labs/ComfyUI-IPAdapter-Flux.git ComfyUI-IPAdapter-Flux || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-IPAdapter-Flux && "
        "(pip install -r requirements.txt || true) && "
        "echo '✅ Shakker-Labs IP-Adapter Flux installed'"
    )
    # Install HuggingFace Hub
    .uv_pip_install("huggingface-hub>=0.20.0")
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})
)
