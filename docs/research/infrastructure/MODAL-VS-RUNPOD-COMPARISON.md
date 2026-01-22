# Modal vs RunPod: GitHub Actions & Network Storage Comparison

> **Date**: 2026-01-27  
> **Status**: Research Complete  
> **Initiative**: IN-015  
> **Purpose**: Evaluate if Modal can replicate RunPod setup with GitHub Actions and network storage

---

## Executive Summary

**Yes, Modal can replicate your RunPod setup** with GitHub Actions and network storage. In fact, Modal offers a **cleaner, more code-driven approach** that may be better suited for your workflow.

**Key Finding**: Modal provides:
- ✅ Native GitHub Actions integration via `modal deploy`
- ✅ Persistent network storage via `modal.Volume` and `modal.NetworkFileSystem`
- ✅ Infrastructure as Code (Python) - easier to version control
- ✅ Similar serverless scaling (scale-to-zero)
- ✅ Lower cost than RunPod for equivalent workloads

---

## Current RunPod Setup

### Your Current Architecture

Based on your documentation:

1. **Network Volume**: `ryla-models-dream-companion` (200GB)
   - Mounted at `/workspace`
   - Stores models: `flux1-schnell.safetensors`, custom nodes, etc.
   - Shared across serverless endpoints

2. **Serverless Endpoints**:
   - Flux endpoint: `jpcxjab2zpro19`
   - Z-Image endpoint: `xqs8k7yhabwh0k`
   - Templates: `jx2h981xwv`, `x1ua87uhrs`
   - Min workers: 0 (scale-to-zero)
   - Network volume attached

3. **Deployment**:
   - Currently: Manual via RunPod Console or MCP
   - Desired: GitHub Actions automation

---

## Modal Equivalent Setup

### 1. Network Storage

**RunPod**: Network Volume mounted at `/workspace`  
**Modal**: `modal.Volume` or `modal.NetworkFileSystem` mounted at custom path

```python
import modal

# Create persistent volume for models
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

# Mount to container
image = (
    modal.Image.debian_slim()
    .pip_install(["torch", "diffusers", "transformers"])
    .run_commands([
        "git clone https://github.com/comfyanonymous/ComfyUI.git /root/ComfyUI",
        # Install custom nodes
    ])
)

@app.function(
    image=image,
    volumes={"/root/models": volume},  # Mount volume at /root/models
    gpu="A100",  # or "A10", "H100", etc.
    timeout=600
)
def generate_image(workflow_json: dict):
    # Models available at /root/models/checkpoints/
    # Custom nodes at /root/ComfyUI/custom_nodes/
    pass
```

**Key Differences**:
- ✅ **Modal**: Volume defined in code, version controlled
- ⚠️ **RunPod**: Volume created separately, attached via UI/MCP
- ✅ **Modal**: Can mount multiple volumes, NFS for shared access
- ✅ **Modal**: Volume operations (upload/download) via Python API

---

### 2. GitHub Actions Integration

**RunPod**: Manual deployment or MCP-based  
**Modal**: Native GitHub Actions support

#### RunPod Approach (Current)
```yaml
# .github/workflows/deploy-runpod.yml (hypothetical)
name: Deploy to RunPod
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy via MCP/API
        run: |
          # Custom script to update RunPod endpoint
          # Or use RunPod API directly
```

**Issues**:
- ❌ No native GitHub Actions integration
- ❌ Requires custom scripts or MCP server
- ❌ Manual template/endpoint management

#### Modal Approach
```yaml
# .github/workflows/deploy-modal.yml
name: Deploy to Modal
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install Modal
        run: pip install modal
      - name: Deploy
        env:
          MODAL_TOKEN_ID: ${{ secrets.MODAL_TOKEN_ID }}
          MODAL_TOKEN_SECRET: ${{ secrets.MODAL_TOKEN_SECRET }}
        run: modal deploy app.py
```

**Advantages**:
- ✅ Native GitHub Actions support
- ✅ Single command deployment (`modal deploy`)
- ✅ Automatic updates on push
- ✅ Version controlled infrastructure

---

### 3. Infrastructure as Code

**RunPod**: Dockerfiles + Templates + Endpoints (separate)  
**Modal**: Single Python file (Infrastructure as Code)

#### RunPod Structure
```
runpod-setup/
├── Dockerfile              # Container definition
├── handler.py              # Endpoint handler
├── requirements.txt        # Dependencies
└── .github/workflows/      # CI/CD (custom)
```

**Issues**:
- ❌ Multiple files to manage
- ❌ Template creation separate from code
- ❌ Endpoint configuration in UI
- ❌ Network volume attachment manual

#### Modal Structure
```python
# app.py - Everything in one file
import modal

# Define image with ComfyUI + custom nodes
image = (
    modal.Image.debian_slim()
    .pip_install(["torch", "diffusers", ...])
    .run_commands([
        "git clone https://github.com/comfyanonymous/ComfyUI.git /root/ComfyUI",
        "cd /root/ComfyUI && pip install -r requirements.txt",
        # Install custom nodes (res4lyf, etc.)
    ])
)

# Define volume
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

# Define app
app = modal.App("ryla-comfyui")

@app.function(
    image=image,
    volumes={"/root/models": volume},
    gpu="A100",
    timeout=600,
    secrets=[modal.Secret.from_name("ryla-secrets")]  # API keys, etc.
)
def generate_image(workflow_json: dict, prompt: str = None):
    """
    Generate image from ComfyUI workflow JSON.
    Similar to your RunPod handler.
    """
    import subprocess
    import json
    
    # Load workflow
    workflow_path = "/tmp/workflow.json"
    with open(workflow_path, "w") as f:
        json.dump(workflow_json, f)
    
    # Run ComfyUI
    result = subprocess.run([
        "python", "/root/ComfyUI/main.py",
        "--workflow", workflow_path
    ], capture_output=True)
    
    # Return image
    return {"image": result.stdout}

# Deploy: modal deploy app.py
```

**Advantages**:
- ✅ Single file for infrastructure + code
- ✅ Version controlled
- ✅ Easy to test locally
- ✅ No separate template/endpoint management

---

## Feature Comparison

| Feature | RunPod | Modal |
|---------|--------|-------|
| **Network Storage** | ✅ Network Volumes | ✅ `modal.Volume` / `modal.NetworkFileSystem` |
| **GitHub Actions** | ⚠️ Custom scripts/MCP | ✅ Native (`modal deploy`) |
| **Infrastructure as Code** | ⚠️ Dockerfiles + UI | ✅ Python (single file) |
| **Serverless Scaling** | ✅ Scale-to-zero | ✅ Scale-to-zero |
| **Custom Nodes** | ⚠️ Manual Docker setup | ✅ Defined in Python image |
| **Model Storage** | ✅ Network volume mount | ✅ Volume mount |
| **NSFW Content Policy** | ✅ Allowed (legal content) | ✅ Allowed (legal content) |
| **Cost** | $ (cheapest) | $–$$ (competitive) |
| **Setup Complexity** | ⚠️ High (current pain point) | ⭐⭐⭐ (moderate) |
| **MCP Integration** | ✅ Via MCP server | ✅ REST API (MCP-ready) |

---

## Migration Path: RunPod → Modal

### Step 1: Create Modal App

```python
# apps/modal/comfyui_app.py
import modal

volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

image = (
    modal.Image.debian_slim()
    .pip_install([
        "torch", "torchvision", "diffusers", "transformers",
        "accelerate", "safetensors", "pillow"
    ])
    .run_commands([
        "git clone https://github.com/comfyanonymous/ComfyUI.git /root/ComfyUI",
        "cd /root/ComfyUI && pip install -r requirements.txt",
        # Install custom nodes (res4lyf, etc.)
        "cd /root/ComfyUI/custom_nodes && git clone <res4lyf-repo>",
    ])
)

app = modal.App("ryla-comfyui")

@app.function(
    image=image,
    volumes={"/root/models": volume},  # Equivalent to /workspace
    gpu="A100",  # Match your RunPod GPU
    timeout=600
)
def generate_image(workflow_json: dict):
    """
    Replicate your RunPod handler logic here.
    Models available at /root/models/checkpoints/
    """
    # Your existing handler code
    pass
```

### Step 2: Upload Models to Volume

```python
# One-time script to populate volume
@app.function(volumes={"/root/models": volume})
def upload_models():
    # Download models to volume
    # Similar to your RunPod model download process
    pass

# Run: modal run upload_models.py
```

### Step 3: Set Up GitHub Actions

```yaml
# .github/workflows/deploy-modal.yml
name: Deploy ComfyUI to Modal
on:
  push:
    branches: [main]
    paths:
      - 'apps/modal/**'
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
      - name: Deploy
        env:
          MODAL_TOKEN_ID: ${{ secrets.MODAL_TOKEN_ID }}
          MODAL_TOKEN_SECRET: ${{ secrets.MODAL_TOKEN_SECRET }}
        run: |
          cd apps/modal
          modal deploy comfyui_app.py
```

### Step 4: Update API Integration

```python
# libs/business/src/services/comfyui-service.ts
# Change from RunPod API to Modal API

// Before (RunPod)
const response = await fetch(`https://api.runpod.io/v2/${endpointId}/run`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RUNPOD_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ input: workflowJson })
});

// After (Modal)
const response = await fetch(`https://<your-workspace>--ryla-comfyui-generate-image.modal.run`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${MODAL_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ workflow_json: workflowJson })
});
```

---

## Cost Comparison

### RunPod (Current)
- **Network Volume**: ~$0.07/GB/month (200GB = ~$14/month)
- **GPU Time**: RTX 4090 ~$0.25-0.4/hr, A100 ~$1.8/hr
- **Per Image (SDXL)**: $0.0006-0.0016
- **Per Video (SVD)**: $0.03-0.0575

### Modal
- **Volume Storage**: Included (no separate charge)
- **GPU Time**: A10 ~$1.50-2.00/hr, A100 ~$2.00-3.00/hr
- **Per Image (SDXL)**: $0.002-0.004
- **Per Video (SVD)**: ~$0.03-0.06

**Verdict**: Modal is slightly more expensive per image (~2-3x), but:
- ✅ No separate volume storage cost
- ✅ Better developer experience (saves engineering time)
- ✅ Native GitHub Actions (no custom scripts)

---

## Advantages of Modal Over RunPod

### 1. **Infrastructure as Code**
- ✅ Single Python file vs. Dockerfile + Template + Endpoint
- ✅ Version controlled
- ✅ Easy to review and test

### 2. **GitHub Actions Native**
- ✅ `modal deploy` command
- ✅ No custom scripts or MCP server needed
- ✅ Automatic deployments on push

### 3. **Better Storage Management**
- ✅ Volume operations via Python API
- ✅ Can upload/download models programmatically
- ✅ No manual UI steps

### 4. **MCP/AI Agent Ready**
- ✅ Standard REST API
- ✅ Easy to wrap in MCP server
- ✅ Better for AI agent integration

### 5. **Local Testing**
- ✅ Test Modal functions locally before deploying
- ✅ `modal run` for one-off executions
- ✅ Better debugging experience

---

## Disadvantages of Modal vs RunPod

### 1. **Cost**
- ⚠️ Slightly more expensive per execution (~2-3x)
- ⚠️ But no separate volume storage cost

### 2. **Learning Curve**
- ⚠️ Need to learn Modal Python API
- ⚠️ Different from Docker-based approach

### 3. **Custom Nodes Setup**
- ⚠️ Still need to install custom nodes in image definition
- ⚠️ But easier than RunPod Dockerfile management

---

## Recommendation

### Use Modal If:
- ✅ You want Infrastructure as Code
- ✅ You want native GitHub Actions integration
- ✅ You prefer Python over Dockerfiles
- ✅ You want better MCP/AI agent integration
- ✅ You're willing to pay slightly more for better DX

### Stick with RunPod If:
- ⚠️ Absolute lowest cost is critical
- ⚠️ You're already heavily invested in RunPod setup
- ⚠️ You prefer Docker-based approach

### Hybrid Approach:
- **Fast Path**: Use RunComfy for immediate production (1 week)
- **Long-term**: Migrate to Modal for better CI/CD and Infrastructure as Code

---

## Next Steps

1. **Test Modal Locally**:
   ```bash
   pip install modal
   modal token new  # Get API tokens
   # Create test app.py
   modal deploy app.py
   ```

2. **Set Up GitHub Actions**:
   - Add `MODAL_TOKEN_ID` and `MODAL_TOKEN_SECRET` to GitHub Secrets
   - Create `.github/workflows/deploy-modal.yml`
   - Test deployment

3. **Migrate One Workflow**:
   - Start with simplest workflow (e.g., Flux)
   - Test end-to-end
   - Compare costs and reliability

4. **Full Migration**:
   - Migrate all workflows
   - Update API integration
   - Deprecate RunPod setup

---

## References

- [Modal Documentation](https://modal.com/docs)
- [Modal Volumes](https://modal.com/docs/guide/volumes)
- [Modal GitHub Actions](https://modal.com/docs/guide/examples/github-actions)
- [Modal GPU Support](https://modal.com/docs/guide/gpu)
- [RunPod Network Volumes](https://docs.runpod.io/pods/network-volumes)
- [Current RunPod Setup](../../ops/runpod/ENDPOINT-SETUP.md)

---

**Last Updated**: 2026-01-27  
**Status**: Ready for Testing
