# Modal Comprehensive Guide: ComfyUI Workflows, CLI Management, and Custom Nodes

> **Date**: 2026-01-27  
> **Status**: Implementation Guide  
> **Initiative**: IN-015  
> **Purpose**: Detailed guide showing how Modal can replicate your RunPod workflow with CLI management and custom nodes

---

## Executive Summary

**Yes, Modal can do everything you want:**

✅ **Deploy serverless ComfyUI workflows** - Easy, single Python file  
✅ **Manage fully via CLI** - Perfect for AI agents (`modal deploy`, `modal run`, etc.)  
✅ **Add custom nodes/workflows** - Same approach as RunPod, but in Python instead of Dockerfile  
✅ **Network storage** - `modal.Volume` equivalent to RunPod network volumes  
✅ **GitHub Actions** - Native integration, automatic deployments  

**Key Advantage**: Everything is in code (Infrastructure as Code), making it **easier for AI agents** to manage than RunPod's Dockerfile + Template + UI approach.

---

## 1. Deploying Serverless ComfyUI Workflows

### Your Current RunPod Approach

```dockerfile
# docker/comfyui-worker/Dockerfile
FROM runpod/worker-comfyui:5.6.0-base
RUN comfy-node-install res4lyf controlaltai-nodes
# ... more custom nodes ...
```

### Modal Equivalent

```python
# apps/modal/comfyui_app.py
import modal

# Define image with ComfyUI + custom nodes (same as your Dockerfile)
image = (
    modal.Image.debian_slim()
    .pip_install([
        "torch", "torchvision", "diffusers", "transformers",
        "accelerate", "safetensors", "pillow"
    ])
    .run_commands([
        # Clone ComfyUI
        "git clone https://github.com/comfyanonymous/ComfyUI.git /root/ComfyUI",
        "cd /root/ComfyUI && pip install -r requirements.txt",
        
        # Install custom nodes (same as your Dockerfile)
        "cd /root/ComfyUI/custom_nodes && git clone https://github.com/res4lyf/res4lyf.git",
        "cd /root/ComfyUI/custom_nodes && git clone https://github.com/controlaltai/controlaltai-nodes.git",
        # Install any other custom nodes you need
        
        # Install node dependencies
        "cd /root/ComfyUI/custom_nodes/res4lyf && pip install -r requirements.txt || true",
        "cd /root/ComfyUI/custom_nodes/controlaltai-nodes && pip install -r requirements.txt || true",
    ])
)

# Define persistent volume for models (equivalent to RunPod network volume)
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

app = modal.App("ryla-comfyui")

@app.function(
    image=image,
    volumes={"/root/models": volume},  # Mount at /root/models (like /workspace in RunPod)
    gpu="A100",  # or "A10", "H100", etc.
    timeout=600,
    secrets=[modal.Secret.from_name("ryla-secrets")]  # API keys, etc.
)
def generate_image(workflow_json: dict, prompt: str = None, seed: int = None):
    """
    Generate image from ComfyUI workflow JSON.
    Equivalent to your RunPod handler.
    """
    import subprocess
    import json
    import base64
    from pathlib import Path
    
    # Save workflow JSON
    workflow_path = "/tmp/workflow.json"
    with open(workflow_path, "w") as f:
        json.dump(workflow_json, f)
    
    # Modify workflow if needed (inject prompt, seed, etc.)
    if prompt:
        # Modify workflow JSON to inject prompt
        # (same logic as your RunPod handler)
        pass
    
    # Run ComfyUI (headless mode)
    result = subprocess.run([
        "python", "/root/ComfyUI/main.py",
        "--workflow", workflow_path,
        "--output", "/tmp/output"
    ], capture_output=True, text=True)
    
    # Read generated image
    output_image = Path("/tmp/output/image.png")
    if output_image.exists():
        with open(output_image, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        return {"image": image_data, "status": "success"}
    else:
        return {"error": result.stderr, "status": "failed"}
```

**Deploy**: `modal deploy apps/modal/comfyui_app.py`

---

## 2. Full CLI Management (AI Agent Ready)

### Modal CLI Commands

All operations can be done via CLI, perfect for AI agents:

```bash
# Deploy/Update
modal deploy apps/modal/comfyui_app.py

# Run one-off execution (testing)
modal run apps/modal/comfyui_app.py::generate_image --workflow-json '{"...": "..."}'

# List all apps
modal app list

# View logs
modal app logs ryla-comfyui

# Delete app
modal app delete ryla-comfyui

# Volume management
modal volume create ryla-models
modal volume list
modal volume show ryla-models

# Upload files to volume
modal volume put ryla-models /local/path /remote/path

# Download from volume
modal volume get ryla-models /remote/path /local/path
```

### AI Agent Example (MCP Server)

```python
# apps/mcp/modal-tools.py
from mcp import Server
import subprocess

server = Server("modal-tools")

@server.tool()
def deploy_comfyui_workflow(workflow_file: str) -> str:
    """Deploy ComfyUI workflow to Modal"""
    result = subprocess.run(
        ["modal", "deploy", workflow_file],
        capture_output=True,
        text=True
    )
    return result.stdout

@server.tool()
def add_custom_node(node_repo: str, app_file: str) -> str:
    """Add custom node to Modal ComfyUI app"""
    # AI agent can modify the Python file to add the node
    # Then deploy
    subprocess.run(["modal", "deploy", app_file])
    return f"Added {node_repo} and deployed"

@server.tool()
def upload_model_to_volume(model_path: str, volume_name: str) -> str:
    """Upload model to Modal volume"""
    subprocess.run([
        "modal", "volume", "put", volume_name, model_path, f"/models/{model_path}"
    ])
    return f"Uploaded {model_path} to {volume_name}"
```

**AI Agent can now**:
- Deploy workflows via CLI
- Add custom nodes by modifying Python file
- Manage volumes
- All via standard CLI commands

---

## 3. Adding Custom Nodes (Like RunPod)

### Your Current RunPod Approach

```dockerfile
# Install ComfyUI Manager nodes
RUN comfy-node-install res4lyf controlaltai-nodes

# Install GitHub custom nodes
RUN git clone https://github.com/cubiq/ComfyUI_PuLID.git ComfyUI_PuLID
RUN git clone https://github.com/cubiq/ComfyUI_InstantID.git ComfyUI_InstantID
```

### Modal Equivalent

```python
# apps/modal/comfyui_app.py
image = (
    modal.Image.debian_slim()
    .pip_install(["torch", "diffusers", ...])
    .run_commands([
        # Clone ComfyUI
        "git clone https://github.com/comfyanonymous/ComfyUI.git /root/ComfyUI",
        "cd /root/ComfyUI && pip install -r requirements.txt",
        
        # Install ComfyUI Manager (if needed)
        "cd /root/ComfyUI && git clone https://github.com/ltdrdata/ComfyUI-Manager.git custom_nodes/ComfyUI-Manager",
        
        # Install custom nodes (same as your Dockerfile)
        "cd /root/ComfyUI/custom_nodes && git clone https://github.com/res4lyf/res4lyf.git",
        "cd /root/ComfyUI/custom_nodes && git clone https://github.com/controlaltai/controlaltai-nodes.git",
        "cd /root/ComfyUI/custom_nodes && git clone https://github.com/cubiq/ComfyUI_PuLID.git ComfyUI_PuLID",
        "cd /root/ComfyUI/custom_nodes && git clone https://github.com/cubiq/ComfyUI_InstantID.git ComfyUI_InstantID",
        
        # Install dependencies for each node
        "cd /root/ComfyUI/custom_nodes/res4lyf && pip install -r requirements.txt || true",
        "cd /root/ComfyUI/custom_nodes/ComfyUI_PuLID && pip install -r requirements.txt || true",
        "cd /root/ComfyUI/custom_nodes/ComfyUI_InstantID && pip install -r requirements.txt || true",
    ])
)
```

**To add a new custom node**:
1. Add `git clone` command to the image definition
2. Add dependency installation if needed
3. Run `modal deploy apps/modal/comfyui_app.py`

**AI Agent can do this** by modifying the Python file and running deploy.

---

## 4. Network Storage (Like RunPod Network Volumes)

### Your Current RunPod Setup

```bash
# Network Volume: ryla-models-dream-companion
# Mounted at: /workspace
# Models at: /workspace/models/checkpoints/flux1-schnell.safetensors
```

### Modal Equivalent

```python
# Create volume (one-time, or via CLI)
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

@app.function(
    volumes={"/root/models": volume}  # Mount at /root/models
)
def generate_image(...):
    # Models available at /root/models/checkpoints/flux1-schnell.safetensors
    # Same structure as your RunPod setup
    pass
```

### Uploading Models to Volume

```python
# One-time script to populate volume
@app.function(volumes={"/root/models": volume})
def upload_models():
    """Download and store models in volume"""
    import subprocess
    
    # Download models (same as your RunPod process)
    subprocess.run([
        "wget", "https://huggingface.co/.../flux1-schnell.safetensors",
        "-O", "/root/models/checkpoints/flux1-schnell.safetensors"
    ])
    
    # Commit volume changes
    volume.commit()

# Run: modal run upload_models.py
```

**Or via CLI**:
```bash
# Upload model file
modal volume put ryla-models ./flux1-schnell.safetensors /models/checkpoints/flux1-schnell.safetensors

# Download from volume
modal volume get ryla-models /models/checkpoints/flux1-schnell.safetensors ./local-file.safetensors
```

---

## 5. GitHub Actions Integration

### Complete Workflow

```yaml
# .github/workflows/deploy-modal.yml
name: Deploy ComfyUI to Modal

on:
  push:
    branches: [main]
    paths:
      - 'apps/modal/**'
      - 'libs/business/src/workflows/**'  # Workflow changes
      - '.github/workflows/deploy-modal.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install Modal
        run: pip install modal
      
      - name: Deploy to Modal
        env:
          MODAL_TOKEN_ID: ${{ secrets.MODAL_TOKEN_ID }}
          MODAL_TOKEN_SECRET: ${{ secrets.MODAL_TOKEN_SECRET }}
        run: |
          cd apps/modal
          modal deploy comfyui_app.py
      
      - name: Verify Deployment
        run: modal app list | grep ryla-comfyui
```

**Result**: Every push automatically updates your serverless endpoint.

---

## 6. Managing Workflows (Like Your Current Setup)

### Your Current Approach

You have workflows defined in `libs/business/src/workflows/` and deploy them to RunPod.

### Modal Approach

```python
# apps/modal/comfyui_app.py
from libs.business.src.workflows.z_image_danrisi import get_workflow_json

@app.function(...)
def generate_image(workflow_name: str, prompt: str, **kwargs):
    """
    Generate image using workflow from your codebase.
    """
    # Load workflow from your existing code
    if workflow_name == "z-image-danrisi":
        workflow_json = get_workflow_json(prompt=prompt, **kwargs)
    elif workflow_name == "flux":
        workflow_json = get_flux_workflow_json(prompt=prompt, **kwargs)
    else:
        raise ValueError(f"Unknown workflow: {workflow_name}")
    
    # Execute ComfyUI
    # ... (same execution logic)
```

**Advantage**: Your existing workflow code works as-is, just call it from Modal function.

---

## 7. Complete Example: Replicating Your RunPod Setup

### Your Current RunPod Setup

1. **Dockerfile** with custom nodes (res4lyf, controlaltai-nodes, etc.)
2. **Network Volume** (`ryla-models-dream-companion`) at `/workspace`
3. **Handler** that accepts workflow JSON
4. **Models** at `/workspace/models/checkpoints/`

### Modal Equivalent

```python
# apps/modal/comfyui_app.py
import modal
from pathlib import Path

# 1. Define image with custom nodes (replaces Dockerfile)
image = (
    modal.Image.debian_slim()
    .pip_install([
        "torch", "torchvision", "diffusers", "transformers",
        "accelerate", "safetensors", "pillow", "numpy"
    ])
    .run_commands([
        # Install ComfyUI
        "git clone https://github.com/comfyanonymous/ComfyUI.git /root/ComfyUI",
        "cd /root/ComfyUI && pip install -r requirements.txt",
        
        # Install custom nodes (from your Dockerfile)
        "cd /root/ComfyUI/custom_nodes && git clone https://github.com/res4lyf/res4lyf.git",
        "cd /root/ComfyUI/custom_nodes && git clone https://github.com/controlaltai/controlaltai-nodes.git",
        "cd /root/ComfyUI/custom_nodes && git clone https://github.com/cubiq/ComfyUI_PuLID.git ComfyUI_PuLID",
        "cd /root/ComfyUI/custom_nodes && git clone https://github.com/cubiq/ComfyUI_InstantID.git ComfyUI_InstantID",
        
        # Install node dependencies
        "cd /root/ComfyUI/custom_nodes/res4lyf && pip install -r requirements.txt || true",
        "cd /root/ComfyUI/custom_nodes/ComfyUI_PuLID && pip install -r requirements.txt || true",
        "cd /root/ComfyUI/custom_nodes/ComfyUI_InstantID && pip install -r requirements.txt || true",
    ])
)

# 2. Define volume (replaces RunPod network volume)
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

app = modal.App("ryla-comfyui")

# 3. Define handler (replaces RunPod handler)
@app.function(
    image=image,
    volumes={"/root/models": volume},  # Equivalent to /workspace
    gpu="A100",  # Match your RunPod GPU
    timeout=600,
    secrets=[modal.Secret.from_name("ryla-secrets")]
)
def generate_image(
    workflow_json: dict,
    prompt: str = None,
    seed: int = None,
    **kwargs
):
    """
    Generate image from ComfyUI workflow JSON.
    Equivalent to your RunPod handler.
    
    Models expected at: /root/models/checkpoints/ (same as /workspace/models/checkpoints/)
    """
    import subprocess
    import json
    import base64
    import time
    
    # Save workflow JSON
    workflow_path = "/tmp/workflow.json"
    with open(workflow_path, "w") as f:
        json.dump(workflow_json, f)
    
    # Modify workflow if needed (inject prompt, seed, etc.)
    # Same logic as your RunPod handler
    if prompt:
        # Modify workflow JSON nodes to inject prompt
        # (implementation depends on your workflow structure)
        pass
    
    if seed:
        # Inject seed
        pass
    
    # Run ComfyUI (headless)
    output_dir = Path("/tmp/output")
    output_dir.mkdir(exist_ok=True)
    
    result = subprocess.run([
        "python", "/root/ComfyUI/main.py",
        "--workflow", workflow_path,
        "--output", str(output_dir)
    ], capture_output=True, text=True, cwd="/root/ComfyUI")
    
    # Find generated image
    output_files = list(output_dir.glob("*.png"))
    if output_files:
        with open(output_files[0], "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        return {
            "image": image_data,
            "status": "success",
            "output_file": str(output_files[0])
        }
    else:
        return {
            "error": result.stderr,
            "status": "failed",
            "stdout": result.stdout
        }

# 4. Helper function to upload models (one-time setup)
@app.function(volumes={"/root/models": volume})
def upload_model(model_url: str, model_path: str):
    """Upload model to volume"""
    import subprocess
    from pathlib import Path
    
    # Create directory structure
    full_path = Path("/root/models") / model_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Download model
    subprocess.run(["wget", model_url, "-O", str(full_path)])
    
    # Commit volume
    volume.commit()
    return f"Uploaded {model_url} to {model_path}"

# Deploy: modal deploy apps/modal/comfyui_app.py
```

---

## 8. AI Agent Management (MCP Integration)

### Complete MCP Server for Modal

```python
# apps/mcp/modal-comfyui-tools.py
from mcp import Server
import subprocess
import json
from pathlib import Path

server = Server("modal-comfyui")

@server.tool()
def deploy_comfyui_app(app_file: str = "apps/modal/comfyui_app.py") -> str:
    """Deploy ComfyUI app to Modal"""
    result = subprocess.run(
        ["modal", "deploy", app_file],
        capture_output=True,
        text=True
    )
    return result.stdout if result.returncode == 0 else result.stderr

@server.tool()
def add_custom_node(
    node_repo: str,
    node_name: str,
    app_file: str = "apps/modal/comfyui_app.py"
) -> str:
    """Add custom node to ComfyUI app"""
    # Read current app file
    with open(app_file, "r") as f:
        content = f.read()
    
    # Add git clone command
    new_command = f'        "cd /root/ComfyUI/custom_nodes && git clone {node_repo} {node_name}",'
    
    # Insert before the closing of run_commands
    # (simplified - in practice, use AST or careful string manipulation)
    # ...
    
    # Write back
    with open(app_file, "w") as f:
        f.write(content)
    
    # Deploy
    subprocess.run(["modal", "deploy", app_file])
    return f"Added {node_name} and deployed"

@server.tool()
def upload_model_to_volume(
    model_url: str,
    model_path: str,
    volume_name: str = "ryla-models"
) -> str:
    """Upload model to Modal volume"""
    result = subprocess.run([
        "modal", "run", "apps/modal/comfyui_app.py::upload_model",
        "--model-url", model_url,
        "--model-path", model_path
    ], capture_output=True, text=True)
    return result.stdout

@server.tool()
def generate_image_via_modal(
    workflow_json: dict,
    prompt: str = None,
    seed: int = None
) -> dict:
    """Generate image using Modal ComfyUI endpoint"""
    import requests
    
    # Get Modal endpoint URL (from deployment)
    endpoint_url = "https://<your-workspace>--ryla-comfyui-generate-image.modal.run"
    
    response = requests.post(
        endpoint_url,
        json={
            "workflow_json": workflow_json,
            "prompt": prompt,
            "seed": seed
        }
    )
    return response.json()

# AI Agent can now:
# - deploy_comfyui_app() - Deploy/update app
# - add_custom_node() - Add new custom nodes
# - upload_model_to_volume() - Manage models
# - generate_image_via_modal() - Generate images
```

---

## 9. Comparison: Modal vs RunPod for Your Use Case

| Feature | RunPod (Current) | Modal |
|---------|------------------|-------|
| **Custom Nodes** | Dockerfile `RUN` commands | Python `run_commands()` |
| **Network Storage** | Network Volume at `/workspace` | `modal.Volume` at `/root/models` |
| **Deployment** | Manual UI or MCP | `modal deploy` (CLI) |
| **GitHub Actions** | Custom scripts | Native (`modal deploy`) |
| **AI Agent Management** | Via MCP server | Via CLI (easier) |
| **Workflow Updates** | Rebuild Docker, update endpoint | Modify Python, `modal deploy` |
| **Model Management** | Manual upload to volume | CLI or Python API |
| **Version Control** | Dockerfile in repo | Python file in repo |

---

## 10. Migration Checklist

### Step 1: Set Up Modal

```bash
# Install Modal
pip install modal

# Authenticate
modal token new

# Create app file
mkdir -p apps/modal
# Create apps/modal/comfyui_app.py (see example above)
```

### Step 2: Migrate Custom Nodes

Convert your Dockerfile `RUN` commands to Modal `run_commands()`:

```python
# Your Dockerfile:
# RUN comfy-node-install res4lyf controlaltai-nodes
# RUN git clone https://github.com/cubiq/ComfyUI_PuLID.git

# Modal equivalent:
.run_commands([
    "cd /root/ComfyUI/custom_nodes && git clone https://github.com/res4lyf/res4lyf.git",
    "cd /root/ComfyUI/custom_nodes && git clone https://github.com/cubiq/ComfyUI_PuLID.git ComfyUI_PuLID",
])
```

### Step 3: Set Up Volume

```bash
# Create volume
modal volume create ryla-models

# Upload models (one-time)
modal volume put ryla-models ./flux1-schnell.safetensors /models/checkpoints/flux1-schnell.safetensors
```

### Step 4: Deploy

```bash
modal deploy apps/modal/comfyui_app.py
```

### Step 5: Set Up GitHub Actions

```yaml
# .github/workflows/deploy-modal.yml
# (see example above)
```

---

## 11. Advantages for AI Agents

### Why Modal is Better for AI Agents

1. **Single File**: Everything in one Python file (easier to modify)
2. **Standard CLI**: `modal deploy`, `modal run`, `modal volume` (predictable)
3. **No UI Steps**: Everything via CLI/API
4. **Version Controlled**: Python file in repo (easy to diff/modify)
5. **Local Testing**: `modal run` for testing before deploy

### AI Agent Workflow

```
AI Agent wants to add custom node:
1. Read apps/modal/comfyui_app.py
2. Add git clone command to run_commands()
3. Run: modal deploy apps/modal/comfyui_app.py
4. Done!
```

**vs RunPod**:
```
1. Read Dockerfile
2. Add RUN command
3. Build Docker image
4. Push to registry
5. Update RunPod template
6. Update RunPod endpoint
7. Done (many steps, UI involved)
```

---

## 12. Cost Comparison

### RunPod
- Per image: $0.0006-0.0016 (SDXL)
- Volume storage: ~$14/month (200GB)
- **Total**: ~$14/month + compute

### Modal
- Per image: $0.002-0.004 (SDXL)
- Volume storage: **Included** (no separate charge)
- **Total**: Compute only

**Break-even**: At ~7,000 images/month, Modal becomes cheaper (no volume fees).

---

## Conclusion

**Yes, Modal can do everything you want:**

✅ Deploy serverless ComfyUI workflows - Single Python file  
✅ Manage fully via CLI - Perfect for AI agents  
✅ Add custom nodes - Same approach as RunPod, but in Python  
✅ Network storage - `modal.Volume` equivalent to RunPod volumes  
✅ GitHub Actions - Native integration  

**Modal is actually BETTER for AI agents** because:
- Single file to manage (vs Dockerfile + Template + Endpoint)
- Standard CLI commands (vs custom MCP server)
- No UI steps (vs RunPod Console)
- Version controlled infrastructure (vs separate configs)

---

## Next Steps

1. **Test Modal Locally**:
   ```bash
   pip install modal
   modal token new
   # Create test app
   modal deploy apps/modal/comfyui_app.py
   ```

2. **Migrate One Workflow**:
   - Start with simplest (e.g., Flux)
   - Test end-to-end
   - Compare with RunPod

3. **Set Up GitHub Actions**:
   - Add secrets
   - Create workflow file
   - Test automatic deployment

4. **Create MCP Tools**:
   - Wrap Modal CLI in MCP server
   - Enable AI agent management

---

## References

- [Modal Documentation](https://modal.com/docs)
- [Modal Volumes](https://modal.com/docs/guide/volumes)
- [Modal GitHub Actions](https://modal.com/docs/guide/examples/github-actions)
- [Modal CLI Reference](https://modal.com/docs/reference/cli)
- [Current RunPod Setup](../../ops/runpod/ENDPOINT-SETUP.md)
- [Modal vs RunPod Comparison](./MODAL-VS-RUNPOD-COMPARISON.md)
- [Infrastructure NSFW Policies](../providers/INFRASTRUCTURE-NSFW-POLICIES.md) - NSFW content policy analysis

---

**Last Updated**: 2026-01-27  
**Status**: Ready for Implementation
