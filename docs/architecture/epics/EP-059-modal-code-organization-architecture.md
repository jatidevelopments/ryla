# EP-059: Modal.com Code Organization - Architecture

**Initiative**: [IN-023](../../initiatives/IN-023-modal-code-organization.md)  
**Epic**: [EP-059 Requirements](../../requirements/epics/mvp/EP-059-modal-code-organization-requirements.md)  
**Scoping**: [EP-059 Scoping](../../requirements/epics/mvp/EP-059-modal-code-organization-scoping.md)  
**Status**: P3 - Architecture  
**Created**: 2026-01-21  
**Last Updated**: 2026-01-21

---

## Functional Architecture

### Backend-Only Architecture

This epic is **backend-only** (code reorganization, no frontend components). The architecture consists of:

1. **Modal.com Serverless Platform** - Hosts ComfyUI and models
2. **Reorganized Modal App** - Modular structure with handlers, utils, config
3. **Model Storage** - Modal volumes for persistent model storage
4. **API Endpoints** - FastAPI endpoints organized by handler
5. **Client Scripts** - Python scripts to interact with APIs

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Modal.com Platform                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Reorganized Modal App (app.py)               │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Configuration (config.py)                    │  │  │
│  │  │  - Volumes, secrets, GPU config               │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Image Build (image.py)                       │  │  │
│  │  │  - Model downloads                             │  │  │
│  │  │  - Custom node installation                    │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Handlers (handlers/*.py)                       │  │  │
│  │  │  - flux.py      (Flux workflows + endpoints)   │  │  │
│  │  │  - instantid.py (InstantID workflows)          │  │  │
│  │  │  - lora.py      (LoRA workflows)               │  │  │
│  │  │  - wan2.py      (Wan2.1 workflows)             │  │  │
│  │  │  - seedvr2.py   (SeedVR2 workflows)            │  │  │
│  │  │  - workflow.py (Custom workflow)               │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Utilities (utils/*.py)                        │  │  │
│  │  │  - cost_tracker.py                            │  │  │
│  │  │  - comfyui.py                                 │  │  │
│  │  │  - image_utils.py                             │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  ComfyUI Server (Background Process)         │  │  │
│  │  │  - Launches on container start                │  │  │
│  │  │  - Handles workflow execution                 │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  FastAPI App (app.py)                         │  │  │
│  │  │  - Registers all handler endpoints             │  │  │
│  │  │  - Handles request routing                     │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Modal Volumes (Persistent Storage)                  │  │
│  │  - ryla-models/    (Models, LoRAs)                   │  │
│  │  - hf-hub-cache/   (HuggingFace cache)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Client Scripts                            │
│  - ryla_client.py (unified client)                          │
│  - Test scripts (tests/)                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure Design

### Target Structure

```
apps/modal/
├── README.md                    # Main documentation
├── DEPLOYMENT.md                # Deployment guide
├── BEST-PRACTICES.md            # Development guidelines
│
├── app.py                       # Main entry point (~200 lines)
├── config.py                    # Configuration (~100 lines)
├── image.py                     # Image build (~600 lines)
│
├── handlers/                    # Workflow + endpoint handlers
│   ├── __init__.py
│   ├── flux.py                  # Flux workflows (~400 lines)
│   ├── instantid.py             # InstantID workflows (~400 lines)
│   ├── lora.py                  # LoRA workflows (~300 lines)
│   ├── wan2.py                  # Wan2.1 workflows (~400 lines)
│   ├── seedvr2.py               # SeedVR2 workflows (~300 lines)
│   └── workflow.py               # Custom workflow (~200 lines)
│
├── utils/                       # Shared utilities
│   ├── __init__.py
│   ├── cost_tracker.py          # Cost tracking (~150 lines)
│   ├── comfyui.py               # ComfyUI server management (~200 lines)
│   └── image_utils.py           # Image processing (~100 lines)
│
├── tests/                       # Test files
│   ├── __init__.py
│   ├── test_flux.py
│   ├── test_instantid.py
│   ├── test_wan2.py
│   └── fixtures/
│
├── scripts/                     # Utility scripts
│   ├── upload_models.py
│   └── test_performance.py
│
├── docs/                        # Documentation
│   ├── README.md                # Documentation index
│   ├── deployment.md
│   ├── models.md
│   └── workflows.md
│
└── archive/                     # Old/duplicate files
    ├── comfyui_danrisi*.py
    └── ...
```

---

## Module Boundaries & Responsibilities

### 1. Main App Module (`app.py`)

**Responsibilities**:
- Define Modal app (`modal.App`)
- Define ComfyUI class with lifecycle methods
- Set up FastAPI app
- Register all handler endpoints
- Manage container lifecycle

**Dependencies**:
- `config.py` - Configuration (volumes, secrets, GPU)
- `image.py` - Image build
- `handlers/*.py` - All handlers
- `utils/comfyui.py` - ComfyUI server management

**Size Target**: < 300 lines

**Key Components**:
```python
# app.py structure
import modal
from config import image, volume, hf_cache_vol
from handlers.flux import setup_flux_endpoints
from handlers.instantid import setup_instantid_endpoints
# ... other handlers

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
        from utils.comfyui import launch_comfy_server
        launch_comfy_server(self.port)
    
    @modal.asgi_app()
    def fastapi_app(self):
        from fastapi import FastAPI
        fastapi = FastAPI(title="RYLA ComfyUI API")
        
        # Register endpoints from handlers
        setup_flux_endpoints(fastapi, self)
        setup_instantid_endpoints(fastapi, self)
        # ... other handlers
        
        return fastapi
```

---

### 2. Configuration Module (`config.py`)

**Responsibilities**:
- Define Modal volumes
- Define Modal secrets
- Define GPU configuration
- Define image build configuration

**Dependencies**:
- `modal` - Modal SDK

**Size Target**: < 100 lines

**Key Components**:
```python
# config.py structure
import modal

# Volumes
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

# Secrets
huggingface_secret = modal.Secret.from_name("huggingface")

# GPU Configuration
GPU_TYPE = "L40S"  # Can be changed to A100, A10, etc.

# Image build configuration
PYTHON_VERSION = "3.11"
COMFYUI_VERSION = "0.3.71"
```

---

### 3. Image Build Module (`image.py`)

**Responsibilities**:
- Build Modal image with ComfyUI
- Download all models (Flux, InstantID, Wan2, SeedVR2)
- Install custom nodes
- Set up ComfyUI environment

**Dependencies**:
- `modal` - Modal SDK
- `config.py` - Configuration

**Size Target**: < 600 lines (reasonable for all model downloads)

**Key Components**:
```python
# image.py structure
import modal
from config import hf_cache_vol

# Model download functions
def hf_download_flux():
    # Flux Schnell download
    pass

def hf_download_flux_dev():
    # Flux Dev download
    pass

def hf_download_instantid():
    # InstantID download
    pass

def hf_download_wan2():
    # Wan2.1 download
    pass

def hf_download_seedvr2():
    # SeedVR2 download
    pass

# Image build
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install(["git", "wget", "curl"])
    .uv_pip_install("fastapi[standard]==0.115.4")
    .uv_pip_install("comfy-cli==1.5.3")
    .add_local_file("apps/modal/utils/cost_tracker.py", "/root/utils/cost_tracker.py", copy=True)
    .run_commands("comfy --skip-prompt install --fast-deps --nvidia --version 0.3.71")
    # Custom nodes
    .run_commands("cd /root/comfy/ComfyUI/custom_nodes && git clone ...")
    # Model downloads
    .run_function(hf_download_flux, volumes={"/cache": hf_cache_vol})
    .run_function(hf_download_flux_dev, volumes={"/cache": hf_cache_vol}, secrets=[...])
    # ... other model downloads
)
```

---

### 4. Handler Modules (`handlers/*.py`)

**Responsibilities**:
- Define workflow logic (build ComfyUI workflow JSON)
- Define endpoint implementation
- Integrate cost tracking
- Handle request/response

**Pattern** (all handlers follow this):

```python
# handlers/flux.py structure
from fastapi import Response
from utils.cost_tracker import CostTracker, get_cost_summary
from utils.comfyui import ComfyUIBase

def build_flux_workflow(item: dict) -> dict:
    """Build Flux Schnell workflow JSON."""
    return {
        # Workflow nodes
    }

def build_flux_dev_workflow(item: dict) -> dict:
    """Build Flux Dev workflow JSON."""
    return {
        # Workflow nodes
    }

def setup_flux_endpoints(fastapi, comfyui_instance):
    """Register Flux endpoints in FastAPI app."""
    @fastapi.post("/flux")
    async def flux_route(request: Request):
        item = await request.json()
        result = comfyui_instance._flux_impl(item)
        # Preserve cost headers
        return result
    
    @fastapi.post("/flux-dev")
    async def flux_dev_route(request: Request):
        item = await request.json()
        result = comfyui_instance._flux_dev_impl(item)
        return result

class FluxHandler:
    """Handler for Flux workflows."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _flux_impl(self, item: dict) -> Response:
        """Flux Schnell implementation."""
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        workflow = build_flux_workflow(item)
        img_bytes = self.comfyui.infer.local(workflow_file)
        
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("flux", execution_time)
        
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        return response
    
    def _flux_dev_impl(self, item: dict) -> Response:
        """Flux Dev implementation."""
        # Similar pattern
        pass
```

**Size Target**: < 500 lines per handler

**Dependencies**:
- `utils/cost_tracker.py` - Cost tracking
- `utils/comfyui.py` - ComfyUI utilities
- `config.py` - Configuration (if needed)

---

### 5. Utility Modules (`utils/*.py`)

#### `utils/cost_tracker.py`

**Responsibilities**:
- Track execution time
- Calculate costs based on GPU pricing
- Return cost metrics

**Dependencies**: None (standalone)

**Size Target**: < 200 lines

#### `utils/comfyui.py`

**Responsibilities**:
- Launch ComfyUI server
- Manage ComfyUI process
- Health checks
- Workflow execution helpers

**Dependencies**: None (standalone)

**Size Target**: < 200 lines

#### `utils/image_utils.py`

**Responsibilities**:
- Image processing utilities
- Base64 encoding/decoding
- Image validation
- Format conversion

**Dependencies**: PIL/Pillow

**Size Target**: < 150 lines

---

## Import Patterns

### Pattern 1: Main App Imports

```python
# app.py
import modal
from config import image, volume, hf_cache_vol, GPU_TYPE
from handlers.flux import setup_flux_endpoints, FluxHandler
from handlers.instantid import setup_instantid_endpoints, InstantIDHandler
# ... other handlers
from utils.comfyui import launch_comfy_server
```

### Pattern 2: Handler Imports

```python
# handlers/flux.py
from fastapi import Response, Request
from typing import Dict
from pathlib import Path
import json
import uuid

from utils.cost_tracker import CostTracker, get_cost_summary
from utils.comfyui import ComfyUIBase
```

### Pattern 3: Utility Imports

```python
# utils/cost_tracker.py
import time
from typing import Dict, Optional
from dataclasses import dataclass

# No external dependencies (standalone)
```

### Pattern 4: Image Build Imports

```python
# image.py
import modal
import subprocess
from pathlib import Path

from config import hf_cache_vol, huggingface_secret
```

---

## Handler Architecture Pattern

### Standard Handler Structure

All handlers follow this pattern:

```python
# handlers/{workflow_name}.py

# 1. Imports
from fastapi import Response
from utils.cost_tracker import CostTracker, get_cost_summary
from typing import Dict

# 2. Workflow Builder Functions
def build_{workflow}_workflow(item: dict) -> dict:
    """Build {workflow} workflow JSON."""
    return {
        # ComfyUI workflow nodes
    }

# 3. Handler Class
class {Workflow}Handler:
    """Handler for {workflow} workflows."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _{workflow}_impl(self, item: dict) -> Response:
        """{Workflow} implementation."""
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Build workflow
        workflow = build_{workflow}_workflow(item)
        
        # Execute
        output_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("{workflow}", execution_time)
        
        # Return with cost headers
        response = Response(output_bytes, media_type="...")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response

# 4. Endpoint Setup Function
def setup_{workflow}_endpoints(fastapi, comfyui_instance):
    """Register {workflow} endpoints in FastAPI app."""
    handler = {Workflow}Handler(comfyui_instance)
    
    @fastapi.post("/{workflow}")
    async def {workflow}_route(request: Request):
        item = await request.json()
        result = handler._{workflow}_impl(item)
        # Preserve cost headers
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                response.headers[key] = value
        return response
```

---

## Configuration Structure

### `config.py` Design

```python
# config.py
import modal

# ============ VOLUMES ============
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

# ============ SECRETS ============
huggingface_secret = modal.Secret.from_name("huggingface")

# ============ GPU CONFIGURATION ============
GPU_TYPE = "L40S"  # Options: "L40S", "A100", "A10", "H100", "T4", "L4"

# ============ IMAGE BUILD CONFIG ============
PYTHON_VERSION = "3.11"
COMFYUI_VERSION = "0.3.71"
FASTAPI_VERSION = "0.115.4"
COMFY_CLI_VERSION = "1.5.3"

# ============ COMFYUI CONFIG ============
COMFYUI_PORT = 8000
COMFYUI_DIR = Path("/root/comfy/ComfyUI")

# ============ MODEL PATHS ============
MODEL_PATHS = {
    "checkpoints": "/root/comfy/ComfyUI/models/checkpoints",
    "clip": "/root/comfy/ComfyUI/models/clip",
    "text_encoders": "/root/comfy/ComfyUI/models/text_encoders",
    "vae": "/root/comfy/ComfyUI/models/vae",
    "loras": "/root/comfy/ComfyUI/models/loras",
    "controlnet": "/root/comfy/ComfyUI/models/controlnet",
    "instantid": "/root/comfy/ComfyUI/models/instantid",
}
```

---

## Image Build Organization

### `image.py` Structure

```python
# image.py
import modal
from pathlib import Path
from config import hf_cache_vol, huggingface_secret, PYTHON_VERSION, COMFYUI_VERSION

# ============ MODEL DOWNLOAD FUNCTIONS ============

def hf_download_flux():
    """Download Flux Schnell model."""
    # Implementation

def hf_download_flux_dev():
    """Download Flux Dev models."""
    # Implementation

def hf_download_instantid():
    """Download InstantID models."""
    # Implementation

def hf_download_wan2():
    """Download Wan2.1 models."""
    # Implementation

def hf_download_seedvr2():
    """Download SeedVR2 models."""
    # Implementation

# ============ IMAGE BUILD ============

image = (
    modal.Image.debian_slim(python_version=PYTHON_VERSION)
    .apt_install(["git", "wget", "curl"])
    .uv_pip_install(f"fastapi[standard]=={FASTAPI_VERSION}")
    .uv_pip_install(f"comfy-cli=={COMFY_CLI_VERSION}")
    .add_local_file("apps/modal/utils/cost_tracker.py", "/root/utils/cost_tracker.py", copy=True)
    .run_commands(f"comfy --skip-prompt install --fast-deps --nvidia --version {COMFYUI_VERSION}")
    # Custom nodes
    .run_commands("cd /root/comfy/ComfyUI/custom_nodes && git clone ...")
    # Model downloads
    .run_function(hf_download_flux, volumes={"/cache": hf_cache_vol})
    .run_function(hf_download_flux_dev, volumes={"/cache": hf_cache_vol}, secrets=[huggingface_secret])
    # ... other downloads
)
```

---

## Data Flow

### Request Flow

```
1. Client Request
   ↓
2. FastAPI App (app.py)
   ↓
3. Route Handler (handlers/{workflow}.py)
   ↓
4. Workflow Builder (build_{workflow}_workflow)
   ↓
5. Cost Tracker (start)
   ↓
6. ComfyUI Server (execute workflow)
   ↓
7. Cost Tracker (stop, calculate)
   ↓
8. Response with Cost Headers
   ↓
9. Client Receives Response
```

### Model Download Flow

```
1. Image Build (image.py)
   ↓
2. Model Download Function (hf_download_{model})
   ↓
3. HuggingFace Hub (download model)
   ↓
4. HF Cache Volume (store in /cache)
   ↓
5. Symlink to ComfyUI Directory
   ↓
6. Available at Runtime
```

---

## Component Architecture

### Component Responsibilities

| Component | File | Responsibility | Dependencies |
|-----------|------|----------------|--------------|
| **Main App** | `app.py` | Modal app definition, FastAPI setup | config, image, handlers, utils |
| **Configuration** | `config.py` | Volumes, secrets, GPU config | modal |
| **Image Build** | `image.py` | Model downloads, custom nodes | config, modal |
| **Flux Handler** | `handlers/flux.py` | Flux workflows + endpoints | utils, config |
| **InstantID Handler** | `handlers/instantid.py` | InstantID workflows + endpoints | utils, config |
| **LoRA Handler** | `handlers/lora.py` | LoRA workflows + endpoints | utils, config |
| **Wan2 Handler** | `handlers/wan2.py` | Wan2.1 workflows + endpoints | utils, config |
| **SeedVR2 Handler** | `handlers/seedvr2.py` | SeedVR2 workflows + endpoints | utils, config |
| **Workflow Handler** | `handlers/workflow.py` | Custom workflow endpoint | utils, config |
| **Cost Tracker** | `utils/cost_tracker.py` | Cost tracking utilities | None |
| **ComfyUI Utils** | `utils/comfyui.py` | ComfyUI server management | None |
| **Image Utils** | `utils/image_utils.py` | Image processing | PIL |

---

## Module Dependencies Graph

```
app.py
├── config.py (volumes, secrets, GPU)
├── image.py (image build)
├── handlers/
│   ├── flux.py
│   │   ├── utils/cost_tracker.py
│   │   └── utils/comfyui.py
│   ├── instantid.py
│   │   ├── utils/cost_tracker.py
│   │   └── utils/comfyui.py
│   └── ...
└── utils/
    ├── cost_tracker.py (standalone)
    ├── comfyui.py (standalone)
    └── image_utils.py (PIL)

image.py
├── config.py (volumes, secrets)
└── modal (SDK)

config.py
└── modal (SDK)
```

**Key Principles**:
- ✅ No circular dependencies
- ✅ Utils are standalone (no dependencies on handlers)
- ✅ Handlers depend on utils, not each other
- ✅ Config is shared by all

---

## Handler Pattern Details

### Standard Handler Interface

```python
class Handler:
    """Base interface for all handlers."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _{workflow}_impl(self, item: dict) -> Response:
        """Implement workflow execution."""
        # 1. Start cost tracking
        # 2. Build workflow JSON
        # 3. Execute workflow
        # 4. Calculate cost
        # 5. Return response with cost headers
        pass
```

### Workflow Builder Pattern

```python
def build_{workflow}_workflow(item: dict) -> dict:
    """
    Build ComfyUI workflow JSON.
    
    Args:
        item: Request payload with prompt, dimensions, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    return {
        "1": {
            "class_type": "NodeType",
            "inputs": {...}
        },
        # ... more nodes
    }
```

### Endpoint Registration Pattern

```python
def setup_{workflow}_endpoints(fastapi, comfyui_instance):
    """
    Register {workflow} endpoints in FastAPI app.
    
    Args:
        fastapi: FastAPI app instance
        comfyui_instance: ComfyUI class instance
    """
    handler = {Workflow}Handler(comfyui_instance)
    
    @fastapi.post("/{workflow}")
    async def {workflow}_route(request: Request):
        item = await request.json()
        result = handler._{workflow}_impl(item)
        # Preserve cost headers
        return result
```

---

## Migration Strategy

### Phase 1: Foundation (No Code Changes)

1. Create directory structure
2. Move utilities to `utils/`
3. Create `config.py` with current config
4. Test imports work

### Phase 2: Extract Handlers (Incremental)

1. Extract first handler (Flux) - establish pattern
2. Test Flux endpoints work
3. Extract remaining handlers one by one
4. Test after each extraction

### Phase 3: Extract Image Build

1. Create `image.py`
2. Move all model downloads
3. Move custom node installation
4. Test image build works

### Phase 4: Refactor Main App

1. Create `app.py`
2. Import from handlers
3. Import from config
4. Import from image
5. Test deployment works

### Phase 5: Clean Up

1. Archive old files
2. Organize documentation
3. Update best practices
4. Final testing

---

## API Contract Preservation

### Endpoints (No Changes)

All existing endpoints remain unchanged:

- `POST /flux` - Flux Schnell
- `POST /flux-dev` - Flux Dev
- `POST /flux-instantid` - Flux Dev + InstantID
- `POST /flux-lora` - Flux Dev + LoRA
- `POST /wan2` - Wan2.1
- `POST /workflow` - Custom workflow
- `POST /seedvr2` - SeedVR2 (if applicable)

### Request/Response Format (No Changes)

All request and response formats remain unchanged. Only internal structure changes.

---

## Testing Architecture

### Test Organization

```
tests/
├── __init__.py
├── test_flux.py              # Test Flux endpoints
├── test_instantid.py         # Test InstantID endpoints
├── test_wan2.py              # Test Wan2 endpoints
├── test_handlers.py          # Test handler patterns
├── test_utils.py             # Test utilities
└── fixtures/
    ├── test_workflows/        # Test workflow JSONs
    └── test_images/          # Test images
```

### Test Patterns

```python
# tests/test_flux.py
def test_flux_workflow_build():
    """Test Flux workflow builder."""
    from handlers.flux import build_flux_workflow
    
    workflow = build_flux_workflow({
        "prompt": "test",
        "width": 1024,
        "height": 1024,
    })
    
    assert workflow["6"]["inputs"]["text"] == "test"

def test_flux_endpoint_integration():
    """Test Flux endpoint end-to-end."""
    # Test actual endpoint (requires deployed app)
    pass
```

---

## Deployment Architecture

### Deployment Process

```
1. Code Changes
   ↓
2. git commit
   ↓
3. modal deploy apps/modal/app.py
   ↓
4. Modal builds image (image.py)
   ↓
5. Modal downloads models (if needed)
   ↓
6. Modal deploys app
   ↓
7. FastAPI endpoints available
```

### Deployment Command

```bash
# Single command deployment
modal deploy apps/modal/app.py
```

**No changes to deployment process** - still one command, just different entry point.

---

## Cost Tracking Architecture

### Cost Tracking Flow

```
1. Request arrives
   ↓
2. Handler starts CostTracker
   ↓
3. Workflow executes
   ↓
4. Handler stops CostTracker
   ↓
5. Calculate cost (execution_time × GPU_price)
   ↓
6. Add cost headers to response
   ↓
7. Client receives cost information
```

### Cost Headers

All endpoints return:
- `X-Cost-USD`: Total cost in USD
- `X-Execution-Time-Sec`: Execution time in seconds
- `X-GPU-Type`: GPU type used (L40S)

---

## Error Handling Architecture

### Error Handling Pattern

```python
# handlers/{workflow}.py
def _{workflow}_impl(self, item: dict) -> Response:
    try:
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Build workflow
        workflow = build_{workflow}_workflow(item)
        
        # Execute
        output_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("{workflow}", execution_time)
        
        # Return response
        response = Response(output_bytes, media_type="...")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        return response
    
    except Exception as e:
        # Log error
        print(f"❌ {workflow} failed: {e}")
        
        # Return error response
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Security Architecture

### Secrets Management

- **HuggingFace Token**: Stored in Modal Secret (`huggingface`)
- **Access**: Injected at runtime via `modal.Secret.from_name("huggingface")`
- **Usage**: Only in model download functions (image build)

### Volume Access

- **Model Volumes**: Mounted at container start
- **Access Control**: Modal handles volume permissions
- **Persistence**: Models persist across container restarts

---

## Performance Considerations

### Cold Start Optimization

- **Model Downloads**: During image build (faster cold starts)
- **Large Models**: In volume (avoid re-downloading)
- **Custom Nodes**: Installed during image build

### Runtime Optimization

- **Workflow Caching**: Not implemented (future optimization)
- **Model Loading**: ComfyUI handles model loading
- **Concurrent Requests**: Modal handles scaling

---

## Scalability Architecture

### Horizontal Scaling

- **Modal Auto-Scaling**: Handles request scaling automatically
- **Concurrent Requests**: `@modal.concurrent(max_inputs=5)` per container
- **Container Scaling**: Modal scales containers based on demand

### Vertical Scaling

- **GPU Selection**: Configurable in `config.py` (L40S, A100, etc.)
- **Memory**: Managed by Modal based on GPU type
- **CPU**: Managed by Modal based on GPU type

---

## Monitoring & Observability

### Logging

- **Cost Tracking**: Logged to console (`💰 Cost: ...`)
- **Workflow Execution**: Logged by ComfyUI
- **Errors**: Logged to console with `❌` prefix

### Metrics

- **Cost Metrics**: In response headers
- **Execution Time**: In response headers
- **Success Rate**: Tracked via testing

---

## Related Documentation

- [Requirements](./../../requirements/epics/mvp/EP-059-modal-code-organization-requirements.md)
- [Scoping](./../../requirements/epics/mvp/EP-059-modal-code-organization-scoping.md)
- [Best Practices](./../../../apps/modal/BEST-PRACTICES.md)
- [Reorganization Plan](./../../../apps/modal/REORGANIZATION-PLAN.md)
- [Initiative IN-023](./../../initiatives/IN-023-modal-code-organization.md)

---

**Next Phase**: P4 - UI Skeleton (N/A for backend-only work, skip to P5)

**Status**: P3 - Architecture Complete
