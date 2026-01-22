# Modal.com Deployment Best Practices

> **Last Updated:** January 2026  
> **Purpose:** Standardize Modal.com deployment patterns, model management, and code organization for RYLA

---

## Table of Contents

1. [Model Deployment Patterns](#model-deployment-patterns)
2. [Code Organization](#code-organization)
3. [Development Workflow](#development-workflow)
4. [File Structure](#file-structure)
5. [Single vs Multi-File Architecture](#single-vs-multi-file-architecture)
6. [Model Management](#model-management)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Checklist](#deployment-checklist)

---

## Model Deployment Patterns

### Pattern 1: HuggingFace Model Download (Recommended)

**Use for:** Models available on HuggingFace Hub (gated or public)

```python
def hf_download_model():
    from huggingface_hub import hf_hub_download
    import os
    
    # Get token from Modal Secret (for gated models)
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    # Download model
    model_path = hf_hub_download(
        repo_id="black-forest-labs/FLUX.1-dev",
        filename="flux1-dev.safetensors",
        cache_dir="/cache",  # Use HF cache volume
        token=token,  # Required for gated repos
    )
    
    # Symlink to ComfyUI directory
    comfy_dir = Path("/root/comfy/ComfyUI")
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/checkpoints && "
        f"ln -s {model_path} {comfy_dir}/models/checkpoints/flux1-dev.safetensors",
        shell=True,
        check=True,
    )

# Add to image build
image = (
    modal.Image.debian_slim()
    .run_function(
        hf_download_model,
        volumes={"/cache": hf_cache_vol},
        secrets=[modal.Secret.from_name("huggingface")],
    )
)
```

**Best Practices:**
- ✅ Use `cache_dir="/cache"` with HF cache volume for persistence
- ✅ Always check for token before downloading gated models
- ✅ Symlink models to ComfyUI directories (don't copy)
- ✅ Handle missing tokens gracefully (skip download, log warning)

### Pattern 2: Modal Volume Storage (For Large Models)

**Use for:** Models too large for image build, or models downloaded separately

```python
# Models stored in Modal volume
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

# At runtime, symlink from volume to ComfyUI
def setup_models():
    comfy_dir = Path("/root/comfy/ComfyUI")
    volume_dir = Path("/root/models")
    
    # Symlink models from volume
    for model_file in (volume_dir / "checkpoints").glob("*.safetensors"):
        target = comfy_dir / "models" / "checkpoints" / model_file.name
        if not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            subprocess.run(f"ln -s {model_file} {target}", shell=True)
```

**Best Practices:**
- ✅ Use volumes for models > 5GB
- ✅ Symlink at runtime, not during image build
- ✅ Check if symlink exists before creating (idempotent)
- ✅ Use descriptive volume names: `ryla-models`, `hf-hub-cache`

### Pattern 3: Custom Node Installation

**Use for:** ComfyUI custom nodes (InstantID, SeedVR2, etc.)

```python
image = (
    modal.Image.debian_slim()
    .run_commands(
        # Clone custom node
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/user/custom-node.git CustomNode || true"
    )
    .run_commands(
        # Install dependencies
        "cd /root/comfy/ComfyUI/custom_nodes/CustomNode && "
        "pip install -r requirements.txt || true"
    )
)
```

**Best Practices:**
- ✅ Use `|| true` to allow partial failures (node might already exist)
- ✅ Install dependencies in separate command (better error visibility)
- ✅ Document custom node requirements in code comments
- ✅ Test custom nodes before adding to production image

### Pattern 4: Workflow File Management

**Use for:** ComfyUI workflow JSON files

```python
# Option 1: Add to image (for small workflows)
image = (
    modal.Image.debian_slim()
    .add_local_file("workflows/seedvr2.json", "/root/workflows/seedvr2.json", copy=True)
)

# Option 2: Store in volume (for large or frequently updated workflows)
# Upload workflows to volume separately, load at runtime
```

**Best Practices:**
- ✅ Use `copy=True` for files needed during image build
- ✅ Store workflows in `workflows/` directory (not in `apps/modal/`)
- ✅ Use descriptive workflow names: `seedvr2.json`, `flux_dev_t5fp16.json`
- ✅ Document workflow purpose in filename or comments

---

## Code Organization

### Current Problems

1. **Single large file** (`comfyui_ryla.py` = 1470 lines)
2. **Mixed concerns**: Model downloads, workflows, endpoints, utilities all in one file
3. **Multiple duplicate files**: `comfyui_danrisi.py`, `comfyui_z_image_turbo.py`, etc.
4. **Documentation chaos**: 28+ markdown files in root directory
5. **Test files mixed with production**: `*_test.py` files scattered

### Proposed Structure

```
apps/modal/
├── README.md                    # Main documentation
├── DEPLOYMENT.md                # Deployment guide
├── BEST-PRACTICES.md            # This file
│
├── src/                         # Production code
│   ├── __init__.py
│   ├── app.py                   # Main Modal app (entry point)
│   ├── config.py                # Configuration (volumes, secrets, GPU)
│   ├── image.py                 # Image build logic
│   │
│   ├── models/                  # Model download functions
│   │   ├── __init__.py
│   │   ├── flux.py              # Flux models (Schnell, Dev)
│   │   ├── instantid.py         # InstantID models
│   │   ├── wan2.py              # Wan2.1 models
│   │   └── base.py              # Base model download utilities
│   │
│   ├── workflows/               # Workflow implementations
│   │   ├── __init__.py
│   │   ├── flux.py              # Flux workflows
│   │   ├── instantid.py         # InstantID workflows
│   │   ├── lora.py              # LoRA workflows
│   │   ├── wan2.py              # Wan2.1 workflows
│   │   ├── seedvr2.py           # SeedVR2 workflows
│   │   └── base.py              # Base workflow utilities
│   │
│   ├── endpoints/               # FastAPI endpoint handlers
│   │   ├── __init__.py
│   │   ├── flux.py              # Flux endpoints
│   │   ├── instantid.py         # InstantID endpoints
│   │   ├── lora.py              # LoRA endpoints
│   │   ├── wan2.py              # Wan2.1 endpoints
│   │   └── workflow.py          # Custom workflow endpoint
│   │
│   └── utils/                   # Shared utilities
│       ├── __init__.py
│       ├── cost_tracker.py      # Cost tracking
│       ├── comfyui.py           # ComfyUI server management
│       └── image_utils.py       # Image processing utilities
│
├── tests/                       # Test files
│   ├── __init__.py
│   ├── test_flux.py
│   ├── test_instantid.py
│   ├── test_wan2.py
│   └── fixtures/                # Test fixtures
│
├── scripts/                     # Utility scripts
│   ├── upload_models.py
│   ├── test_performance.py
│   └── deploy.sh
│
├── docs/                        # Documentation
│   ├── deployment.md
│   ├── models.md                # Model documentation
│   ├── workflows.md             # Workflow documentation
│   └── troubleshooting.md
│
└── workflows/                   # Workflow JSON files (symlinked from root)
    └── (symlink to ../../workflows/)
```

---

## Single vs Multi-File Architecture

### Option A: Single File (Current)

**Pros:**
- ✅ Simple deployment: `modal deploy apps/modal/comfyui_ryla.py`
- ✅ Easy to understand (everything in one place)
- ✅ No import complexity
- ✅ Good for small projects

**Cons:**
- ❌ Hard to maintain (1470 lines)
- ❌ Difficult to test individual components
- ❌ Hard to reuse code
- ❌ Merge conflicts in team environments
- ❌ Violates single responsibility principle

### Option B: Modular Multi-File (Recommended)

**Pros:**
- ✅ Better organization (models, workflows, endpoints separated)
- ✅ Easier to test (unit test individual modules)
- ✅ Reusable components
- ✅ Easier code reviews
- ✅ Scales better as project grows
- ✅ Follows RYLA architecture patterns

**Cons:**
- ⚠️ More files to manage
- ⚠️ Need to understand import structure
- ⚠️ Slightly more complex deployment

### Recommendation: **Hybrid Approach**

**Structure:**
```
apps/modal/
├── app.py              # Main entry point (Modal app definition)
├── config.py           # Configuration (volumes, secrets, GPU)
├── image.py            # Image build (all model downloads, custom nodes)
│
└── handlers/           # Endpoint handlers (one file per workflow type)
    ├── flux.py         # Flux endpoints + workflow logic
    ├── instantid.py   # InstantID endpoints + workflow logic
    ├── wan2.py         # Wan2.1 endpoints + workflow logic
    └── workflow.py     # Custom workflow endpoint
```

**Benefits:**
- ✅ Main app file stays small (~200 lines)
- ✅ Each handler is self-contained (~300-400 lines)
- ✅ Easy to add new workflows (new handler file)
- ✅ Still simple deployment: `modal deploy apps/modal/app.py`

**Example Structure:**

```python
# app.py (Main entry point)
import modal
from config import image, volume, hf_cache_vol
from handlers.flux import setup_flux_endpoints
from handlers.instantid import setup_instantid_endpoints
from handlers.wan2 import setup_wan2_endpoints

app = modal.App("ryla-comfyui")

@app.cls(
    image=image,
    gpu="L40S",
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
    secrets=[modal.Secret.from_name("huggingface")],
)
class ComfyUI:
    @modal.enter()
    def launch_comfy_background(self):
        # Launch ComfyUI server
        pass
    
    @modal.asgi_app()
    def fastapi_app(self):
        from fastapi import FastAPI
        fastapi = FastAPI()
        
        # Register endpoints from handlers
        setup_flux_endpoints(fastapi, self)
        setup_instantid_endpoints(fastapi, self)
        setup_wan2_endpoints(fastapi, self)
        
        return fastapi
```

---

## Development Workflow

### 1. Adding a New Model

**Steps:**
1. Create model download function in `src/models/` or `image.py`
2. Add to image build in `image.py`
3. Test download locally: `modal run apps/modal/src/models/flux.py::hf_download_flux_dev`
4. Deploy: `modal deploy apps/modal/app.py`
5. Verify model is available in ComfyUI

**Checklist:**
- [ ] Model download function created
- [ ] Added to image build
- [ ] Tested download
- [ ] Symlinked to ComfyUI directory
- [ ] Documented in `docs/models.md`

### 2. Adding a New Workflow

**Steps:**
1. Create workflow handler in `src/handlers/` or `handlers/`
2. Implement workflow logic (build workflow JSON)
3. Create endpoint handler
4. Register endpoint in `app.py`
5. Test endpoint: `python apps/modal/ryla_client.py <endpoint> --prompt "test"`
6. Add cost tracking
7. Document in `docs/workflows.md`

**Checklist:**
- [ ] Workflow handler created
- [ ] Endpoint implemented
- [ ] Registered in FastAPI app
- [ ] Cost tracking added
- [ ] Tested end-to-end
- [ ] Client script updated
- [ ] Documented

### 3. Updating Existing Workflow

**Steps:**
1. Locate handler file
2. Make changes
3. Test locally if possible
4. Deploy: `modal deploy apps/modal/app.py`
5. Test endpoint
6. Update documentation if needed

---

## Model Management

### Model Storage Strategy

**Small Models (< 5GB):**
- Download during image build
- Store in image (faster cold starts)
- Example: Flux Schnell, InstantID IP-Adapter

**Large Models (> 5GB):**
- Store in Modal volume
- Download separately or at runtime
- Example: Flux Dev, Wan2.1, LoRA files

**Shared Models:**
- Use HF cache volume (`hf-hub-cache`)
- Shared across all containers
- Example: Text encoders, VAEs

### Model Naming Convention

```
{model_type}-{version}-{format}.safetensors

Examples:
- flux1-dev.safetensors
- flux1-schnell-fp8.safetensors
- wan2.1_t2v_1.3B_fp16.safetensors
- character-{id}.safetensors (for LoRAs)
```

### Model Versioning

- ✅ Use descriptive filenames with version
- ✅ Document model versions in `docs/models.md`
- ✅ Test model compatibility before updating
- ✅ Keep old versions in volume (for rollback)

---

## Testing Strategy

### Unit Tests

```python
# tests/test_flux.py
def test_flux_workflow_build():
    from handlers.flux import build_flux_workflow
    
    workflow = build_flux_workflow({
        "prompt": "test",
        "width": 1024,
        "height": 1024,
    })
    
    assert workflow["6"]["inputs"]["text"] == "test"
    assert workflow["3"]["inputs"]["width"] == 1024
```

### Integration Tests

```python
# tests/test_flux_integration.py
def test_flux_endpoint():
    # Test actual endpoint (requires deployed app)
    response = requests.post(
        "https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run/flux",
        json={"prompt": "test"}
    )
    assert response.status_code == 200
    assert "X-Cost-USD" in response.headers
```

### Performance Tests

```python
# scripts/test_performance.py
# Benchmark endpoint performance and costs
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Cost tracking added
- [ ] Documentation updated
- [ ] Model downloads tested
- [ ] Custom nodes verified
- [ ] Workflow JSON files validated

### Deployment

```bash
# 1. Deploy app
modal deploy apps/modal/app.py

# 2. Verify deployment
modal app list

# 3. Test endpoints
python apps/modal/ryla_client.py flux --prompt "test"

# 4. Check logs
modal app logs ryla-comfyui
```

### Post-Deployment

- [ ] Verify all endpoints working
- [ ] Check cost tracking in logs
- [ ] Monitor for errors
- [ ] Update deployment status

---

## Migration Plan

### Phase 1: Organize Current Code

1. Create new directory structure
2. Move utilities to `src/utils/`
3. Extract model downloads to `src/models/` or `image.py`
4. Keep main app file for now

### Phase 2: Split Handlers

1. Extract each workflow to separate handler file
2. Update imports in main app
3. Test each handler independently

### Phase 3: Clean Up

1. Archive old files (`_backup.py`, `_test.py`)
2. Consolidate documentation
3. Remove duplicate code

### Phase 4: Optimize

1. Refactor common patterns
2. Add shared utilities
3. Improve error handling
4. Add comprehensive tests

---

## Quick Reference

### Common Commands

```bash
# Deploy
modal deploy apps/modal/app.py

# Test locally
modal run apps/modal/src/handlers/flux.py::test_flux_workflow

# View logs
modal app logs ryla-comfyui

# List apps
modal app list

# Test endpoint
python apps/modal/ryla_client.py flux --prompt "test"
```

### File Size Guidelines

- **Main app file**: < 300 lines
- **Handler files**: < 500 lines
- **Utility files**: < 200 lines
- **Model download functions**: < 100 lines each

### Naming Conventions

- **Files**: `snake_case.py`
- **Classes**: `PascalCase`
- **Functions**: `snake_case`
- **Constants**: `UPPER_SNAKE_CASE`

---

## Related Documentation

- [Cost Tracking](./COST-TRACKING.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Architecture Decision: Modal over RunPod](../../docs/decisions/ADR-007-modal-over-runpod.md)
